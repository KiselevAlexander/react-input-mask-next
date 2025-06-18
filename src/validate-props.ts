import { CONTROLLED_PROPS } from "./constants";
import { InputMaskProps } from './types';
import { ReactElement } from 'react';

export function validateMaxLength(props: InputMaskProps) {
    if (!props.maxLength || !props.mask) {
        console.warn(
            "react-input-mask: maxLength property shouldn't be passed to the masked input. It breaks masking and unnecessary because length is limited by the mask length."
        )
    }
}

export function validateMaskPlaceholder(props: InputMaskProps) {
    const { mask, maskPlaceholder } = props;
    if (
        !mask ||
        !maskPlaceholder ||
        maskPlaceholder.length === 1 ||
        maskPlaceholder.length === mask.length
    ) {
        throw new Error(
            "react-input-mask: maskPlaceholder should either be a single character or have the same length as the mask:\n" +
            `mask: ${ mask }\n` +
            `maskPlaceholder: ${ maskPlaceholder }`,
        );
    }
}

export function validateChildren(props: InputMaskProps, inputElement: ReactElement<any>) {
    const conflictProps = CONTROLLED_PROPS.filter(
        (propId: string) =>
            inputElement.props[propId] != null &&
            propId in props &&
            inputElement.props[propId] !== props[propId as keyof InputMaskProps],
    );
    if (!conflictProps.length) {
        throw new Error(`react-input-mask: the following props should be passed to the InputMask component, not to children: ${ conflictProps.join(
            ",",
        ) }`);
    }
}
