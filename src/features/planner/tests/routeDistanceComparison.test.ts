import { describe, expect, it } from 'vitest';

import network from '../data/network.json';
import { dijkstra } from '../lib/dijkstra';
import { compareRouteWithShortestDistance } from '../lib/routeDistanceComparison';
import { recommendRoute } from '../lib/recommendRoute';

const branchingGraph = {
  nodes: [{ id: 'S' }, { id: 'A' }, { id: 'B' }, { id: 'T' }],
  edges: [
    { id: 'SA', from: 'S', to: 'A', enabled: true, lengthM: 100, difficultyScore: 1, slopeScore: 1 },
    { id: 'AT', from: 'A', to: 'T', enabled: true, lengthM: 100, difficultyScore: 1, slopeScore: 1 },
    { id: 'SB', from: 'S', to: 'B', enabled: true, lengthM: 150, difficultyScore: 0, slopeScore: 0 },
    { id: 'BT', from: 'B', to: 'T', enabled: true, lengthM: 150, difficultyScore: 0, slopeScore: 0 },
  ],
};

describe('Shortest-distance comparison', () => {
  it('finds a shorter path than the Balanced Cost recommendation', () => {
    const balancedPath = dijkstra(branchingGraph, 'S', 'T', true);
    expect(balancedPath).toEqual(['SB', 'BT']);

    const comparison = compareRouteWithShortestDistance(branchingGraph, 'S', 'T', {
      edgeIds: ['SB', 'BT'],
      distanceM: 300,
    });

    expect(comparison?.shortestDistanceM).toBe(200);
    expect(comparison?.extraDistanceM).toBe(100);
    expect(comparison?.extraDistancePercent).toBe(50);
    expect(comparison?.samePath).toBe(false);
  });

  it('shows zero extra distance when the selected route is shortest', () => {
    const comparison = compareRouteWithShortestDistance(branchingGraph, 'S', 'T', {
      edgeIds: ['SA', 'AT'],
      distanceM: 200,
    });

    expect(comparison).toEqual({
      shortestDistanceM: 200,
      extraDistanceM: 0,
      extraDistancePercent: 0,
      samePath: true,
    });
  });

  it('never uses a shorter disabled shortcut', () => {
    const graph = {
      ...branchingGraph,
      edges: [
        ...branchingGraph.edges,
        { id: 'ST', from: 'S', to: 'T', enabled: false, lengthM: 10, difficultyScore: 0, slopeScore: 0 },
      ],
    };

    const comparison = compareRouteWithShortestDistance(graph, 'S', 'T', {
      edgeIds: ['SB', 'BT'],
      distanceM: 300,
    });

    expect(comparison?.shortestDistanceM).toBe(200);
  });

  it('returns unavailable when the target is unreachable', () => {
    const graph = {
      ...branchingGraph,
      edges: branchingGraph.edges.map((edge) => ({ ...edge, enabled: false })),
    };

    expect(compareRouteWithShortestDistance(graph, 'S', 'T', {
      edgeIds: [],
      distanceM: 300,
    })).toBeNull();
  });

  it('does not interpret invalid corridor lengths as zero', () => {
    const graph = {
      ...branchingGraph,
      edges: branchingGraph.edges.map((edge) =>
        edge.id === 'SA' ? { ...edge, lengthM: Number.NaN } : edge
      ),
    };

    expect(compareRouteWithShortestDistance(graph, 'S', 'T', {
      edgeIds: ['SB', 'BT'],
      distanceM: 300,
    })).toBeNull();
  });

  it('handles the start-equals-target case', () => {
    expect(compareRouteWithShortestDistance(branchingGraph, 'S', 'S', {
      edgeIds: [],
      distanceM: 0,
    })).toEqual({
      shortestDistanceM: 0,
      extraDistanceM: 0,
      extraDistancePercent: 0,
      samePath: true,
    });
  });

  it('does not mutate the original graph', () => {
    const before = JSON.stringify(branchingGraph);

    compareRouteWithShortestDistance(branchingGraph, 'S', 'T', {
      edgeIds: ['SB', 'BT'],
      distanceM: 300,
    });

    expect(JSON.stringify(branchingGraph)).toBe(before);
  });

  it('finds no extra distance for each current enabled Marswalk route', () => {
    for (const targetId of ['P01', 'P02', 'P03', 'P04']) {
      const recommendation = recommendRoute(network, 'S', targetId, true);

      expect(recommendation.errors, targetId).toEqual([]);
      expect(recommendation.route, targetId).not.toBeNull();

      const comparison = compareRouteWithShortestDistance(
        network,
        'S',
        targetId,
        recommendation.route!,
      );

      expect(comparison, targetId).not.toBeNull();
      expect(comparison?.extraDistanceM, targetId).toBe(0);
      expect(comparison?.extraDistancePercent, targetId).toBe(0);
      expect(comparison?.samePath, targetId).toBe(true);
    }
  });
});