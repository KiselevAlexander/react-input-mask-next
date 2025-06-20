'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var invariant = require('invariant');
var warning = require('warning');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespaceDefault(React);

var CONTROLLED_PROPS = [
    "disabled",
    "onBlur",
    "onChange",
    "onFocus",
    "onMouseDown",
    "readOnly",
    "value"
];
var defaultFormatChars = {
    "9": /[0-9]/,
    a: /[A-Za-z]/,
    "*": /[A-Za-z0-9]/
};

function validateMaxLength(props) {
    warning(!props.maxLength || !props.mask, "react-input-mask-ts: maxLength property shouldn't be passed to the masked input. It breaks masking and unnecessary because length is limited by the mask length.");
}
function validateMaskPlaceholder(props) {
    var mask = props.mask, maskPlaceholder = props.maskPlaceholder;
    invariant(!mask ||
        !maskPlaceholder ||
        maskPlaceholder.length === 1 ||
        maskPlaceholder.length === mask.length, "react-input-mask-ts: maskPlaceholder should either be a single character or have the same length as the mask:\n" +
        "mask: ".concat(mask, "\n") +
        "maskPlaceholder: ".concat(maskPlaceholder));
}
function validateChildren(props, children) {
    var inputElement = React__namespace.Children.only(children);
    var conflictProps = CONTROLLED_PROPS.filter(function (propId) {
        return inputElement.props[propId] != null &&
            propId in props &&
            inputElement.props[propId] !== props[propId];
    });
    invariant(!conflictProps.length, "react-input-mask-ts: the following props should be passed to the InputMask component, not to children: ".concat(conflictProps.join(",")));
}

function getElementDocument(element) {
    return element === null || element === void 0 ? void 0 : element.ownerDocument;
}
function getElementWindow(element) {
    var _a;
    return (_a = getElementDocument(element)) === null || _a === void 0 ? void 0 : _a.defaultView;
}
function isDOMElement(element) {
    var elementWindow = getElementWindow(element);
    return !!elementWindow && element instanceof elementWindow.HTMLElement;
}
function findLastIndex(array, predicate) {
    for (var i = array.length - 1; i >= 0; i--) {
        var x = array[i];
        if (predicate(x, i)) {
            return i;
        }
    }
    return -1;
}
function repeat(string, n) {
    if (n === void 0) { n = 1; }
    var result = "";
    for (var i = 0; i < n; i++) {
        result += string;
    }
    return result;
}
function anyToString(value) {
    return "".concat(value);
}

function parseMask (_a) {
    var mask = _a.mask, maskPlaceholder = _a.maskPlaceholder;
    var permanents = [];
    if (!mask) {
        return {
            maskPlaceholder: null,
            mask: null,
            prefix: null,
            lastEditablePosition: null,
            permanents: []
        };
    }
    if (typeof mask === "string") {
        var isPermanent_1 = false;
        var parsedMaskString_1 = "";
        mask.split("").forEach(function (character) {
            if (!isPermanent_1 && character === "\\") {
                isPermanent_1 = true;
            }
            else {
                if (isPermanent_1 || !defaultFormatChars[character]) {
                    permanents.push(parsedMaskString_1.length);
                }
                parsedMaskString_1 += character;
                isPermanent_1 = false;
            }
        });
        mask = parsedMaskString_1.split("").map(function (character, index) {
            if (permanents.indexOf(index) === -1) {
                return defaultFormatChars[character];
            }
            return character;
        });
    }
    else {
        mask.forEach(function (character, index) {
            if (typeof character === "string") {
                permanents.push(index);
            }
        });
    }
    if (maskPlaceholder) {
        if (maskPlaceholder.length === 1) {
            maskPlaceholder = mask.map(function (character, index) {
                if (permanents.indexOf(index) !== -1) {
                    return character;
                }
                return maskPlaceholder;
            });
        }
        else {
            maskPlaceholder = maskPlaceholder.split("");
        }
        permanents.forEach(function (position) {
            maskPlaceholder[position] = mask[position];
        });
        maskPlaceholder = maskPlaceholder.join("");
    }
    var prefix = permanents
        .filter(function (position, index) { return position === index; })
        .map(function (position) { return mask[position]; })
        .join("");
    var lastEditablePosition = mask.length - 1;
    while (permanents.indexOf(lastEditablePosition) !== -1) {
        lastEditablePosition--;
    }
    return {
        maskPlaceholder: maskPlaceholder,
        prefix: prefix,
        mask: mask,
        lastEditablePosition: lastEditablePosition,
        permanents: permanents
    };
}

