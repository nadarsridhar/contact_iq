import { useRef, useCallback } from 'react';

// /**
//  * Custom hook for throttling a function.
//  * @param {Function} callback - The function to throttle.
//  * @param {number} delay - The delay in milliseconds.
//  * @returns {Function} - The throttled function.
//  */
// const useThrottle = (callback, delay) => {
//   const lastCallRef = useRef(0);

//   return (...args) => {
//     const now = Date.now();

//     if (now - lastCallRef.current > delay) {
//       lastCallRef.current = now;
//       callback(...args);
//     }
//   };
// };

/**
 * Custom hook for throttling a function.
 * Ensures the function runs once after the specified delay.
 *
 * @param {Function} callback - The function to throttle.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} - The throttled function.
 */
const useThrottle = (callback, delay) => {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef(null);
  const lastArgsRef = useRef(null);

  const throttledFunction = useCallback(
    (...args) => {
      const now = Date.now();
      const remainingTime = delay - (now - lastCallRef.current);

      lastArgsRef.current = args;

      if (remainingTime <= 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        lastCallRef.current = now;
        callback(...args);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          timeoutRef.current = null;
          callback(...lastArgsRef.current);
        }, remainingTime);
      }
    },
    [callback, delay]
  );

  return throttledFunction;
};

export default useThrottle;
