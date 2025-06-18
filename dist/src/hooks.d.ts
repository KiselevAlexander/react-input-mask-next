import { RefObject } from "react";
import { MaskState } from './types';
export declare function useInputElement(inputRef: RefObject<HTMLInputElement>): () => HTMLInputElement | null | undefined;
export declare function useInputState(initialValue: string, isMasked: boolean, inputRef: RefObject<HTMLInputElement>): {
    inputRef: RefObject<HTMLInputElement>;
    getInputState: () => {
        value: string;
        selection: {
            start: number | null;
            end: number | null;
            length: number;
        };
    };
    getLastInputState: () => {
        value: string;
        selection: {
            start: number | null;
            end: number | null;
        };
    };
    setInputState: ({ value, selection }: MaskState) => void;
};
export declare function usePrevious(value: boolean): boolean;
