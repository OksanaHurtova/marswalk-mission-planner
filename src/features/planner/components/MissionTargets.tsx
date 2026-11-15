import {
  CANDIDATE_SCIENCE_TARGETS,
  SCIENCE_SOURCES,
} from "../data/candidateScienceTargets";

import type {
  ScienceTargetId,
} from "../data/candidateScienceTargets";

import preliminaryData from "../data/sciencePoints_preliminary.json";

type MissionTargetsProps = {
  selectedId: ScienceTargetId;
  onSelect: (id: ScienceTargetId) => void;
};

const PANEL_BORDER = "1px solid #596575";

const accents: Record<ScienceTargetId, string> = {
  P01: "#7cc1f5",
  P02: "#80d8b1",
  P03: "#f2aa91",
  P04: "#e4ca7b",
};

export default function MissionTargets({
  selectedId,
  onSelect,
}: MissionTargetsProps) {
  const selected =
    CANDIDATE_SCIENCE_TARGETS.find(
      (target) => target.id === selectedId
    ) ?? CANDIDATE_SCIENCE_TARGETS[0];

  const preliminaryPoint = preliminaryData.points.find(
    (point) => point.id === selected.id
  );

  const selectedAccent = accents[selected.id];

  return (
    <section
      aria-labelledby="mission-targets-heading"
      style={{
        marginBottom: 34,
        padding: 20,
        border: PANEL_BORDER,
        borderRadius: 14,
        textAlign: "left",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <h2
            id="mission-targets-heading"
            style={{ margin: "0 0 8px" }}
          >
            Science Mission Targets
          </h2>

          <p
            style={{
              margin: "0 0 18px",
              lineHeight: 1.6,
            }}
          >
            Explore four candidate science stops
            within the Athabasca Valles study area.
            Select a target to inspect its scientific
            purpose, preliminary location, proposed
            astronaut activities, and required
            terrain measurements.
          </p>
        </div>

        <span
          style={{
            padding: "7px 10px",
            fontSize: 12,
            borderRadius: 999,
            background: "#2c3440",
            color: "#e0e7ef",
          }}
        >
          4 science targets · 2.5 × 2.5 km
        </span>
      </div>

      <div
        aria-label="Choose a candidate science target"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 215px), 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {CANDIDATE_SCIENCE_TARGETS.map((target) => {
          const active = target.id === selected.id;
          const accent = accents[target.id];

          return (
            <button
              key={target.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(target.id)}
              style={{
                minWidth: 0,
                minHeight: 152,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 11,
                padding: 16,
                borderRadius: 12,
                border: active
                  ? `2px solid ${accent}`
                  : PANEL_BORDER,
                background: active
                  ? "#253344"
                  : "#1c242e",
                color: "#f2f5fa",
                textAlign: "left",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  color: accent,
                  fontSize: 13,
                  letterSpacing: 0.5,
                }}
              >
                SCIENCE STOP {target.id.slice(1)}
              </span>

              <strong
                style={{
                  fontSize: 16,
                  lineHeight: 1.3,
                }}
              >
                {target.name}
              </strong>

              <span
                style={{
                  fontSize: 12,
                  opacity: 0.85,
                }}
              >
                {target.category}
              </span>

              <span
                style={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  opacity: 0.9,
                }}
              >
                {target.summary}
              </span>

              <span
                style={{
                  fontSize: 11,
                  color: accent,
                  marginTop: "auto",
                }}
              >
                Preliminary location
              </span>
            </button>
          );
        })}
      </div>

      <article
        aria-live="polite"
        aria-label={`Details for ${selected.id}`}
        style={{
          border: `1px solid ${selectedAccent}`,
          borderRadius: 12,
          padding: 20,
          background: "#19222d",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <h3 style={{ margin: 0 }}>
            Science Stop {selected.id.slice(1)}
            {" — "}
            {selected.name}
          </h3>

          <span
            style={{
              color: selectedAccent,
              fontSize: 13,
            }}
          >
            Preliminary QGIS location
          </span>
        </div>

        {preliminaryPoint ? (
          <section
            aria-label="Preliminary QGIS coordinates"
            style={{
              padding: 16,
              marginTop: 20,
              marginBottom: 20,
              borderRadius: 10,
              border: PANEL_BORDER,
              background: "#243040",
            }}
          >
            <h4
              style={{
                marginTop: 0,
                marginBottom: 12,
              }}
            >
              Preliminary QGIS Location
            </h4>

            <p
              style={{
                marginTop: 0,
                fontSize: 13,
                opacity: 0.85,
              }}
            >
              Study area: Athabasca Valles
              <br />
              Coordinate system:
              Equirectangular MARS
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 170px), 1fr))",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.75,
                  }}
                >
                  Local X
                </div>

                <strong>
                  {preliminaryPoint.localXY_m[0].toFixed(2)} m
                </strong>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.75,
                  }}
                >
                  Local Y
                </div>

                <strong>
                  {preliminaryPoint.localXY_m[1].toFixed(2)} m
                </strong>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.75,
                  }}
                >
                  Projected X
                </div>

                <strong>
                  {preliminaryPoint.projectedXY_m[0]} m
                </strong>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.75,
                  }}
                >
                  Projected Y
                </div>

                <strong>
                  {preliminaryPoint.projectedXY_m[1]} m
                </strong>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: PANEL_BORDER,
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              <p style={{ margin: "0 0 8px" }}>
                <strong>Elevation: </strong>
                {preliminaryPoint.elevationM === null
                  ? "Pending DTM measurement"
                  : `${preliminaryPoint.elevationM} m`}
              </p>

              <p style={{ margin: "0 0 8px" }}>
                <strong>Local slope: </strong>
                {preliminaryPoint.slopeDeg === null
                  ? "Pending DTM measurement"
                  : `${preliminaryPoint.slopeDeg}°`}
              </p>

              <p style={{ margin: 0 }}>
                <strong>Location status: </strong>
                {preliminaryPoint.status}
              </p>
            </div>

            <p
              style={{
                fontSize: 12,
                lineHeight: 1.5,
                opacity: 0.8,
                marginBottom: 0,
                marginTop: 14,
              }}
            >
              These coordinates were supplied by
              the team's QGIS analysis. They are
              preliminary and may change after
              DTM slope and accessibility checks.
              They are not NASA-published
              field-station coordinates.
            </p>
          </section>
        ) : (
          <p
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 8,
              background: "#2b3441",
            }}
          >
            No preliminary coordinates are
            available for this science target.
          </p>
        )}

        <p style={{ lineHeight: 1.6 }}>
          <strong>Scientific objective: </strong>
          {selected.scientificObjective}
        </p>

        <p style={{ lineHeight: 1.6 }}>
          <strong>Visible orbital evidence: </strong>
          {selected.visibleEvidence}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: 22,
          }}
        >
          <div>
            <h4 style={{ marginBottom: 8 }}>
              Proposed astronaut activities
            </h4>

            <ul
              style={{
                paddingLeft: 20,
                lineHeight: 1.65,
              }}
            >
              {selected.astronautActivities.map(
                (activity) => (
                  <li key={activity}>
                    {activity}
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: 8 }}>
              DTM measurements needed
            </h4>

            <ul
              style={{
                paddingLeft: 20,
                lineHeight: 1.65,
              }}
            >
              {selected.dtmMeasurements.map(
                (measurement) => (
                  <li key={measurement}>
                    {measurement}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <p
          style={{
            lineHeight: 1.6,
            fontSize: 14,
            opacity: 0.9,
          }}
        >
          <strong>
            What is not yet confirmed:{" "}
          </strong>
          {selected.limitation}
        </p>

        <div style={{ marginTop: 14 }}>
          <strong>
            Data and scientific context:
          </strong>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 9,
            }}
          >
            {selected.sourceIds.map(
              (sourceId) => (
                <a
                  key={sourceId}
                  href={SCIENCE_SOURCES[sourceId].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#8bd1ff",
                    fontSize: 13,
                  }}
                >
                  {SCIENCE_SOURCES[sourceId].label}
                </a>
              )
            )}
          </div>
        </div>

        <p
          style={{
            marginTop: 18,
            padding: 12,
            borderRadius: 8,
            background: "#2b3441",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <strong>
            Mission planning status:
          </strong>{" "}
          This science stop has a preliminary
          mapped location within the Athabasca Valles study area.
          Final elevations, slopes, observation
          stations, and route accessibility
          require GIS validation.

          The mock route planner below is
          not geographically linked to these
          science stops.
        </p>

        <a
          href="#terrain-explorer-heading"
          style={{ color: "#8bd1ff" }}
        >
          Inspect the wider HiRISE/DTM scene
        </a>
      </article>
    </section>
  );
}
