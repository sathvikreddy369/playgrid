export const BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'bastard', 'slut', 'whore', 'motherfucker'
];

export const censorText = (text: string): string => {
  if (!text) return text;
  
  let censored = text;
  for (const word of BAD_WORDS) {
    // Case insensitive, word boundary matching
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    censored = censored.replace(regex, '***');
  }
  return censored;
};
