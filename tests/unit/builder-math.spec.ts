import { getActivePrice, useBuilderStore } from '@/store/useBuilderStore';

describe('Builder Math & Pricing', () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 5);

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5);

  describe('getActivePrice', () => {
    it('returns regular price when no discount exists', () => {
      const item = { price: 1000 };
      expect(getActivePrice(item)).toBe(1000);
    });

    it('returns discounted price when discount is active', () => {
      const item = { price: 1000, discountPercent: 20, discountEndsAt: futureDate };
      expect(getActivePrice(item)).toBe(800); // 20% off 1000
    });

    it('returns regular price when discount has expired', () => {
      const item = { price: 1000, discountPercent: 20, discountEndsAt: pastDate };
      expect(getActivePrice(item)).toBe(1000);
    });
  });

  describe('getTotalPrice', () => {
    beforeEach(() => {
      useBuilderStore.getState().clearBuilder();
      useBuilderStore.getState().clearLooseCart();
    });

    it('calculates total correctly in loose cart mode', () => {
      useBuilderStore.getState().setMode('loose');
      
      const item1 = { id: '1', name: 'Cooler', price: 500, category: 'Cooler' };
      const item2 = { id: '2', name: 'Fans', price: 200, category: 'Fans', discountPercent: 10, discountEndsAt: futureDate };

      useBuilderStore.getState().addToLooseCart(item1); // 500
      useBuilderStore.getState().addToLooseCart(item2); // 180 (10% off 200)
      
      // We expect 500 + 180 = 680
      expect(useBuilderStore.getState().getTotalPrice()).toBe(680);
      
      // Update quantity
      useBuilderStore.getState().updateLooseQuantity('1', 2); // 1000
      expect(useBuilderStore.getState().getTotalPrice()).toBe(1180); // 1000 + 180
    });

    it('calculates total correctly in builder mode including storage items', () => {
      useBuilderStore.getState().setMode('build');

      const cpu = { id: 'cpu1', name: 'CPU', price: 3000, category: 'CPU' };
      const gpu = { id: 'gpu1', name: 'GPU', price: 6000, category: 'GPU', discountPercent: 15, discountEndsAt: futureDate };
      
      useBuilderStore.getState().setComponent('CPU', cpu);
      useBuilderStore.getState().setComponent('GPU', gpu);
      // GPU price: 6000 * 0.85 = 5100. Total = 8100.

      const storage = { id: 'hdd1', name: 'HDD', price: 1000, category: 'Storage' };
      useBuilderStore.getState().addBuildStorageComponent(storage);
      useBuilderStore.getState().addBuildStorageComponent(storage);
      // Storage: 2000

      expect(useBuilderStore.getState().getTotalPrice()).toBe(10100);
    });
  });
});
