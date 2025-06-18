import { FormEventHandler, HTMLProps, ReactElement, Ref } from 'react';

export type InputMaskProps = HTMLProps<HTMLInputElement> & {
    ref?: Ref<HTMLInputElement>;
    alwaysShowMask?: boolean;
    maskPlaceholder?: string | null;
    children?: ReactElement;
    mask: string | (string | RegExp)[];
    beforeMaskedStateChange?(props: { currentState?: MaskState,  previousState?: MaskState, nextState: MaskState }): MaskState;
}

export type MaskOptions = {
    maskPlaceholder: (string | RegExp | undefined | null)[] | undefined | null;
    mask: InputMaskProps['mask'] | null;
    prefix: string | null;
    lastEditablePosition: number | null,
    permanents: number[]
}

export type MaskState = {
    value: string;
    enteredString?: string;
    selection: {
        start: number | null;
        end: number | null;
        length?: number | null | undefined;
    };
}