import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';

import MissionTargets from './MissionTargets';
import RouteSummary from './RouteSummary';
import RouteExplanation from './RouteExplanation';
import RouteTerrainScreening from './RouteTerrainScreening';
import UpdatedDtmCostComparison from './UpdatedDtmCostComparison';
import {
  CANDIDATE_SCIENCE_TARGETS,
} from '../data/candidateScienceTargets';
import type { ScienceTargetId } from '../data/candidateScienceTargets';
import sciencePoints from '../data/sciencePoints.json';
import startPointData from '../data/startPoint_preliminary.json';
import network from '../data/network.json';
import { recommendRoute } from '../lib/recommendRoute';
import { explainCorridorDifficulty } from '../lib/corridorDifficultyReview';
import { publicScienceText } from '../../../ares-atlas/publicScienceText';

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

const scienceMapPoints: MapPoint[] = sciencePoints.points.map((point) => ({
  id: point.id,
  name: point.name,
  localXY_m: [point.localXY_m[0], point.localXY_m[1]],
  status: point.locationStatus,
}));

const mapPoints: MapPoint[] = [startMapPoint, ...scienceMapPoints];

const locationHints: Record<string, string> = {
  S: 'Upper-left central area',
  P01: 'Lower-left area',
  P02: 'Upper-left area',
  P03: 'Near the center',
  P04: 'Right side',
};

function isScienceTargetId(id: string): id is ScienceTargetId {
  return CANDIDATE_SCIENCE_TARGETS.some((target) => target.id === id);
}

export default function MissionMapConnector({
  MapComponent,
}: MissionMapConnectorProps) {
  const [selectedId, setSelectedId] = useState<ScienceTargetId>('P01');
  const [activePointId, setActivePointId] = useState<string>('P01');

  const recommendation = useMemo(
    () => recommendRoute(network, 'S', selectedId, true),
    [selectedId]
  );

  const isStartSelected = activePointId === 'S';
  const route = recommendation.route;
  const routeGeometry: XY[] = isStartSelected
    ? EMPTY_ROUTE
    : (route?.geometry ?? EMPTY_ROUTE);

  function selectScienceTarget(id: ScienceTargetId) {
    setSelectedId(id);
    setActivePointId(id);
  }

  function handleMapSelection(pointId: string) {
    if (pointId === 'S') {
      setActivePointId('S');
    } else if (isScienceTargetId(pointId)) {
      selectScienceTarget(pointId);
    }
  }

  return (
    <div className="aa-mission">
      <section id="atlas-map" className="aa-map-section" aria-label="Interactive Mars mission map">
        <div className="aa-section-heading">
          <div>
            <p className="aa-panel-eyebrow">01 / FIELD EXPLORER</p>
            <h2>Mission map</h2>
          </div>
          <p>Select a scientific destination to display its experimental route. Select S to inspect the preliminary staging location.</p>
        </div>

        <div className="aa-target-ribbon" role="group" aria-label="Select mission location">
          {mapPoints.map((point) => {
            const active = point.id === activePointId;
            return (
              <button
                key={point.id}
                type="button"
                aria-pressed={active}
                title={`${point.name} — ${locationHints[point.id] ?? 'Mission location'}`}
                onClick={() => handleMapSelection(point.id)}
              >
                <span className="aa-target-dot" aria-hidden="true" />
                <span>{point.id}</span>
                {active && <span className="aa-target-active">SELECTED</span>}
              </button>
            );
          })}
        </div>

        <MapComponent
          points={mapPoints}
          onSelectTarget={handleMapSelection}
          selectedTargetId={activePointId}
          routeGeometry={routeGeometry}
        />

        {isStartSelected && (
          <div className="aa-staging-note" role="status">
            <strong>S — {startMapPoint.name}</strong>
            <p>Preliminary local position: X {startMapPoint.localXY_m[0].toFixed(2)} m · Y {startMapPoint.localXY_m[1].toFixed(2)} m.</p>
            <p>This staging position is not an approved EVA departure or safety location. Select P01–P04 to display an experimental route from S.</p>
          </div>
        )}

        <details className="aa-location-register">
          <summary>Location register & preliminary positions</summary>
          <div className="aa-location-register-grid">
            {mapPoints.map((point) => (
              <button
                key={point.id}
                type="button"
                aria-pressed={point.id === activePointId}
                onClick={() => handleMapSelection(point.id)}
              >
                <strong>{point.id} / {point.name}</strong>
                <small>{locationHints[point.id] ?? 'Mission location'}</small>
                <small>Local X {point.localXY_m[0].toFixed(2)} m / Y {point.localXY_m[1].toFixed(2)} m</small>
              </button>
            ))}
          </div>
        </details>
        <p className="aa-map-disclaimer">Locations are preliminary. Route lines depict experimental research paths, not approved astronaut EVA corridors.</p>
      </section>

      <MissionTargets selectedId={selectedId} onSelect={selectScienceTarget} />

      <section
        aria-labelledby="experimental-route-heading"
        style={{
          border: '1px solid #596575',
          borderRadius: 14,
          padding: 20,
          textAlign: 'left',
        }}
      >
        <h2 id="experimental-route-heading">Experimental Mars Route Planner</h2>
        <p><strong>Start:</strong> S — Channel Floor Staging Site</p>
        <p><strong>Destination:</strong> {selectedId}</p>
        <p><strong>Study Area:</strong> Athabasca Valles</p>
        <p><strong>Routing Method:</strong> Balanced Cost + Dijkstra</p>

        {isStartSelected ? (
          <p>
            Mission start S is selected. Select a science destination to view
            its experimental route.
          </p>
        ) : (
          <>
            {recommendation.errors.length > 0 && (
              <section role="alert">
                <h3>Route Planning Errors</h3>
                <ul>
                  {recommendation.errors.map((error, index) => (
                    <li key={index}>{publicScienceText(error)}</li>
                  ))}
                </ul>
              </section>
            )}

            {route ? (
              <section>
                <RouteSummary
                  route={route}
                  renderedCoordinateCount={routeGeometry.length}
                />
                <RouteExplanation route={route} />
                <RouteTerrainScreening route={route} />
                <UpdatedDtmCostComparison selectedTargetId={selectedId} />

                <h3>Corridor Evidence</h3>
                {route.edgeIds.length === 0 ? (
                  <p>No corridor edges selected.</p>
                ) : (
                  <ul style={{ paddingLeft: 20, lineHeight: 1.7 }}>
                    {route.edgeIds.map((edgeId) => (
                      <li key={edgeId} style={{ marginBottom: 16 }}>
                        {explainCorridorDifficulty(edgeId) ??
                          `No review available for ${edgeId}.`}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : (
              recommendation.errors.length === 0 && (
                <p>No experimental route is available for this destination.</p>
              )
            )}

            {recommendation.warnings.length > 0 && (
              <section>
                <h3>Data Limitations</h3>
                <ul>
                  {recommendation.warnings.map((warning, index) => (
                    <li key={index}>{publicScienceText(warning)}</li>
                  ))}
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
            border: '1px solid #596575',
            background: '#293342',
            lineHeight: 1.7,
          }}
        >
          <strong>Research Prototype — Experimental Routes</strong>
          <p style={{ marginBottom: 0 }}>
            Route corridors and science targets are preliminary and require
            orthophoto and GIS review. The experimental 15-degree slope
            threshold is not an official NASA EVA safety limit. The terrain
            difficulty index currently uses a slope-derived proxy.
          </p>
        </div>
      </section>
    </div>
  );
}
