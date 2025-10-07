import { NumberState } from '@/types/algorithm';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumberBlockProps {
  number: NumberState;
  isMobile?: boolean;
  isLargest?: boolean;
  isSwapping?: boolean;
  state: 'idle' | 'scanning' | 'found-mobile' | 'swapping' | 'reversing' | 'complete';
}

export const NumberBlock = ({
  number,
  isMobile = false,
  isLargest = false,
  isSwapping = false,
  state,
}: NumberBlockProps) => {
  const getBackgroundClass = () => {
if (isLargest) return 'bg-sky-500 shadow-sky-glow';
if (isMobile) return 'bg-teal-500';
if (isSwapping) return 'bg-indigo-500';
    return 'bg-card';
  };

  const getTextClass = () => {
    if (isLargest || isMobile || isSwapping) return 'text-white';
    return 'text-foreground';
  };

  return (
    <div className="flex flex-col items-center gap-4 transition-all duration-500">
      {/* Direction Arrow - Top */}
      <div
        className={cn(
          'transition-all duration-500',
          state === 'reversing' && (isLargest || isMobile) && 'animate-spin'
        )}
      >
        {number.direction === -1 ? (
          <ChevronLeft
            className={cn(
              'h-10 w-10 transition-all duration-300',
              isLargest ? 'text-algo-largest' : isMobile ? 'text-algo-scanning' : 'text-muted-foreground'
            )}
          />
        ) : (
          <ChevronRight
            className={cn(
              'h-10 w-10 transition-all duration-300',
              isLargest ? 'text-algo-largest' : isMobile ? 'text-algo-scanning' : 'text-muted-foreground'
            )}
          />
        )}
      </div>

      {/* Number Block */}
      <div
        className={cn(
          'relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 font-bold text-4xl transition-all duration-500',
          getBackgroundClass(),
          getTextClass(),
          isLargest && 'scale-125 border-algo-largest shadow-glow',
          isMobile && !isLargest && 'border-algo-scanning animate-pulse-glow',
          isSwapping && 'scale-110',
          state === 'scanning' && isMobile && 'animate-pulse-glow'
        )}
      >
        {number.value}
        
        {/* Glow effect for largest mobile */}
        {isLargest && (
          <div className="absolute inset-0 rounded-2xl bg-algo-largest opacity-30 blur-2xl animate-pulse" />
        )}
      </div>
    </div>
  );
};
