import * as react_jsx_runtime from 'react/jsx-runtime';
import { HTMLProps, Ref, ReactElement } from 'react';

type InputMaskProps = HTMLProps<HTMLInputElement> & {
    ref?: Ref<HTMLInputElement>;
    alwaysShowMask?: boolean;
    maskPlaceholder?: string | null;
    children?: ReactElement;
    mask: string | (string | RegExp)[];
    beforeMaskedStateChange?(props: {
        currentState?: MaskState;
        previousState?: MaskState;
        nextState: MaskState;
    }): MaskState;
};
type MaskState = {
    value: string;
    enteredString?: string;
    selection: {
        start: number | null;
        end: number | null;
        length?: number | null | undefined;
    };
};

declare function InputMask(props: InputMaskProps): react_jsx_runtime.JSX.Element;

export { InputMask, InputMask as default };
