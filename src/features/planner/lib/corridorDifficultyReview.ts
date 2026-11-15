import network from "../data/network.json";

export type VisualFactorToCheck =
  | "CRATER_PROXIMITY"
  | "CHANNEL_SCARP"
  | "SURFACE_ROUGHNESS"
  | "SURFACE_LINEATIONS";

export type ReviewPriority = "STANDARD" | "HIGH";

export type CorridorDifficultyReview = {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  enabledForExperimentalRouting: boolean;
  corridorStatus: "EXPERIMENTAL_NOT_APPROVED";
  lengthM: number;
  reviewPriority: ReviewPriority;

  numericalEvidence: {
    difficultyScore: number;
    slopeScore: number;
    meanSlopeDegrees: number;
    maxCellSlopeDegrees: number;
    p95CellMaxSlopeDegrees: number;
    sampledCellCount: number;
    blockedCellsUnderMax15Rule: number;
    sourceIds: readonly string[];
    difficultyMethod: string;
  };

  visualEvidence: {
    reviewStatus: "PENDING_ORTHOPHOTO_REVIEW";
    factorsToCheck: readonly VisualFactorToCheck[];
    confirmedFactors: readonly VisualFactorToCheck[];
    independentVisualDifficultyScore: null;
    imageSourceUrl: string;
  };

  warnings: readonly string[];
};

// These are inspection tasks, NOT confirmed hazards
// or official NASA safety criteria.
const FACTORS_TO_CHECK: Record<
  string,
  readonly VisualFactorToCheck[]
> = {
  P01_C1: [
    "SURFACE_LINEATIONS",
    "SURFACE_ROUGHNESS",
  ],
  P01_C2: [
    "CRATER_PROXIMITY",
    "SURFACE_ROUGHNESS",
  ],
  P01_C3: [
    "CRATER_PROXIMITY",
    "SURFACE_ROUGHNESS",
  ],

  P02_C1: [
    "SURFACE_LINEATIONS",
    "SURFACE_ROUGHNESS",
  ],
  P02_C2: [
    "SURFACE_LINEATIONS",
    "SURFACE_ROUGHNESS",
  ],
  P02_C3: [
    "SURFACE_LINEATIONS",
    "SURFACE_ROUGHNESS",
  ],

  P03_C1: [
    "CHANNEL_SCARP",
    "SURFACE_LINEATIONS",
  ],
  P03_C2: [
    "CHANNEL_SCARP",
    "SURFACE_ROUGHNESS",
  ],
  P03_C3: [
    "CHANNEL_SCARP",
    "SURFACE_ROUGHNESS",
  ],

  P04_C1: [
    "CHANNEL_SCARP",
    "SURFACE_ROUGHNESS",
  ],
  P04_C2: [
    "CHANNEL_SCARP",
    "SURFACE_ROUGHNESS",
  ],
  P04_C3: [
    "CHANNEL_SCARP",
    "SURFACE_ROUGHNESS",
  ],
  P04_C4: [
    "SURFACE_ROUGHNESS",
    "CHANNEL_SCARP",
  ],
  P04_C5: [
    "SURFACE_ROUGHNESS",
    "CHANNEL_SCARP",
  ],
  P04_C6: [
    "SURFACE_ROUGHNESS",
    "CRATER_PROXIMITY",
  ],

  P04_MEAN_ALTERNATIVE: [
    "CHANNEL_SCARP",
    "SURFACE_ROUGHNESS",
  ],
};

const ORTHOPHOTO_URL =
  "https://www.uahirise.org/ESP_035191_1880";

const experimentalThresholdDeg =
  network.validation.experimentalMaxSlopeThresholdDeg;

