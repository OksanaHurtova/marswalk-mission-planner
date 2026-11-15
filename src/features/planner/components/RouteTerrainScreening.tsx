import { useMemo } from 'react';
import type { RouteResult } from '../lib/routeResult';
import {
  analyzeRouteTerrain,
  describeVisualFactor,
} from '../lib/routeTerrainScreening';

type Props = {
  route: RouteResult | null;
};

const labelStyle = {
  margin: 0,
  fontSize: 12,
  color: '#b9cddd',
} as const;

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        minWidth: 165,
        padding: 14,
        borderRadius: 10,
        background: '#243444',
        border: '1px solid #4f667b',
      }}
    >
      <p style={labelStyle}>{title}</p>
      <strong style={{ display: 'block', marginTop: 7, fontSize: 22, color: '#edf7ff' }}>
        {value}
      </strong>
    </div>
  );
}

export default function RouteTerrainScreening({ route }: Props) {
  const result = useMemo(() => analyzeRouteTerrain(route), [route]);

  if (!result) return null;

  return (
    <section
      aria-labelledby="terrain-screening-heading"
      style={{
        marginTop: 24,
        padding: 18,
        border: '1px solid #537186',
        borderRadius: 12,
        background: '#132434',
        color: '#e9f3ff',
      }}
    >
      <h3 id="terrain-screening-heading" style={{ margin: '0 0 8px', fontSize: 22 }}>
        Terrain Screening — Selected Route
      </h3>

      <p style={{ margin: '0 0 16px', lineHeight: 1.6, color: '#ccdfed' }}>
        DTM evidence for the corridors used by this route. The surrounding terrain
        is sampled in a 10 m-wide strip (5 m on each side). A steep pixel near
        a line is a reason to inspect the area, not proof that the line crosses
        an obstacle.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Metric title="Route corridors" value={String(result.corridorCount)} />
        <Metric
          title="Corridors with nearby pixels >15°"
          value={`${result.nearbySteepPixelCorridorCount} / ${result.corridorCount}`}
        />
        <Metric
          title="Highest nearby pixel slope"
          value={result.maxNearbySlopeDeg === null
            ? 'N/A'
            : `${result.maxNearbySlopeDeg.toFixed(2)}°`}
        />
        <Metric
          title="High inspection priority"
          value={`${result.highReviewPriorityCount} / ${result.corridorCount}`}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#21384b' }}>
              {[
                'Corridor',
                'Length',
                'Model max cell',
                'Nearby max ±5 m',
                'Nearby pixels >15°',
                'Review',
              ].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  style={{ textAlign: 'left', padding: '12px 10px', whiteSpace: 'nowrap' }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.corridors.map((corridor) => (
              <tr
                key={corridor.edgeId}
                style={{ borderBottom: '1px solid #41596b' }}
              >
                <th scope="row" style={{ padding: '12px 10px', textAlign: 'left' }}>
                  {corridor.edgeId}
                  <div style={{ color: '#b9cddd', fontWeight: 400, fontSize: 11 }}>
                    {corridor.fromNodeId} → {corridor.toNodeId}
                  </div>
                </th>
                <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                  {corridor.lengthM.toFixed(1)} m
                </td>
                <td style={{ padding: '12px 10px' }}>
                  {corridor.modelMaxSampledCellSlopeDeg.toFixed(2)}°
                </td>
                <td style={{ padding: '12px 10px' }}>
                  {corridor.bufferMaxSlopeDeg.toFixed(2)}°
                </td>
                <td style={{ padding: '12px 10px', fontWeight: 700,
                  color: corridor.hasNearbyPixelsAbove15Deg ? '#ffcf86' : '#b8e2ce' }}>
                  {corridor.bufferPixelsAbove15DegPercent.toFixed(2)}%
                </td>
                <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                  {corridor.reviewPriority === 'HIGH'
                    ? 'HIGH — inspect'
                    : 'STANDARD — inspect'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
        <h4 style={{ margin: 0 }}>What still needs visual verification?</h4>
        {result.corridors.map((corridor) => (
          <details
            key={corridor.edgeId}
            style={{ padding: '9px 12px', border: '1px solid #3c5364', borderRadius: 8 }}
          >
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
              {corridor.edgeId} — {corridor.reviewPriority.toLowerCase()} review priority
              {corridor.hasNearbyPixelsAbove15Deg ? ' · nearby steep pixels' : ''}
            </summary>
            <p style={{ margin: '9px 0', color: '#d5e6f2', lineHeight: 1.6 }}>
              Check: {corridor.visualFactorsToCheck.map(describeVisualFactor).join('; ')}.
              These are inspection questions, not confirmed obstacles.
            </p>
            <p style={{ margin: 0, color: '#b9cddd', fontSize: 12 }}>
              Orthophoto review: pending. Buffer samples: {corridor.bufferValidPixels} valid
              of {corridor.bufferSampledPixels} pixels. The model recorded
              {' '}{corridor.modelBlockedCellCount} blocked grid cells for this corridor.
            </p>
          </details>
        ))}
      </div>

      <p
        style={{
          padding: 13,
          margin: '18px 0 0',
          borderRadius: 8,
          background: '#293745',
          fontSize: 12,
          lineHeight: 1.7,
          color: '#e0eaf5',
        }}
      >
        <strong>Research-only interpretation.</strong> The &gt;15° threshold is an
        experimental project comparison, NOT a NASA EVA safety standard. The
        percentages represent slope-raster pixels in the buffered area, NOT
        percentages of route distance or confirmed hazards. Centerline model
        cells and buffered-area pixels use different sampling methods.
        Orthophoto obstacles, footing, equipment limits and astronaut safety
        are not validated. The current Balanced Cost difficulty component is
        derived from slope and is not independent obstacle evidence.
        Source: team-derived HiRISE DTM slope raster, precomputed ±5 m screening.
      </p>
    </section>
  );
}
