import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GridNode, HeuristicType } from '@/types/astar';

interface AStarStatusProps {
  statusText: string;
  currentNode: GridNode | null;
  heuristic: HeuristicType;
  openListSize: number;
  closedListSize: number;
}

export const AStarStatus = ({
  statusText,
  currentNode,
  heuristic,
  openListSize,
  closedListSize,
}: AStarStatusProps) => {
  const getHeuristicName = () => {
    switch (heuristic) {
      case 'manhattan': return 'Manhattan Distance (4-way)';
      case 'diagonal': return 'Diagonal Distance (8-way)';
      case 'euclidean': return 'Euclidean Distance (8-way)';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Algorithm Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current State</p>
            <p className="text-base">{statusText}</p>
          </div>
          {currentNode && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Processing Node</p>
              <p className="text-base">
                Position: ({currentNode.x}, {currentNode.y})
              </p>
              <p className="text-sm">
                g = {currentNode.g.toFixed(2)} | h = {currentNode.h.toFixed(2)} | f = {currentNode.f.toFixed(2)}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Open List</p>
              <p className="text-lg font-semibold">{openListSize}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Closed List</p>
              <p className="text-lg font-semibold">{closedListSize}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legend & Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Active Heuristic</p>
            <p className="text-base font-semibold">{getHeuristicName()}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 border-2 border-red-700 rounded"></div>
              <span>Source</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 border-2 border-green-700 rounded"></div>
              <span>Goal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 border-2 border-gray-900 rounded"></div>
              <span>Obstacle</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-300 border-2 border-blue-500 rounded"></div>
              <span>Open List</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-400 border-2 border-purple-600 rounded"></div>
              <span>Closed List</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 border-2 border-yellow-600 rounded"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-400 border-2 border-orange-600 rounded"></div>
              <span>Path</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
