"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    cost: number;
    stock: number;
    brand: string;
    categoryId: string;
    specsJson: string;
    imageUrl: string;
    sku?: string | null;
    isActive?: boolean;
    lowStockThreshold?: number;
    supplier?: string | null;
    discountPercent?: number | null;
    discountEndsAt?: Date | null;
  }>,
) {
  try {
    await prisma.product.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/catalog");

    return { success: true };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  brand: string;
  categoryId: string;
  specsJson: string;
  imageUrl: string;
  sku?: string | null;
  isActive?: boolean;
  lowStockThreshold?: number;
  supplier?: string | null;
  discountPercent?: number | null;
  discountEndsAt?: Date | null;
}) {
  try {
    const newProduct = await prisma.product.create({
      data,
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/catalog");

    return { success: true, product: newProduct };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/catalog");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

export async function bulkUpdateProductStatus(
  ids: string[],
  isActive: boolean,
) {
  try {
    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive },
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/catalog");

    return { success: true };
  } catch (error) {
    console.error("Failed to bulk update products:", error);
    return { success: false, error: "Failed to bulk update products" };
  }
}

export async function bulkDeleteProducts(ids: string[]) {
  try {
    await prisma.product.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/catalog");

    return { success: true };
  } catch (error) {
    console.error("Failed to bulk delete products:", error);
    return { success: false, error: "Failed to bulk delete products" };
  }
}

export async function createCategory(
  name: string,
  fieldsJson: string = "[]",
  icon: string = "LayoutGrid",
  description?: string,
) {
  try {
    const newCategory = await prisma.category.create({
      data: { name, fieldsJson, icon, description } as any,
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/catalog");

    return { success: true, category: newCategory };
  } catch (error) {
    console.error("Failed to create category:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "A category with this exact name already exists!",
      };
    }
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateOrderStatus(
  id: string,
  status: string,
  trackingNumber?: string | null,
  shippingStatus?: string,
  shippingGateway?: string | null,
) {
  try {
    await prisma.order.update({
      where: { id },
      data: { status, trackingNumber, shippingStatus, shippingGateway },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

export async function updateStoreSettings(data: {
  storeName: string;
  contactEmail: string;
  taxRate: number;
  shippingFlatRate: number;
  defaultCurrency: string;
  timezone: string;
  measurementUnit: string;
  paymentProviderStripeKey: string | null;
  paymentProviderPaypalKey: string | null;
  notifyNewOrder: boolean;
  notifyLowStock: boolean;
  shippingMethods: {
    id?: string;
    name: string;
    price: number;
    conditionsJson: string;
  }[];
}) {
  try {
    const { shippingMethods, ...scalars } = data;

    const existing = await prisma.storeSettings.findFirst();
    let settingsId = existing?.id;

    if (existing) {
      await prisma.storeSettings.update({
        where: { id: existing.id },
        data: scalars,
      });
    } else {
      const created = await prisma.storeSettings.create({ data: scalars });
      settingsId = created.id;
    }

    if (settingsId) {
      const currentMethods = await prisma.shippingMethod.findMany({
        where: { storeSettingsId: settingsId },
      });
      const currentIds = currentMethods.map((m) => m.id);
      const incomingIds = shippingMethods
        .filter((m) => m.id)
        .map((m) => m.id as string);

      const toDelete = currentIds.filter((id) => !incomingIds.includes(id));
      if (toDelete.length > 0) {
        await prisma.shippingMethod.deleteMany({
          where: { id: { in: toDelete } },
        });
      }

      for (const sm of shippingMethods) {
        if (sm.id && currentIds.includes(sm.id)) {
          await prisma.shippingMethod.update({
            where: { id: sm.id },
            data: {
              name: sm.name,
              price: sm.price,
              conditionsJson: sm.conditionsJson,
            },
          });
        } else {
          await prisma.shippingMethod.create({
            data: {
              name: sm.name,
              price: sm.price,
              conditionsJson: sm.conditionsJson,
              storeSettingsId: settingsId,
            },
          });
        }
      }
    }

    revalidatePath("/admin/settings");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to update store settings:", error);
    return { success: false, error: "Failed to update store settings" };
  }
}

export async function createDiscountCode(data: any) {
  try {
    await prisma.discountCode.create({ data });
    revalidatePath("/admin/promotions");
    return { success: true };
  } catch (error) {
    console.error("Failed to create discount code:", error);
    return { success: false, error: "Code already exists or invalid data" };
  }
}

export async function toggleDiscountCode(id: string, isActive: boolean) {
  try {
    await prisma.discountCode.update({ where: { id }, data: { isActive } });
    revalidatePath("/admin/promotions");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle discount code:", error);
    return { success: false, error: "Failed to update" };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await prisma.customer.delete({ where: { id } });
    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete customer:", error);
    return { success: false, error: "Failed to delete customer" };
  }
}

export async function updateCustomer(
  id: string,
  data: {
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
  },
) {
  try {
    await prisma.customer.update({ where: { id }, data });
    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error) {
    console.error("Failed to update customer:", error);
    return { success: false, error: "Failed to update customer" };
  }
}

export async function getOrdersForMonth(yearMonth: string) {
  try {
    const [year, month] = yearMonth.split("-").map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1)); 

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, orders };
  } catch (error) {
    console.error("Failed to fetch orders for month:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

