require('dotenv').config({ path: '.env.remote' });
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing remote credentials!");
  process.exit(1);
}

const adapter = new PrismaLibSql({ url, authToken });
const prisma = new PrismaClient({ adapter });

async function run() {
  const products = await prisma.product.findMany();
  let updated = 0;
  
  for (const p of products) {
    if (p.imageUrl) {
        // Strip out any trailing markers to get the pure base string, then append our exact production bundle suffix
        const rawName = p.imageUrl.replace('_v2.png', '.png').replace('_v3.png', '.png').replace('_v2.avif', '.png').replace('.avif', '.png').replace('.webp', '.png');
        
        let newUrl = rawName;
        if (!newUrl.includes('_FINAL.')) {
            newUrl = newUrl.replace('.png', '_FINAL.png');
        }

        if (p.imageUrl !== newUrl) {
          await prisma.product.update({
            where: { id: p.id },
            data: { imageUrl: newUrl }
          });
          updated++;
          console.log(`Cloud update: ${newUrl}`);
        }
    }
  }
  
  // Apply our specific Cosmos spelling fix that we patched locally earlier!
  await prisma.product.updateMany({
    where: { name: 'Cosair CX650M' },
    data: { name: 'Corsair CX650M' }
  });

  console.log(`Successfully hard-patched ${updated} production cloud DB rows to match the Vercel deployed file tree.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
