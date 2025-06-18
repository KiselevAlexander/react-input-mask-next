import { defaultFormatChars } from "./constants";
export default function (_a) {
    var mask = _a.mask, maskPlaceholder = _a.maskPlaceholder;
    var permanents = [];
    if (!mask) {
        return {
            maskPlaceholder: null,
            mask: null,
            prefix: null,
            lastEditablePosition: null,
            permanents: []
        };
    }
    if (typeof mask === "string") {
        var isPermanent_1 = false;
        var parsedMaskString_1 = "";
        mask.split("").forEach(function (character) {
            if (!isPermanent_1 && character === "\\") {
                isPermanent_1 = true;
            }
            else {
                if (isPermanent_1 || !defaultFormatChars[character]) {
                    permanents.push(parsedMaskString_1.length);
                }
                parsedMaskString_1 += character;
                isPermanent_1 = false;
            }
        });
        mask = parsedMaskString_1.split("").map(function (character, index) {
            if (permanents.indexOf(index) === -1) {
                return defaultFormatChars[character];
            }
            return character;
        });
    }
    else {
        mask.forEach(function (character, index) {
            if (typeof character === "string") {
                permanents.push(index);
            }
        });
    }
    if (maskPlaceholder) {
        if (maskPlaceholder.length === 1) {
            maskPlaceholder = mask.map(function (character, index) {
                if (permanents.indexOf(index) !== -1) {
                    return character;
                }
                return maskPlaceholder;
            });
        }
        else {
            maskPlaceholder = maskPlaceholder.split("");
        }
        permanents.forEach(function (position) {
            maskPlaceholder[position] = mask[position];
        });
        maskPlaceholder = maskPlaceholder.join("");
    }
    var prefix = permanents
        .filter(function (position, index) { return position === index; })
        .map(function (position) { return mask[position]; })
        .join("");
    var lastEditablePosition = mask.length - 1;
    while (permanents.indexOf(lastEditablePosition) !== -1) {
        lastEditablePosition--;
    }
    return {
        maskPlaceholder: maskPlaceholder,
        prefix: prefix,
        mask: mask,
        lastEditablePosition: lastEditablePosition,
        permanents: permanents
    };
}
//# sourceMappingURL=parse-mask.js.map