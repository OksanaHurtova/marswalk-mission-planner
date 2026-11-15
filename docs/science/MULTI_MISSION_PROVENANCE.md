# Multi-Mission Data Provenance and Scientific Context

## Study Area

**Region:** Athabasca Valles, Mars  
**Study area:** Candidate 11  
**Local extent:** 2.5 × 2.5 km

Marswalk Mission Planner combines high-resolution terrain information with regional geological context from multiple NASA missions to support scientific exploration and experimental route planning.

## Mars Reconnaissance Orbiter — HiRISE

**HiRISE observation:** ESP_035191_1880  
**Digital Terrain Model:** DTEEC_035191_1880_036457_1880_A01

**Official source:**  
https://www.uahirise.org/ESP_035191_1880

**Application assets:**
- `public/maps/athabasca-base.webp` — Local imagery basemap
- `public/maps/athabasca-slope.webp` — Derived slope visualization
- `public/maps/layers.json` — Map layer metadata

**Scientific role:** High-resolution surface visualization, elevation analysis, terrain characterization, and experimental route planning.

The slope visualization represents terrain-derived information and does not constitute a certified obstacle-detection or EVA safety system.

## Mars Odyssey — THEMIS

**Regional geological reference:** USGS Scientific Investigations Map 3477, *Geologic Map of the Athabasca Valles Region, Mars*.

**Official source:**  
https://pubs.usgs.gov/publication/sim3477

The geological map incorporates regional daytime infrared imagery acquired by the Thermal Emission Imaging System (THEMIS) aboard NASA's Mars Odyssey spacecraft.

**Map scale:** 1:1,000,000  
**Regional imagery resolution:** Approximately 100 m/pixel

**Scientific role:** Regional geological and geomorphological interpretation, including the volcanic history of Athabasca Valles.

The application references this geological context through `USGS_SIM_3477` in its scientific source metadata.

THEMIS regional imagery is not used for local obstacle detection, meter-scale route clearance, or numerical slope calculations along individual route segments.

## Multi-Mission Data Integration

Marswalk Mission Planner incorporates scientific information from two complementary NASA missions:

- **Mars Reconnaissance Orbiter / HiRISE:** Detailed local imagery, terrain elevation, and derived slope data used for local terrain exploration and experimental routing.
- **Mars Odyssey / THEMIS:** Regional geological context represented through a verified USGS mapping product.

These sources operate at different spatial resolutions and serve different scientific purposes.

Their integration provides a broader understanding of the study region without treating regional geological imagery as a high-resolution navigation or obstacle map.

## Scientific Limitations

- Scientific destinations are preliminary research candidates.
- Route recommendations are experimental and are not certified for astronaut extravehicular activity (EVA).
- Local obstacles and terrain hazards have not been fully validated through independent visual GIS inspection.
- Regional geological interpretations cannot independently determine the safety or accessibility of individual route segments.
- Additional terrain validation would be necessary before any operational mission application.

## Conclusion

Marswalk Mission Planner combines detailed HiRISE terrain information with the broader geological context provided by THEMIS-derived USGS mapping.

By distinguishing data provenance, spatial scale, scientific purpose, and validation limitations, the application supports transparent and scientifically responsible interpretation of Martian terrain.