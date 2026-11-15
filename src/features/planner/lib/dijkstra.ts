import { calculateBalancedCost } from "./balancedCost";

// Graph properties required by the routing algorithm
type RoutingGraph = {
  nodes: { id: string }[];
  edges: {
    id: string;
    from: string;
    to: string;
    lengthM: number;
    difficultyScore: number | null;
    slopeScore: number | null;
    enabled: boolean;
  }[];
};

export function dijkstra(
  graph: RoutingGraph,
  startId: string,
  targetId: string,
  useSlope: boolean
): string[] | null {
  const distances = new Map<string, number>();
  const visited = new Set<string>();

  const previous = new Map<
    string,
    { nodeId: string; edgeId: string }
  >();

  // 1. Initialize distances
  for (const node of graph.nodes) {
    distances.set(node.id, Infinity);
  }

  if (!distances.has(startId) || !distances.has(targetId)) {
    throw new Error("Start or target node is missing from the graph");
  }

  distances.set(startId, 0);

  while (true) {
    // 2. Find the unvisited node
    // with the lowest known cost
    let current: string | null = null;
    let minCost = Infinity;

    for (const [id, cost] of distances) {
      if (!visited.has(id) && cost < minCost) {
        minCost = cost;
        current = id;
      }
    }

    if (current === null || current === targetId) {
      break;
    }

    visited.add(current);

    // 3. Examine the neighbors of the current node
    for (const edge of graph.edges) {
      if (!edge.enabled) continue;

      if (edge.from !== current && edge.to !== current) {
        continue;
      }

      // Model corridors as bidirectional for now
      const neighbor =
        edge.from === current ? edge.to : edge.from;

      if (!distances.has(neighbor)) {
        throw new Error("Edge references an unknown node");
      }

      if (visited.has(neighbor)) continue;

      const edgeCost = calculateBalancedCost(
        edge,
        useSlope
      );

      const newCost = minCost + edgeCost;

      if (newCost < distances.get(neighbor)!) {
        distances.set(neighbor, newCost);

        previous.set(neighbor, {
          nodeId: current,
          edgeId: edge.id,
        });
      }
    }
  }

  // 4. Check whether a path was found
  if (!Number.isFinite(distances.get(targetId))) {
    return null;
  }

  // 5. Reconstruct the route from target to start
  const path: string[] = [];
  let cursor = targetId;

  while (cursor !== startId) {
    const step = previous.get(cursor);

    if (!step) return null;

    path.unshift(step.edgeId);
    cursor = step.nodeId;
  }

  return path;
}
