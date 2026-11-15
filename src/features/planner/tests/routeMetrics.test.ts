import { describe, expect, it } from "vitest";
import { calculateRouteMetrics } from "../lib/routeMetrics";
import mockNetwork from "../data/mockNetwork.json";

describe("Route metrics", () => {
  it("calculates distance and cost for the selected mock route", () => {
    const edges = mockNetwork.edges.filter(
      (edge) => edge.id === "SB" || edge.id === "BT"
    );

    const metrics = calculateRouteMetrics(edges, false);

    expect(metrics.distanceM).toBe(250);
    expect(metrics.balancedCost).toBeCloseTo(1.5625);
    expect(metrics.difficultyIndex).toBe(0);
    expect(metrics.meanSlopeDegrees).toBeNull();
  });

  it("calculates length-weighted difficulty and mean slope", () => {
    const metrics = calculateRouteMetrics(
      [
        {
          lengthM: 100,
          difficultyScore: 0.5,
          slopeScore: 0.25,
          slopeDegrees: 10,
        },
        {
          lengthM: 200,
          difficultyScore: 1,
          slopeScore: 0.5,
          slopeDegrees: 20,
        },
      ],
      true
    );

    expect(metrics.distanceM).toBe(300);
    expect(metrics.balancedCost).toBeCloseTo(2.5);
    expect(metrics.difficultyIndex).toBeCloseTo(250 / 300);
    expect(metrics.meanSlopeDegrees).toBeCloseTo(5000 / 300);
  });

  it("returns null indices for an empty route", () => {
    const metrics = calculateRouteMetrics([], false);

    expect(metrics.distanceM).toBe(0);
    expect(metrics.balancedCost).toBe(0);
    expect(metrics.difficultyIndex).toBeNull();
    expect(metrics.meanSlopeDegrees).toBeNull();
  });

  it("does not report mean slope in non-DTM mode", () => {
    const metrics = calculateRouteMetrics(
      [
        {
          lengthM: 100,
          difficultyScore: 0,
          slopeScore: 0.5,
          slopeDegrees: 12,
        },
      ],
      false
    );

    expect(metrics.meanSlopeDegrees).toBeNull();
  });

  it("rejects missing slope scores when DTM mode is enabled", () => {
    expect(() =>
      calculateRouteMetrics(
        [
          {
            lengthM: 100,
            difficultyScore: 0.5,
            slopeScore: null,
            slopeDegrees: null,
          },
        ],
        true
      )
    ).toThrow("Valid slope data is required");
  });
});
