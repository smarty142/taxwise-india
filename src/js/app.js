/*
 * TaxWise India — reviewed rules for Tax Year 2026–27.
 * Scope: individual salaried taxpayers, ordinary-rate income only.
 * Re-check official rules before publishing any future tax-year rule set.
 */
"use strict";

const byId = id => document.getElementById(id);
const money = n => new Intl.NumberFormat("en-IN", {style:"currency",currency:"INR",maximumFractionDigits:0}).format(Math.max(0, Math.round(n)));
const num = id => Math.max(0, Number(byId(id).value) || 0);
const capIncome = n => Math.floor(Math.max(0, n));

function slabTax(income, slabs) {
  let tax = 0, lower = 0, details = [];
  for (const slab of slabs) {
    const taxableInBand = Math.max(0, Math.min(income, slab.limit) - lower);
    const bandTax = taxableInBand * slab.rate;
    if (taxableInBand > 0) details.push({label: `${money(lower)} – ${slab.limit === Infinity ? "above" : money(slab.limit)}`, base: taxableInBand, rate: slab.rate, tax: bandTax});
    tax += bandTax;
    if (income <= slab.limit) break;
    lower = slab.limit;
  }
  return {tax, details};
}
function rateForIncome(income, bands) {
  return bands.find(b => income <= b.limit)?.rate ?? bands[bands.length - 1].rate;
}
function surchargeFor(tax, income, regime) {
  const bands = RULES[regime].surcharge;
  const band = bands.find(b => income <= b.limit) || bands[bands.length - 1];
  const raw = tax * band.rate;
  if (band.rate === 0) return {amount:0, rate:0, relief:0};
  const previous = bands[bands.indexOf(band)-1];
  const threshold = previous.limit;
  const taxAtThreshold = slabTax(threshold, RULES[regime].slabs).tax;
  const prevRate = previous.rate;
  const thresholdTaxWithSurcharge = taxAtThreshold + taxAtThreshold * prevRate;
  const incomeExcess = income - threshold;
  const maximumTaxAtIncome = thresholdTaxWithSurcharge + incomeExcess;
  const rawCombined = tax + raw;
  const allowedCombined = Math.min(rawCombined, maximumTaxAtIncome);
  const amount = Math.max(0, allowedCombined - tax);
  return {amount, rate:band.rate, relief:Math.max(0, raw - amount)};
}
function calculate(regime, salary, otherIncome, oldDeductions, resident) {
  const rule = RULES[regime];
  const standardDeduction = Math.min(salary, rule.standardDeduction);
  const deductions = regime === "old" ? Math.min(oldDeductions, Math.max(0, salary - standardDeduction + otherIncome)) : 0;
  const grossTotalIncome = salary + otherIncome;
  const taxableIncome = capIncome(grossTotalIncome - standardDeduction - deductions);
  const slab = slabTax(taxableIncome, rule.slabs);
  let rebate = 0, rebateRelief = 0;
  if (resident && taxableIncome <= rule.rebateLimit) {
    rebate = Math.min(slab.tax, rule.rebateMax);
  } else if (resident && regime === "new" && taxableIncome > rule.rebateLimit) {
    // Section 87A marginal relief: tax above the rebate threshold cannot exceed income above that threshold.
    rebateRelief = Math.max(0, slab.tax - Math.max(0, taxableIncome - rule.rebateLimit));
    rebate = rebateRelief;
  }
  const taxAfterRebate = Math.max(0, slab.tax - rebate);
  const surcharge = surchargeFor(taxAfterRebate, taxableIncome, regime);
  const cess = (taxAfterRebate + surcharge.amount) * RULES.cessRate;
  const totalTax = Math.round(taxAfterRebate + surcharge.amount + cess);
  return {
    regime, salary, otherIncome, grossTotalIncome, standardDeduction, deductions, taxableIncome,
    slabTax:slab.tax, slabDetails:slab.details, rebate, rebateRelief, taxAfterRebate,
    surcharge:surcharge.amount, surchargeRate:surcharge.rate, surchargeRelief:surcharge.relief,
    cess, totalTax, effectiveRate:grossTotalIncome ? totalTax/grossTotalIncome : 0
  };
}
function row(label, value, extra="") {
  return `<div class="breakdown-row ${extra}"><span>${label}</span><b>${value}</b></div>`;
}
function showBreakdown(result) {
  const title = result.regime === "new" ? "New regime breakdown" : "Old regime breakdown";
  byId("breakdownTitle").textContent = title;
  let html = row("Gross salary", money(result.salary)) + row("Other ordinary income", money(result.otherIncome)) +
    row("Total income before deductions", money(result.grossTotalIncome)) +
    row("Standard deduction", "− " + money(result.standardDeduction)) +
    row(result.regime === "old" ? "Other eligible deductions (entered)" : "Other deductions assumed", "− " + money(result.deductions)) +
    row("Taxable income", money(result.taxableIncome), "total");
  result.slabDetails.forEach((band, i) => {
    if (band.tax > 0) html += row(`Slab ${i+1}: ${Math.round(band.rate*100)}% on ${money(band.base)}`, money(band.tax));
  });
  html += row("Income tax before rebate", money(result.slabTax));
  html += row(result.regime === "new" ? "Rebate / marginal relief" : "Rebate", "− " + money(result.rebate));
  html += row("Tax after rebate", money(result.taxAfterRebate));
  html += row(`Surcharge${result.surchargeRate ? ` (${Math.round(result.surchargeRate*100)}% before marginal relief)` : ""}`, money(result.surcharge));
  if (result.surchargeRelief > 0) html += row("Surcharge marginal relief", "− " + money(result.surchargeRelief));
  html += row("Health & education cess (4%)", money(result.cess));
  html += row("Estimated annual tax", money(result.totalTax), "total");
  html += row("Effective tax rate on gross income", (result.effectiveRate*100).toFixed(2) + "%");
  byId("breakdownRows").innerHTML = html;
  byId("breakdown").classList.add("visible");
}
let latest = {};
function render() {
  const salary = num("salary"), otherIncome = num("otherIncome"), deductions = num("deductions");
  const resident = byId("residency").value === "resident";
  if (salary > 1e9 || otherIncome > 1e9 || deductions > 1e8) {
    alert("Please enter an amount within the allowed range."); return;
  }
  latest = {
    new: calculate("new", salary, otherIncome, deductions, resident),
    old: calculate("old", salary, otherIncome, deductions, resident)
  };
  const n = latest.new, o = latest.old;
  byId("newTax").textContent = money(n.totalTax);
  byId("oldTax").textContent = money(o.totalTax);
  byId("newIncome").textContent = money(n.taxableIncome);
  byId("oldIncome").textContent = money(o.taxableIncome);
  byId("newMonthly").textContent = money((salary - n.totalTax)/12);
  byId("oldMonthly").textContent = money((salary - o.totalTax)/12);
  const winner = n.totalTax <= o.totalTax ? n : o;
  const loser = winner.regime === "new" ? o : n;
  const diff = Math.abs(o.totalTax - n.totalTax);
  byId("winnerName").textContent = diff === 0 ? "Both regimes" : (winner.regime === "new" ? "New tax regime" : "Old tax regime");
  byId("winnerSummary").textContent = diff === 0 ? "Both estimates are equal for these inputs." : `Estimated lower tax with the ${winner.regime} regime.`;
  byId("savings").textContent = money(diff);
  byId("newCard").classList.toggle("winner", n.totalTax <= o.totalTax);
  byId("oldCard").classList.toggle("winner", o.totalTax < n.totalTax);
  if (byId("breakdown").classList.contains("visible")) showBreakdown(latest[byId("breakdownTitle").textContent.startsWith("Old") ? "old" : "new"]);
}
byId("taxForm").addEventListener("submit", event => { event.preventDefault(); render(); });
document.querySelectorAll("[data-details]").forEach(button => button.addEventListener("click", () => showBreakdown(latest[button.dataset.details])));
byId("closeBreakdown").addEventListener("click", () => byId("breakdown").classList.remove("visible"));
["salary","otherIncome","deductions","residency","taxYear"].forEach(id => byId(id).addEventListener("change", render));
render();

// Small deterministic smoke tests for core rule logic; visible in browser console.
(function runSmokeTests(){
  const tests = [
    ["New regime zero slab", slabTax(400000, RULES.new.slabs).tax === 0],
    ["New regime slab tax at ₹8 lakh", slabTax(800000, RULES.new.slabs).tax === 20000],
    ["Old regime slab tax at ₹5 lakh", slabTax(500000, RULES.old.slabs).tax === 12500],
    ["New regime resident rebate at ₹12 lakh", calculate("new", 1275000, 0, 0, true).totalTax === 0],
    ["New regime non-resident does not receive 87A rebate", calculate("new", 1275000, 0, 0, false).totalTax > 0],
    ["New regime standard deduction", calculate("new", 1000000, 0, 0, true).standardDeduction === 75000],
    ["Old regime standard deduction", calculate("old", 1000000, 0, 0, true).standardDeduction === 50000]
  ];
  tests.forEach(([name, pass]) => { if (!pass) console.error("TaxWise test failed:", name); });
  console.info(`TaxWise rule smoke tests: ${tests.filter(t=>t[1]).length}/${tests.length} passed`, tests.filter(t=>!t[1]).map(t=>t[0]));
})();