import { useMemo, useState } from "react";
import type { ComponentType } from "react";

import MissionTargets from "./MissionTargets";

import {
  CANDIDATE_SCIENCE_TARGETS,
} from "../data/candidateScienceTargets";

import type {
  ScienceTargetId,
} from "../data/candidateScienceTargets";

import sciencePoints from "../data/sciencePoints.json";
import startPointData from "../data/startPoint_preliminary.json";
import network from "../data/network.json";

import { recommendRoute } from "../lib/recommendRoute";
import {
  explainCorridorDifficulty,
} from "../lib/corridorDifficultyReview";

type XY = [number, number];

type MapPoint = {
  id: string;
  name: string;
  localXY_m: XY;
  status?: string;
};

type CompatibleMarsMapProps = {
  points?: MapPoint[];
  onSelectTarget?: (pointId: string) => void;
  selectedTargetId?: ScienceTargetId;
  routeGeometry?: XY[];
};

type MissionMapConnectorProps = {
  MapComponent: ComponentType<CompatibleMarsMapProps>;
};

const START_NODE_ID = "S";

const startMapPoint: MapPoint = {
  id: startPointData.id,
  name: startPointData.name,
  localXY_m: [
    startPointData.localXY_m[0],
    startPointData.localXY_m[1],
  ],
  status: startPointData.status,
};

const scienceMapPoints: MapPoint[] =
  sciencePoints.points.map((point) => ({
    id: point.id,
    name: point.name,
    localXY_m: [
      point.localXY_m[0],
      point.localXY_m[1],
    ],
    status: point.locationStatus,
  }));

const mapPoints: MapPoint[] = [
  startMapPoint,
  ...scienceMapPoints,
];

const locationHints: Record<string, string> = {
  S: "Upper-left central area",
  P01: "Lower-left area",
  P02: "Upper-left area",
  P03: "Near the center",
  P04: "Right side",
};

function isScienceTargetId(
  id: string
): id is ScienceTargetId {
  return CANDIDATE_SCIENCE_TARGETS.some(
    (target) => target.id === id
  );
}

