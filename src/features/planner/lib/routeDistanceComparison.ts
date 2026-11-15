import { dijkstra } from './dijkstra';

type RouteGraphForDistance = {
  nodes: readonly { id: string }[];
  edges: readonly {
    id: string;
    from: string;
    to: string;
    enabled: boolean;
    lengthM: number;
  }[];
};

type SelectedRouteForDistance = {
  edgeIds: readonly string[];
  distanceM: number;
};

export type RouteDistanceComparison = {
  shortestDistanceM: number;
  extraDistanceM: number;
  extraDistancePercent: number;
  samePath: boolean;
};

/**
 * Compare a selected Balanced Cost route with the minimum-distance path
 * across the SAME enabled graph edges.
 *
 * A copy of the graph is given to the existing Dijkstra implementation with
 * difficulty and slope penalties neutralized. Thus Dijkstra minimizes the sum
 * of lengthM, not straight-line distances or terrain-adjusted costs.
 *
 * Disabled alternatives remain disabled. Neither the original network nor
 * the selected route is modified.
 */
export function compareRouteWithShortestDistance(
  graph: RouteGraphForDistance,
  startId: string,
  targetId: string,
  selected: SelectedRouteForDistance,
): RouteDistanceComparison | null {
  if (
    !graph.nodes.some((node) => node.id === startId) ||
    !graph.nodes.some((node) => node.id === targetId) ||
    !Number.isFinite(selected.distanceM) ||
    selected.distanceM < 0 ||
    graph.edges.some((edge) =>
      edge.enabled && (!Number.isFinite(edge.lengthM) || edge.lengthM <= 0)
    )
  ) {
    return null;
  }

  const distanceOnlyGraph = {
    nodes: graph.nodes.map((node) => ({ id: node.id })),
    edges: graph.edges.map((edge) => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      enabled: edge.enabled,
      lengthM: edge.lengthM,
      difficultyScore: 0,
      slopeScore: 0,
    })),
  };

  const shortestEdgeIds = dijkstra(distanceOnlyGraph, startId, targetId, false);

  if (shortestEdgeIds === null) return null;

  const edgesById = new Map(graph.edges.map((edge) => [edge.id, edge]));
  let shortestDistanceM = 0;

  for (const edgeId of shortestEdgeIds) {
    const edge = edgesById.get(edgeId);
    if (!edge || !edge.enabled) return null;
    shortestDistanceM += edge.lengthM;
  }

  const rawDifference = selected.distanceM - shortestDistanceM;

  // A selected path cannot legitimately be shorter than the shortest path.
  // Allow tiny floating-point differences without displaying negative values.
  const tolerance = Math.max(1e-6, shortestDistanceM * 1e-9);

  if (rawDifference < -tolerance) return null;

  const extraDistanceM = rawDifference <= tolerance ? 0 : rawDifference;

  return {
    shortestDistanceM,
    extraDistanceM,
    extraDistancePercent:
      shortestDistanceM === 0 ? 0 : (extraDistanceM / shortestDistanceM) * 100,
    samePath:
      selected.edgeIds.length === shortestEdgeIds.length &&
      selected.edgeIds.every((id, index) => id === shortestEdgeIds[index]),
  };
}