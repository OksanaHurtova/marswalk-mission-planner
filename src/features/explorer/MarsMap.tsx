import { useEffect, useMemo, useRef, useState } from 'react';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import ImageLayer from 'ol/layer/Image.js';
import ImageStatic from 'ol/source/ImageStatic.js';
import Projection from 'ol/proj/Projection.js';
import { getCenter } from 'ol/extent.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style.js';
import LayerControls, { type LayerVisibility, type MapLayerId } from './LayerControls';
import RouteOverlay, { type RouteGeometry } from './RouteOverlay';
import 'ol/ol.css';

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

// Тимчасовий контракт T-009; узгодити зі спільним src/shared/types.ts в T-053.
export type ScientificPoint = {
  id: string;
  name: string;
  localXY_m: [number, number];
  status?: string;
};

const EMPTY_POINTS: ScientificPoint[] = [];

type MarsMapProps = {
  points?: ScientificPoint[];
  onSelectTarget?: (pointId: string) => void;
  routeGeometry?: RouteGeometry | null;
};

export default function MarsMap({ points = EMPTY_POINTS, onSelectTarget, routeGeometry = null }: MarsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [openLayersMap, setOpenLayersMap] = useState<Map | null>(null);
  const poiSource = useMemo(() => new VectorSource<Feature<Point>>(), []);

  // T-011: стан перемикачів. OpenLayers-шари не створюються заново при toggle.
  const [visibleLayers, setVisibleLayers] = useState<LayerVisibility>({
    'athabasca-base': true,
    'athabasca-slope': false,
  });
  const visibleLayersRef = useRef<LayerVisibility>(visibleLayers);
  const rasterLayersRef = useRef<Partial<Record<MapLayerId, ImageLayer<ImageStatic>>>>({});

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
        throw new Error('Не вдалося завантажити конфігурацію карти.');
      }

      const region = (await regionResponse.json()) as RegionConfig;
      const config = (await layersResponse.json()) as LayersConfig;
      const layer = config.layers.find(
        (item) => item.id === 'athabasca-base'
      );

      if (!layer) {
        throw new Error('У layers.json немає шару athabasca-base.');
      }

      if (
        config.regionId !== region.id ||
        JSON.stringify(layer.extent) !== JSON.stringify(region.extent)
      ) {
        throw new Error('Межі карти не збігаються з region.json.');
      }

      const slopeConfig = config.layers.find((item) => item.id === 'athabasca-slope');
      if (!slopeConfig || JSON.stringify(slopeConfig.extent) !== JSON.stringify(region.extent)) {
        throw new Error('У layers.json відсутній коректний шар athabasca-slope.');
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
        opacity: slopeConfig.opacity ?? 0.7,
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
            style: (feature) => new Style({
              image: new CircleStyle({
                radius: 8,
                fill: new Fill({ color: '#ffbd55' }),
                stroke: new Stroke({ color: '#18202a', width: 2 }),
              }),
              text: new Text({
                text: String(feature.get('pointId') ?? ''),
                offsetY: -21,
                font: 'bold 14px sans-serif',
                fill: new Fill({ color: '#ffffff' }),
                stroke: new Stroke({ color: '#18202a', width: 3 }),
              }),
            }),
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

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '70vh',
        minHeight: '420px',
        background: '#171b20',
      }}
    >
      <div style={{ position: 'absolute', zIndex: 20, top: 12, right: 12 }}>
        <LayerControls visible={visibleLayers} onToggle={handleLayerToggle} />
      </div>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      />
      <RouteOverlay map={openLayersMap} geometry={routeGeometry} />
      {error && (
        <p style={{ color: '#ff7777', padding: '12px' }}>
          Помилка карти: {error}
        </p>
      )}
    </div>
  );
}
