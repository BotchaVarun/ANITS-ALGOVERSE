import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
/* Index Imports */
import { useEffect, useRef } from 'react';
import { AStarAlgorithm } from '@/lib/astar';
import { HeuristicType } from '@/types/astar';
import { AStarGrid } from '../Astar/astar/AStarGrid';
import { AStarControls } from '../Astar/astar/AStarControls';
import { AStarStatus } from '../Astar/astar/AStarStatus';
/*   */
import { 
  ChevronLeft,
  User,
  Check,
  Play,
  Code,
  GitBranch,
  Clock,
  Database,
  Target,
  Trophy,
  BookOpen,
  Menu,
  X,
  Maximize,
  Minimize
} from 'lucide-react';
const Index = () => {
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
const AStar = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Changed to true for default visibility
  const [isFullscreen, setIsFullscreen] = useState(false);

  const steps = [
    { id: 0, title: 'Description', icon: BookOpen, component: 'DescriptionSection' },
    { id: 1, title: 'Pseudocode', icon: Code, component: 'PseudocodeSection' },
    { id: 2, title: 'Flowchart', icon: GitBranch, component: 'FlowchartSection' },
    { id: 3, title: 'Advantages', icon: Check, component: 'AdvantagesSection' },
    { id: 4, title: 'Examples', icon: BookOpen, component: 'ExamplesSection' },
    { id: 5, title: 'Time Complexity', icon: Clock, component: 'TimeComplexitySection' },
    { id: 6, title: 'Space Complexity', icon: Database, component: 'SpaceComplexitySection' },
    { id: 7, title: 'Simulation', icon: Play, component: 'SimulationSection' },
    { id: 8, title: 'Try Out Challenges', icon: Trophy, component: 'ChallengesSection' }
  ];

  const progressPercentage = Math.round((completedSteps.length / (steps.length-1)) * 100);

  const markAsComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    // Auto-advance to next step if not at the end
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    switch (step.component) {
      case 'DescriptionSection':
        return <DescriptionSection />;
      case 'PseudocodeSection':
        return <PseudocodeSection />;
      case 'FlowchartSection':
        return <FlowchartSection />;
      case 'AdvantagesSection':
        return <AdvantagesSection />;
      case 'ExamplesSection':
        return <ExamplesSection />;
      case 'TimeComplexitySection':
        return <TimeComplexitySection />;
      case 'SpaceComplexitySection':
        return <SpaceComplexitySection />;
      case 'SimulationSection':
        return <SimulationSection/>;
      case 'ChallengesSection':
        return <ChallengesSection onComplete={() => markAsComplete()} />;
      default:
        return <DescriptionSection />;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 dark:from-background dark:via-primary/10 dark:to-secondary/15 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Watermark */}
      <div className="watermark">AlgoVerse</div>
      
      {/* Mobile-Optimized Navbar */}
      {!isFullscreen && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-primary/20">
          <div className="px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-primary/10"
                >
                  {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
                <Link to="/datastructures" className="hidden sm:flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back </span>
                </Link>
                <div className="text-sm sm:text-lg font-semibold gradient-text truncate">A Star</div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <Badge variant="secondary" className="text-xs sm:text-sm bg-primary/10 text-primary border-primary/20">{progressPercentage}%</Badge>
                <div className="hidden sm:flex items-center gap-2 glass-card rounded-full px-2 sm:px-3 py-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">John Doe</span>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      <div className={`flex ${!isFullscreen ? 'pt-12 sm:pt-16' : ''} h-screen`}>
        {/* Mobile-Optimized Sidebar */}
        {sidebarOpen && !isFullscreen && (
          <>
            {/* Mobile overlay */}
            <div 
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={toggleSidebar}
            />
            
            <div className={`fixed left-0 top-12 sm:top-16 h-[calc(100vh-3rem)] sm:h-[calc(100vh-4rem)] w-72 sm:w-80 glass-card border-r border-primary/20 z-40 md:z-30 overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold gradient-text">Learning Path</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="h-8 w-8 sm:h-10 sm:w-10 md:hidden hover:bg-primary/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm font-medium">
                      <span>Progress</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = completedSteps.includes(step.id);
                    const isCurrent = currentStep === step.id;
                    
                    return (
                      <button
                        key={step.id}
                        onClick={() => {
                          setCurrentStep(step.id);
                          // Close sidebar on mobile after selection
                          if (window.innerWidth < 768) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl text-left transition-all duration-300 ${
                          isCurrent 
                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20' 
                            : isCompleted
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                            : 'hover:bg-primary/10 hover:shadow-md'
                        }`}
                      >
                        <div className={`relative flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-all ${
                          isCurrent 
                            ? 'bg-white text-primary shadow-sm' 
                            : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {isCompleted ? (
                            <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                          ) : (
                            <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm sm:text-base truncate">{step.title}</div>
                          <div className="text-xs opacity-70">Step {index + 1} of {steps.length}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <div className={`flex-1 ${sidebarOpen && !isFullscreen ? 'md:ml-80' : ''} ${isFullscreen ? 'p-4 sm:p-8' : 'p-3 sm:p-6'} relative h-full`}>
          <div className={`${isFullscreen ? 'h-full' : 'max-w-6xl mx-auto h-full'}`}>
            <div className="h-full pb-20">
              {renderStepContent()}
            </div>
          </div>
          
          {/* Mobile-Optimized Fixed Action Buttons */}
          <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 sm:gap-3">
            {/* Fullscreen Toggle Button */}
            <Button 
              onClick={toggleFullscreen}
              variant="secondary"
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-primary/20 hover:bg-primary/10"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
            
            {/* Mark as Complete Button */}
            {currentStep < 7 && (
              <Button 
                onClick={markAsComplete}
                disabled={completedSteps.includes(currentStep)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-xl shadow-green-500/20 hover:shadow-green-500/30 h-10 sm:h-12 px-3 sm:px-4 text-xs sm:text-sm transition-all duration-300"
              >
                {completedSteps.includes(currentStep) ? (
                  <>
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Completed</span>
                    <span className="sm:hidden">Done</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Mark as Complete</span>
                    <span className="sm:hidden">Complete</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Section Components
const DescriptionSection = () => (
  <Card className="h-full algo-card">
    <CardContent className="p-4 sm:p-8 h-full">
      <h1 className="section-title gradient-text">A Star Description</h1>
      <div className="prose max-w-none h-full overflow-y-auto">
        <p className="text-base sm:text-lg mb-4 leading-relaxed">
          A* (A-Star) is an informed search algorithm widely used in pathfinding and graph traversal. 
          It finds the most optimal path from a start node to a goal node by combining the advantages of Dijkstra’s Algorithm and Greedy Best-First Search.
        </p>
        <h3 className="text-lg sm:text-xl font-semibold mb-3 text-primary">How it Works:</h3>
        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span>Start from the initial node and place it in an open list (nodes to be evaluated)</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span>Calculate the cost function f(n) = g(n) + h(n), where:</span>
          </li>
          <li className="flex items-start gap-3 pl-6">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span><strong>g(n)</strong> is the cost from the start node to the current node</span>
          </li>
          <li className="flex items-start gap-3 pl-6">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span><strong>h(n)</strong> is the estimated cost from the current node to the goal (heuristic)</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span>Select the node with the lowest f(n) from the open list and move it to the closed list (evaluated nodes)</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span>Repeat the process for neighbors, updating their costs and parents if a better path is found</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span>Continue until the goal node is reached or the open list becomes empty</span>
          </li>
        </ul>
        <p className="leading-relaxed">
          A* 
           is widely used in applications like GPS navigation, games, and robotics for efficient route planning.
        </p>
      </div>
    </CardContent>
  </Card>
);


const PseudocodeSection = () => (
  <Card className="h-full algo-card">
    <CardContent className="p-4 sm:p-8 h-full flex flex-col">
      <h1 className="section-title gradient-text">A Star Pseudocode</h1>
      <Card className="bg-gray-900 text-green-400 flex-1 border border-primary/20">
        <CardContent className="p-4 sm:p-6 font-mono h-full overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm sm:text-base">
{`function AStar(start, goal, graph):
    openSet = {start}
    gScore[start] = 0
    fScore[start] = heuristic(start, goal)
    while openSet is not empty:
        current = node with lowest fScore
        if current == goal: return reconstructPath(cameFrom, current)
        remove current from openSet
        for neighbor in graph[current]:
            tentative_gScore = gScore[current] + distance(current, neighbor)
            if tentative_gScore < gScore[neighbor]:
                cameFrom[neighbor] = current
                gScore[neighbor] = tentative_gScore
                fScore[neighbor] = gScore[neighbor] + heuristic(neighbor, goal)
                openSet.add(neighbor)
    return failure`} 
          </pre>
        </CardContent>
      </Card>
    </CardContent>
  </Card>
);

const FlowchartSection = () => (
  <Card className="h-full algo-card">
    <CardContent className="p-4 sm:p-8 h-full flex flex-col">
      <h1 className="section-title gradient-text">A Star Flowchart</h1>
      <div className="flex justify-center items-center flex-1">
        <div className="glass-card p-8 rounded-2xl w-full h-full flex items-center justify-center min-h-[400px] border border-primary/20">
          <div className="text-center">
            <div className="feature-icon mx-auto mb-4">
              <GitBranch className="w-8 h-8" />
            </div>
            <p className="text-center text-muted-foreground text-base sm:text-lg">
              Flowchart visualization would be implemented here using a drawing library like D3.js or a flowchart component.
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdvantagesSection = () => (
  <Card className="h-full algo-card">
    <CardContent className="p-4 sm:p-8 h-full flex flex-col">
      <h1 className="section-title gradient-text">Advantages of A Star</h1>
      <div className="grid md:grid-cols-2 gap-6 flex-1">
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-green-600 flex items-center gap-2">
            <div className="feature-icon p-2">
              <Check className="w-4 h-4" />
            </div>
            Advantages
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Finds the shortest path efficiently</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Uses heuristics to optimize search</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Works well in many applications like game AI and robotics</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Guaranteed to find the optimal path if heuristics are admissible</span>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-red-600 flex items-center gap-2">
            <div className="feature-icon p-2 bg-red-100 dark:bg-red-900/20 text-red-600">
              <X className="w-4 h-4" />
            </div>
            Disadvantages
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Can be computationally expensive for large graphs</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Performance depends on the heuristic used</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm sm:text-base">May consume significant memory for storing paths</span>
            </li>
          </ul>
        </div>
      </div>
    </CardContent>
  </Card>
);
const ExamplesSection = () => (
  <Card className="h-full algo-card">
    <CardContent className="p-4 sm:p-8 h-full flex flex-col">
      <h1 className="section-title gradient-text">A Star Examples</h1>
      <div className="space-y-6 flex-1 overflow-y-auto">
        <div className="glass-card p-4 sm:p-6 rounded-xl border border-primary/20">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-primary flex items-center gap-2">
            <div className="feature-icon p-2">
              <Target className="w-4 h-4" />
            </div>
            Example 1: Finding the shortest path on a grid
          </h3>
          <p className="mb-3 text-sm sm:text-base font-medium">Start: (0,0), Goal: (4,4)</p>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs sm:text-sm border border-primary/10">
            <div className="text-blue-600 dark:text-blue-400">Step 1: Add start node (0,0) to open set</div>
            <div className="text-blue-600 dark:text-blue-400">Step 2: Select node with lowest f-score, expand neighbors</div>
            <div className="text-blue-600 dark:text-blue-400">Step 3: Update g-score and f-score of neighbors</div>
            <div className="text-green-600 dark:text-green-400 font-semibold">Step 4: Continue until goal (4,4) is reached, reconstruct path</div>
          </div>
        </div>

        <div className="glass-card p-4 sm:p-6 rounded-xl border border-primary/20">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-primary flex items-center gap-2">
            <div className="feature-icon p-2">
              <Target className="w-4 h-4" />
            </div>
            Example 2: Path blocked, finding alternative route
          </h3>
          <p className="mb-3 text-sm sm:text-base font-medium">Start: (0,0), Goal: (4,4), Obstacle at (2,2)</p>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs sm:text-sm border border-primary/10">
            <div className="text-blue-600 dark:text-blue-400">Step 1: Add start node (0,0) to open set</div>
            <div className="text-blue-600 dark:text-blue-400">Step 2: Encounter obstacle (2,2), avoid it</div>
            <div className="text-blue-600 dark:text-blue-400">Step 3: Redirect path around the obstacle</div>
            <div className="text-green-600 dark:text-green-400 font-semibold">Step 4: Continue search until goal (4,4) is reached</div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TimeComplexitySection = () => (
  <Card className="h-full algo-card">
    <CardContent className="p-4 sm:p-8 h-full flex flex-col">
      <h1 className="section-title gradient-text">Time Complexity Analysis</h1>
      <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <Card className="glass-card border border-green-200 dark:border-green-800">
          <CardContent className="p-4 sm:p-6 text-center">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-green-600">Best Case</h3>
            <div className="text-2xl sm:text-3xl font-bold mb-2 gradient-text">O(b^d)</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Direct path with minimal node expansions</p>
          </CardContent>
        </Card>

        <Card className="glass-card border border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4 sm:p-6 text-center">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-yellow-600">Average Case</h3>
            <div className="text-2xl sm:text-3xl font-bold mb-2 gradient-text">O(b^d)</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Explores nodes efficiently using heuristic</p>
          </CardContent>
        </Card>

        <Card className="glass-card border border-red-200 dark:border-red-800">
          <CardContent className="p-4 sm:p-6 text-center">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-red-600">Worst Case</h3>
            <div className="text-2xl sm:text-3xl font-bold mb-2 gradient-text">O(E log V)</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Expands all possible nodes before finding goal</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 text-primary">Explanation</h3>
        <p className="text-sm sm:text-base leading-relaxed">
          The A* algorithm’s time complexity depends on the branching factor (b) and the depth (d) of the optimal path.
          In the worst case, when many nodes are expanded, it behaves similarly to Dijkstra’s algorithm with O(E log V) complexity.
          The efficiency of A* is highly dependent on the heuristic function used, which guides the algorithm towards the goal efficiently.
        </p>
      </div>
    </CardContent>
  </Card>
);
const SpaceComplexitySection = () => (
  <Card className="h-full algo-card">
    <CardContent className="p-4 sm:p-8 h-full flex flex-col">
      <h1 className="section-title gradient-text">Space Complexity Analysis</h1>
      <div className="text-center mb-6">
        <div className="text-4xl sm:text-6xl font-bold gradient-text mb-4">O(b^d)</div>
        <p className="text-lg sm:text-xl text-primary font-semibold">Memory usage grows with explored nodes</p>
      </div>

      <div className="prose max-w-none flex-1 overflow-y-auto">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 text-primary">Why O(b^d)?</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 p-3 rounded-lg glass-card border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span className="text-sm sm:text-base">A* maintains open and closed sets, increasing space usage</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg glass-card border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span className="text-sm sm:text-base">Tracks g-scores, f-scores, and previous nodes</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg glass-card border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span className="text-sm sm:text-base">Space complexity depends on search depth and branching factor</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg glass-card border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span className="text-sm sm:text-base">Efficient heuristics reduce memory consumption</span>
          </li>
        </ul>

        <p className="mt-4 text-sm sm:text-base leading-relaxed">
          A* requires O(b^d) space because it stores paths and scores during exploration.
          Optimized heuristics and data structures like priority queues help manage space effectively.
        </p>
      </div>
    </CardContent>
  </Card>
);

const SimulationSection = () => (
  
       <Index/>
  
);

const ChallengesSection = ({ onComplete }: { onComplete: () => void }) => (
  <Card className="h-full algo-card">
    <CardContent className="p-4 sm:p-8 h-full flex flex-col">
      <h1 className="section-title gradient-text">Practice Challenges</h1>
      <div className="glass-card p-8 sm:p-12 rounded-2xl text-center flex-1 flex flex-col items-center justify-center min-h-[400px] border border-primary/20">
        <div className="feature-icon mx-auto mb-6">
          <Trophy className="w-12 h-12 sm:w-16 sm:h-16" />
        </div>
        <p className="text-base sm:text-lg text-muted-foreground mb-6 max-w-md leading-relaxed">
          Interactive coding challenges would be implemented here for hands-on practice
        </p>
        <Button onClick={onComplete} className="cta-button">
          Complete All Challenges
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default AStar;
