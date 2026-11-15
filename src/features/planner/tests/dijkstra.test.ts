import { describe, it, expect } from "vitest";
import { dijkstra } from "../lib/dijkstra";
import mockNetwork from "../data/mockNetwork.json";

describe("Dijkstra", () => {
  it("finds the route with the lowest Balanced Cost", () => {
    const result = dijkstra(
      mockNetwork,
      "S",
      "T",
      false
    );

    expect(result).toEqual(["SB", "BT"]);
  });

  it("returns null when the target is unreachable", () => {
    const blockedGraph = {
      ...mockNetwork,
      edges: mockNetwork.edges.map((edge) => ({
        ...edge,
        enabled: edge.id !== "AT" && edge.id !== "BT",
      })),
    };

    const result = dijkstra(
      blockedGraph,
      "S",
      "T",
      false
    );

    expect(result).toBeNull();
  });

  it("finds an alternative route when an edge is blocked", () => {
    const detourGraph = {
      ...mockNetwork,
      edges: mockNetwork.edges.map((edge) => ({
        ...edge,
        enabled: edge.id !== "BT",
      })),
    };

    const result = dijkstra(
      detourGraph,
      "S",
      "T",
      false
    );

    expect(result).toEqual(["SA", "AT"]);
  });

  it("returns an empty route when start equals target", () => {
    const result = dijkstra(
      mockNetwork,
      "S",
      "S",
      false
    );

    expect(result).toEqual([]);
  });

  it("throws an error when the start node does not exist", () => {
    expect(() =>
      dijkstra(
        mockNetwork,
        "UNKNOWN",
        "T",
        false
      )
    ).toThrow("Start or target node is missing from the graph");
  });
});
