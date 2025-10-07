import { GridNode, HeuristicType, AStarState } from '@/types/astar';

export class AStarAlgorithm {
  private rows: number;
  private cols: number;
  private heuristic: HeuristicType;
  private grid: GridNode[][];
  private openList: GridNode[];
  private closedList: GridNode[];
  private source: { x: number; y: number } | null = null;
  private goal: { x: number; y: number } | null = null;
  private currentNode: GridNode | null = null;
  private path: GridNode[] = [];
  private isComplete = false;
  private isPathFound = false;
  private statusText = 'Ready to start';

  constructor(rows: number, cols: number, heuristic: HeuristicType = 'euclidean') {
    this.rows = rows;
    this.cols = cols;
    this.heuristic = heuristic;
    this.grid = this.initializeGrid();
    this.openList = [];
    this.closedList = [];
  }

  private initializeGrid(): GridNode[][] {
    const grid: GridNode[][] = [];
    for (let y = 0; y < this.rows; y++) {
      grid[y] = [];
      for (let x = 0; x < this.cols; x++) {
        grid[y][x] = {
          x,
          y,
          type: 'empty',
          g: Infinity,
          h: 0,
          f: Infinity,
          parent: null,
          inOpenList: false,
          inClosedList: false,
        };
      }
    }
    return grid;
  }

  setHeuristic(heuristic: HeuristicType) {
    this.heuristic = heuristic;
  }

  setCellType(x: number, y: number, type: 'source' | 'goal' | 'obstacle' | 'empty') {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return;

    const node = this.grid[y][x];
    
    if (type === 'source') {
      if (this.source) {
        this.grid[this.source.y][this.source.x].type = 'empty';
      }
      this.source = { x, y };
    } else if (type === 'goal') {
      if (this.goal) {
        this.grid[this.goal.y][this.goal.x].type = 'empty';
      }
      this.goal = { x, y };
    }
    
    node.type = type;
  }

  clearObstacles() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x].type === 'obstacle') {
          this.grid[y][x].type = 'empty';
        }
      }
    }
  }

  reset() {
    this.openList = [];
    this.closedList = [];
    this.currentNode = null;
    this.path = [];
    this.isComplete = false;
    this.isPathFound = false;
    this.statusText = 'Ready to start';
    
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const node = this.grid[y][x];
        node.g = Infinity;
        node.h = 0;
        node.f = Infinity;
        node.parent = null;
        node.inOpenList = false;
        node.inClosedList = false;
      }
    }
  }

  initialize() {
    if (!this.source || !this.goal) {
      this.statusText = 'Please set source and goal';
      return false;
    }

    this.reset();
    const sourceNode = this.grid[this.source.y][this.source.x];
    sourceNode.g = 0;
    sourceNode.h = this.calculateH(sourceNode);
    sourceNode.f = sourceNode.g + sourceNode.h;
    sourceNode.inOpenList = true;
    this.openList.push(sourceNode);
    this.statusText = 'Initialized - Source added to Open List';
    return true;
  }

  private calculateH(node: GridNode): number {
    if (!this.goal) return 0;

    const dx = Math.abs(node.x - this.goal.x);
    const dy = Math.abs(node.y - this.goal.y);

    switch (this.heuristic) {
      case 'manhattan':
        return dx + dy;
      case 'diagonal':
        return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
      case 'euclidean':
        return Math.sqrt(dx * dx + dy * dy);
      default:
        return 0;
    }
  }

  private getNeighbors(node: GridNode): GridNode[] {
    const neighbors: GridNode[] = [];
    const directions = this.heuristic === 'manhattan' 
      ? [[0, 1], [1, 0], [0, -1], [-1, 0]]
      : [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];

    for (const [dx, dy] of directions) {
      const newX = node.x + dx;
      const newY = node.y + dy;

      if (newX >= 0 && newX < this.cols && newY >= 0 && newY < this.rows) {
        const neighbor = this.grid[newY][newX];
        if (neighbor.type !== 'obstacle') {
          neighbors.push(neighbor);
        }
      }
    }

    return neighbors;
  }

  private reconstructPath(node: GridNode) {
    const path: GridNode[] = [];
    let current: GridNode | null = node;
    while (current) {
      path.unshift(current);
      current = current.parent;
    }
    this.path = path;
  }

  step(): boolean {
    if (this.isComplete) return false;

    if (this.openList.length === 0) {
      this.statusText = 'No path found - Open List is empty';
      this.isComplete = true;
      this.isPathFound = false;
      return false;
    }

    // Find node with lowest f in open list
    this.openList.sort((a, b) => a.f - b.f);
    const q = this.openList.shift()!;
    this.currentNode = q;
    
    q.inOpenList = false;
    q.inClosedList = true;
    this.closedList.push(q);

    // Check if goal reached
    if (q.type === 'goal') {
      this.reconstructPath(q);
      this.statusText = `Path found! Total cost: ${q.g.toFixed(2)}`;
      this.isComplete = true;
      this.isPathFound = true;
      return false;
    }

    this.statusText = `Processing node (${q.x}, ${q.y}) with f=${q.f.toFixed(2)}`;

    // Process neighbors
    const neighbors = this.getNeighbors(q);
    
    for (const successor of neighbors) {
      if (successor.inClosedList) continue;

      const isDiagonal = successor.x !== q.x && successor.y !== q.y;
      const moveCost = isDiagonal ? Math.SQRT2 : 1;
      const tentativeG = q.g + moveCost;

      if (!successor.inOpenList) {
        successor.g = tentativeG;
        successor.h = this.calculateH(successor);
        successor.f = successor.g + successor.h;
        successor.parent = q;
        successor.inOpenList = true;
        this.openList.push(successor);
      } else if (tentativeG < successor.g) {
        successor.g = tentativeG;
        successor.f = successor.g + successor.h;
        successor.parent = q;
      }
    }

    return true;
  }

  getState(): AStarState {
    return {
      grid: this.grid,
      openList: this.openList,
      closedList: this.closedList,
      currentNode: this.currentNode,
      path: this.path,
      isComplete: this.isComplete,
      isPathFound: this.isPathFound,
      statusText: this.statusText,
      source: this.source,
      goal: this.goal,
    };
  }
}
