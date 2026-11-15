import { useEffect, useMemo, useRef, useState } from 'react';
import Map from 'ol/Map.js';
import ScaleLine from 'ol/control/ScaleLine.js';
import View from 'ol/View.js';
import ImageLayer from 'ol/layer/Image.js';
import ImageStatic from 'ol/source/ImageStatic.js';
import Projection from 'ol/proj/Projection.js';
import { getCenter } from 'ol/extent.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import LineString from 'ol/geom/LineString.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style.js';
import LayerControls, { type LayerVisibility, type MapLayerId } from './LayerControls';
import { DEFAULT_SLOPE_TRANSPARENCY_PERCENT, normalizeTransparencyPercent, transparencyPercentToOpacity } from './slopeTransparency';
import RouteOverlay from './RouteOverlay';
import type { MarsMapProps, ScientificPoint } from '../../shared/types';
import MapLegend from './MapLegend';
import 'ol/ol.css';
import './MarsMapLayout.css';

export type { ScientificPoint } from '../../shared/types';

type Extent = [number, number, number, number];

type RegionConfig = {
  id: string;
  extent: Extent;
};

type LayerConfig = {
  id: string;
  url: string;
  extent: Extent;
  attribution?: string;
  opacity?: number;
  visible?: boolean;
};

type LayersConfig = {
  regionId: string;
  projection: string;
  layers: LayerConfig[];
};


const EMPTY_POINTS: ScientificPoint[] = [];


