import { RefObject, useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { defer, cancelDefer } from "./defer";
import {
  setInputSelection,
  getInputSelection,
  isInputFocused
} from "./input";

import { isDOMElement } from "./helpers";
import { MaskState } from './types';

export function useInputElement(inputRef: RefObject<HTMLInputElement>) {
  return useCallback(() => {
    let input: HTMLInputElement = inputRef.current;
    const isDOMNode = typeof window !== "undefined" && isDOMElement(input);

    // workaround for react-test-renderer
    // https://github.com/sanniassin/react-input-mask/issues/147
    if (!input || !isDOMNode) {
      return null;
    }

    if (input.nodeName !== "INPUT") {
      const innerInput = input.querySelector<HTMLInputElement>("input");
      if (!innerInput) {
        if (typeof window !== "undefined") {
          throw new Error("react-input-mask: inputComponent must be rendered in DOM environment");
        }
        return;
      }
      input = innerInput
    }

    if (!input) {
      throw new Error(
        "react-input-mask: inputComponent doesn't contain input node"
      );
    }

    return input;
  }, [inputRef]);
}

function useDeferLoop(callback: () => void) {
  const deferIdRef = useRef<number | null>(null);

  const runLoop = useCallback(() => {
    // If there are simulated focus events, runLoop could be
    // called multiple times without blur or re-render
    if (deferIdRef.current !== null) {
      return;
    }

    function loop() {
      callback();
      deferIdRef.current = defer(loop);
    }

    loop();
  }, [callback]);

  const stopLoop = useCallback(() => {
    cancelDefer(deferIdRef.current);
    deferIdRef.current = null;
  }, []);

  useEffect(() => {
    if (deferIdRef.current) {
      stopLoop();
      runLoop();
    }
  }, [runLoop, stopLoop]);

  useEffect(cancelDefer, []);

  return [runLoop, stopLoop];
}

function useSelection(inputRef: RefObject<HTMLInputElement>, isMasked: boolean) {
  const selectionRef = useRef<{ start: number | null, end: number | null }>({ start: null, end: null });
  const getInputElement = useInputElement(inputRef);

  const getSelection = useCallback(() => {
    const input = getInputElement()!;
    return getInputSelection(input);
  }, [getInputElement]);

  const getLastSelection = useCallback(() => {
    return selectionRef.current;
  }, []);

  const setSelection = useCallback(
    (selection: MaskState['selection']) => {
      const input = getInputElement();

      // Don't change selection on unfocused input
      // because Safari sets focus on selection change (#154)
      if (!input || !isInputFocused(input)) {
        return;
      }

      setInputSelection(input, selection.start, selection.end);

      // Use actual selection in case the requested one was out of range
      selectionRef.current = getSelection();
    },
    [getInputElement, getSelection]
  );

  const selectionLoop = useCallback(() => {
    selectionRef.current = getSelection();
  }, [getSelection]);
  const [runSelectionLoop, stopSelectionLoop] = useDeferLoop(selectionLoop);

  useLayoutEffect(() => {
    if (!isMasked) {
      return;
    }

    const input = getInputElement()!;
    input.addEventListener("focus", runSelectionLoop);
    input.addEventListener("blur", stopSelectionLoop);

    if (isInputFocused(input)) {
      runSelectionLoop();
    }

    return () => {
      input.removeEventListener("focus", runSelectionLoop);
      input.removeEventListener("blur", stopSelectionLoop);

      stopSelectionLoop();
    };
  });

  return { getSelection, getLastSelection, setSelection };
}

function useValue(inputRef: RefObject<HTMLInputElement>, initialValue: string) {
  const getInputElement = useInputElement(inputRef);
  const valueRef = useRef(initialValue);
  
  const getValue = useCallback(() => {
    const input = getInputElement()!;
    return input.value;
  }, [getInputElement]);
  
  const getLastValue = useCallback(() => {
    return valueRef.current;
  }, []);
  
  const setValue = useCallback(
      (newValue: any) => {
        valueRef.current = newValue;
        
        const input = getInputElement();
        if (input) {
          input.value = newValue;
        }
      },
      [getInputElement]
  );
  
  return {
    getValue,
    getLastValue,
    setValue
  };
}

export function useInputState(initialValue: string, isMasked: boolean, inputRef: RefObject<HTMLInputElement>) {
  const { getSelection, getLastSelection, setSelection } = useSelection(
    inputRef,
    isMasked
  );
  const { getValue, getLastValue, setValue } = useValue(inputRef, initialValue);

  function getLastInputState() {
    return {
      value: getLastValue(),
      selection: getLastSelection()
    };
  }

  function getInputState() {
    return {
      value: getValue(),
      selection: getSelection()
    };
  }

  function setInputState({ value, selection }: MaskState) {
    setValue(value);
    setSelection(selection);
  }

  return {
    inputRef,
    getInputState,
    getLastInputState,
    setInputState
  };
}

export function usePrevious(value: boolean): boolean {
  const ref = useRef<boolean>(false);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
