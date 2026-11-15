import type { CSSProperties } from 'react';
import { coverageLabel, lookupTerrainSegment, measured } from './terrainDetailsData';

export type TerrainDetailsProps = {
  /** Exact edge identifiers from the selected RouteResult.edgeIds when integrated. */
  edgeIds?: readonly string[] | null;
  title?: string;
};

const row: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 16, padding: '5px 0', borderBottom: '1px solid #334155' };
const label: CSSProperties = { color: '#cbd5e1' };

/** T-020: human-readable, source-traceable T-016 per-edge measurements. */
export default function TerrainDetails({ edgeIds, title = 'Характеристики рельєфу' }: TerrainDetailsProps) {
  return (
    <section aria-label={title} style={{ background: '#17212d', border: '1px solid #475569', borderRadius: 10, padding: 16, color: '#f8fafc', fontFamily: 'system-ui, sans-serif', lineHeight: 1.5 }}>
      <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>{title}</h2>
      <p style={{ color: '#cbd5e1', fontSize: 12, margin: '0 0 12px' }}>
        Вимірювання T-016 із числових HiRISE DTM і slope GeoTIFF. Крок перевірки осі — 1 м;
        статистика нахилів за унікальними пікселями (~1,01 м). Це не оцінка ширини коридору.
      </p>
      {!edgeIds || edgeIds.length === 0 ? (
        <p role="status">Немає вибраного маршруту або його переліку ребер. Характеристики не визначено.</p>
      ) : (
        <>
          <p style={{ margin: '8px 0', fontWeight: 600 }}>Сегментів вибраного маршруту: {edgeIds.length}</p>
          {edgeIds.map((edgeId, index) => {
            const segment = lookupTerrainSegment(edgeId);
            if (!segment) {
              return <p role="status" key={`${edgeId}-${index}`} style={{ color: '#fcd34d' }}>{edgeId}: Немає даних T-016 для цього сегмента.</p>;
            }
            return (
              <details key={`${edgeId}-${index}`} open={index === 0} style={{ marginTop: 9, padding: 10, border: '1px solid #475569', borderRadius: 7 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 650 }}>
                  {segment.id} · середній нахил {measured(segment.slopeDegrees)}°
                  {!segment.enabledForExperimentalRouting ? ' · ребро вимкнено' : ''}
                </summary>
                <div style={{ marginTop: 7, fontSize: 13 }}>
                  <div style={row}><span style={label}>Від → до</span><strong>{segment.from} → {segment.to}</strong></div>
                  <div style={row}><span style={label}>Довжина геометрії</span><strong>{measured(segment.geometryLengthM, 1)} м</strong></div>
                  <div style={row}><span style={label}>Середній нахил</span><strong>{measured(segment.slopeDegrees)}°</strong></div>
                  <div style={row}><span style={label}>Максимальний нахил пікселя</span><strong>{measured(segment.maxCellSlopeDeg)}°</strong></div>
                  <div style={row}><span style={label}>P95 нахилу пікселів</span><strong>{measured(segment.p95CellMaxSlopeDeg)}°</strong></div>
                  <div style={row}><span style={label}>Середня висота</span><strong>{measured(segment.meanElevationM)} м</strong></div>
                  <div style={row}><span style={label}>Мін. / макс. висота</span><strong>{measured(segment.minElevationM)} / {measured(segment.maxElevationM)} м</strong></div>
                  <div style={row}><span style={label}>Покриття вибірок на осі</span><strong>{coverageLabel(segment.coverageFraction)}</strong></div>
                  <div style={row}><span style={label}>Дійсні позиції / заплановані</span><strong>{segment.validJointSamplePositions ?? 'Немає даних'} / {segment.plannedSamplePositions ?? 'Немає даних'}</strong></div>
                  <div style={row}><span style={label}>Джерело</span><strong>{segment.sourceIds.length ? segment.sourceIds.join(' + ') : 'Немає даних'}</strong></div>
                </div>
              </details>
            );
          })}
        </>
      )}
      <p style={{ color: '#fcd34d', fontSize: 12, margin: '12px 0 0' }}>
        Дослідницькі кандидати, НЕ сертифіковані маршрути EVA. Середній нахил осі не виявляє всіх локальних небезпек;
        max/P95 по осі не замінюють Terrain Screening у смузі ±5 м.
      </p>
    </section>
  );
}
