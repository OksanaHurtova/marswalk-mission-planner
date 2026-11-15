import { describe, it, expect } from "vitest";
import { buildRouteResult } from "../lib/routeResult";
import mockNetwork from "../data/mockNetwork.json";

describe("RouteResult", () => {
  it("builds a complete route result", () => {
    const result = buildRouteResult(
      mockNetwork,
      "S",
      "T",
      false
    );

    expect(result).not.toBeNull();

    expect(result?.nodeIds).toEqual([
      "S",
      "B",
      "T",
    ]);

    expect(result?.edgeIds).toEqual([
      "SB",
      "BT",
    ]);

    expect(result?.distanceM).toBe(250);
    expect(result?.balancedCost).toBeCloseTo(1.5625);
    expect(result?.difficultyIndex).toBe(0);

    expect(result?.geometry).toEqual([
      [0, 0],
      [100, 75],
      [200, 0],
    ]);

    expect(result?.meanSlopeDegrees).toBeNull();

    expect(result?.warnings).toContain(
      "Slope data was not included in the route cost calculation."
    );
  });

  it("returns null when the destination is unreachable", () => {
    const blockedGraph = {
      ...mockNetwork,
      edges: mockNetwork.edges.map((edge) => ({
        ...edge,
        enabled: edge.id !== "AT" && edge.id !== "BT",
      })),
    };

    const result = buildRouteResult(
      blockedGraph,
      "S",
      "T",
      false
    );

    expect(result).toBeNull();
  });
});
