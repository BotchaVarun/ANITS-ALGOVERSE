import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';

const quickSortCode = [
  { lineNumber: 1, code: "void quickSort(int arr[], int low, int high) {", action: "function_start" },
  { lineNumber: 2, code: "  if (low < high) {", action: "check_bounds" },
  { lineNumber: 3, code: "    int pi = partition(arr, low, high);", action: "partition_call" },
  { lineNumber: 4, code: "    quickSort(arr, low, pi - 1);", action: "recurse_left" },
  { lineNumber: 5, code: "    quickSort(arr, pi + 1, high);", action: "recurse_right" },
  { lineNumber: 6, code: "  }", action: "end_if" },
  { lineNumber: 7, code: "}", action: "function_end" },
  { lineNumber: 8, code: "int partition(int arr[], int low, int high) {", action: "partition_start" },
  { lineNumber: 9, code: "  int pivot = arr[high];", action: "select_pivot" },
  { lineNumber: 10, code: "  int i = (low - 1);", action: "init_i" },
  { lineNumber: 11, code: "  for (int j = low; j <= high - 1; j++) {", action: "loop_j" },
  { lineNumber: 12, code: "    if (arr[j] < pivot) {", action: "compare" },
  { lineNumber: 13, code: "      i++;", action: "inc_i" },
  { lineNumber: 14, code: "      swap(arr[i], arr[j]);", action: "swap_i_j" },
  { lineNumber: 15, code: "    }", action: "end_if" },
  { lineNumber: 16, code: "  }", action: "end_loop" },
  { lineNumber: 17, code: "  swap(arr[i + 1], arr[high]);", action: "swap_with_pivot" },
  { lineNumber: 18, code: "  return (i + 1);", action: "return_pi" },
  { lineNumber: 19, code: "}", action: "partition_end" }
];

