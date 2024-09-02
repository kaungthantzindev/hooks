import { useState, useEffect, useCallback, useRef } from "react";

export interface UseHashStateOptions<T> {
  initialValue?: T;
  encode?: (value: T) => string;
  decode?: (value: string) => T;
  debounce?: number;
  syncWithSessionStorage?: boolean;
  onHashChange?: (newValue: T | undefined, oldValue: T | undefined) => void;
  errorHandler?: (error: Error) => void;
}

export type UseHashStateReturn<T> = [
  T | undefined,
  (value: T | undefined) => void,
  () => void
];

function useHashState<T = string>(
  key: string,
  options: UseHashStateOptions<T> = {}
): UseHashStateReturn<T | undefined> {
  const {
    initialValue,
    encode = (value: T) => encodeURIComponent(String(value)),
    decode = (value: string) => decodeURIComponent(value) as T,
    debounce = 0,
    syncWithSessionStorage = false,
    onHashChange,
    errorHandler = console.error,
  } = options;

  const getInitialValue = useCallback((): T | undefined => {
    try {
      if (syncWithSessionStorage) {
        const sessionValue = sessionStorage.getItem(key);
        if (sessionValue !== null) {
          return decode(sessionValue);
        }
      }
      const hash = new URLSearchParams(window.location.hash.substring(1));
      const value = hash.get(key);
      if (value !== null) {
        return decode(value);
      }
    } catch (error) {
      errorHandler(error);
    }
    return initialValue;
  }, [key, initialValue, decode, syncWithSessionStorage, errorHandler]);

  const [state, setState] = useState<T | undefined>(getInitialValue);
  const previousStateRef = useRef<T | undefined>(state);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateHash = useCallback(
    (newState: T | undefined) => {
      if (newState === undefined) return; // Does not update hash if newState is undefined
      try {
        const hash = new URLSearchParams(window.location.hash.substring(1));
        hash.set(key, encode(newState));
        const newHash = hash.toString();
        if (window.location.hash.substring(1) !== newHash) {
          window.location.hash = newHash;
        }

        if (syncWithSessionStorage) {
          sessionStorage.setItem(key, encode(newState));
        }
      } catch (error) {
        errorHandler(error);
      }
    },
    [key, encode, syncWithSessionStorage, errorHandler]
  );

  const clearHashState = useCallback(() => {
    try {
      const hash = new URLSearchParams(window.location.hash.substring(1));
      hash.delete(key);
      if (hash.toString()) {
        window.location.hash = hash.toString();
      } else {
        history.pushState(
          "",
          document.title,
          window.location.pathname + window.location.search
        );
      }
      if (syncWithSessionStorage) {
        sessionStorage.removeItem(key);
      }
    } catch (error) {
      errorHandler(error);
    }
  }, [key, syncWithSessionStorage, errorHandler]);

  useEffect(() => {
    const handleHashChange = () => {
      const newValue = getInitialValue();
      if (onHashChange && previousStateRef.current !== newValue) {
        onHashChange(newValue, previousStateRef.current);
      }
      previousStateRef.current = newValue;
      setState(newValue);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [getInitialValue, onHashChange]);

  const setHashState = useCallback(
    (newState: T | undefined) => {
      if (newState === undefined) return; // Does not attempt to set undefined states
      if (debounce > 0) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          updateHash(newState);
          setState(newState);
        }, debounce);
      } else {
        updateHash(newState);
        setState(newState);
      }
    },
    [updateHash, debounce]
  );

  return [state, setHashState, clearHashState];
}

export default useHashState;
