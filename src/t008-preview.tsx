import { createRoot } from 'react-dom/client';
import MarsMap from './features/explorer/MarsMap';
import { demoPoints } from './features/explorer/demoPoints';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Не знайдено контейнер React.');
}

createRoot(root).render(
  <main style={{ maxWidth: 1100, padding: 24, margin: '0 auto' }}>
    <h1>Marswalk Mission Planner</h1>
    <p>Athabasca Valles — квадрат №11 · 2500 × 2500 м</p>
    <MarsMap points={demoPoints} />
  </main>
);
