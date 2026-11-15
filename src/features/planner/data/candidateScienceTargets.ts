 // Candidate science targets for the Athabasca Valles mission.
 // These are investigation concepts, NOT georeferenced POIs.
 // The final four sites must be verified inside the approved 2.5 x 2.5 km ROI.

export type ScienceTargetId = "P01" | "P02" | "P03" | "P04";

export type ScienceSourceId =
  | "HIRISE_IMAGE"
  | "HIRISE_DTM"
  | "USGS_SIM_3477";

export const SCIENCE_SOURCES: Record<
  ScienceSourceId,
  {
    label: string;
    url: string;
  }
> = {
  HIRISE_IMAGE: {
    label: "NASA HiRISE image",
    url: "https://www.uahirise.org/ESP_035191_1880",
  },
  HIRISE_DTM: {
    label: "NASA HiRISE DTM",
    url: "https://www.uahirise.org/dtm/ESP_035191_1880",
  },
  USGS_SIM_3477: {
    label: "USGS geological context",
    url: "https://pubs.usgs.gov/publication/sim3477",
  },
};

export type CandidateScienceTarget = {
  id: ScienceTargetId;
  name: string;
  category: string;
  summary: string;
  scientificObjective: string;
  visibleEvidence: string;
  astronautActivities: readonly string[];
  dtmMeasurements: readonly string[];
  limitation: string;
  sourceIds: readonly ScienceSourceId[];
  status: "candidate";
};

export const CANDIDATE_SCIENCE_TARGETS: readonly CandidateScienceTarget[] = [
  {
    id: "P01",
    name: "Channel Floor Reference Site",
    category: "Reference sampling",
    summary:
      "Establish a reference for comparing the channel floor with other terrain.",
    scientificObjective:
      "Document the morphology and accessible surface materials of the channel floor to establish a baseline for comparison.",
    visibleEvidence:
      "The HiRISE scene contains a comparatively uniform-looking channel floor with subtle linear textures.",
    astronautActivities: [
      "Record close-range surface texture and visible material properties.",
      "Inspect accessible rocks or deposits and collect a sample if suitable material and equipment are available.",
      "Record observations for comparison with other study sites.",
    ],
    dtmMeasurements: [
      "Local elevation and slope",
      "Along-channel elevation profile",
      "Local terrain variation and DTM quality",
    ],
    limitation:
      "A representative sampling site has not been located or checked for traverse suitability.",
    sourceIds: [
      "HIRISE_IMAGE",
      "HIRISE_DTM",
      "USGS_SIM_3477",
    ],
    status: "candidate",
  },
  {
    id: "P02",
    name: "Lineated Surface Investigation",
    category: "Surface structures",
    summary:
      "Investigate parallel surface lineations and possible deformation.",
    scientificObjective:
      "Characterize the morphology and orientation of lineated terrain and test hypotheses about surface material movement or deformation.",
    visibleEvidence:
      "Elongated, approximately parallel lineations are visible within the channel in HiRISE imagery.",
    astronautActivities: [
      "Measure the orientation and geometry of accessible lineations.",
      "Inspect local textures and compare materials with P01.",
      "Document whether the structures correspond to physical ridges or surface markings.",
    ],
    dtmMeasurements: [
      "Topographic expression of selected lineations",
      "Short cross-lineation elevation profiles",
      "Local slope and DTM quality",
    ],
    limitation:
      "The cause of the lineations is unconfirmed; an accessible study location remains to be selected.",
    sourceIds: [
      "HIRISE_IMAGE",
      "HIRISE_DTM",
      "USGS_SIM_3477",
    ],
    status: "candidate",
  },
  {
    id: "P03",
    name: "Channel Margin Exposure",
    category: "Channel boundary",
    summary:
      "Study the channel edge and any accessible geological exposure.",
    scientificObjective:
      "Characterize the channel boundary, its topographic relief, and any accessible exposed material or visible structures.",
    visibleEvidence:
      "HiRISE shows a sharply defined, irregular channel margin with locally prominent scarp-like features.",
    astronautActivities: [
      "Observe the margin from a DTM-screened location beside the scarp.",
      "Document visible structures and accessible exposures if present.",
      "Compare the boundary materials and morphology with the channel floor.",
    ],
    dtmMeasurements: [
      "Cross-margin elevation profile",
      "Elevation difference between adjacent surfaces",
      "Local and approach-corridor slopes, DTM quality",
    ],
    limitation:
      "An actual rock exposure and a suitable observation station have not yet been verified. Do not place the station on an unassessed steep scarp.",
    sourceIds: [
      "HIRISE_IMAGE",
      "HIRISE_DTM",
      "USGS_SIM_3477",
    ],
    status: "candidate",
  },
  {
    id: "P04",
    name: "Adjacent Surface Comparison Site",
    category: "Comparative geology",
    summary:
      "Compare nearby terrain with the channel-floor reference site.",
    scientificObjective:
      "Compare accessible terrain beside the channel with the floor, looking for differences in surface morphology and material properties.",
    visibleEvidence:
      "The HiRISE scene shows surfaces adjacent to the channel with textures that differ from the channel floor.",
    astronautActivities: [
      "Photograph and document the adjacent surface morphology.",
      "Inspect accessible materials and compare findings with P01.",
      "Identify differences worth further geological investigation.",
    ],
    dtmMeasurements: [
      "Local elevation and slope",
      "Relative elevation compared with P01",
      "Terrain variation and access-corridor DTM quality",
    ],
    limitation:
      "A scientifically distinct and accessible local site has not yet been confirmed inside the final ROI.",
    sourceIds: [
      "HIRISE_IMAGE",
      "HIRISE_DTM",
      "USGS_SIM_3477",
    ],
    status: "candidate",
  },
];
