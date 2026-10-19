// Smoke tests for the browser app and tax-rule configuration.
// Run with: npm test
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");
const rulesSource = fs.readFileSync(path.join(root, "src/tax/tax-rules-2026-27.js"), "utf8");
const appSource = fs.readFileSync(path.join(root, "src/js/app.js"), "utf8");
const logs = [];

const sandbox = {
  console: { log(){}, info:(...a)=>logs.push(a), error:(...a)=>logs.push(a) },
  Intl, Math, Number, String, Object, Array, Infinity,
  document: {
    getElementById(){ return { addEventListener(){}, value:"0", textContent:"",
      classList:{ add(){}, remove(){}, toggle(){}, contains(){return false} }, innerHTML:"" }; },
    querySelectorAll(){ return []; }
  },
  alert(){}, setTimeout(){}, window:{}
};

vm.createContext(sandbox);
vm.runInContext(rulesSource + "\n" + appSource, sandbox);
const result = logs.flat().join(" ");
if (!result.includes("7/7 passed")) {
  console.error("One or more tax-rule smoke tests failed.", result);
  process.exit(1);
}
console.log(result);
