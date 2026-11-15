import { validateGraph } from "./graphValidation";
import { buildRouteResult } from "./routeResult";
import type { RouteResult } from "./routeResult";

type RoutingGraph = Parameters<typeof buildRouteResult>[0];

export type RouteRecommendation = {
  route: RouteResult | null;
  errors: string[];
  warnings: string[];
};

export function recommendRoute(
  graph: RoutingGraph,
  startId: string,
  targetId: string,
  useSlope: boolean
): RouteRecommendation {
  // A disconnected network is allowed: an unreachable target is a valid outcome.
  const validation = validateGraph(graph, {
    requireSlope: useSlope,
    requireSources: false,
    requireConnected: false,
  });

  if (!validation.valid) {
    return {
      route: null,
      errors: validation.errors,
      warnings: validation.warnings,
    };
  }

  const errors: string[] = [];

  if (!graph.nodes.some((node) => node.id === startId)) {
    errors.push(`Start node ${startId} does not exist in the graph.`);
  }

  if (!graph.nodes.some((node) => node.id === targetId)) {
    errors.push(`Target node ${targetId} does not exist in the graph.`);
  }

  if (errors.length > 0) {
    return {
      route: null,
      errors,
      warnings: validation.warnings,
    };
  }

  const route = buildRouteResult(graph, startId, targetId, useSlope);
  const warnings = [
    ...validation.warnings,
    ...(route?.warnings ?? []),
  ];

  if (route === null) {
    warnings.push("No route found between the selected nodes.");
  }

  return {
    route,
    errors: [],
    warnings: [...new Set(warnings)],
  };
}
