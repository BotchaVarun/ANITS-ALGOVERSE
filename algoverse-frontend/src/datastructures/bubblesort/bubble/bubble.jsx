// BubbleSortVisualizer.jsx
import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./bubble.css";

const BubbleSortVisualizer = forwardRef(
  (
    {
      userInput = "",
      isPlaying,
      playbackSpeed = 1,
      onPlayingChange = () => {},
      onAnimationComplete = () => {},
      className = "",
    },
    ref
  ) => {
    const [array, setArray] = useState([]);
    const [label, setLabel] = useState("Initial Array");
    const [highlight, setHighlight] = useState([]);
    const [activePass, setActivePass] = useState(null);
    const [previousPass, setPreviousPass] = useState(null);

    const arrayRef = useRef([]);
    const iRef = useRef(0);
    const jRef = useRef(0);
    const swappedRef = useRef(false);
    const tickingRef = useRef(false);
    const timersRef = useRef([]);
    const keyRef = useRef(0);

    useEffect(() => {
      arrayRef.current = array;
    }, [array]);

    const clearAllTimers = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };

    const getInitialValues = (input) => {
      const values = input
        ? input
            .split(",")
            .map((v) => parseInt(v.trim(), 10))
            .filter((v) => !isNaN(v))
            .slice(0, 7)
        : Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));
      return values;
    };

    const initializeArray = () => {
      clearAllTimers();
      const values = getInitialValues(userInput);
      arrayRef.current = values;
      iRef.current = 0;
      jRef.current = 0;
      swappedRef.current = false;
      tickingRef.current = false;
      setHighlight([]);
      setArray(values);
      setLabel("Initial Array");
      setPreviousPass(null);
      setActivePass({ key: keyRef.current++, label: "Initial Array", array: values });
      onPlayingChange(false);

      sendStepData("function_start", 0);
    };

    const resetState = () => {
      initializeArray();
    };

    useImperativeHandle(ref, () => ({
      reset: resetState,
    }));

    useEffect(() => {
      initializeArray();
    }, []);

    useEffect(() => {
      if (userInput) initializeArray();
    }, [userInput]);

    /** 🔹 Send step data to pseudocode panel */
    const sendStepData = (action, codeLineIndex) => {
      window.getCurrentStepData = () => ({
        variables: {
          i: iRef.current,
          j: jRef.current,
          "arr[j]": arrayRef.current[jRef.current],
          "arr[j+1]": arrayRef.current[jRef.current + 1],
          n: arrayRef.current.length,
        },
        step: {
          action,
          codeLineIndex,
        },
      });
    };

    const stepBubble = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      const speedUnit = Math.max(0.1, Number(playbackSpeed));
      const T_COMPARE = 800 / speedUnit;
      const T_SWAP = 800 / speedUnit;
      const T_SETTLE = 600 / speedUnit;
      const T_PASS_TRANSITION = 1500 / speedUnit;

      const arr = [...arrayRef.current];
      const n = arr.length;
      let i = iRef.current;
      let j = jRef.current;
      let swapped = swappedRef.current;

      if (i >= n - 1) {
        setLabel("Sorted");
        swapInNewPassContainer("Sorted", arr, T_PASS_TRANSITION);
        onPlayingChange(false);
        tickingRef.current = false;
        onAnimationComplete();
        sendStepData("sorted_done", -1);
        return;
      }

      if (j >= n - i - 1) {
        const nextLabel = swapped ? `Pass ${i + 1}` : "Sorted";
        setLabel(nextLabel);
        swapInNewPassContainer(nextLabel, arr, T_PASS_TRANSITION, () => {
          if (!swapped) {
            onPlayingChange(false);
            onAnimationComplete();
            tickingRef.current = false;
            sendStepData("sorted_done", -1);
            return;
          }
          iRef.current = i + 1;
          jRef.current = 0;
          swappedRef.current = false;
          tickingRef.current = false;
          if (isPlaying) scheduleNextStep(0);
        });
        return;
      }

      // --- Step 1: Compare ---
      setHighlight([j, j + 1, "compare"]);
      sendStepData("compare", 2); // line 4 pseudocode

      const t1 = setTimeout(() => {
        if (arr[j] > arr[j + 1]) {
          // --- Step 2: Swap ---
          setHighlight([j, j + 1, "swap"]);
          sendStepData("swap", 3); // line 5 pseudocode
          const t2 = setTimeout(() => {
            const newArr = [...arrayRef.current];
            [newArr[j], newArr[j + 1]] = [newArr[j + 1], newArr[j]];
            swappedRef.current = true;
            arrayRef.current = newArr;
            setArray(newArr);
            setActivePass((prev) => (prev ? { ...prev, array: newArr } : prev));

            const t3 = setTimeout(() => {
              setHighlight([]);
              jRef.current = j + 1;
              tickingRef.current = false;
              if (isPlaying) scheduleNextStep(0);
            }, T_SETTLE);
            timersRef.current.push(t3);
          }, T_SWAP);
          timersRef.current.push(t2);
        } else {
          // --- No Swap ---
          const tNoSwap = setTimeout(() => {
            setHighlight([]);
            jRef.current = j + 1;
            tickingRef.current = false;
            if (isPlaying) scheduleNextStep(0);
          }, T_SETTLE);
          timersRef.current.push(tNoSwap);
        }
      }, T_COMPARE);
      timersRef.current.push(t1);
    };

    const scheduleNextStep = (delay = 0) => {
      const t = setTimeout(() => {
        stepBubble();
      }, delay);
      timersRef.current.push(t);
    };

    useEffect(() => {
      if (isPlaying) {
        onPlayingChange(true);
        if (!tickingRef.current) scheduleNextStep(0);
      }
    }, [isPlaying, playbackSpeed]);

    const swapInNewPassContainer = (newLabel, arrSnapshot, transitionMs, after = () => {}) => {
      setPreviousPass(activePass);
      const incoming = {
        key: keyRef.current++,
        label: newLabel,
        array: [...arrSnapshot],
        incoming: true,
      };
      setActivePass(incoming);

      const t = setTimeout(() => {
        setPreviousPass(null);
        setActivePass((curr) =>
          curr ? { ...curr, incoming: false } : curr
        );
        after();
      }, transitionMs);
      timersRef.current.push(t);
    };
