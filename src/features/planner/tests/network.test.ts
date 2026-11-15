import { describe, expect, it } from "vitest";

import network from "../data/network.json";
import sciencePoints from "../data/sciencePoints.json";

import { validateGraph } from "../lib/graphValidation";
import { recommendRoute } from "../lib/recommendRoute";

describe("Candidate 11 experimental route network", () => {
  it("contains 16 nodes and 16 edges", () => {
    expect(network.nodes).toHaveLength(16);
    expect(network.edges).toHaveLength(16);
  });

  it("uses unique IDs and coordinates inside the study area", () => {
    const nodeIds = network.nodes.map((node) => node.id);
    const edgeIds = network.edges.map((edge) => edge.id);

    expect(new Set(nodeIds).size).toBe(nodeIds.length);
    expect(new Set(edgeIds).size).toBe(edgeIds.length);

    for (const node of network.nodes) {
      const [x, y] = node.coordinates;

      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(2500);

      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(2500);
    }
  });

  it("matches the science target coordinates", () => {
    for (const point of sciencePoints.points) {
      const node = network.nodes.find(
        (item) => item.id === point.nodeId
      );

      expect(node).toBeDefined();

      expect(node?.coordinates[0]).toBeCloseTo(
        point.localXY_m[0],
        2
      );

      expect(node?.coordinates[1]).toBeCloseTo(
        point.localXY_m[1],
        2
      );
    }
  });

  it("passes complete graph validation", () => {
    const result = validateGraph(network, {
      requireSlope: true,
      requireSources: true,
      requireConnected: true,
    });

    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it("finds experimental routes to all four targets", () => {
    for (const targetId of [
      "P01",
      "P02",
      "P03",
      "P04",
    ]) {
      const result = recommendRoute(
        network,
        "S",
        targetId,
        true
      );

      expect(result.errors).toEqual([]);
      expect(result.route).not.toBeNull();

      expect(
        result.route?.distanceM ?? 0
      ).toBeGreaterThan(0);
    }
  });

  it("excludes the unapproved mean-slope alternative", () => {
    const alternative = network.edges.find(
      (edge) => edge.id === "P04_MEAN_ALTERNATIVE"
    );

    expect(alternative).toBeDefined();
    expect(alternative?.enabled).toBe(false);

    const result = recommendRoute(
      network,
      "S",
      "P04",
      true
    );

    expect(result.errors).toEqual([]);
    expect(result.route).not.toBeNull();

    expect(result.route?.edgeIds).not.toContain(
      "P04_MEAN_ALTERNATIVE"
    );

    expect(
      result.route?.distanceM ?? 0
    ).toBeGreaterThan(2900);

    expect(
      result.route?.distanceM ?? 0
    ).toBeLessThan(3150);

    expect(
      network.validation.finalRouteApproval
    ).toBe(false);

    expect(
      network.validation.thresholdIsNASASafetyStandard
    ).toBe(false);
  });
});
