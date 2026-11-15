/**
 * Shared contracts for Marswalk Mission Planner.
 * All coordinates are local Mars coordinates in meters.
 * X points east; Y points north.
 *
 * Experimental routes are NOT approved astronaut EVA corridors.
 */

export type LocalXY = [number, number];

export type LocalExtent = [
  number,
  number,
  number,
  number
];

export type ScienceTargetId =
  | "P01"
  | "P02"
  | "P03"
  | "P04";

export interface ScientificPoint {
  id: string;
  name: string;
  localXY_m: LocalXY;
  status?: string;
}

export type RouteGeometry =
  readonly (readonly [number, number])[];

export interface RouteResult {
  nodeIds: string[];
  edgeIds: string[];
  geometry: LocalXY[];
  distanceM: number;
  balancedCost: number;
  difficultyIndex: number | null;
  meanSlopeDegrees: number | null;
  explanation: string;
  warnings: string[];
}

export interface RouteRecommendation {
  route: RouteResult | null;
  errors: string[];
  warnings: string[];
}

export interface MarsMapProps {
  points?: ScientificPoint[];
  onSelectTarget?: (pointId: string) => void;
  selectedTargetId?: string | null;
  routeGeometry?: RouteGeometry | null;
}
