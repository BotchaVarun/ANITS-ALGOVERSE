import React, { useState, useRef, useEffect } from 'react';
import './quick.css'; // Define your CSS for colors, pointers, swap flashes, etc.

const initialArray = [7, 2, 8, 1, 5, 3, 6];

const QuickSortVisualizer = () => {
  const [array, setArray] = useState([...initialArray]);
  const [activeRange, setActiveRange] = useState([0, array.length - 1]);
  const [pivotIndex, setPivotIndex] = useState(null);
  const [pIndex, setPIndex] = useState(null);
  const [iPointer, setIPointer] = useState(null);
  const [swapIndices, setSwapIndices] = useState([]);
  const [locked, setLocked] = useState([]);
  const [label, setLabel] = useState('Initial Array');
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutRef = useRef([]);

  const reset = () => {
    timeoutRef.current.forEach(clearTimeout);
    timeoutRef.current = [];
    setArray([...initialArray]);
    setActiveRange([0, initialArray.length - 1]);
    setPivotIndex(null);
    setPIndex(null);
    setIPointer(null);
    setSwapIndices([]);
    setLocked([]);
    setLabel('Initial Array');
    setIsPlaying(false);
  };

  const sleep = ms =>
    new Promise(resolve => {
      const id = setTimeout(resolve, ms);
      timeoutRef.current.push(id);
    });

  const animateSwap = async (arr, idx1, idx2) => {
    setSwapIndices([idx1, idx2]);
    await sleep(500);
    [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
    setArray([...arr]);
    setSwapIndices([]);
  };

  const partition = async (arr, low, high) => {
    const pivot = arr[high];
    setPivotIndex(high);
    setLabel(`Partitioning array [${low}...${high}] - Pivot is ${pivot}`);
    let p_idx = low;
    setPIndex(p_idx);

    for (let j = low; j < high; j++) {
      setIPointer(j);
      await sleep(500);
      if (arr[j] < pivot) {
        await animateSwap(arr, j, p_idx);
        p_idx++;
        setPIndex(p_idx);
      }
    }
    await animateSwap(arr, p_idx, high);
    setLocked(prev => [...prev, p_idx]);
    setPivotIndex(null);
    setIPointer(null);
    setPIndex(null);
    return p_idx;
  };

  const quickSort = async (arr, low, high) => {
    if (low < high) {
      setActiveRange([low, high]);
      const pi = await partition(arr, low, high);

      setLabel(`Sorting left sub-array [${low}...${pi - 1}]`);
      await quickSort(arr, low, pi - 1);

      setLabel(`Sorting right sub-array [${pi + 1}...${high}]`);
      await quickSort(arr, pi + 1, high);
    } else if (low === high) {
      setLocked(prev => [...prev, low]);
    }
  };

  const startAnimation = async () => {
    setIsPlaying(true);
    const arrCopy = [...array];
    await quickSort(arrCopy, 0, arrCopy.length - 1);
    setLabel('Sorted!');
    setActiveRange([0, array.length - 1]);
    setIsPlaying(false);
  };

  return (
    <div className="quick-sort-visualizer">
      <div className="controls flex gap-4 mb-4">
        <button onClick={() => isPlaying ? setIsPlaying(false) : startAnimation()} className="px-4 py-2 bg-green-500 text-white rounded">
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={reset} className="px-4 py-2 bg-red-500 text-white rounded">Reset</button>
      </div>

      <div className="label mb-4 text-white font-semibold">{label}</div>

      <div className="array-container flex justify-center gap-2">
        {array.map((value, index) => {
          const isActive = index >= activeRange[0] && index <= activeRange[1];
          const isPivot = pivotIndex === index;
          const isPIndex = pIndex === index;
          const isIPointer = iPointer === index;
          const isSwapping = swapIndices.includes(index);
          const isLocked = locked.includes(index);

          return (
            <div key={index} className="array-element relative flex flex-col items-center">
              <div
                className={`element-value px-4 py-4 rounded-lg text-white font-bold transition-all
                  ${isLocked ? 'bg-blue-500' : ''}
                  ${isPivot ? 'bg-purple-500' : ''}
                  ${isActive && !isPivot && !isLocked ? 'bg-gray-600' : ''}
                  ${isSwapping ? 'bg-yellow-400 scale-110' : ''}
                `}
              >
                {value}
              </div>

              <div className="pointers flex gap-1 mt-1">
                {isPIndex && <div className="pointer text-xs text-yellow-400">p</div>}
                {isIPointer && <div className="pointer text-xs text-red-400">i</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickSortVisualizer;
