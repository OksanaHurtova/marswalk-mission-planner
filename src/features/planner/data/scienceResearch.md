
# Marswalk Mission Planner — Science Research

## 1. Study Area

Region: Athabasca Valles, Mars
Study area: Candidate 11
Area dimensions: 2500 x 2500 m
Total area: 6.25 km²
Coordinate reference system: Equirectangular MARS

Status: Preliminary study area.
Final slope, terrain accessibility, and NoData
validation are still in progress.

### NASA Datasets

HiRISE observation:
ESP_035191_1880

Stereo observation:
ESP_036457_1880

Digital Terrain Model:
DTEEC_035191_1880_036457_1880_A01

Data products:
- HiRISE orthophoto
- Numeric Digital Terrain Model
- Color altimetry visualization
- Shaded relief visualization

The study uses actual NASA orbital observations
and terrain data.

## 2. Mission Scientific Objective

Investigate the morphology and possible geological
history of the Athabasca Valles distributary channel.

The mission focuses on comparing:

- Channel-floor surface materials
- Linear surface structures
- Channel-margin morphology
- Adjacent terrain characteristics

The four investigation sites are designed to
provide complementary scientific observations.

Potential astronaut activities include surface
documentation, geological examination, and
sample collection when appropriate equipment
and accessible materials are available.

## 3. Preliminary Science Targets

The four targets were placed provisionally
in Candidate 11 using QGIS.

All four preliminary locations are within
the 2500 x 2500 m study area.

Their coordinates are not yet final.

### P01 — Channel Floor Reference Site

Projected coordinates:
X = -430 m
Y = 476850 m

Local coordinates:
X = 417.995199 m
Y = 1220.7618 m

Scientific objective:
Characterize the channel-floor surface and
establish a reference site for comparison
with other geological features.

Orbital observations:
HiRISE imagery shows a comparatively uniform
channel-floor surface with subtle textures.

Scientific questions:
- What materials are present on the channel floor?
- What is the local surface morphology?
- How does this terrain differ from nearby areas?
- Are visible surface textures related to topography?

Proposed astronaut activities:
- Document local surface textures.
- Examine accessible rocks or deposits.
- Record geological observations.
- Collect a representative sample if possible.

Required DTM measurements:
- Elevation
- Local slope
- Along-channel elevation profile
- Local terrain variation
- NoData and accessibility checks

Limitations:
The exact sampling location and local surface
composition have not been confirmed.

Status: PRELIMINARY

### P02 — Lineated Surface Investigation

Projected coordinates:
X = -330 m
Y = 477670 m

Local coordinates:
X = 517.995199 m
Y = 2040.7618 m

Scientific objective:
Investigate linear surface features and assess
their possible relationship to deformation
or movement of surface materials.

Orbital observations:
HiRISE imagery contains elongated,
approximately parallel surface lineations.

Scientific questions:
- Are the lineations physical ridges or grooves?
- Do they correspond to measurable elevation changes?
- Are they aligned with the channel?
- What geological processes could explain them?

Proposed astronaut activities:
- Inspect accessible linear structures.
- Measure their orientation.
- Document their morphology and surface texture.
- Compare findings with the P01 reference site.

Required DTM measurements:
- Cross-feature elevation profiles
- Local slope
- Relief of individual features
- DTM coverage and accessibility checks

Limitations:
The formation mechanism of the lineations
has not been scientifically confirmed.

Status: PRELIMINARY

### P03 — Channel Margin Exposure

Projected coordinates:
X = 125 m
Y = 477025 m

Local coordinates:
X = 972.995199 m
Y = 1395.7618 m

Scientific objective:
Investigate the channel boundary, its
topographic relief, and any accessible
geological exposures.

Orbital observations:
HiRISE imagery shows a clearly defined,
irregular channel margin with
scarp-like structures.

Scientific questions:
- How large is the elevation difference?
- How steep is the channel boundary?
- Are geological materials exposed?
- What does the boundary reveal about
  the history of the channel?

Proposed astronaut activities:
- Observe the channel margin from a
  suitable nearby location.
- Document visible geological structures.
- Examine accessible exposures if present.
- Compare the margin with the channel floor.

Required DTM measurements:
- Cross-margin elevation profile
- Elevation difference
- Local slope
- Approach-corridor slope
- NoData and accessibility checks

