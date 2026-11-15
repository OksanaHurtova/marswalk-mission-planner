import { describe, expect, it } from 'vitest';
import network from '../data/network.json';
import terrainSamples from '../../explorer/data/terrainSamples.json';
import { recommendRoute } from '../lib/recommendRoute';
import { compareRouteTerrain } from '../lib/routeTerrainComparison';

function inspect(target: string) {
  const route = recommendRoute(network, 'S', target, true).route;
  expect(route).not.toBeNull();
  const result = compareRouteTerrain(route);
  expect(result).not.toBeNull();
  return result!;
}

describe('T-016 centerline and T-029 corridor terrain comparison', () => {
  it('has exactly one T-016 record for each of the 16 graph edges', () => {
    const ids = terrainSamples.edges.map((edge) => edge.id);
    expect(ids.sort()).toEqual(network.edges.map((edge) => edge.id).sort());
    expect(new Set(ids).size).toBe(16);
  });

  it('confirms provenance and measurement method without inventing coverage', () => {
    expect(terrainSamples.graph.edgeCount).toBe(16);
    expect(terrainSamples.coordinateFrame).toBe('MARS_LOCAL_METERS');
    expect(terrainSamples.samplingMethod.stepM).toBe(1);
    expect(terrainSamples.samplingMethod.coverageMeaning).toContain('centerline');
  });

  it('retains experimental routing status, including the disabled alternative', () => {
    for (const source of terrainSamples.edges) {
      const edge = network.edges.find((item) => item.id === source.id);
      expect(edge).toBeDefined();
      expect(source.enabledForExperimentalRouting).toBe(edge!.enabled);
      expect(source.from).toBe(edge!.from);
      expect(source.to).toBe(edge!.to);
    }
  });

  it('keeps T-016 measured source-pixel slope independent of model scoring', () => {
    for (const source of terrainSamples.edges) {
      expect(source.slopeScore).toBeNull();
      expect(source.difficultyScore).toBeNull();
      expect(source.coverageFraction).toBe(1);
      expect(source.validJointSamplePositions).toBe(source.plannedSamplePositions);
      expect(source.maxCellSlopeDeg).toBeGreaterThanOrEqual(source.p95CellMaxSlopeDeg);
    }
  });

  it('compares P03_C3 centerline max against a different nearby-area maximum', () => {
    const data = inspect('P03');
    const item = data.corridors.find((corridor) => corridor.edgeId === 'P03_C3');
    expect(item).toBeDefined();
    expect(item!.centerline!.maxSlopeDeg).toBeCloseTo(10.88244, 5);
    expect(item!.modelAndBuffer.bufferMaxSlopeDeg).toBe(18.7);
    expect(item!.centerline!.maxSlopeDeg).not.toBe(item!.modelAndBuffer.bufferMaxSlopeDeg);
  });

  it('shows full sampled centerline coverage for the three P02 corridors', () => {
    const data = inspect('P02');
    expect(data.corridors).toHaveLength(3);
    expect(data.centerlineAvailableCorridors).toBe(3);
    expect(data.centerlineFullCoverageCorridors).toBe(3);
    expect(data.existingScreening.nearbySteepPixelCorridorCount).toBe(0);
  });

  it('uses all six selected P04 corridors and excludes its disabled alternative', () => {
    const data = inspect('P04');
    expect(data.corridors).toHaveLength(6);
    expect(data.corridors.some((edge) => edge.edgeId === 'P04_MEAN_ALTERNATIVE')).toBe(false);
    expect(data.maxNearbySlopeDeg).toBe(36.21);
    expect(data.maxCenterlineSlopeDeg).toBeCloseTo(14.35336, 5);
  });

  it('preserves the selected route and graph model without rewriting edge costs', () => {
    const route = recommendRoute(network, 'S', 'P04', true).route!;
    const before = [...route.edgeIds];
    const originalScores = network.edges.map((edge) => edge.difficultyScore);
    compareRouteTerrain(route);
    expect(route.edgeIds).toEqual(before);
    expect(network.edges.map((edge) => edge.difficultyScore)).toEqual(originalScores);
  });

  it('returns no result if no route exists', () => {
    expect(compareRouteTerrain(null)).toBeNull();
  });

  it('rejects an unknown route corridor instead of inventing evidence', () => {
    expect(() => compareRouteTerrain({ edgeIds: ['NO_SUCH_CORRIDOR'] })).toThrow(
      'Missing model or DTM screening evidence',
    );
  });
});