import { describe, it, expect } from "vitest";
import { calculateBalancedCost } from "../lib/balancedCost";

describe("Balanced Cost", () => {
  it("correctly calculates the cost of a difficult corridor", () => {
    const cost = calculateBalancedCost(
      {
        lengthM: 100,
        difficultyScore: 1,
        slopeScore: null,
      },
      false
    );

    expect(cost).toBe(1);
  });

  it("compares two mock routes", () => {
    const difficult = {
      lengthM: 100,
      difficultyScore: 1,
      slopeScore: null,
    };

    const easier = {
      lengthM: 125,
      difficultyScore: 0,
      slopeScore: null,
    };

    const routeA =
      calculateBalancedCost(difficult, false) * 2;

    const routeB =
      calculateBalancedCost(easier, false) * 2;

    expect(routeA).toBe(2);
    expect(routeB).toBe(1.5625);
    expect(routeB).toBeLessThan(routeA);
  });

  it("includes slope when slope data is available", () => {
    const cost = calculateBalancedCost(
      {
        lengthM: 100,
        difficultyScore: 0.5,
        slopeScore: 0.25,
      },
      true
    );

    expect(cost).toBeCloseTo(0.7);
  });

  it("does not substitute zero for missing slope data", () => {
    expect(() =>
      calculateBalancedCost(
        {
          lengthM: 100,
          difficultyScore: 0.5,
          slopeScore: null,
        },
        true
      )
    ).toThrow();
  });
});
