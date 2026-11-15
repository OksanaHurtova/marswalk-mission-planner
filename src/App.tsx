import MissionMapConnector from './features/planner/components/MissionMapConnector';
import AtlasMapView from './ares-atlas/AtlasMapView';
import './ares-atlas/Atlas.css';

/** Presentation-only entry point. All research data and routing remain in planner. */
function App() {
  return (
    <div className="aa-app" id="top">
      <div className="aa-masthead">
        <div className="aa-shell aa-masthead-row">
          <span>MARSWALK / FIELD ATLAS</span>
          <span>NASA HI<span aria-hidden="true">·</span>RISE TERRAIN RESEARCH</span>
        </div>
      </div>

      <header className="aa-header aa-shell">
        <a className="aa-brand" href="#top" aria-label="Ares Atlas — back to top">
          <span className="aa-brand-symbol" aria-hidden="true">✳</span>
          <span className="aa-brand-text">
            <strong>Ares Atlas</strong>
            <small>MARSWALK / MISSION PLANNER</small>
          </span>
        </a>
        <nav className="aa-nav" aria-label="Atlas sections">
          <a href="#atlas-map"><span>01</span> Explore</a>
          <a href="#mission-targets-heading"><span>02</span> Targets</a>
          <a href="#experimental-route-heading"><span>03</span> Analyze</a>
          <a href="#atlas-sources"><span>04</span> Sources</a>
        </nav>
        <span className="aa-prototype">RESEARCH PROTOTYPE</span>
      </header>

      <main className="aa-main aa-shell">
        <section className="aa-intro" aria-label="Mission introduction">
          <div className="aa-intro-title">
            <p className="aa-eyebrow">MARS / ATHABASCA VALLES</p>
            <h1>Read the terrain.<br /><em>Plan the traverse.</em></h1>
          </div>
          <div className="aa-intro-description">
            <p className="aa-panel-eyebrow">THE EXPEDITION</p>
            <p>Plan experimental traverses across real Martian terrain. Explore four preliminary science destinations and compare terrain evidence from NASA orbital data.</p>
          </div>
          <div className="aa-intro-index">
            <p className="aa-panel-eyebrow">FIELD RECORD</p>
            <div><span>STUDY AREA</span><strong>Athabasca Valles</strong></div>
            <div><span>MAP EXTENT</span><strong>2.5 × 2.5 km</strong></div>
            <div><span>REFERENCE</span><strong>HiRISE / MRO</strong></div>
          </div>
        </section>

        <MissionMapConnector MapComponent={AtlasMapView} />
      </main>

      <footer className="aa-footer">
        <div className="aa-shell aa-footer-grid">
          <div><strong>ARES ATLAS</strong><span> / MARSWALK MISSION PLANNER</span></div>
          <p>NASA HiRISE / JPL / University of Arizona. Regional context: Mars Odyssey / THEMIS via USGS.</p>
          <small>EXPERIMENTAL RESEARCH ONLY — NOT AN APPROVED EVA SAFETY ASSESSMENT</small>
        </div>
      </footer>
    </div>
  );
}

export default App;
