const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function renameInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file === '.git' || file === 'migrations') continue;
    
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      renameInDir(fullPath);
    }
    
    // Rename files
    if (file.includes('Ground') || file.includes('ground')) {
      let newName = file;
      newName = newName.replace('Grounds', 'Venues');
      newName = newName.replace('grounds', 'venues');
      newName = newName.replace('Ground', 'Venue');
      newName = newName.replace('ground', 'venue');
      
      const newPath = path.join(dir, newName);
      console.log(`Renaming ${fullPath} -> ${newPath}`);
      execSync(`git mv "${fullPath}" "${newPath}"`);
    }
  }
}

renameInDir(__dirname);
