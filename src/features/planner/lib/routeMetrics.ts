import { calculateBalancedCost } from "./balancedCost";

export type RouteMetricEdge = {
  lengthM: number;
  difficultyScore: number | null;
  slopeScore: number | null;
  slopeDegrees: number | null;
};

export type RouteMetrics = {
  distanceM: number;
  balancedCost: number;
  difficultyIndex: number | null;
  meanSlopeDegrees: number | null;
};

export function calculateRouteMetrics(
  edges: readonly RouteMetricEdge[],
  useSlope: boolean
): RouteMetrics {
  let distanceM = 0;
  let balancedCost = 0;
  let weightedDifficulty = 0;
  let weightedSlopeDegrees = 0;
  let slopeDegreesAvailable = true;

  for (const edge of edges) {
    // Validate and calculate the cost of each corridor.
    const edgeCost = calculateBalancedCost(edge, useSlope);

    distanceM += edge.lengthM;
    balancedCost += edgeCost;
    weightedDifficulty += edge.lengthM * edge.difficultyScore!;

    if (edge.slopeDegrees === null) {
      slopeDegreesAvailable = false;
    } else {
      weightedSlopeDegrees += edge.lengthM * edge.slopeDegrees;
    }
  }

  return {
    distanceM,
    balancedCost,
    difficultyIndex:
      distanceM > 0 ? weightedDifficulty / distanceM : null,
    meanSlopeDegrees:
      useSlope && distanceM > 0 && slopeDegreesAvailable
        ? weightedSlopeDegrees / distanceM
        : null,
  };
}
