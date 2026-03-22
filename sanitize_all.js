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

function sanitizeStr(str) {
  // Only allow alphanumeric, hyphens, underscores, and dots. Replace anything else with hyphen.
  // Also collapse multiple hyphens into one.
  return str.replace(/[^a-zA-Z0-9_.-]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/-\.png$/, '.png');
}

async function run() {
  const assetsDir = path.join(__dirname, 'assets');
  const productsDir = path.join(__dirname, 'public', 'products');
  let renamedFiles = 0;
  
  for (const dir of [assetsDir, productsDir]) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const clean = sanitizeStr(f).replace(/-_FINAL/g, '_FINAL');
        if (clean !== f) {
          fs.renameSync(path.join(dir, f), path.join(dir, clean));
          renamedFiles++;
        }
      }
    }
  }

  const products = await localPrisma.product.findMany();
  let dbUpdates = 0;
  
  for (const p of products) {
    if (p.imageUrl) {
      // imageUrl looks like "/products/ASRock-B760M-HDV:M.2-D4_FINAL.png"
      const prefix = "/products/";
      if (p.imageUrl.startsWith(prefix)) {
        const filename = p.imageUrl.slice(prefix.length);
        const cleanFilename = sanitizeStr(filename).replace(/-_FINAL/g, '_FINAL');
        const newUrl = prefix + cleanFilename;
        
        if (p.imageUrl !== newUrl) {
          await localPrisma.product.update({ where: { id: p.id }, data: { imageUrl: newUrl } });
          await remotePrisma.product.update({ where: { id: p.id }, data: { imageUrl: newUrl } });
          dbUpdates++;
        }
      }
    }
  }

  const seedPath = path.join(__dirname, 'prisma', 'seed.ts');
  if (fs.existsSync(seedPath)) {
    let seedContent = fs.readFileSync(seedPath, 'utf8');
    seedContent = seedContent.replace(/\/products\/([^"]+)/g, (match, filename) => {
       const clean = sanitizeStr(filename).replace(/-_FINAL/g, '_FINAL');
       return `/products/${clean}`;
    });
    fs.writeFileSync(seedPath, seedContent);
  }

  console.log(`Deep sanitization complete: Renamed ${renamedFiles} physical files & synced ${dbUpdates} DB strings.`);
}

run().catch(console.error).finally(() => {
  localPrisma.$disconnect();
  remotePrisma.$disconnect();
});
