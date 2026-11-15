
export function calculatePolylineLength(
  geometry: readonly (readonly number[])[]
): number {
  if (!Array.isArray(geometry) || geometry.length < 2) {
    throw new Error(
      "Polyline must contain at least two points"
    );
  }

  for (const point of geometry) {
    if (
      !Array.isArray(point) ||
      point.length !== 2 ||
      !point.every(
        (value) =>
          typeof value === "number" &&
          Number.isFinite(value)
      )
    ) {
      throw new Error(
        "Polyline coordinates must be finite [x, y] pairs"
      );
    }
  }

  let totalLength = 0;

  for (let i = 1; i < geometry.length; i++) {
    const previous = geometry[i - 1];
    const current = geometry[i];

    totalLength += Math.hypot(
      current[0] - previous[0],
      current[1] - previous[1]
    );
  }

  if (totalLength <= 0) {
    throw new Error("Polyline length must be positive");
  }

  return totalLength;
}
