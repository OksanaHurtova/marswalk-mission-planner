import network from '../data/network.json';
import terrainSamples from '../../explorer/data/terrainSamples.json';
import { recommendRoute } from './recommendRoute';
import type { RouteResult } from './routeResult';

/** An experimental score-normalization threshold, NOT a NASA EVA safety limit. */
export const EXPERIMENTAL_SLOPE_REFERENCE_DEG = 15;
export const SCIENCE_TARGET_IDS = ['P01', 'P02', 'P03', 'P04'] as const;

export type ScienceTarget = (typeof SCIENCE_TARGET_IDS)[number];
type RoutingGraph = Parameters<typeof recommendRoute>[0];

export type CenterlineCostSample = {
  id: string;
  from: string;
  to: string;
  enabledForExperimentalRouting: boolean;
  slopeDegrees: number | null;
  coverageFraction: number | null;
  plannedSamplePositions: number | null;
  validJointSamplePositions: number | null;
  sampledCellCount: number | null;
  sourceIds: readonly string[];
};

export type CenterlineCostDataset = {
  edges: readonly CenterlineCostSample[];
};

export type UpdatedDtmGraphResult = {
  graph: RoutingGraph | null;
  errors: string[];
  normalizedActiveEdges: number;
};

export type RouteCostRow = {
  targetId: ScienceTarget;
  baseline: RouteResult | null;
  updated: RouteResult | null;
  samePath: boolean | null;
};

export type CostModelComparison = {
  status: 'READY' | 'UNAVAILABLE';
  rows: RouteCostRow[];
  errors: string[];
  activeEdgeCount: number;
  enabledGraphHasCycles: boolean;
  modelDescription: string;
};

function isFiniteRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

/**
 * Pure, non-mutating adapter from T-016 centerline samples to the EXISTING
 * Dijkstra/Balanced Cost engine. The original network is never overwritten.
 *
 * IMPORTANT: Existing difficultyScore is derived from slope. Setting it to
 * zero in THIS DERIVED EXPERIMENTAL GRAPH neutralizes the duplicated cost
 * term; it does NOT state that the actual terrain difficulty is zero.
 * A missing measured slope NEVER becomes zero: the mode is unavailable.
 */
export function buildUpdatedDtmGraph(
  original: RoutingGraph,
  measurements: CenterlineCostDataset,
  referenceDegrees: number = EXPERIMENTAL_SLOPE_REFERENCE_DEG,
): UpdatedDtmGraphResult {
  const errors: string[] = [];
  if (!isFiniteRange(referenceDegrees, Number.MIN_VALUE, 90)) {
    return {
      graph: null,
      errors: ['Experimental slope reference must be greater than 0 and at most 90 degrees.'],
      normalizedActiveEdges: 0,
    };
  }

  const samplesById = new Map<string, CenterlineCostSample>();
  for (const sample of measurements.edges) {
    if (samplesById.has(sample.id)) {
      errors.push(`Duplicate T-016 measurement for corridor ${sample.id}.`);
    }
    samplesById.set(sample.id, sample);
  }

  const networkIds = new Set(original.edges.map((edge) => edge.id));
  for (const id of samplesById.keys()) {
    if (!networkIds.has(id)) {
      errors.push(`T-016 contains an unknown corridor ${id}.`);
    }
  }

  let normalizedActiveEdges = 0;
  const newEdges = original.edges.map((edge) => {
    const measurement = samplesById.get(edge.id);

    // Even disabled alternatives must keep their disabled status and identity.
    if (measurement && (
      measurement.from !== edge.from ||
      measurement.to !== edge.to ||
      measurement.enabledForExperimentalRouting !== edge.enabled
    )) {
      errors.push(`T-016 edge identity or enabled-status mismatch: ${edge.id}.`);
    }

    if (!edge.enabled) {
      return { ...edge, sourceIds: [...edge.sourceIds] };
    }

    if (!measurement) {
      errors.push(`Missing T-016 slope measurement for enabled corridor ${edge.id}.`);
      return { ...edge, sourceIds: [...edge.sourceIds] };
    }

    if (!isFiniteRange(measurement.slopeDegrees, 0, 90)) {
      errors.push(`T-016 mean slope is missing or invalid for ${edge.id}.`);
      return { ...edge, sourceIds: [...edge.sourceIds] };
    }

    if (
      measurement.coverageFraction !== 1 ||
      !isPositiveInteger(measurement.plannedSamplePositions) ||
      measurement.validJointSamplePositions !== measurement.plannedSamplePositions ||
      !isPositiveInteger(measurement.sampledCellCount) ||
      !Array.isArray(measurement.sourceIds) ||
      !measurement.sourceIds.includes('HIRISE_DTM') ||
      !measurement.sourceIds.includes('HIRISE_SLOPE')
    ) {
      errors.push(`Incomplete or untraceable T-016 centerline coverage for ${edge.id}.`);
      return { ...edge, sourceIds: [...edge.sourceIds] };
    }

    normalizedActiveEdges += 1;
    return {
      ...edge,
      // One slope term, with no duplicated slope-derived difficulty term.
      slopeScore: Math.min(1, measurement.slopeDegrees / referenceDegrees),
      slopeDegrees: measurement.slopeDegrees,
      difficultyScore: 0,
      sourceIds: [...new Set([...edge.sourceIds, ...measurement.sourceIds, 'T016_CENTERLINE'])],
    };
  });

  return {
    graph: errors.length === 0 ? { ...original, edges: newEdges } : null,
    errors,
    normalizedActiveEdges,
  };
}

