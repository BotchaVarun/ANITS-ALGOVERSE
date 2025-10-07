export interface HuffmanNode {
  id: string;
  char?: string;
  frequency: number;
  left?: HuffmanNode;
  right?: HuffmanNode;
  x?: number;
  y?: number;
  isLeaf: boolean;
  isHighlighted?: boolean;
  pathHighlighted?: boolean;
}

export interface HeapItem {
  node: HuffmanNode;
  isExtracting?: boolean;
  isInserting?: boolean;
}

export interface HuffmanCode {
  char: string;
  code: string;
  frequency: number;
}

export type AlgorithmPhase = 'building' | 'traversing' | 'complete';

export interface AlgorithmStep {
  phase: AlgorithmPhase;
  description: string;
  heap: HeapItem[];
  tree: HuffmanNode | null;
  codes: HuffmanCode[];
  highlightedNodes?: string[];
  highlightedPath?: string[];
  extractingNodes?: string[];
  insertingNode?: string;
}
