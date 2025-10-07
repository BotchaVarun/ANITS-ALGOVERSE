import { NumberState, AlgorithmStep } from '@/types/algorithm';

export class JohnsonTrotterAlgorithm {
  private n: number;
  private permutation: NumberState[];
  private permutations: number[][] = [];
  private steps: AlgorithmStep[] = [];

  constructor(n: number = 3) {
    this.n = n;
    this.permutation = Array.from({ length: n }, (_, i) => ({
      value: i + 1,
      direction: -1, // All start pointing left
      position: i,
    }));
    this.generateSteps();
  }

  private isMobile(index: number): boolean {
    const num = this.permutation[index];
    const targetIndex = index + num.direction;

    // Check if the number can move in its direction
    if (targetIndex < 0 || targetIndex >= this.n) {
      return false;
    }

    // Check if the adjacent number is smaller
    return num.value > this.permutation[targetIndex].value;
  }

  private findMobileNumbers(): number[] {
    return this.permutation
      .map((_, index) => index)
      .filter(index => this.isMobile(index));
  }

  private findLargestMobile(): number | null {
    const mobileIndices = this.findMobileNumbers();
    if (mobileIndices.length === 0) return null;

    return mobileIndices.reduce((largest, current) => {
      return this.permutation[current].value > this.permutation[largest].value
        ? current
        : largest;
    }, mobileIndices[0]);
  }

  private swapNumbers(index1: number, index2: number): void {
    [this.permutation[index1], this.permutation[index2]] = 
    [this.permutation[index2], this.permutation[index1]];
    
    // Update positions
    this.permutation[index1].position = index1;
    this.permutation[index2].position = index2;
  }

  private reverseDirections(value: number): void {
    this.permutation.forEach(num => {
      if (num.value > value) {
        num.direction = num.direction === -1 ? 1 : -1;
      }
    });
  }

  private clonePermutation(): NumberState[] {
    return this.permutation.map(num => ({ ...num }));
  }

  private generateSteps(): void {
    // Initial state
    this.steps.push({
      permutation: this.clonePermutation(),
      mobileIndices: [],
      largestMobileIndex: null,
      action: 'Initial permutation',
      state: 'idle',
    });

    this.permutations.push(this.permutation.map(n => n.value));

    let iterationCount = 0;
    const maxIterations = 1000; // Safety limit

    while (iterationCount < maxIterations) {
      // Step 1: Find mobile numbers (scanning phase)
      const mobileIndices = this.findMobileNumbers();
      
      this.steps.push({
        permutation: this.clonePermutation(),
        mobileIndices,
        largestMobileIndex: null,
        action: mobileIndices.length > 0
          ? `Scanning... Found mobile: ${mobileIndices.map(i => this.permutation[i].value).join(', ')}`
          : 'No mobile integers found',
        state: 'scanning',
      });

      // Step 2: Find largest mobile
      const largestMobileIndex = this.findLargestMobile();
      
      if (largestMobileIndex === null) {
        this.steps.push({
          permutation: this.clonePermutation(),
          mobileIndices: [],
          largestMobileIndex: null,
          action: 'Algorithm complete - no mobile integers remain',
          state: 'complete',
        });
        break;
      }

      const largestMobileValue = this.permutation[largestMobileIndex].value;

      this.steps.push({
        permutation: this.clonePermutation(),
        mobileIndices,
        largestMobileIndex,
        action: `Largest mobile integer is ${largestMobileValue}`,
        state: 'found-mobile',
      });

      // Step 3: Swap
      const direction = this.permutation[largestMobileIndex].direction;
      const swapIndex = largestMobileIndex + direction;

      this.steps.push({
        permutation: this.clonePermutation(),
        mobileIndices: [],
        largestMobileIndex,
        action: `Swapping ${largestMobileValue} with ${this.permutation[swapIndex].value}`,
        state: 'swapping',
      });

      this.swapNumbers(largestMobileIndex, swapIndex);
      this.permutations.push(this.permutation.map(n => n.value));

      // Step 4: Reverse directions
      const numbersToReverse = this.permutation
        .filter(n => n.value > largestMobileValue)
        .map(n => n.value);

      if (numbersToReverse.length > 0) {
        this.steps.push({
          permutation: this.clonePermutation(),
          mobileIndices: [],
          largestMobileIndex: null,
          action: `Reversing directions for integers > ${largestMobileValue}: ${numbersToReverse.join(', ')}`,
          state: 'reversing',
        });

        this.reverseDirections(largestMobileValue);
      }

      this.steps.push({
        permutation: this.clonePermutation(),
        mobileIndices: [],
        largestMobileIndex: null,
        action: `New permutation: ${this.permutation.map(n => n.value).join('')}`,
        state: 'idle',
      });

      iterationCount++;
    }
  }

  getSteps(): AlgorithmStep[] {
    return this.steps;
  }

  getPermutations(): number[][] {
    return this.permutations;
  }
}
