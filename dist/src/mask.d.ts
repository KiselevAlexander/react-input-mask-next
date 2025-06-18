import { MaskState } from './types';
export default class MaskUtils {
    maskOptions: {
        maskPlaceholder: any;
        mask: any;
        permanents: any;
        prefix: any;
        lastEditablePosition: number | null;
    };
    constructor(options: any);
    isCharacterAllowedAtPosition: (character: string, position: number) => boolean;
    isCharacterFillingPosition: (character: string, position: number) => boolean;
    isPositionEditable: (position: number) => boolean;
    isValueEmpty: (value: any) => any;
    isValueFilled: (value: any) => boolean;
    getDefaultSelectionForValue: (value: any) => {
        start: number | null;
        end: number | null;
    };
    getFilledLength: (value: any) => number;
    getStringFillingLengthAtPosition: (string: any, position: number) => number;
    getLeftEditablePosition: (position: number) => number | null;
    getRightEditablePosition: (position: number) => number | null;
    formatValue: (value: any) => any;
    clearRange: (value: any, start: number, len: number) => any;
    insertCharacterAtPosition: (value: any, character: string, position: number) => any;
    insertStringAtPosition: (value: any, string: any, position: number) => any;
    processChange: (currentState: MaskState, previousState: MaskState) => {
        value: string;
        enteredString: string;
        selection: {
            start: number;
            end: number;
        };
    };
}
