import { checkPotentialCompatibility } from './src/lib/compatibility';

const build = [{
  id: 'case-id',
  name: 'Cooler Master NR200P',
  brand: 'Cooler Master',
  categoryId: 'Case',
  specsJson: JSON.stringify({ type: 'case', formFactor: 'Mini-ITX', maxMainboard: 'Mini-ITX', color: 'Black', sidePanel: 'Solid' })
}];

const mobo = {
  id: 'mobo-id',
  name: 'ASUS ROG Maximus Z790 Hero',
  brand: 'ASUS',
  categoryId: 'Motherboard',
  specsJson: JSON.stringify({ socket: 'LGA1700', formFactor: 'ATX', memoryType: 'DDR5', memorySlots: 4, maxMemory: 192, chipset: 'Z790', type: 'motherboard' })
};

console.log('Test Case first, then ATX mobo:');
console.log(checkPotentialCompatibility(build as any, mobo as any));

console.log('Test ATX Mobo first, then Case:');
console.log(checkPotentialCompatibility([mobo] as any, build[0] as any));
