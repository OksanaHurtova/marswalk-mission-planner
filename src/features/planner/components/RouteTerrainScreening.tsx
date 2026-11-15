import { useMemo } from 'react';
import type { RouteResult } from '../lib/routeResult';
import { compareRouteTerrain } from '../lib/routeTerrainComparison';
import { describeVisualFactor } from '../lib/routeTerrainScreening';

type Props = {
  route: RouteResult | null;
};

const labelStyle = {
  margin: 0,
  fontSize: 13,
  color: '#b9cddd',
} as const;

function formatDegrees(value: number | null): string {
  return value === null ? 'Unavailable' : `${value.toFixed(2)}°`;
}

function formatElevation(value: number | null): string {
  return value === null ? 'Unavailable' : `${value.toFixed(2)} m`;
}

function formatCoverage(value: number | null): string {
  return value === null ? 'Unavailable' : `${(value * 100).toFixed(1)}%`;
}

function Metric({ title, value, description }: {
  title: string;
  value: string;
  description?: string;
}) {
  return (
    <div
      style={{
        minWidth: 165,
        padding: 15,
        borderRadius: 10,
        background: '#243444',
        border: '1px solid #4f667b',
      }}
    >
      <p style={labelStyle}>{title}</p>
      <strong style={{ display: 'block', marginTop: 7, fontSize: 23, color: '#edf7ff' }}>
        {value}
      </strong>
      {description && (
        <p style={{ margin: '7px 0 0', color: '#b9cddd', fontSize: 12, lineHeight: 1.5 }}>
          {description}
        </p>
      )}
    </div>
  );
}

const cellStyle = {
  padding: '12px 10px',
  whiteSpace: 'nowrap',
  textAlign: 'left',
} as const;