useEffect(() => {
  if (!isPlaying) {
    clearAllTimers();
    tickingRef.current = false;
  }
}, [isPlaying]);

    return (
      <div className={`visualizer-wrapper ${className}`}>
        {/* Legend */}
        <div className="legend">
          <div className="legend-item">
            <div className="dot compare" />
            <span>Comparing</span>
          </div>
          <div className="legend-item">
            <div className="dot swap" />
            <span>Swap</span>
          </div>
        </div>

        {/* Pass containers */}
        <div className="pass-stage">
          {previousPass && (
            <div className="pass-container outgoing" key={`prev-${previousPass.key}`}>
              <div className="pass-label">{previousPass.label}</div>
              <div className="array-row">
                {previousPass.array.map((v, idx) => (
                  <div className="array-block" key={idx}>
                    {v}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePass && (
            <div
              className={`pass-container ${activePass.incoming ? "incoming" : "centered"}`}
              key={`active-${activePass.key}`}
            >
              <div className="pass-label">{activePass.label}</div>
              <div className="array-row">
                {activePass.array.map((v, idx) => {
                  const isCurrent = !activePass.incoming && !previousPass;
                  const isComparing =
                    isCurrent && (highlight[0] === idx || highlight[1] === idx);
                  const phase = isComparing ? highlight[2] : null;

                  return (
                    <div
                      key={idx}
                      className={`array-block ${
                        phase === "swap"
                          ? "swap"
                          : phase === "compare"
                          ? "compare"
                          : ""
                      }`}
                    >
                      {v}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        
      </div>
    );
  }
);

export default BubbleSortVisualizer;
