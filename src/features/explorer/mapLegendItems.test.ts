import { describe, expect, it } from 'vitest';
import { getMapLegendItems } from './mapLegendItems';

describe('T-022 map legend', () => {
  it('shows a POI marker even with no route', () => {
    expect(getMapLegendItems(false, null).map((x) => x.id)).toEqual(['poi']);
  });
  it('shows S and experimental corridor only with route geometry', () => {
    expect(getMapLegendItems(true, null).map((x) => x.id)).toEqual(['poi', 'start', 'route']);
  });
  it('adds actual selected target ID when provided', () => {
    const items = getMapLegendItems(true, 'P04');
    expect(items.find((x) => x.id === 'selected')?.label).toContain('P04');
  });
  it('matches route color and line pattern of RouteOverlay', () => {
    const route = getMapLegendItems(true, null).find((x) => x.id === 'route');
    expect(route).toMatchObject({ color: '#00e9ff', shape: 'dashed-line' });
  });
  it('matches the established Start S and POI marker colors', () => {
    const items = getMapLegendItems(true, null);
    expect(items.find((x) => x.id === 'start')?.color).toBe('#22e4a8');
    expect(items.find((x) => x.id === 'poi')?.color).toBe('#ffbd55');
  });
  it('does not confuse selected marker and normal marker', () => {
    const items = getMapLegendItems(false, 'P01');
    expect(items.find((x) => x.id === 'selected')?.color).toBe('#ffe36a');
    expect(items.some((x) => x.id === 'route')).toBe(false);
  });
});