export default function MarsMap({
  points = EMPTY_POINTS,
  onSelectTarget,
  routeGeometry = null,
  selectedTargetId = null,
}: MarsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [openLayersMap, setOpenLayersMap] = useState<Map | null>(null);
  const poiSource = useMemo(() => new VectorSource<Feature<Point>>(), []);
  // React controls the selected POI; redraw the vector source, not the whole map.
  const selectedTargetIdRef = useRef<string | null>(selectedTargetId);
  useEffect(() => {
    selectedTargetIdRef.current = selectedTargetId;
    poiSource.changed();
  }, [selectedTargetId, poiSource]);

  // T-011: стан перемикачів. OpenLayers-шари не створюються заново при toggle.
  const [visibleLayers, setVisibleLayers] = useState<LayerVisibility>({
    'athabasca-base': true,
    'athabasca-slope': false,
  });
  const visibleLayersRef = useRef<LayerVisibility>(visibleLayers);
  const rasterLayersRef = useRef<Partial<Record<MapLayerId, ImageLayer<ImageStatic>>>>({});
  // T-021: this state changes only raster blending, never layer geometry.
  const [slopeTransparencyPercent, setSlopeTransparencyPercent] = useState(DEFAULT_SLOPE_TRANSPARENCY_PERCENT);
  const slopeTransparencyRef = useRef(slopeTransparencyPercent);

  const handleSlopeTransparencyChange = (percent: number) => {
    const next = normalizeTransparencyPercent(percent);
    slopeTransparencyRef.current = next;
    setSlopeTransparencyPercent(next);
    rasterLayersRef.current['athabasca-slope']?.setOpacity(transparencyPercentToOpacity(next));
  };

  const handleLayerToggle = (layerId: MapLayerId, visible: boolean) => {
    const next = { ...visibleLayersRef.current, [layerId]: visible };
    visibleLayersRef.current = next;
    setVisibleLayers(next);
    rasterLayersRef.current[layerId]?.setVisible(visible);
  };
  // Тримаємо актуальний callback без пересоздання карти при оновленні props.
  const onSelectTargetRef = useRef(onSelectTarget);

  useEffect(() => {
    onSelectTargetRef.current = onSelectTarget;
  }, [onSelectTarget]);

  // Оновлюємо маркери, не скидаючи масштаб і положення карти.
  useEffect(() => {
    poiSource.clear();
    const features = points.map((point) => {
      const marker = new Feature<Point>({ geometry: new Point(point.localXY_m) });
      marker.setId(point.id);
      marker.set('pointId', point.id);
      marker.set('name', point.name);
      return marker;
    });
    poiSource.addFeatures(features);
  }, [points, poiSource]);

  useEffect(() => {
    const controller = new AbortController();
    let map: Map | undefined;

    async function initializeMap() {
      const base = import.meta.env.BASE_URL;

      const [regionResponse, layersResponse] = await Promise.all([
        fetch(`${base}maps/region.json`, {
          signal: controller.signal,
        }),
        fetch(`${base}maps/layers.json`, {
          signal: controller.signal,
        }),
      ]);

      if (!regionResponse.ok || !layersResponse.ok) {
        throw new Error('Unable to load the map configuration.');
      }

      const region = (await regionResponse.json()) as RegionConfig;
      const config = (await layersResponse.json()) as LayersConfig;
      const layer = config.layers.find(
        (item) => item.id === 'athabasca-base'
      );

      if (!layer) {
        throw new Error('Missing athabasca-base in layers.json.');
      }

      if (
        config.regionId !== region.id ||
        JSON.stringify(layer.extent) !== JSON.stringify(region.extent)
      ) {
        throw new Error('Map extents do not match region.json.');
      }

      const slopeConfig = config.layers.find((item) => item.id === 'athabasca-slope');
      if (!slopeConfig || JSON.stringify(slopeConfig.extent) !== JSON.stringify(region.extent)) {
        throw new Error('Missing or invalid athabasca-slope in layers.json.');
      }

      if (controller.signal.aborted || !containerRef.current) {
        return;
      }

      const extent = region.extent;

      const projection = new Projection({
        code: config.projection,
        units: 'm',
        extent,
      });

      const imageUrl =
        `${base}${layer.url.replace(/^\/+/, '')}`;

      const slopeUrl = `${base}${slopeConfig.url.replace(/^\/+/, '')}`;

      const view = new View({
        projection,
        center: getCenter(extent),
        extent,
        showFullExtent: true,
        zoom: 2,
        minResolution: 0.15,
      });

      const opticalImageLayer = new ImageLayer({
        visible: visibleLayersRef.current['athabasca-base'],
        opacity: layer.opacity ?? 1,
        source: new ImageStatic({
          url: imageUrl,
          projection,
          imageExtent: extent,
          attributions: layer.attribution,
        }),
      });

      const slopeImageLayer = new ImageLayer({
        visible: visibleLayersRef.current['athabasca-slope'],
        opacity: transparencyPercentToOpacity(slopeTransparencyRef.current),
        source: new ImageStatic({
          url: slopeUrl,
          projection,
          imageExtent: extent,
          attributions: slopeConfig.attribution,
        }),
      });

      rasterLayersRef.current = {
        'athabasca-base': opticalImageLayer,
        'athabasca-slope': slopeImageLayer,
      };

      map = new Map({
        target: containerRef.current,
        layers: [
          opticalImageLayer,
          slopeImageLayer,
          new VectorLayer({
            source: poiSource,
            zIndex: 10,
            style: (feature) => {
              const pointId = String(feature.get('pointId') ?? '');
              const selected = selectedTargetIdRef.current;
              const active = selected === pointId;
              const muted = selected !== null && !active;
              return new Style({
                image: new CircleStyle({
                  radius: active ? 12 : muted ? 6 : 8,
                  fill: new Fill({
                    color: active ? '#ffe36a' : muted ? 'rgba(166,182,199,0.65)' : '#ffbd55',
                  }),
                  stroke: new Stroke({
                    color: active ? '#10212d' : '#18202a',
                    width: active ? 4 : 2,
                  }),
                }),
                text: new Text({
                  text: active ? `★ ${pointId}` : pointId,
                  offsetY: active ? -27 : -21,
                  font: active ? 'bold 16px sans-serif' : 'bold 14px sans-serif',
                  fill: new Fill({ color: muted ? 'rgba(238,242,247,0.68)' : '#ffffff' }),
                  stroke: new Stroke({ color: '#18202a', width: active ? 5 : 3 }),
                }),
              });
            },
          }),
        ],
        view,
      });

      // T-010: клік по POI передає тільки id у батьківський компонент.
      map.on('singleclick', (event) => {
        const selectedFeature = map?.forEachFeatureAtPixel(
          event.pixel,
          (feature) => feature,
          {
            hitTolerance: 10,
            layerFilter: (candidate) =>
              candidate instanceof VectorLayer && candidate.getSource() === poiSource,
          }
        );
        const pointId = selectedFeature?.get('pointId');
        if (typeof pointId === 'string') {
          onSelectTargetRef.current?.(pointId);
        }
      });

      // Показуємо, що на маркер можна натиснути.
      map.on('pointermove', (event) => {
        const element = map?.getTargetElement();
        if (!element || event.dragging) return;
        const onPoi = map?.hasFeatureAtPixel(event.pixel, {
          hitTolerance: 10,
          layerFilter: (candidate) =>
            candidate instanceof VectorLayer && candidate.getSource() === poiSource,
        });
        element.style.cursor = onPoi ? 'pointer' : '';
      });

      // T-022: OpenLayers metric scale uses local Mars map metres, not Earth EPSG:4326.
      map.addControl(new ScaleLine({ units: 'metric', minWidth: 96 }));

      setOpenLayersMap(map ?? null);
      map.updateSize();
      view.fit(extent, {
        size: map.getSize(),
        padding: [20, 20, 20, 20],
      });
    }

    initializeMap().catch((err: unknown) => {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });

    return () => {
      controller.abort();
      map?.setTarget(undefined);
      rasterLayersRef.current = {};
    };
  }, [poiSource]);

  // Keep S, all corridor bends, and the destination in frame on selection.
  // Routes are local Mars metres. This changes the view only, not the geometry.
  useEffect(() => {
    if (!openLayersMap || !routeGeometry || routeGeometry.length < 2) return;
    if (routeGeometry.some((xy) =>
      xy.length !== 2 || !Number.isFinite(xy[0]) || !Number.isFinite(xy[1]) ||
      xy[0] < 0 || xy[0] > 2500 || xy[1] < 0 || xy[1] > 2500
    )) return;
    const size = openLayersMap.getSize();
    if (!size || size[0] <= 0 || size[1] <= 0) return;
    const routeBounds = new LineString(routeGeometry.map((xy) => [xy[0], xy[1]])).getExtent();
    openLayersMap.getView().fit(routeBounds, {
      size,
      padding: [85, 70, 85, 70],
      duration: 500,
      maxZoom: 5,
    });
  }, [openLayersMap, routeGeometry, selectedTargetId]);

  return (
    <div className="marswalk-map-layout">
      <div className="marswalk-map-canvas">
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        <RouteOverlay map={openLayersMap} geometry={routeGeometry} />
        {error && (
          <p role="alert" style={{ position: 'absolute', left: 14, bottom: 42, color: '#fecaca', background: '#451c23', padding: 10, borderRadius: 8 }}>
            Map error: {error}
          </p>
        )}
      </div>
      <aside className="marswalk-map-sidebar" aria-label="Map controls and legend">
        <LayerControls
          visible={visibleLayers}
          onToggle={handleLayerToggle}
          slopeTransparencyPercent={slopeTransparencyPercent}
          onSlopeTransparencyChange={handleSlopeTransparencyChange}
        />
        <MapLegend hasRoute={Boolean(routeGeometry && routeGeometry.length >= 2)} selectedTargetId={selectedTargetId} />
      </aside>
    </div>
  );
}
