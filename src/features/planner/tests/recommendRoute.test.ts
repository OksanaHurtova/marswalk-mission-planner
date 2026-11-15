import { describe, expect, it } from "vitest";
import { recommendRoute } from "../lib/recommendRoute";
import mockNetwork from "../data/mockNetwork.json";

describe("Route recommendation", () => {
  it("recommends the lowest-cost route for the mock network", () => {
    const result = recommendRoute(mockNetwork, "S", "T", false);

    expect(result.errors).toEqual([]);
    expect(result.route?.nodeIds).toEqual(["S", "B", "T"]);
    expect(result.route?.edgeIds).toEqual(["SB", "BT"]);
    expect(result.route?.distanceM).toBe(250);
    expect(result.route?.balancedCost).toBeCloseTo(1.5625);
  });

  it("supports an empty route when start equals target", () => {
    const result = recommendRoute(mockNetwork, "S", "S", false);

    expect(result.errors).toEqual([]);
    expect(result.route?.edgeIds).toEqual([]);
    expect(result.route?.distanceM).toBe(0);
  });

  it("reports an unreachable target without rejecting a disconnected graph", () => {
    const blockedGraph = {
      ...mockNetwork,
      edges: mockNetwork.edges.map((edge) => ({
        ...edge,
        enabled: edge.id !== "AT" && edge.id !== "BT",
      })),
    };

    const result = recommendRoute(blockedGraph, "S", "T", false);

    expect(result.route).toBeNull();
    expect(result.errors).toEqual([]);
    expect(result.warnings).toContain(
      "No route found between the selected nodes."
    );
  });

  it("rejects an invalid network before searching", () => {
    const invalidGraph = {
      ...mockNetwork,
      nodes: [...mockNetwork.nodes, mockNetwork.nodes[0]],
    };

    const result = recommendRoute(invalidGraph, "S", "T", false);

    expect(result.route).toBeNull();
    expect(result.errors.join(" ")).toContain("Duplicate node ID");
  });

  it("rejects an unknown starting node", () => {
    const result = recommendRoute(mockNetwork, "UNKNOWN", "T", false);

    expect(result.route).toBeNull();
    expect(result.errors.join(" ")).toContain("Start node UNKNOWN");
  });

  it("rejects mock data when DTM routing is required", () => {
    const result = recommendRoute(mockNetwork, "S", "T", true);

    expect(result.route).toBeNull();
    expect(result.errors.join(" ")).toContain("DTM routing");
  });

  it("uses measured slope inputs in DTM mode", () => {
    const dtmGraph = {
      ...mockNetwork,
      edges: mockNetwork.edges.map((edge) => ({
        ...edge,
        slopeScore: 0.2,
        slopeDegrees: 5,
        sourceIds: ["HIRISE_DTM"],
      })),
    };

    const result = recommendRoute(dtmGraph, "S", "T", true);

    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.route?.edgeIds).toEqual(["SB", "BT"]);
    expect(result.route?.meanSlopeDegrees).toBe(5);
    expect(result.route?.balancedCost).toBeCloseTo(1.35);
  });
});
