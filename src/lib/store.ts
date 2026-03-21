import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ShoppingMode = "loose" | "build" | null;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  brand: string;
  category: { name: string };
  specsJson: string; // JSON string
  categoryId: string;
}

// Loose Cart Item
export interface CartItem extends Product {
  quantity: number;
}

interface StoreState {
  mode: ShoppingMode;
  setMode: (mode: ShoppingMode) => void;

  // Loose Parts State
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Build a System State
  // We represent the build by a dictionary where the key is the category name.
  buildSystem: Record<string, Product>;
  setBuildComponent: (category: string, product: Product) => void;
  removeBuildComponent: (category: string) => void;
  clearBuild: () => void;

  // Build a System Storage State (Array-based for multiple items)
  buildStorage: CartItem[];
  addBuildStorageComponent: (product: Product) => void;
  removeBuildStorageComponent: (productId: string) => void;
  updateBuildStorageQuantity: (productId: string, quantity: number) => void;
  clearBuildStorage: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      mode: null,
      setMode: (mode) => set({ mode }),

      // --- Loose Parts ---
      cart: [],
      addToCart: (product) =>
        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            }; // increment
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        }),
      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((item) => item.id !== productId)
              : state.cart.map((item) =>
                  item.id === productId ? { ...item, quantity } : item,
                ),
        })),
      clearCart: () => set({ cart: [] }),

      // --- Build a System ---
      buildSystem: {},
      setBuildComponent: (category, product) =>
        set((state) => ({
          buildSystem: { ...state.buildSystem, [category]: product },
        })),
      removeBuildComponent: (category) =>
        set((state) => {
          const next = { ...state.buildSystem };
          delete next[category];
          return { buildSystem: next };
        }),
      clearBuild: () => set({ buildSystem: {}, buildStorage: [] }),

      // --- Build Storage Array State ---
      buildStorage: [],
      addBuildStorageComponent: (product: Product) =>
        set((state) => {
          const existing = state.buildStorage.find(
            (item) => item.id === product.id,
          );
          if (existing) {
            return {
              buildStorage: state.buildStorage.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }
          return {
            buildStorage: [...state.buildStorage, { ...product, quantity: 1 }],
          };
        }),
      removeBuildStorageComponent: (productId: string) =>
        set((state) => ({
          buildStorage: state.buildStorage.filter(
            (item) => item.id !== productId,
          ),
        })),
      updateBuildStorageQuantity: (productId, quantity) =>
        set((state) => ({
          buildStorage:
            quantity <= 0
              ? state.buildStorage.filter((item) => item.id !== productId)
              : state.buildStorage.map((item) =>
                  item.id === productId ? { ...item, quantity } : item,
                ),
        })),
      clearBuildStorage: () => set({ buildStorage: [] }),
    }),
    {
      name: "hardware-store-storage",
    },
  ),
);
