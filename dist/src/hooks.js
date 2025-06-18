import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { defer, cancelDefer } from "./defer";
import { setInputSelection, getInputSelection, isInputFocused } from "./input";
import { isDOMElement } from "./helpers";
import invariant from 'invariant';
export function useInputElement(inputRef) {
    return useCallback(function () {
        var input = inputRef.current;
        var isDOMNode = typeof window !== "undefined" && isDOMElement(input);
        // workaround for react-test-renderer
        // https://github.com/sanniassin/react-input-mask/issues/147
        if (!input || !isDOMNode) {
            return null;
        }
        if (input.nodeName !== "INPUT") {
            var innerInput = input.querySelector("input");
            if (!innerInput) {
                invariant(typeof window !== "undefined", "react-input-mask: inputComponent must be rendered in DOM environment");
                return;
            }
            input = innerInput;
        }
        if (!input) {
            throw new Error("react-input-mask: inputComponent doesn't contain input node");
        }
        return input;
    }, [inputRef]);
}
function useDeferLoop(callback) {
    var deferIdRef = useRef(null);
    var runLoop = useCallback(function () {
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
    var stopLoop = useCallback(function () {
        cancelDefer(deferIdRef.current);
        deferIdRef.current = null;
    }, []);
    useEffect(function () {
        if (deferIdRef.current) {
            stopLoop();
            runLoop();
        }
    }, [runLoop, stopLoop]);
    useEffect(cancelDefer, []);
    return [runLoop, stopLoop];
}
function useSelection(inputRef, isMasked) {
    var selectionRef = useRef({ start: null, end: null });
    var getInputElement = useInputElement(inputRef);
    var getSelection = useCallback(function () {
        var input = getInputElement();
        return getInputSelection(input);
    }, [getInputElement]);
    var getLastSelection = useCallback(function () {
        return selectionRef.current;
    }, []);
    var setSelection = useCallback(function (selection) {
        var input = getInputElement();
        // Don't change selection on unfocused input
        // because Safari sets focus on selection change (#154)
        if (!input || !isInputFocused(input)) {
            return;
        }
        setInputSelection(input, selection.start, selection.end);
        // Use actual selection in case the requested one was out of range
        selectionRef.current = getSelection();
    }, [getInputElement, getSelection]);
    var selectionLoop = useCallback(function () {
        selectionRef.current = getSelection();
    }, [getSelection]);
    var _a = useDeferLoop(selectionLoop), runSelectionLoop = _a[0], stopSelectionLoop = _a[1];
    useLayoutEffect(function () {
        if (!isMasked) {
            return;
        }
        var input = getInputElement();
        input.addEventListener("focus", runSelectionLoop);
        input.addEventListener("blur", stopSelectionLoop);
        if (isInputFocused(input)) {
            runSelectionLoop();
        }
        return function () {
            input.removeEventListener("focus", runSelectionLoop);
            input.removeEventListener("blur", stopSelectionLoop);
            stopSelectionLoop();
        };
    });
    return { getSelection: getSelection, getLastSelection: getLastSelection, setSelection: setSelection };
}
function useValue(inputRef, initialValue) {
    var getInputElement = useInputElement(inputRef);
    var valueRef = useRef(initialValue);
    var getValue = useCallback(function () {
        var input = getInputElement();
        return input.value;
    }, [getInputElement]);
    var getLastValue = useCallback(function () {
        return valueRef.current;
    }, []);
    var setValue = useCallback(function (newValue) {
        valueRef.current = newValue;
        var input = getInputElement();
        if (input) {
            input.value = newValue;
        }
    }, [getInputElement]);
    return {
        getValue: getValue,
        getLastValue: getLastValue,
        setValue: setValue
    };
}
export function useInputState(initialValue, isMasked, inputRef) {
    var _a = useSelection(inputRef, isMasked), getSelection = _a.getSelection, getLastSelection = _a.getLastSelection, setSelection = _a.setSelection;
    var _b = useValue(inputRef, initialValue), getValue = _b.getValue, getLastValue = _b.getLastValue, setValue = _b.setValue;
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
    function setInputState(_a) {
        var value = _a.value, selection = _a.selection;
        setValue(value);
        setSelection(selection);
    }
    return {
        inputRef: inputRef,
        getInputState: getInputState,
        getLastInputState: getLastInputState,
        setInputState: setInputState
    };
}
export function usePrevious(value) {
    var ref = useRef(false);
    useEffect(function () {
        ref.current = value;
    });
    return ref.current;
}
//# sourceMappingURL=hooks.js.map