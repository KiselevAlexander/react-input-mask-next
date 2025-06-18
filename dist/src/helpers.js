export function getElementDocument(element) {
    return element === null || element === void 0 ? void 0 : element.ownerDocument;
}
export function getElementWindow(element) {
    var _a;
    return (_a = getElementDocument(element)) === null || _a === void 0 ? void 0 : _a.defaultView;
}
export function isDOMElement(element) {
    var elementWindow = getElementWindow(element);
    return !!elementWindow && element instanceof elementWindow.HTMLElement;
}
export function findLastIndex(array, predicate) {
    for (var i = array.length - 1; i >= 0; i--) {
        var x = array[i];
        if (predicate(x, i)) {
            return i;
        }
    }
    return -1;
}
export function repeat(string, n) {
    if (n === void 0) { n = 1; }
    var result = "";
    for (var i = 0; i < n; i++) {
        result += string;
    }
    return result;
}
export function anyToString(value) {
    return "".concat(value);
}
//# sourceMappingURL=helpers.js.map