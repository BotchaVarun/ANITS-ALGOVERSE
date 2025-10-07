import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface HuffmanControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNextStep: () => void;
  onReset: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  canGoNext: boolean;
}

export const HuffmanControls = ({
  isPlaying,
  onPlay,
  onPause,
  onNextStep,
  onReset,
  playbackSpeed,
  onSpeedChange,
  canGoNext,
}: HuffmanControlsProps) => {
  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border shadow-sm">
      <h2 className="text-lg font-semibold">Controls</h2>
      
      <div className="flex gap-2">
        {!isPlaying ? (
          <Button onClick={onPlay} disabled={!canGoNext} size="lg" className="flex-1">
            <Play className="mr-2 h-5 w-5" />
            Play
          </Button>
        ) : (
          <Button onClick={onPause} size="lg" className="flex-1" variant="secondary">
            <Pause className="mr-2 h-5 w-5" />
            Pause
          </Button>
        )}
        
        <Button onClick={onNextStep} disabled={!canGoNext || isPlaying} size="lg" className="flex-1">
          <SkipForward className="mr-2 h-5 w-5" />
          Next Step
        </Button>
      </div>

      <Button onClick={onReset} variant="outline" size="lg">
        <RotateCcw className="mr-2 h-5 w-5" />
        Reset
      </Button>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Speed</span>
          <span className="font-mono">{playbackSpeed.toFixed(1)}x</span>
        </div>
        <Slider
          value={[playbackSpeed]}
          onValueChange={([value]) => onSpeedChange(value)}
          min={0.5}
          max={3}
          step={0.5}
          className="w-full"
        />
      </div>
    </div>
  );
};
