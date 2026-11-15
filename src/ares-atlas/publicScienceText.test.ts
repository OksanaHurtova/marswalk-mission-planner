import { describe, expect, it } from 'vitest';
import { publicScienceText } from './publicScienceText';

describe('public-facing science terminology', () => {
  it('explains centerline sampling without internal task labels', () => {
    const text = publicScienceText('Updated DTM: T-016 mean centerline slope divided by 15 degrees');
    expect(text).toContain('mean centerline slope from 1 m terrain sampling');
    expect(text).not.toMatch(/T-\d{3}/);
  });

  it('keeps measurement limits while replacing task identifiers', () => {
    const text = publicScienceText('T-029 nearby pixels and T-028 review; T016_CENTERLINE');
    expect(text).toContain('terrain pixels within the ±5 m screening strip');
    expect(text).toContain('GIS corridor review');
    expect(text).not.toMatch(/\bT(?:-|0)\d{2,3}\b/);
  });

  it('does not modify scientific values or citation names', () => {
    const text = 'HiRISE / NASA / JPL — 15° and ±5 m, P04_C3';
    expect(publicScienceText(text)).toBe(text);
  });
});
