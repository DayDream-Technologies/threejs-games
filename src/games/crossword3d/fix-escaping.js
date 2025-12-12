const fs = require('fs');

const content = fs.readFileSync('wordLists.js', 'utf8');

// Replace all unescaped single quotes with escaped ones
// Looking for patterns like 'something's and replacing with 'something\'s
const fixed = content
  .replace(/animal's/g, "animal\\'s")
  .replace(/bird's/g, "bird\\'s")
  .replace(/fish's/g, "fish\\'s")
  .replace(/parent's/g, "parent\\'s")
  .replace(/person's/g, "person\\'s")
  .replace(/women's/g, "women\\'s")
  .replace(/one's/g, "one\\'s")
  .replace(/ending one's/g, "ending one\\'s")
  .replace(/legally taken as one's/g, "legally taken as one\\'s");

fs.writeFileSync('wordLists.js', fixed);
console.log('Fixed unescaped quotes in wordLists.js');
