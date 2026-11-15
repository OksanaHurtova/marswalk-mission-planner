import { describe, expect, it } from 'vitest';
import network from '../data/network.json';
import provenance from '../data/provenance.json';

type SourceRecord = {
  type: string;
  url?: string;
  path?: string;
  derivedFrom?: string[];
  availability: string;
};

type ProvenanceRecord = {
  sourceIds: string[];
  from?: string;
  to?: string;
  enabled?: boolean;
  status: string;
};

const sources = provenance.sources as Record<string, SourceRecord>;
const pois = provenance.pois as Record<string, ProvenanceRecord>;
const edges = provenance.edges as Record<string, ProvenanceRecord>;

function assertKnownSources(record: ProvenanceRecord, recordId: string): void {
  expect(record.sourceIds.length, `${recordId} has no source references`).toBeGreaterThan(0);
  for (const sourceId of record.sourceIds) {
    expect(sources[sourceId], `${recordId} references unknown source ${sourceId}`).toBeDefined();
  }
}

describe('Scientific provenance', () => {
  it('belongs to the same study region as the route network', () => {
    expect(provenance.regionId).toBe(network.regionId);
    expect(provenance.schemaVersion).toBe(1);
  });

  it('covers every science target P01–P04 with traceable sources', () => {
    expect(Object.keys(pois).sort()).toEqual(['P01', 'P02', 'P03', 'P04']);
    for (const [id, record] of Object.entries(pois)) {
      assertKnownSources(record, id);
      expect(record.sourceIds).toContain('HIRISE_ORTHO');
      expect(record.sourceIds).toContain(`${id}_SCREENING`);
      expect(record.status).toBe('PRELIMINARY_TEAM_ANNOTATION');
    }
  });

  it('covers all 16 annotated graph edges with matching endpoints and enabled flags', () => {
    expect(Object.keys(edges).sort()).toEqual(network.edges.map((edge) => edge.id).sort());
    for (const edge of network.edges) {
      const record = edges[edge.id];
      assertKnownSources(record, edge.id);
      expect(record.from).toBe(edge.from);
      expect(record.to).toBe(edge.to);
      expect(record.enabled).toBe(edge.enabled);
      expect(record.status).toBe('PRELIMINARY_ROUTE_CORRIDOR');
      for (const sourceId of edge.sourceIds) {
        expect(record.sourceIds).toContain(sourceId);
      }
    }
  });

  it('links every POI and edge to at least one identifiable public HiRISE source page', () => {
    for (const [id, record] of Object.entries({ ...pois, ...edges })) {
      const hasOfficialSource = record.sourceIds.some((sourceId) => {
        const source = sources[sourceId];
        return (
          source?.availability === 'PUBLIC_PRODUCT_PAGE' &&
          typeof source.url === 'string' &&
          new URL(source.url).hostname === 'www.uahirise.org'
        );
      });
      expect(hasOfficialSource, `${id} lacks an official primary-source page`).toBe(true);
    }
  });

  it('includes a version-controlled screening report path for every POI and edge', () => {
    for (const [id, record] of Object.entries({ ...pois, ...edges })) {
      const attachedReports = record.sourceIds
        .map((sourceId) => sources[sourceId])
        .filter((source): source is SourceRecord & { path: string } =>
          typeof source?.path === 'string',
        );
      expect(attachedReports.length, `${id} has no team review report`).toBeGreaterThan(0);
      for (const source of attachedReports) {
        expect(source.path).toMatch(/^docs\/science\/p0[1-4]\/P0[1-4]_corridor_evidence\.md$/);
        expect(source.availability).toBe('VERSION_CONTROLLED_PROJECT_FILE');
      }
    }
  });

  it('clearly distinguishes public NASA products from untracked team handoffs', () => {
    for (const source of Object.values(sources)) {
      if (source.url) expect(source.url.startsWith('https://')).toBe(true);
      if (source.derivedFrom) {
        for (const parentId of source.derivedFrom) expect(sources[parentId]).toBeDefined();
      }
    }
    expect(sources.T028_REPORT.availability).toBe('TEAM_HANDOFF_NOT_TRACKED_IN_REPOSITORY');
    expect(sources.T028_P04_MAX_CSV.availability).toBe('TEAM_HANDOFF_NOT_TRACKED_IN_REPOSITORY');
    expect(sources.T028_P04_MEAN_CSV.availability).toBe('TEAM_HANDOFF_NOT_TRACKED_IN_REPOSITORY');
  });
});
