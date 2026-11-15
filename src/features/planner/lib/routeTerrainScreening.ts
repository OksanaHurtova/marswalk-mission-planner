import type { RouteResult } from './routeResult';
import network from '../data/network.json';
import screening from '../data/corridorBufferScreening.json';
import {
  getCorridorDifficultyReview,
} from './corridorDifficultyReview';
import type {
  VisualFactorToCheck,
  ReviewPriority,
} from './corridorDifficultyReview';

export type TerrainCorridorScreening = {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  lengthM: number;
  modelMeanSlopeDeg: number;
  modelMaxSampledCellSlopeDeg: number;
  modelP95CellMaxSlopeDeg: number;
  modelBlockedCellCount: number;
  bufferHalfWidthM: number;
  bufferSampledPixels: number;
  bufferValidPixels: number;
  bufferMaxSlopeDeg: number;
  bufferP95SlopeDeg: number;
  bufferPixelsAbove15DegPercent: number;
  reviewPriority: ReviewPriority;
  visualFactorsToCheck: readonly VisualFactorToCheck[];
  visualReviewPending: boolean;
  hasNearbyPixelsAbove15Deg: boolean;
};

export type TerrainRouteScreening = {
  corridors: TerrainCorridorScreening[];
  corridorCount: number;
  highReviewPriorityCount: number;
  nearbySteepPixelCorridorCount: number;
  modelBlockedCellCount: number;
  maxNearbySlopeDeg: number | null;
  allVisualReviewsPending: boolean;
  sourceRaster: string;
  comparisonThresholdDeg: number;
  comparisonIsNASASafetyStandard: boolean;
};

/**
 * Join the already-computed route to separately computed DTM buffer screening.
 * This is not a collision test, obstacle detector, or EVA safety assessment.
 */
export function analyzeRouteTerrain(
  route: Pick<RouteResult, 'edgeIds'> | null
): TerrainRouteScreening | null {
  if (!route) return null;

  const corridors: TerrainCorridorScreening[] = route.edgeIds.map((edgeId) => {
    const edge = network.edges.find((candidate) => candidate.id === edgeId);
    const buffer = screening.edges.find((candidate) => candidate.edgeId === edgeId);
    const review = getCorridorDifficultyReview(edgeId);

    if (!edge || !buffer || !review) {
      throw new Error(`Missing model or DTM screening evidence for corridor ${edgeId}.`);
    }
    if (!edge.enabled) {
      throw new Error(`Disabled corridor ${edgeId} cannot be assessed as a selected route.`);
    }

    return {
      edgeId,
      fromNodeId: edge.from,
      toNodeId: edge.to,
      lengthM: edge.lengthM,
      modelMeanSlopeDeg: edge.slopeDegrees,
      modelMaxSampledCellSlopeDeg: edge.maxCellSlopeDeg,
      modelP95CellMaxSlopeDeg: edge.p95CellMaxSlopeDeg,
      modelBlockedCellCount: edge.blockedCellsUnderMax15Rule,
      bufferHalfWidthM: screening.method.bufferHalfWidthM,
      bufferSampledPixels: buffer.sampledPixels,
      bufferValidPixels: buffer.validPixels,
      bufferMaxSlopeDeg: buffer.maxSlopeDeg,
      bufferP95SlopeDeg: buffer.p95SlopeDeg,
      bufferPixelsAbove15DegPercent: buffer.pixelsAbove15DegPercent,
      reviewPriority: review.reviewPriority,
      visualFactorsToCheck: review.visualEvidence.factorsToCheck,
      visualReviewPending:
        review.visualEvidence.reviewStatus === 'PENDING_ORTHOPHOTO_REVIEW',
      hasNearbyPixelsAbove15Deg: buffer.pixelsAbove15DegPercent > 0,
    };
  });

  return {
    corridors,
    corridorCount: corridors.length,
    highReviewPriorityCount: corridors.filter((c) => c.reviewPriority === 'HIGH').length,
    nearbySteepPixelCorridorCount: corridors.filter((c) => c.hasNearbyPixelsAbove15Deg).length,
    modelBlockedCellCount: corridors.reduce((total, c) => total + c.modelBlockedCellCount, 0),
    maxNearbySlopeDeg: corridors.length
      ? Math.max(...corridors.map((c) => c.bufferMaxSlopeDeg))
      : null,
    allVisualReviewsPending: corridors.every((c) => c.visualReviewPending),
    sourceRaster: screening.sourceRaster,
    comparisonThresholdDeg: screening.method.slopeThresholdDeg,
    comparisonIsNASASafetyStandard: screening.method.thresholdIsNASASafetyStandard,
  };
}

export function describeVisualFactor(factor: VisualFactorToCheck): string {
  const labels: Record<VisualFactorToCheck, string> = {
    CHANNEL_SCARP: 'Channel edge / scarp',
    CRATER_PROXIMITY: 'Nearby crater terrain',
    SURFACE_ROUGHNESS: 'Surface roughness',
    SURFACE_LINEATIONS: 'Linear surface features',
  };
  return labels[factor];
}
