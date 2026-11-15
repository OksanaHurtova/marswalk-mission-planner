import { useMemo } from 'react';

import network from '../data/network.json';
import { compareRouteWithShortestDistance } from '../lib/routeDistanceComparison';
import type { RouteResult } from '../lib/routeResult';

type RouteSummaryProps = {
  route: RouteResult;
  renderedCoordinateCount: number;
};

/** Displays route metrics and a distance-only comparison without changing routing. */
export default function RouteSummary({
  route,
  renderedCoordinateCount,
}: RouteSummaryProps) {
  const startId = route.nodeIds[0];
  const targetId = route.nodeIds[route.nodeIds.length - 1];

  const distanceComparison = useMemo(
    () =>
      startId && targetId
        ? compareRouteWithShortestDistance(network, startId, targetId, route)
        : null,
    [startId, targetId, route],
  );

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
        <strong>Extra distance vs shortest enabled route:</strong>{' '}
        {distanceComparison === null
          ? 'Unavailable'
          : `+${distanceComparison.extraDistanceM.toFixed(1)} m (+${distanceComparison.extraDistancePercent.toFixed(1)}%)`}
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
        used to draw the route on the map
      </p>
      <p style={{ color: '#b8c8d9', fontSize: 12, lineHeight: 1.6 }}>
        Distance comparison considers only currently enabled corridors and their
        complete polyline lengths. Disabled alternatives are excluded. It is not
        an independent terrain safety assessment.
      </p>
    </section>
  );
}