/* eslint no-use-before-define: ["error", { functions: false }] */
var MaskUtils = /** @class */ (function () {
    function MaskUtils(options) {
        var _this = this;
        this.isCharacterAllowedAtPosition = function (character, position) {
            var maskPlaceholder = _this.maskOptions.maskPlaceholder;
            if (_this.isCharacterFillingPosition(character, position)) {
                return true;
            }
            if (!maskPlaceholder) {
                return false;
            }
            return maskPlaceholder[position] === character;
        };
        this.isCharacterFillingPosition = function (character, position) {
            var mask = _this.maskOptions.mask;
            if (!character || position >= mask.length) {
                return false;
            }
            if (!_this.isPositionEditable(position)) {
                return mask[position] === character;
            }
            var charRule = mask[position];
            return new RegExp(charRule).test(character);
        };
        this.isPositionEditable = function (position) {
            var _a = _this.maskOptions, mask = _a.mask, permanents = _a.permanents;
            return position < mask.length && permanents.indexOf(position) === -1;
        };
        this.isValueEmpty = function (value) {
            return value.split("").every(function (character, position) {
                return (!_this.isPositionEditable(position) ||
                    !_this.isCharacterFillingPosition(character, position));
            });
        };
        this.isValueFilled = function (value) {
            return (_this.getFilledLength(value) === (_this.maskOptions.lastEditablePosition || 0) + 1);
        };
        this.getDefaultSelectionForValue = function (value) {
            var filledLength = _this.getFilledLength(value);
            var cursorPosition = _this.getRightEditablePosition(filledLength);
            return { start: cursorPosition, end: cursorPosition };
        };
        this.getFilledLength = function (value) {
            var characters = value.split("");
            var lastFilledIndex = findLastIndex(characters, function (character, position) {
                return (_this.isPositionEditable(position) &&
                    _this.isCharacterFillingPosition(character, position));
            });
            return lastFilledIndex + 1;
        };
        this.getStringFillingLengthAtPosition = function (string, position) {
            var characters = string.split("");
            var insertedValue = characters.reduce(function (value, character) {
                return _this.insertCharacterAtPosition(value, character, value.length);
            }, repeat(" ", position));
            return insertedValue.length - position;
        };
        this.getLeftEditablePosition = function (position) {
            for (var i = position; i >= 0; i--) {
                if (_this.isPositionEditable(i)) {
                    return i;
                }
            }
            return null;
        };
        this.getRightEditablePosition = function (position) {
            var mask = _this.maskOptions.mask;
            for (var i = position; i < mask.length; i++) {
                if (_this.isPositionEditable(i)) {
                    return i;
                }
            }
            return null;
        };
        this.formatValue = function (value) {
            var _a = _this.maskOptions, maskPlaceholder = _a.maskPlaceholder, mask = _a.mask;
            if (!maskPlaceholder) {
                value = _this.insertStringAtPosition("", value, 0);
                while (value.length < mask.length &&
                    !_this.isPositionEditable(value.length)) {
                    value += mask[value.length];
                }
                return value;
            }
            return _this.insertStringAtPosition(maskPlaceholder, value, 0);
        };
        this.clearRange = function (value, start, len) {
            if (!len) {
                return value;
            }
            var end = start + len;
            var _a = _this.maskOptions, maskPlaceholder = _a.maskPlaceholder, mask = _a.mask;
            var clearedValue = value
                .split("")
                .map(function (character, i) {
                var isEditable = _this.isPositionEditable(i);
                if (!maskPlaceholder && i >= end && !isEditable) {
                    return "";
                }
                if (i < start || i >= end) {
                    return character;
                }
                if (!isEditable) {
                    return mask[i];
                }
                if (maskPlaceholder) {
                    return maskPlaceholder[i];
                }
                return "";
            })
                .join("");
            return _this.formatValue(clearedValue);
        };
        this.insertCharacterAtPosition = function (value, character, position) {
            var _a = _this.maskOptions, mask = _a.mask, maskPlaceholder = _a.maskPlaceholder;
            if (position >= mask.length) {
                return value;
            }
            var isAllowed = _this.isCharacterAllowedAtPosition(character, position);
            var isEditable = _this.isPositionEditable(position);
            var nextEditablePosition = _this.getRightEditablePosition(position);
            var isNextPlaceholder = maskPlaceholder && nextEditablePosition
                ? character === maskPlaceholder[nextEditablePosition]
                : null;
            var valueBefore = value.slice(0, position);
            if (isAllowed || !isEditable) {
                var insertedCharacter = isAllowed ? character : mask[position];
                value = valueBefore + insertedCharacter;
            }
            if (!isAllowed && !isEditable && !isNextPlaceholder) {
                value = _this.insertCharacterAtPosition(value, character, position + 1);
            }
            return value;
        };
        this.insertStringAtPosition = function (value, string, position) {
            var _a = _this.maskOptions, mask = _a.mask, maskPlaceholder = _a.maskPlaceholder;
            if (!string || position >= mask.length) {
                return value;
            }
            var characters = string.split("");
            var isFixedLength = _this.isValueFilled(value) || !!maskPlaceholder;
            var valueAfter = value.slice(position);
            value = characters.reduce(function (value, character) {
                return _this.insertCharacterAtPosition(value, character, value.length);
            }, value.slice(0, position));
            if (isFixedLength) {
                value += valueAfter.slice(value.length - position);
            }
            else if (_this.isValueFilled(value)) {
                value += mask.slice(value.length).join("");
            }
            else {
                var editableCharactersAfter = valueAfter
                    .split("")
                    .filter(function (character, i) {
                    return _this.isPositionEditable(position + i);
                });
                value = editableCharactersAfter.reduce(function (value, character) {
                    var nextEditablePosition = _this.getRightEditablePosition(value.length);
                    if (nextEditablePosition === null) {
                        return value;
                    }
                    if (!_this.isPositionEditable(value.length)) {
                        value += mask.slice(value.length, nextEditablePosition).join("");
                    }
                    return _this.insertCharacterAtPosition(value, character, value.length);
                }, value);
            }
            return value;
        };
        this.processChange = function (currentState, previousState) {
            var _a = _this.maskOptions, mask = _a.mask, prefix = _a.prefix, lastEditablePosition = _a.lastEditablePosition;
            var value = currentState.value, selection = currentState.selection;
            var previousValue = previousState.value;
            var previousSelection = previousState.selection;
            var newValue = value;
            var enteredString = "";
            var formattedEnteredStringLength = 0;
            var removedLength = 0;
            var cursorPosition = Math.min(previousSelection.start, selection.start);
            if (selection.end > previousSelection.start) {
                enteredString = newValue.slice(previousSelection.start, selection.end);
                formattedEnteredStringLength = _this.getStringFillingLengthAtPosition(enteredString, cursorPosition);
                if (!formattedEnteredStringLength) {
                    removedLength = 0;
                }
                else {
                    removedLength = previousSelection.length;
                }
            }
            else if (newValue.length < previousValue.length) {
                removedLength = previousValue.length - newValue.length;
            }
            newValue = previousValue;
            if (removedLength) {
                if (removedLength === 1 && !previousSelection.length) {
                    var deleteFromRight = previousSelection.start === selection.start;
                    cursorPosition = deleteFromRight
                        ? _this.getRightEditablePosition(selection.start)
                        : _this.getLeftEditablePosition(selection.start);
                }
                newValue = _this.clearRange(newValue, cursorPosition, removedLength);
            }
            newValue = _this.insertStringAtPosition(newValue, enteredString, cursorPosition);
            cursorPosition += formattedEnteredStringLength;
            if (cursorPosition >= mask.length) {
                cursorPosition = mask.length;
            }
            else if (cursorPosition < prefix.length &&
                !formattedEnteredStringLength) {
                cursorPosition = prefix.length;
            }
            else if (cursorPosition >= prefix.length &&
                cursorPosition < lastEditablePosition &&
                formattedEnteredStringLength) {
                cursorPosition = _this.getRightEditablePosition(cursorPosition);
            }
            newValue = _this.formatValue(newValue);
            return {
                value: newValue,
                enteredString: enteredString,
                selection: { start: cursorPosition, end: cursorPosition }
            };
        };
        this.maskOptions = parseMask(options);
    }
    return MaskUtils;
}());

