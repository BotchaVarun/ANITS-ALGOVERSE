import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import './insertion.css';

const InsertionSortVisualizer = forwardRef(({
  userInput = '',
  isPlaying,
  playbackSpeed,
  onPlayingChange,
  onAnimationComplete,
  className = '',
}, ref) => {
  const [array, setArray] = useState([]);
  const [highlight, setHighlight] = useState([]);
  const [sortedIndex, setSortedIndex] = useState([]);
  const [currentPass, setCurrentPass] = useState('');
  const [heldKey, setHeldKey] = useState(null);
  const [holeIndex, setHoleIndex] = useState(null);

  const originalArrayRef = useRef([]);
  const stepRef = useRef({ i: 1, j: 0, key: null, phase: 'start' });
  const intervalRef = useRef(null);

  // 🔑 helper to send data to PseudoCodePanel
  const pushStepData = (codeLineIndex, action, vars = {}) => {
    window.getCurrentStepData = () => ({
      step: { codeLineIndex, action },
      variables: vars,
    });
  };

  const resetState = () => {
    clearInterval(intervalRef.current);
    stepRef.current = { i: 1, j: 0, key: null, phase: 'start' };
    setArray([...originalArrayRef.current]);
    setHighlight([]);
    setSortedIndex([0]);
    setHeldKey(null);
    setHoleIndex(null);
    setCurrentPass('Initial Array');
    onPlayingChange(false);
  };

  useImperativeHandle(ref, () => ({
    reset: resetState,
  }));

  const initializeArray = () => {
    let values;
    if (userInput) {
      values = userInput
        .split(',')
        .map(v => parseInt(v.trim(), 10))
        .filter(v => !isNaN(v))
        .slice(0, 7);
    } else {
      // generate random array of length 5–7
      const len = Math.floor(Math.random() * 3) + 5;
      values = Array.from({ length: len }, () => Math.floor(Math.random() * 100));
    }

    originalArrayRef.current = [...values];
    setArray([...values]);
    setHighlight([]);
    setSortedIndex([0]);
    stepRef.current = { i: 1, j: 0, key: null, phase: 'start' };
    setHeldKey(null);
    setHoleIndex(null);
    setCurrentPass('Initial Array');
    onPlayingChange(false);

    // push initial step
    pushStepData(1, 'function_start', { arr: `[${values}]` });
  };

  useEffect(() => {
    initializeArray();
  }, []);

  useEffect(() => {
    if (userInput) initializeArray();
  }, [userInput]);

  useEffect(() => {
    if (!isPlaying || array.length === 0) return;

    let arr = [...array];
    let { i, j, key, phase } = stepRef.current;

    intervalRef.current = setInterval(() => {
      if (i >= arr.length) {
        setSortedIndex([...Array(arr.length).keys()]);
        setHighlight([]);
        setHeldKey(null);
        setHoleIndex(null);
        setCurrentPass('Array Sorted!');
        clearInterval(intervalRef.current);
        onPlayingChange(false);
        onAnimationComplete();

        pushStepData(12, 'function_end', { arr: `[${arr}]` });
        return;
      }

      if (phase === 'start') {
        key = arr[i];
        j = i - 1;
        setHeldKey(key);
        setHoleIndex(i);
        setCurrentPass(`Pass ${i}: Insert ${key}`);
        phase = 'compare';

        pushStepData(4, 'init_key', { i, j, key, arr: `[${arr}]` });

      } else if (phase === 'compare') {
        if (j >= 0 && arr[j] > key) {
          setHighlight([j]);
          phase = 'shift';

          pushStepData(6, 'compare', { i, j, key, arr: `[${arr}]` });
        } else {
          phase = 'insert';

          pushStepData(9, 'end_while', { i, j, key, arr: `[${arr}]` });
        }

      } else if (phase === 'shift') {
        arr[j + 1] = arr[j];
        setArray([...arr]);
        setHoleIndex(j);
        j--;
        phase = 'compare';

        pushStepData(7, 'shift', { i, j, key, arr: `[${arr}]` });

      } else if (phase === 'insert') {
        arr[j + 1] = key;
        setArray([...arr]);
        setHighlight([]);
        setHeldKey(null);
        setHoleIndex(null);
        setSortedIndex(prev => [...new Set([...prev, i])]);
        i++;
        phase = 'start';

        pushStepData(10, 'insert', { i, j, key, arr: `[${arr}]` });
      }

      stepRef.current = { i, j, key, phase };
    }, 1000 / playbackSpeed);

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, playbackSpeed, array]);

  return (
    <div className={`visualizer mt-12 ${className}`}>
      <div className="text-center text-lg font-semibold text-white mb-6">
        {currentPass}
      </div>

      <div className="array-container flex justify-center gap-4">
        {array.map((value, index) => {
          const isSorted = sortedIndex.includes(index);
          const isCompared = highlight.includes(index);
          const isHole = holeIndex === index;

          return (
            <div className="array-element relative" key={index}>
              <div
                className={`element-value transition-all duration-500 ease-in-out
                  ${isHole ? 'bg-transparent border-2 border-dashed border-gray-400' : ''}
                  ${isSorted && !isHole ? 'bg-blue-500 text-white' : ''}
                  ${!isSorted && !isHole ? 'bg-gray-600 text-white' : ''}
                  ${isCompared ? 'ring-4 ring-orange-400' : ''}
                `}
              >
                {!isHole ? value : ''}
              </div>
              <div className="element-index text-gray-300 text-xs mt-2">{index}</div>
            </div>
          );
        })}
      </div>

      {heldKey !== null && holeIndex !== null && (
        <div className="flex justify-center mt-6">
          <div className="element-value bg-yellow-400 text-black shadow-lg px-4 py-2 rounded-md">
            {heldKey}
          </div>
        </div>
      )}
    </div>
  );
});

export default InsertionSortVisualizer;
