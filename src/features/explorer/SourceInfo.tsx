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
  'athabasca-base': 'Оптичний HiRISE',
  'athabasca-slope': 'Карта нахилів (°)',
};

const LIMITATIONS: Record<MapLayerId, string> = {
  'athabasca-base':
    'Статичне ортофото, зменшене до 2048 × 2048 пікселів на квадраті 2500 × 2500 м. ' +
    'Не є знімком у реальному часі. Невеликі перешкоди не можна надійно оцінити лише за цією підкладкою.',
  'athabasca-slope':
    'Кольорова похідна візуалізація за HiRISE DTM, а не числовий GeoTIFF. ' +
    'Для вимірювань потрібен вихідний candidate11_slope_deg.tif. ' +
    '15° — дослідницький поріг візуалізації, не затверджена межа NASA для EVA.',
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
      if (!Array.isArray(data.layers)) throw new Error('Некоректний список шарів');
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
        Джерела та обмеження
      </summary>
      <div
        aria-label="Джерела видимих шарів карти"
        style={{ paddingTop: 8, maxHeight: 240, overflowY: 'auto', fontSize: 11, lineHeight: 1.45, overflowWrap: 'anywhere' }}
      >
        {activeIds.length === 0 && <p>Растрові шари вимкнені. POI й маршрут — окремі векторні елементи.</p>}
        {error && <p role="alert">Не вдалося прочитати джерела з layers.json: {error}</p>}
        {!error && layers === null && activeIds.length > 0 && <p>Завантаження джерел…</p>}
        {layers && activeIds.map((id) => {
          const layer = layers.find((candidate) => candidate.id === id);
          const source = layer?.source;
          const productUrl = officialProductUrl(source?.url);
          return (
            <section key={id} style={{ paddingBottom: 9, marginBottom: 9, borderBottom: '1px solid #334155' }}>
              <strong style={{ display: 'block', color: '#fff', marginBottom: 4 }}>{DISPLAY_NAMES[id]}</strong>
              <div><b>Джерело:</b> {layer?.attribution ?? 'Не зазначено в layers.json'}</div>
              <div><b>Продукт:</b> {source?.product ?? 'Не зазначено в layers.json'}</div>
              {source?.derivedFrom && <div><b>DTM:</b> {source.derivedFrom}</div>}
              {source?.method && <div><b>Обробка:</b> {source.method}</div>}
              {productUrl && (
                <a href={productUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#8be6ff' }}>
                  Офіційна сторінка HiRISE
                </a>
              )}
              {id === 'athabasca-slope' && (
                <div>
                  <a href="https://hirise.lpl.arizona.edu/dtm/about.php" target="_blank" rel="noopener noreferrer" style={{ color: '#8be6ff' }}>
                    Про HiRISE DTM
                  </a>
                </div>
              )}
              <div style={{ marginTop: 5, color: '#fbd38d' }}><b>Обмеження:</b> {LIMITATIONS[id]}</div>
              {source?.dataNote && <div>{source.dataNote}</div>}
              {layer?.safetyDisclaimer && <div>{layer.safetyDisclaimer}</div>}
            </section>
          );
        })}
        <p style={{ color: '#cbd5e1', marginBottom: 2 }}>
          POI, старт S і маршрути — попередні дослідницькі елементи.
          Це не сертифікований план виходу астронавтів; дані не містять умов у реальному часі.
        </p>
      </div>
    </details>
  );
}
