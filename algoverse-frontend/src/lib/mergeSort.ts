import { MergeSortAction } from '@/types/mergeSort';

/**
 * Generates a complete sequence of actions for iterative merge sort
 * Uses bottom-up approach: merges subarrays of size 1, 2, 4, 8, etc.
 */
export function getMergeSortActionsIterative(arr: number[]): MergeSortAction[] {
  const actions: MergeSortAction[] = [];
  const n = arr.length;
  const workArray = [...arr];
  let level = 0;

  // Start with subarrays of size 1, then 2, 4, 8, etc.
  for (let size = 1; size < n; size *= 2) {
    level++;
    
    // Add divide action for this level
    actions.push({
      type: 'divide',
      level,
      subarraySize: size,
      description: `Level ${level}: Dividing into subarrays of size ${size}`
    });

    // Merge adjacent subarrays of current size
    for (let leftStart = 0; leftStart < n; leftStart += 2 * size) {
      const leftEnd = Math.min(leftStart + size - 1, n - 1);
      const rightStart = leftEnd + 1;
      const rightEnd = Math.min(leftStart + 2 * size - 1, n - 1);

      // Skip if there's no right subarray
      if (rightStart >= n) continue;

      // Generate merge actions for this pair of subarrays
      generateMergeActions(
        workArray,
        leftStart,
        leftEnd,
        rightStart,
        rightEnd,
        actions,
        level,
        size
      );
    }
  }

  actions.push({
    type: 'complete',
    description: 'Merge sort complete! Array is now fully sorted.'
  });

  return actions;
}

function generateMergeActions(
  arr: number[],
  leftStart: number,
  leftEnd: number,
  rightStart: number,
  rightEnd: number,
  actions: MergeSortAction[],
  level: number,
  subarraySize: number
): void {
  const leftSubarray = arr.slice(leftStart, leftEnd + 1);
  const rightSubarray = arr.slice(rightStart, rightEnd + 1);
  
  const leftStr = `[${leftSubarray.join(', ')}]`;
  const rightStr = `[${rightSubarray.join(', ')}]`;
  
  actions.push({
    type: 'merge',
    startIndex: leftStart,
    endIndex: rightEnd,
    mergedValues: [],
    level,
    subarraySize,
    description: `Merging ${leftStr} and ${rightStr}`
  });

  let i = 0; // Left subarray index
  let j = 0; // Right subarray index
  let k = leftStart; // Merged array index
  const merged: number[] = [];

  // Merge process
  while (i < leftSubarray.length && j < rightSubarray.length) {
    const leftVal = leftSubarray[i];
    const rightVal = rightSubarray[j];
    
    // Compare action
    actions.push({
      type: 'compare',
      leftIndex: leftStart + i,
      rightIndex: rightStart + j,
      level,
      subarraySize,
      description: `Comparing ${leftVal} (left) and ${rightVal} (right)`
    });

    if (leftVal <= rightVal) {
      merged.push(leftVal);
      actions.push({
        type: 'place',
        index: k,
        value: leftVal,
        fromSubarray: 'left',
        level,
        description: `Placing ${leftVal} from left subarray at position ${k}`
      });
      arr[k] = leftVal;
      i++;
    } else {
      merged.push(rightVal);
      actions.push({
        type: 'place',
        index: k,
        value: rightVal,
        fromSubarray: 'right',
        level,
        description: `Placing ${rightVal} from right subarray at position ${k}`
      });
      arr[k] = rightVal;
      j++;
    }
    k++;
  }

  // Copy remaining elements from left subarray
  while (i < leftSubarray.length) {
    const leftVal = leftSubarray[i];
    merged.push(leftVal);
    actions.push({
      type: 'place',
      index: k,
      value: leftVal,
      fromSubarray: 'left',
      level,
      description: `Placing remaining ${leftVal} from left subarray at position ${k}`
    });
    arr[k] = leftVal;
    i++;
    k++;
  }

  // Copy remaining elements from right subarray
  while (j < rightSubarray.length) {
    const rightVal = rightSubarray[j];
    merged.push(rightVal);
    actions.push({
      type: 'place',
      index: k,
      value: rightVal,
      fromSubarray: 'right',
      level,
      description: `Placing remaining ${rightVal} from right subarray at position ${k}`
    });
    arr[k] = rightVal;
    j++;
    k++;
  }
}

/**
 * Generates a random array of numbers
 */
export function generateRandomArray(size: number = 8, min: number = 1, max: number = 99): number[] {
  return Array.from({ length: size }, () => 
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}
