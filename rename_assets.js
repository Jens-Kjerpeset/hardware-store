const fs = require('fs');
const path = require('path');

async function run() {
  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) return;

  const files = fs.readdirSync(assetsDir);
  let filesRenamed = 0;
  
  for (const f of files) {
    if (f.includes(' ') || f.includes('(') || f.includes(')')) {
      const oldPath = path.join(assetsDir, f);
      const newFile = f.replace(/[\s\(\)]+/g, '-');
      // If we accidentally ended up with a trailing hyphen before the extension, clean it up:
      const cleanNewFile = newFile.replace(/-\.png$/, '.png');
      const newPath = path.join(assetsDir, cleanNewFile);
      
      fs.renameSync(oldPath, newPath);
      filesRenamed++;
    }
  }

  console.log(`Successfully sanitized ${filesRenamed} files in the assets/ directory by stripping spaces and parentheses!`);
}

run().catch(console.error);
