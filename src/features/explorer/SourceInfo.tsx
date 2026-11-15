import { useEffect, useState } from 'react';
import type { LayerVisibility, MapLayerId } from './LayerControls';

type LayerSource = {
  product?: string;
  url?: string;
  derivedFrom?: string;
  method?: string;
  dataNote?: string;
};

type LayerMetadata = {
  id: string;
  title?: string;
  attribution?: string;
  safetyDisclaimer?: string;
  source?: LayerSource;
};

type LayersFile = { layers?: LayerMetadata[] };

type Props = { visible: LayerVisibility };

const DISPLAY_NAMES: Record<MapLayerId, string> = {
  'athabasca-base': 'HiRISE imagery',
  'athabasca-slope': 'Slope map (°)',
};

const LIMITATIONS: Record<MapLayerId, string> = {
  'athabasca-base':
    'Static 2048 × 2048 orthophoto covering a 2500 × 2500 m site. ' +
    'Not real-time imagery. Small hazards cannot be reliably assessed from this basemap alone.',
  'athabasca-slope':
    'Derived color visualization from HiRISE DTM, not a numeric GeoTIFF. ' +
    'Use the original candidate11_slope_deg.tif for quantitative measurements. ' +
    '15° is an experimental visualization threshold, not a NASA-approved EVA limit.',
};

const ids: MapLayerId[] = ['athabasca-base', 'athabasca-slope'];

function officialProductUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const link = new URL(value);
    return link.protocol === 'https:' && link.hostname === 'www.uahirise.org' ? link.href : null;
  } catch {
    return null;
  }
}

/** Т-014: дані про видимі шари беруться з того самого layers.json, що читає MarsMap. */
export default function SourceInfo({ visible }: Props) {
  const [layers, setLayers] = useState<LayerMetadata[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const url = `${import.meta.env.BASE_URL}maps/layers.json`;

    async function load() {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as LayersFile;
      if (!Array.isArray(data.layers)) throw new Error('Invalid layer list');
      if (!controller.signal.aborted) setLayers(data.layers);
    }

    load().catch((reason: unknown) => {
      if (!controller.signal.aborted) {
        setError(reason instanceof Error ? reason.message : String(reason));
      }
    });
    return () => controller.abort();
  }, []);

  const activeIds = ids.filter((id) => visible[id]);

  return (
    <details style={{ borderTop: '1px solid #475569', paddingTop: 10, marginTop: 10 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#f8fafc' }}>
        Sources and limitations
      </summary>
      <div
        aria-label="Sources for visible map layers"
        style={{ paddingTop: 8, maxHeight: 240, overflowY: 'auto', fontSize: 11, lineHeight: 1.45, overflowWrap: 'anywhere' }}
      >
        {activeIds.length === 0 && <p>Raster layers are hidden. POIs and routes are separate vector overlays.</p>}
        {error && <p role="alert">Could not read sources from layers.json: {error}</p>}
        {!error && layers === null && activeIds.length > 0 && <p>Loading source metadata…</p>}
        {layers && activeIds.map((id) => {
          const layer = layers.find((candidate) => candidate.id === id);
          const source = layer?.source;
          const productUrl = officialProductUrl(source?.url);
          return (
            <section key={id} style={{ paddingBottom: 9, marginBottom: 9, borderBottom: '1px solid #334155' }}>
              <strong style={{ display: 'block', color: '#fff', marginBottom: 4 }}>{DISPLAY_NAMES[id]}</strong>
              <div><b>Source:</b> {layer?.attribution ?? 'Not specified in layers.json'}</div>
              <div><b>Product:</b> {source?.product ?? 'Not specified in layers.json'}</div>
              {source?.derivedFrom && <div><b>DTM:</b> {source.derivedFrom}</div>}
              {source?.method && <div><b>Processing:</b> {source.method}</div>}
              {productUrl && (
                <a href={productUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#8be6ff' }}>
                  Official HiRISE product
                </a>
              )}
              {id === 'athabasca-slope' && (
                <div>
                  <a href="https://hirise.lpl.arizona.edu/dtm/about.php" target="_blank" rel="noopener noreferrer" style={{ color: '#8be6ff' }}>
                    About HiRISE DTM
                  </a>
                </div>
              )}
              <div style={{ marginTop: 5, color: '#fbd38d' }}><b>Limitations:</b> {LIMITATIONS[id]}</div>
              {source?.dataNote && <div>{source.dataNote}</div>}
              {layer?.safetyDisclaimer && <div>{layer.safetyDisclaimer}</div>}
            </section>
          );
        })}
        <p style={{ color: '#cbd5e1', marginBottom: 2 }}>
          POIs, start S, and routes are preliminary research elements.
          Not a certified astronaut EVA plan; no real-time conditions are included.
        </p>
      </div>
    </details>
  );
}
