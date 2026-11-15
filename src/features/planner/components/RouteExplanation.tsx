import type { RouteResult } from '../lib/routeResult';

type RouteExplanationProps = {
  route: RouteResult;
};

/** Explains the existing baseline cost model; does not recompute it. */
export default function RouteExplanation({ route }: RouteExplanationProps) {
  return (
    <section aria-labelledby="route-explanation-heading">
      <h3 id="route-explanation-heading">Why This Route?</h3>
      <p style={{ lineHeight: 1.7 }}>
        Dijkstra selects the available path with the lowest modeled Balanced
        Cost. Only enabled graph corridors can be selected. The model uses
        three inputs for each corridor:
      </p>
      <ul style={{ paddingLeft: 22, lineHeight: 1.8 }}>
        <li>
          <strong>Distance:</strong> the full corridor polyline length, not the
          straight-line distance between endpoints.
        </li>
        <li>
          <strong>Terrain difficulty:</strong> the current graph&apos;s
          slope-derived difficulty proxy, based on high slope values in nearby
          raster cells. It is not an independent rock or obstacle survey.
        </li>
        <li>
          <strong>Slope:</strong> the current graph&apos;s slope score derived
          from DTM terrain measurements.
        </li>
      </ul>
      <p style={{ lineHeight: 1.7 }}>
        For the primary routing model, each enabled corridor contributes
        (length in meters ÷ 100) × (1 + difficulty score + slope score).
        The displayed route cost is the sum of those contributions. Terrain
        difficulty and slope are both slope-derived proxies in this baseline;
        the separate Updated DTM comparison tests an alternative treatment.
      </p>
      <p style={{ color: '#b8c9db', lineHeight: 1.7 }}>
        <strong>Current result:</strong> {route.explanation} The selected path
        contains {route.edgeIds.length} corridor
        {route.edgeIds.length === 1 ? '' : 's'} and has a modeled cost of{' '}
        {route.balancedCost.toFixed(4)}.
      </p>
      <p style={{ color: '#b8c9db', lineHeight: 1.7 }}>
        HiRISE imagery, 1 m centerline samples, and nearby-terrain screening
        provide separate evidence for review. They do not by themselves certify
        route safety. The experimental 15° reference is not a NASA EVA safety
        standard.
      </p>
    </section>
  );
}
