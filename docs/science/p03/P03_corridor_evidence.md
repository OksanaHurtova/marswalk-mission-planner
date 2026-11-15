P03 — Channel Margin Exposure: corridor evidence
Area: Athabasca Valles, Candidate 11 (Mars, local metres).
Review type: Project-level raster and orthophoto desk screening, not EVA-route approval.
Graph: S → P03, 407.4 m, corridors P03_C1, P03_C2, P03_C3.
Status: Numeric checks completed; visual/GIS sign-off pending.
Evidence sources and method
- src/features/planner/data/network.json: candidate route polylines and graph topology.
- src/features/explorer/data/terrainSamples.json: slope and elevation samples at 1 m intervals along centerlines (team T-016 dataset).
- candidate11_slope_deg.tif: slope raster derived from HiRISE stereo DTM, ~1.0115 m pixels.
- ESP_035191_1880_RED_C_01_ORTHO.jp2: local HiRISE orthophoto; used as image backdrop.
- region.json: local-to-projected coordinates: projectedX = localX - 847.9952, projectedY = localY + 475629.2382.
Buffered screening uses 5 m on either side of each centerline, flat line caps, and slope-pixel centers falling inside the buffer. The number of pixels exceeding 15° is a pixel-area metric, not route-length exposure. The 15° comparison is a project heuristic; it is not a NASA EVA safety limit. Values below are independently re-sampled from the supplied local raster and may differ slightly from prior summaries due to buffer edge/pixel inclusion rules.
Findings
Corridor	Length	Max centerline slope, 1 m samples	Max slope within ±5 m	Pixels above 15° within ±5 m	Distance from centerline to nearest >15° pixel center
P03_C1	138.7 m	6.03°	7.22°	0	Not applicable
P03_C2	135.5 m	11.84°	16.32°	3	approximately 3.03 m
P03_C3	133.2 m	10.88°	18.70°	8	approximately 3.03 m


P03_C2 hotspot: around local (839.4 m, 1483.9 m), on the side of the mapped centerline. The max local value near that cluster is about 16.32°.
P03_C3 hotspot: clusters near the final approach to P03. The strongest sampled pixel is approximately 18.70° around local (938.5 m, 1386.8 m); it is about 4.05 m from the centerline. The closest >15° pixel center is about 3.03 m from the line.

Interpretation: The 1 m centerline samples stay under the prototype's 15° comparator on these corridors, while nearby pixels in the review strip exceed it. This is a warning about clearance and local terrain variation, not proof that a steep pixel intersects the centerline or that the passage is physically traversable. The HiRISE image shows nonuniform, high-contrast surface textures near the final P03 approach; shape, relief, and traversability cannot be determined conclusively from one orthophoto.
Annotated visual evidence
- P03_overview.png — full approach to P03, cyan candidate centerlines and colored >15° pixels inside the ±5 m corridor.
- P03_C2_detail.png — mid-approach and local flagged cluster.
- P03_C3_detail.png — final approach and flagged patches near the target.
Required final GIS / science review
1. Inspect P03_C2 around (839, 1484) and P03_C3 around (939, 1387) and (958, 1400) in the full-resolution source layers (not just the annotated preview).
2. Compare morphology with DTM hillshade/slope and consider ortho/DTM registration error; identify whether potential scarps, rocks or sharp micro-relief intersect the candidate travel corridor.
3. Check whether the P03 station is suitably offset from the visible channel-margin feature and whether the last few metres of approach need rerouting.
4. Record a GIS reviewer, review date, screenshot and decision for each corridor: Candidate retained with caveats, Geometry adjustment required, or Further evidence required.
5. Update route approval metadata only after the team agrees; never mark the corridor EVA-safe based solely on this desk screening.
Current recommendation: Retain P03_C1 as a lower-priority inspection item; flag P03_C2 and especially P03_C3 for human orthophoto + DTM review. Do not yet alter the active route geometry or claim final approval.