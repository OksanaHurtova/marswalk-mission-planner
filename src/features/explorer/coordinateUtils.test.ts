import { describe, expect, it } from 'vitest';
import {
  calculatePolylineLengthM,
  isPointWithinExtent,
  isPolylineWithinExtent,
  type LocalExtent,
} from './coordinateUtils';

const extent: LocalExtent = [0, 0, 2500, 2500];

describe('T-013 — local Mars geometry', () => {
  it('includes the square boundary and known local POI coordinates', () => {
    expect(isPointWithinExtent([0, 0], extent)).toBe(true);
    expect(isPointWithinExtent([2500, 2500], extent)).toBe(true);
    expect(isPointWithinExtent([417.9952, 1220.7618], extent)).toBe(true); // P01
    expect(isPointWithinExtent([2012.9952, 1435.7618], extent)).toBe(true); // P04
  });

  it('rejects points outside square or with invalid coordinates', () => {
    expect(isPointWithinExtent([-0.01, 20], extent)).toBe(false);
    expect(isPointWithinExtent([2500.01, 20], extent)).toBe(false);
    expect(isPointWithinExtent([0, Number.NaN], extent)).toBe(false);
    expect(isPointWithinExtent([Number.POSITIVE_INFINITY, 0], extent)).toBe(false);
    expect(isPointWithinExtent([0, 0, 0], extent)).toBe(false);
    expect(isPointWithinExtent([10, 10], [0, 0, -1, 2500])).toBe(false);
  });

  it('checks the whole polyline, not only endpoints', () => {
    expect(isPolylineWithinExtent([[697.9952, 1640.7618], [417.9952, 1220.7618]], extent)).toBe(true);
    expect(isPolylineWithinExtent([[100, 100], [-1, 500], [200, 200]], extent)).toBe(false);
    expect(isPolylineWithinExtent([[100, 100]], extent)).toBe(false);
  });

  it('calculates a bent 3-4-5 polyline exactly', () => {
    expect(calculatePolylineLengthM([[0, 0], [3, 4], [6, 0]])).toBe(10);
  });

  it('uses local metres: S to P01 straight-line distance', () => {
    expect(calculatePolylineLengthM([
      [697.9952, 1640.7618],
      [417.9952, 1220.7618],
    ])).toBeCloseTo(Math.hypot(280, 420), 6);
  });

  it('rejects one point, non-finite coordinates, and zero-length paths', () => {
    expect(() => calculatePolylineLengthM([[0, 0]])).toThrow();
    expect(() => calculatePolylineLengthM([[0, 0], [Infinity, 10]])).toThrow();
    expect(() => calculatePolylineLengthM([[0, 0], [0, 0]])).toThrow();
  });
});
