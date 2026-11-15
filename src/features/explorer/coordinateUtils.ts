/**
 * Coordinates are LOCAL Mars projected metres (x east, y north).
 * Extents are passed by the caller, normally from public/maps/region.json.
 * No Earth/geographic reprojection is performed here.
 */
export type LocalXY = readonly [number, number];
export type LocalExtent = readonly [number, number, number, number];

function isFinitePair(point: readonly number[]): boolean {
  return (
    Array.isArray(point) &&
    point.length === 2 &&
    point.every((value) => typeof value === 'number' && Number.isFinite(value))
  );
}

function isValidExtent(extent: LocalExtent): boolean {
  return (
    Array.isArray(extent) &&
    extent.length === 4 &&
    extent.every((value) => typeof value === 'number' && Number.isFinite(value)) &&
    extent[0] <= extent[2] &&
    extent[1] <= extent[3]
  );
}

/** Includes the boundary, e.g. [0,0] and [2500,2500]. */
export function isPointWithinExtent(
  point: readonly number[],
  extent: LocalExtent,
): boolean {
  if (!isFinitePair(point) || !isValidExtent(extent)) return false;
  const [x, y] = point;
  const [minX, minY, maxX, maxY] = extent;
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

/** For a rectangular (convex) extent, all vertices inside => each straight segment inside. */
export function isPolylineWithinExtent(
  geometry: readonly (readonly number[])[],
  extent: LocalExtent,
): boolean {
  return (
    Array.isArray(geometry) &&
    geometry.length >= 2 &&
    isValidExtent(extent) &&
    geometry.every((point) => isPointWithinExtent(point, extent))
  );
}

/**
 * Sum of straight 2D segment lengths. This follows the same rules as
 * Ania's planner/lib/polylineLength.ts: finite pairs, >=2 vertices,
 * and positive total length; repeated adjacent vertices are allowed.
 * All coordinates and returned length are in metres.
 */
export function calculatePolylineLengthM(
  geometry: readonly (readonly number[])[],
): number {
  if (!Array.isArray(geometry) || geometry.length < 2) {
    throw new Error('Polyline must contain at least two points');
  }
  for (const point of geometry) {
    if (!isFinitePair(point)) {
      throw new Error('Polyline coordinates must be finite [x, y] pairs');
    }
  }
  let distanceM = 0;
  for (let i = 1; i < geometry.length; i++) {
    const before = geometry[i - 1];
    const after = geometry[i];
    distanceM += Math.hypot(after[0] - before[0], after[1] - before[1]);
  }
  if (distanceM <= 0) {
    throw new Error('Polyline length must be positive');
  }
  return distanceM;
}
