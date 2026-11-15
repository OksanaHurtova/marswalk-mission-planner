type EdgeCostInput = {
  lengthM: number;
  difficultyScore: number | null;
  slopeScore: number | null;
};

export function calculateBalancedCost(
  edge: EdgeCostInput,
  useSlope: boolean
): number {
  const { lengthM, difficultyScore, slopeScore } = edge;

  if (!Number.isFinite(lengthM) || lengthM <= 0) {
    throw new Error("Invalid edge length");
  }

  if (
    difficultyScore === null ||
    !Number.isFinite(difficultyScore) ||
    difficultyScore < 0 ||
    difficultyScore > 1
  ) {
    throw new Error("Invalid terrain difficulty score");
  }

  if (useSlope) {
    if (
      slopeScore === null ||
      !Number.isFinite(slopeScore) ||
      slopeScore < 0 ||
      slopeScore > 1
    ) {
      throw new Error("Valid slope data is required");
    }

    return (
      (lengthM / 100) *
      (0.5 + 0.3 * difficultyScore + 0.2 * slopeScore)
    );
  }

  return (
    (lengthM / 100) *
    (0.625 + 0.375 * difficultyScore)
  );
}
