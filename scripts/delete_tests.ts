import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  const prefixes = [
    'f5cca99f',
    '67f61b78',
    '61b92741',
    '16b8c33b',
    '36295152',
    'bfa21269',
    '3c574a8d'
  ];
  
  const orders = await prisma.order.findMany();
  const toDelete = orders.filter(o => prefixes.some(p => o.id.toLowerCase().startsWith(p.toLowerCase())));
  
  console.log('Found orders to delete:', toDelete.map(o => o.id));
  
  for (const o of toDelete) {
    await prisma.order.delete({ where: { id: o.id } });
    console.log('Deleted', o.id);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
