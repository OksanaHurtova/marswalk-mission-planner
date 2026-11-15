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

// The existing MarsMap supports points and onSelectTarget.
// selectedTargetId and routeGeometry are the proposed
// next-stage OpenLayers integration contract.
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

// Show S and the four science targets on the map.
// Intermediate route nodes are not science stops.
const mapPoints: MapPoint[] = [
  startMapPoint,
  ...scienceMapPoints,
];

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

  // RouteResult.geometry contains ordered local
  // coordinates in metres: [x, y].
  const routeGeometry: XY[] =
    route?.geometry ?? [];

  function handleMapSelection(pointId: string) {
    // S is a start marker, not a science destination.
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
      <section
        aria-label="Interactive Mars mission map"
      >
        <h2>Mission Area — Candidate 11</h2>

        <p style={{ lineHeight: 1.6 }}>
          Select a science target on the map
          or in the mission cards to explore
          its scientific objectives and
          experimental route from S.
        </p>

        <MapComponent
          points={mapPoints}
          onSelectTarget={handleMapSelection}
          selectedTargetId={selectedId}
          routeGeometry={routeGeometry}
        />

        <p
          style={{
            marginTop: 12,
            fontSize: 13,
            lineHeight: 1.6,
            color: "#b8c9db",
          }}
        >
          <strong>Map points:</strong>{" "}
          S — Mission Start;
          P01–P04 — Candidate Science Targets.
        </p>

        <p
          style={{
            fontSize: 12,
            lineHeight: 1.6,
            color: "#91a8bf",
          }}
        >
          All coordinates use the Candidate 11
          local metric coordinate system.
          X increases eastward and Y increases
          northward.
        </p>
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
                  <li key={index}>
                    {error}
                  </li>
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
              <strong>Terrain Difficulty Index:</strong>{" "}
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
              <strong>Route Geometry:</strong>{" "}
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
                  <li key={index}>
                    {warning}
                  </li>
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

