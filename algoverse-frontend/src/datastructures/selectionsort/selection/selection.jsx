// SelectionSortVisualizer.jsx
import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./selection.css";

const SelectionSortVisualizer = forwardRef(
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
    const [highlight, setHighlight] = useState([]);
    const [activePass, setActivePass] = useState(null);
    const [previousPass, setPreviousPass] = useState(null);

    const arrayRef = useRef([]);
    const initialArrayRef = useRef([]);
    const iRef = useRef(0);
    const jRef = useRef(1);
    const minRef = useRef(0);
    const tickingRef = useRef(false);
    const timersRef = useRef([]);
    const keyRef = useRef(0);

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
      arrayRef.current = [...values];
      initialArrayRef.current = [...values];
      setArray(values);
      resetAlgoState(values);
    };

    const resetAlgoState = (arr = initialArrayRef.current) => {
      clearAllTimers();
      arrayRef.current = [...arr];
      setArray([...arr]);
      iRef.current = 0;
      jRef.current = 1;
      minRef.current = 0;
      tickingRef.current = false;
      setHighlight([]);
      setPreviousPass(null);
      setActivePass({
        key: keyRef.current++,
        label: "Initial Array",
        array: [...arr],
      });
      onPlayingChange(false);
      updateStepData(0, {}, "init");
    };

    useImperativeHandle(ref, () => ({
      reset: () => resetAlgoState(),
    }));

    useEffect(() => {
      initializeArray();
    }, []);

    useEffect(() => {
      if (userInput) initializeArray();
    }, [userInput]);

    // 🔹 Utility: push current step to PseudoCodePanel
    const updateStepData = (codeLineIndex, variables, action) => {
      window.getCurrentStepData = () => ({
        step: { codeLineIndex, action },
        variables,
      });
    };

    const stepSelection = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      const speedFactor = Math.max(0.5, Number(playbackSpeed));
      const T_COMPARE = 800 / speedFactor;
      const T_SWAP = 900 / speedFactor;
      const T_PASS = 1100 / speedFactor;

      const arr = [...arrayRef.current];
      const n = arr.length;
      let i = iRef.current;
      let j = jRef.current;
      let min = minRef.current;

      if (i >= n - 1) {
        swapInNewPassContainer("Sorted", arr, T_PASS, () => {
          onPlayingChange(false);
          onAnimationComplete();
        });
        tickingRef.current = false;
        return;
      }

      if (j < n) {
        // 🔹 Compare step
        setHighlight([j, min, "compare"]);
        updateStepData(
          4, // line "for (int j = i+1...)"
          { i, j, min_idx: min, "arr[j]": arr[j], "arr[min_idx]": arr[min] },
          "compare"
        );
        

        const t1 = setTimeout(() => {
          if (arr[j] < arr[min]) {
            min = j;
            minRef.current = min;
            updateStepData(
              6, // line "min_idx = j;"
              { i, j, min_idx: min, "arr[j]": arr[j] },
              "update_min"
            );
          }
          jRef.current = j + 1;
          setHighlight([]);
          tickingRef.current = false;
          if (isPlaying) scheduleNextStep(0);
        }, T_COMPARE);
        timersRef.current.push(t1);
        return;
      }

      // 🔹 End inner loop → Swap
      if (min !== i) {
        setHighlight([i, min, "swap"]);
        
        updateStepData(
          8, // line "swap(arr[i], arr[min_idx])"
          { i, min_idx: min, "arr[i]": arr[i], "arr[min_idx]": arr[min] },
          "swap"
        );

        const t2 = setTimeout(() => {
          [arr[i], arr[min]] = [arr[min], arr[i]];
          arrayRef.current = [...arr];
          setArray([...arr]);
          setActivePass((prev) =>
            prev ? { ...prev, array: [...arr] } : prev
          );
          setHighlight([]);

          const t3 = setTimeout(() => {
            const passLabel = `Pass ${i + 1}`;
            swapInNewPassContainer(passLabel, arr, T_PASS, () => {
              iRef.current = i + 1;
              jRef.current = iRef.current + 1;
              minRef.current = iRef.current;
              tickingRef.current = false;
              if (isPlaying) scheduleNextStep(0);
            });
          }, T_PASS);
          timersRef.current.push(t3);
        }, T_SWAP);
        timersRef.current.push(t2);
      } else {
        // No swap, finalize pass
        const passLabel = `Pass ${i + 1}`;
        const t4 = setTimeout(() => {
          swapInNewPassContainer(passLabel, arr, T_PASS, () => {
            iRef.current = i + 1;
            jRef.current = iRef.current + 1;
            minRef.current = iRef.current;
            tickingRef.current = false;
            if (isPlaying) scheduleNextStep(0);
          });
        }, T_PASS);
        timersRef.current.push(t4);
      }
    };

    const scheduleNextStep = (delay = 0) => {
      const t = setTimeout(() => {
        stepSelection();
      }, delay);
      timersRef.current.push(t);
    };

    useEffect(() => {
      if (isPlaying) {
        onPlayingChange(true);
        if (!tickingRef.current) scheduleNextStep(0);
      }
    }, [isPlaying, playbackSpeed]);

    const swapInNewPassContainer = (
      newLabel,
      arrSnapshot,
      transitionMs,
      after = () => {}
    ) => {
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
            <div
              className="pass-container outgoing"
              key={`prev-${previousPass.key}`}
            >
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
              className={`pass-container ${
                activePass.incoming ? "incoming" : "centered"
              }`}
              key={`active-${activePass.key}`}
            >
              <div className="pass-label">{activePass.label}</div>
              <div className="array-row">
                {activePass.array.map((v, idx) => {
                  const isHighlight =
                    highlight[0] === idx || highlight[1] === idx;
                  const phase = isHighlight ? highlight[2] : null;

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

export default SelectionSortVisualizer;
