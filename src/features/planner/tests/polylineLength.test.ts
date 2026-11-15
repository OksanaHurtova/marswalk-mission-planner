
import { describe, it, expect } from "vitest";
import { calculatePolylineLength } from "../lib/polylineLength";
import mockNetwork from "../data/mockNetwork.json";

describe("Polyline length", () => {
  it("calculates the length of a bent polyline", () => {
    const geometry = [
      [0, 0],
      [3, 4],
      [6, 0],
    ];

    expect(calculatePolylineLength(geometry)).toBe(10);
  });

  it("matches the existing mock edge lengths", () => {
    for (const edge of mockNetwork.edges) {
      expect(
        calculatePolylineLength(edge.geometry)
      ).toBeCloseTo(edge.lengthM);
    }
  });

  it("rejects a polyline with one point", () => {
    expect(() =>
      calculatePolylineLength([[0, 0]])
    ).toThrow();
  });

  it("rejects invalid coordinates", () => {
    expect(() =>
      calculatePolylineLength([
        [0, 0],
        [Infinity, 10],
      ])
    ).toThrow();
  });

  it("rejects a zero-length polyline", () => {
    expect(() =>
      calculatePolylineLength([
        [0, 0],
        [0, 0],
      ])
    ).toThrow();
  });
});
