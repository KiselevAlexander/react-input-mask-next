export declare function setInputSelection(input: HTMLInputElement, start: number | null, end: number | null): void;
export declare function getInputSelection(input: HTMLInputElement | null): {
    start: number | null;
    end: number | null;
    length: number;
};
export declare function isInputFocused(input: HTMLInputElement): boolean;
