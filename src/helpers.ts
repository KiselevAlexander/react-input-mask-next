export function getElementDocument(element: any) {
  return element?.ownerDocument;
}

export function getElementWindow(element: any) {
  return getElementDocument(element)?.defaultView;
}

export function isDOMElement(element: any) {
  const elementWindow = getElementWindow(element);
  return !!elementWindow && element instanceof elementWindow.HTMLElement;
}

export function findLastIndex(array: any[], predicate: (x: any, i: number) => boolean) {
  for (let i = array.length - 1; i >= 0; i--) {
    const x = array[i];
    if (predicate(x, i)) {
      return i;
    }
  }
  return -1;
}

export function repeat(string: string, n = 1) {
  let result = "";
  for (let i = 0; i < n; i++) {
    result += string;
  }
  return result;
}

export function anyToString(value: any) {
  return `${value}`;
}
