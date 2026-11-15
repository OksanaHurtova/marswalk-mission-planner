# P04 — Adjacent Surface Comparison Site: corridor evidence

**Area:** Athabasca Valles, Candidate 11 (Mars, local metre coordinates).  
**Review date:** 2026-11-15.  
**Review type:** Independent numerical raster screening and annotated HiRISE orthophoto **desk review**. This is **not** signed GIS approval or an EVA safety assessment.  
**Route status:** The existing six-edge route remains an **enabled research candidate**; the short `P04_MEAN_ALTERNATIVE` remains **disabled**. Do not alter the graph on the basis of this report alone.

## Route options and source data

- **Enabled:** `S → W07 → W08 → W09 → W10 → W11 → P04`, six edges, **3,008.90 m** summed geometric length.
- **Excluded alternative:** `S → P04`, one edge, **1,411.74 m**, `enabled: false`. The original 5 × 5-grid model recorded **53 blocked cells** for the alternative under its experimental maximum-slope criterion. Its current graph `disabledReason` notes that an average grid-cell slope may conceal steeper underlying pixels.
- `src/features/planner/data/network.json`: routes, local coordinates, model scores and graph status.
- `src/features/explorer/data/terrainSamples.json`: original-source-pixel DTM/slope samples at 1 m intervals on each centerline; statistics based on unique visited pixels.
- `candidate11_slope_deg.tif`: team-derived slope raster (~1.01148 m/pixel) from the HiRISE stereo DTM. Source crop is held outside the website repository.
- `ESP_035191_1880_RED_C_01_ORTHO.jp2`: HiRISE orthophoto; used as the image background for attached figures.
- `region.json`: local-to-projected conversion is `X_projected = X_local − 847.9952`, `Y_projected = Y_local + 475629.2382`, in the project's *Equirectangular MARS* CRS.

