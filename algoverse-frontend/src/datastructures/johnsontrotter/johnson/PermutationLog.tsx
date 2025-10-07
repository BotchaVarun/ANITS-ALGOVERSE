import { cn } from '@/lib/utils';

interface PermutationLogProps {
  permutations: number[][];
  currentPermutationIndex: number;
}

export const PermutationLog = ({
  permutations,
  currentPermutationIndex,
}: PermutationLogProps) => {
  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <h3 className="text-lg font-semibold mb-4 text-center text-muted-foreground">
        Generated Permutations
      </h3>
      <div className="flex flex-wrap justify-center gap-3">
        {permutations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No permutations generated yet...
          </p>
        ) : (
          permutations.map((perm, index) => (
            <div
              key={index}
              className={cn(
                'px-4 py-2 rounded-lg font-mono text-lg transition-all duration-300',
                index === currentPermutationIndex
                  ? 'bg-primary text-primary-foreground scale-110 shadow-glow'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {perm.join('')}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