const QuickSortVisualizer = forwardRef(
  ({ userInput = '', isPlaying, playbackSpeed = 1, onPlayingChange = () => {}, onAnimationComplete = () => {}, className = '' }, ref) => {
    const [array, setArray] = useState([]);
    const [highlight, setHighlight] = useState([]);
    const [pivotIndex, setPivotIndex] = useState(null);
    const [sorted, setSorted] = useState([]);
    const [swapping, setSwapping] = useState([]);
    const [currentStepData, setCurrentStepData] = useState(null);
    const [passHistory, setPassHistory] = useState([]);
    const [currentPass, setCurrentPass] = useState(0);
    const [partitionRange, setPartitionRange] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [isPaused, setIsPaused] = useState(false);
    const [iPointer, setIPointer] = useState(null);

    const originalArrayRef = useRef([]);
    const timeoutIdsRef = useRef([]);
    const cancelFnsRef = useRef([]);
    const cancelledRef = useRef(false);
    const pausedRef = useRef(false);
    const pauseResolveRef = useRef(null);

    const resetState = () => {
      cancelledRef.current = true;
      pausedRef.current = false;
      
      if (pauseResolveRef.current) {
        pauseResolveRef.current();
        pauseResolveRef.current = null;
      }
      
      cancelFnsRef.current.forEach((fn) => {
        try { fn(); } catch (e) {}
      });
      timeoutIdsRef.current.forEach((id) => clearTimeout(id));
      cancelFnsRef.current = [];
      timeoutIdsRef.current = [];
      setHighlight([]);
      setPivotIndex(null);
      setSorted([]);
      setSwapping([]);
      setCurrentStepData(null);
      setPassHistory([]);
      setCurrentPass(0);
      setPartitionRange(null);
      setStatusMessage('');
      setIsPaused(false);
      setIPointer(null);
      setArray([...originalArrayRef.current]);
      onPlayingChange(false);
    };

    useImperativeHandle(ref, () => ({
      reset: resetState,
    }));

    const initializeArray = () => {
      resetState();
      const values = userInput && userInput.trim()
        ? userInput
            .split(',')
            .map((v) => parseInt(v.trim(), 10))
            .filter((v) => !isNaN(v) && v >= 0)
            .slice(0, 10)
        : Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));

      const finalValues = values.length > 0 ? values : [50];
      
      originalArrayRef.current = [...finalValues];
      setArray([...finalValues]);
    };

    useEffect(() => { initializeArray(); }, []);
    useEffect(() => { 
      if (userInput !== undefined && userInput !== null) {
        initializeArray(); 
      }
    }, [userInput]);

    const updateStepByAction = (action, variables = {}) => {
      const codeLineIndex = quickSortCode.findIndex(line => line.action === action);
      if (codeLineIndex !== -1) {
        const stepData = { codeLineIndex, action, variables };
        setCurrentStepData(stepData);
        window.getCurrentStepData = () => ({ step: stepData, variables });
      }
    };

    const addPass = (description, arr, highlights = {}) => {
      setPassHistory((prev) => [
        ...prev,
        {
          passNumber: prev.length + 1,
          description,
          array: [...arr],
          ...highlights,
        },
      ]);
      setCurrentPass((prev) => prev + 1);
    };

    const sleep = (ms) => {
      let timeoutId;
      let resolveFn;
      const p = new Promise((resolve) => {
        resolveFn = resolve;
        timeoutId = setTimeout(() => {
          timeoutIdsRef.current = timeoutIdsRef.current.filter(id => id !== timeoutId);
          cancelFnsRef.current = cancelFnsRef.current.filter(fn => fn !== cancel);
          resolve();
        }, ms);
        timeoutIdsRef.current.push(timeoutId);
      });

      const cancel = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutIdsRef.current = timeoutIdsRef.current.filter(id => id !== timeoutId);
        cancelFnsRef.current = cancelFnsRef.current.filter(fn => fn !== cancel);
        if (resolveFn) resolveFn();
      };

      cancelFnsRef.current.push(cancel);
      return p;
    };

    const checkPause = async () => {
      if (pausedRef.current) {
        await new Promise((resolve) => {
          pauseResolveRef.current = resolve;
        });
        pauseResolveRef.current = null;
      }
    };

    useEffect(() => {
      if (isPlaying) {
        pausedRef.current = false;
        setIsPaused(false);
        if (pauseResolveRef.current) {
          pauseResolveRef.current();
          pauseResolveRef.current = null;
        }
      } else {
        pausedRef.current = true;
        setIsPaused(true);
      }
    }, [isPlaying]);

    useEffect(() => {
      if (!isPlaying || array.length === 0) return;
      if (pausedRef.current) return;

      const swap = (arr, i, j) => {
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      };

      const partition = async (arr, low, high) => {
        if (cancelledRef.current) throw new Error('cancelled');
        await checkPause();
        
        updateStepByAction('partition_start', { low, high });
        setPartitionRange({ low, high });
        setStatusMessage(`STEP 2: PARTITION - Rearranging array [${low}..${high}]`);
        addPass(`PARTITION: Working on range [${low}..${high}]`, arr, { partitionRange: { low, high } });
        await sleep(1500 / playbackSpeed);
        if (cancelledRef.current) throw new Error('cancelled');
        await checkPause();

        // STEP 1: Choose Pivot (last element)
        const pivot = arr[high];
        setPivotIndex(high);
        setStatusMessage(`STEP 1: CHOOSE PIVOT - Selected arr[${high}] = ${pivot} as pivot (last element)`);
        updateStepByAction('select_pivot', { low, high, pivot });
        addPass(`CHOOSE PIVOT: arr[${high}] = ${pivot}`, arr, { pivot: high });
        await sleep(1500 / playbackSpeed);
        if (cancelledRef.current) throw new Error('cancelled');
        await checkPause();

        // Initialize partition index i
        let i = low - 1;
        setIPointer(i);
        setStatusMessage(`Initialize i = ${i} (partition boundary for smaller elements)`);
        updateStepByAction('init_i', { i, low });
        await sleep(1200 / playbackSpeed);
        if (cancelledRef.current) throw new Error('cancelled');
        await checkPause();

        // Partition loop - rearrange elements
        for (let j = low; j <= high - 1; j++) {
          if (cancelledRef.current) throw new Error('cancelled');
          await checkPause();
          
          setHighlight([j]);
          setStatusMessage(`COMPARE: Is arr[${j}] = ${arr[j]} < pivot (${pivot})?`);
          updateStepByAction('compare', { j, arr_j: arr[j], pivot, i });
          addPass(`Compare: arr[${j}] = ${arr[j]} with pivot ${pivot}`, arr, { 
            comparing: j, 
            pivot: high,
            i: i 
          });
          await sleep(1500 / playbackSpeed);
          if (cancelledRef.current) throw new Error('cancelled');
          await checkPause();

          if (arr[j] < pivot) {
            // Element is smaller than pivot, move it to left partition
            i++;
            setIPointer(i);
            setStatusMessage(`YES! ${arr[j]} < ${pivot}. Increment i to ${i}, then swap arr[${i}] ↔ arr[${j}]`);
            updateStepByAction('inc_i', { i, j });
            await sleep(1000 / playbackSpeed);
            if (cancelledRef.current) throw new Error('cancelled');
            await checkPause();

            if (i !== j) {
              swap(arr, i, j);
              setSwapping([i, j]);
              setArray([...arr]);
              updateStepByAction('swap_i_j', {
                i, j,
                [`arr[${i}]`]: arr[i],
                [`arr[${j}]`]: arr[j],
                pivot
              });
              addPass(`SWAP: arr[${i}] (${arr[i]}) ↔ arr[${j}] (${arr[j]}) - Move smaller element left`, arr, { 
                swapped: [i, j],
                pivot: high,
                i: i 
              });
              await sleep(1500 / playbackSpeed);
              if (cancelledRef.current) throw new Error('cancelled');
              await checkPause();
              setSwapping([]);
            } else {
              addPass(`NO SWAP NEEDED: arr[${i}] already in correct position`, arr, { 
                pivot: high,
                i: i 
              });
              await sleep(800 / playbackSpeed);
              if (cancelledRef.current) throw new Error('cancelled');
              await checkPause();
            }
          } else {
            setStatusMessage(`NO. ${arr[j]} >= ${pivot}. Leave it on the right side, continue...`);
            await sleep(1000 / playbackSpeed);
            if (cancelledRef.current) throw new Error('cancelled');
            await checkPause();
          }
          setHighlight([]);
        }

        updateStepByAction('end_loop');
        setStatusMessage(`Partition loop complete. Now place pivot in its correct position.`);
        await sleep(1000 / playbackSpeed);
        if (cancelledRef.current) throw new Error('cancelled');
        await checkPause();

        // Place pivot in correct position
        const pivotPosition = i + 1;
        if (pivotPosition !== high) {
          swap(arr, pivotPosition, high);
          setSwapping([pivotPosition, high]);
          setArray([...arr]);
          updateStepByAction('swap_with_pivot', {
            i: pivotPosition,
            high,
            [`arr[${pivotPosition}]`]: arr[pivotPosition],
            [`arr[${high}]`]: arr[high],
          });
          addPass(`PLACE PIVOT: Swap arr[${pivotPosition}] ↔ arr[${high}] - Pivot ${arr[pivotPosition]} now at correct position ${pivotPosition}`, arr, { 
            swapped: [pivotPosition, high],
            pivotFinal: pivotPosition 
          });
          await sleep(1500 / playbackSpeed);
          if (cancelledRef.current) throw new Error('cancelled');
          await checkPause();
          setSwapping([]);
        } else {
          addPass(`PIVOT ALREADY IN PLACE: arr[${pivotPosition}] = ${arr[pivotPosition]} is at correct position`, arr, { 
            pivotFinal: pivotPosition 
          });
          await sleep(1000 / playbackSpeed);
        }
        
        setPivotIndex(null);
        setIPointer(null);

        // Mark pivot position as sorted
        setSorted((prev) => [...new Set([...prev, pivotPosition])]);
        setStatusMessage(`✓ Pivot ${arr[pivotPosition]} is now SORTED at position ${pivotPosition}. Left elements < ${arr[pivotPosition]}, Right elements > ${arr[pivotPosition]}`);
        updateStepByAction('return_pi', { pi: pivotPosition });
        addPass(`SORTED POSITION: arr[${pivotPosition}] = ${arr[pivotPosition]} is in final position`, arr, { 
          sorted: [pivotPosition] 
        });
        await sleep(1800 / playbackSpeed);
        if (cancelledRef.current) throw new Error('cancelled');
        await checkPause();
        
        setHighlight([]);
        setPartitionRange(null);
        return pivotPosition;
      };

      const quickSort = async (arr, low, high, depth = 0) => {
        if (cancelledRef.current) throw new Error('cancelled');
        await checkPause();

        // Base case: single element or invalid range
        if (low >= high) {
          if (low === high) {
            setSorted((prev) => [...new Set([...prev, low])]);
            setStatusMessage(`BASE CASE: Single element arr[${low}] = ${arr[low]} is already sorted`);
            updateStepByAction('check_bounds', { low, high, single: true });
            addPass(`BASE CASE: arr[${low}] = ${arr[low]} (single element is sorted)`, arr, { 
              sorted: [low] 
            });
            await sleep(1000 / playbackSpeed);
            if (cancelledRef.current) throw new Error('cancelled');
            await checkPause();
          }
          return;
        }

        // Recursive case: low < high
        updateStepByAction('check_bounds', { low, high });
        setStatusMessage(`DIVIDE: QuickSort called on subarray [${low}..${high}] (${high - low + 1} elements)`);
        addPass(`QUICKSORT: Processing range [${low}..${high}]`, arr, { partitionRange: { low, high } });
        await sleep(1200 / playbackSpeed);
        if (cancelledRef.current) throw new Error('cancelled');
        await checkPause();

        // STEP 2: Partition the array
        updateStepByAction('partition_call', { low, high });
        const pi = await partition(arr, low, high);
        
        setStatusMessage(`PARTITION COMPLETE: Pivot at index ${pi}. Now CONQUER by sorting left [${low}..${pi-1}] and right [${pi+1}..${high}] subarrays`);
        await sleep(1200 / playbackSpeed);
        if (cancelledRef.current) throw new Error('cancelled');
        await checkPause();

        // STEP 3: Recursively sort left subarray (elements smaller than pivot)
        if (low < pi - 1) {
          setStatusMessage(`STEP 3a: RECURSE LEFT - Sort elements smaller than pivot: [${low}..${pi - 1}]`);
          updateStepByAction('recurse_left', { low, high: pi - 1 });
          addPass(`RECURSE LEFT: QuickSort([${low}..${pi - 1}]) - Elements < ${arr[pi]}`, arr, { 
            partitionRange: { low, high: pi - 1 } 
          });
          await sleep(1200 / playbackSpeed);
          if (cancelledRef.current) throw new Error('cancelled');
          await checkPause();
          await quickSort(arr, low, pi - 1, depth + 1);
        }

        // STEP 3: Recursively sort right subarray (elements greater than pivot)
        if (pi + 1 < high) {
          setStatusMessage(`STEP 3b: RECURSE RIGHT - Sort elements greater than pivot: [${pi + 1}..${high}]`);
          updateStepByAction('recurse_right', { low: pi + 1, high });
          addPass(`RECURSE RIGHT: QuickSort([${pi + 1}..${high}]) - Elements > ${arr[pi]}`, arr, { 
            partitionRange: { low: pi + 1, high } 
          });
          await sleep(1200 / playbackSpeed);
          if (cancelledRef.current) throw new Error('cancelled');
          await checkPause();
          await quickSort(arr, pi + 1, high, depth + 1);
        }
      };

      const runSort = async () => {
        cancelledRef.current = false;
        const arrCopy = [...array];
        let wasCancelled = false;
        
        setStatusMessage('QUICKSORT ALGORITHM STARTING - Using Divide and Conquer approach');
        addPass('INITIAL ARRAY (Unsorted)', arrCopy);
        await sleep(1500 / playbackSpeed);
        
        try {
          await quickSort(arrCopy, 0, arrCopy.length - 1);
          setSorted([...Array(arrCopy.length).keys()]);
          setStatusMessage('✓ QUICKSORT COMPLETE! All elements are sorted in their final positions.');
          updateStepByAction('function_end');
          addPass('FINAL ARRAY (Fully Sorted)', arrCopy, { 
            sorted: [...Array(arrCopy.length).keys()] 
          });
        } catch (err) {
          if (err && err.message === 'cancelled') {
            wasCancelled = true;
          } else {
            console.error(err);
          }
        } finally {
          onPlayingChange(false);
          if (!wasCancelled) onAnimationComplete();
          cancelFnsRef.current.forEach(fn => { try { fn(); } catch (e) {} });
          cancelFnsRef.current = [];
          timeoutIdsRef.current.forEach(id => clearTimeout(id));
          timeoutIdsRef.current = [];
          setPivotIndex(null);
          setHighlight([]);
          setPartitionRange(null);
          setIPointer(null);
        }
      };

      runSort();

      return () => {
        timeoutIdsRef.current.forEach((id) => clearTimeout(id));
        timeoutIdsRef.current = [];
        cancelFnsRef.current.forEach((fn) => { try { fn(); } catch (e) {} });
        cancelFnsRef.current = [];
      };
    }, [isPlaying, playbackSpeed, array.length]);

    return (
      <div className="w-full">
        {/* Algorithm Steps Overview */}


        {/* Status Message */}
        <div className="mb-4 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg mx-4">
          <div className="text-sm font-semibold text-blue-300 mb-1">Current Step:</div>
          <div className="text-white">{statusMessage || 'Ready to start'}</div>
          {partitionRange && (
            <div className="text-xs text-blue-200 mt-2">
              Active Partition Range: [{partitionRange.low}..{partitionRange.high}]
              {iPointer !== null && ` | Partition Boundary (i): ${iPointer}`}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mb-4 p-3 bg-gray-800/40 mx-4 rounded-lg flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-gray-300">Pivot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-300">Comparing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-300">Swapping</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-300">Sorted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-300">Unsorted</span>
          </div>
        </div>

        {/* Current Array Visualization */}
        <div className={`mt-6 ${className}`}>
          <div className="flex items-center justify-center gap-3 px-4 flex-wrap">
            {array.map((value, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 h-16 transition-all duration-300 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg
                    ${pivotIndex === index ? 'bg-purple-500 ring-4 ring-purple-300' : ''}
                    ${highlight.includes(index) ? 'bg-yellow-500 ring-2 ring-yellow-300' : ''}
                    ${swapping.includes(index) ? 'bg-red-500 scale-110 ring-2 ring-red-300' : ''}
                    ${sorted.includes(index) ? 'bg-green-500' : ''}
                    ${!pivotIndex && !highlight.includes(index) && !swapping.includes(index) && !sorted.includes(index) ? 'bg-blue-500' : ''}
                  `}
                >
                  {value}
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  [{index}]
                  {pivotIndex === index && <div className="text-purple-400 font-bold">PIVOT</div>}
                  {iPointer === index && partitionRange && <div className="text-orange-400 font-bold">i</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pass History */}
        <div className="mt-8 mx-4">
          <div className="bg-gray-800/40 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3">
              Execution Steps ({passHistory.length} operations)
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {passHistory.map((pass, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-all ${
                    idx === passHistory.length - 1
                      ? 'bg-blue-900/30 border-blue-500/50'
                      : 'bg-gray-900/30 border-gray-700/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                    <span className="text-sm font-semibold text-blue-300">
                      Step {pass.passNumber}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      [{pass.array.join(', ')}]
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">{pass.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default QuickSortVisualizer;