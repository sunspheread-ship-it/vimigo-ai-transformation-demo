export const STAGE_BANDS = [
  { min: 90, key: "ai" },
  { min: 75, key: "data" },
  { min: 60, key: "performance" },
  { min: 40, key: "process" },
  { min: 0, key: "boss" },
];

export function normaliseRating(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.min(5, Math.max(1, number));
}

export function averageRating(values) {
  if (!Array.isArray(values) || values.length === 0) return 1;
  return values.reduce((sum, value) => sum + normaliseRating(value), 0) / values.length;
}

export function calculateScore(stageRatings, osRatings) {
  const maturity = averageRating(stageRatings) * 20;
  const os = averageRating(Object.values(osRatings || {})) * 20;
  return {
    maturity: Math.round(maturity),
    os: Math.round(os),
    overall: Math.round(maturity * 0.4 + os * 0.6),
  };
}

export function getStage(score) {
  const numeric = Math.min(100, Math.max(0, Number(score) || 0));
  return STAGE_BANDS.find((band) => numeric >= band.min)?.key || "boss";
}

export function canQuantifyImpact(metrics = {}) {
  const required = ["monthlyVolume", "conversionRate", "averageValue"];
  return required.every((key) => Number(metrics[key]) > 0);
}

export function estimateRevenueOpportunity(metrics = {}) {
  if (!canQuantifyImpact(metrics)) return null;
  const volume = Number(metrics.monthlyVolume);
  const current = Number(metrics.conversionRate) / 100;
  const target = Number(metrics.targetConversionRate || metrics.conversionRate) / 100;
  const value = Number(metrics.averageValue);
  return Math.max(0, Math.round(volume * (target - current) * value));
}
