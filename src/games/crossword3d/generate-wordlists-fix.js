const fs = require('fs');
const path = require('path');

function readWords(filename) {
  const fullPath = path.join(__dirname, '../../..', filename);
  return fs.readFileSync(fullPath, 'utf8').split('\n').filter(l => l.trim()).map(line => {
    const [word, def] = line.split('; ');
    // Escape both backslashes and single quotes properly
    const escapedDef = def?.trim()
      .replace(/\\/g, '\\\\')  // Escape backslashes first
      .replace(/'/g, "\\'")    // Escape single quotes
      .replace(/"/g, '\\"');   // Escape double quotes
    return { word: word.trim().toUpperCase(), definition: escapedDef || '' };
  });
}

const words3 = readWords('words_3.txt');
const words4 = readWords('words_4.txt');
const words5 = readWords('words_5.txt');
const words6 = readWords('words_6.txt');
const words7 = readWords('words_7.txt');
const words8 = readWords('words_8.txt');
const words9 = readWords('words_9.txt');

// Generate the content with proper escaping
let content = `/**
 * Word lists for 3D Crossword Generator
 * Organized by word length with definitions
 * Definitions use pipes (|) instead of semicolons to avoid parsing conflicts
 */

// 3-letter words with definitions
export const WORDS_3 = [\n`;

words3.forEach((w, i) => {
  content += `  { word: '${w.word}', definition: '${w.definition}' }${i < words3.length - 1 ? ',' : ''}\n`;
});

content += `];\n\n// 4-letter words with definitions\nexport const WORDS_4 = [\n`;

words4.forEach((w, i) => {
  content += `  { word: '${w.word}', definition: '${w.definition}' }${i < words4.length - 1 ? ',' : ''}\n`;
});

content += `];\n\n// 5-letter words with definitions\nexport const WORDS_5 = [\n`;

words5.forEach((w, i) => {
  content += `  { word: '${w.word}', definition: '${w.definition}' }${i < words5.length - 1 ? ',' : ''}\n`;
});

content += `];\n\n// 6-letter words with definitions\nexport const WORDS_6 = [\n`;

words6.forEach((w, i) => {
  content += `  { word: '${w.word}', definition: '${w.definition}' }${i < words6.length - 1 ? ',' : ''}\n`;
});

content += `];\n\n// 7-letter words with definitions\nexport const WORDS_7 = [\n`;

words7.forEach((w, i) => {
  content += `  { word: '${w.word}', definition: '${w.definition}' }${i < words7.length - 1 ? ',' : ''}\n`;
});

content += `];\n\n// 8-letter words with definitions\nexport const WORDS_8 = [\n`;

words8.forEach((w, i) => {
  content += `  { word: '${w.word}', definition: '${w.definition}' }${i < words8.length - 1 ? ',' : ''}\n`;
});

content += `];\n\n// 9-letter words with definitions\nexport const WORDS_9 = [\n`;

words9.forEach((w, i) => {
  content += `  { word: '${w.word}', definition: '${w.definition}' }${i < words9.length - 1 ? ',' : ''}\n`;
});

content += `];\n\n/**\n * Get word list by length\n */\nexport function getWordsByLength(length) {\n  switch(length) {\n    case 3: return WORDS_3.map(w => w.word);\n    case 4: return WORDS_4.map(w => w.word);\n    case 5: return WORDS_5.map(w => w.word);\n    case 6: return WORDS_6.map(w => w.word);\n    case 7: return WORDS_7.map(w => w.word);\n    case 8: return WORDS_8.map(w => w.word);\n    case 9: return WORDS_9.map(w => w.word);\n    default: return WORDS_5.map(w => w.word);\n  }\n}\n\n/**\n * Get word definition\n */\nexport function getWordDefinition(word) {\n  const allWords = [\n    ...WORDS_3, ...WORDS_4, ...WORDS_5,\n    ...WORDS_6, ...WORDS_7, ...WORDS_8, ...WORDS_9\n  ];\n  const found = allWords.find(w => w.word === word.toUpperCase());\n  return found ? found.definition : 'Word definition not found';\n}\n\n/**\n * Get combined word list by difficulty\n */\nexport const WORD_LISTS = {\n  easy: WORDS_3.map(w => w.word),\n  medium: [...WORDS_4.map(w => w.word), ...WORDS_5.map(w => w.word)],\n  hard: [...WORDS_6.map(w => w.word), ...WORDS_7.map(w => w.word), ...WORDS_8.map(w => w.word), ...WORDS_9.map(w => w.word)]\n};\n`;

fs.writeFileSync(path.join(__dirname, 'wordLists.js'), content);
console.log('wordLists.js regenerated successfully');
console.log('Total words:', words3.length + words4.length + words5.length + words6.length + words7.length + words8.length + words9.length);
