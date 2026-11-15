/**
 * Presentation-only translation of internal task identifiers.
 * Do not alter source IDs, GIS provenance, route calculations or raw errors.
 */
export function publicScienceText(value: string): string {
  return value
    .replace(/\bT-016 mean centerline slope\b/g, 'mean centerline slope from 1 m terrain sampling')
    .replace(/\bT-016 contains\b/g, 'The 1 m centerline dataset contains')
    .replace(/\bT-016\b/g, '1 m centerline measurements')
    .replace(/\bT-029 nearby pixels\b/g, 'terrain pixels within the ±5 m screening strip')
    .replace(/\bT-029\b/g, 'nearby terrain screening (±5 m)')
    .replace(/\bT-028 review\b/g, 'GIS corridor review')
    .replace(/\bT-028\b/g, 'GIS corridor review')
    .replace(/\bT028_REPORT\b/g, 'GIS verification report')
    .replace(/\bT028_P04_MAX_CSV\b/g, 'P04 maximum-slope screening data')
    .replace(/\bT028_P04_MEAN_CSV\b/g, 'P04 mean-slope scenario data')
    .replace(/\bT016_CENTERLINE\b/g, '1 m centerline measurements')
    .replace(/\bT-\d{3}\b/g, 'terrain research')
    .replace(/\bT0\d{2}(?:_[A-Z0-9_]+)?\b/g, 'terrain verification source');
}
