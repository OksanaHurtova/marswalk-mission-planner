import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import MarsMap from './features/explorer/MarsMap';
import TerrainDetails from './features/explorer/TerrainDetails';
import { previewEdgeIdsForTarget } from './features/explorer/terrainDetailsData';
import { demoPoints } from './features/explorer/demoPoints';
import { experimentalRoutesFromAnia } from './features/explorer/experimentalRoutesFromAnia';

type Target = keyof typeof experimentalRoutesFromAnia;
const targetIds: Target[] = ['P01', 'P02', 'P03', 'P04'];

function T020Preview() {
  const [selected, setSelected] = useState<Target>('P04');
  const edgeIds = previewEdgeIdsForTarget(selected);
  return (
    <main style={{ maxWidth: 1100, padding: 24, margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#f8fafc' }}>
      <h1>Marswalk · T-020 Terrain Details</h1>
      <p>Athabasca Valles · реальні вимірювання T-016 для сегментів тестового маршруту</p>
      <p style={{ color: '#fcd34d' }}>Експериментальний прототип — маршрути не схвалені NASA для EVA.</p>
      <nav aria-label="Оберіть маршрут" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        {targetIds.map((target) => (
          <button key={target} type="button" onClick={() => setSelected(target)}
            style={{ border: 0, borderRadius: 6, padding: '9px 14px', cursor: 'pointer', background: selected === target ? '#00dcff' : '#334155', color: selected === target ? '#10202b' : '#fff' }}>
            S → {target}
          </button>
        ))}
      </nav>
      <MarsMap points={demoPoints} selectedTargetId={selected} routeGeometry={experimentalRoutesFromAnia[selected]}
        onSelectTarget={(id) => { if (targetIds.includes(id as Target)) setSelected(id as Target); }} />
      <div style={{ marginTop: 18 }}>
        <TerrainDetails edgeIds={edgeIds} title={`Рельєф · маршрут S → ${selected}`} />
      </div>
      <p style={{ color: '#94a3b8', fontSize: 12 }}>
        T-020 preview: список сегментів відновлено лише зі збереженого однозначного дерева T-016 для демонстрації.
        У спільному застосунку потрібно передавати <code>RouteResult.edgeIds</code> безпосередньо від планувальника Ані.
      </p>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('React root not found');
createRoot(root).render(<T020Preview />);
