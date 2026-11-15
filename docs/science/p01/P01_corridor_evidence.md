# P01 — Channel Floor Reference Site: corridor evidence

**Area:** Athabasca Valles, Candidate 11, Mars; local metre coordinates.  
**Review date:** 2026-11-15.  
**Method:** Original slope-raster numerical screening and annotated HiRISE orthophoto **desk review**.  
**Approval:** **NOT GIS-signed, NOT EVA-safe, NOT NASA-approved.** Graph geometry and the source data remain unchanged.

## Route and data provenance

- Current active route: `S → W01 → W02 → P01`, **560.04 m** summed graph-edge length, three enabled segments `P01_C1–C3`.
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
| `P01_C1` | 188.8 | 2.50 | 6.22 | 5.54 | 9.04 | 5.32 | 0 / 1,722 | 0.00% | 100% |
| `P01_C2` | 185.6 | 2.73 | 12.50 | 5.99 | 13.78 | 6.50 | 0 / 1,669 | 0.00% | 100% |
| `P01_C3` | 185.7 | 3.28 | 14.12 | 7.38 | 15.17 | 8.49 | 1 / 1,675 | 0.06% | 100% |

## Interpretation and priority locations

- **`P01_C1` — routine review:** ±5 m maximum **9.04°**, with **0** slope pixels >15°. A low value does not rule out small obstacles or poor footing; inspect the route origin and visible texture.
- **`P01_C2` — focused morphology review:** ±5 m maximum **13.78°** near local **(481.3, 1422.2)**. Review any local relief/lineation crossing and confirm acceptable image-to-DTM alignment.
- **Orthophoto-only observation:** A prominent roughly circular, high-contrast surface feature appears east of C3. Its exact rim/relief and any necessary stand-off distance must be checked against the source DTM/hillshade; the image alone does not determine safe clearance.
- **`P01_C3` — highest P01 priority:** exactly **one** source-raster pixel >15° in the tested ±5 m strip: **15.17°** near local **(429.7, 1332.1)**. Its pixel centre lies **≈3.03 m** from the mathematical corridor centreline. The 1 m centerline maximum for C3 is **14.12°**, below the team's comparator, but a nearby >15° area pixel remains relevant to route-width/clearance screening.
- The original planner edge `blockedCellsUnderMax15Rule` for C3 is **0**. That metric uses the original **5×5 grid-cell routing method**, not this source-pixel area buffer. The two results measure **different things** and are not contradictory.

**Research decision:** Keep all three edges as **preliminary enabled candidates**, with **GIS/orthophoto review required for C3**, then C2. **Do not claim that the P01 approach has been approved or that the 15.17° pixel physically blocks a plausible walking corridor.** Do not modify `network.json` on the strength of this report.

## Annotated images

1. `P01_overview.png` — complete three-segment approach on HiRISE imagery, with the ±5 m area-screening strip and the steep C3 pixel.
2. `P01_C3_detail.png` — approximately (430, 1332) local metres; source-pixel >15° and centreline offset.
3. `P01_C2_C3_detail.png` — detailed nearby surface texture and approach to station P01.

## GIS reviewer action / final decision

1. In QGIS, load **the original** `ESP_035191_1880_RED_C_01_ORTHO.jp2` and `candidate11_slope_deg.tif` in the Mars-specific projected CRS; do not reinterpret the coordinates as EPSG:4326.
2. Inspect C3 at local **(430, 1332)** and C2 at **(481, 1422)**, compare shadows and physical relief, and assess the **required route width**, not just a pixel-centre point test. Verify layer registration.
3. Inspect science station P01 at **(418.0, 1220.8)** and the final approach for any obstacles not captured by slope alone.
4. Record reviewer, date, scale/screenshot, source-layer versions, confidence and decision for **each edge**: `RETAIN AS RESEARCH CANDIDATE`, `ADJUST CANDIDATE GEOMETRY`, or `MORE EVIDENCE REQUIRED`.
5. If geometry is adjusted, regenerate corridor sampling and route tests before merging. Only a separately recorded team GIS/science decision may finalize the prototype route; this is not an astronaut EVA clearance.

**Current status:** Numerical area screening and illustrative orthophoto desk figures complete; human GIS confirmation and any necessary geometry changes remain outstanding.
