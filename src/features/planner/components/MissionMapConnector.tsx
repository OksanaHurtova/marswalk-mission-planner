import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';

import MissionTargets from './MissionTargets';
import RouteTerrainScreening from './RouteTerrainScreening';

import {
  CANDIDATE_SCIENCE_TARGETS,
} from '../data/candidateScienceTargets';

import type {
  ScienceTargetId,
} from '../data/candidateScienceTargets';

import sciencePoints from '../data/sciencePoints.json';
import startPointData from '../data/startPoint_preliminary.json';
import network from '../data/network.json';

import { recommendRoute } from '../lib/recommendRoute';
import {
  explainCorridorDifficulty,
} from '../lib/corridorDifficultyReview';

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
  selectedTargetId?: string;
  routeGeometry?: XY[];
};

type MissionMapConnectorProps = {
  MapComponent: ComponentType<CompatibleMarsMapProps>;
};

const EMPTY_ROUTE: XY[] = [];

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
  S: 'Upper-left central area',
  P01: 'Lower-left area',
  P02: 'Upper-left area',
  P03: 'Near the center',
  P04: 'Right side',
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
    useState<ScienceTargetId>('P01');

  const [activePointId, setActivePointId] =
    useState<string>('P01');

  const recommendation = useMemo(
    () =>
      recommendRoute(
        network,
        'S',
        selectedId,
        true
      ),
    [selectedId]
  );

  const isStartSelected =
    activePointId === 'S';

  const route = recommendation.route;

  const routeGeometry: XY[] = isStartSelected
    ? EMPTY_ROUTE
    : (route?.geometry ?? EMPTY_ROUTE);

  function selectScienceTarget(
    id: ScienceTargetId
  ) {
    setSelectedId(id);
    setActivePointId(id);
  }

  function handleMapSelection(
    pointId: string
  ) {
    if (pointId === 'S') {
      setActivePointId('S');
    } else if (isScienceTargetId(pointId)) {
      selectScienceTarget(pointId);
    }
  }

  return (
    <div
      style={{
        width: '100%',
        display: 'grid',
        gap: 24,
      }}
    >
      <section
        aria-label="Interactive Mars mission map"
      >
        <h2>Mission Area — Candidate 11</h2>

        <p style={{ lineHeight: 1.6 }}>
          Select a science target or the mission
          start on the map or in the legend.
          Science destinations calculate
          experimental routes from S.
        </p>

        <MapComponent
          points={mapPoints}
          onSelectTarget={handleMapSelection}
          selectedTargetId={activePointId}
          routeGeometry={routeGeometry}
        />

        <div
          aria-label="Mission map legend"
          style={{
            marginTop: 16,
            padding: 18,
            border: '1px solid #536478',
            borderRadius: 12,
            background: '#172331',
          }}
        >
          <h3
            style={{
              margin: '0 0 8px',
              fontSize: 20,
            }}
          >
            Map Legend — Mission Locations
          </h3>

          <p
            style={{
              margin: '0 0 16px',
              color: '#bdcbdb',
              lineHeight: 1.6,
            }}
          >
            Select S to inspect the staging area,
            or P01–P04 to display the corresponding
            science target and experimental route.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
            }}
          >
            {mapPoints.map((point) => {
              const isSelected =
                point.id === activePointId;

              return (
                <button
                  key={point.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    handleMapSelection(point.id)
                  }
                  style={{
                    appearance: 'none',
                    cursor: 'pointer',
                    display: 'block',
                    width: '100%',
                    padding: 14,
                    textAlign: 'left',
                    border: isSelected
                      ? '2px solid #36ddff'
                      : '1px solid #536478',
                    borderRadius: 10,
                    color: '#eef4fc',
                    background: isSelected
                      ? '#1e3c55'
                      : '#263342',
                    boxShadow: isSelected
                      ? '0 0 0 1px #36ddff'
                      : 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background:
                          point.id === 'S'
                            ? '#37e7c0'
                            : '#ffbd55',
                        border:
                          '2px solid #ffffff',
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
                          color: '#95dfff',
                          fontSize: 10,
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
                      color: '#b6c8dc',
                    }}
                  >
                    {locationHints[point.id] ??
                      'Mission location'}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: '#91d4ff',
                    }}
                  >
                    {point.id === 'S'
                      ? 'Inspect mission start'
                      : 'View science and route'}
                  </div>
                </button>
              );
            })}
          </div>

          {isStartSelected && (
            <div
              role="status"
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 10,
                background: '#233a43',
                border: '1px solid #37e7c0',
                lineHeight: 1.7,
              }}
            >
              <strong>
                S — {startMapPoint.name}
              </strong>

              <p
                style={{
                  margin: '8px 0',
                }}
              >
                Preliminary start point at
                local coordinates X ={' '}
                {startMapPoint.localXY_m[0].toFixed(2)}
                {' '}m, Y ={' '}
                {startMapPoint.localXY_m[1].toFixed(2)}
                {' '}m.
              </p>

              <p style={{ margin: 0 }}>
                This is a candidate staging
                position, not an approved astronaut
                landing, departure or EVA safety
                location. Select P01–P04 to
                display an experimental route
                from S.
              </p>
            </div>
          )}

          <p
            style={{
              margin: '14px 0 0',
              fontSize: 12,
              color: '#9daec1',
            }}
          >
            The labels and positions are
            preliminary. Dashed cyan lines
            show experimental paths, not
            approved EVA routes.
          </p>
        </div>
      </section>

      <MissionTargets
        selectedId={selectedId}
        onSelect={selectScienceTarget}
      />

      <section
        aria-labelledby="experimental-route-heading"
        style={{
          border: '1px solid #596575',
          borderRadius: 14,
          padding: 20,
          textAlign: 'left',
        }}
      >
        <h2 id="experimental-route-heading">
          Experimental Mars Route Planner
        </h2>

        <p>
          <strong>Start:</strong>{' '}
          S — Channel Floor Staging Site
        </p>

        <p>
          <strong>Destination:</strong>{' '}
          {selectedId}
        </p>

        <p>
          <strong>Study Area:</strong>{' '}
          Athabasca Valles — Candidate 11
        </p>

        <p>
          <strong>Routing Method:</strong>{' '}
          Balanced Cost + Dijkstra
        </p>

        {isStartSelected ? (
          <p>
            Mission start S is selected.
            Select a science destination
            to view its experimental route.
          </p>
        ) : (
          <>
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
                <h3>
                  Experimental Route Summary
                </h3>

                <p>
                  <strong>Route:</strong>{' '}
                  {route.nodeIds.join(' → ')}
                </p>

                <p>
                  <strong>Distance:</strong>{' '}
                  {route.distanceM.toFixed(1)} m
                </p>

                <p>
                  <strong>Balanced Cost:</strong>{' '}
                  {route.balancedCost.toFixed(4)}
                </p>

                <p>
                  <strong>
                    Terrain Difficulty Index:
                  </strong>{' '}
                  {route.difficultyIndex === null
                    ? 'Unavailable'
                    : route.difficultyIndex.toFixed(4)}
                </p>

                <p>
                  <strong>
                    Mean Route Slope:
                  </strong>{' '}
                  {route.meanSlopeDegrees === null
                    ? 'Unavailable'
                    : `${route.meanSlopeDegrees.toFixed(2)}°`}
                </p>

                <p>
                  <strong>
                    Route Geometry:
                  </strong>{' '}
                  {routeGeometry.length}
                  {' '}coordinates provided
                  to OpenLayers
                </p>

                <p
                  style={{
                    fontSize: 13,
                    color: '#b8c9db',
                    lineHeight: 1.6,
                  }}
                >
                  {route.explanation}
                </p>

                <RouteTerrainScreening
                  route={route}
                />

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
                    {route.edgeIds.map(
                      (edgeId) => (
                        <li
                          key={edgeId}
                          style={{
                            marginBottom: 16,
                          }}
                        >
                          {explainCorridorDifficulty(
                            edgeId
                          ) ??
                            `No review available for ${edgeId}.`}
                        </li>
                      )
                    )}
                  </ul>
                )}
              </section>
            ) : (
              recommendation.errors.length === 0 && (
                <p>
                  No experimental route is
                  available for this destination.
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
          </>
        )}

        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 10,
            border:
              '1px solid #596575',
            background: '#293342',
            lineHeight: 1.7,
          }}
        >
          <strong>
            Research Prototype —
            Experimental Routes
          </strong>

          <p style={{ marginBottom: 0 }}>
            Route corridors and science targets
            are preliminary and require
            orthophoto and GIS review.

            The experimental 15-degree
            slope threshold is not an
            official NASA EVA safety limit.

            The terrain difficulty index
            currently uses a slope-derived
            proxy.
          </p>
        </div>
      </section>
    </div>
  );
}
