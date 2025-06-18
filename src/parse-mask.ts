import { defaultFormatChars } from "./constants";

export default function({ mask, maskPlaceholder }: any) {
    const permanents: any = [];
    
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
        let isPermanent = false;
        let parsedMaskString = "";
        mask.split("").forEach(character => {
            if (!isPermanent && character === "\\") {
                isPermanent = true;
            } else {
                if (isPermanent || !defaultFormatChars[character]) {
                    permanents.push(parsedMaskString.length);
                }
                parsedMaskString += character;
                isPermanent = false;
            }
        });
        
        mask = parsedMaskString.split("").map((character, index) => {
            if (permanents.indexOf(index) === -1) {
                return defaultFormatChars[character];
            }
            return character;
        });
    } else {
        mask.forEach((character: string, index: number) => {
            if (typeof character === "string") {
                permanents.push(index);
            }
        });
    }
    
    if (maskPlaceholder) {
        if (maskPlaceholder.length === 1) {
            maskPlaceholder = mask.map((character: string, index: number) => {
                if (permanents.indexOf(index) !== -1) {
                    return character;
                }
                return maskPlaceholder;
            });
        } else {
            maskPlaceholder = maskPlaceholder.split("");
        }
        
        permanents.forEach((position: number) => {
            maskPlaceholder[position] = mask[position];
        });
        
        maskPlaceholder = maskPlaceholder.join("");
    }
    
    const prefix = permanents
        .filter((position: number, index: number) => position === index)
        .map((position: number) => mask[position])
        .join("");
    
    let lastEditablePosition = mask.length - 1;
    while (permanents.indexOf(lastEditablePosition) !== -1) {
        lastEditablePosition--;
    }
    
    return {
        maskPlaceholder,
        prefix,
        mask,
        lastEditablePosition,
        permanents
    };
}
