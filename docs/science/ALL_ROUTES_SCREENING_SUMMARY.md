# Candidate 11 — All-science-target corridor screening summary

**Date:** 2026-11-15  
**Scope:** Numerical and annotated orthophoto **desk screening**, not independent human GIS sign-off and **not an EVA safety assessment**.  
**Frame:** Athabasca Valles, Equirectangular MARS, local XY in metres.

## Evidence inventory

| Destination | Current route | Length (m) | Enabled edges | Main numeric flags from ±5 m area-pixel raster test | Team-made figures/reports |
|---|---|---:|---:|---|---|
| P01 | `S → W01 → W02 → P01` | 560.04 | 3 | `P01_C3`: 1 pixel >15°, nearby max 15.17° at ≈3.03 m from line | `p01/P01_corridor_evidence.md` + 3 PNG |
| P02 | `S → W03 → W04 → P02` | 485.28 | 3 | 0 pixels >15° in tested strips; highest nearby max 14.75° in `P02_C2` | `p02/P02_corridor_evidence.md` + 2 PNG |
| P03 | `S → W05 → W06 → P03` | 407.45 | 3 | `P03_C2`: 16.32° nearby (3 pixels >15°); `P03_C3`: 18.70° nearby (8 pixels >15°) | `p03/P03_corridor_evidence.md` + 3 PNG |
| P04 | `S → W07 → W08 → W09 → W10 → W11 → P04` | 3008.90 | 6 | Five of six edges have nearby pixels >15°; peak 36.21° in `P04_C4` | `p04/P04_corridor_evidence.md` + 5 PNG |
| P04 short option | `S → P04` (DISABLED) | 1411.74 | 0 | Buffer max 42.50°; 482 / 12,633 pixels >15°; 53 blocked cells in original route model | `p04/P04_short_alternative_detail.png` |

**Important:** The route lengths are sums of edge lengths from `network.json` and may vary in their final rounded digits from UI display. The P01 route in this graph is **560.04 m**; older approximate figures should not be treated as authoritative. Buffer counts are **per-edge area-pixel counts**, not a fraction of walking distance, and might count overlapping pixels more than once if summed across edges.

## Source and methods

- `network.json`: geometry, edge enabled flags, existing 5×5-cell route model.
- `terrainSamples.json`: 1 m centerline-source-pixel slope and elevation summary for each edge.
- `candidate11_slope_deg.tif`: team-derived slope raster from HiRISE stereo DTM, ~1.01148 m/pixel; original raster held outside the website repository.
- `ESP_035191_1880_RED_C_01_ORTHO.jp2`: georeferenced original HiRISE orthophoto product `ESP_035191_1880_RED_C_01_ORTHO` (NASA/JPL-Caltech/UArizona); [observation](https://www.uahirise.org/ESP_035191_1880) / [DTM](https://www.uahirise.org/dtm/ESP_035191_1880).
- Buffered measurements include centres of valid raster pixels strictly within 5 m on both sides of each edge, with flat end caps. The 15° slope level is **a prototype comparator only, NOT a NASA astronaut EVA safety requirement**.
- Visuals use HiRISE as a backdrop, but the orange/yellow hazard annotations are **made by the team**, not by NASA. Low slope or a zero exceedance count does not establish clearance, traction or safe traversability.

## Next sign-off order

1. **P04_C3/C4, then C2/C5/C6:** verify high-slope nearby terrain, southern turn and science-station approach. Keep the short P04 option disabled.
2. **P03_C3, then C2:** compare the near-channel-margin approach against full-resolution orthophoto and DTM; inspect station placement.
3. **P01_C3, then C2:** resolve isolated >15° pixel around (430, 1332) and nearby texture.
4. **P02_C2, then C1/C3:** inspect near-threshold buffer maximum around (579, 1903) and visually check remaining station approaches.
5. **Record a signed decision for *every* active edge** (15 total) in the team's GIS review: `RETAIN AS RESEARCH CANDIDATE`, `ADJUST CANDIDATE GEOMETRY`, or `MORE EVIDENCE REQUIRED`. Record reviewer/date, source-layer IDs, screenshot, uncertainty, and the reason.
6. After approvals/adjustments, freeze the final research-prototype corridor set. Any edited geometry requires re-sampling and a fresh complete automated-test run. Never describe these results as official NASA EVA-route certification.

## Progress note

- **Completed:** independent numerical ±5 m screening for all 15 active edges and disabled P04 alternative; 1 m centerline/±5 m comparisons; annotated desk-review figures and source-aware evidence notes for P01–P04.
- **Still open:** human GIS/QGIS review and decision log, station-level visual clearance and any geometry corrections. The graph's disabled P04 alternative does **not** count as a second currently routable path.

**Team tracking:** Treat the numerical/documentation subpart of corridor evidence as complete. Do **not** automatically mark the whole terrain-validation workstream `DONE` until the team agrees that formal GIS sign-off is either completed or explicitly out of scope for the hackathon deliverable.