Official observation/DTM provenance: [HiRISE observation ESP_035191_1880](https://www.uahirise.org/ESP_035191_1880) and [HiRISE stereo DTM DTEEC_035191_1880_036457_1880_A01](https://www.uahirise.org/dtm/ESP_035191_1880). HiRISE credit: **NASA/JPL-Caltech/UArizona**.

## Method and meaning

Each original graph polyline was buffered by **5 m on each side**, with **flat end caps**. The screenshot overlay and numeric area statistics use *centers of valid original slope-raster pixels strictly inside the buffer*, and count those **>15°**. NoData pixels are not treated as 0°. Centerline maximum is taken separately from the 1 m sample dataset, **not** the old 5 × 5-grid maximum. The displayed buffer percentages are percentages of **sampled area pixels**, **not route length**. All examined centerline positions and all sampled buffer pixels in this crop have valid measurements; this is **data availability, not evidence of safe terrain**.

The **15° threshold is a team-chosen experimental comparison**, **not a NASA EVA safety limit**. A slope pixel near a centerline does **not** show that the centerline itself intersects an obstacle; conversely, low slope alone does not rule out hazards such as boulders, fractures, small scarps or poor traction. Single-view orthophoto texture is not sufficient to reliably distinguish relief, shadow and surface materials.

## Corridor measurements

| Edge | Enabled | Length (m) | 1 m centerline mean slope (°) | 1 m centerline max slope (°) | ±5 m max slope (°) | >15° pixels / valid pixels | >15° area pixels (%) | Centerline coverage |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| P04_C1 | Yes | 503.5 | 2.60 | 9.62 | 10.45 | 0 / 4,487 | 0.00% | 100% |
| P04_C2 | Yes | 503.5 | 3.99 | 13.75 | 26.44 | 20 / 4,488 | 0.45% | 100% |
| P04_C3 | Yes | 499.0 | 4.35 | 14.35 | 31.88 | 35 / 4,468 | 0.78% | 100% |
| P04_C4 | Yes | 500.2 | 4.00 | 13.92 | **36.21** | 23 / 4,496 | 0.51% | 100% |
| P04_C5 | Yes | 500.2 | 4.65 | 13.32 | 20.18 | 26 / 4,499 | 0.58% | 100% |
| P04_C6 | Yes | 502.4 | 4.15 | 13.98 | 21.27 | 32 / 4,533 | 0.71% | 100% |
| P04_MEAN_ALTERNATIVE | **No** | 1411.7 | 5.09 | **22.95** | **42.50** | **482 / 12,633** | **3.82%** | 100% |

Values are independently recomputed from the team source raster and original polylines. Counts can differ from other buffer reports if end caps, boundary pixels or rounding differ.

**Key distinction:** All six *enabled* edges have 1 m centerline maxima <15° on this dataset, yet five have steep pixels in their ±5 m surroundings; the nearest flagged pixel centers for C2–C6 are approximately **3.03 m** from their respective centerlines. That means **nearby**, not definitively **on the line**. The disabled alternative has a >15° pixel center essentially **on its mapped line** (within raster/geometry precision), supporting its exclusion for further review.

## Priority hotspots for QGIS review (local X/Y metres)

| Edge | Point to inspect | Max nearby slope (°) | Approx. distance from its centerline | Review question |
|---|---|---:|---:|---|
| `P04_C2` | (697.8, 953.8) | 26.44 | 3.03 m | Check narrow passage and adjacent steep cluster on southern descent |
| `P04_C3` | (864.7, 742.4) | 31.88 | 3.03 m | Inspect bend and steep terrain adjacent to the south-turn corridor |
| `P04_C4` | (1101.4, 1017.6) | **36.21** | 4.05 m | Evaluate potential local relief or boundary near C4 corridor |
| `P04_C5` | (1252.1, 1113.7) | 20.18 | 4.05 m | Inspect near C4→C5 transition and eastward connection |
| `P04_C6` | (1812.4, 1487.9) | 21.27 | 4.05 m | Inspect final approach and the science target station |
| `P04_MEAN_ALTERNATIVE` | (867.7, 1634.6) | **42.50** | 4.05 m | See pronounced nearby slopes on excluded short option |

For the excluded alternative, an additional **nearest** >15° pixel center occurs at approximately **(1810.4, 1529.4)**, at effectively **0 m** from the mapped line. All positions are **local map metres**, *not latitude/longitude*. For the highest-slope point, distance to the line is not necessarily the minimum distance of *any* flagged pixel in that corridor.

## Attached HiRISE evidence figures

1. `P04_overview.png`: complete six-edge detour versus disabled short alternative (cyan versus pink dashed); orange pixels show >15° within the relevant review strips.
2. `P04_C2_C3_detail.png`: southern descent and bend; local hotspots 26.44° and 31.88°.
3. `P04_C4_detail.png`: strongest buffered slope on the enabled route (36.21°), ~4.05 m from C4 centerline.
4. `P04_C5_C6_detail.png`: eastward connection and P04 final approach.
5. `P04_short_alternative_detail.png`: comparison of excluded short-route geometry and nearby high-slope pixels.

Figures are **annotated, geospatially registered interpretations** of the team source orthophoto and slope raster. They are *not* NASA-produced risk or passability maps.

## Review decisions and outstanding sign-off

- **P04_C1:** retain as preliminary candidate, lower-priority follow-up (no >15° pixels in the tested ±5 m strip). Not approved.
- **P04_C2, C3, C4:** **high-priority manual GIS inspection** before any route-finalization claim. Inspect morphology, narrow clearances, apparent scarps and the distinction between shadows and actual relief. Prioritize C4 (strongest nearby slope) and C3 (most >15° sampled area pixels among enabled P04 edges).
- **P04_C5, C6:** manual GIS inspection for route-to-station connection and adjacent steep pixels. Not approved.
- **P04_MEAN_ALTERNATIVE:** **keep disabled**. It is shorter, but this alone is not sufficient to prefer it; it has many more steep-area pixels, higher measured centerline slope maxima and the 53 originally blocked 5 × 5 model cells.

**Before closing the corridor-validation work:** Ask the GIS reviewer to examine the specific XY coordinates at full resolution in **both the orthophoto and DTM/slope**; record image alignment and pixel uncertainty, ground morphology and whether the problematic terrain intersects a usable route *width*, not merely the mathematical centerline. For each edge record reviewer, date, source screenshot and one outcome: `RETAIN AS RESEARCH CANDIDATE`, `ADJUST CANDIDATE GEOMETRY` or `MORE EVIDENCE REQUIRED`. Any route geometry changes require updated measurements, tests and team review.

**Current recommendation:** **Do not change `network.json` or activate the short alternative.** Keep the 3,008.9 m detour as an experimental candidate while C2–C6 undergo human GIS/orthophoto evaluation. Scientific or EVA safety approval has **not** been established.
