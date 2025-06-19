![example workflow](https://github.com/KiselevAlexander/react-input-mask-ts/actions/workflows/npm-publish-github-packages.yml/badge.svg)

# React input mask TS

```sh
npm install react-input-mask-ts
```
```sh
yarn add react-input-mask-ts
```
```sh
pnpm add react-input-mask-ts
```


# Usage

```jsx
import React from 'react'
import InputMask from 'react-input-mask-ts'

function DateInput(props) {
  return (
    <InputMask
      mask="99/99/9999"
      onChange={props.onChange}
      value={props.value}
    />
  );
}
```


# Properties

|                           Name                            |               Type                | Default | Description                                                                                  |
| :-------------------------------------------------------: | :-------------------------------: | :-----: | :------------------------------------------------------------------------------------------- |
|                    **[`mask`](#mask)**                    | `{String\|Array<String, RegExp>}` |         | Mask format                                                                                  |
|         **[`maskPlaceholder`](#maskplaceholder)**         |            `{String}`             |   `_`   | Placeholder to cover unfilled parts of the mask                                              |
|          **[`alwaysShowMask`](#alwaysshowmask)**          |            `{Boolean}`            | `false` | Whether mask prefix and placeholder should be displayed when input is empty and has no focus |
| **[`beforeMaskedStateChange`](#beforemaskedstatechange)** |           `{Function}`            |         | Function to modify value and selection before applying mask                                  |
|                **[`children`](#children)**                |         `{ReactElement}`          |         | Custom render function for integration with other input components                           |



### `mask`

Mask format. Can be either a string or array of characters and regular expressions.<br /><br />

```jsx
<InputMask mask="99/99/99" />
```

Simple masks can be defined as strings. The following characters will define mask format:

| Character | Allowed input |
| :-------: | :-----------: |
|     9     |      0-9      |
|     a     |   a-z, A-Z    |
|    \*     | 0-9, a-z, A-Z |

Any format character can be escaped with a backslash.<br /><br />

More complex masks can be defined as an array of regular expressions and constant characters.

```jsx
// Canadian postal code mask
const firstLetter = /(?!.*[DFIOQU])[A-VXY]/i;
const letter = /(?!.*[DFIOQU])[A-Z]/i;
const digit = /[0-9]/;
const mask = [firstLetter, digit, letter, " ", digit, letter, digit];
return <InputMask mask={mask} />;
```

### `maskPlaceholder`

```jsx
// Will be rendered as 12/--/--
<InputMask mask="99/99/99" maskPlaceholder="-" value="12" />

// Will be rendered as 12/mm/yy
<InputMask mask="99/99/99" maskPlaceholder="dd/mm/yy" value="12" />

// Will be rendered as 12/
<InputMask mask="99/99/99" maskPlaceholder={null} value="12" />
```

Character or string to cover unfilled parts of the mask. Default character is "\_". If set to `null` or empty string, unfilled parts will be empty as in a regular input.

### `alwaysShowMask`

If enabled, mask prefix and placeholder will be displayed even when input is empty and has no focus.

### `beforeMaskedStateChange`

In case you need to customize masking behavior, you can provide `beforeMaskedStateChange` function to change masked value and cursor position before it's applied to the input.

It receieves an object with `previousState`, `currentState` and `nextState` properties. Each state is an object with `value` and `selection` properites where `value` is a string and selection is an object containing `start` and `end` positions of the selection.

1. **previousState:** Input state before change. Only defined on `change` event.
2. **currentState:** Current raw input state. Not defined during component render.
3. **nextState:** Input state with applied mask. Contains `value` and `selection` fields.

Selection positions will be `null` if input isn't focused and during rendering.

`beforeMaskedStateChange` must return a new state with `value` and `selection`.

```jsx
// Trim trailing slashes
function beforeMaskedStateChange({ nextState }) {
  let { value } = nextState;
  if (value.endsWith('/')) {
    value = value.slice(0, -1);
  }

  return {
    ...nextState,
    value
  };
}

return (
  <InputMask
    mask="99/99/99"
    maskPlaceholder={null}
    beforeMaskedStateChange={beforeMaskedStateChange}
  />
);
```

Please note that `beforeMaskedStateChange` executes more often than `onChange` and must be pure.

### `children`

To use another component instead of regular `<input />` provide it as children. The following properties, if used, should always be defined on the `InputMask` component itself: `onChange`, `onMouseDown`, `onFocus`, `onBlur`, `value`, `disabled`, `readOnly`.

```jsx
import React from 'react';
import InputMask from 'react-input-mask-ts';
import MaterialInput from '@material-ui/core/Input';

// Will work fine
function Input(props) {
  return (
    <InputMask mask="99/99/9999" value={props.value} onChange={props.onChange}>
      <MaterialInput type="tel" disableUnderline />
    </InputMask>
  );
}

// Will throw an error because InputMask's and children's onChange props aren't the same
function InvalidInput(props) {
  return (
    <InputMask mask="99/99/9999" value={props.value}>
      <MaterialInput type="tel" disableUnderline onChange={props.onChange} />
    </InputMask>
  );
}
```
