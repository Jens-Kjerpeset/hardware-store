require('dotenv').config({ path: '.env.remote' });
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

// 1. Local Database
const localAdapter = new PrismaLibSql({ url: 'file:./dev.db' });
const localPrisma = new PrismaClient({ adapter: localAdapter });

// 2. Remote Database
const remoteAdapter = new PrismaLibSql({ 
  url: process.env.TURSO_DATABASE_URL, 
  authToken: process.env.TURSO_AUTH_TOKEN 
});
const remotePrisma = new PrismaClient({ adapter: remoteAdapter });

async function run() {
  if (!process.env.TURSO_DATABASE_URL) {
    console.error('Remote credentials missing');
    process.exit(1);
  }

  // Fetch fully mapped local products
  const localProducts = await localPrisma.product.findMany();
  let updated = 0;

  for (const localP of localProducts) {
    if (localP.imageUrl) {
       // Force update the remote product's imageUrl to match the local perfectly-mapped, _FINAL.png suffixed URL
       await remotePrisma.product.updateMany({
         where: { name: localP.name },
         data: { imageUrl: localP.imageUrl }
       });
       updated++;
    }
  }

  console.log(`Successfully mirrored ${updated} exact image URLs from Local to Production Cloud DB!`);
}

run().catch(console.error).finally(() => {
  localPrisma.$disconnect();
  remotePrisma.$disconnect();
});
