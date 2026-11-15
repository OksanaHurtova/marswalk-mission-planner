import { describe, expect, it } from 'vitest';
import { coverageLabel, lookupTerrainSegment, measured, previewEdgeIdsForTarget } from './terrainDetailsData';

describe('T-020 real terrain details', () => {
  it('does not convert missing slope to zero', () => {
    expect(measured(null)).toBe('Немає даних');
    expect(measured(undefined)).toBe('Немає даних');
    expect(measured(Number.NaN)).toBe('Немає даних');
    expect(measured(0)).not.toBe('Немає даних');
  });
  it('does not invent missing coverage', () => {
    expect(coverageLabel(null)).toBe('Немає даних');
    expect(coverageLabel(1.2)).toBe('Немає даних');
    expect(coverageLabel(1)).toContain('100');
  });
  it('reads real T-016 segment P01_C1 with provenance', () => {
    const segment = lookupTerrainSegment('P01_C1');
    expect(segment).not.toBeNull();
    expect(segment?.slopeDegrees).toBeGreaterThan(0);
    expect(segment?.sourceIds).toContain('HIRISE_DTM');
    expect(segment?.sourceIds).toContain('HIRISE_SLOPE');
  });
  it('returns null for unknown segments', () => {
    expect(lookupTerrainSegment('not-an-edge')).toBeNull();
  });
  it.each(['P01', 'P02', 'P03', 'P04'])('preview chain %s is continuous from S and excludes disabled edges', (target) => {
    const edgeIds = previewEdgeIdsForTarget(target);
    expect(edgeIds?.length).toBeGreaterThan(0);
    let current = 'S';
    for (const id of edgeIds ?? []) {
      const e = lookupTerrainSegment(id);
      expect(e?.enabledForExperimentalRouting).toBe(true);
      expect(e?.from).toBe(current);
      current = e?.to ?? '';
    }
    expect(current).toBe(target);
    expect(edgeIds).not.toContain('P04_MEAN_ALTERNATIVE');
  });
  it('does not guess a path for unknown target', () => {
    expect(previewEdgeIdsForTarget('P99')).toBeNull();
  });
});
