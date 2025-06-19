import { InputMaskProps, MaskState } from './types';
import {
    ChangeEvent,
    MouseEvent,
    RefObject,
    FocusEvent,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    ReactElement,
} from 'react';
import { validateChildren, validateMaskPlaceholder, validateMaxLength } from './validate-props';
import MaskUtils from './mask';
import { useInputElement, useInputState, usePrevious } from './hooks';
import { getElementDocument, anyToString } from './helpers';
import * as React from 'react';
import { defer } from './defer';
import { isInputFocused } from './input';

export function InputMask(props: InputMaskProps) {
    const {
        ref,
        children,
        mask,
        beforeMaskedStateChange,
        alwaysShowMask = false,
        maskPlaceholder = '_',
        ...restProps
    } = props;
    const inputElementRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(ref, () => inputElementRef.current!, []);
    
    validateMaxLength(props);
    validateMaskPlaceholder(props);
    
    const maskUtils = new MaskUtils({ mask, maskPlaceholder });
    const isMasked = !!mask;
    const isEditable = !restProps.disabled && !restProps.readOnly;
    const isControlled = props.value !== null && props.value !== undefined;
    const previousIsMasked = usePrevious(isMasked);
    const initialValue = anyToString(
        (isControlled ? props.value : props.defaultValue) || "",
    );
    const { getInputState, setInputState, getLastInputState } = useInputState(
        initialValue,
        isMasked,
        inputElementRef as RefObject<HTMLInputElement>,
    );
    const getInputElement = useInputElement(inputElementRef as RefObject<HTMLInputElement>);
    
    
    function onChange(event: ChangeEvent<HTMLInputElement>) {
        const currentState = getInputState();
        const previousState = getLastInputState();
        
        let newInputState: MaskState = maskUtils.processChange(currentState, previousState)!;
        
        if (beforeMaskedStateChange) {
            newInputState = beforeMaskedStateChange({
                currentState,
                previousState,
                nextState: newInputState!
            });
        }
        
        setInputState(newInputState);
        
        if (props.onChange) {
            props.onChange(event);
        }
    }
    
    function onFocus(event: FocusEvent<HTMLInputElement>) {
        // If autoFocus property is set, focus event fires before the ref handler gets called
        if (!inputElementRef.current) {
            inputElementRef.current = event.target;
        }
        
        const currentValue = getInputState().value;
        
        if (isMasked && !maskUtils.isValueFilled(currentValue)) {
            let newValue = maskUtils.formatValue(currentValue);
            const newSelection = maskUtils.getDefaultSelectionForValue(newValue);
            let newInputState: MaskState = {
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
            defer(() => {
                setInputState(getLastInputState());
            });
        }
        
        if (props.onFocus) {
            props.onFocus(event);
        }
    }
    
    function onBlur(event: React.FocusEvent<HTMLInputElement>) {
        const currentValue = getInputState().value;
        const lastValue = getLastInputState().value;
        
        if (isMasked && !alwaysShowMask && maskUtils.isValueEmpty(lastValue)) {
            let newValue = "";
            let newInputState: MaskState = {
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
    function onMouseDown(event: MouseEvent<HTMLInputElement>) {
        const input = getInputElement();
        if (!input) {
            return;
        }
        const { value } = getInputState();
        const inputDocument = getElementDocument(input);
        
        if (!isInputFocused(input) && !maskUtils.isValueFilled(value)) {
            const mouseDownX = event.clientX;
            const mouseDownY = event.clientY;
            const mouseDownTime = new Date().getTime();
            
            const mouseUpHandler = (mouseUpEvent: MouseEvent<HTMLInputElement>) => {
                inputDocument.removeEventListener("mouseup", mouseUpHandler);
                
                if (!isInputFocused(input)) {
                    return;
                }
                
                const deltaX = Math.abs(mouseUpEvent.clientX - mouseDownX);
                const deltaY = Math.abs(mouseUpEvent.clientY - mouseDownY);
                const axisDelta = Math.max(deltaX, deltaY);
                const timeDelta = new Date().getTime() - mouseDownTime;
                
                if (
                    (axisDelta <= 10 && timeDelta <= 200) ||
                    (axisDelta <= 5 && timeDelta <= 300)
                ) {
                    const lastState = getLastInputState();
                    const newSelection = maskUtils.getDefaultSelectionForValue(
                        lastState.value,
                    );
                    const newState = {
                        ...lastState,
                        selection: newSelection,
                    };
                    setInputState(newState);
                }
            };
            
            inputDocument.addEventListener("mouseup", mouseUpHandler);
        }
        
        if (props.onMouseDown) {
            props.onMouseDown(event);
        }
    }
    
    // For controlled inputs we want to provide properly formatted
    // value prop
    if (isMasked && isControlled) {
        const input = getInputElement();
        const isFocused = input && isInputFocused(input);
        let newValue =
            isFocused || alwaysShowMask || props.value
                ? maskUtils.formatValue(props.value)
                : props.value;
        
        if (beforeMaskedStateChange) {
            newValue = beforeMaskedStateChange({
                nextState: {
                    value: newValue as string,
                    selection:
                        {
                            start: null,
                            end: null,
                        },
                },
            }).value;
        }
        
        setInputState({
            ...getLastInputState(),
            value: newValue as string,
        });
    }
    
    const lastState = getLastInputState();
    const lastSelection = lastState.selection;
    const lastValue = lastState.value;
    
    useLayoutEffect(() => {
        if (!isMasked) {
            return;
        }
        
        const input = getInputElement();
        if (!input) {
            return;
        }
        const isFocused = isInputFocused(input);
        const previousSelection = lastSelection;
        const currentState = getInputState();
        let newInputState: MaskState = { ...currentState };
        
        // Update value for uncontrolled inputs to make sure
        // it's always in sync with mask props
        if (!isControlled) {
            const currentValue = currentState.value;
            const formattedValue = maskUtils.formatValue(currentValue);
            const isValueEmpty = maskUtils.isValueEmpty(formattedValue);
            const shouldFormatValue = !isValueEmpty || isFocused || alwaysShowMask;
            if (shouldFormatValue) {
                newInputState.value = formattedValue;
            } else if (isValueEmpty && !isFocused) {
                newInputState.value = "";
            }
        }
        
        if (isFocused && !previousIsMasked) {
            // Adjust selection if input got masked while being focused
            newInputState.selection = maskUtils.getDefaultSelectionForValue(
                newInputState.value,
            );
        } else if (isControlled && isFocused && previousSelection) {
            // Restore cursor position if value has changed outside change event
            if (previousSelection.start !== null && previousSelection.end !== null) {
                newInputState.selection = previousSelection;
            }
        }
        
        if (beforeMaskedStateChange) {
            newInputState = beforeMaskedStateChange({
                currentState,
                nextState: newInputState,
            });
        }
        
        setInputState(newInputState);
    });
    
    const inputProps = {
        ...restProps,
        onFocus,
        onBlur,
        onChange: isMasked && isEditable ? onChange : props.onChange,
        onMouseDown: isMasked && isEditable ? onMouseDown : props.onMouseDown,
        value: isMasked && isControlled ? lastValue : props.value,
    };
    
    if (children) {
        validateChildren(props, children);
        
        const onlyChild = React.Children.only(children) as ReactElement<HTMLInputElement>;
        
        return React.cloneElement(onlyChild, {
            ...inputProps,
            // @ts-ignore
            ref: inputElementRef,
        });
    }
    
    return <input ref={ inputElementRef } role={props.role || 'textbox'} { ...inputProps } />;
}

export default InputMask;