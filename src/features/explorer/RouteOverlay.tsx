import { useEffect, useMemo } from 'react';
import type Map from 'ol/Map.js';
import Feature from 'ol/Feature.js';
import LineString from 'ol/geom/LineString.js';
import Point from 'ol/geom/Point.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { Circle as CircleStyle, Fill, RegularShape, Stroke, Style, Text } from 'ol/style.js';

// Exact coordinate shape of Ania's RouteResult.geometry: XY[] where XY = [number, number].
// The planner owns routing; this component only draws the returned coordinates.
export type RouteGeometry = readonly (readonly [number, number])[];

type RouteOverlayProps = {
  map: Map | null;
  geometry?: RouteGeometry | null;
};

// Dark outline under the bright route makes it legible on both raster layers.
const routeStyles = [
  new Style({ stroke: new Stroke({ color: '#071923', width: 11 }) }),
  new Style({ stroke: new Stroke({ color: '#00e9ff', width: 6, lineDash: [16, 7] }) }),
];

const startStyles = [
  new Style({
    image: new CircleStyle({
      radius: 19,
      fill: new Fill({ color: 'rgba(7,25,35,0.95)' }),
      stroke: new Stroke({ color: '#ffffff', width: 2 }),
    }),
  }),
  new Style({
    image: new RegularShape({
      points: 4,
      radius: 15,
      angle: Math.PI / 4,
      fill: new Fill({ color: '#22e4a8' }),
      stroke: new Stroke({ color: '#0b2431', width: 3 }),
    }),
    text: new Text({
      text: 'START · S',
      offsetY: -35,
      font: 'bold 16px sans-serif',
      fill: new Fill({ color: '#ffffff' }),
      stroke: new Stroke({ color: '#071923', width: 5 }),
    }),
  }),
];

/** Draws an experimental route and its first vertex S without changing the map view. */
export default function RouteOverlay({ map, geometry }: RouteOverlayProps) {
  const source = useMemo(() => new VectorSource<Feature>(), []);
  const layer = useMemo(() => new VectorLayer({
    source,
    zIndex: 5, // above imagery, below POI marker layer (zIndex 10)
    style: (feature) => feature.get('routeRole') === 'start' ? startStyles : routeStyles,
  }), [source]);

  useEffect(() => {
    if (!map) return;
    map.addLayer(layer);
    return () => { map.removeLayer(layer); };
  }, [map, layer]);

  useEffect(() => {
    source.clear();
    if (geometry == null) return;
    if (
      !Array.isArray(geometry) ||
      geometry.length < 2 ||
      geometry.some((xy) =>
        !Array.isArray(xy) || xy.length !== 2 ||
        !Number.isFinite(xy[0]) || !Number.isFinite(xy[1]) ||
        xy[0] < 0 || xy[0] > 2500 || xy[1] < 0 || xy[1] > 2500
      )
    ) {
      console.warn('RouteOverlay: invalid local Martian route geometry.');
      return;
    }

    const points = geometry.map((xy) => [xy[0], xy[1]]);
    const routeFeature = new Feature({ geometry: new LineString(points) });
    source.addFeature(routeFeature);

    // All current mission routes start at S; mark their actual first coordinate.
    const startFeature = new Feature({ geometry: new Point(points[0]) });
    startFeature.set('routeRole', 'start');
    source.addFeature(startFeature);
  }, [geometry, source]);

  return null;
}
