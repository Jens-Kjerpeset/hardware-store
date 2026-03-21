"use client";

import { useStore } from "@/lib/store";
import { ShoppingCart, X, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to dynamically resolve legitimate flash sale price
interface PriceItem {
  price: number;
  discountPercent?: number | null;
  discountEndsAt?: Date | string | null;
}
const getActivePrice = (item: PriceItem) => {
  if (!item.discountPercent || !item.discountEndsAt) return item.price;
  return new Date(item.discountEndsAt).getTime() > Date.now()
    ? item.price * (1 - item.discountPercent / 100)
    : item.price;
};

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const router = useRouter();
  const { mode, cart, updateQuantity, removeFromCart, clearCart } = useStore();

  // ----- LOOSE PARTS LOGIC -----
  const looseTotal = cart.reduce(
    (sum, item) => sum + getActivePrice(item) * item.quantity,
    0,
  );
  const looseItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Render nothing if cart isn't physically open, or if in build or loose mode (which has a persistent sidebar)
  if (!isOpen || mode === "build" || mode === "loose") return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className="fixed inset-y-0 right-0 z-[70] w-full sm:w-[500px] glass bg-dark-bg/95 border-l border-dark-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <ShoppingCart className="text-brand-500 w-6 h-6" />
            <h2 className="text-xl text-white font-bold">Shopping Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-dark-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Empty State / Not Started */}
        {!mode && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <ShoppingCart className="w-16 h-16 text-dark-border mb-4" />
            <p>Your cart is empty.</p>
            <button
              onClick={() => {
                onClose();
                router.push("/");
              }}
              className="mt-4 text-brand-500 hover:text-brand-400 font-medium"
            >
              Return to Home
            </button>
          </div>
        )}

        {/* LOOSE PARTS MODE CART */}
        {mode === "loose" && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  Cart is empty.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-4 border border-dark-border bg-dark-surface/30"
                  >
                    <div className="h-16 w-16 bg-white/5 flex items-center justify-center shrink-0 border border-dark-border/50">
                      {/* Placeholder icon since images aren't real yet */}
                      <ShoppingCart className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-200 text-sm leading-tight mb-1">
                        {item.name}
                      </h4>
                      <div className="font-black text-brand-400 text-sm font-mono">
                        {formatCurrency(getActivePrice(item))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 bg-dark-bg border border-dark-border p-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white bg-white/5"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white bg-white/5"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-red-500 hover:text-red-400 mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-dark-border bg-dark-bg">
              <div className="flex justify-between text-gray-400 text-sm mb-2">
                <span>Subtotal ({looseItemCount} items)</span>
                <span className="font-mono text-white">
                  {formatCurrency(looseTotal)}
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  router.push("/checkout");
                }}
                disabled={cart.length === 0}
                className="w-full mt-4 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                Checkout Parts <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={clearCart}
                className="w-full mt-3 text-sm text-gray-500 hover:text-red-400 py-2 transition-colors"
              >
                Empty Cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
