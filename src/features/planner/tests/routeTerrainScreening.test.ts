import { describe, expect, it } from 'vitest';
import network from '../data/network.json';
import bufferScreening from '../data/corridorBufferScreening.json';
import { recommendRoute } from '../lib/recommendRoute';
import { analyzeRouteTerrain } from '../lib/routeTerrainScreening';

function checkTarget(id: string) {
  const route = recommendRoute(network, 'S', id, true).route;
  expect(route).not.toBeNull();
  const screening = analyzeRouteTerrain(route);
  expect(screening).not.toBeNull();
  return screening!;
}

describe('Selected-route DTM terrain screening', () => {
  it('has exactly one buffer screening row per model edge', () => {
    const modelIds = network.edges.map((edge) => edge.id).sort();
    const screeningIds = bufferScreening.edges.map((edge) => edge.edgeId).sort();
    expect(screeningIds).toEqual(modelIds);
    expect(new Set(screeningIds).size).toBe(16);
  });

  it('retains valid pixel counts and bounded fractions', () => {
    for (const row of bufferScreening.edges) {
      expect(row.validPixels).toBeGreaterThan(0);
      expect(row.sampledPixels).toBeGreaterThanOrEqual(row.validPixels);
      expect(row.pixelsAbove15DegPercent).toBeGreaterThanOrEqual(0);
      expect(row.pixelsAbove15DegPercent).toBeLessThanOrEqual(100);
      expect(row.maxSlopeDeg).toBeGreaterThanOrEqual(row.p95SlopeDeg);
    }
  });

  it('screens P01 with three selected corridors', () => {
    const result = checkTarget('P01');
    expect(result.corridors.map((item) => item.edgeId)).toEqual([
      'P01_C1', 'P01_C2', 'P01_C3',
    ]);
    expect(result.nearbySteepPixelCorridorCount).toBe(1);
  });

  it('screens P02 without any >15 degree pixels in its 5 m buffers', () => {
    const result = checkTarget('P02');
    expect(result.corridorCount).toBe(3);
    expect(result.nearbySteepPixelCorridorCount).toBe(0);
  });

  it('flags two P03 approach buffers for attention without claiming safety', () => {
    const result = checkTarget('P03');
    expect(result.corridorCount).toBe(3);
    expect(result.nearbySteepPixelCorridorCount).toBe(2);
    expect(result.maxNearbySlopeDeg).toBe(18.7);
    expect(result.allVisualReviewsPending).toBe(true);
  });

  it('includes all six P04 detour corridors, not its disabled shortcut', () => {
    const result = checkTarget('P04');
    expect(result.corridorCount).toBe(6);
    expect(result.nearbySteepPixelCorridorCount).toBe(5);
    expect(result.maxNearbySlopeDeg).toBe(36.21);
    expect(result.corridors.some((edge) => edge.edgeId === 'P04_MEAN_ALTERNATIVE')).toBe(false);
  });

  it('distinguishes unblocked model cells from steep nearby buffered pixels', () => {
    const result = checkTarget('P04');
    expect(result.modelBlockedCellCount).toBe(0);
    expect(result.nearbySteepPixelCorridorCount).toBeGreaterThan(0);
  });

  it('does not identify the experimental threshold as NASA policy', () => {
    const result = checkTarget('P04');
    expect(result.comparisonThresholdDeg).toBe(15);
    expect(result.comparisonIsNASASafetyStandard).toBe(false);
  });

  it('handles unavailable route without invented measurements', () => {
    expect(analyzeRouteTerrain(null)).toBeNull();
  });

  it('rejects a selected edge without matching evidence', () => {
    expect(() => analyzeRouteTerrain({ edgeIds: ['UNKNOWN_EDGE'] })).toThrow(
      'Missing model or DTM screening evidence'
    );
  });
});