Limitations:
This target is close to a prominent scarp.
Its final location may need to be moved
after slope and accessibility analysis.

A suitable astronaut observation station
has not yet been confirmed.

Status: PRELIMINARY

### P04 — Adjacent Surface Comparison Site

Projected coordinates:
X = 1165 m
Y = 477065 m

Local coordinates:
X = 2012.995199 m
Y = 1435.7618 m

Scientific objective:
Compare terrain adjacent to the channel
with the channel-floor reference site.

Orbital observations:
HiRISE imagery shows differences in
surface texture and morphology between
the channel and adjacent terrain.

Scientific questions:
- How does this surface differ from P01?
- Is the terrain higher or rougher?
- Are the visible differences associated
  with distinct geological processes?
- What can these differences reveal
  about the history of the region?

Proposed astronaut activities:
- Document the adjacent surface.
- Examine accessible surface materials.
- Compare observations with P01.
- Investigate morphological differences.

Required DTM measurements:
- Local elevation
- Local slope
- Elevation difference relative to P01
- Terrain variation
- Approach-corridor accessibility

Limitations:
Geological differences and safe access
have not yet been verified.

Status: PRELIMINARY

## 4. DTM and Terrain Analysis

The study area has been prepared in QGIS
using NASA HiRISE orthophoto and numeric DTM data.

Preliminary raster information:

Raster dimensions:
2473 x 2473 pixels

Approximate pixel size:
1.01148 m/pixel

Boolean raster results:
TRUE pixels: 6108312
FALSE pixels: 7417
Total pixels: 6115729

These values describe the processed raster
extent and do not independently confirm
valid DTM coverage inside the final study polygon.

The following analyses are still pending:

- Exact in-polygon NoData verification
- Elevation measurements at every POI
- Slope calculations in degrees
- Review of accessible observation locations
- Verification of possible route corridors

DTM visualization colors must not be
treated as quantitative slope measurements.

## 5. Route Planning Method

The mission planner uses a curated graph
of terrain corridors.

The planned graph contains:
- One starting location
- Four science targets
- Additional intermediate nodes
- Approximately 12–18 route edges

Every route edge must have validated geometry,
length, terrain difficulty, and relevant sources.

Where consistent DTM slope scores are available,
the approved Balanced Cost formula is:

C_e = (L_e / 100) * (0.50 + 0.30 * D_e + 0.20 * S_e)

Where:
L_e = edge length in metres
D_e = documented difficulty score
S_e = normalized DTM-derived slope score

When slope data are unavailable across the
graph, the approved fallback model is:

C_e = (L_e / 100) * (0.625 + 0.375 * D_e)

Dijkstra's algorithm finds the path with
the lowest total Balanced Cost among
the available graph corridors.

This is a planning model, not a guarantee
of astronaut safety.

No real route corridors have yet been approved.

## 6. Geological Context

The Athabasca Valles region contains
well-preserved volcanic landforms.

The USGS geological map describes regional
features including platy-ridged lava plains,
flow margins, and structures interpreted
as indicators of material movement.

However, the geological unit mapped at
the exact Candidate 11 location has not
yet been independently confirmed.

The regional geological interpretation
must not be automatically assigned to
individual science targets.

HiRISE images and numeric DTM measurements
provide local morphological and topographic
evidence, but do not independently determine
the chemical composition of surface materials.

## 7. Pending GIS Validation

The following work remains:

1. Approve the final 2500 x 2500 m study area.
2. Confirm exact coordinate reference information.
3. Complete in-polygon NoData checks.
4. Measure elevations and slopes at P01–P04.
5. Relocate any unsuitable observation stations.
6. Select the final mission starting point.
7. Validate route corridor geometries.
8. Calculate edge lengths and slope statistics.
9. Document corridor difficulty scores.
10. Approve the final sciencePoints.json
    and network.json datasets.

## 8. Official Scientific Sources

NASA HiRISE observation:
https://www.uahirise.org/ESP_035191_1880

NASA HiRISE DTM:
https://www.uahirise.org/dtm/ESP_035191_1880

USGS Geologic Map SIM 3477:
https://pubs.usgs.gov/publication/sim3477

Internal project data:
- Marswalk_T005_handoff_Ania.zip
- candidate_11.gpkg

The preliminary POI coordinates were
provided through the team's QGIS analysis.
They are not NASA-published POI coordinates.
