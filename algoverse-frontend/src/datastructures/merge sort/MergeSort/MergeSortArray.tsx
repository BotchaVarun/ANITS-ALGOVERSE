import { ValueItem, MergeSortAction } from '@/types/mergeSort';
import { cn } from '@/lib/utils';

interface MergeSortArrayProps {
  items: ValueItem[];
  currentAction: MergeSortAction | null;
}

export const MergeSortArray = ({ items, currentAction }: MergeSortArrayProps) => {
  const getItemHighlight = (index: number, item: ValueItem): string => {
    if (currentAction?.type === 'compare') {
      if (index === currentAction.leftIndex) {
        return 'bg-algo-left border-algo-left shadow-lg scale-125 ring-4 ring-algo-left/30';
      }
      if (index === currentAction.rightIndex) {
        return 'bg-algo-right border-algo-right shadow-lg scale-125 ring-4 ring-algo-right/30';
      }
    }
    
    if (currentAction?.type === 'place') {
      if (index === currentAction.index) {
        return 'bg-algo-largest border-algo-largest shadow-glow scale-125 ring-4 ring-algo-largest/40 animate-pulse';
      }
    }

    if (currentAction?.type === 'merge') {
      if (index >= currentAction.startIndex && index <= currentAction.endIndex) {
        return 'border-primary bg-primary/5';
      }
    }

    // Default styling based on item highlight
    if (item.highlight === 'left') {
      return 'bg-algo-left/20 border-algo-left/50';
    }
    if (item.highlight === 'right') {
      return 'bg-algo-right/20 border-algo-right/50';
    }
    if (item.highlight === 'merged') {
      return 'bg-algo-largest/20 border-algo-largest/50';
    }

    return 'bg-card border-border';
  };

  return (
    <div className="flex flex-col items-center justify-center gap-12 py-12 min-h-[400px]">
      {/* Array Visualization */}
      <div className="flex items-center justify-center gap-4 flex-wrap max-w-4xl">
        {items.map((item, index) => (
          <div
            key={`cell-${index}`}
            className={cn(
              'relative flex items-center justify-center',
              'w-20 h-20 rounded-xl font-mono font-bold',
              'border-2 transition-all duration-200 ease-out',
              'hover:shadow-md',
              getItemHighlight(index, item)
            )}
          >
            <span 
              key={`value-${index}-${item.value}`}
              className="text-3xl text-foreground"
            >
              {item.value}
            </span>
            <span className="absolute -top-2 -left-2 text-xs text-muted-foreground bg-background rounded-full w-5 h-5 flex items-center justify-center border border-border">
              {index}
            </span>
          </div>
        ))}
      </div>

      {/* Level Indicator */}
      {currentAction && currentAction.type !== 'complete' && 'level' in currentAction && currentAction.level > 0 && (
        <div className="text-center">
          <div className="inline-block px-6 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-sm font-medium text-primary">
              Level {currentAction.level}
              {' • Subarray Size: '}{'subarraySize' in currentAction ? currentAction.subarraySize : '-'}
            </span>
          </div>
        </div>
      )}

      {/* Color Legend */}
      <div className="flex items-center gap-6 text-sm flex-wrap justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-algo-left bg-algo-left"></div>
          <span className="text-muted-foreground">Left Subarray</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-algo-right bg-algo-right"></div>
          <span className="text-muted-foreground">Right Subarray</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-algo-largest bg-algo-largest"></div>
          <span className="text-muted-foreground">Merging/Placing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-primary bg-primary/5"></div>
          <span className="text-muted-foreground">Active Range</span>
        </div>
      </div>
    </div>
  );
};
