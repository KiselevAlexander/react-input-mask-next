import invariant from "invariant";
import warning from "warning";
import { CONTROLLED_PROPS } from "./constants";
import { InputMaskProps } from './types';
import { ReactElement } from 'react';

export function validateMaxLength(props: InputMaskProps) {
    warning(
        !props.maxLength || !props.mask,
        "react-input-mask-ts: maxLength property shouldn't be passed to the masked input. It breaks masking and unnecessary because length is limited by the mask length.",
    );
}

export function validateMaskPlaceholder(props: InputMaskProps) {
    const { mask, maskPlaceholder } = props;
    
    invariant(
        !mask ||
        !maskPlaceholder ||
        maskPlaceholder.length === 1 ||
        maskPlaceholder.length === mask.length,
        "react-input-mask-ts: maskPlaceholder should either be a single character or have the same length as the mask:\n" +
        `mask: ${ mask }\n` +
        `maskPlaceholder: ${ maskPlaceholder }`,
    );
}

export function validateChildren(props: InputMaskProps, inputElement: ReactElement<any>) {
    const conflictProps = CONTROLLED_PROPS.filter(
        (propId: string) =>
            inputElement.props[propId] != null &&
            propId in props &&
            inputElement.props[propId] !== props[propId as keyof InputMaskProps],
    );
    
    invariant(
        !conflictProps.length,
        `react-input-mask-ts: the following props should be passed to the InputMask component, not to children: ${ conflictProps.join(
            ",",
        ) }`,
    );
}