export default function RouteTerrainScreening({ route }: Props) {
  const comparison = useMemo(() => compareRouteTerrain(route), [route]);
  if (!comparison) return null;

  const { existingScreening, corridors } = comparison;

  return (
    <section
      aria-labelledby="terrain-screening-heading"
      style={{
        marginTop: 24,
        padding: 20,
        border: '1px solid #537186',
        borderRadius: 12,
        background: '#132434',
        color: '#e9f3ff',
      }}
    >
      <h3 id="terrain-screening-heading" style={{ margin: '0 0 9px', fontSize: 23 }}>
        Terrain Evidence — Selected Route
      </h3>
      <p style={{ margin: '0 0 18px', color: '#ccdfed', lineHeight: 1.65, fontSize: 14 }}>
        Compare two different measurements of the selected experimental corridor: the
        T-016 1 m-step centerline samples and the T-029 10 m-wide terrain strip
        (5 m on each side). The original Dijkstra graph costs are unchanged.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <Metric
          title="Highest slope on centerline"
          value={formatDegrees(comparison.maxCenterlineSlopeDeg)}
          description="T-016: original slope pixels sampled along the route"
        />
        <Metric
          title="Highest slope within ±5 m"
          value={formatDegrees(comparison.maxNearbySlopeDeg)}
          description="T-029: pixels in a strip surrounding the route"
        />
        <Metric
          title="Centerline coverage"
          value={`${comparison.centerlineFullCoverageCorridors} / ${existingScreening.corridorCount}`}
          description="Edges with 100% valid planned centerline sample positions"
        />
        <Metric
          title="Corridors with nearby pixels >15°"
          value={`${existingScreening.nearbySteepPixelCorridorCount} / ${existingScreening.corridorCount}`}
          description="Inspection indicator; not a NASA safety criterion"
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 840, borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#21384b' }}>
              {[
                'Corridor',
                'Length',
                '1 m line mean slope',
                '1 m line max slope',
                'Nearby max ±5 m',
                'Nearby pixels >15°',
                'DTM + slope line coverage',
                'Inspection priority',
              ].map((heading) => (
                <th key={heading} scope="col" style={cellStyle}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {corridors.map(({ edgeId, modelAndBuffer: buffer, centerline }) => (
              <tr key={edgeId} style={{ borderBottom: '1px solid #41596b' }}>
                <th scope="row" style={cellStyle}>
                  {edgeId}
                  <div style={{ marginTop: 4, fontSize: 12, color: '#b9cddd', fontWeight: 400 }}>
                    {buffer.fromNodeId} → {buffer.toNodeId}
                  </div>
                </th>
                <td style={cellStyle}>{buffer.lengthM.toFixed(1)} m</td>
                <td style={cellStyle}>{formatDegrees(centerline?.meanSlopeDeg ?? null)}</td>
                <td style={cellStyle}>{formatDegrees(centerline?.maxSlopeDeg ?? null)}</td>
                <td style={cellStyle}>{formatDegrees(buffer.bufferMaxSlopeDeg)}</td>
                <td
                  style={{
                    ...cellStyle,
                    fontWeight: 700,
                    color: buffer.hasNearbyPixelsAbove15Deg ? '#ffcf86' : '#b8e2ce',
                  }}
                >
                  {buffer.bufferPixelsAbove15DegPercent.toFixed(2)}%
                </td>
                <td style={cellStyle}>{formatCoverage(centerline?.coverageFraction ?? null)}</td>
                <td style={cellStyle}>
                  {buffer.reviewPriority === 'HIGH' ? 'HIGH — inspect' : 'STANDARD — inspect'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 style={{ margin: '22px 0 12px', fontSize: 17 }}>
        Corridor measurements and checks
      </h4>
      <div style={{ display: 'grid', gap: 10 }}>
        {corridors.map(({ edgeId, modelAndBuffer: buffer, centerline }) => (
          <details
            key={edgeId}
            style={{ padding: '12px 14px', border: '1px solid #3c5364', borderRadius: 8 }}
          >
            <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              {edgeId} — {buffer.reviewPriority.toLowerCase()} inspection priority
              {buffer.hasNearbyPixelsAbove15Deg ? ' · steep pixels nearby' : ''}
            </summary>
            <div style={{ paddingTop: 8, lineHeight: 1.7, color: '#d5e6f2', fontSize: 13 }}>
              <p style={{ margin: '5px 0' }}>
                <strong>T-016 centerline:</strong> average slope {formatDegrees(centerline?.meanSlopeDeg ?? null)},
                {' '}P95 {formatDegrees(centerline?.p95SlopeDeg ?? null)},
                {' '}maximum {formatDegrees(centerline?.maxSlopeDeg ?? null)}.
                {' '}Average elevation {formatElevation(centerline?.meanElevationM ?? null)}.
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Sampling:</strong> {centerline?.validJointPositions ?? 'unknown'} valid of
                {' '}{centerline?.plannedPositions ?? 'unknown'} planned centerline positions;
                {' '}{centerline?.uniqueValidCells ?? 'unknown'} unique valid source pixels.
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>T-029 nearby terrain:</strong> strip maximum
                {' '}{formatDegrees(buffer.bufferMaxSlopeDeg)},
                {' '}{buffer.bufferPixelsAbove15DegPercent.toFixed(2)}% of buffer slope pixels above
                {' '}15°. This percentage is not a percentage of the route length.
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Original routing model:</strong> mean 5×5-grid slope
                {' '}{formatDegrees(buffer.modelMeanSlopeDeg)}, maximum sampled 5×5-grid cell
                {' '}{formatDegrees(buffer.modelMaxSampledCellSlopeDeg)}.
                {' '}These model values are not interchangeable with T-016 source-pixel statistics.
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Still requires visual review:</strong>
                {' '}{buffer.visualFactorsToCheck.map(describeVisualFactor).join('; ')}.
                {' '}These are inspection questions, not confirmed obstacles.
              </p>
            </div>
          </details>
        ))}
      </div>

      <p
        style={{
          padding: 14,
          margin: '19px 0 0',
          borderRadius: 8,
          background: '#293745',
          fontSize: 13,
          lineHeight: 1.65,
          color: '#e0eaf5',
        }}
      >
        <strong>Scientific limits.</strong> T-016 uses {comparison.sampleSpacingM} m positions
        {' '}along the original polyline and computes statistics over unique valid ~1.01 m
        {' '}raster pixels. T-029 screens nearby pixels in a ±5 m strip. A 100% centerline
        {' '}coverage figure means that all planned centerline sample positions had valid
        {' '}DTM and slope values; it does not mean 100% coverage of the corridor width.
        {' '}The project’s 15° comparison is not an official NASA EVA threshold.
        {' '}These measurements do not establish surface traction, obstacle clearance,
        {' '}astronaut safety, or corridor approval. The original Balanced Cost difficulty
        {' '}score remains a slope-derived proxy.
      </p>
    </section>
  );
}