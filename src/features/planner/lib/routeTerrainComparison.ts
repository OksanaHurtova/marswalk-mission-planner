import terrainSamples from '../../explorer/data/terrainSamples.json';
import { getSegmentTerrainMetrics } from '../../explorer/terrainMetrics';
import type { RouteResult } from './routeResult';
import {
  analyzeRouteTerrain,
} from './routeTerrainScreening';
import type {
  TerrainCorridorScreening,
  TerrainRouteScreening,
} from './routeTerrainScreening';

export type CenterlineSampleEvidence = {
  meanSlopeDeg: number | null;
  maxSlopeDeg: number | null;
  p95SlopeDeg: number | null;
  meanElevationM: number | null;
  minElevationM: number | null;
  maxElevationM: number | null;
  coverageFraction: number | null;
  plannedPositions: number | null;
  validJointPositions: number | null;
  uniqueValidCells: number | null;
};

export type ComparedTerrainCorridor = {
  edgeId: string;
  modelAndBuffer: TerrainCorridorScreening;
  centerline: CenterlineSampleEvidence | null;
};

export type TerrainRouteComparison = {
  existingScreening: TerrainRouteScreening;
  corridors: ComparedTerrainCorridor[];
  maxCenterlineSlopeDeg: number | null;
  maxNearbySlopeDeg: number | null;
  centerlineFullCoverageCorridors: number;
  centerlineAvailableCorridors: number;
  sampleSpacingM: number;
  centerlineMethod: string;
};

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : null;
}

function nonNegativeInteger(value: unknown): number | null {
  const number = finiteNumber(value);
  return number !== null && Number.isInteger(number) && number >= 0
    ? number
    : null;
}

function maxAvailable(values: (number | null)[]): number | null {
  const available = values.filter((value): value is number => value !== null);
  return available.length > 0 ? Math.max(...available) : null;
}

/**
 * Compare the T-016 1 m centerline raster samples with the precomputed
 * T-029 +/-5 m screening. Never substitute one method for the other.
 * The original graph weights and chosen Dijkstra route remain untouched.
 */
export function compareRouteTerrain(
  route: Pick<RouteResult, 'edgeIds'> | null,
): TerrainRouteComparison | null {
  const existingScreening = analyzeRouteTerrain(route);
  if (!existingScreening) return null;

  const corridors: ComparedTerrainCorridor[] = existingScreening.corridors.map(
    (corridor) => {
      const sourceMatches = terrainSamples.edges.filter(
        (edge) => edge.id === corridor.edgeId,
      );

      // Missing measurements remain unavailable, never an invented zero.
      if (sourceMatches.length === 0) {
        return {
          edgeId: corridor.edgeId,
          modelAndBuffer: corridor,
          centerline: null,
        };
      }
      if (sourceMatches.length !== 1) {
        throw new Error(`Duplicate T-016 terrain sample: ${corridor.edgeId}`);
      }

      const source = sourceMatches[0];
      if (
        source.from !== corridor.fromNodeId ||
        source.to !== corridor.toNodeId ||
        !source.enabledForExperimentalRouting
      ) {
        throw new Error(`T-016 corridor identity mismatch: ${corridor.edgeId}`);
      }

      // Use Oksana's validated, null-aware metrics adapter (T-015).
      const metrics = getSegmentTerrainMetrics(corridor.edgeId, terrainSamples.edges);
      const validJointPositions = nonNegativeInteger(source.validJointSamplePositions);
      const plannedPositions = nonNegativeInteger(source.plannedSamplePositions);

      const centerline: CenterlineSampleEvidence = {
        meanSlopeDeg: metrics?.meanSlopeDegrees ?? null,
        maxSlopeDeg: metrics?.maxCellSlopeDegrees ?? null,
        p95SlopeDeg: metrics?.p95CellMaxSlopeDegrees ?? null,
        meanElevationM: finiteNumber(source.meanElevationM),
        minElevationM: finiteNumber(source.minElevationM),
        maxElevationM: finiteNumber(source.maxElevationM),
        coverageFraction: metrics?.coverageFraction ?? null,
        plannedPositions,
        validJointPositions,
        uniqueValidCells: metrics?.sampledCellCount ?? null,
      };

      return {
        edgeId: corridor.edgeId,
        modelAndBuffer: corridor,
        centerline,
      };
    },
  );

  return {
    existingScreening,
    corridors,
    maxCenterlineSlopeDeg: maxAvailable(
      corridors.map((item) => item.centerline?.maxSlopeDeg ?? null),
    ),
    maxNearbySlopeDeg: existingScreening.maxNearbySlopeDeg,
    centerlineAvailableCorridors: corridors.filter(
      (item) => item.centerline?.maxSlopeDeg !== null && item.centerline?.maxSlopeDeg !== undefined,
    ).length,
    centerlineFullCoverageCorridors: corridors.filter(
      (item) => item.centerline?.coverageFraction === 1,
    ).length,
    sampleSpacingM: terrainSamples.samplingMethod.stepM,
    centerlineMethod: terrainSamples.samplingMethod.method,
  };
}
