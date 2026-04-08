import { create } from "zustand";

export interface ValidationIssue {
  type: string;
  message: string;
  involvedCategories: string[];
}

export interface ComponentItem {
  id: string;
  name: string;
  price: number;
  category: string;
  discountPercent?: number | null;
  discountEndsAt?: Date | string | null;
  specs?: Record<string, any>;
}

export interface LooseCartItem extends ComponentItem {
  quantity: number;
}

export type StoreMode = "build" | "loose";

export interface BuilderState {
  mode: StoreMode;
  setMode: (mode: StoreMode) => void;
  
  isMobileCartOpen: boolean;
  setMobileCartOpen: (open: boolean) => void;
  
  isMobileFilterOpen: boolean;
  setMobileFilterOpen: (open: boolean) => void;
  
  // Builder Mode State
  components: Record<string, ComponentItem>;
  issues: ValidationIssue[];
  setComponent: (category: string, item: ComponentItem) => void;
  removeComponent: (category: string) => void;
  clearBuilder: () => void;

  // Builder Mode Storage State (Multi-quantity)
  buildStorage: LooseCartItem[];
  addBuildStorageComponent: (item: ComponentItem) => void;
  updateBuildStorageQuantity: (id: string, quantity: number) => void;
  removeBuildStorageComponent: (id: string) => void;
  
  // Loose Mode State
  looseCart: LooseCartItem[];
  addToLooseCart: (item: ComponentItem) => void;
  updateLooseQuantity: (id: string, quantity: number) => void;
  removeFromLooseCart: (id: string) => void;
  clearLooseCart: () => void;
  
  getTotalPrice: () => number;
}


export const getActivePrice = (item: { price: number; discountPercent?: number | null; discountEndsAt?: Date | string | null }) => {
  if (!item.discountPercent || !item.discountEndsAt) return item.price;
  return new Date(item.discountEndsAt).getTime() > Date.now()
    ? item.price * (1 - item.discountPercent / 100)
    : item.price;
};

