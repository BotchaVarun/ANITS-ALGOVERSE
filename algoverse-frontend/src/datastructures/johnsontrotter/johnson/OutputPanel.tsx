import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface OutputPanelProps {
  statusText: string;
  permutations: number[][];
  currentPermutationIndex: number;
}

export const OutputPanel = ({
  statusText,
  permutations,
  currentPermutationIndex,
}: OutputPanelProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Box */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4 text-primary">
          Current Action
        </h3>
        <div className="p-4 bg-muted rounded-lg min-h-[100px] flex items-center">
          <p className="text-foreground text-base leading-relaxed">
            {statusText}
          </p>
        </div>
      </Card>

      {/* Permutations List */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4 text-primary">
          Generated Permutations
        </h3>
        <ScrollArea className="h-[140px] rounded-lg border bg-muted/30 p-4">
          <div className="space-y-2">
            {permutations.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No permutations generated yet...
              </p>
            ) : (
              permutations.map((perm, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 transition-all"
                >
                  <Badge
                    variant={index === currentPermutationIndex ? 'default' : 'secondary'}
                    className="w-8 text-center"
                  >
                    {index + 1}
                  </Badge>
                  <span
                    className={`font-mono text-lg ${
                      index === currentPermutationIndex
                        ? 'text-primary font-bold'
                        : 'text-foreground'
                    }`}
                  >
                    {perm.join('')}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};
