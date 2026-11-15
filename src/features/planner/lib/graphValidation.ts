import { calculatePolylineLength } from "./polylineLength";

type XY = [number, number];

export type GraphValidationOptions = {
  requireSlope?: boolean;
  requireSources?: boolean;
  requireConnected?: boolean;
};

export type GraphValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isXY(value: unknown): value is XY {
  return Array.isArray(value) && value.length === 2 &&
    isFiniteNumber(value[0]) && isFiniteNumber(value[1]);
}

function pointDistance(a: XY, b: XY): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function validateGraph(
  graph: unknown,
  options: GraphValidationOptions = {}
): GraphValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { requireSlope = false, requireSources = false, requireConnected = true } = options;

  if (!isRecord(graph) || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    return { valid: false, errors: ["Graph must contain nodes and edges arrays."], warnings };
  }

  const nodeIds = new Set<string>();
  const coordinates = new Map<string, XY>();

  for (const [index, node] of graph.nodes.entries()) {
    if (!isRecord(node) || !isNonEmptyString(node.id)) {
      errors.push(`Node ${index}: missing or invalid ID.`);
      continue;
    }
    if (nodeIds.has(node.id)) errors.push(`Duplicate node ID: ${node.id}.`);
    nodeIds.add(node.id);
    if (!isXY(node.coordinates)) {
      errors.push(`Node ${node.id}: coordinates must be a finite [x, y] pair.`);
    } else {
      coordinates.set(node.id, node.coordinates);
    }
  }

  if (nodeIds.size === 0) errors.push("Graph must contain at least one node.");

  const edgeIds = new Set<string>();
  const neighbors = new Map<string, Set<string>>();
  for (const id of nodeIds) neighbors.set(id, new Set());

  for (const [index, edge] of graph.edges.entries()) {
    if (!isRecord(edge)) {
      errors.push(`Edge ${index}: invalid edge object.`);
      continue;
    }

    const label = isNonEmptyString(edge.id) ? edge.id : `at index ${index}`;
    if (!isNonEmptyString(edge.id)) {
      errors.push(`Edge ${index}: missing or invalid ID.`);
    } else {
      if (edgeIds.has(edge.id)) errors.push(`Duplicate edge ID: ${edge.id}.`);
      edgeIds.add(edge.id);
    }

    const fromValid = isNonEmptyString(edge.from) && nodeIds.has(edge.from);
    const toValid = isNonEmptyString(edge.to) && nodeIds.has(edge.to);
    if (!fromValid || !toValid) errors.push(`Edge ${label}: references an unknown node.`);
    if (fromValid && toValid && edge.from === edge.to) {
      errors.push(`Edge ${label}: self-loops are not allowed.`);
    }

    if (!isFiniteNumber(edge.lengthM) || edge.lengthM <= 0) {
      errors.push(`Edge ${label}: lengthM must be a positive finite number.`);
    }
    if (!isFiniteNumber(edge.difficultyScore) || edge.difficultyScore < 0 || edge.difficultyScore > 1) {
      errors.push(`Edge ${label}: difficultyScore must be between 0 and 1.`);
    }
    if (edge.slopeScore !== null &&
      (!isFiniteNumber(edge.slopeScore) || edge.slopeScore < 0 || edge.slopeScore > 1)) {
      errors.push(`Edge ${label}: slopeScore must be null or between 0 and 1.`);
    } else if (requireSlope && edge.slopeScore === null) {
      errors.push(`Edge ${label}: slopeScore is required for DTM routing.`);
    }
    if (edge.slopeDegrees !== null &&
      (!isFiniteNumber(edge.slopeDegrees) || edge.slopeDegrees < 0 || edge.slopeDegrees > 90)) {
      errors.push(`Edge ${label}: slopeDegrees must be null or between 0 and 90.`);
    } else if (requireSlope && edge.slopeDegrees === null) {
      errors.push(`Edge ${label}: slopeDegrees is required for DTM routing.`);
    }
    if (typeof edge.enabled !== "boolean") {
      errors.push(`Edge ${label}: enabled must be a boolean.`);
    }
    if (!Array.isArray(edge.sourceIds) || !edge.sourceIds.every(isNonEmptyString)) {
      errors.push(`Edge ${label}: sourceIds must be an array of non-empty strings.`);
    } else if (edge.sourceIds.length === 0) {
      const message = `Edge ${label}: data source is missing.`;
      if (requireSources) errors.push(message);
      else warnings.push(message);
    }

    if (!Array.isArray(edge.geometry) || edge.geometry.length < 2 || !edge.geometry.every(isXY)) {
      errors.push(`Edge ${label}: geometry must contain at least two valid [x, y] points.`);
    } else {
      const points: XY[] = edge.geometry;
      if (fromValid && pointDistance(points[0], coordinates.get(edge.from as string) ?? points[0]) > 1) {
        errors.push(`Edge ${label}: geometry start does not match its from node.`);
      }
      if (toValid && pointDistance(points[points.length - 1], coordinates.get(edge.to as string) ?? points[points.length - 1]) > 1) {
        errors.push(`Edge ${label}: geometry end does not match its to node.`);
      }
      const actualLength = calculatePolylineLength(points);
      if (isFiniteNumber(edge.lengthM) && edge.lengthM > 0 &&
        Math.abs(actualLength - edge.lengthM) > Math.max(1, edge.lengthM * 0.01)) {
        errors.push(`Edge ${label}: lengthM does not match polyline length.`);
      }
    }

    if (edge.enabled === true && fromValid && toValid && edge.from !== edge.to) {
      neighbors.get(edge.from as string)?.add(edge.to as string);
      neighbors.get(edge.to as string)?.add(edge.from as string);
    }
  }

  if (requireConnected && nodeIds.size > 0) {
    const first = nodeIds.values().next().value as string;
    const reached = new Set<string>([first]);
    const queue = [first];
    for (let i = 0; i < queue.length; i++) {
      for (const next of neighbors.get(queue[i]) ?? []) {
        if (!reached.has(next)) {
          reached.add(next);
          queue.push(next);
        }
      }
    }
    if (reached.size !== nodeIds.size) {
      errors.push("Graph is disconnected: not all nodes are reachable via enabled edges.");
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
