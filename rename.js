const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /\bGrounds\b/g, to: 'Venues' },
  { from: /\bgrounds\b/g, to: 'venues' },
  { from: /\bGROUNDS\b/g, to: 'VENUES' },
  { from: /\bGround\b/g, to: 'Venue' },
  { from: /\bground\b/g, to: 'venue' },
  { from: /\bGROUND\b/g, to: 'VENUE' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file === '.git' || file === 'migrations') continue;
    
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (
      fullPath.endsWith('.ts') || 
      fullPath.endsWith('.tsx') || 
      fullPath.endsWith('.js') || 
      fullPath.endsWith('.md') ||
      fullPath.endsWith('.prisma') ||
      fullPath.endsWith('.json') ||
      fullPath.endsWith('.html') ||
      fullPath.endsWith('.css')
    ) {
      if (fullPath.includes('package-lock.json')) continue;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      for (const { from, to } of replacements) {
        newContent = newContent.replace(from, to);
      }
      
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(__dirname);
