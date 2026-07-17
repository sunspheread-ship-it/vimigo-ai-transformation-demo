import test from "node:test";
import assert from "node:assert/strict";
import { calculateScore, estimateRevenueOpportunity, getStage, normaliseRating } from "../src/scoring.js";

test("ratings are bounded between 1 and 5", () => {
  assert.equal(normaliseRating(0), 1);
  assert.equal(normaliseRating(6), 5);
  assert.equal(normaliseRating("3"), 3);
});

test("score uses 40 percent maturity and 60 percent Six OS", () => {
  const result = calculateScore([2, 2, 2, 2, 2], { a: 4, b: 4, c: 4, d: 4, e: 4, f: 4 });
  assert.deepEqual(result, { maturity: 40, os: 80, overall: 64 });
});

test("stage boundaries match the approved bands", () => {
  assert.equal(getStage(39), "boss");
  assert.equal(getStage(40), "process");
  assert.equal(getStage(59), "process");
  assert.equal(getStage(60), "performance");
  assert.equal(getStage(75), "data");
  assert.equal(getStage(90), "ai");
});

test("financial opportunity is withheld without sufficient client baselines", () => {
  assert.equal(estimateRevenueOpportunity({ monthlyVolume: 100, conversionRate: 20 }), null);
  assert.equal(estimateRevenueOpportunity({ monthlyVolume: 100, conversionRate: 20, targetConversionRate: 25, averageValue: 200 }), 1000);
});
