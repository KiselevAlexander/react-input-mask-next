export function setInputSelection(input, start, end) {
    if (end === undefined) {
        end = start;
    }
    input.setSelectionRange(start, end);
}
export function getInputSelection(input) {
    var start = input === null || input === void 0 ? void 0 : input.selectionStart;
    var end = input === null || input === void 0 ? void 0 : input.selectionEnd;
    return {
        start: start || null,
        end: end || null,
        length: end - start
    };
}
export function isInputFocused(input) {
    var inputDocument = input.ownerDocument;
    return inputDocument.hasFocus() && inputDocument.activeElement === input;
}
//# sourceMappingURL=input.js.map