import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Shuffle, Maximize } from 'lucide-react';

interface MergeSortControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onShuffle: () => void;
  onFullscreen: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  isComplete: boolean;
  canStepBack: boolean;
  canStepForward: boolean;
}

export const MergeSortControls = ({
  isPlaying,
  onPlayPause,
  onStepForward,
  onStepBack,
  onReset,
  onShuffle,
  onFullscreen,
  speed,
  onSpeedChange,
  isComplete,
  canStepBack,
  canStepForward,
}: MergeSortControlsProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border py-4 px-6 z-5">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 flex-wrap">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onStepBack}
            disabled={!canStepBack || isPlaying}
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-full"
            title="Step Back (←)"
            aria-label="Step back"
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            onClick={onPlayPause}
            disabled={isComplete}
            size="icon"
            className="h-12 w-12 rounded-full shadow-md hover:shadow-lg transition-all"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <Button
            onClick={onStepForward}
            disabled={!canStepForward || isPlaying}
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-full"
            title="Step Forward (→)"
            aria-label="Step forward"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-4 flex-1 max-w-md min-w-[200px]">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Speed
          </span>
          <Slider
            value={[speed]}
            onValueChange={(value) => onSpeedChange(value[0])}
            min={50}
            max={2000}
            step={50}
            className="flex-1"
            aria-label="Animation speed"
          />
          <span className="text-sm font-semibold text-foreground w-16 text-right">
            {speed}ms
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onShuffle}
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-full"
            title="Shuffle Array"
            aria-label="Shuffle array"
          >
            <Shuffle className="h-5 w-5" />
          </Button>

          <Button
            onClick={onReset}
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-full"
            title="Reset"
            aria-label="Reset"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          <Button
            onClick={onFullscreen}
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-full"
            title="Fullscreen"
            aria-label="Toggle fullscreen"
          >
            <Maximize className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
