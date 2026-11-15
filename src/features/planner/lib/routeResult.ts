import { dijkstra } from "./dijkstra";
import { calculateRouteMetrics } from "./routeMetrics";

type XY = [number, number];

type Graph = {
  nodes: {
    id: string;
    coordinates: number[];
  }[];
  edges: {
    id: string;
    from: string;
    to: string;
    geometry: number[][];
    lengthM: number;
    difficultyScore: number | null;
    slopeScore: number | null;
    slopeDegrees: number | null;
    enabled: boolean;
    sourceIds: string[];
  }[];
};

export interface RouteResult {
  nodeIds: string[];
  edgeIds: string[];
  geometry: XY[];
  distanceM: number;
  balancedCost: number;
  difficultyIndex: number | null;
  meanSlopeDegrees: number | null;
  explanation: string;
  warnings: string[];
}

export function buildRouteResult(
  graph: Graph,
  startId: string,
  targetId: string,
  useSlope: boolean
): RouteResult | null {
  const edgeIds = dijkstra(graph, startId, targetId, useSlope);

  if (edgeIds === null) {
    return null;
  }

  const startNode = graph.nodes.find((node) => node.id === startId);

  if (!startNode) {
    throw new Error("Start node not found");
  }

  const nodeIds = [startId];
  const geometry: XY[] = [
    [startNode.coordinates[0], startNode.coordinates[1]],
  ];
  const routeEdges: Graph["edges"] = [];

  let currentNodeId = startId;
  let sourcesAvailable = true;
  let slopeDegreesAvailable = true;

  for (const edgeId of edgeIds) {
    const edge = graph.edges.find((item) => item.id === edgeId);

    if (!edge) {
      throw new Error(`Edge ${edgeId} not found`);
    }

    const forward = edge.from === currentNodeId;
    const backward = edge.to === currentNodeId;

    if (!forward && !backward) {
      throw new Error("Invalid route edge sequence");
    }

    currentNodeId = forward ? edge.to : edge.from;
    nodeIds.push(currentNodeId);

    const segment = forward
      ? edge.geometry
      : [...edge.geometry].reverse();

    for (const point of segment.slice(1)) {
      geometry.push([point[0], point[1]]);
    }

    routeEdges.push(edge);

    if (edge.slopeDegrees === null) {
      slopeDegreesAvailable = false;
    }

    if (edge.sourceIds.length === 0) {
      sourcesAvailable = false;
    }
  }

  const metrics = calculateRouteMetrics(routeEdges, useSlope);
  const warnings: string[] = [];

  if (!useSlope) {
    warnings.push(
      "Slope data was not included in the route cost calculation."
    );
  }

  if (!sourcesAvailable) {
    warnings.push("Data sources are missing for some route corridors.");
  }

  if (useSlope && !slopeDegreesAvailable) {
    warnings.push("Mean slope cannot be calculated.");
  }

  return {
    nodeIds,
    edgeIds,
    geometry,
    ...metrics,
    explanation:
      edgeIds.length === 0
        ? "Start and destination are the same."
        : "Selected the route with the lowest Balanced Cost under the current model.",
    warnings,
  };
}
