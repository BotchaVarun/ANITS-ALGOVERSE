import { useState, useEffect, useRef } from 'react';
import { generateHuffmanSteps } from './utils/huffmanAlgorithm';
import { AlgorithmStep } from 'src/types/huffman';
import { HuffmanControls } from './HuffmanControls';
import { MinHeapView } from './MinHeapView';
import { HuffmanTreeView } from './HuffmanTreeView';
import { OutputPanel } from './OutputPanel';

export const HuffmanVisualizer = () => {
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const playbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const generatedSteps = generateHuffmanSteps();
    setSteps(generatedSteps);
    setCurrentStepIndex(0);
  }, []);

  useEffect(() => {
    if (isPlaying && currentStepIndex < steps.length - 1) {
      playbackTimerRef.current = window.setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 2000 / playbackSpeed);
    } else if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, steps.length, playbackSpeed]);

  const handlePlay = () => {
    if (currentStepIndex < steps.length - 1) {
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const currentStep = steps[currentStepIndex];

  if (!currentStep) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading visualization...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
        
          <p className="text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length} • Phase: {currentStep.phase}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls & Heap */}
          <div className="space-y-6">
            <HuffmanControls
              isPlaying={isPlaying}
              onPlay={handlePlay}
              onPause={handlePause}
              onNextStep={handleNextStep}
              onReset={handleReset}
              playbackSpeed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
              canGoNext={currentStepIndex < steps.length - 1}
            />
            <MinHeapView heap={currentStep.heap} />
          </div>

          {/* Center Column - Tree */}
          <div className="lg:col-span-2 space-y-6">
            <HuffmanTreeView
              tree={currentStep.tree}
              highlightedPath={currentStep.highlightedPath}
              highlightedNodes={currentStep.highlightedNodes}
            />
            <OutputPanel description={currentStep.description} codes={currentStep.codes} />
          </div>
        </div>
      </div>
    </div>
  );
};
