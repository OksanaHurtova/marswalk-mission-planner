
import sciencePointsData from "../data/sciencePoints_preliminary.json";
import startPointData from "../data/startPoint_preliminary.json";

export type PreliminaryGraphNode = {
  id: string;
  name: string;
  x: number;
  y: number;
  elevationM: number | null;
  slopeDeg: number | null;
  role: "START" | "SCIENCE_TARGET";
  status: "PRELIMINARY";
};

const startNode: PreliminaryGraphNode = {
  id: startPointData.id,
  name: startPointData.name,
  x: startPointData.localXY_m[0],
  y: startPointData.localXY_m[1],
  elevationM: startPointData.elevationM,
  slopeDeg: startPointData.slopeDeg,
  role: "START",
  status: "PRELIMINARY",
};

const scienceNodes: PreliminaryGraphNode[] =
  sciencePointsData.points.map((point) => ({
    id: point.id,
    name: point.name,
    x: point.localXY_m[0],
    y: point.localXY_m[1],
    elevationM: point.elevationM,
    slopeDeg: point.slopeDeg,
    role: "SCIENCE_TARGET",
    status: "PRELIMINARY",
  }));

export const preliminaryGraphNodes:
  readonly PreliminaryGraphNode[] = [
    startNode,
    ...scienceNodes,
  ];

export function getPreliminaryGraphNode(
  id: string
): PreliminaryGraphNode | undefined {
  return preliminaryGraphNodes.find(
    (node) => node.id === id
  );
}

export function getPreliminaryStartNode():
  PreliminaryGraphNode {
  return startNode;
}
