import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

interface ControlPanelProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStep: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  isComplete: boolean;
}

export const ControlPanel = ({
  isPlaying,
  onPlayPause,
  onStep,
  onReset,
  speed,
  onSpeedChange,
  isComplete,
}: ControlPanelProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onPlayPause}
            disabled={isComplete}
            size="icon"
            className="h-12 w-12 rounded-full shadow-md hover:shadow-lg transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <Button
            onClick={onStep}
            disabled={isPlaying || isComplete}
            size="icon"
            variant="secondary"
            className="h-12 w-12 rounded-full"
            title="Next Step"
          >
            <SkipForward className="h-5 w-5" />
          </Button>

          <Button
            onClick={onReset}
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-full"
            title="Reset"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Speed
          </span>
          <Slider
            value={[speed]}
            onValueChange={(value) => onSpeedChange(value[0])}
            min={0.5}
            max={3}
            step={0.5}
            className="flex-1"
          />
          <span className="text-sm font-semibold text-foreground w-12 text-right">
            {speed.toFixed(1)}x
          </span>
        </div>
      </div>
    </div>
  );
};
