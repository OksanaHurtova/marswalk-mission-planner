import { describe, expect, it } from "vitest";
import { validateGraph } from "../lib/graphValidation";
import mockNetwork from "../data/mockNetwork.json";

describe("Graph validation", () => {
  it("accepts the current mock network", () => {
    const result = validateGraph(mockNetwork);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("rejects duplicate node IDs", () => {
    const graph = { ...mockNetwork, nodes: [...mockNetwork.nodes, mockNetwork.nodes[0]] };
    expect(validateGraph(graph).errors.join(" ")).toContain("Duplicate node ID");
  });

  it("rejects duplicate edge IDs", () => {
    const graph = { ...mockNetwork, edges: [...mockNetwork.edges, mockNetwork.edges[0]] };
    expect(validateGraph(graph).errors.join(" ")).toContain("Duplicate edge ID");
  });

  it("rejects an edge with an unknown node", () => {
    const graph = structuredClone(mockNetwork);
    graph.edges[0].to = "UNKNOWN";
    expect(validateGraph(graph).errors.join(" ")).toContain("unknown node");
  });

  it("rejects a negative edge length", () => {
    const graph = structuredClone(mockNetwork);
    graph.edges[0].lengthM = -100;
    expect(validateGraph(graph).errors.join(" ")).toContain("lengthM");
  });

  it("rejects a difficulty score outside the valid range", () => {
    const graph = structuredClone(mockNetwork);
    graph.edges[0].difficultyScore = 2;
    expect(validateGraph(graph).errors.join(" ")).toContain("difficultyScore");
  });

  it("rejects missing source metadata", () => {
    const invalidEdge: Record<string, unknown> = { ...mockNetwork.edges[0] };
    delete invalidEdge.sourceIds;
    const graph = { ...mockNetwork, edges: [invalidEdge, ...mockNetwork.edges.slice(1)] };
    expect(validateGraph(graph).errors.join(" ")).toContain("sourceIds");
  });

  it("requires real slopes when DTM routing is enabled", () => {
    const result = validateGraph(mockNetwork, { requireSlope: true });
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toContain("DTM routing");
  });

  it("rejects geometry that disagrees with lengthM", () => {
    const graph = structuredClone(mockNetwork);
    graph.edges[0].lengthM = 200;
    expect(validateGraph(graph).errors.join(" ")).toContain("polyline length");
  });

  it("detects disconnected enabled corridors", () => {
    const graph = { ...mockNetwork,
      edges: mockNetwork.edges.map(edge => ({
        ...edge,
        enabled: edge.id !== "AT" && edge.id !== "BT",
      })),
    };
    expect(validateGraph(graph).errors.join(" ")).toContain("disconnected");
  });
});
