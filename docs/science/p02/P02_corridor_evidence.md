# P02 — Lineated Surface Investigation: corridor evidence

**Area:** Athabasca Valles, Candidate 11, Mars; local metre coordinates.  
**Review date:** 2026-11-15.  
**Method:** Original slope-raster numerical screening and annotated HiRISE orthophoto **desk review**.  
**Approval:** **NOT GIS-signed, NOT EVA-safe, NOT NASA-approved.** Graph geometry and the source data remain unchanged.

## Route and data provenance

- Current active route: `S → W03 → W04 → P02`, **485.28 m** summed graph-edge length, three enabled segments `P02_C1–C3`.
- Planner geometry and edge metadata: `src/features/planner/data/network.json` (team model).
- Measured centerline slope/elevation: `src/features/explorer/data/terrainSamples.json`, 1 m sampling steps on each modeled centerline, unique-source-pixel statistics.
- Original slope map used for this independent area check: `candidate11_slope_deg.tif` (~1.01148 m/pixel), a team-derived product from a HiRISE stereo DTM; **this GeoTIFF is not bundled in the web app**.
- Orthophoto backdrop: `ESP_035191_1880_RED_C_01_ORTHO.jp2` (HiRISE, NASA/JPL-Caltech/UArizona), with product metadata in `ESP_035191_1880_RED_C_01_ORTHO.LBL`.
- Map frame: Equirectangular MARS, origin `(−847.9952, 475629.2382)` projected metres. Conversion: `X_projected = X_local − 847.9952`, `Y_projected = Y_local + 475629.2382`. Coordinates below are **local X/Y metres**, not latitude and longitude.

Official source metadata: [HiRISE observation ESP_035191_1880](https://www.uahirise.org/ESP_035191_1880) and [HiRISE DTM source](https://www.uahirise.org/dtm/ESP_035191_1880). The maps and hazard annotations in this folder are **team-made analyses, not NASA-produced safety maps**.

## Sampling method and limitations

A **flat-ended 5 m buffer on both sides** of each graph polyline was sampled using centres of valid original slope-raster pixels falling strictly inside the polygon. Pixels with slope **strictly greater than 15°** are counted. The threshold is an **experimental project comparator, not NASA EVA guidance**. Percentages refer to **raster area-pixel counts**, not the proportion of walking distance. NoData values are never interpreted as 0°.

Centerline values come **separately** from the 1 m source-pixel sampling dataset. For these three edges, all planned source-sampling positions and all sampled area-buffer pixels have valid measurements. This confirms **data coverage only**; it does not establish boulder abundance, loose regolith, cracks, clearance, mobility, traction or real-world passability. A single orthophoto is insufficient to distinguish shading from topography or infer traversability.

## Measured corridor evidence

| Corridor | Length (m) | 1 m mean slope (°) | 1 m max slope (°) | 1 m P95 slope (°) | ±5 m max slope (°) | ±5 m P95 slope (°) | Pixels >15° / valid pixels | Area pixels >15° | 1 m coverage |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `P02_C1` | 164.5 | 2.58 | 9.76 | 5.90 | 13.78 | 5.45 | 0 / 1,494 | 0.00% | 100% |
| `P02_C2` | 161.7 | 2.39 | 6.91 | 4.73 | 14.75 | 5.01 | 0 / 1,447 | 0.00% | 100% |
| `P02_C3` | 159.1 | 2.59 | 8.90 | 5.15 | 9.52 | 5.42 | 0 / 1,447 | 0.00% | 100% |

## Interpretation and priority locations

- **All three P02 corridors:** **0** valid slope-raster pixels >15° inside the tested ±5 m strips. This is a **negative result for this one raster threshold only**, **not proof of an obstacle-free route**.
- **`P02_C1` — routine review:** ±5 m max **13.78°** at about local **(687.7, 1664.9)**. Check early approach texture and whether lineations or small obstacles are apparent.
- **Orthophoto-only observation:** A conspicuous dark, narrow curved feature appears east of C2 near the upper end of the corridor. Its relation to actual relief or shadow cannot be decided from the image alone and should be checked in the stereo DTM.
- **`P02_C2` — priority P02 review:** highest P02 strip value, **14.75°**, near local **(579.4, 1902.6)**, **≈4.05 m** from the centreline. It remains *below* the 15° comparator, but is close enough to justify inspection of the local transition/lineated texture and uncertainty in registration and sampling.
- **`P02_C3` — routine final-station review:** ±5 m max **9.52°**. Confirm the final approach and P02 station location visually.
- The 1 m centreline maximum across these three segments is **9.76°** (`P02_C1`). It is a separate statistic from the buffer maximum **14.75°**.

**Research decision:** Retain all three as **preliminary enabled candidates**; prioritize **C2** for a focused orthophoto/DTM inspection and visually inspect the remainder. **No passability or NASA EVA-safety claim can be drawn from the zero exceedance count.** Do not adjust `network.json` without documented GIS review.

## Annotated images

1. `P02_overview.png` — the three enabled route segments on HiRISE with a ±5 m sampling strip; no >15° area pixels marked because none were measured.
2. `P02_C2_detail.png` — largest buffered P02 slope, near **(579, 1903)** local metres. The yellow open marker denotes the sampled maximum, **not an obstacle**.

## GIS reviewer action / final decision

1. In QGIS, load the original HiRISE orthophoto and DTM/slope layers using the **Equirectangular MARS** CRS; inspect the **(579, 1903)** C2 maximum in the full-resolution original.
2. Check the surface-texture/lineation area at C2 and visible small-scale relief. Confirm whether the ±5 m corridor contains obstacles that the raster slope cannot resolve.
3. Check the initial approach (around **688, 1665**) and the P02 station at **(518.0, 2040.8)**; verify image alignment, station access and route width.
4. For C1–C3 record reviewer, date, full-resolution screenshot, confidence and one decision: `RETAIN AS RESEARCH CANDIDATE`, `ADJUST CANDIDATE GEOMETRY`, or `MORE EVIDENCE REQUIRED`.
5. If geometry changes, recalculate centerline and buffer statistics and rerun route tests before committing the update. Do not label the route ESA/NASA EVA-safe.

**Current status:** Numeric area screening and annotated orthophoto desk figures complete; human GIS/station review pending.
