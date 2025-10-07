import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Play, Pause, SkipForward, RotateCcw, Trash2 } from 'lucide-react';
import { HeuristicType } from '@/types/astar';

interface AStarControlsProps {
  isPlaying: boolean;
  isComplete: boolean;
  onPlayPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onClearObstacles: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  heuristic: HeuristicType;
  onHeuristicChange: (heuristic: HeuristicType) => void;
  gridSize: { rows: number; cols: number };
  onGridSizeChange: (rows: number, cols: number) => void;
  drawMode: 'source' | 'goal' | 'obstacle';
  onDrawModeChange: (mode: 'source' | 'goal' | 'obstacle') => void;
}

export const AStarControls = ({
  isPlaying,
  isComplete,
  onPlayPause,
  onStep,
  onReset,
  onClearObstacles,
  speed,
  onSpeedChange,
  heuristic,
  onHeuristicChange,
  gridSize,
  onGridSizeChange,
  drawMode,
  onDrawModeChange,
}: AStarControlsProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border py-4 px-6 z-5">
      <div className="max-w-3xl mx-auto space-y-4 justify-between gap-8">
        {/* Main Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Execution Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onPlayPause}
              disabled={isComplete}
              size="icon"
              className="h-10 w-10 rounded-full"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              onClick={onStep}
              disabled={isPlaying || isComplete}
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full"
              title="Next Step"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button
              onClick={onReset}
              size="icon"
              variant="outline"
              className="h-10 w-10 rounded-full"
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              onClick={onClearObstacles}
              size="icon"
              variant="outline"
              className="h-10 w-10 rounded-full"
              title="Clear Obstacles"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <span className="text-sm font-medium whitespace-nowrap">Speed</span>
            <Slider
              value={[speed]}
              onValueChange={(value) => onSpeedChange(value[0])}
              min={0.5}
              max={5}
              step={0.5}
              className="flex-1"
            />
            <span className="text-sm font-semibold w-12 text-right">{speed.toFixed(1)}x</span>
          </div>

          {/* Heuristic Selection */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium whitespace-nowrap">Heuristic</span>
            <Select value={heuristic} onValueChange={(value) => onHeuristicChange(value as HeuristicType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manhattan">Manhattan</SelectItem>
                <SelectItem value="diagonal">Diagonal</SelectItem>
                <SelectItem value="euclidean">Euclidean</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Draw Mode */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Draw:</span>
            <Button
              variant={drawMode === 'source' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDrawModeChange('source')}
            >
              Source
            </Button>
            <Button
              variant={drawMode === 'goal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDrawModeChange('goal')}
            >
              Goal
            </Button>
            <Button
              variant={drawMode === 'obstacle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDrawModeChange('obstacle')}
            >
              Obstacle
            </Button>
          </div>

          {/* Grid Size */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Grid Size:</span>
            <Input
              type="number"
              value={gridSize.cols}
              onChange={(e) => onGridSizeChange(gridSize.rows, parseInt(e.target.value) || 20)}
              min={10}
              max={50}
              className="w-16 h-8"
            />
            <span className="text-sm">×</span>
            <Input
              type="number"
              value={gridSize.rows}
              onChange={(e) => onGridSizeChange(parseInt(e.target.value) || 20, gridSize.cols)}
              min={10}
              max={50}
              className="w-16 h-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
