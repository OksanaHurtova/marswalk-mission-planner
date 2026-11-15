/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Extent = [number, number, number, number];
type Region = {
  id: string;
  units: string;
  extent: Extent;
  webMapImageExtent: Extent;
  originProjectedXY: [number, number];
};
type Layer = {
  id: string;
  type: string;
  url: string;
  extent: Extent;
  imageSizePx: [number, number];
  source: { product?: string; derivedFrom?: string };
};
type Layers = {
  schemaVersion: number;
  regionId: string;
  projection: string;
  units: string;
  layers: Layer[];
};
type TerrainSamples = {
  regionId: string;
  coordinateFrame: string;
  extent: Extent;
  georeferencing: {
    originProjectedXY: [number, number];
    rasterPixelSizeM: [number, number];
  };
  edges: {
    id: string;
    plannedSamplePositions: number;
    validJointSamplePositions: number;
    coverageFraction: number | null;
  }[];
};
const root = process.cwd();
const readJson = <T,>(path: string): T => JSON.parse(readFileSync(resolve(root, path), 'utf8')) as T;
const region = readJson<Region>('public/maps/region.json');
const config = readJson<Layers>('public/maps/layers.json');
const samples = readJson<TerrainSamples>('src/features/explorer/data/terrainSamples.json');

/** Reads pixel dimensions from a REAL WebP asset, not just imageSizePx metadata. */
function webpSize(buffer: Buffer): [number, number] {
  if (
    buffer.length < 30 ||
    buffer.toString('ascii', 0, 4) !== 'RIFF' ||
    buffer.toString('ascii', 8, 12) !== 'WEBP'
  ) throw new Error('Expected valid WebP RIFF container');
  const kind = buffer.toString('ascii', 12, 16);
  if (kind === 'VP8X') {
    return [buffer.readUIntLE(24, 3) + 1, buffer.readUIntLE(27, 3) + 1];
  }
  if (kind === 'VP8 ') {
    if (buffer[23] !== 0x9d || buffer[24] !== 0x01 || buffer[25] !== 0x2a) {
      throw new Error('Unexpected VP8 image frame signature');
    }
    return [buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff];
  }
  if (kind === 'VP8L') {
    if (buffer[20] !== 0x2f) throw new Error('Unexpected VP8L signature');
    return [
      1 + (buffer[21] | ((buffer[22] & 0x3f) << 8)),
      1 + ((buffer[22] >> 6) | (buffer[23] << 2) | ((buffer[24] & 0x0f) << 10)),
    ];
  }
  throw new Error(`Unsupported WebP image chunk: ${kind}`);
}

/** OpenLayers ImageStatic: upper-left pixel is [minX, maxY]; image Y is downward. */
function localToImagePixel(xy: readonly [number, number], layer: Layer): [number, number] {
  const [minX, minY, maxX, maxY] = layer.extent;
  const [width, height] = layer.imageSizePx;
  return [
    ((xy[0] - minX) / (maxX - minX)) * width,
    ((maxY - xy[1]) / (maxY - minY)) * height,
  ];
}

