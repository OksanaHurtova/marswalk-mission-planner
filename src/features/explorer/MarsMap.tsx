import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import ImageLayer from 'ol/layer/Image.js';
import ImageStatic from 'ol/source/ImageStatic.js';
import Projection from 'ol/proj/Projection.js';
import { getCenter } from 'ol/extent.js';
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

export default function MarsMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

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

      const view = new View({
        projection,
        center: getCenter(extent),
        extent,
        showFullExtent: true,
        zoom: 2,
        minResolution: 0.15,
      });

      map = new Map({
        target: containerRef.current,
        layers: [
          new ImageLayer({
            visible: layer.visible ?? true,
            opacity: layer.opacity ?? 1,
            source: new ImageStatic({
              url: imageUrl,
              projection,
              imageExtent: extent,
              attributions: layer.attribution,
            }),
          }),
        ],
        view,
      });

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
    };
  }, []);

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
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      />
      {error && (
        <p style={{ color: '#ff7777', padding: '12px' }}>
          Помилка карти: {error}
        </p>
      )}
    </div>
  );
}
