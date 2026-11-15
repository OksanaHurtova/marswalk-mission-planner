import { useMemo } from 'react';
import MarsMap from '../features/explorer/MarsMap';
import type { MarsMapProps } from '../shared/types';

/** Visual-only companion to the unchanged OpenLayers map. */
export default function AtlasMapView(props: MarsMapProps) {
  const distanceM = useMemo(() => {
    const coordinates = props.routeGeometry;
    if (!coordinates || coordinates.length < 2) return null;
    let distance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const a = coordinates[i - 1];
      const b = coordinates[i];
      distance += Math.hypot(b[0] - a[0], b[1] - a[1]);
    }
    return Number.isFinite(distance) ? distance : null;
  }, [props.routeGeometry]);

  return (
    <div className="aa-map-composition">
      <MarsMap {...props} />
      <aside className="aa-route-peek" aria-label="Selected experimental route summary">
        <p className="aa-panel-eyebrow">ROUTE / LIVE GEOMETRY</p>
        <div className="aa-peek-status">
          <span>Destination</span>
          <strong>{props.selectedTargetId ?? '—'}</strong>
        </div>
        <div className="aa-peek-status">
          <span>Mapped length</span>
          <strong>{distanceM === null ? 'Not displayed' : `${(distanceM / 1000).toFixed(2)} km`}</strong>
        </div>
        <div className="aa-peek-status">
          <span>Polyline points</span>
          <strong>{props.routeGeometry?.length ?? 0}</strong>
        </div>
        <p className="aa-peek-note">Measured from the displayed route polyline in local metres. Experimental path, not a certified traverse.</p>
      </aside>
      <div className="aa-map-metadata" id="atlas-sources">
        <div className="aa-map-metadata-source">
          <p className="aa-panel-eyebrow">DATA & SOURCES</p>
          <a href="https://www.uahirise.org/ESP_035191_1880" target="_blank" rel="noopener noreferrer">MRO / HiRISE <span aria-hidden="true">↗</span></a>
          <small>Local orbital imagery, elevation and derived slope</small>
        </div>
        <div className="aa-map-metadata-source">
          <a href="https://pubs.usgs.gov/publication/sim3477" target="_blank" rel="noopener noreferrer">Mars Odyssey / THEMIS <span aria-hidden="true">↗</span></a>
          <small>Regional geological context via USGS SIM 3477</small>
        </div>
      </div>
    </div>
  );
}
