import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';

const files = globSync('src/**/*.tsx');

let changedFiles = 0;
for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  // Match dark: followed by word characters, dashes, and optionally square brackets (e.g., dark:bg-[#123])
  const newContent = content.replace(/dark:[^\s"']+/g, '');
  
  if (newContent !== content) {
    // Also clean up any double spaces left behind
    const finalContent = newContent.replace(/  +/g, ' ');
    writeFileSync(file, finalContent);
    changedFiles++;
    console.log(`Updated ${file}`);
  }
}
console.log(`Removed dark classes from ${changedFiles} files.`);
