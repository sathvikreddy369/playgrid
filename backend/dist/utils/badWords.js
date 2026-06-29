"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.censorText = exports.BAD_WORDS = void 0;
exports.BAD_WORDS = [
    'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'bastard', 'slut', 'whore', 'motherfucker'
];
const censorText = (text) => {
    if (!text)
        return text;
    let censored = text;
    for (const word of exports.BAD_WORDS) {
        // Case insensitive, word boundary matching
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        censored = censored.replace(regex, '***');
    }
    return censored;
};
exports.censorText = censorText;
//# sourceMappingURL=badWords.js.map