import prisma from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  let settings = await prisma.storeSettings.findFirst({
    include: { shippingMethods: true },
  });

  if (!settings) {
    settings = {
      id: "default",
      storeName: "Hardware Store",
      contactEmail: "contact@example.com",
      taxRate: 0.25,
      shippingFlatRate: 99.0,
      defaultCurrency: "NOK",
      timezone: "Europe/Oslo",
      measurementUnit: "metric",
      paymentProviderStripeKey: "",
      paymentProviderPaypalKey: "",
      notifyNewOrder: true,
      notifyLowStock: true,
      shippingMethods: [],
      updatedAt: new Date(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
          Store Configuration
        </h2>
        <p className="text-sm text-gray-400">
          Configure global platform variables, localizations, shipping
          integrations, and alert routing.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
