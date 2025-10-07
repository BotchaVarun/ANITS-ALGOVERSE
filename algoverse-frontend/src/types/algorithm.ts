export interface NumberState {
  value: number;
  direction: -1 | 1; // -1 for left, 1 for right
  position: number;
}

export type AnimationState = 
  | 'idle'
  | 'scanning'
  | 'found-mobile'
  | 'swapping'
  | 'reversing'
  | 'complete';

export interface AlgorithmStep {
  permutation: NumberState[];
  mobileIndices: number[];
  largestMobileIndex: number | null;
  action: string;
  state: AnimationState;
}
