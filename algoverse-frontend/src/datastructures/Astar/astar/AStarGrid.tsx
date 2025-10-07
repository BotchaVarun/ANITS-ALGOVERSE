import { GridNode } from '@/types/astar';
import { cn } from '@/lib/utils';

interface AStarGridProps {
  grid: GridNode[][];
  currentNode: GridNode | null;
  path: GridNode[];
  onCellClick: (x: number, y: number) => void;
  onCellDrag: (x: number, y: number) => void;
  isDrawing: boolean;
}

export const AStarGrid = ({ 
  grid, 
  currentNode, 
  path,
  onCellClick, 
  onCellDrag,
  isDrawing 
}: AStarGridProps) => {
  const getCellClasses = (node: GridNode) => {
    const isInPath = path.some(p => p.x === node.x && p.y === node.y);
    const isCurrent = currentNode?.x === node.x && currentNode?.y === node.y;

    if (isCurrent) return 'bg-yellow-400 border-yellow-600';
    if (isInPath && node.type !== 'source' && node.type !== 'goal') {
      return 'bg-orange-400 border-orange-600';
    }
    
    switch (node.type) {
      case 'source':
        return 'bg-red-500 border-red-700';
      case 'goal':
        return 'bg-green-500 border-green-700';
      case 'obstacle':
        return 'bg-gray-800 border-gray-900';
      default:
        if (node.inClosedList) return 'bg-purple-400 border-purple-600';
        if (node.inOpenList) return 'bg-blue-300 border-blue-500';
        return 'bg-white border-gray-300 hover:bg-gray-100';
    }
  };

  const handleMouseDown = (x: number, y: number) => {
    onCellClick(x, y);
  };

  const handleMouseEnter = (x: number, y: number) => {
    if (isDrawing) {
      onCellDrag(x, y);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 p-8">
      <div className="inline-grid gap-0.5 bg-gray-200 p-1 rounded-lg shadow-lg">
        {grid.map((row, y) => (
          <div key={y} className="flex gap-0.5">
            {row.map((node, x) => (
              <div
                key={`${x}-${y}`}
                className={cn(
                  'w-8 h-8 border-2 transition-all duration-200 cursor-pointer relative group',
                  getCellClasses(node)
                )}
                onMouseDown={() => handleMouseDown(x, y)}
                onMouseEnter={() => handleMouseEnter(x, y)}
              >
                {node.inOpenList && node.f !== Infinity && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-gray-800">
                      {node.f.toFixed(0)}
                    </span>
                  </div>
                )}
                <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs p-1 rounded -top-16 left-1/2 transform -translate-x-1/2 z-50 whitespace-nowrap">
                  ({node.x}, {node.y})
                  {node.f !== Infinity && (
                    <>
                      <br />g: {node.g.toFixed(1)} h: {node.h.toFixed(1)}
                      <br />f: {node.f.toFixed(1)}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
