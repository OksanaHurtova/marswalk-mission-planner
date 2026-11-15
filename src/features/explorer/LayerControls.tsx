import type { ChangeEvent } from 'react';

export type MapLayerId = 'athabasca-base' | 'athabasca-slope';
export type LayerVisibility = Record<MapLayerId, boolean>;

type LayerControlsProps = {
  visible: LayerVisibility;
  onToggle: (layerId: MapLayerId, visible: boolean) => void;
};

const items: { id: MapLayerId; title: string; hint: string }[] = [
  {
    id: 'athabasca-base',
    title: 'Оптичний HiRISE',
    hint: 'Ортофотознімок',
  },
  {
    id: 'athabasca-slope',
    title: 'Карта нахилів (°)',
    hint: 'Похідний рельєфний шар DTM',
  },
];

export default function LayerControls({ visible, onToggle }: LayerControlsProps) {
  const change = (id: MapLayerId) => (event: ChangeEvent<HTMLInputElement>) => {
    onToggle(id, event.target.checked);
  };

  return (
    <fieldset
      style={{
        margin: 0,
        padding: '12px 14px',
        border: '1px solid #64748b',
        borderRadius: 8,
        background: 'rgba(18, 24, 32, 0.94)',
        color: '#fff',
        font: '13px system-ui, sans-serif',
        width: 225,
        boxSizing: 'border-box',
        boxShadow: '0 4px 16px rgba(0,0,0,.2)',
      }}
    >
      <legend style={{ padding: '0 5px', fontWeight: 700 }}>Шари карти</legend>
      {items.map((item) => (
        <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={visible[item.id]}
            onChange={change(item.id)}
            style={{ marginTop: 3, accentColor: '#ffbd55' }}
          />
          <span>
            <strong style={{ display: 'block', lineHeight: 1.4 }}>{item.title}</strong>
            <small style={{ display: 'block', color: '#cbd5e1', lineHeight: 1.35 }}>{item.hint}</small>
          </span>
        </label>
      ))}
      <div style={{ borderTop: '1px solid #475569', paddingTop: 8, color: '#cbd5e1', fontSize: 11, lineHeight: 1.5 }}>
        <strong style={{ color: '#fff' }}>Нахил:</strong>
        <div><span style={{ color: '#2d9e99' }}>■</span> 0–5° · <span style={{ color: '#ecc74e' }}>■</span> 5–10°</div>
        <div><span style={{ color: '#f78535' }}>■</span> 10–15° · <span style={{ color: '#de4041' }}>■</span> понад 15°</div>
        <div>15° — дослідницький поріг, не норма NASA.</div>
      </div>
    </fieldset>
  );
}
