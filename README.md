# TaxWise India

A responsive static website starter for comparing indicative Indian salaried-income tax estimates.

## Project structure

- `index.html`, `privacy.html`: static page entry points
- `src/css/main.css`: styles
- `src/js/app.js`: browser UI and calculation orchestration
- `src/tax/tax-rules-2026-27.js`: separately versioned rules for the displayed tax year
- `tests/unit/smoke.test.js`: Node.js smoke test runner
- `.github/workflows/ci.yml`: runs tests on pushes and pull requests to `main`
- `docs/`: tax-rule maintenance and deployment notes

## Run and test

Open `index.html` in a modern browser to use the static site. Node.js 20+ is required only for tests.

```bash
npm test
```

## Current scope and limitations

This is a starter estimate, not certified tax software. It models salaried income and ordinary-rate other income with a limited set of deductions, rebates, surcharge and cess logic. It does not cover capital gains, special-rate income, treaty effects, every exemption, detailed deduction eligibility or tax filing. Surcharge/marginal-relief edge cases and all rules must be reviewed by a qualified Indian tax professional before public production use.

Tax figures are not automatically updated from government announcements. Before release, verify the applicable financial/tax year, effective date and legal text using official sources. Keep old-year rules separately when historical comparisons are supported.

## Official references

- Income Tax Department: https://www.incometax.gov.in/iec/foportal/
- Income-tax Act portal: https://www.incometaxindia.gov.in/en/income-tax-act-202511
- Deductions guidance: https://www.incometaxindia.gov.in/w/deductions-allowable-to-tax-payer

## Deployment

See `docs/deployment-cloudflare-pages.md`. This is a static site and does not require a backend or database. Keep `index.html` at the repository root for static hosting.

## Privacy and monetization

The calculator currently performs calculations in the browser. If analytics, advertising, cookies or backend services are added, update the privacy disclosures and review applicable laws and provider policies before launch.
