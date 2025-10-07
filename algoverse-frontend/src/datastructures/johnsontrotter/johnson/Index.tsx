import { useState, useEffect, useRef } from 'react';
import { JohnsonTrotterAlgorithm } from '@/lib/johnsonTrotter';
import { AlgorithmStep } from '@/types/algorithm';
import { ControlPanel } from '../johnson/ControlPanel';
import { VisualizationArea } from '../johnson/VisualizationArea';
import { PermutationLog } from '../johnson/PermutationLog';

const Index = () => {
  const [algorithm] = useState(() => new JohnsonTrotterAlgorithm(3));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const steps = algorithm.getSteps();
  const permutations = algorithm.getPermutations();
  const currentStep = steps[currentStepIndex];
  const isComplete = currentStep.state === 'complete';

  // Calculate which permutation we're currently showing
  const currentPermutationIndex = steps
    .slice(0, currentStepIndex + 1)
    .filter(step => step.state === 'idle' || step.state === 'complete')
    .length - 1;

  useEffect(() => {
    if (isPlaying && !isComplete) {
      const delay = 1000 / speed;
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, steps.length, isComplete]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}


      {/* Main Stage - Visualization Area with Dynamic Caption */}
      <VisualizationArea step={currentStep} />

      {/* Permutation Log */}
      <PermutationLog
        permutations={permutations}
        currentPermutationIndex={currentPermutationIndex}
      />

      {/* Info Footer */}
      <div className="text-center text-sm text-muted-foreground py-8">
        <p>
          Step {currentStepIndex + 1} of {steps.length} • 
          Total permutations: {permutations.length}
        </p>
      </div>

      {/* Control Bar - Fixed at Bottom */}
      <ControlPanel
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onStep={handleStep}
        onReset={handleReset}
        speed={speed}
        onSpeedChange={handleSpeedChange}
        isComplete={isComplete}
      />
    </div>
  );
};

export default Index;
