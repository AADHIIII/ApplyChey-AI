
import { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from 'react';

// FIX: Update the return type for the setter function to allow functional updates (e.g., setValue(prev => ...)).
export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): [T, T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  // FIX: This useEffect was making the value update immediately, defeating the purpose of debouncing.
  // It has been removed to ensure the value is properly debounced.
  // The immediate update for AI changes is now handled by the lag being acceptable (250ms).

  return [debouncedValue, value, setValue];
}

export function useDebouncedCallback<A extends any[]>(
    callback: (...args: A) => void,
    delay: number
  ) {
    const callbackRef = useRef(callback);
    // FIX: Changed useRef<number> to useRef<number | undefined> to correctly type the ref, which is initialized without a value (as undefined). This also resolves a potential compiler error.
    // Fix: Provide an explicit initial value of null to satisfy the linter/compiler rule requiring an argument for useRef.
    const timeoutRef = useRef<number | null>(null);
  
    useEffect(() => {
      callbackRef.current = callback;
    }, [callback]);

    // FIX: Added a cleanup effect to clear the timeout when the component unmounts to prevent memory leaks.
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);
  
    return useCallback((...args: A) => {
      if (timeoutRef.current) {
        // FIX: Use global clearTimeout without `window.` for consistency and to avoid environment-specific issues.
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }, [delay]);
  }