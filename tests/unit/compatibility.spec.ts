import { calculateIssues } from '@/store/useBuilderStore';

describe('Builder Compatibility', () => {
  it('detects mismatched CPU and Motherboard sockets', () => {
    const components = {
      'CPU': { id: '1', name: 'Intel', price: 100, category: 'CPU', specs: { socket: 'LGA 1700' } },
      'Motherboard': { id: '2', name: 'AMD Board', price: 100, category: 'Motherboard', specs: { socket: 'AM5' } },
    };
    
    const issues = calculateIssues(components);
    expect(issues.length).toBe(1);
    expect(issues[0].type).toBe('socket');
    expect(issues[0].involvedCategories).toContain('CPU');
    expect(issues[0].involvedCategories).toContain('Motherboard');
  });

  it('detects mismatched Motherboard and RAM types', () => {
    const components = {
      'Motherboard': { id: '1', name: 'DDR4 Board', price: 100, category: 'Motherboard', specs: { memoryType: 'DDR4' } },
      'RAM': { id: '2', name: 'DDR5 RAM', price: 100, category: 'RAM', specs: { memoryType: 'DDR5' } },
    };
    
    const issues = calculateIssues(components);
    expect(issues.length).toBe(1);
    expect(issues[0].type).toBe('memory');
  });

  it('detects insufficient GPU power from Power Supply', () => {
    const components = {
      'Power Supply': { id: '1', name: '500W PSU', price: 100, category: 'Power Supply', specs: { wattage: 500 } },
      'GPU': { id: '2', name: 'RTX 4090', price: 1600, category: 'GPU', specs: { recommendedPsu: 850 } },
    };
    
    const issues = calculateIssues(components);
    expect(issues.length).toBe(1);
    expect(issues[0].type).toBe('power');
  });

  it('detects form factor mismatches between Motherboard and Case', () => {
    const componentsATX = {
      'Motherboard': { id: '1', name: 'ATX Board', price: 100, category: 'Motherboard', specs: { formFactor: 'ATX' } },
      'Case': { id: '2', name: 'Mini ITX Case', price: 100, category: 'Case', specs: { maxMainboard: 'Mini-ITX' } },
    };
    
    expect(calculateIssues(componentsATX).some(i => i.type === 'formFactor')).toBe(true);

    const componentsEATX = {
      'Motherboard': { id: '3', name: 'E-ATX Board', price: 100, category: 'Motherboard', specs: { formFactor: 'E-ATX' } },
      'Case': { id: '4', name: 'ATX Case', price: 100, category: 'Case', specs: { maxMainboard: 'ATX' } },
    };

    expect(calculateIssues(componentsEATX).some(i => i.type === 'formFactor')).toBe(true);
  });

  it('returns no issues for a fully compatible build', () => {
    const components = {
      'CPU': { id: '1', name: 'Ryzen 7', price: 300, category: 'CPU', specs: { socket: 'AM5' } },
      'Motherboard': { id: '2', name: 'B650', price: 150, category: 'Motherboard', specs: { socket: 'AM5', memoryType: 'DDR5', formFactor: 'ATX' } },
      'RAM': { id: '3', name: '32GB DDR5', price: 100, category: 'RAM', specs: { memoryType: 'DDR5' } },
      'GPU': { id: '4', name: 'RX 7800 XT', price: 500, category: 'GPU', specs: { recommendedPsu: 700 } },
      'Power Supply': { id: '5', name: '850W Gold', price: 120, category: 'Power Supply', specs: { wattage: 850 } },
      'Case': { id: '6', name: 'Mid Tower', price: 90, category: 'Case', specs: { maxMainboard: 'E-ATX' } },
    };
    
    expect(calculateIssues(components)).toEqual([]);
  });
});
