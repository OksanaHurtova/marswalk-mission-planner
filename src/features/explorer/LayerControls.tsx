import type { ChangeEvent } from 'react';
import SourceInfo from './SourceInfo';

export type MapLayerId = 'athabasca-base' | 'athabasca-slope';
export type LayerVisibility = Record<MapLayerId, boolean>;

type LayerControlsProps = {
  visible: LayerVisibility;
  onToggle: (layerId: MapLayerId, visible: boolean) => void;
  slopeTransparencyPercent: number;
  onSlopeTransparencyChange: (percent: number) => void;
};

const items: { id: MapLayerId; title: string; hint: string }[] = [
  {
    id: 'athabasca-base',
    title: 'HiRISE imagery',
    hint: 'Orthorectified image',
  },
  {
    id: 'athabasca-slope',
    title: 'Slope map (°)',
    hint: 'Derived from HiRISE DTM',
  },
];

export default function LayerControls({ visible, onToggle, slopeTransparencyPercent, onSlopeTransparencyChange }: LayerControlsProps) {
  const change = (id: MapLayerId) => (event: ChangeEvent<HTMLInputElement>) => {
    onToggle(id, event.target.checked);
  };

  const handleTransparency = (event: ChangeEvent<HTMLInputElement>) => {
    onSlopeTransparencyChange(Number(event.currentTarget.value));
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
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: '0 4px 16px rgba(0,0,0,.2)',
      }}
    >
      <legend style={{ padding: '0 5px', fontWeight: 700 }}>Map layers</legend>
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
      <div style={{ borderTop: '1px solid #475569', paddingTop: 10, marginTop: 3, marginBottom: 10 }}>
        <label htmlFor="slope-transparency" style={{ display: 'block', fontWeight: 700, marginBottom: 5 }}>
          Slope transparency: {slopeTransparencyPercent}%
        </label>
        <input
          id="slope-transparency"
          type="range"
          min={0}
          max={100}
          step={5}
          value={slopeTransparencyPercent}
          disabled={!visible['athabasca-slope']}
          onChange={handleTransparency}
          style={{ display: 'block', width: '100%', accentColor: '#ffbd55', cursor: visible['athabasca-slope'] ? 'pointer' : 'not-allowed' }}
        />
        <small style={{ display: 'block', color: '#cbd5e1', marginTop: 4, lineHeight: 1.4 }}>
          0% = fully visible slope; 100% = invisible. Display only.
        </small>
      </div>
      <div style={{ borderTop: '1px solid #475569', paddingTop: 8, color: '#cbd5e1', fontSize: 11, lineHeight: 1.5 }}>
        <strong style={{ color: '#fff' }}>Slope:</strong>
        <div><span style={{ color: '#2d9e99' }}>■</span> 0–5° · <span style={{ color: '#ecc74e' }}>■</span> 5–10°</div>
        <div><span style={{ color: '#f78535' }}>■</span> 10–15° · <span style={{ color: '#de4041' }}>■</span> over 15°</div>
        <div>15° is an experimental reference, not a NASA EVA limit.</div>
      </div>
      <SourceInfo visible={visible} />
    </fieldset>
  );
}
