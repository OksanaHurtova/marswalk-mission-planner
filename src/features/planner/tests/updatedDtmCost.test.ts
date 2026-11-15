import { describe, expect, it } from 'vitest';
import network from '../data/network.json';
import terrainSamples from '../../explorer/data/terrainSamples.json';
import {
  buildUpdatedDtmGraph,
  compareRouteCostModels,
  hasEnabledCycles,
  SCIENCE_TARGET_IDS,
} from '../lib/updatedDtmCost';

const originalScores = network.edges.map((edge) => ({
  id: edge.id,
  enabled: edge.enabled,
  slopeScore: edge.slopeScore,
  difficultyScore: edge.difficultyScore,
}));

describe('T-017 experimental Updated DTM Cost', () => {
  it('matches all 16 available T-016 samples without altering the original graph', () => {
    const result = buildUpdatedDtmGraph(network, terrainSamples);
    expect(result.errors).toEqual([]);
    expect(result.graph).not.toBeNull();
    expect(result.normalizedActiveEdges).toBe(15);
    expect(network.edges.map((edge) => ({
      id: edge.id,
      enabled: edge.enabled,
      slopeScore: edge.slopeScore,
      difficultyScore: edge.difficultyScore,
    }))).toEqual(originalScores);
  });

  it('keeps the disabled P04 alternative disabled', () => {
    const result = buildUpdatedDtmGraph(network, terrainSamples);
    const edge = result.graph?.edges.find((item) => item.id === 'P04_MEAN_ALTERNATIVE');
    expect(edge?.enabled).toBe(false);
  });

  it('normalizes a measured 1 m mean slope and avoids slope double-counting', () => {
    const result = buildUpdatedDtmGraph(network, terrainSamples);
    const edge = result.graph?.edges.find((item) => item.id === 'P03_C3');
    const sample = terrainSamples.edges.find((item) => item.id === 'P03_C3')!;
    expect(edge?.slopeScore).toBeCloseTo(sample.slopeDegrees / 15, 7);
    expect(edge?.difficultyScore).toBe(0);
    expect(edge?.slopeDegrees).toBe(sample.slopeDegrees);
    expect(edge?.sourceIds).toContain('T016_CENTERLINE');
  });

  it('refuses missing T-016 samples rather than using a zero-slope fallback', () => {
    const incomplete = {
      edges: terrainSamples.edges.filter((sample) => sample.id !== 'P03_C3'),
    };
    const result = buildUpdatedDtmGraph(network, incomplete);
    expect(result.graph).toBeNull();
    expect(result.errors.join(' ')).toContain('Missing T-016 slope measurement');
  });

  it('refuses explicit null slope instead of treating it as a measured zero', () => {
    const incomplete = {
      edges: terrainSamples.edges.map((sample) => sample.id === 'P02_C1'
        ? { ...sample, slopeDegrees: null }
        : sample),
    };
    const result = buildUpdatedDtmGraph(network, incomplete);
    expect(result.graph).toBeNull();
    expect(result.errors.join(' ')).toContain('mean slope is missing');
  });

  it('accepts a genuinely measured slope of zero', () => {
    const modified = {
      edges: terrainSamples.edges.map((sample) => sample.id === 'P02_C1'
        ? { ...sample, slopeDegrees: 0 }
        : sample),
    };
    const result = buildUpdatedDtmGraph(network, modified);
    expect(result.errors).toEqual([]);
    expect(result.graph?.edges.find((edge) => edge.id === 'P02_C1')?.slopeScore).toBe(0);
  });

  it('refuses incomplete centerline coverage', () => {
    const incomplete = {
      edges: terrainSamples.edges.map((sample) => sample.id === 'P02_C1'
        ? { ...sample, coverageFraction: 0.9 }
        : sample),
    };
    const result = buildUpdatedDtmGraph(network, incomplete);
    expect(result.graph).toBeNull();
    expect(result.errors.join(' ')).toContain('Incomplete or untraceable');
  });

  it('refuses mismatched endpoints or status', () => {
    const invalid = {
      edges: terrainSamples.edges.map((sample) => sample.id === 'P02_C1'
        ? { ...sample, from: 'P04' }
        : sample),
    };
    const result = buildUpdatedDtmGraph(network, invalid);
    expect(result.graph).toBeNull();
    expect(result.errors.join(' ')).toContain('identity');
  });

  it('rejects duplicate samples', () => {
    const result = buildUpdatedDtmGraph(network, {
      edges: [...terrainSamples.edges, terrainSamples.edges[0]],
    });
    expect(result.graph).toBeNull();
    expect(result.errors.join(' ')).toContain('Duplicate');
  });

  it('detects that this active network has no alternative route cycles', () => {
    expect(network.edges.filter((edge) => edge.enabled)).toHaveLength(15);
    expect(network.nodes).toHaveLength(16);
    expect(hasEnabledCycles(network)).toBe(false);
  });

  it('compares every science target without proposing a disabled route', () => {
    const comparison = compareRouteCostModels(network, terrainSamples);
    expect(comparison.status).toBe('READY');
    expect(comparison.errors).toEqual([]);
    expect(comparison.rows.map((row) => row.targetId)).toEqual([...SCIENCE_TARGET_IDS]);
    for (const row of comparison.rows) {
      expect(row.baseline).not.toBeNull();
      expect(row.updated).not.toBeNull();
      expect(row.samePath).toBe(true);
      expect(row.updated!.edgeIds).not.toContain('P04_MEAN_ALTERNATIVE');
      expect(row.updated!.balancedCost).toBeGreaterThan(0);
    }
  });

  it('marks the experimental mode unavailable when required GIS data is missing', () => {
    const comparison = compareRouteCostModels(network, {
      edges: terrainSamples.edges.filter((sample) => sample.id !== 'P01_C2'),
    });
    expect(comparison.status).toBe('UNAVAILABLE');
    expect(comparison.rows.every((row) => row.updated === null)).toBe(true);
    expect(comparison.errors).not.toEqual([]);
  });
});