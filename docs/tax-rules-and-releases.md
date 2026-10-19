# Tax rules and release process

## Current scope

- Rule file: `src/tax/tax-rules-2026-27.js`
- Tax year shown in the interface: 2026–27
- Intended scope: individual salaried income and ordinary-rate other income
- The calculator is an estimate, not tax filing software or professional tax advice.

## When tax rules change

1. Confirm the announced measure and its effective date using official government sources.
2. Determine which tax year and taxpayer categories it applies to.
3. Update the versioned rule file; do not silently overwrite an old year if historical comparisons are needed.
4. Add or update tests for slab boundaries, rebate eligibility, surcharge, marginal relief and cess.
5. Have the tax logic reviewed by a qualified Indian tax professional before release.
6. Run `npm test`, review the UI manually, and record the change in the pull request/release notes.
7. Merge to `main`; the connected static hosting provider can publish the updated site.

## Official references

- Income Tax Department: https://www.incometax.gov.in/iec/foportal/
- Income-tax Act portal: https://www.incometaxindia.gov.in/en/income-tax-act-202511
- Deductions guidance: https://www.incometaxindia.gov.in/w/deductions-allowable-to-tax-payer

## Production-readiness caveat

Passing the included smoke tests does not certify tax accuracy. The current logic has a limited scope and requires a qualified review plus additional boundary and regression tests before being relied on by the public.
