import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SLOPE_TRANSPARENCY_PERCENT,
  normalizeTransparencyPercent,
  transparencyPercentToOpacity,
} from './slopeTransparency';

describe('T-021: slope raster transparency', () => {
  it('preserves the previous 0.7 slope overlay opacity by default', () => {
    expect(DEFAULT_SLOPE_TRANSPARENCY_PERCENT).toBe(30);
    expect(transparencyPercentToOpacity(DEFAULT_SLOPE_TRANSPARENCY_PERCENT)).toBeCloseTo(0.7);
  });

  it('makes the raster opaque at 0% transparency', () => {
    expect(transparencyPercentToOpacity(0)).toBe(1);
  });

  it('makes the raster invisible at 100% transparency', () => {
    expect(transparencyPercentToOpacity(100)).toBe(0);
  });

  it('handles intermediate transparency without changing map coordinates', () => {
    expect(transparencyPercentToOpacity(50)).toBe(0.5);
    expect(transparencyPercentToOpacity(75)).toBe(0.25);
  });

  it('clamps values outside the slider range', () => {
    expect(normalizeTransparencyPercent(-10)).toBe(0);
    expect(normalizeTransparencyPercent(110)).toBe(100);
    expect(transparencyPercentToOpacity(-10)).toBe(1);
    expect(transparencyPercentToOpacity(110)).toBe(0);
  });

  it('does not send non-finite opacity to OpenLayers', () => {
    expect(normalizeTransparencyPercent(NaN)).toBe(DEFAULT_SLOPE_TRANSPARENCY_PERCENT);
    expect(transparencyPercentToOpacity(Infinity)).toBeCloseTo(0.7);
  });
});
