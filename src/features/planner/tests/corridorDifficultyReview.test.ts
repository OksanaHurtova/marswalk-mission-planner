import { describe, expect, it } from "vitest";

import network from "../data/network.json";

import {
  corridorDifficultyReviews,
  explainCorridorDifficulty,
  getCorridorDifficultyReview,
} from "../lib/corridorDifficultyReview";

describe("T-029 corridor difficulty evidence", () => {
  it("covers all 16 network edges exactly once", () => {
    const ids = corridorDifficultyReviews.map(
      (review) => review.edgeId
    );

    expect(corridorDifficultyReviews).toHaveLength(16);
    expect(new Set(ids).size).toBe(16);

    expect(ids.slice().sort()).toEqual(
      network.edges.map((edge) => edge.id).sort()
    );
  });

  it("preserves original numeric difficulty and slope data", () => {
    for (const edge of network.edges) {
      const review =
        getCorridorDifficultyReview(edge.id);

      expect(review).toBeDefined();

      expect(review?.lengthM).toBe(
        edge.lengthM
      );

      expect(
        review?.numericalEvidence.difficultyScore
      ).toBe(edge.difficultyScore);

      expect(
        review?.numericalEvidence.slopeScore
      ).toBe(edge.slopeScore);

      expect(
        review?.numericalEvidence.meanSlopeDegrees
      ).toBe(edge.slopeDegrees);

      expect(
        review?.numericalEvidence.p95CellMaxSlopeDegrees
      ).toBe(edge.p95CellMaxSlopeDeg);

      expect(
        review?.numericalEvidence.sourceIds
      ).toEqual(edge.sourceIds);
    }
  });

  it("does not invent confirmed visual obstacles", () => {
    for (const review of corridorDifficultyReviews) {
      expect(
        review.visualEvidence.reviewStatus
      ).toBe("PENDING_ORTHOPHOTO_REVIEW");

      expect(
        review.visualEvidence.confirmedFactors
      ).toEqual([]);

      expect(
        review.visualEvidence.independentVisualDifficultyScore
      ).toBeNull();

      expect(
        review.visualEvidence.factorsToCheck.length
      ).toBeGreaterThan(0);
    }
  });

  it("retains the documented slope-derived difficulty method", () => {
    for (const review of corridorDifficultyReviews) {
      expect(
        review.numericalEvidence.difficultyMethod
      ).toBe(
        network.validation.edgeDifficultyMethod
      );

      expect(
        review.warnings.join(" ")
      ).toContain("slope-derived proxy");
    }
  });

  it("flags P03 scarp approaches for high-priority review", () => {
    for (const edgeId of [
      "P03_C1",
      "P03_C2",
      "P03_C3",
    ]) {
      const review =
        getCorridorDifficultyReview(edgeId);

      expect(review?.reviewPriority).toBe(
        "HIGH"
      );

      expect(
        review?.visualEvidence.factorsToCheck
      ).toContain("CHANNEL_SCARP");
    }
  });

  it("prioritizes edges near the experimental slope threshold", () => {
    const review =
      getCorridorDifficultyReview("P04_C5");

    expect(
      review?.numericalEvidence.p95CellMaxSlopeDegrees
    ).toBeGreaterThan(12);

    expect(review?.reviewPriority).toBe(
      "HIGH"
    );
  });

  it("keeps the mean-slope alternative disabled", () => {
    const review =
      getCorridorDifficultyReview(
        "P04_MEAN_ALTERNATIVE"
      );

    expect(
      review?.enabledForExperimentalRouting
    ).toBe(false);

    expect(review?.reviewPriority).toBe(
      "HIGH"
    );

    expect(
      review?.numericalEvidence.blockedCellsUnderMax15Rule
    ).toBeGreaterThan(0);

    expect(
      review?.warnings.join(" ")
    ).toContain("disabled");
  });

  it("never treats an enabled research edge as an approved EVA route", () => {
    for (const review of corridorDifficultyReviews) {
      expect(review.corridorStatus).toBe(
        "EXPERIMENTAL_NOT_APPROVED"
      );
    }
  });

  it("explains evidence and limitations for each edge", () => {
    for (const review of corridorDifficultyReviews) {
      const explanation =
        explainCorridorDifficulty(review.edgeId);

      expect(explanation).toContain(
        review.edgeId
      );

      expect(explanation).toContain(
        "Provisional difficulty"
      );

      expect(explanation).toContain(
        "Orthophoto inspection pending"
      );
    }
  });

  it("returns undefined or null for an unknown edge", () => {
    expect(
      getCorridorDifficultyReview("NOT_AN_EDGE")
    ).toBeUndefined();

    expect(
      explainCorridorDifficulty("NOT_AN_EDGE")
    ).toBeNull();
  });
});
