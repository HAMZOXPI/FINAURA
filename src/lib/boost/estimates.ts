/** Position-based visibility estimates for the boost marketplace (display-only). */
export interface BoostPositionEstimates {
  estimatedVisibility: number;
  estimatedClicks: number;
  estimatedLeads: number;
}

const VISIBILITY_BY_POSITION = [420, 340, 260, 180, 120];
const CLICKS_BY_POSITION = [210, 170, 130, 90, 60];
const LEADS_BY_POSITION = [65, 52, 40, 28, 18];

export function calculatePositionEstimates(position: number): BoostPositionEstimates {
  const index = Math.max(0, Math.min(position - 1, VISIBILITY_BY_POSITION.length - 1));

  return {
    estimatedVisibility: VISIBILITY_BY_POSITION[index] ?? 100,
    estimatedClicks: CLICKS_BY_POSITION[index] ?? 50,
    estimatedLeads: LEADS_BY_POSITION[index] ?? 15,
  };
}
