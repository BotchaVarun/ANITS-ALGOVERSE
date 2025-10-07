import { HuffmanNode, HuffmanCode, AlgorithmStep, HeapItem } from '../types/huffman';

// Initial character frequencies
const INITIAL_DATA = [
  { char: 'a', frequency: 5 },
  { char: 'b', frequency: 9 },
  { char: 'c', frequency: 12 },
  { char: 'd', frequency: 13 },
  { char: 'e', frequency: 16 },
  { char: 'f', frequency: 45 },
];

let nodeIdCounter = 0;

function createNode(char: string | undefined, frequency: number, left?: HuffmanNode, right?: HuffmanNode): HuffmanNode {
  return {
    id: `node-${nodeIdCounter++}`,
    char,
    frequency,
    left,
    right,
    isLeaf: !left && !right,
  };
}

class MinHeap {
  private heap: HuffmanNode[] = [];

  insert(node: HuffmanNode): void {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin(): HuffmanNode | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop()!;

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].frequency >= this.heap[parentIndex].frequency) break;
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      let minIndex = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < this.heap.length && this.heap[leftChild].frequency < this.heap[minIndex].frequency) {
        minIndex = leftChild;
      }
      if (rightChild < this.heap.length && this.heap[rightChild].frequency < this.heap[minIndex].frequency) {
        minIndex = rightChild;
      }

      if (minIndex === index) break;
      [this.heap[index], this.heap[minIndex]] = [this.heap[minIndex], this.heap[index]];
      index = minIndex;
    }
  }

  getArray(): HuffmanNode[] {
    return [...this.heap];
  }

  size(): number {
    return this.heap.length;
  }
}

function traverseTreeForCodes(node: HuffmanNode | null, code: string, codes: HuffmanCode[]): void {
  if (!node) return;
  
  if (node.isLeaf && node.char) {
    codes.push({ char: node.char, code: code || '0', frequency: node.frequency });
    return;
  }

  traverseTreeForCodes(node.left || null, code + '0', codes);
  traverseTreeForCodes(node.right || null, code + '1', codes);
}

export function generateHuffmanSteps(): AlgorithmStep[] {
  nodeIdCounter = 0;
  const steps: AlgorithmStep[] = [];
  const heap = new MinHeap();

  // Initialize heap with leaf nodes
  const leafNodes = INITIAL_DATA.map(data => createNode(data.char, data.frequency));
  leafNodes.forEach(node => heap.insert(node));

  // Initial step
  steps.push({
    phase: 'building',
    description: 'Initialized min-heap with character frequencies. Ready to build Huffman Tree.',
    heap: heap.getArray().map(node => ({ node })),
    tree: null,
    codes: [],
  });

  let rootNode: HuffmanNode | null = null;

  // Build Huffman Tree
  while (heap.size() > 1) {
    const heapBefore = heap.getArray();
    
    // Extract first minimum
    const left = heap.extractMin()!;
    const heapAfterFirst = heap.getArray();

    steps.push({
      phase: 'building',
      description: `Extracting node '${left.char || 'internal'}' (frequency: ${left.frequency}) from min-heap.`,
      heap: heapBefore.map(node => ({
        node,
        isExtracting: node.id === left.id,
      })),
      tree: rootNode,
      codes: [],
      extractingNodes: [left.id],
    });

    // Extract second minimum
    const right = heap.extractMin()!;
    const heapAfterSecond = heap.getArray();

    steps.push({
      phase: 'building',
      description: `Extracting node '${right.char || 'internal'}' (frequency: ${right.frequency}) from min-heap.`,
      heap: heapAfterFirst.map(node => ({
        node,
        isExtracting: node.id === right.id,
      })),
      tree: rootNode,
      codes: [],
      extractingNodes: [left.id, right.id],
    });

    // Create new internal node
    const newNode = createNode(undefined, left.frequency + right.frequency, left, right);
    heap.insert(newNode);
    rootNode = newNode;

    steps.push({
      phase: 'building',
      description: `Created new internal node with frequency ${newNode.frequency}. Inserted back into min-heap.`,
      heap: heap.getArray().map(node => ({
        node,
        isInserting: node.id === newNode.id,
      })),
      tree: rootNode,
      codes: [],
      insertingNode: newNode.id,
    });
  }

  // Tree is built
  rootNode = heap.extractMin();
  steps.push({
    phase: 'building',
    description: 'Huffman Tree construction complete! Starting code generation by traversing the tree.',
    heap: [],
    tree: rootNode,
    codes: [],
  });

  // Generate codes through traversal
  const finalCodes: HuffmanCode[] = [];
  if (rootNode) {
    generateTraversalSteps(rootNode, '', steps, finalCodes, rootNode);
  }

  // Final step
  steps.push({
    phase: 'complete',
    description: 'Huffman coding complete! All characters have been assigned optimal prefix codes.',
    heap: [],
    tree: rootNode,
    codes: finalCodes.sort((a, b) => a.char.localeCompare(b.char)),
  });

  return steps;
}

function generateTraversalSteps(
  node: HuffmanNode | null,
  code: string,
  steps: AlgorithmStep[],
  codes: HuffmanCode[],
  rootNode: HuffmanNode
): void {
  if (!node) return;

  // Highlight current path
  const pathNodes = getPathToNode(rootNode, node.id);
  
  if (node.isLeaf && node.char) {
    steps.push({
      phase: 'traversing',
      description: `Traversing to find code for '${node.char}'. Path: ${code || '0'}. Found leaf '${node.char}'. Code is '${code || '0'}'.`,
      heap: [],
      tree: rootNode,
      codes: [...codes],
      highlightedPath: pathNodes,
      highlightedNodes: [node.id],
    });
    
    codes.push({ char: node.char, code: code || '0', frequency: node.frequency });
    return;
  }

  // Traverse left (add '0')
  if (node.left) {
    generateTraversalSteps(node.left, code + '0', steps, codes, rootNode);
  }

  // Traverse right (add '1')
  if (node.right) {
    generateTraversalSteps(node.right, code + '1', steps, codes, rootNode);
  }
}

function getPathToNode(root: HuffmanNode | null, targetId: string, path: string[] = []): string[] {
  if (!root) return [];
  
  path.push(root.id);
  
  if (root.id === targetId) {
    return [...path];
  }

  const leftPath = getPathToNode(root.left || null, targetId, [...path]);
  if (leftPath.length > path.length) return leftPath;

  const rightPath = getPathToNode(root.right || null, targetId, [...path]);
  if (rightPath.length > path.length) return rightPath;

  return [];
}

export function calculateTreeLayout(node: HuffmanNode | null, x = 400, y = 50, level = 0, horizontalSpacing = 150): void {
  if (!node) return;

  node.x = x;
  node.y = y;

  const spacing = Math.max(50, horizontalSpacing / Math.pow(2, level));
  const verticalSpacing = 70;

  if (node.left) {
    calculateTreeLayout(node.left, x - spacing, y + verticalSpacing, level + 1, horizontalSpacing);
  }
  if (node.right) {
    calculateTreeLayout(node.right, x + spacing, y + verticalSpacing, level + 1, horizontalSpacing);
  }
}
