# P01_C3 — Independent QGIS slope-screening cross-check

**Study area:** Athabasca Valles, Candidate 11, Mars  
**Review reported:** 2026-11-15  
**Review status:** Independent numerical cross-check of one corridor finding; **not a full orthophoto/DTM clearance review**.  
**Source of confirmation:** GIS teammate's QGIS review as reported to the project team. This note records that report; it is not a separate rerun by the author of this note.

## Finding confirmed

- **Corridor:** `P01_C3`, the final segment of the enabled research route `S → W01 → W02 → P01`.
- **Buffer:** 5 m on either side of the modeled centerline.
- **Maximum slope reported in that buffer:** **15.166°** (approximately **15.17°** when rounded to two decimal places).
- **Count of pixels strictly above the experimental 15° comparator:** **1**.
- **Independent QGIS methods:** (1) raster-pixel centers inside the buffer; (2) raster pixels intersecting the buffer. The reviewer reported that both methods identify the same above-threshold pixel.
- **Consistency with earlier project screening:** The result agrees with `docs/science/p01/P01_corridor_evidence.md`, which reported one pixel over 15° and a rounded nearby maximum of 15.17°.

## Scope of this confirmation

This cross-check supports the **specific P01_C3 raster-count result** and its approximate maximum slope. It does not independently validate every edge, the full route geometry, or all scientific interpretations in the project reports. It does **not** establish that a human or rover could safely traverse the corridor. The 15° value is a **team-defined experimental screening reference**, **not a NASA EVA safety standard**.

The reported maximum occurs in the surrounding buffer, not necessarily on the modeled centerline. The prior project report places the steep pixel center approximately 3.03 m from the line; this is previous project-screening information, **not a newly confirmed clearance distance**.

## Outstanding review and project decision

1. Complete or explicitly defer the full-resolution orthophoto/DTM visual assessment of P01_C3 and the other candidate corridors.
2. Keep the existing graph and route geometry unchanged unless an evidence-backed revision is agreed by the team.
3. Preserve the disabled P04 shortcut; this single P01_C3 check provides no basis for enabling it.
4. Present the P01–P04 routes as **research-prototype candidates**, with visible uncertainty and limitations, not approved astronaut EVA routes.
5. If any geometry changes, regenerate affected GIS samples and rerun the full automated test suite and production build.

**Current decision:** Record P01_C3 numerical evidence as **cross-checked**; overall route approval is **pending / outside the completed scope**. No change to `network.json`, Dijkstra, Balanced Cost, or terrain datasets is authorized by this note.

## Related project evidence

- `docs/science/p01/P01_corridor_evidence.md`
- `docs/science/ALL_ROUTES_SCREENING_SUMMARY.md`
- `src/features/planner/data/network.json`
- `src/features/explorer/data/terrainSamples.json`
- HiRISE source products: https://www.uahirise.org/dtm/ESP_035191_1880
