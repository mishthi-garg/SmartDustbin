export const THRESHOLDS = {
  fill: { warn: 60, crit: 85 },        // %
  odor: { warn: 300, crit: 500 },      // MQ-135 index, tune after calibration
  tempEmergency: 60,                   // °C → treat as fire
}