import type { CSSProperties } from 'react';
import { coverageLabel, lookupTerrainSegment, measured } from './terrainDetailsData';

export type TerrainDetailsProps = {
  /** Use exact edge IDs from RouteResult.edgeIds in the integrated app. */
  edgeIds?: readonly string[] | null;
  title?: string;
};

const metricRow: CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
  flexWrap: 'wrap', columnGap: 14, rowGap: 4, padding: '7px 0',
  borderBottom: '1px solid #27364a',
};
const metricLabel: CSSProperties = { color: '#a9bbcf', fontSize: 12 };
const metricValue: CSSProperties = { color: '#f3f7fc', fontSize: 12, textAlign: 'right', overflowWrap: 'anywhere' };

function withUnit(value: number | null | undefined, unit: string, digits = 2): string {
  const formatted = measured(value, digits);
  return formatted === 'No data' ? formatted : `${formatted}${unit === '°' ? '' : ' '}${unit}`;
}

/** Transparent T-016 centerline measurements; never a certified safety judgment. */
export default function TerrainDetails({ edgeIds, title = 'Terrain measurements' }: TerrainDetailsProps) {
  return (
    <section aria-label={title} style={{ background: '#15202e', border: '1px solid #344459', borderRadius: 14, padding: '17px 19px', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif', lineHeight: 1.55 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 17, letterSpacing: '-.01em' }}>{title}</h2>
      <p style={{ color: '#a9bbcf', fontSize: 12, margin: '0 0 13px' }}>
        Measured from HiRISE DTM and slope rasters. Samples every 1 m along the route centerline;
        slope statistics use distinct raster cells (~1.01 m). This is not full-corridor coverage.
      </p>
      {!edgeIds || edgeIds.length === 0 ? (
        <p role="status">No route selected or no edge IDs available. Terrain measurements are unavailable.</p>
      ) : (
        <>
          <p style={{ color: '#c9d7e6', fontSize: 12, margin: '0 0 11px', fontWeight: 650 }}>
            {edgeIds.length} measured segment{edgeIds.length === 1 ? '' : 's'} · Select a segment to expand
          </p>
          <div style={{ display: 'grid', gap: 8 }}>
            {edgeIds.map((edgeId, index) => {
              const segment = lookupTerrainSegment(edgeId);
              if (!segment) {
                return <p role="status" key={`${edgeId}-${index}`} style={{ color: '#f8d78d' }}>{edgeId}: No T-016 data for this segment.</p>;
              }
              return (
                <details key={`${edgeId}-${index}`} open={index === 0} style={{ background: '#1b293a', padding: '10px 12px', border: '1px solid #344459', borderRadius: 9 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {segment.id} <span style={{ color: '#77d8ef', fontWeight: 600 }}>· {withUnit(segment.slopeDegrees, '°')}</span>
                    {!segment.enabledForExperimentalRouting ? ' · Disabled' : ''}
                  </summary>
                  <div style={{ marginTop: 10 }}>
                    <div style={metricRow}><span style={metricLabel}>From → to</span><strong style={metricValue}>{segment.from} → {segment.to}</strong></div>
                    <div style={metricRow}><span style={metricLabel}>Centerline length</span><strong style={metricValue}>{withUnit(segment.geometryLengthM, 'm', 1)}</strong></div>
                    <div style={metricRow}><span style={metricLabel}>Mean slope</span><strong style={metricValue}>{withUnit(segment.slopeDegrees, '°')}</strong></div>
                    <div style={metricRow}><span style={metricLabel}>Maximum cell slope</span><strong style={metricValue}>{withUnit(segment.maxCellSlopeDeg, '°')}</strong></div>
                    <div style={metricRow}><span style={metricLabel}>P95 cell slope</span><strong style={metricValue}>{withUnit(segment.p95CellMaxSlopeDeg, '°')}</strong></div>
                    <div style={metricRow}><span style={metricLabel}>Mean elevation</span><strong style={metricValue}>{withUnit(segment.meanElevationM, 'm')}</strong></div>
                    <div style={metricRow}><span style={metricLabel}>Minimum / maximum elevation</span><strong style={metricValue}>{withUnit(segment.minElevationM, 'm')} / {withUnit(segment.maxElevationM, 'm')}</strong></div>
                    <div style={metricRow}><span style={metricLabel}>Valid centerline coverage</span><strong style={metricValue}>{coverageLabel(segment.coverageFraction)}</strong></div>
                    <div style={metricRow}><span style={metricLabel}>Valid / planned sample positions</span><strong style={metricValue}>{segment.validJointSamplePositions ?? 'No data'} / {segment.plannedSamplePositions ?? 'No data'}</strong></div>
                    <div style={metricRow}><span style={metricLabel}>Data provenance</span><strong style={metricValue}>{segment.sourceIds.length ? segment.sourceIds.join(' + ') : 'No data'}</strong></div>
                  </div>
                </details>
              );
            })}
          </div>
        </>
      )}
      <p style={{ color: '#f8d78d', fontSize: 12, margin: '14px 0 0' }}>
        Research-only routes, not certified EVA traverses. Centerline mean/max/P95 values do not replace ±5 m corridor Terrain Screening.
      </p>
    </section>
  );
}
