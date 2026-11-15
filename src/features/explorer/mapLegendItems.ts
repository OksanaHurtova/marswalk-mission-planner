/** UI-only legend: actual marker and route styles remain owned by MarsMap and RouteOverlay. */
export type MapLegendItem = {
  id: 'poi' | 'selected' | 'start' | 'route';
  label: string;
  color: string;
  shape: 'circle' | 'diamond' | 'dashed-line';
};

export function getMapLegendItems(
  hasRoute: boolean,
  selectedTargetId: string | null,
): MapLegendItem[] {
  const items: MapLegendItem[] = [
    { id: 'poi', label: 'Science point (POI)', color: '#ffbd55', shape: 'circle' },
  ];
  if (selectedTargetId) {
    items.push({ id: 'selected', label: `Selected target ${selectedTargetId}`, color: '#ffe36a', shape: 'circle' });
  }
  if (hasRoute) {
    items.push({ id: 'start', label: 'Route start S', color: '#22e4a8', shape: 'diamond' });
    items.push({ id: 'route', label: 'Experimental route', color: '#00e9ff', shape: 'dashed-line' });
  }
  return items;
}
