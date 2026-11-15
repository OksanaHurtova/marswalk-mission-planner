import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import MarsMap from './features/explorer/MarsMap';
import { demoPoints } from './features/explorer/demoPoints';
import { experimentalRoutesFromAnia } from './features/explorer/experimentalRoutesFromAnia';

type Target = keyof typeof experimentalRoutesFromAnia;
const targetIds: Target[] = ['P01', 'P02', 'P03', 'P04'];

function RoutePreview() {
  const [selected, setSelected] = useState<Target>('P04');
  function changeTarget(pointId: string) {
    if (targetIds.includes(pointId as Target)) setSelected(pointId as Target);
  }

  return (
    <main style={{ maxWidth: 1100, padding: 24, margin: '0 auto' }}>
      <h1>Marswalk — T-012 RouteOverlay</h1>
      <p>Athabasca Valles · candidate 11 · experimental corridors from Ania's network.json</p>
      <p style={{ color: '#ffbd55' }}>
        Research prototype: these corridors are NOT approved astronaut EVA routes.
      </p>
      <nav aria-label="Choose experimental route" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {targetIds.map((id) => (
          <button key={id} onClick={() => setSelected(id)} type="button"
            style={{ padding: '8px 12px', background: selected === id ? '#00dcff' : '#334155', color: selected === id ? '#111827' : '#fff' }}>
            S → {id}
          </button>
        ))}
      </nav>
      <MarsMap
        points={demoPoints}
        selectedTargetId={selected}
        routeGeometry={experimentalRoutesFromAnia[selected]}
        onSelectTarget={changeTarget}
      />
      <p role="status">Displayed experimental route: S → {selected}. Clicking POI selects the route.</p>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('React mount element is missing');
createRoot(root).render(<RoutePreview />);
