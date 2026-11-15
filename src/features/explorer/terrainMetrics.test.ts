import { describe, expect, it } from 'vitest';
import { getSegmentTerrainMetrics, type TerrainSegmentSource } from './terrainMetrics';

const known: TerrainSegmentSource = {
  id: 'P01_C1',
  slopeDegrees: 2.4512,
  maxCellSlopeDeg: 9.037,
  p95CellMaxSlopeDeg: 6.956,
  slopeScore: 0.1634,
  difficultyScore: 0.4637,
  sampledCellCount: 27,
  sourceIds: ['HIRISE_DTM', 'HIRISE_SLOPE', 'T028_REPORT'],
  // Note: Ania's network.json does NOT assert a coverage fraction.
};

describe('T-015 — terrain metrics per segment', () => {
  it('reads known numeric values and their provenance unchanged', () => {
    const result = getSegmentTerrainMetrics('P01_C1', [known]);
    expect(result?.meanSlopeDegrees).toBe(2.4512);
    expect(result?.maxCellSlopeDegrees).toBe(9.037);
    expect(result?.p95CellMaxSlopeDegrees).toBe(6.956);
    expect(result?.slopeScore).toBe(0.1634);
    expect(result?.provisionalDifficultyScore).toBe(0.4637);
    expect(result?.sampledCellCount).toBe(27);
    expect(result?.sourceIds).toEqual(['HIRISE_DTM', 'HIRISE_SLOPE', 'T028_REPORT']);
  });

  it('returns null for unavailable GIS coverage, never fake zero or 100%', () => {
    expect(getSegmentTerrainMetrics('P01_C1', [known])?.coverageFraction).toBeNull();
  });

  it('retains a real measured zero slope, when samples and sources are present', () => {
    const flat: TerrainSegmentSource = {
      id: 'FLAT', sampledCellCount: 10, sourceIds: ['HIRISE_SLOPE'],
      slopeDegrees: 0, maxCellSlopeDeg: 0, p95CellMaxSlopeDeg: 0,
      slopeScore: 0, difficultyScore: 0, coverageFraction: 1,
    };
    const result = getSegmentTerrainMetrics('FLAT', [flat]);
    expect(result?.meanSlopeDegrees).toBe(0);
    expect(result?.slopeScore).toBe(0);
    expect(result?.coverageFraction).toBe(1);
  });

  it('returns null for missing segment instead of fabricated metrics', () => {
    expect(getSegmentTerrainMetrics('UNKNOWN', [known])).toBeNull();
    expect(getSegmentTerrainMetrics('', [known])).toBeNull();
  });

  it('does not treat missing/zero sampled cells as measured flat terrain', () => {
    const empty = { ...known, sampledCellCount: 0 };
    const unknown = { ...known, sampledCellCount: null };
    expect(getSegmentTerrainMetrics('P01_C1', [empty])?.meanSlopeDegrees).toBeNull();
    expect(getSegmentTerrainMetrics('P01_C1', [unknown])?.meanSlopeDegrees).toBeNull();
  });

  it('requires source provenance for trustworthy numeric terrain metrics', () => {
    const result = getSegmentTerrainMetrics('P01_C1', [{ ...known, sourceIds: [] }]);
    expect(result?.meanSlopeDegrees).toBeNull();
    expect(result?.sourceIds).toBeNull();
  });

  it('treats invalid values as null, without inventing a fallback', () => {
    const broken = {
      ...known, slopeDegrees: NaN, maxCellSlopeDeg: -5,
      p95CellMaxSlopeDeg: Infinity, slopeScore: -0.1,
      difficultyScore: 1.5, coverageFraction: 2,
    };
    const result = getSegmentTerrainMetrics('P01_C1', [broken]);
    expect(result?.meanSlopeDegrees).toBeNull();
    expect(result?.maxCellSlopeDegrees).toBeNull();
    expect(result?.p95CellMaxSlopeDegrees).toBeNull();
    expect(result?.slopeScore).toBeNull();
    expect(result?.provisionalDifficultyScore).toBeNull();
    expect(result?.coverageFraction).toBeNull();
  });

  it('rejects ambiguous duplicate edge IDs instead of choosing randomly', () => {
    expect(() => getSegmentTerrainMetrics('P01_C1', [known, known])).toThrow('Duplicate');
  });
});