export const corridorDifficultyReviews:
  readonly CorridorDifficultyReview[] =
  network.edges.map((edge) => {
    const factorsToCheck =
      FACTORS_TO_CHECK[edge.id];

    if (!factorsToCheck) {
      throw new Error(
        `Missing visual inspection checklist for ${edge.id}.`
      );
    }

    // This threshold prioritizes manual inspection.
    // It does not establish astronaut safety.
    const highPriority =
      !edge.enabled ||
      edge.id.startsWith("P03_") ||
      edge.p95CellMaxSlopeDeg >=
        experimentalThresholdDeg * 0.8;

    const warnings = [
      "Difficulty score is currently a slope-derived proxy; it is not an independent visual hazard score.",
      "Native-resolution orthophoto review and route-corridor approval are pending.",
    ];

    if (edge.id.startsWith("P03_")) {
      warnings.push(
        "Review the channel margin and approach corridor near P03."
      );
    }

    if (!edge.enabled) {
      warnings.push(
        "This alternative is disabled and must not be used for route recommendations."
      );
    }

    if (
      edge.blockedCellsUnderMax15Rule > 0
    ) {
      warnings.push(
        "Some sampled cells exceed the experimental maximum-slope rule."
      );
    }

    return {
      edgeId: edge.id,
      fromNodeId: edge.from,
      toNodeId: edge.to,

      enabledForExperimentalRouting:
        edge.enabled,

      corridorStatus:
        "EXPERIMENTAL_NOT_APPROVED",

      lengthM: edge.lengthM,

      reviewPriority: highPriority
        ? "HIGH"
        : "STANDARD",

      numericalEvidence: {
        difficultyScore:
          edge.difficultyScore,

        slopeScore:
          edge.slopeScore,

        meanSlopeDegrees:
          edge.slopeDegrees,

        maxCellSlopeDegrees:
          edge.maxCellSlopeDeg,

        p95CellMaxSlopeDegrees:
          edge.p95CellMaxSlopeDeg,

        sampledCellCount:
          edge.sampledCellCount,

        blockedCellsUnderMax15Rule:
          edge.blockedCellsUnderMax15Rule,

        sourceIds:
          edge.sourceIds,

        difficultyMethod:
          network.validation.edgeDifficultyMethod,
      },

      visualEvidence: {
        reviewStatus:
          "PENDING_ORTHOPHOTO_REVIEW",

        factorsToCheck,

        confirmedFactors: [],

        independentVisualDifficultyScore:
          null,

        imageSourceUrl:
          ORTHOPHOTO_URL,
      },

      warnings,
    };
  });

export function getCorridorDifficultyReview(
  edgeId: string
): CorridorDifficultyReview | undefined {
  return corridorDifficultyReviews.find(
    (review) => review.edgeId === edgeId
  );
}

export function explainCorridorDifficulty(
  edgeId: string
): string | null {
  const review =
    getCorridorDifficultyReview(edgeId);

  if (!review) {
    return null;
  }

  const evidence =
    review.numericalEvidence;

  const visualChecks =
    review.visualEvidence.factorsToCheck
      .map((factor) =>
        factor
          .toLowerCase()
          .replaceAll("_", " ")
      )
      .join(", ");

  return [
    `Corridor ${review.edgeId}: ${review.fromNodeId} to ${review.toNodeId}, ${review.lengthM.toFixed(1)} m.`,

    `Provisional difficulty ${evidence.difficultyScore.toFixed(4)} is derived from DTM slope, not independently measured visual obstacles.`,

    `Mean slope ${evidence.meanSlopeDegrees.toFixed(2)} degrees; 95th-percentile cell maximum ${evidence.p95CellMaxSlopeDegrees.toFixed(2)} degrees; maximum sampled cell ${evidence.maxCellSlopeDegrees.toFixed(2)} degrees.`,

    `Orthophoto inspection pending for: ${visualChecks}.`,

    review.enabledForExperimentalRouting
      ? "Enabled only in the experimental route graph; NOT approved for an EVA traverse."
      : "Alternative disabled; NOT available for route recommendations.",
  ].join(" ");
}
