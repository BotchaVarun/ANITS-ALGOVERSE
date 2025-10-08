import { Card } from '@/components/ui/card';
import { MergeSortAction } from '@/types/mergeSort';

interface MergeSortStatusProps {
  currentAction: MergeSortAction | null;
  actionIndex: number;
  totalActions: number;
  comparisons: number;
  mergeOperations: number;
  currentLevel: number;
}

export const MergeSortStatus = ({
  currentAction,
  actionIndex,
  totalActions,
  comparisons,
  mergeOperations,
  currentLevel,
}: MergeSortStatusProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <Card className="p-6 space-y-6">
        {/* Current Action Description */}
        <div 
          className="min-h-[60px] flex items-center justify-center"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-xl font-medium text-foreground text-center">
            {currentAction?.description || 'Ready to start merge sort...'}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Comparisons
            </p>
            <p className="text-2xl font-bold text-foreground">
              {comparisons}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Merge Operations
            </p>
            <p className="text-2xl font-bold text-foreground">
              {mergeOperations}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Current Level
            </p>
            <p className="text-2xl font-bold text-foreground">
              {currentLevel}
            </p>
          </div>
        </div>

        {/* Algorithm Info */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">
            Algorithm Info
          </h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• <span className="font-medium">Time Complexity:</span> O(n log n)</p>
            <p>• <span className="font-medium">Space Complexity:</span> O(n)</p>
            <p>• <span className="font-medium">Method:</span> Iterative Divide and Conquer</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
