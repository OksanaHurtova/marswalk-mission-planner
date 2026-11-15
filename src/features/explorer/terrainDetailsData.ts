import terrainSamples from './data/terrainSamples.json';

/** Descriptive measurements from T-016, not a route-safety or cost model. */
export type TerrainSegment = {
  id: string;
  from: string;
  to: string;
  enabledForExperimentalRouting: boolean;
  geometryLengthM: number | null;
  slopeDegrees: number | null;
  maxCellSlopeDeg: number | null;
  p95CellMaxSlopeDeg: number | null;
  meanElevationM: number | null;
  minElevationM: number | null;
  maxElevationM: number | null;
  plannedSamplePositions: number | null;
  validJointSamplePositions: number | null;
  coverageFraction: number | null;
  sourceIds: readonly string[];
};

const SEGMENTS: readonly TerrainSegment[] = terrainSamples.edges;
const SEGMENTS_BY_ID = new Map(SEGMENTS.map((segment) => [segment.id, segment]));

/** Missing and nonfinite values are missing, never 0. */
export function measured(value: number | null | undefined, fractionDigits = 2): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString('uk-UA', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })
    : 'Немає даних';
}

export function coverageLabel(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
    ? `${measured(value * 100, 1)}%`
    : 'Немає даних';
}

export function lookupTerrainSegment(edgeId: string): TerrainSegment | null {
  return SEGMENTS_BY_ID.get(edgeId) ?? null;
}

/**
 * ONLY for the independent T-020 preview of the pre-existing T-016 tree.
 * Follows unique inbound edges without comparing route costs or computing a new route.
 * The integrated app must instead pass RouteResult.edgeIds from Ania's planner.
 * In an ambiguous/changed graph this returns null, rather than guessing a path.
 */
export function previewEdgeIdsForTarget(targetId: string): string[] | null {
  if (!['P01', 'P02', 'P03', 'P04'].includes(targetId)) return null;
  const reverse: string[] = [];
  const visited = new Set<string>();
  let at = targetId;
  while (at !== 'S') {
    if (visited.has(at) || reverse.length > SEGMENTS.length) return null;
    visited.add(at);
    const incoming = SEGMENTS.filter((segment) => segment.enabledForExperimentalRouting && segment.to === at);
    if (incoming.length !== 1) return null;
    reverse.push(incoming[0].id);
    at = incoming[0].from;
  }
  return reverse.reverse();
}
