var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx } from "react/jsx-runtime";
import { useImperativeHandle, useLayoutEffect, useRef, } from 'react';
import { validateChildren, validateMaskPlaceholder, validateMaxLength } from './validate-props';
import MaskUtils from './mask';
import { useInputElement, useInputState, usePrevious } from './hooks';
import { getElementDocument, anyToString } from './helpers';
import * as React from 'react';
import { defer } from './defer';
import { isInputFocused } from './input';
export function InputMask(props) {
    var ref = props.ref, children = props.children, mask = props.mask, beforeMaskedStateChange = props.beforeMaskedStateChange, _a = props.alwaysShowMask, alwaysShowMask = _a === void 0 ? false : _a, _b = props.maskPlaceholder, maskPlaceholder = _b === void 0 ? '_' : _b, restProps = __rest(props, ["ref", "children", "mask", "beforeMaskedStateChange", "alwaysShowMask", "maskPlaceholder"]);
    var inputElementRef = useRef(null);
    useImperativeHandle(ref, function () { return inputElementRef.current; }, []);
    validateMaxLength(props);
    validateMaskPlaceholder(props);
    var maskUtils = new MaskUtils({ mask: mask, maskPlaceholder: maskPlaceholder });
    var isMasked = !!mask;
    var isEditable = !restProps.disabled && !restProps.readOnly;
    var isControlled = props.value !== null && props.value !== undefined;
    var previousIsMasked = usePrevious(isMasked);
    var initialValue = anyToString((isControlled ? props.value : props.defaultValue) || "");
    var _c = useInputState(initialValue, isMasked, inputElementRef), getInputState = _c.getInputState, setInputState = _c.setInputState, getLastInputState = _c.getLastInputState;
    var getInputElement = useInputElement(inputElementRef);
    function onChange(event) {
        var currentState = getInputState();
        var previousState = getLastInputState();
        var newInputState = maskUtils.processChange(currentState, previousState);
        if (beforeMaskedStateChange) {
            newInputState = beforeMaskedStateChange({
                currentState: currentState,
                previousState: previousState,
                nextState: newInputState
            });
        }
        setInputState(newInputState);
        if (props.onChange) {
            props.onChange(event);
        }
    }
    function onFocus(event) {
        // If autoFocus property is set, focus event fires before the ref handler gets called
        if (!inputElementRef.current) {
            inputElementRef.current = event.target;
        }
        var currentValue = getInputState().value;
        if (isMasked && !maskUtils.isValueFilled(currentValue)) {
            var newValue = maskUtils.formatValue(currentValue);
            var newSelection = maskUtils.getDefaultSelectionForValue(newValue);
            var newInputState = {
                value: newValue,
                selection: newSelection,
            };
            if (beforeMaskedStateChange) {
                newInputState = beforeMaskedStateChange({
                    currentState: getInputState(),
                    nextState: newInputState,
                });
                newValue = newInputState.value;
            }
            setInputState(newInputState);
            if (newValue !== currentValue && props.onChange) {
                props.onChange(event);
            }
            // Chrome resets selection after focus event,
            // so we want to restore it later
            defer(function () {
                setInputState(getLastInputState());
            });
        }
        if (props.onFocus) {
            props.onFocus(event);
        }
    }
    function onBlur(event) {
        var currentValue = getInputState().value;
        var lastValue = getLastInputState().value;
        if (isMasked && !alwaysShowMask && maskUtils.isValueEmpty(lastValue)) {
            var newValue = "";
            var newInputState = {
                value: newValue,
                selection: { start: null, end: null },
            };
            if (beforeMaskedStateChange) {
                newInputState = beforeMaskedStateChange({
                    currentState: getInputState(),
                    nextState: newInputState,
                });
                newValue = newInputState.value;
            }
            setInputState(newInputState);
            if (newValue !== currentValue && props.onChange) {
                props.onChange(event);
            }
        }
        if (props.onBlur) {
            props.onBlur(event);
        }
    }
    // Tiny unintentional mouse movements can break cursor
    // position on focus, so we have to restore it in that case
    //
    // https://github.com/sanniassin/react-input-mask/issues/108
    function onMouseDown(event) {
        var input = getInputElement();
        if (!input) {
            return;
        }
        var value = getInputState().value;
        var inputDocument = getElementDocument(input);
        if (!isInputFocused(input) && !maskUtils.isValueFilled(value)) {
            var mouseDownX_1 = event.clientX;
            var mouseDownY_1 = event.clientY;
            var mouseDownTime_1 = new Date().getTime();
            var mouseUpHandler_1 = function (mouseUpEvent) {
                inputDocument.removeEventListener("mouseup", mouseUpHandler_1);
                if (!isInputFocused(input)) {
                    return;
                }
                var deltaX = Math.abs(mouseUpEvent.clientX - mouseDownX_1);
                var deltaY = Math.abs(mouseUpEvent.clientY - mouseDownY_1);
                var axisDelta = Math.max(deltaX, deltaY);
                var timeDelta = new Date().getTime() - mouseDownTime_1;
                if ((axisDelta <= 10 && timeDelta <= 200) ||
                    (axisDelta <= 5 && timeDelta <= 300)) {
                    var lastState_1 = getLastInputState();
                    var newSelection = maskUtils.getDefaultSelectionForValue(lastState_1.value);
                    var newState = __assign(__assign({}, lastState_1), { selection: newSelection });
                    setInputState(newState);
                }
            };
            inputDocument.addEventListener("mouseup", mouseUpHandler_1);
        }
        if (props.onMouseDown) {
            props.onMouseDown(event);
        }
    }
    // For controlled inputs we want to provide properly formatted
    // value prop
    if (isMasked && isControlled) {
        var input = getInputElement();
        var isFocused = input && isInputFocused(input);
        var newValue = isFocused || alwaysShowMask || props.value
            ? maskUtils.formatValue(props.value)
            : props.value;
        if (beforeMaskedStateChange) {
            newValue = beforeMaskedStateChange({
                nextState: {
                    value: newValue,
                    selection: {
                        start: null,
                        end: null,
                    },
                },
            }).value;
        }
        setInputState(__assign(__assign({}, getLastInputState()), { value: newValue }));
    }
    var lastState = getLastInputState();
    var lastSelection = lastState.selection;
    var lastValue = lastState.value;
    useLayoutEffect(function () {
        if (!isMasked) {
            return;
        }
        var input = getInputElement();
        if (!input) {
            return;
        }
        var isFocused = isInputFocused(input);
        var previousSelection = lastSelection;
        var currentState = getInputState();
        var newInputState = __assign({}, currentState);
        // Update value for uncontrolled inputs to make sure
        // it's always in sync with mask props
        if (!isControlled) {
            var currentValue = currentState.value;
            var formattedValue = maskUtils.formatValue(currentValue);
            var isValueEmpty = maskUtils.isValueEmpty(formattedValue);
            var shouldFormatValue = !isValueEmpty || isFocused || alwaysShowMask;
            if (shouldFormatValue) {
                newInputState.value = formattedValue;
            }
            else if (isValueEmpty && !isFocused) {
                newInputState.value = "";
            }
        }
        if (isFocused && !previousIsMasked) {
            // Adjust selection if input got masked while being focused
            newInputState.selection = maskUtils.getDefaultSelectionForValue(newInputState.value);
        }
        else if (isControlled && isFocused && previousSelection) {
            // Restore cursor position if value has changed outside change event
            if (previousSelection.start !== null && previousSelection.end !== null) {
                newInputState.selection = previousSelection;
            }
        }
        if (beforeMaskedStateChange) {
            newInputState = beforeMaskedStateChange({
                currentState: currentState,
                nextState: newInputState,
            });
        }
        setInputState(newInputState);
    });
    var inputProps = __assign(__assign({}, restProps), { onFocus: onFocus, onBlur: onBlur, onChange: isMasked && isEditable ? onChange : props.onChange, onMouseDown: isMasked && isEditable ? onMouseDown : props.onMouseDown, value: isMasked && isControlled ? lastValue : props.value });
    if (children) {
        validateChildren(props, children);
        var onlyChild = React.Children.only(children);
        return React.cloneElement(onlyChild, __assign(__assign({}, inputProps), { 
            // @ts-ignore
            ref: inputElementRef }));
    }
    return _jsx("input", __assign({ ref: inputElementRef, role: props.role || 'textbox' }, inputProps));
}
export default InputMask;
//# sourceMappingURL=index.js.map