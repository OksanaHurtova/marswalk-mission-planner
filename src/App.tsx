import MarsMap from "./features/explorer/MarsMap";
import MissionMapConnector from "./features/planner/components/MissionMapConnector";

const globalStyles = `
  :root {
    font-family: Inter, system-ui, Arial, sans-serif;
    color: #e8eef6;
    background: #0c1420;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    width: 100%;
    max-width: none;
    min-height: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    display: block;
    min-width: 320px;
    min-height: 100vh;
    background: #0c1420;
  }

  #root {
    text-align: left;
  }

  a {
    color: #8bd1ff;
  }

  a:hover {
    color: #c7eaff;
  }
`;

function App() {
  return (
    <>
      <style>{globalStyles}</style>

      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "#0c1420",
          color: "#e8eef6",
        }}
      >
        <header
          style={{
            padding: "30px 20px",
            borderBottom: "1px solid #344254",
            background: "#131e2c",
          }}
        >
          <div
            style={{
              maxWidth: 1320,
              margin: "0 auto",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2,
                color: "#80c9ff",
              }}
            >
              NASA SPACE APPS CHALLENGE
            </p>

            <h1
              style={{
                margin: "0 0 12px",
                fontSize: "clamp(28px, 4vw, 44px)",
                lineHeight: 1.15,
              }}
            >
              Marswalk Mission Planner
            </h1>

            <p
              style={{
                margin: "0 0 8px",
                lineHeight: 1.7,
                maxWidth: 850,
                color: "#b8c9db",
              }}
            >
              Explore real Martian terrain, investigate
              science targets, and plan experimental
              routes using NASA HiRISE elevation data.
            </p>

            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#91a8bf",
              }}
            >
              Athabasca Valles — Candidate 11
              {" | "}
              2.5 × 2.5 km
              {" | "}
              Equirectangular MARS
            </p>
          </div>
        </header>

        <main
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "30px 20px 50px",
          }}
        >
          <MissionMapConnector
            MapComponent={MarsMap}
          />
        </main>

        <footer
          style={{
            borderTop: "1px solid #344254",
            background: "#131e2c",
            padding: "24px 20px",
          }}
        >
          <div
            style={{
              maxWidth: 1320,
              margin: "0 auto",
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 13,
                color: "#d1deec",
              }}
            >
              Marswalk Mission Planner — Research Prototype
            </p>

            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "#91a8bf",
                lineHeight: 1.6,
              }}
            >
              Terrain imagery and elevation data:
              NASA HiRISE / JPL / University of Arizona.
              All science locations and route corridors
              are preliminary. Experimental routing is
              not an approved EVA safety assessment.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
