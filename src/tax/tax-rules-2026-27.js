/*
 * Tax rules for Tax Year 2026–27.
 * Verify all figures and legal applicability against official sources before release.
 * This file is intentionally separate so annual rules can be reviewed independently.
 */
"use strict";
const RULES = {
  version: "TY 2026–27",
  reviewed: "19 October 2026",
  cessRate: 0.04,
  new: {
    standardDeduction: 75000,
    slabs: [{limit:400000,rate:0},{limit:800000,rate:.05},{limit:1200000,rate:.10},{limit:1600000,rate:.15},{limit:2000000,rate:.20},{limit:2400000,rate:.25},{limit:Infinity,rate:.30}],
    rebateLimit: 1200000,
    rebateMax: 60000,
    surcharge: [{limit:5000000,rate:0},{limit:10000000,rate:.10},{limit:20000000,rate:.15},{limit:Infinity,rate:.25}]
  },
  old: {
    standardDeduction: 50000,
    slabs: [{limit:250000,rate:0},{limit:500000,rate:.05},{limit:1000000,rate:.20},{limit:Infinity,rate:.30}],
    rebateLimit: 500000,
    rebateMax: 12500,
    surcharge: [{limit:5000000,rate:0},{limit:10000000,rate:.10},{limit:20000000,rate:.15},{limit:50000000,rate:.25},{limit:Infinity,rate:.37}]
  }
};