export function calculateIssues(components: Record<string, ComponentItem>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const cpu = components["CPU"];
  const mobo = components["Motherboard"];
  const ram = components["RAM"];
  const psu = components["Power Supply"];
  const gpu = components["GPU"];
  const pcCase = components["Case"];

  // 1. Socket Check
  if (cpu && mobo) {
    if (cpu.specs?.socket && mobo.specs?.socket && cpu.specs.socket !== mobo.specs.socket) {
      issues.push({
        type: "socket",
        message: `Incompatible Socket: CPU requires ${cpu.specs.socket}, but Motherboard is ${mobo.specs.socket}.`,
        involvedCategories: ["CPU", "Motherboard"]
      });
    }
  }

  // 2. Memory Match Check
  if (mobo && ram) {
    if (mobo.specs?.memoryType && ram.specs?.memoryType && mobo.specs.memoryType !== ram.specs.memoryType) {
      issues.push({
        type: "memory",
        message: `Incompatible RAM: Motherboard supports ${mobo.specs.memoryType}, but RAM is ${ram.specs.memoryType}.`,
        involvedCategories: ["Motherboard", "RAM"]
      });
    }
  }

  // 3. Power Budget Check
  if (gpu && psu) {
    const psuWattage = Number(psu.specs?.wattage) || 0;
    const gpuRecommended = Number(gpu.specs?.recommendedPsu) || 0;
    if (gpuRecommended > psuWattage) {
      issues.push({
        type: "power",
        message: `Insufficient Power: GPU recommends ${gpuRecommended}W, but Power Supply is only ${psuWattage}W.`,
        involvedCategories: ["GPU", "Power Supply"]
      });
    }
  }

  // 4. Case Form Factor Check
  if (mobo && pcCase) {
      const boardSize = String(mobo.specs?.formFactor).toLowerCase();
      const maxSize = String(pcCase.specs?.maxMainboard || pcCase.specs?.formFactor || "").toLowerCase();
      
      if (boardSize.includes('e-atx') && (!maxSize.includes('e-atx') && !maxSize.includes('eatx') && !maxSize.includes('full'))) {
        issues.push({
          type: "formFactor",
          message: `Form Factor Mismatch: E-ATX Motherboard will likely not fit in a ${pcCase.specs?.formFactor || 'smaller'} Case.`,
          involvedCategories: ["Motherboard", "Case"]
        });
      } else if (boardSize.includes('atx') && !boardSize.includes('micro') && !boardSize.includes('mini') && !boardSize.includes('e-atx') && maxSize.includes('itx')) {
        issues.push({
          type: "formFactor",
          message: `Form Factor Mismatch: ATX Motherboard will not fit in an ITX Case.`,
          involvedCategories: ["Motherboard", "Case"]
        });
      }
  }

  return issues;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  mode: "build",
  setMode: (mode) => set({ mode }),

  isMobileCartOpen: false,
  setMobileCartOpen: (open) => set({ isMobileCartOpen: open }),

  isMobileFilterOpen: false,
  setMobileFilterOpen: (open) => set({ isMobileFilterOpen: open }),

  components: {},
  issues: [],
  
  setComponent: (category, item) => set((state) => {
    const newComponents = { ...state.components, [category]: item };
    return { 
      components: newComponents, 
      issues: calculateIssues(newComponents)
    };
  }),

  removeComponent: (category) => set((state) => {
    const newComponents = { ...state.components };
    delete newComponents[category];
    return { 
      components: newComponents, 
      issues: calculateIssues(newComponents)
    };
  }),

  clearBuilder: () => set({ components: {}, issues: [], buildStorage: [] }),

  // BUILD STORAGE ACTIONS
  buildStorage: [],
  addBuildStorageComponent: (item) => set((state) => {
    const existing = state.buildStorage.find(i => i.id === item.id);
    if (existing) {
      return {
        buildStorage: state.buildStorage.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      };
    }
    return { buildStorage: [...state.buildStorage, { ...item, quantity: 1 }] };
  }),
  updateBuildStorageQuantity: (id, quantity) => set((state) => {
    if (quantity <= 0) return { buildStorage: state.buildStorage.filter(i => i.id !== id) };
    return {
      buildStorage: state.buildStorage.map(i => i.id === id ? { ...i, quantity } : i)
    };
  }),
  removeBuildStorageComponent: (id) => set((state) => ({
    buildStorage: state.buildStorage.filter(i => i.id !== id)
  })),

  // LOOSE CART ACTIONS
  looseCart: [],
  addToLooseCart: (item) => set((state) => {
    const existing = state.looseCart.find(i => i.id === item.id);
    if (existing) {
      return {
        looseCart: state.looseCart.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      };
    }
    return { looseCart: [...state.looseCart, { ...item, quantity: 1 }] };
  }),
  updateLooseQuantity: (id, quantity) => set((state) => {
    if (quantity <= 0) return { looseCart: state.looseCart.filter(i => i.id !== id) };
    return {
      looseCart: state.looseCart.map(i => i.id === id ? { ...i, quantity } : i)
    };
  }),
  removeFromLooseCart: (id) => set((state) => ({ 
    looseCart: state.looseCart.filter(i => i.id !== id) 
  })),
  clearLooseCart: () => set({ looseCart: [] }),

  // DYNAMIC PRICING ENGINE
  getTotalPrice: () => {
    const { mode, components, looseCart, buildStorage } = get();
    if (mode === "build") {
       const componentsTotal = Object.values(components).reduce((total, item) => total + getActivePrice(item), 0);
       const storageTotal = buildStorage.reduce((total, item) => total + (getActivePrice(item) * item.quantity), 0);
       return componentsTotal + storageTotal;
    } else {
       return looseCart.reduce((total, item) => total + (getActivePrice(item) * item.quantity), 0);
    }
  }
}));
