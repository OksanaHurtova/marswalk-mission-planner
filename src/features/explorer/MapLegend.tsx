import { getMapLegendItems, type MapLegendItem } from './mapLegendItems';

type Props = {
  hasRoute: boolean;
  selectedTargetId?: string | null;
};

function LegendSymbol({ item }: { item: MapLegendItem }) {
  if (item.shape === 'dashed-line') {
    return <span aria-hidden="true" style={{ display: 'inline-block', width: 25, height: 0, borderTop: `4px dashed ${item.color}`, flexShrink: 0 }} />;
  }
  if (item.shape === 'diamond') {
    return <span aria-hidden="true" style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #0b2431', transform: 'rotate(45deg)', backgroundColor: item.color, margin: 4, flexShrink: 0 }} />;
  }
  return <span aria-hidden="true" style={{ display: 'inline-block', width: item.id === 'selected' ? 17 : 13, height: item.id === 'selected' ? 17 : 13, borderRadius: '50%', border: '2px solid #18202a', backgroundColor: item.color, flexShrink: 0 }} />;
}

/** Map symbol key is a sidebar card, never an overlay on top of the layers panel. */
export default function MapLegend({ hasRoute, selectedTargetId = null }: Props) {
  const items = getMapLegendItems(hasRoute, selectedTargetId);
  return (
    <section
      aria-label="Map legend"
      style={{
        width: '100%',
        padding: '14px 15px',
        border: '1px solid #344459',
        borderRadius: 12,
        background: '#15202e',
        color: '#f1f5f9',
        font: '12px system-ui, sans-serif',
      }}
    >
      <strong style={{ display: 'block', marginBottom: 12, fontSize: 13, letterSpacing: '.02em' }}>Map legend</strong>
      {items.map((item) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 9, minHeight: 25, marginBottom: 5 }}>
          <span style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LegendSymbol item={item} />
          </span>
          <span>{item.label}</span>
        </div>
      ))}
      <small style={{ display: 'block', color: '#9fb0c4', lineHeight: 1.5, borderTop: '1px solid #334155', paddingTop: 9, marginTop: 10 }}>
        Scale bar: local metres. Routes are research candidates, not approved EVA traverses.
      </small>
    </section>
  );
}
