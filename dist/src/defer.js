export function defer(fn) {
    return requestAnimationFrame(fn);
}
export function cancelDefer(deferId) {
    cancelAnimationFrame(deferId);
}
//# sourceMappingURL=defer.js.map