import { describe, it, expect } from "vitest";

import {
  CANDIDATE_SCIENCE_TARGETS,
  SCIENCE_SOURCES,
} from "../data/candidateScienceTargets";

describe("Candidate science targets", () => {
  it("defines exactly four investigation concepts", () => {
    expect(
      CANDIDATE_SCIENCE_TARGETS.map(
        (target) => target.id
      )
    ).toEqual([
      "P01",
      "P02",
      "P03",
      "P04",
    ]);
  });

  it(
    "provides meaningful scientific objectives and astronaut activities",
    () => {
      for (const target of CANDIDATE_SCIENCE_TARGETS) {
        expect(
          target.scientificObjective.length
        ).toBeGreaterThan(20);

        expect(
          target.visibleEvidence.length
        ).toBeGreaterThan(20);

        expect(
          target.astronautActivities.length
        ).toBeGreaterThanOrEqual(2);

        expect(
          target.dtmMeasurements.length
        ).toBeGreaterThanOrEqual(2);
      }
    }
  );

  it(
    "keeps every site provisional until the GIS study area is approved",
    () => {
      for (const target of CANDIDATE_SCIENCE_TARGETS) {
        expect(target.status).toBe("candidate");

        expect(target).not.toHaveProperty(
          "coordinates"
        );

        expect(target).not.toHaveProperty(
          "elevationM"
        );

        expect(target).not.toHaveProperty(
          "slopeDegrees"
        );
      }
    }
  );

  it(
    "links every target to defined NASA/USGS sources",
    () => {
      for (const target of CANDIDATE_SCIENCE_TARGETS) {
        expect(
          target.sourceIds.length
        ).toBeGreaterThan(0);

        for (const sourceId of target.sourceIds) {
          const source = SCIENCE_SOURCES[sourceId];

          expect(
            source?.label.length
          ).toBeGreaterThan(0);

          expect(
            source?.url
          ).toMatch(/^https:\/\//);
        }
      }
    }
  );
});
