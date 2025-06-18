/* eslint no-use-before-define: ["error", { functions: false }] */
import { findLastIndex, repeat } from "./helpers";
import parseMask from "./parse-mask";
var MaskUtils = /** @class */ (function () {
    function MaskUtils(options) {
        var _this = this;
        this.isCharacterAllowedAtPosition = function (character, position) {
            var maskPlaceholder = _this.maskOptions.maskPlaceholder;
            if (_this.isCharacterFillingPosition(character, position)) {
                return true;
            }
            if (!maskPlaceholder) {
                return false;
            }
            return maskPlaceholder[position] === character;
        };
        this.isCharacterFillingPosition = function (character, position) {
            var mask = _this.maskOptions.mask;
            if (!character || position >= mask.length) {
                return false;
            }
            if (!_this.isPositionEditable(position)) {
                return mask[position] === character;
            }
            var charRule = mask[position];
            return new RegExp(charRule).test(character);
        };
        this.isPositionEditable = function (position) {
            var _a = _this.maskOptions, mask = _a.mask, permanents = _a.permanents;
            return position < mask.length && permanents.indexOf(position) === -1;
        };
        this.isValueEmpty = function (value) {
            return value.split("").every(function (character, position) {
                return (!_this.isPositionEditable(position) ||
                    !_this.isCharacterFillingPosition(character, position));
            });
        };
        this.isValueFilled = function (value) {
            return (_this.getFilledLength(value) === (_this.maskOptions.lastEditablePosition || 0) + 1);
        };
        this.getDefaultSelectionForValue = function (value) {
            var filledLength = _this.getFilledLength(value);
            var cursorPosition = _this.getRightEditablePosition(filledLength);
            return { start: cursorPosition, end: cursorPosition };
        };
        this.getFilledLength = function (value) {
            var characters = value.split("");
            var lastFilledIndex = findLastIndex(characters, function (character, position) {
                return (_this.isPositionEditable(position) &&
                    _this.isCharacterFillingPosition(character, position));
            });
            return lastFilledIndex + 1;
        };
        this.getStringFillingLengthAtPosition = function (string, position) {
            var characters = string.split("");
            var insertedValue = characters.reduce(function (value, character) {
                return _this.insertCharacterAtPosition(value, character, value.length);
            }, repeat(" ", position));
            return insertedValue.length - position;
        };
        this.getLeftEditablePosition = function (position) {
            for (var i = position; i >= 0; i--) {
                if (_this.isPositionEditable(i)) {
                    return i;
                }
            }
            return null;
        };
        this.getRightEditablePosition = function (position) {
            var mask = _this.maskOptions.mask;
            for (var i = position; i < mask.length; i++) {
                if (_this.isPositionEditable(i)) {
                    return i;
                }
            }
            return null;
        };
        this.formatValue = function (value) {
            var _a = _this.maskOptions, maskPlaceholder = _a.maskPlaceholder, mask = _a.mask;
            if (!maskPlaceholder) {
                value = _this.insertStringAtPosition("", value, 0);
                while (value.length < mask.length &&
                    !_this.isPositionEditable(value.length)) {
                    value += mask[value.length];
                }
                return value;
            }
            return _this.insertStringAtPosition(maskPlaceholder, value, 0);
        };
        this.clearRange = function (value, start, len) {
            if (!len) {
                return value;
            }
            var end = start + len;
            var _a = _this.maskOptions, maskPlaceholder = _a.maskPlaceholder, mask = _a.mask;
            var clearedValue = value
                .split("")
                .map(function (character, i) {
                var isEditable = _this.isPositionEditable(i);
                if (!maskPlaceholder && i >= end && !isEditable) {
                    return "";
                }
                if (i < start || i >= end) {
                    return character;
                }
                if (!isEditable) {
                    return mask[i];
                }
                if (maskPlaceholder) {
                    return maskPlaceholder[i];
                }
                return "";
            })
                .join("");
            return _this.formatValue(clearedValue);
        };
        this.insertCharacterAtPosition = function (value, character, position) {
            var _a = _this.maskOptions, mask = _a.mask, maskPlaceholder = _a.maskPlaceholder;
            if (position >= mask.length) {
                return value;
            }
            var isAllowed = _this.isCharacterAllowedAtPosition(character, position);
            var isEditable = _this.isPositionEditable(position);
            var nextEditablePosition = _this.getRightEditablePosition(position);
            var isNextPlaceholder = maskPlaceholder && nextEditablePosition
                ? character === maskPlaceholder[nextEditablePosition]
                : null;
            var valueBefore = value.slice(0, position);
            if (isAllowed || !isEditable) {
                var insertedCharacter = isAllowed ? character : mask[position];
                value = valueBefore + insertedCharacter;
            }
            if (!isAllowed && !isEditable && !isNextPlaceholder) {
                value = _this.insertCharacterAtPosition(value, character, position + 1);
            }
            return value;
        };
        this.insertStringAtPosition = function (value, string, position) {
            var _a = _this.maskOptions, mask = _a.mask, maskPlaceholder = _a.maskPlaceholder;
            if (!string || position >= mask.length) {
                return value;
            }
            var characters = string.split("");
            var isFixedLength = _this.isValueFilled(value) || !!maskPlaceholder;
            var valueAfter = value.slice(position);
            value = characters.reduce(function (value, character) {
                return _this.insertCharacterAtPosition(value, character, value.length);
            }, value.slice(0, position));
            if (isFixedLength) {
                value += valueAfter.slice(value.length - position);
            }
            else if (_this.isValueFilled(value)) {
                value += mask.slice(value.length).join("");
            }
            else {
                var editableCharactersAfter = valueAfter
                    .split("")
                    .filter(function (character, i) {
                    return _this.isPositionEditable(position + i);
                });
                value = editableCharactersAfter.reduce(function (value, character) {
                    var nextEditablePosition = _this.getRightEditablePosition(value.length);
                    if (nextEditablePosition === null) {
                        return value;
                    }
                    if (!_this.isPositionEditable(value.length)) {
                        value += mask.slice(value.length, nextEditablePosition).join("");
                    }
                    return _this.insertCharacterAtPosition(value, character, value.length);
                }, value);
            }
            return value;
        };
        this.processChange = function (currentState, previousState) {
            var _a = _this.maskOptions, mask = _a.mask, prefix = _a.prefix, lastEditablePosition = _a.lastEditablePosition;
            var value = currentState.value, selection = currentState.selection;
            var previousValue = previousState.value;
            var previousSelection = previousState.selection;
            var newValue = value;
            var enteredString = "";
            var formattedEnteredStringLength = 0;
            var removedLength = 0;
            var cursorPosition = Math.min(previousSelection.start, selection.start);
            if (selection.end > previousSelection.start) {
                enteredString = newValue.slice(previousSelection.start, selection.end);
                formattedEnteredStringLength = _this.getStringFillingLengthAtPosition(enteredString, cursorPosition);
                if (!formattedEnteredStringLength) {
                    removedLength = 0;
                }
                else {
                    removedLength = previousSelection.length;
                }
            }
            else if (newValue.length < previousValue.length) {
                removedLength = previousValue.length - newValue.length;
            }
            newValue = previousValue;
            if (removedLength) {
                if (removedLength === 1 && !previousSelection.length) {
                    var deleteFromRight = previousSelection.start === selection.start;
                    cursorPosition = deleteFromRight
                        ? _this.getRightEditablePosition(selection.start)
                        : _this.getLeftEditablePosition(selection.start);
                }
                newValue = _this.clearRange(newValue, cursorPosition, removedLength);
            }
            newValue = _this.insertStringAtPosition(newValue, enteredString, cursorPosition);
            cursorPosition += formattedEnteredStringLength;
            if (cursorPosition >= mask.length) {
                cursorPosition = mask.length;
            }
            else if (cursorPosition < prefix.length &&
                !formattedEnteredStringLength) {
                cursorPosition = prefix.length;
            }
            else if (cursorPosition >= prefix.length &&
                cursorPosition < lastEditablePosition &&
                formattedEnteredStringLength) {
                cursorPosition = _this.getRightEditablePosition(cursorPosition);
            }
            newValue = _this.formatValue(newValue);
            return {
                value: newValue,
                enteredString: enteredString,
                selection: { start: cursorPosition, end: cursorPosition }
            };
        };
        this.maskOptions = parseMask(options);
    }
    return MaskUtils;
}());
export default MaskUtils;
//# sourceMappingURL=mask.js.map