describe('T-018 — raster layer extent, scale and numerical GIS coverage', () => {
  it('matches both raster layers to the exact Mars local region and its projection', () => {
    expect(config.schemaVersion).toBe(1);
    expect(config.regionId).toBe(region.id);
    expect(config.projection).toBe('MARS_LOCAL');
    expect(config.units).toBe(region.units);
    expect(config.units).toBe('m');
    expect(region.webMapImageExtent).toEqual(region.extent);
    expect(config.layers.map((l) => l.id).sort()).toEqual(['athabasca-base', 'athabasca-slope']);
    for (const layer of config.layers) {
      expect(layer.type).toBe('image-static');
      expect(layer.extent).toEqual(region.extent);
      expect(layer.imageSizePx).toEqual([2048, 2048]);
      expect(layer.source.product).toBeTruthy();
    }
  });

  it('checks actual WebP file dimensions and safe paths against their metadata', () => {
    for (const layer of config.layers) {
      expect(layer.url).toMatch(/^maps\/[a-z0-9-]+\.webp$/);
      const image = readFileSync(resolve(root, 'public', layer.url));
      expect(webpSize(image)).toEqual(layer.imageSizePx);
    }
  });

  it('preserves the same metre-per-pixel scale and axis direction in both layers', () => {
    const base = config.layers.find((layer) => layer.id === 'athabasca-base')!;
    const slope = config.layers.find((layer) => layer.id === 'athabasca-slope')!;
    const squareWidthM = region.extent[2] - region.extent[0];
    const squareHeightM = region.extent[3] - region.extent[1];
    const ratioX = squareWidthM / base.imageSizePx[0];
    const ratioY = squareHeightM / base.imageSizePx[1];
    expect(ratioX).toBeCloseTo(2500 / 2048, 10);
    expect(ratioY).toBeCloseTo(ratioX, 10);
    expect(squareWidthM / slope.imageSizePx[0]).toBeCloseTo(ratioX, 10);
    expect(squareHeightM / slope.imageSizePx[1]).toBeCloseTo(ratioY, 10);
    expect(localToImagePixel([0, 2500], base)).toEqual([0, 0]);
    expect(localToImagePixel([2500, 0], base)).toEqual([2048, 2048]);
    expect(localToImagePixel([1250, 1250], base)).toEqual([1024, 1024]);
    for (const point of [[697.9952, 1640.7618], [417.9952, 1220.7618], [2012.9952, 1435.7618]] as const) {
      const [px, py] = localToImagePixel(point, base);
      expect(localToImagePixel(point, slope)).toEqual([px, py]);
      expect(px).toBeGreaterThanOrEqual(0);
      expect(px).toBeLessThanOrEqual(2048);
      expect(py).toBeGreaterThanOrEqual(0);
      expect(py).toBeLessThanOrEqual(2048);
    }
    const start: readonly [number, number] = [697.9952, 1640.7618];
    const poi01: readonly [number, number] = [417.9952, 1220.7618];
    const a = localToImagePixel(start, base);
    const b = localToImagePixel(poi01, base);
    expect(Math.hypot(a[0] - b[0], a[1] - b[1]) * ratioX).toBeCloseTo(Math.hypot(280, 420), 8);
  });

  it('ties T-016 numerical DTM/slope samples to the same region and projected origin', () => {
    expect(samples.regionId).toBe(region.id);
    expect(samples.coordinateFrame).toBe('MARS_LOCAL_METERS');
    expect(samples.extent).toEqual(region.extent);
    expect(samples.georeferencing.originProjectedXY).toEqual(region.originProjectedXY);
    expect(samples.georeferencing.rasterPixelSizeM).toHaveLength(2);
    for (const pixelSizeM of samples.georeferencing.rasterPixelSizeM) {
      expect(Number.isFinite(pixelSizeM)).toBe(true);
      expect(pixelSizeM).toBeGreaterThan(0);
      expect(pixelSizeM).toBeLessThan(5);
    }
    expect(config.layers.find((l) => l.id === 'athabasca-slope')?.source.product).toBe('candidate11_slope_deg.tif');
  });

  it('validates per-edge coverage mathematically, without treating NoData as flat ground', () => {
    expect(samples.edges.length).toBeGreaterThan(0);
    expect(new Set(samples.edges.map((e) => e.id)).size).toBe(samples.edges.length);
    for (const edge of samples.edges) {
      expect(Number.isInteger(edge.plannedSamplePositions)).toBe(true);
      expect(edge.plannedSamplePositions).toBeGreaterThan(0);
      expect(Number.isInteger(edge.validJointSamplePositions)).toBe(true);
      expect(edge.validJointSamplePositions).toBeGreaterThanOrEqual(0);
      expect(edge.validJointSamplePositions).toBeLessThanOrEqual(edge.plannedSamplePositions);
      if (edge.coverageFraction === null) {
        // Unknown coverage is NOT 0% or 100%; never infer it.
        continue;
      }
      expect(edge.coverageFraction).toBeGreaterThanOrEqual(0);
      expect(edge.coverageFraction).toBeLessThanOrEqual(1);
      expect(edge.coverageFraction).toBeCloseTo(
        edge.validJointSamplePositions / edge.plannedSamplePositions,
        7,
      );
    }
  });
});
