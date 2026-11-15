/** Controls the visual blending of the SLOPE image, not GIS measurements. */
export const DEFAULT_SLOPE_TRANSPARENCY_PERCENT = 30;

/** Handles invalid/programmatic inputs without ever passing NaN to OpenLayers. */
export function normalizeTransparencyPercent(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SLOPE_TRANSPARENCY_PERCENT;
  return Math.max(0, Math.min(100, value));
}

/** OpenLayers layer opacity: 1 = fully opaque, 0 = fully transparent. */
export function transparencyPercentToOpacity(percent: number): number {
  return 1 - normalizeTransparencyPercent(percent) / 100;
}