export default function MissionMapConnector({
  MapComponent,
}: MissionMapConnectorProps) {
  const [selectedId, setSelectedId] =
    useState<ScienceTargetId>("P01");

  const recommendation = useMemo(
    () =>
      recommendRoute(
        network,
        START_NODE_ID,
        selectedId,
        true
      ),
    [selectedId]
  );

  const route = recommendation.route;

  const routeGeometry: XY[] =
    route?.geometry ?? [];

  function handleMapSelection(pointId: string) {
    if (isScienceTargetId(pointId)) {
      setSelectedId(pointId);
    }
  }

  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gap: 24,
      }}
    >
      <section aria-label="Interactive Mars mission map">
        <h2>Mission Area — Candidate 11</h2>

        <p style={{ lineHeight: 1.6 }}>
          Select a science target on the map
          or in the legend below to explore
          its scientific objectives and
          experimental route from S.
        </p>

        <MapComponent
          points={mapPoints}
          onSelectTarget={handleMapSelection}
          selectedTargetId={selectedId}
          routeGeometry={routeGeometry}
        />

        <div
          aria-label="Mission map legend"
          style={{
            marginTop: 16,
            padding: 18,
            border: "1px solid #536478",
            borderRadius: 12,
            background: "#172331",
          }}
        >
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: 20,
            }}
          >
            Map Legend — Mission Locations
          </h3>

          <p
            style={{
              margin: "0 0 16px",
              color: "#bdcbdb",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Orange markers identify the mission
            start and four science targets.
            Select a destination below to update
            the science details and route summary.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            <div
              style={{
                padding: 14,
                border: "1px solid #8191a5",
                borderRadius: 10,
                background: "#263342",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "#ffbd55",
                    border: "2px solid #ffffff",
                  }}
                />

                <strong
                  style={{
                    fontSize: 19,
                    color: "#ffffff",
                  }}
                >
                  S
                </strong>

                <span
                  style={{
                    fontSize: 11,
                    color: "#f1cc85",
                    fontWeight: 700,
                  }}
                >
                  START
                </span>
              </div>

              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {startMapPoint.name}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "#aabfd2",
                }}
              >
                {locationHints.S}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "#d5e2ef",
                }}
              >
                Departure location for
                experimental routes
              </div>
            </div>

            {scienceMapPoints.map((point) => {
              const isSelected =
                point.id === selectedId;

              return (
                <button
                  key={point.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    handleMapSelection(point.id)
                  }
                  style={{
                    appearance: "none",
                    cursor: "pointer",
                    display: "block",
                    width: "100%",
                    padding: 14,
                    textAlign: "left",
                    border: isSelected
                      ? "2px solid #80cfff"
                      : "1px solid #536478",
                    borderRadius: 10,
                    color: "#eef4fc",
                    background: isSelected
                      ? "#1e3c55"
                      : "#263342",
                    boxShadow: isSelected
                      ? "0 0 0 1px #80cfff"
                      : "none",
                    fontFamily: "inherit",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        display: "inline-block",
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: "#ffbd55",
                        border: "2px solid #ffffff",
                      }}
                    />

                    <strong
                      style={{
                        fontSize: 19,
                      }}
                    >
                      {point.id}
                    </strong>

                    {isSelected && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#95dfff",
                        }}
                      >
                        SELECTED
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: 1.5,
                    }}
                  >
                    {point.name}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: "#b6c8dc",
                    }}
                  >
                    {locationHints[point.id] ??
                      "Candidate science site"}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: "#91d4ff",
                      fontWeight: 600,
                    }}
                  >
                    View science and route
                  </div>
                </button>
              );
            })}
          </div>

          <p
            style={{
              margin: "14px 0 0",
              fontSize: 12,
              color: "#9daec1",
              lineHeight: 1.6,
            }}
          >
            Location descriptions are approximate
            directions within the displayed map.
            Target positions are preliminary.
            Map-marker highlighting and route
            drawing require additional OpenLayers
            support.
          </p>
        </div>
      </section>

      <MissionTargets
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <section
        aria-labelledby="experimental-route-heading"
        style={{
          border: "1px solid #596575",
          borderRadius: 14,
          padding: 20,
          textAlign: "left",
        }}
      >
        <h2 id="experimental-route-heading">
          Experimental Mars Route Planner
        </h2>

        <p>
          <strong>Start:</strong>{" "}
          S — Channel Floor Staging Site
        </p>

        <p>
          <strong>Destination:</strong>{" "}
          {selectedId}
        </p>

        <p>
          <strong>Study Area:</strong>{" "}
          Athabasca Valles — Candidate 11
        </p>

        <p>
          <strong>Routing Method:</strong>{" "}
          Balanced Cost + Dijkstra
        </p>

        {recommendation.errors.length > 0 && (
          <section role="alert">
            <h3>Route Planning Errors</h3>

            <ul>
              {recommendation.errors.map(
                (error, index) => (
                  <li key={index}>{error}</li>
                )
              )}
            </ul>
          </section>
        )}

        {route ? (
          <section>
            <h3>Experimental Route Summary</h3>

            <p>
              <strong>Route:</strong>{" "}
              {route.nodeIds.join(" → ")}
            </p>

            <p>
              <strong>Distance:</strong>{" "}
              {route.distanceM.toFixed(1)} m
            </p>

            <p>
              <strong>Balanced Cost:</strong>{" "}
              {route.balancedCost.toFixed(4)}
            </p>

            <p>
              <strong>
                Terrain Difficulty Index:
              </strong>{" "}
              {route.difficultyIndex === null
                ? "Unavailable"
                : route.difficultyIndex.toFixed(4)}
            </p>

            <p>
              <strong>Mean Route Slope:</strong>{" "}
              {route.meanSlopeDegrees === null
                ? "Unavailable"
                : `${route.meanSlopeDegrees.toFixed(2)}°`}
            </p>

            <p>
              <strong>
                Route Geometry:
              </strong>{" "}
              {routeGeometry.length} coordinates
              prepared for OpenLayers
            </p>

            <p
              style={{
                fontSize: 13,
                color: "#b8c9db",
                lineHeight: 1.6,
              }}
            >
              {route.explanation}
            </p>

            <h3>Corridor Evidence</h3>

            {route.edgeIds.length === 0 ? (
              <p>
                No corridor edges selected.
              </p>
            ) : (
              <ul
                style={{
                  paddingLeft: 20,
                  lineHeight: 1.7,
                }}
              >
                {route.edgeIds.map((edgeId) => (
                  <li
                    key={edgeId}
                    style={{ marginBottom: 16 }}
                  >
                    {explainCorridorDifficulty(
                      edgeId
                    ) ??
                      `No review available for ${edgeId}.`}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          recommendation.errors.length === 0 && (
            <p>
              No experimental route is available
              for the selected destination.
            </p>
          )
        )}

        {recommendation.warnings.length > 0 && (
          <section>
            <h3>Data Limitations</h3>

            <ul>
              {recommendation.warnings.map(
                (warning, index) => (
                  <li key={index}>{warning}</li>
                )
              )}
            </ul>
          </section>
        )}

        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 10,
            border: "1px solid #596575",
            background: "#293342",
            lineHeight: 1.7,
          }}
        >
          <strong>
            Research Prototype — Experimental Routes
          </strong>

          <p style={{ marginBottom: 0 }}>
            The route network is based on candidate
            terrain corridors. The start location,
            science observation stations, and route
            accessibility require final GIS and
            orthophoto approval.

            The experimental 15-degree threshold
            is not an official NASA EVA safety limit.

            Corridor geometry is provided to the
            map component, but route rendering
            requires OpenLayers support.
          </p>
        </div>
      </section>
    </div>
  );
}