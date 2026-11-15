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
import network from "../data/network.json";

import { recommendRoute } from "../lib/recommendRoute";
import { explainCorridorDifficulty } from "../lib/corridorDifficultyReview";

type MapPoint = {
  id: string;
  name: string;
  localXY_m: [number, number];
  status?: string;
};

type CompatibleMarsMapProps = {
  points?: MapPoint[];
  onSelectTarget?: (pointId: string) => void;
};

type MissionMapConnectorProps = {
  MapComponent: ComponentType<CompatibleMarsMapProps>;
};

const mapPoints: MapPoint[] = sciencePoints.points.map(
  (point) => ({
    id: point.id,
    name: point.name,
    localXY_m: [
      point.localXY_m[0],
      point.localXY_m[1],
    ],
    status: point.locationStatus,
  })
);

function isScienceTargetId(
  pointId: string
): pointId is ScienceTargetId {
  return CANDIDATE_SCIENCE_TARGETS.some(
    (point) => point.id === pointId
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
        "S",
        selectedId,
        true
      ),
    [selectedId]
  );

  const route = recommendation.route;

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
      <section
        aria-label="Interactive Mars mission map"
      >
        <h2>Mission Area — Candidate 11</h2>

        <p>
          Select a science target on the map
          to inspect its scientific objectives
          and experimental route from S.
        </p>

        <MapComponent
          points={mapPoints}
          onSelectTarget={handleMapSelection}
        />
      </section>

      <MissionTargets
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <section
        style={{
          border: "1px solid #596575",
          borderRadius: 14,
          padding: 20,
          textAlign: "left",
        }}
      >
        <h2>Experimental Mars Route Planner</h2>

        <p>
          <strong>Start:</strong>{" "}
          S — Channel Floor Staging Site
        </p>

        <p>
          <strong>Destination:</strong>{" "}
          {selectedId}
        </p>

        <p>
          <strong>Mission area:</strong>{" "}
          Athabasca Valles — Candidate 11
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

        {route && (
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

            <h3>Corridor Evidence</h3>

            {route.edgeIds.length === 0 ? (
              <p>No corridor edges selected.</p>
            ) : (
              <ul>
                {route.edgeIds.map((edgeId) => (
                  <li
                    key={edgeId}
                    style={{ marginBottom: 12 }}
                  >
                    {explainCorridorDifficulty(edgeId) ??
                      `No review available for ${edgeId}.`}
                  </li>
                ))}
              </ul>
            )}
          </section>
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

        <p
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 10,
            background: "#293342",
            lineHeight: 1.6,
          }}
        >
          <strong>Research prototype only.</strong>
          {" "}
          All routes are experimental.
          The start location, observation
          stations, and approach corridors
          require final GIS and orthophoto
          approval. The experimental 15-degree
          threshold is not an official
          NASA EVA safety limit.
        </p>
      </section>
    </div>
  );
}
