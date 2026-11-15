
import { describe, expect, it } from "vitest";

import {
  preliminaryGraphNodes,
  getPreliminaryGraphNode,
  getPreliminaryStartNode,
} from "../lib/preliminaryGraphNodes";

import sciencePointsData from "../data/sciencePoints_preliminary.json";
import startPointData from "../data/startPoint_preliminary.json";

const REGION_SIZE_M = 2500;

describe("Preliminary graph nodes", () => {
  it("contains exactly five nodes", () => {
    expect(preliminaryGraphNodes).toHaveLength(5);
  });

  it("contains the start and all four science targets", () => {
    const ids = preliminaryGraphNodes.map(
      (node) => node.id
    );

    expect(ids).toEqual([
      "S",
      "P01",
      "P02",
      "P03",
      "P04",
    ]);
  });

  it("uses unique node IDs", () => {
    const ids = preliminaryGraphNodes.map(
      (node) => node.id
    );

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps every node within Candidate 11", () => {
    for (const node of preliminaryGraphNodes) {
      expect(Number.isFinite(node.x)).toBe(true);
      expect(Number.isFinite(node.y)).toBe(true);

      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.x).toBeLessThanOrEqual(
        REGION_SIZE_M
      );

      expect(node.y).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeLessThanOrEqual(
        REGION_SIZE_M
      );
    }
  });

  it("uses the original preliminary start data", () => {
    const start = getPreliminaryStartNode();

    expect(start.id).toBe(startPointData.id);
    expect(start.role).toBe("START");

    expect(start.x).toBe(
      startPointData.localXY_m[0]
    );

    expect(start.y).toBe(
      startPointData.localXY_m[1]
    );

    expect(start.elevationM).toBe(
      startPointData.elevationM
    );

    expect(start.slopeDeg).toBe(
      startPointData.slopeDeg
    );
  });

  it("preserves the four science target coordinates", () => {
    for (const point of sciencePointsData.points) {
      const node = getPreliminaryGraphNode(
        point.id
      );

      expect(node).toBeDefined();
      expect(node?.role).toBe("SCIENCE_TARGET");

      expect(node?.x).toBe(point.localXY_m[0]);
      expect(node?.y).toBe(point.localXY_m[1]);

      expect(node?.elevationM).toBe(
        point.elevationM
      );

      expect(node?.slopeDeg).toBe(
        point.slopeDeg
      );
    }
  });

  it("keeps all nodes preliminary", () => {
    for (const node of preliminaryGraphNodes) {
      expect(node.status).toBe("PRELIMINARY");
    }
  });

  it("provides node lookup by ID", () => {
    expect(
      getPreliminaryGraphNode("P03")?.id
    ).toBe("P03");

    expect(
      getPreliminaryGraphNode("UNKNOWN")
    ).toBeUndefined();
  });
});
