import type { RouteResult } from '../lib/routeResult';

type RouteSummaryProps = {
  route: RouteResult;
  renderedCoordinateCount: number;
};

/** Displays route metrics without modifying route selection or cost calculation. */
export default function RouteSummary({
  route,
  renderedCoordinateCount,
}: RouteSummaryProps) {
  return (
    <section aria-labelledby="route-summary-heading">
      <h3 id="route-summary-heading">Experimental Route Summary</h3>
      <p>
        <strong>Route:</strong> {route.nodeIds.join(' → ')}
      </p>
      <p>
        <strong>Distance:</strong> {route.distanceM.toFixed(1)} m
      </p>
      <p>
        <strong>Balanced Cost:</strong> {route.balancedCost.toFixed(4)}
      </p>
      <p>
        <strong>Terrain Difficulty Index:</strong>{' '}
        {route.difficultyIndex === null
          ? 'Unavailable'
          : route.difficultyIndex.toFixed(4)}
      </p>
      <p>
        <strong>Mean Route Slope:</strong>{' '}
        {route.meanSlopeDegrees === null
          ? 'Unavailable'
          : `${route.meanSlopeDegrees.toFixed(2)}°`}
      </p>
      <p>
        <strong>Route Geometry:</strong> {renderedCoordinateCount} coordinates
        rendered by OpenLayers
      </p>
    </section>
  );
}
