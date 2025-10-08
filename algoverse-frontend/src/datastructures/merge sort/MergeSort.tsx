import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

import { Link } from 'react-router-dom';
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
import {useEffect, useCallback, useRef } from 'react';
import { MergeSortArray } from '../merge sort/MergeSort/MergeSortArray';
import { MergeSortControls } from '../merge sort/MergeSort/MergeSortControls';
import { MergeSortStatus } from '../merge sort/MergeSort/MergeSortStatus';
import { getMergeSortActionsIterative, generateRandomArray } from '@/lib/mergeSort';
import { ValueItem, MergeSortAction } from '@/types/mergeSort';
import { toast } from 'sonner';

const  Merge = () =>{
  const [initialArray, setInitialArray] = useState<number[]>(() => 
    generateRandomArray(8, 1, 99)
  );
  const [items, setItems] = useState<ValueItem[]>([]);
  const [actions, setActions] = useState<MergeSortAction[]>([]);
  const [actionIndex, setActionIndex] = useState(0);
  const [currentAction, setCurrentAction] = useState<MergeSortAction | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [comparisons, setComparisons] = useState(0);
  const [mergeOperations, setMergeOperations] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const animationRef = useRef<NodeJS.Timeout>();

  // Initialize items from array
  const initializeItems = useCallback((arr: number[]) => {
    return arr.map((value, index) => ({
      id: `item-${index}-${value}`,
      value,
    }));
  }, []);

  // Initialize the visualization
  const initialize = useCallback(() => {
    const generatedActions = getMergeSortActionsIterative(initialArray);
    setActions(generatedActions);
    setItems(initializeItems(initialArray));
    setActionIndex(0);
    setCurrentAction(null);
    setComparisons(0);
    setMergeOperations(0);
    setCurrentLevel(0);
    setIsComplete(false);
    setIsPlaying(false);
  }, [initialArray, initializeItems]);

  // Initialize on mount and when array changes
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Apply an action to the visualization
  const applyAction = useCallback((action: MergeSortAction, currentItems: ValueItem[]) => {
    const newItems = [...currentItems];

    if (action.type === 'divide') {
      setCurrentLevel(action.level);
    } else if (action.type === 'compare') {
      setComparisons(prev => prev + 1);
      setCurrentLevel(action.level);
    } else if (action.type === 'merge') {
      setMergeOperations(prev => prev + 1);
      setCurrentLevel(action.level);
    } else if (action.type === 'place') {
      newItems[action.index] = {
        ...newItems[action.index],
        value: action.value,
        highlight: action.fromSubarray === 'left' ? 'left' : 'right',
      };
      setCurrentLevel(action.level);
    } else if (action.type === 'complete') {
      setIsComplete(true);
      toast.success('Merge sort complete!');
    }

    return newItems;
  }, []);

  // Reverse an action
  const reverseAction = useCallback((action: MergeSortAction, index: number, currentItems: ValueItem[]) => {
    const newItems = [...currentItems];

    if (action.type === 'divide') {
      // Restore level from previous action
      if (index > 0 && 'level' in actions[index - 1]) {
        setCurrentLevel((actions[index - 1] as any).level || 0);
      }
    } else if (action.type === 'compare') {
      setComparisons(prev => Math.max(0, prev - 1));
      if (index > 0 && 'level' in actions[index - 1]) {
        setCurrentLevel((actions[index - 1] as any).level || 0);
      }
    } else if (action.type === 'merge') {
      setMergeOperations(prev => Math.max(0, prev - 1));
      if (index > 0 && 'level' in actions[index - 1]) {
        setCurrentLevel((actions[index - 1] as any).level || 0);
      }
    } else if (action.type === 'place') {
      // Restore previous value from initial array
      newItems[action.index] = {
        ...newItems[action.index],
        value: initialArray[action.index],
        highlight: undefined,
      };
      if (index > 0 && 'level' in actions[index - 1]) {
        setCurrentLevel((actions[index - 1] as any).level || 0);
      }
    } else if (action.type === 'complete') {
      setIsComplete(false);
    }

    return newItems;
  }, [actions, initialArray]);

  // Step forward
  const stepForward = useCallback(() => {
    if (actionIndex < actions.length) {
      const action = actions[actionIndex];
      setCurrentAction(action);
      setItems(prevItems => applyAction(action, prevItems));
      setActionIndex(prev => prev + 1);
    }
  }, [actionIndex, actions, applyAction]);

  // Step backward
  const stepBackward = useCallback(() => {
    if (actionIndex > 0) {
      const prevIndex = actionIndex - 1;
      const action = actions[prevIndex];
      setItems(prevItems => reverseAction(action, prevIndex, prevItems));
      setActionIndex(prevIndex);
      
      if (prevIndex > 0) {
        setCurrentAction(actions[prevIndex - 1]);
      } else {
        setCurrentAction(null);
      }
    }
  }, [actionIndex, actions, reverseAction]);

  // Play/Pause
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Reset
  const reset = useCallback(() => {
    initialize();
  }, [initialize]);

  // Shuffle
  const shuffle = useCallback(() => {
    const newArray = generateRandomArray(8, 1, 99);
    setInitialArray(newArray);
    toast.success('Array shuffled!');
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Animation loop
  useEffect(() => {
    if (isPlaying && actionIndex < actions.length) {
      animationRef.current = setTimeout(() => {
        stepForward();
      }, speed);
    } else if (isPlaying && actionIndex >= actions.length) {
      setIsPlaying(false);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, actionIndex, actions.length, speed, stepForward]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (!isPlaying && actionIndex < actions.length) {
          stepForward();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (!isPlaying && actionIndex > 0) {
          stepBackward();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, actionIndex, actions.length, togglePlayPause, stepForward, stepBackward]);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="pt-12 pb-8 px-6 text-center border-b border-border">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Merge Sort Visualization
        </h1>
        <p className="text-muted-foreground">
          Iterative Divide and Conquer • Bottom-Up Approach
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <MergeSortArray 
          items={items} 
          currentAction={currentAction}
        />

        <MergeSortStatus
          currentAction={currentAction}
          actionIndex={actionIndex}
          totalActions={actions.length}
          comparisons={comparisons}
          mergeOperations={mergeOperations}
          currentLevel={currentLevel}
        />
      </div>

      {/* Controls */}
      <MergeSortControls
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        onStepForward={stepForward}
        onStepBack={stepBackward}
        onReset={reset}
        onShuffle={shuffle}
        onFullscreen={toggleFullscreen}
        speed={speed}
        onSpeedChange={setSpeed}
        isComplete={isComplete}
        canStepBack={actionIndex > 0}
        canStepForward={actionIndex < actions.length}
      />
    </div>
  );
}

const MergeSort = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Changed to true for default visibility
  const [isFullscreen, setIsFullscreen] = useState(false);

  const steps = [
    { id: 0, title: 'Description', icon: BookOpen, component: 'DescriptionSection' },
    { id: 1, title: 'Pseudocode', icon: Code, component: 'PseudocodeSection' },
    { id: 2, title: 'Advantages', icon: Check, component: 'AdvantagesSection' },
    { id: 3, title: 'Examples', icon: BookOpen, component: 'ExamplesSection' },
    { id: 4, title: 'Time Complexity', icon: Clock, component: 'TimeComplexitySection' },
    { id: 5, title: 'Space Complexity', icon: Database, component: 'SpaceComplexitySection' },
    { id: 6, title: 'Simulation', icon: Play, component: 'SimulationSection' },
    { id: 7, title: 'Try Out Challenges', icon: Trophy, component: 'ChallengesSection' }
  ];

  const progressPercentage = Math.round((completedSteps.length / (steps.length)) * 100);

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
                <div className="text-sm sm:text-lg font-semibold gradient-text truncate">Merge Sort</div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <Badge variant="secondary" className="text-xs sm:text-sm bg-primary/10 text-primary border-primary/20">{progressPercentage}%</Badge>
                <div className="hidden sm:flex items-center gap-2 glass-card rounded-full px-2 sm:px-3 py-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">Varun</span>
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
      <h1 className="section-title gradient-text">Merge Sort Description</h1>
      <div className="prose max-w-none h-full overflow-y-auto">
        <p className="text-base sm:text-lg mb-4 leading-relaxed">
          Merge Sort is an efficient, stable, divide-and-conquer sorting algorithm.
          It works by recursively dividing the array into two halves until each sub-array contains a single element,
          then merging those sub-arrays in a sorted manner to produce the final sorted array.
        </p>
        <h3 className="text-lg sm:text-xl font-semibold mb-3 text-primary">How it Works:</h3>
        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span>Divide the unsorted array into two halves recursively until each sub-array has one element</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span>Merge the sub-arrays by comparing elements from each half and placing them in sorted order</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span>Continue merging until all sub-arrays are combined into one sorted array</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span>The algorithm guarantees O(n log n) time complexity in all cases</span>
          </li>
        </ul>
        <p className="leading-relaxed">
          Merge Sort is particularly useful for sorting linked lists and large datasets, and is stable (maintains relative order of equal elements). It's widely used in external sorting where data doesn't fit into memory.
        </p>
      </div>
    </CardContent>
  </Card>
);

const PseudocodeSection = () => (
  <Card className="h-full algo-card overflow-hidden">
    <CardContent className="p-4 sm:p-8 h-full flex flex-col overflow-hidden">
      <h1 className="section-title gradient-text">Merge Sort Pseudocode</h1>

      {/* Outer card with scrollable content */}
      <Card className="bg-gray-900 text-green-400 flex-1 border border-primary/20 overflow-y-auto">
        <CardContent className="p-4 sm:p-6 font-mono min-h-full overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm sm:text-base">
{`function MergeSort(array):
    if length(array) > 1:
        mid = length(array) / 2
        leftHalf = array[0...mid-1]
        rightHalf = array[mid...end]

        MergeSort(leftHalf)
        MergeSort(rightHalf)

        i = j = k = 0
        while i < length(leftHalf) and j < length(rightHalf):
            if leftHalf[i] <= rightHalf[j]:
                array[k] = leftHalf[i]
                i = i + 1
            else:
                array[k] = rightHalf[j]
                j = j + 1
            k = k + 1

        while i < length(leftHalf):
            array[k] = leftHalf[i]
            i = i + 1
            k = k + 1

        while j < length(rightHalf):
            array[k] = rightHalf[j]
            j = j + 1
            k = k + 1`}
          </pre>
        </CardContent>
      </Card>
    </CardContent>
  </Card>
);






const AdvantagesSection = () => (
  <Card className="h-full algo-card">
    <CardContent className="p-4 sm:p-8 h-full flex flex-col">
      <h1 className="section-title gradient-text">Advantages of Merge Sort</h1>
      <div className="grid md:grid-cols-2 gap-6 flex-1">
        {/* Advantages */}
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
              <span className="text-sm sm:text-base">
                Consistent O(n log n) time complexity for all cases (best, average, and worst)
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm sm:text-base">
                Stable sorting algorithm — maintains the relative order of equal elements
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm sm:text-base">
                Works efficiently for large datasets and linked lists
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm sm:text-base">
                Ideal for external sorting (useful when data doesn’t fit into main memory)
              </span>
            </li>
          </ul>
        </div>

        {/* Disadvantages */}
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
              <span className="text-sm sm:text-base">
                Requires extra memory space of O(n) for merging process
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm sm:text-base">
                Slower than in-place algorithms like QuickSort for smaller datasets
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm sm:text-base">
                Requires additional effort to implement in-place, making it less space-efficient
              </span>
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
      <h1 className="section-title gradient-text">Merge Sort Examples</h1>
      <div className="space-y-6 flex-1 overflow-y-auto">
        
        {/* Example 1 */}
        <div className="glass-card p-4 sm:p-6 rounded-xl border border-primary/20">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-primary flex items-center gap-2">
            <div className="feature-icon p-2">
              <Target className="w-4 h-4" />
            </div>
            Example 1: Sorting an unsorted array
          </h3>
          <p className="mb-3 text-sm sm:text-base font-medium">Array: [4, 2, 7, 1, 3]</p>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs sm:text-sm border border-primary/10">
            <div className="text-blue-600 dark:text-blue-400">
              Step 1: Divide the array into two halves → [4, 2] and [7, 1, 3]
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              Step 2: Recursively divide until each subarray has one element
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              Step 3: Merge [4] and [2] → [2, 4]; Merge [7], [1], [3] → [1, 3, 7]
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              Step 4: Merge [2, 4] and [1, 3, 7] by comparing elements
            </div>
            <div className="text-green-600 dark:text-green-400 font-semibold">
              Step 5: Final sorted array → [1, 2, 3, 4, 7]
            </div>
          </div>
        </div>

        {/* Example 2 */}
        <div className="glass-card p-4 sm:p-6 rounded-xl border border-primary/20">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-primary flex items-center gap-2">
            <div className="feature-icon p-2">
              <Target className="w-4 h-4" />
            </div>
            Example 2: Sorting an already sorted array
          </h3>
          <p className="mb-3 text-sm sm:text-base font-medium">Array: [1, 2, 3, 4, 5]</p>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs sm:text-sm border border-primary/10">
            <div className="text-blue-600 dark:text-blue-400">
              Step 1: Divide array into halves until single elements remain
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              Step 2: Merge subarrays in sorted order (no changes occur)
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              Step 3: Continue merging until one sorted array forms
            </div>
            <div className="text-green-600 dark:text-green-400 font-semibold">
              Step 4: Final sorted array remains [1, 2, 3, 4, 5]
            </div>
          </div>
        </div>

        {/* Example 3 */}
        <div className="glass-card p-4 sm:p-6 rounded-xl border border-primary/20">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-primary flex items-center gap-2">
            <div className="feature-icon p-2">
              <Target className="w-4 h-4" />
            </div>
            Example 3: Sorting a reverse-sorted array
          </h3>
          <p className="mb-3 text-sm sm:text-base font-medium">Array: [9, 7, 5, 3, 1]</p>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs sm:text-sm border border-primary/10">
            <div className="text-blue-600 dark:text-blue-400">
              Step 1: Divide into halves → [9, 7] and [5, 3, 1]
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              Step 2: Recursively split → [9], [7], [5], [3], [1]
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              Step 3: Merge [9] & [7] → [7, 9]; Merge [5], [3], [1] → [1, 3, 5]
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              Step 4: Merge [7, 9] & [1, 3, 5] → [1, 3, 5, 7, 9]
            </div>
            <div className="text-green-600 dark:text-green-400 font-semibold">
              Step 5: Final sorted array → [1, 3, 5, 7, 9]
            </div>
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
            <div className="text-2xl sm:text-3xl font-bold mb-2 gradient-text">O(n log n)</div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Array is divided evenly at every step
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4 sm:p-6 text-center">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-yellow-600">Average Case</h3>
            <div className="text-2xl sm:text-3xl font-bold mb-2 gradient-text">O(n log n)</div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Consistent divide and merge pattern
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border border-red-200 dark:border-red-800">
          <CardContent className="p-4 sm:p-6 text-center">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-red-600">Worst Case</h3>
            <div className="text-2xl sm:text-3xl font-bold mb-2 gradient-text">O(n log n)</div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Even in the worst case, merges are consistent
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 text-primary">Explanation</h3>
        <p className="text-sm sm:text-base leading-relaxed">
          Merge Sort follows the divide-and-conquer approach by repeatedly dividing the array 
          into halves until single elements remain. Each level of recursion performs a merging 
          operation on <code>n</code> elements, and there are <code>log n</code> levels in total. 
          Therefore, the overall time complexity for best, average, and worst cases remains 
          <span className="text-primary font-semibold"> O(n log n)</span>. This makes Merge Sort 
          one of the most stable and predictable sorting algorithms in terms of time complexity.
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
        <div className="text-4xl sm:text-6xl font-bold gradient-text mb-4">O(n)</div>
        <p className="text-lg sm:text-xl text-primary font-semibold">Total Auxiliary Space</p>
      </div>

      <div className="prose max-w-none flex-1 overflow-y-auto">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 text-primary">Why O(n)?</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 p-3 rounded-lg glass-card border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span className="text-sm sm:text-base">
              Merge Sort requires additional space to store temporary subarrays during the merge process.
            </span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg glass-card border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span className="text-sm sm:text-base">
              Each merge step needs space proportional to the number of elements being merged.
            </span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg glass-card border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span className="text-sm sm:text-base">
              The recursion stack also contributes O(log n) space, but it’s dominated by the O(n) merge arrays.
            </span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg glass-card border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span className="text-sm sm:text-base">
              Unlike in-place algorithms like QuickSort, Merge Sort inherently needs extra memory for merging.
            </span>
          </li>
        </ul>

        <p className="mt-4 text-sm sm:text-base leading-relaxed">
          Merge Sort is not an in-place sorting algorithm since it needs additional arrays to 
          perform the merging step. While its time complexity is efficient, its space usage is 
          relatively high, making it less suitable for memory-constrained environments.
        </p>
      </div>
    </CardContent>
  </Card>
);




const SimulationSection = () => (
  <>
  <Merge />
  </>

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

export default MergeSort;
