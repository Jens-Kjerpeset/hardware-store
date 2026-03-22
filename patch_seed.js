const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'prisma', 'seed.ts');
const content = fs.readFileSync(seedPath, 'utf8');

const lines = content.split('\n');
let currentName = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Try to extract name
  const nameMatch = line.match(/name:\s*"([^"]+)"/);
  if (nameMatch) {
    currentName = nameMatch[1];
  }

  // If we hit imageUrl and we have a currentName
  if (line.includes('imageUrl: "/placeholder.svg"') && currentName) {
    lines[i] = line.replace('"/placeholder.svg"', `"/products/${currentName}.png"`);
    currentName = null; // reset to avoid accidental re-replacements
  }
}

fs.writeFileSync(seedPath, lines.join('\n'));
console.log('Successfully patched seed.ts');
