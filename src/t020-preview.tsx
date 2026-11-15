import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import MarsMap from './features/explorer/MarsMap';
import TerrainDetails from './features/explorer/TerrainDetails';
import { previewEdgeIdsForTarget } from './features/explorer/terrainDetailsData';
import { demoPoints } from './features/explorer/demoPoints';
import { experimentalRoutesFromAnia } from './features/explorer/experimentalRoutesFromAnia';
import './MarswalkPreview.css';

type Target = keyof typeof experimentalRoutesFromAnia;
const targetIds: Target[] = ['P01', 'P02', 'P03', 'P04'];

function T020Preview() {
  const [selected, setSelected] = useState<Target>('P04');
  const edgeIds = previewEdgeIdsForTarget(selected);
  return (
    <main className="marswalk-page">
      <header className="marswalk-header">
        <div>
          <div className="marswalk-kicker">Marswalk / Mission Planner</div>
          <h1>Explore Athabasca Valles</h1>
          <p className="marswalk-subtitle">HiRISE terrain imagery · Science destinations · Measured route segments</p>
        </div>
        <span className="marswalk-status">Research prototype · Not EVA certified</span>
      </header>
      <nav aria-label="Choose destination" className="marswalk-toolbar">
        <span className="marswalk-toolbar-label">DESTINATION</span>
        {targetIds.map((target) => (
          <button key={target} type="button" className="marswalk-route-button" aria-pressed={selected === target} onClick={() => setSelected(target)}>
            S → {target}
          </button>
        ))}
      </nav>
      <MarsMap points={demoPoints} selectedTargetId={selected} routeGeometry={experimentalRoutesFromAnia[selected]}
        onSelectTarget={(id) => { if (targetIds.includes(id as Target)) setSelected(id as Target); }} />
      <div className="marswalk-metrics">
        <TerrainDetails edgeIds={edgeIds} title={`Terrain details · S → ${selected}`} />
      </div>
      <details className="marswalk-preview-notes">
        <summary>About this route preview and data limitations</summary>
        <p>
          The route in this preview follows the uniquely connected experimental corridor graph.
          In the integrated application, TerrainDetails must receive the exact RouteResult.edgeIds from the planner.
          These are measured research corridors, not NASA-approved astronaut EVA routes.
        </p>
      </details>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('React root not found');
createRoot(root).render(<T020Preview />);
