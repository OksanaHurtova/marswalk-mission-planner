/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { demoPoints } from './demoPoints';
import { experimentalRoutesFromAnia } from './experimentalRoutesFromAnia';
import {
  calculatePolylineLengthM,
  isPointWithinExtent,
  isPolylineWithinExtent,
  type LocalExtent,
} from './coordinateUtils';

/** T-018: validate REAL project fixtures/configuration, not only utility functions. */
type Region = {
  id: string;
  units: string;
  sourceProjection: string;
  extent: LocalExtent;
  sourceProjectedExtent: [number, number, number, number];
  originProjectedXY: [number, number];
  widthM: number;
  heightM: number;
  axes: { x: string; y: string };
  coordinateConversion: { localX: string; localY: string };
};
const region = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public/maps/region.json'), 'utf8'),
) as Region;
const START: readonly [number, number] = [697.9952, 1640.7618];
const knownPOIs: Record<string, readonly [number, number]> = {
  P01: [417.9952, 1220.7618],
  P02: [517.9952, 2040.7618],
  P03: [972.9952, 1395.7618],
  P04: [2012.9952, 1435.7618],
};

describe('T-018 — coordinates and distances, Mars LOCAL metres', () => {
  it('uses the approved 2.5 km square, axes and Mars CRS, not Earth GPS', () => {
    expect(region.id).toBe('athabasca_candidate_11');
    expect(region.sourceProjection).toBe('Equirectangular MARS');
    expect(region.units).toBe('m');
    expect(region.axes).toEqual({ x: 'east', y: 'north' });
    expect(region.extent).toEqual([0, 0, 2500, 2500]);
    expect(region.widthM).toBe(2500);
    expect(region.heightM).toBe(2500);
    expect(region.extent[2] - region.extent[0]).toBe(region.widthM);
    expect(region.extent[3] - region.extent[1]).toBe(region.heightM);
  });

  it('translates original projected Mars coordinates to the same local extent', () => {
    const [originX, originY] = region.originProjectedXY;
    const [left, bottom, right, top] = region.sourceProjectedExtent;
    expect([left - originX, bottom - originY, right - originX, top - originY][0]).toBeCloseTo(region.extent[0], 5);
    expect([left - originX, bottom - originY, right - originX, top - originY][1]).toBeCloseTo(region.extent[1], 5);
    expect([left - originX, bottom - originY, right - originX, top - originY][2]).toBeCloseTo(region.extent[2], 5);
    expect([left - originX, bottom - originY, right - originX, top - originY][3]).toBeCloseTo(region.extent[3], 5);
    expect(region.coordinateConversion.localX).toBe('projectedX - originProjectedXY[0]');
    expect(region.coordinateConversion.localY).toBe('projectedY - originProjectedXY[1]');
  });

  it('keeps start S and all four real POIs inside the map, with matching IDs/coordinates', () => {
    expect(isPointWithinExtent(START, region.extent)).toBe(true);
    expect(demoPoints.map((p) => p.id).sort()).toEqual(['P01', 'P02', 'P03', 'P04']);
    for (const poi of demoPoints) {
      expect(poi.localXY_m).toEqual(knownPOIs[poi.id]);
      expect(isPointWithinExtent(poi.localXY_m, region.extent)).toBe(true);
    }
    expect(isPointWithinExtent([-1, 500], region.extent)).toBe(false);
    expect(isPointWithinExtent([2501, 500], region.extent)).toBe(false);
    expect(isPointWithinExtent([500, Number.NaN], region.extent)).toBe(false);
  });

  it('checks known straight-line distances in METRES (not kilometres or degrees)', () => {
    const direct = (poi: readonly [number, number]) => calculatePolylineLengthM([START, poi]);
    expect(direct(knownPOIs.P01)).toBeCloseTo(504.77718, 4);
    expect(direct(knownPOIs.P02)).toBeCloseTo(438.63424, 4);
    expect(direct(knownPOIs.P03)).toBeCloseTo(368.30694, 4);
    expect(direct(knownPOIs.P04)).toBeCloseTo(1330.88317, 4);
  });

  it('validates entire displayed experimental routes, not just their endpoints', () => {
    expect(Object.keys(experimentalRoutesFromAnia).sort()).toEqual(['P01', 'P02', 'P03', 'P04']);
    for (const [id, polyline] of Object.entries(experimentalRoutesFromAnia)) {
      expect(polyline.length).toBeGreaterThanOrEqual(2);
      expect(isPolylineWithinExtent(polyline, region.extent)).toBe(true);
      const first = polyline[0];
      const last = polyline[polyline.length - 1];
      expect(Math.hypot(first[0] - START[0], first[1] - START[1])).toBeLessThan(0.1);
      expect(Math.hypot(last[0] - knownPOIs[id][0], last[1] - knownPOIs[id][1])).toBeLessThan(0.1);
      expect(calculatePolylineLengthM(polyline)).toBeGreaterThanOrEqual(
        Math.hypot(knownPOIs[id][0] - START[0], knownPOIs[id][1] - START[1]) - 0.01,
      );
    }
    // P04 is deliberately a detour, not a fabricated direct straight line.
    expect(calculatePolylineLengthM(experimentalRoutesFromAnia.P04)).toBeGreaterThan(2500);
  });
});
