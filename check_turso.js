require('dotenv').config({ path: '.env.remote' });
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const remoteAdapter = new PrismaLibSql({ 
  url: process.env.TURSO_DATABASE_URL, 
  authToken: process.env.TURSO_AUTH_TOKEN 
});
const remotePrisma = new PrismaClient({ adapter: remoteAdapter });

async function check() {
  const cpus = await remotePrisma.product.findMany({
    where: { category: { name: 'CPU' } },
    select: { name: true, imageUrl: true }
  });
  console.log("PRODUCTION DATABASE CPU RECORDS:");
  console.log(JSON.stringify(cpus, null, 2));
}

check().catch(console.error).finally(() => remotePrisma.$disconnect());
