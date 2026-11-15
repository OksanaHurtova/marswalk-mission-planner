import { useState } from "react";

import orthophoto from "../../../assets/athabasca-ortho.jpg";
import colorAltimetry from "../../../assets/athabasca-dtm.jpg";
import shadedRelief from "../../../assets/athabasca-relief.jpg";

type TerrainMode = "orthophoto" | "altimetry" | "relief";

type TerrainView = {
  id: TerrainMode;
  label: string;
  title: string;
  src: string;
  alt: string;
  description: string;
  scientificUse: string;
  limitation: string;
};

const terrainViews: TerrainView[] = [
  {
    id: "orthophoto",
    label: "HiRISE Orthophoto",
    title: "Surface morphology",
    src: orthophoto,
    alt: "Grayscale HiRISE orthophoto of the Athabasca Valles distributary channel",
    description:
      "An actual orbital image showing channel boundaries, surface lineations, and contrasting textures.",
    scientificUse:
      "Inspect visible landforms and identify candidate observation sites for field investigation.",
    limitation:
      "Image brightness and shadows alone do not establish slope, terrain safety, or rock composition.",
  },
  {
    id: "altimetry",
    label: "Color Altimetry",
    title: "Elevation context",
    src: colorAltimetry,
    alt: "NASA HiRISE digital terrain model color altimetry of the Athabasca Valles channel",
    description:
      "A color rendering of the HiRISE elevation model. Cool colors indicate lower terrain and warm colors indicate higher terrain in this visualization.",
    scientificUse:
      "Compare the relative elevation of the channel floor, margins, and adjacent surfaces.",
    limitation:
      "Precise point elevations and route slopes must be calculated from the original numeric DTM in GIS.",
  },
  {
    id: "relief",
    label: "Shaded Relief",
    title: "Terrain shape",
    src: shadedRelief,
    alt: "Shaded relief rendering derived from the HiRISE digital terrain model of Athabasca Valles",
    description:
      "An artificially illuminated view of the elevation model, highlighting scarps, ridges, and changes in terrain shape.",
    scientificUse:
      "Inspect channel margins and rough terrain before proposing candidate traverse corridors.",
    limitation:
      "The illumination is simulated; shaded relief is not a direct photograph or a quantitative slope map.",
  },
];

const buttonStyle = {
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid #708096",
  cursor: "pointer",
} as const;

export default function TerrainExplorer() {
  const [mode, setMode] = useState<TerrainMode>("orthophoto");
  const [zoom, setZoom] = useState(1);

  const view = terrainViews.find((item) => item.id === mode) ?? terrainViews[0];

  function selectMode(nextMode: TerrainMode) {
    setMode(nextMode);
    setZoom(1);
  }

  return (
    <section
      aria-labelledby="terrain-explorer-heading"
      style={{
        marginBottom: 34,
        padding: 20,
        border: "1px solid #596575",
        borderRadius: 14,
        textAlign: "left",
      }}
    >
      <h2 id="terrain-explorer-heading" style={{ marginTop: 0 }}>
        Interactive Terrain Explorer
      </h2>

      <p style={{ lineHeight: 1.6 }}>
        Explore three views of the same HiRISE/DTM study scene in
        Athabasca Valles. Select a layer and zoom in to inspect landforms.
      </p>

      <div
        aria-label="Terrain visualization mode"
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}
      >
        {terrainViews.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={mode === item.id}
            onClick={() => selectMode(item.id)}
            style={{
              ...buttonStyle,
              background: mode === item.id ? "#235f8b" : "#232a33",
              color: "#ffffff",
              borderColor: mode === item.id ? "#80c5f0" : "#596575",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            aria-label="Zoom out"
            disabled={zoom <= 1}
            onClick={() => setZoom((value) => Math.max(1, value - 0.5))}
            style={buttonStyle}
          >
            −
          </button>
          <span style={{ minWidth: 62, textAlign: "center" }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            disabled={zoom >= 4}
            onClick={() => setZoom((value) => Math.min(4, value + 0.5))}
            style={buttonStyle}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            style={buttonStyle}
          >
            Reset
          </button>
        </div>
        <a href={view.src} target="_blank" rel="noreferrer">
          Open image in a new tab
        </a>
      </div>

      <div
        aria-label={`${view.label} image viewer`}
        style={{
          width: "100%",
          height: 490,
          overflow: "auto",
          background: "#0d1016",
          border: "1px solid #3c4653",
          borderRadius: 10,
          textAlign: "center",
        }}
      >
        <img
          key={mode}
          src={view.src}
          alt={view.alt}
          style={{
            display: "inline-block",
            height: `${zoom * 490}px`,
            maxWidth: "none",
            width: "auto",
            verticalAlign: "top",
          }}
        />
      </div>

      <p style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
        Zoom in to inspect details. Scroll inside the image viewer to explore
        different parts of the scene.
      </p>

      <div style={{ marginTop: 18, display: "grid", gap: 8 }}>
        <h3 style={{ margin: 0 }}>{view.title}</h3>
        <p style={{ margin: 0 }}><strong>What it shows:</strong> {view.description}</p>
        <p style={{ margin: 0 }}><strong>Scientific use:</strong> {view.scientificUse}</p>
        <p style={{ margin: 0 }}><strong>Limitation:</strong> {view.limitation}</p>
      </div>

      <p style={{ marginTop: 20, fontSize: 13, opacity: 0.82 }}>
        Source: NASA/JPL/University of Arizona, HiRISE ESP_035191_1880;
        DTM DTEEC_035191_1880_036457_1880_A01. {" "}
        <a
          href="https://www.uahirise.org/dtm/ESP_035191_1880"
          target="_blank"
          rel="noreferrer"
        >
          Official HiRISE DTM dataset
        </a>
        .
      </p>
      <p
        style={{
          marginBottom: 0,
          padding: 12,
          borderRadius: 8,
          background: "#232a33",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        <strong>Data scope:</strong> These are scene-level image previews, not
        georeferenced route overlays. Science POIs, the final 2.5 × 2.5 km ROI,
        and route geometry remain pending GIS validation. The planner below
        still uses a separate mock network.
      </p>
    </section>
  );
}
