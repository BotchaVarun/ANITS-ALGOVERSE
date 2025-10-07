import { useState, useEffect, useRef } from 'react';
import { AStarAlgorithm } from '@/lib/astar';
import { HeuristicType } from '@/types/astar';
import { AStarGrid } from '../astar/AStarGrid';
import { AStarControls } from '../astar/AStarControls';
import { AStarStatus } from '../astar/AStarStatus';

const AStar = () => {
  const [gridSize, setGridSize] = useState({ rows: 20, cols: 20 });
  const [heuristic, setHeuristic] = useState<HeuristicType>('euclidean');
  const [algorithm, setAlgorithm] = useState(() => new AStarAlgorithm(20, 20, heuristic));
  const [state, setState] = useState(algorithm.getState());
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [drawMode, setDrawMode] = useState<'source' | 'goal' | 'obstacle'>('obstacle');
  const [isDrawing, setIsDrawing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize with default source, goal, and obstacles
  useEffect(() => {
    const algo = new AStarAlgorithm(gridSize.rows, gridSize.cols, heuristic);
    algo.setCellType(2, 2, 'source');
    algo.setCellType(17, 17, 'goal');
    
    // Add some obstacles
    for (let i = 5; i < 15; i++) {
      algo.setCellType(10, i, 'obstacle');
    }
    algo.setCellType(10, 10, 'empty'); // Create a gap
    
    setAlgorithm(algo);
    setState(algo.getState());
  }, [gridSize, heuristic]);

  useEffect(() => {
    if (isPlaying && !state.isComplete) {
      const delay = 1000 / speed;
      intervalRef.current = setInterval(() => {
        const continueRunning = algorithm.step();
        setState(algorithm.getState());
        if (!continueRunning) {
          setIsPlaying(false);
        }
      }, delay);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, state.isComplete, algorithm]);

  useEffect(() => {
    const handleMouseUp = () => setIsDrawing(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handlePlayPause = () => {
    if (!isPlaying && !state.isComplete) {
      const initialized = algorithm.initialize();
      if (!initialized) {
        setState(algorithm.getState());
        return;
      }
      setState(algorithm.getState());
    }
    setIsPlaying(!isPlaying);
  };

  const handleStep = () => {
    if (!state.source || !state.goal) {
      algorithm.initialize();
    }
    algorithm.step();
    setState(algorithm.getState());
  };

  const handleReset = () => {
    setIsPlaying(false);
    algorithm.reset();
    setState(algorithm.getState());
  };

  const handleClearObstacles = () => {
    setIsPlaying(false);
    algorithm.clearObstacles();
    algorithm.reset();
    setState(algorithm.getState());
  };

  const handleHeuristicChange = (newHeuristic: HeuristicType) => {
    setHeuristic(newHeuristic);
    setIsPlaying(false);
  };

  const handleGridSizeChange = (rows: number, cols: number) => {
    setGridSize({ rows, cols });
    setIsPlaying(false);
  };

  const handleCellClick = (x: number, y: number) => {
    setIsDrawing(true);
    if (drawMode === 'obstacle') {
      const currentType = state.grid[y][x].type;
      algorithm.setCellType(x, y, currentType === 'obstacle' ? 'empty' : 'obstacle');
    } else {
      algorithm.setCellType(x, y, drawMode);
    }
    setState(algorithm.getState());
  };

  const handleCellDrag = (x: number, y: number) => {
    if (drawMode === 'obstacle') {
      algorithm.setCellType(x, y, 'obstacle');
      setState(algorithm.getState());
    }
  };

  return (
    <div className="min-h-screen bg-background pb-48">
      <header className="text-center pt-8 pb-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-glow mb-2">
          A* Search Algorithm
        </h1>
        <p className="text-muted-foreground">
          Interactive visualization of pathfinding with configurable heuristics
        </p>
      </header>

      <AStarGrid
        grid={state.grid}
        currentNode={state.currentNode}
        path={state.path}
        onCellClick={handleCellClick}
        onCellDrag={handleCellDrag}
        isDrawing={isDrawing}
      />

      <AStarStatus
        statusText={state.statusText}
        currentNode={state.currentNode}
        heuristic={heuristic}
        openListSize={state.openList.length}
        closedListSize={state.closedList.length}
      />

      <AStarControls
        isPlaying={isPlaying}
        isComplete={state.isComplete}
        onPlayPause={handlePlayPause}
        onStep={handleStep}
        onReset={handleReset}
        onClearObstacles={handleClearObstacles}
        speed={speed}
        onSpeedChange={setSpeed}
        heuristic={heuristic}
        onHeuristicChange={handleHeuristicChange}
        gridSize={gridSize}
        onGridSizeChange={handleGridSizeChange}
        drawMode={drawMode}
        onDrawModeChange={setDrawMode}
      />
    </div>
  );
};

export default AStar;
