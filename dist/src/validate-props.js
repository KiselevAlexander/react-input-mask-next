import invariant from "invariant";
import warning from "warning";
import { CONTROLLED_PROPS } from "./constants";
import * as React from 'react';
export function validateMaxLength(props) {
    warning(!props.maxLength || !props.mask, "react-input-mask-ts: maxLength property shouldn't be passed to the masked input. It breaks masking and unnecessary because length is limited by the mask length.");
}
export function validateMaskPlaceholder(props) {
    var mask = props.mask, maskPlaceholder = props.maskPlaceholder;
    invariant(!mask ||
        !maskPlaceholder ||
        maskPlaceholder.length === 1 ||
        maskPlaceholder.length === mask.length, "react-input-mask-ts: maskPlaceholder should either be a single character or have the same length as the mask:\n" +
        "mask: ".concat(mask, "\n") +
        "maskPlaceholder: ".concat(maskPlaceholder));
}
export function validateChildren(props, children) {
    var inputElement = React.Children.only(children);
    var conflictProps = CONTROLLED_PROPS.filter(function (propId) {
        return inputElement.props[propId] != null &&
            propId in props &&
            inputElement.props[propId] !== props[propId];
    });
    invariant(!conflictProps.length, "react-input-mask-ts: the following props should be passed to the InputMask component, not to children: ".concat(conflictProps.join(",")));
}
//# sourceMappingURL=validate-props.js.map