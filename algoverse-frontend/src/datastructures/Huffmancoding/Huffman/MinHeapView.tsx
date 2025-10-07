import { HeapItem } from 'src/types/huffman';

interface MinHeapViewProps {
  heap: HeapItem[];
}

export const MinHeapView = ({ heap }: MinHeapViewProps) => {
  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border shadow-sm h-full">
      <h2 className="text-lg font-semibold">Min-Heap (Priority Queue)</h2>
      
      {heap.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          Heap is empty
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {heap.map((item, index) => (
            <div
              key={item.node.id}
              className={`
                relative flex flex-col items-center justify-center
                w-20 h-20 rounded-lg border-2 
                transition-all duration-500 ease-in-out
                ${item.isExtracting 
                  ? 'border-destructive bg-destructive/10 scale-95 opacity-70' 
                  : item.isInserting
                  ? 'border-primary bg-primary/10 scale-110 animate-pulse'
                  : 'border-border bg-background hover:border-primary/50'
                }
              `}
            >
              <div className="text-lg font-bold">
                {item.node.char || '•'}
              </div>
              <div className="text-xs text-muted-foreground">
                {item.node.frequency}
              </div>
              <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-muted text-xs flex items-center justify-center">
                {index}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
