import { useMemo } from 'react';
import {
  compareRouteCostModels,
} from '../lib/updatedDtmCost';

type Props = { selectedTargetId: string };

function formatNumber(value: number | null | undefined, decimals = 2): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toFixed(decimals)
    : 'Unavailable';
}

const cellStyle = {
  textAlign: 'left',
  padding: '11px 12px',
  borderBottom: '1px solid #40546a',
  verticalAlign: 'top',
} as const;

/**
 * Experimental comparison of two route cost models.
 * This component does not change which route is rendered on the map.
 * The original Balanced Cost recommendation remains the primary route.
 */
export default function UpdatedDtmCostComparison({ selectedTargetId }: Props) {
  const comparison = useMemo(() => compareRouteCostModels(), []);
  const selected = comparison.rows.find((row) => row.targetId === selectedTargetId);

  return (
    <section
      aria-labelledby="updated-dtm-heading"
      style={{
        marginTop: 24,
        border: '1px solid #587287',
        borderRadius: 12,
        padding: 20,
        background: '#132333',
        color: '#eaf4fd',
      }}
    >
      <h3 id="updated-dtm-heading" style={{ margin: '0 0 10px', fontSize: 22 }}>
        Route Cost Comparison — Updated DTM
      </h3>

      <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>
        Compare the existing 5×5-cell Balanced Cost model with a separate
        centerline-slope scenario based on 1-meter terrain measurements.
        The primary route on the Mars map is unchanged.
      </p>

      {comparison.status === 'UNAVAILABLE' && (
        <div
          role="alert"
          style={{
            border: '1px solid #f3bd75',
            borderRadius: 8,
            padding: 12,
          }}
        >
          <strong>
            Experimental comparison unavailable — GIS measurements are missing
            or inconsistent.
          </strong>
          <ul>
            {comparison.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          <p>Missing or invalid measurements are never treated as zero slope.</p>
        </div>
      )}

      <div
        style={{
          margin: '14px 0',
          padding: 13,
          background: '#22384a',
          borderRadius: 9,
        }}
      >
        {comparison.enabledGraphHasCycles ? (
          <p style={{ margin: 0 }}>
            Active graph contains a cycle. Different cost weights may affect
            route selection, depending on which alternatives connect the
            requested destinations.
          </p>
        ) : (
          <p style={{ margin: 0 }}>
            <strong>Why routes stay the same:</strong> the current{' '}
            {comparison.activeEdgeCount} enabled corridors form an acyclic graph.
            Each reachable target has only one active path from S; changing
            terrain costs cannot create an alternative. The P04 shortcut
            remains disabled.
          </p>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 680,
            fontSize: 13,
          }}
        >
          <thead style={{ background: '#233d52' }}>
            <tr>
              <th scope="col" style={cellStyle}>Destination</th>
              <th scope="col" style={cellStyle}>Baseline cost</th>
              <th scope="col" style={cellStyle}>Updated DTM cost</th>
              <th scope="col" style={cellStyle}>
                Distance (baseline / updated)
              </th>
              <th scope="col" style={cellStyle}>Path comparison</th>
            </tr>
          </thead>

          <tbody>
            {comparison.rows.map((row) => (
              <tr
                key={row.targetId}
                style={{
                  background:
                    row.targetId === selectedTargetId
                      ? '#24445e'
                      : 'transparent',
                }}
              >
                <th scope="row" style={cellStyle}>
                  {row.targetId}
                </th>

                <td style={cellStyle}>
                  {formatNumber(row.baseline?.balancedCost, 4)}
                </td>

                <td style={cellStyle}>
                  {formatNumber(row.updated?.balancedCost, 4)}
                </td>

                <td style={cellStyle}>
                  {formatNumber(row.baseline?.distanceM, 1)} /{' '}
                  {formatNumber(row.updated?.distanceM, 1)} m
                </td>

                <td style={cellStyle}>
                  {row.samePath === null
                    ? 'Unavailable'
                    : row.samePath
                      ? 'Same path'
                      : 'Different paths'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && comparison.status === 'READY' && (
        <div
          style={{
            marginTop: 14,
            padding: 13,
            border: '1px solid #415c73',
            borderRadius: 9,
          }}
        >
          <strong>Selected target: {selected.targetId}</strong>

          <p style={{ margin: '8px 0' }}>
            Baseline:{' '}
            {selected.baseline?.nodeIds.join(' → ') ?? 'Unavailable'}.
          </p>

          <p style={{ margin: '8px 0' }}>
            Updated DTM:{' '}
            {selected.updated?.nodeIds.join(' → ') ?? 'Unavailable'}.
          </p>

          <p style={{ margin: '8px 0' }}>
            Updated centerline mean slope on this route:{' '}
            {formatNumber(selected.updated?.meanSlopeDegrees)}°.
          </p>
        </div>
      )}

      <p
        style={{
          color: '#bdd0e0',
          fontSize: 12,
          lineHeight: 1.7,
          margin: '14px 0 0',
        }}
      >
        <strong>Methodology:</strong> {comparison.modelDescription} The
        experimental 15° reference is not a NASA EVA safety standard.
        Centerline measurement coverage refers to sampled positions along the
        route, not the full corridor width. In the updated scenario, a zero
        difficulty penalty is a neutralization of double-counted slope, not a
        measured zero hazard level.
      </p>
    </section>
  );
}