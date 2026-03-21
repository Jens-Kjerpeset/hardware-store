"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { updateStoreSettings } from "@/app/actions/admin";
import {
  Check,
  Loader2,
  Save,
  Plus,
  Trash2,
  Settings,
  Truck,
  CreditCard,
  Bell,
} from "lucide-react";

 
export default function SettingsForm({
  initialSettings,
}: {
  initialSettings: any;
}) {
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    storeName: initialSettings.storeName || "",
    contactEmail: initialSettings.contactEmail || "",
    taxRate: initialSettings.taxRate ?? 0.25,
    shippingFlatRate: initialSettings.shippingFlatRate ?? 99,
    defaultCurrency: initialSettings.defaultCurrency || "NOK",
    timezone: initialSettings.timezone || "Europe/Oslo",
    measurementUnit: initialSettings.measurementUnit || "metric",
    paymentProviderStripeKey: initialSettings.paymentProviderStripeKey || "",
    paymentProviderPaypalKey: initialSettings.paymentProviderPaypalKey || "",
    notifyNewOrder: initialSettings.notifyNewOrder ?? true,
    notifyLowStock: initialSettings.notifyLowStock ?? true,
  });

   
  const [shippingMethods, setShippingMethods] = useState<any[]>(
    initialSettings.shippingMethods || [],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const parseDecimal = (val: string | number) => {
    if (typeof val === "number") return val;
    const parsed = parseFloat(val.replace(",", "."));
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    const data = {
      ...formData,
      taxRate: parseDecimal(formData.taxRate),
      shippingFlatRate: parseDecimal(formData.shippingFlatRate),
      shippingMethods: shippingMethods.map((sm) => ({
        ...sm,
        price: parseDecimal(sm.price),
      })),
    };

    const res = await updateStoreSettings(data);

    setIsLoading(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert(res.error || "Failed to save settings.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row gap-0 glass border border-dark-border rounded-xl overflow-hidden min-h-[550px] relative"
    >
      <div className="w-full md:w-64 bg-dark-bg/50 border-r border-dark-border p-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === "general" ? "bg-brand-500/20 text-brand-400 border border-brand-500/30" : "text-gray-400 hover:bg-dark-surface hover:text-white border border-transparent"}`}
        >
          <Settings className="w-4 h-4" /> General & Local
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("shipping")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === "shipping" ? "bg-brand-500/20 text-brand-400 border border-brand-500/30" : "text-gray-400 hover:bg-dark-surface hover:text-white border border-transparent"}`}
        >
          <Truck className="w-4 h-4" /> Shipping Tiers
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === "payments" ? "bg-brand-500/20 text-brand-400 border border-brand-500/30" : "text-gray-400 hover:bg-dark-surface hover:text-white border border-transparent"}`}
        >
          <CreditCard className="w-4 h-4" /> Payment Gateways
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === "notifications" ? "bg-brand-500/20 text-brand-400 border border-brand-500/30" : "text-gray-400 hover:bg-dark-surface hover:text-white border border-transparent"}`}
        >
          <Bell className="w-4 h-4" /> Notifications
        </button>
      </div>

      <div className="flex-1 p-6 md:p-8 flex flex-col h-full bg-dark-bg/20">
        <div className="flex-1">
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-dark-border pb-4">
                <h3 className="text-lg font-bold text-white">
                  General Info & Localization
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Basic operational identities and base rates.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) =>
                      setFormData({ ...formData, storeName: e.target.value })
                    }
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default Tax Rate
                  </label>
                  { }
                  <input
                    type="text"
                    value={formData.taxRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        taxRate: e.target.value as any,
                      })
                    }
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Localization Options
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.defaultCurrency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          defaultCurrency: e.target.value,
                        })
                      }
                      className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 flex-1"
                    >
                      <option value="NOK">NOK Kr</option>
                      <option value="USD">USD $</option>
                      <option value="EUR">EUR €</option>
                    </select>
                    <select
                      value={formData.measurementUnit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          measurementUnit: e.target.value,
                        })
                      }
                      className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 w-24"
                    >
                      <option value="metric">Metric</option>
                      <option value="imperial">Imperial</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-dark-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Shipping Methods
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Configure varying delivery options and pricing tiers based
                    on order scale.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setShippingMethods([
                      ...shippingMethods,
                      { name: "", price: "", conditionsJson: "{}" },
                    ])
                  }
                  className="flex items-center gap-2 px-3 py-1.5 bg-dark-bg hover:bg-dark-surface border border-dark-border rounded text-sm text-gray-300 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Tier
                </button>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {shippingMethods.map((method, idx) => (
                  <div
                    key={method.id || idx}
                    className="grid grid-cols-12 gap-4 items-start bg-dark-surface p-4 rounded-lg border border-dark-border relative"
                  >
                    <div className="col-span-12 md:col-span-4">
                      <label className="block text-xs text-brand-400 font-bold mb-1  tracking-wider">
                        Tier Name
                      </label>
                      <input
                        type="text"
                        value={method.name}
                        onChange={(e) => {
                          const newM = [...shippingMethods];
                          newM[idx].name = e.target.value;
                          setShippingMethods(newM);
                        }}
                        className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                        placeholder="e.g. Heavy Freight"
                        required
                      />
                    </div>
                    <div className="col-span-8 md:col-span-3">
                      <label className="block text-xs text-brand-400 font-bold mb-1  tracking-wider">
                        Base Price
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={method.price}
                          onChange={(e) => {
                            const newM = [...shippingMethods];
                            newM[idx].price = e.target.value;
                            setShippingMethods(newM);
                          }}
                          className="w-full bg-dark-bg border border-dark-border rounded pl-3 pr-8 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
                          required
                        />
                        <span className="absolute right-3 top-2 text-sm text-gray-500 font-bold">
                          Kr
                        </span>
                      </div>
                    </div>
                    <div className="col-span-10 md:col-span-4">
                      <label className="block text-xs text-brand-400 font-bold mb-1  tracking-wider">
                        Rule Schema
                      </label>
                      <input
                        type="text"
                        value={method.conditionsJson}
                        onChange={(e) => {
                          const newM = [...shippingMethods];
                          newM[idx].conditionsJson = e.target.value;
                          setShippingMethods(newM);
                        }}
                        className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm font-mono text-gray-300 focus:outline-none focus:border-brand-500"
                        placeholder='{"minWeight": 15}'
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-end mt-6">
                      <button
                        type="button"
                        onClick={() =>
                          setShippingMethods(
                            shippingMethods.filter((_, i) => i !== idx),
                          )
                        }
                        className="text-gray-500 hover:text-rose-400 p-1.5 bg-dark-bg rounded border border-dark-border hover:border-rose-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {shippingMethods.length === 0 && (
                  <div className="text-center p-8 text-sm text-gray-500 border border-dashed border-dark-border rounded-lg bg-dark-surface/50">
                    No active shipping endpoints detected.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-dark-border pb-4">
                <h3 className="text-lg font-bold text-white">
                  Payment Integrations
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Securely inject global keys for processing checkout
                  transactions.
                </p>
              </div>
              <div className="space-y-4">
                <div className="bg-dark-surface p-4 rounded-xl border border-dark-border">
                  <label className="block text-sm font-bold text-indigo-400 mb-2">
                    Stripe Secret Key
                  </label>
                  <input
                    type="password"
                    value={formData.paymentProviderStripeKey}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentProviderStripeKey: e.target.value,
                      })
                    }
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm tracking-widest"
                    placeholder="sk_test_..."
                  />
                </div>
                <div className="bg-dark-surface p-4 rounded-xl border border-dark-border">
                  <label className="block text-sm font-bold text-sky-400 mb-2">
                    PayPal Client ID
                  </label>
                  <input
                    type="password"
                    value={formData.paymentProviderPaypalKey}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentProviderPaypalKey: e.target.value,
                      })
                    }
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500 font-mono text-sm tracking-widest"
                    placeholder="AcX_..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-dark-border pb-4">
                <h3 className="text-lg font-bold text-white">
                  Automated Alerts
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Manage system triggers that route ping streams to
                  administrators.
                </p>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-dark-surface border border-dark-border rounded-xl cursor-pointer hover:border-gray-500 transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Order Confirmations
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Dispatch email payloads when cart execution finalizes
                      successfully.
                    </p>
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input
                      type="checkbox"
                      checked={formData.notifyNewOrder}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notifyNewOrder: e.target.checked,
                        })
                      }
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-600 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-6 checked:border-brand-500"
                    />
                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 bg-dark-surface border border-dark-border rounded-xl cursor-pointer hover:border-gray-500 transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Threshold Warnings
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Pings core team when inventory nodes drop below minimum
                      reserve margins.
                    </p>
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input
                      type="checkbox"
                      checked={formData.notifyLowStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notifyLowStock: e.target.checked,
                        })
                      }
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-600 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-6 checked:border-brand-500"
                    />
                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-dark-border flex items-center justify-end gap-4">
          {success && (
            <span className="text-emerald-400 text-sm flex items-center gap-1 animate-in fade-in">
              <Check className="w-4 h-4" /> Global Systems Saved
            </span>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isLoading ? "Encrypting..." : "Deploy Configurations"}
          </button>
        </div>
      </div>
    </form>
  );
}
