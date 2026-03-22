require('dotenv').config({ path: '.env.remote' });
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const localAdapter = new PrismaLibSql({ url: 'file:./dev.db' });
const localPrisma = new PrismaClient({ adapter: localAdapter });

const remoteAdapter = new PrismaLibSql({ 
  url: process.env.TURSO_DATABASE_URL, 
  authToken: process.env.TURSO_AUTH_TOKEN 
});
const remotePrisma = new PrismaClient({ adapter: remoteAdapter });

async function run() {
  const productsDir = path.join(__dirname, 'public', 'products');
  if (!fs.existsSync(productsDir)) return;

  const files = fs.readdirSync(productsDir);
  let filesRenamed = 0;
  
  // 1. Rename files on disk
  for (const f of files) {
    if (f.includes(' ') || f.includes('(') || f.includes(')')) { // Sanitize everything robustly!
      const oldPath = path.join(productsDir, f);
      // Replace spaces, parens, etc. with hyphens
      const newFile = f.replace(/[\s\(\)]+/g, '-').replace(/-_FINAL/g, '_FINAL');
      const newPath = path.join(productsDir, newFile);
      fs.renameSync(oldPath, newPath);
      filesRenamed++;
    }
  }

  // 2. Update Local & Remote Databases
  const products = await localPrisma.product.findMany();
  let dbUpdates = 0;
  
  for (const p of products) {
    if (p.imageUrl && (p.imageUrl.includes(' ') || p.imageUrl.includes('(') || p.imageUrl.includes(')'))) {
      const newUrl = p.imageUrl.replace(/[\s\(\)]+/g, '-').replace(/-_FINAL/g, '_FINAL');
      
      await localPrisma.product.update({
        where: { id: p.id },
        data: { imageUrl: newUrl }
      });
      
      await remotePrisma.product.update({
        where: { id: p.id },
        data: { imageUrl: newUrl }
      });
      
      dbUpdates++;
    }
  }

  // 3. Update seed.ts
  const seedPath = path.join(__dirname, 'prisma', 'seed.ts');
  if (fs.existsSync(seedPath)) {
    let seedContent = fs.readFileSync(seedPath, 'utf8');
    seedContent = seedContent.replace(/\/products\/[^"]+/g, (match) => {
      if (match.includes(' ') || match.includes('(') || match.includes(')')) {
          return match.replace(/[\s\(\)]+/g, '-').replace(/-_FINAL/g, '_FINAL');
      }
      return match;
    });
    fs.writeFileSync(seedPath, seedContent);
  }

  console.log(`Renamed ${filesRenamed} files. Pushed ${dbUpdates} robustly sanitized URLs to local & cloud databases and patched seed.ts.`);
}

run().catch(console.error).finally(() => {
  localPrisma.$disconnect();
  remotePrisma.$disconnect();
});
