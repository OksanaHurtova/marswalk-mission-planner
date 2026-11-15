/**
 * T-015 — єдиний read-only інтерфейс метрик сегмента.
 * Значення беруться з уже виміряних даних, нічого не розраховуємо з WebP.
 * Null = відсутні / неперевірені дані; 0 = реально виміряний нуль.
 * Наявні поля узгоджені з Ania's planner/data/network.json.
 * T-016 має заповнити coverageFraction за фактичним GIS sampling.
 */

export type TerrainSegmentSource = {
  id: string;
  slopeDegrees?: number | null;
  maxCellSlopeDeg?: number | null;
  p95CellMaxSlopeDeg?: number | null;
  slopeScore?: number | null;
  difficultyScore?: number | null;
  sampledCellCount?: number | null;
  coverageFraction?: number | null;
  sourceIds?: readonly string[] | null;
};

export type SegmentTerrainMetrics = {
  edgeId: string;
  /** Mean grid-cell slope based on numerical samples (degrees). */
  meanSlopeDegrees: number | null;
  /** Highest sampled slope (degrees). */
  maxCellSlopeDegrees: number | null;
  /** P95 of grid-cell maxima (degrees). */
  p95CellMaxSlopeDegrees: number | null;
  /** Provisional normalized slope score [0,1]; NOT a NASA safety rating. */
  slopeScore: number | null;
  /** Slope-derived proxy, not verified visual hazard assessment. */
  provisionalDifficultyScore: number | null;
  /** Fraction of planned cells covered [0,1], null unless explicitly provided. */
  coverageFraction: number | null;
  sampledCellCount: number | null;
  sourceIds: readonly string[] | null;
};

function finiteInRange(value: unknown, min: number, max: number): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
    ? value
    : null;
}

function validSourceIds(value: unknown): readonly string[] | null {
  if (!Array.isArray(value) || value.length === 0 ||
      !value.every((v) => typeof v === 'string' && v.trim().length > 0)) {
    return null;
  }
  return [...value];
}

/**
 * Look up metrics by the original planner edge ID (e.g. "P04_C1").
 * Missing or ambiguous IDs return null / throw rather than fabricating data.
 * The caller supplies records, so this module does not import Ania's planner.
 */
export function getSegmentTerrainMetrics(
  edgeId: string,
  records: readonly TerrainSegmentSource[],
): SegmentTerrainMetrics | null {
  if (typeof edgeId !== 'string' || edgeId.trim().length === 0) return null;
  const matches = records.filter((edge) => edge.id === edgeId);
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Duplicate terrain segment ID: ${edgeId}`);

  const edge = matches[0];
  const sources = validSourceIds(edge.sourceIds);
  const count = finiteInRange(edge.sampledCellCount, 0, Number.MAX_SAFE_INTEGER);
  const sampledCellCount = count !== null && Number.isInteger(count) ? count : null;
  const measured = sampledCellCount !== null && sampledCellCount > 0 && sources !== null;

  return {
    edgeId,
    meanSlopeDegrees: measured ? finiteInRange(edge.slopeDegrees, 0, 90) : null,
    maxCellSlopeDegrees: measured ? finiteInRange(edge.maxCellSlopeDeg, 0, 90) : null,
    p95CellMaxSlopeDegrees: measured ? finiteInRange(edge.p95CellMaxSlopeDeg, 0, 90) : null,
    slopeScore: measured ? finiteInRange(edge.slopeScore, 0, 1) : null,
    provisionalDifficultyScore: measured ? finiteInRange(edge.difficultyScore, 0, 1) : null,
    coverageFraction: measured ? finiteInRange(edge.coverageFraction, 0, 1) : null,
    sampledCellCount,
    sourceIds: sources,
  };
}
