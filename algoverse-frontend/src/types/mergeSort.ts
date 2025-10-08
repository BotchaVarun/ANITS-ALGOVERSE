export interface ValueItem {
  id: string;
  value: number;
  highlight?: 'left' | 'right' | 'merged' | 'comparing';
}

export type MergeSortAction =
  | { type: 'divide'; level: number; subarraySize: number; description: string }
  | { 
      type: 'compare'; 
      leftIndex: number; 
      rightIndex: number; 
      level: number; 
      subarraySize: number;
      description: string;
    }
  | { 
      type: 'merge'; 
      startIndex: number; 
      endIndex: number; 
      mergedValues: number[];
      level: number;
      subarraySize: number;
      description: string;
    }
  | { 
      type: 'place'; 
      index: number; 
      value: number; 
      fromSubarray: 'left' | 'right';
      level: number;
      description: string;
    }
  | { type: 'complete'; description: string };

export interface MergeSortState {
  array: ValueItem[];
  currentAction: MergeSortAction | null;
  actionIndex: number;
  actions: MergeSortAction[];
  isPlaying: boolean;
  speed: number;
  comparisons: number;
  mergeOperations: number;
  currentLevel: number;
  isComplete: boolean;
}