/**
 * Count enabled cycles. A connected graph with V-1 enabled edges is a tree:
 * changing cost weights cannot produce an alternative S-to-target path.
 */
export function hasEnabledCycles(graph: RoutingGraph): boolean {
  const parent = new Map(graph.nodes.map((node) => [node.id, node.id]));
  function root(id: string): string {
    const item = parent.get(id);
    if (item === undefined) return id;
    if (item === id) return id;
    const result = root(item);
    parent.set(id, result);
    return result;
  }
  for (const edge of graph.edges) {
    if (!edge.enabled) continue;
    const from = root(edge.from);
    const to = root(edge.to);
    if (from === to) return true;
    parent.set(from, to);
  }
  return false;
}

/** Compare all four destinations using the same Dijkstra implementation. */
export function compareRouteCostModels(
  original: RoutingGraph = network,
  measurements: CenterlineCostDataset = terrainSamples,
): CostModelComparison {
  const adapted = buildUpdatedDtmGraph(original, measurements);
  const rows: RouteCostRow[] = [];
  const errors = [...adapted.errors];

  for (const targetId of SCIENCE_TARGET_IDS) {
    const baselineRecommendation = recommendRoute(original, 'S', targetId, true);
    const updatedRecommendation = adapted.graph
      ? recommendRoute(adapted.graph, 'S', targetId, true)
      : null;

    errors.push(...baselineRecommendation.errors.map((message) => `${targetId}, baseline: ${message}`));
    if (updatedRecommendation) {
      errors.push(...updatedRecommendation.errors.map((message) => `${targetId}, T-016: ${message}`));
    }

    const baseline = baselineRecommendation.route;
    const updated = updatedRecommendation?.route ?? null;
    rows.push({
      targetId,
      baseline,
      updated,
      samePath: baseline && updated
        ? baseline.edgeIds.length === updated.edgeIds.length &&
          baseline.edgeIds.every((id, index) => updated.edgeIds[index] === id)
        : null,
    });
  }

  for (const row of rows) {
    if (!row.baseline) errors.push(`Baseline route unavailable for ${row.targetId}.`);
    if (adapted.graph && !row.updated) errors.push(`Updated DTM route unavailable for ${row.targetId}.`);
  }

  return {
    status: errors.length === 0 ? 'READY' : 'UNAVAILABLE',
    errors: [...new Set(errors)],
    rows,
    activeEdgeCount: original.edges.filter((edge) => edge.enabled).length,
    enabledGraphHasCycles: hasEnabledCycles(original),
    modelDescription:
      'Baseline: original 5x5-cell slope and slope-derived difficulty. ' +
      'Updated DTM: T-016 mean centerline slope divided by the experimental 15-degree reference (clamped to 1); ' +
      'the duplicate slope-derived difficulty penalty is neutralized in a temporary graph. ' +
      'Both modes use the unchanged Dijkstra and Balanced Cost functions. ' +
      'Cost magnitudes are model-specific and are not directly comparable safety ratings.',
  };
}