function defer(fn) {
    return requestAnimationFrame(fn);
}
function cancelDefer(deferId) {
    cancelAnimationFrame(deferId);
}

function setInputSelection(input, start, end) {
    if (end === undefined) {
        end = start;
    }
    input.setSelectionRange(start, end);
}
function getInputSelection(input) {
    var start = input === null || input === void 0 ? void 0 : input.selectionStart;
    var end = input === null || input === void 0 ? void 0 : input.selectionEnd;
    return {
        start: start || null,
        end: end || null,
        length: end - start
    };
}
function isInputFocused(input) {
    var inputDocument = input.ownerDocument;
    return inputDocument.hasFocus() && inputDocument.activeElement === input;
}

function useInputElement(inputRef) {
    return React.useCallback(function () {
        var input = inputRef.current;
        var isDOMNode = typeof window !== "undefined" && isDOMElement(input);
        if (!input || !isDOMNode) {
            return null;
        }
        if (input.nodeName !== "INPUT") {
            var innerInput = input.querySelector("input");
            if (!innerInput) {
                if (typeof window !== "undefined") {
                    throw new Error("react-input-mask-ts: inputComponent must be rendered in DOM environment");
                }
                return;
            }
            input = innerInput;
        }
        if (!input) {
            throw new Error("react-input-mask-ts: inputComponent doesn't contain input node");
        }
        return input;
    }, [inputRef]);
}
function useDeferLoop(callback) {
    var deferIdRef = React.useRef(null);
    var runLoop = React.useCallback(function () {
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
    var stopLoop = React.useCallback(function () {
        cancelDefer(deferIdRef.current);
        deferIdRef.current = null;
    }, []);
    React.useEffect(function () {
        if (deferIdRef.current) {
            stopLoop();
            runLoop();
        }
    }, [runLoop, stopLoop]);
    React.useEffect(cancelDefer, []);
    return [runLoop, stopLoop];
}
function useSelection(inputRef, isMasked) {
    var selectionRef = React.useRef({ start: null, end: null });
    var getInputElement = useInputElement(inputRef);
    var getSelection = React.useCallback(function () {
        var input = getInputElement();
        return getInputSelection(input);
    }, [getInputElement]);
    var getLastSelection = React.useCallback(function () {
        return selectionRef.current;
    }, []);
    var setSelection = React.useCallback(function (selection) {
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
    var selectionLoop = React.useCallback(function () {
        selectionRef.current = getSelection();
    }, [getSelection]);
    var _a = useDeferLoop(selectionLoop), runSelectionLoop = _a[0], stopSelectionLoop = _a[1];
    React.useLayoutEffect(function () {
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
    var valueRef = React.useRef(initialValue);
    var getValue = React.useCallback(function () {
        var input = getInputElement();
        return input.value;
    }, [getInputElement]);
    var getLastValue = React.useCallback(function () {
        return valueRef.current;
    }, []);
    var setValue = React.useCallback(function (newValue) {
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
function useInputState(initialValue, isMasked, inputRef) {
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
function usePrevious(value) {
    var ref = React.useRef(false);
    React.useEffect(function () {
        ref.current = value;
    });
    return ref.current;
}

var __assign = (undefined && undefined.__assign) || function () {
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
var __rest = (undefined && undefined.__rest) || function (s, e) {
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
function InputMask(props) {
    var ref = props.ref, children = props.children, mask = props.mask, beforeMaskedStateChange = props.beforeMaskedStateChange, _a = props.alwaysShowMask, alwaysShowMask = _a === void 0 ? false : _a, _b = props.maskPlaceholder, maskPlaceholder = _b === void 0 ? '_' : _b, restProps = __rest(props, ["ref", "children", "mask", "beforeMaskedStateChange", "alwaysShowMask", "maskPlaceholder"]);
    var inputElementRef = React.useRef(null);
    React.useImperativeHandle(ref, function () { return inputElementRef.current; }, []);
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
    React.useLayoutEffect(function () {
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
        var onlyChild = React__namespace.Children.only(children);
        return React__namespace.cloneElement(onlyChild, __assign(__assign({}, inputProps), { 
            // @ts-ignore
            ref: inputElementRef }));
    }
    return jsxRuntime.jsx("input", __assign({ ref: inputElementRef, role: props.role || 'textbox' }, inputProps));
}

exports.InputMask = InputMask;
exports.default = InputMask;
//# sourceMappingURL=index.js.map
