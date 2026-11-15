import { useState } from "react";

import { recommendRoute } from "../lib/recommendRoute";

import type {
  RouteRecommendation,
} from "../lib/recommendRoute";

import type {
  ScienceTargetId,
} from "../data/candidateScienceTargets";

import mockNetwork from "../data/mockNetwork.json";

import TerrainExplorer from "./TerrainExplorer";
import MissionTargets from "./MissionTargets";

export default function RoutePlanner() {
  const [
    selectedScienceTargetId,
    setSelectedScienceTargetId,
  ] = useState<ScienceTargetId>("P01");

  const [startId, setStartId] = useState("S");
  const [targetId, setTargetId] = useState("T");

  const [recommendation, setRecommendation] =
    useState<RouteRecommendation | null>(null);

  const route = recommendation?.route;

  function planRoute() {
    const result = recommendRoute(
      mockNetwork,
      startId,
      targetId,
      false
    );

    setRecommendation(result);
  }

  function clearResult() {
    setRecommendation(null);
  }

  return (
    <main
      style={{
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
        padding: "32px 20px",
        boxSizing: "border-box",
      }}
    >
      <header style={{ marginBottom: 30 }}>
        <h1>Marswalk Mission Planner</h1>

        <p>
          Explore the Martian landscape using NASA
          imagery and terrain data.
        </p>

        <p
          style={{
            fontSize: 13,
            opacity: 0.78,
          }}
        >
          Demonstration mode: routes use mock
          coordinates. Real science targets and
          DTM-derived route slopes are pending
          GIS validation.
        </p>
      </header>

      <TerrainExplorer />

      <MissionTargets
        selectedId={selectedScienceTargetId}
        onSelect={setSelectedScienceTargetId}
      />

      <section
        style={{
          padding: 24,
          border: "1px solid #596575",
          borderRadius: 14,
          textAlign: "left",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          Mock Route Planner
        </h2>

        <p
          style={{
            fontSize: 13,
            opacity: 0.85,
          }}
        >
          This demonstration network (S, A, B, T)
          is not geographically linked to the
          candidate science targets above.
          Real Mars routes will be enabled after
          the final GIS network and DTM slopes
          are validated.
        </p>

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="start">
            Starting Point:{" "}
          </label>

          <select
            id="start"
            value={startId}
            onChange={(event) => {
              setStartId(event.target.value);
              clearResult();
            }}
          >
            {mockNetwork.nodes.map((node) => (
              <option
                key={node.id}
                value={node.id}
              >
                {node.id}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="target">
            Destination:{" "}
          </label>

          <select
            id="target"
            value={targetId}
            onChange={(event) => {
              setTargetId(event.target.value);
              clearResult();
            }}
          >
            {mockNetwork.nodes.map((node) => (
              <option
                key={node.id}
                value={node.id}
              >
                {node.id}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={planRoute}
        >
          Plan Mock Route
        </button>

        {recommendation &&
          recommendation.errors.length > 0 && (
            <section
              role="alert"
              style={{ marginTop: 24 }}
            >
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

        {route && (
          <section style={{ marginTop: 30 }}>
            <h2>Route Summary</h2>

            <p>
              <strong>Route:</strong>{" "}
              {route.nodeIds.join(" → ")}
            </p>

            <p>
              <strong>Distance:</strong>{" "}
              {route.distanceM} m
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
                ? "No data available"
                : route.difficultyIndex.toFixed(2)}
            </p>

            <p>{route.explanation}</p>
          </section>
        )}

        {recommendation &&
          recommendation.warnings.length > 0 && (
            <section style={{ marginTop: 24 }}>
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
      </section>
    </main>
  );
}
