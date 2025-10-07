export type CellType = 'empty' | 'source' | 'goal' | 'obstacle';

export type HeuristicType = 'manhattan' | 'diagonal' | 'euclidean';

export interface GridNode {
  x: number;
  y: number;
  type: CellType;
  g: number;
  h: number;
  f: number;
  parent: GridNode | null;
  inOpenList: boolean;
  inClosedList: boolean;
}

export interface AStarState {
  grid: GridNode[][];
  openList: GridNode[];
  closedList: GridNode[];
  currentNode: GridNode | null;
  path: GridNode[];
  isComplete: boolean;
  isPathFound: boolean;
  statusText: string;
  source: { x: number; y: number } | null;
  goal: { x: number; y: number } | null;
}
