import { describe, expect, it } from "vitest";

import network from "../data/network.json";
import { validateGraph } from "../lib/graphValidation";
import { recommendRoute } from "../lib/recommendRoute";

const SCIENCE_TARGET_IDS = ["P01", "P02", "P03", "P04"] as const;
const EXPERIMENTAL_ALTERNATIVE_ID = "P04_MEAN_ALTERNATIVE";
const [minX, minY, maxX, maxY] = network.extent;

function withinStudyArea(point: readonly number[]): boolean {
  return (
    point.length === 2 &&
    point.every(Number.isFinite) &&
    point[0] >= minX &&
    point[0] <= maxX &&
    point[1] >= minY &&
    point[1] <= maxY
  );
}

describe("T-028 candidate route graph acceptance", () => {
  it("uses the agreed Martian local coordinate system and study extent", () => {
    expect(network.regionId).toBe("athabasca_candidate_11");
    expect(network.coordinateFrame).toBe("MARS_LOCAL_METERS");
    expect(network.extent).toEqual([0, 0, 2500, 2500]);
  });

  it("contains between 12 and 18 route corridors", () => {
    expect(network.edges.length).toBeGreaterThanOrEqual(12);
    expect(network.edges.length).toBeLessThanOrEqual(18);
    expect(network.edges).toHaveLength(16);
  });

  it("contains the start, four science targets, and unique node IDs", () => {
    const ids = network.nodes.map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("S");
    for (const targetId of SCIENCE_TARGET_IDS) {
      expect(ids).toContain(targetId);
    }
  });

  it("keeps every node and polyline vertex inside the candidate square", () => {
    for (const node of network.nodes) {
      expect(withinStudyArea(node.coordinates), node.id).toBe(true);
    }
    for (const edge of network.edges) {
      for (const vertex of edge.geometry) {
        expect(withinStudyArea(vertex), edge.id).toBe(true);
      }
    }
  });

  it("passes strict geometry, cost, source, and connectivity validation", () => {
    const result = validateGraph(network, {
      requireSlope: true,
      requireSources: true,
      requireConnected: true,
    });
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it("has a DTM-based experimental route from S to every science target", () => {
    for (const targetId of SCIENCE_TARGET_IDS) {
      const result = recommendRoute(network, "S", targetId, true);
      expect(result.errors, targetId).toEqual([]);
      expect(result.route, targetId).not.toBeNull();
      expect(result.route?.nodeIds[0]).toBe("S");
      expect(result.route?.nodeIds.at(-1)).toBe(targetId);
      expect(result.route?.distanceM).toBeGreaterThan(0);
    }
  });

  it("keeps all enabled corridors within the original experimental grid rule", () => {
    const enabledEdges = network.edges.filter((edge) => edge.enabled);
    expect(enabledEdges).toHaveLength(15);
    for (const edge of enabledEdges) {
      expect(edge.blockedCellsUnderMax15Rule, edge.id).toBe(0);
      expect(edge.sampledCellCount, edge.id).toBeGreaterThan(0);
      expect(edge.sourceIds.length, edge.id).toBeGreaterThan(0);
      expect(edge.reviewStatus).toBe("EXPERIMENTAL_NOT_APPROVED");
    }
  });

  it("documents a second P04 corridor but does not enable it for routing", () => {
    const alternative = network.edges.find(
      (edge) => edge.id === EXPERIMENTAL_ALTERNATIVE_ID
    );
    expect(alternative).toBeDefined();
    expect(alternative?.from).toBe("S");
    expect(alternative?.to).toBe("P04");
    expect(alternative?.enabled).toBe(false);
    expect(alternative?.corridorScenario).toBe("MEAN_15DEG_5PIX");
    expect(alternative?.blockedCellsUnderMax15Rule).toBeGreaterThan(0);
    expect(alternative?.reviewStatus).toBe("EXPERIMENTAL_NOT_APPROVED");
  });

  it("uses only the conservative P04 corridor for route recommendations", () => {
    const result = recommendRoute(network, "S", "P04", true);
    const alternative = network.edges.find(
      (edge) => edge.id === EXPERIMENTAL_ALTERNATIVE_ID
    );
    expect(result.route).not.toBeNull();
    expect(result.route?.edgeIds).not.toContain(EXPERIMENTAL_ALTERNATIVE_ID);
    expect(result.route?.edgeIds).toHaveLength(6);
    expect(result.route?.distanceM).toBeGreaterThan(
      alternative?.lengthM ?? Number.POSITIVE_INFINITY
    );
  });

  it("explicitly preserves the unresolved GIS approval status", () => {
    expect(network.status).toBe("EXPERIMENTAL_CANDIDATE_GRAPH");
    expect(network.validation.finalRouteApproval).toBe(false);
    expect(network.validation.orthophotoCorridorsReviewed).toBe(false);
    expect(network.validation.thresholdIsNASASafetyStandard).toBe(false);
    expect(network.edges.every(
      (edge) => edge.reviewStatus === "EXPERIMENTAL_NOT_APPROVED"
    )).toBe(true);
  });
});
