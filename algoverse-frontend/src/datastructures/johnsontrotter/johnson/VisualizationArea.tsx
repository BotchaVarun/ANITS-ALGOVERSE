import { AlgorithmStep } from '@/types/algorithm';
import { NumberBlock } from './NumberBlock';

interface VisualizationAreaProps {
  step: AlgorithmStep;
}

export const VisualizationArea = ({ step }: VisualizationAreaProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-12 py-12 min-h-[400px]">
      {/* Dynamic Contextual Caption */}
      <div className="text-center min-h-[60px] flex items-center">
        <p className="text-xl font-medium text-foreground transition-all duration-300">
          {step.action}
        </p>
      </div>

      {/* Number Blocks - The Main Stage */}
      <div className="flex items-center gap-8">
        {step.permutation.map((number, index) => (
          <NumberBlock
            key={`${number.value}-${index}`}
            number={number}
            isMobile={step.mobileIndices.includes(index)}
            isLargest={step.largestMobileIndex === index}
            isSwapping={step.state === 'swapping' && step.largestMobileIndex === index}
            state={step.state}
          />
        ))}
      </div>
    </div>
  );
};
