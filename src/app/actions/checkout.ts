'use server';

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/schemas";
import { cookies } from "next/headers";

export type CheckoutResponse = {
  success: boolean;
  message: string;
  orderId?: string;
};

type DbProductMap = { id: string; price: number; cost: number; stock: number; discountPercent: number | null; discountEndsAt: Date | null };

export async function calculateServerTotal(
  productsInDb: DbProductMap[], 
  idCounts: Record<string, number>, 
  shippingCost: number
): Promise<{ serverCalculatedTotal: number, orderItemsPayload: any[] }> {
  let serverCalculatedTotal = shippingCost;
  
  const orderItemsPayload = productsInDb.map((product) => {
    const requestedQty = idCounts[product.id];
    
    if (product.stock < requestedQty) {
      throw new Error(`Insufficient stock for product. Code: ${product.id}`);
    }

    let activePrice = product.price;
    if (product.discountPercent && product.discountEndsAt) {
       if (new Date(product.discountEndsAt).getTime() > Date.now()) {
          activePrice = product.price * (1 - product.discountPercent / 100);
       }
    }

    serverCalculatedTotal += activePrice * requestedQty;
    
    return {
      productId: product.id,
      quantity: requestedQty,
      priceAtTime: activePrice,
      costAtTime: product.cost,
    };
  });

  return { serverCalculatedTotal, orderItemsPayload };
}

export async function processCheckout(payload: z.infer<typeof checkoutSchema>): Promise<CheckoutResponse> {
  try {

    const { productIds, customer, shippingMethod, paymentMethod, cardNumber } = checkoutSchema.parse(payload);

    if (productIds.length === 0) {
      return { success: false, message: "Cart cannot be empty." };
    }

    // Collapse exact matches into a quantity map (e.g. if a user submits two of the same RAM stick)
    const idCounts = productIds.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uniqueIds = Object.keys(idCounts);


    // Query the database directly to prevent front-end price manipulation
    const productsInDb = await prisma.product.findMany({
      where: {
        id: { in: uniqueIds },
        isActive: true, // Guarantees we do not sell retired products
      },
      select: {
        id: true,
        price: true,
        cost: true,
        stock: true,
        discountPercent: true,
        discountEndsAt: true,
      }
    });

    // If lengths don't match, the user requested an ID that wasn't found or was inactive
    if (productsInDb.length !== uniqueIds.length) {
      return { success: false, message: "One or more items in your cart are invalid or no longer available." };
    }

    let shippingCost = 0;
    if (shippingMethod === "standard") shippingCost = 99;
    else if (shippingMethod === "express") shippingCost = 199;
    else if (shippingMethod === "pickup") shippingCost = 49;

    const { serverCalculatedTotal, orderItemsPayload } = await calculateServerTotal(productsInDb, idCounts, shippingCost);

    // 3. Atomic Transaction
    // Create the order while simultaneously securely decrementing inventory limits across involved IDs
    const fullName = `${customer.firstName} ${customer.lastName}`;
    const shippingAddress = `${customer.address}, ${customer.postalCode} ${customer.city}`;

    const order = await prisma.$transaction(async (tx) => {
      // Execute atomic decrements first with tight gte constrains to physically prevent negative values
      for (const product of productsInDb) {
         try {
           await tx.product.update({
             where: { 
               id: product.id,
               stock: { gte: idCounts[product.id] } 
             },
             data: { stock: { decrement: idCounts[product.id] } }
           });
         } catch (err: any) {
           // If update fails (e.g. Prisma P2025 where record isn't found because stock < requested), throw.
           // This instantly rolls back the entire interactive transaction.
           throw new Error(`Insufficient stock for product. Code: ${product.id}`);
         }
      }

      // Mock Payment Gateway Processor (executes forcefully AFTER inventory is logically secured in transaction)
      if (cardNumber === "4000 0000 0000 0028") {
        throw new Error('Payment processing failed: Card Declined');
      }

      await tx.customer.upsert({
        where: { email: customer.email },
        update: {
          name: fullName,
          phone: customer.phone,
          address: shippingAddress,
        },
        create: {
          email: customer.email,
          phone: customer.phone,
          name: fullName,
          address: shippingAddress,
        }
      });

      return await tx.order.create({
        data: {
          totalAmount: serverCalculatedTotal,
          status: "completed", 
          shippingAddress: shippingAddress,
          shippingGateway: shippingMethod,
          customer: {
            connect: { email: customer.email }
          },
          items: {
            create: orderItemsPayload
          }
        }
      });
    });

    const cookieStore = await cookies();
    cookieStore.set('customer-session', order.customerId || '', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return { 
      success: true, 
      message: "Order successfully processed.",
      orderId: order.id
    };

  } catch (error) {

    if (error instanceof z.ZodError) {
      return { success: false, message: "Invalid payload detected during checkout authorization." };
    }

    if (error instanceof Error && error.message.includes('Insufficient stock')) {
       return { success: false, message: "Some items in your cart just went out of stock. Please restructure your cart." };
    }

    if (error instanceof Error && error.message.includes('Card Declined')) {
       return { success: false, message: "Your card was declined." };
    }

    // Log the internal error stack for server monitoring without exposing SQL/code details to the client
    console.error("[CHECKOUT_ACTION_ERROR]", error);
    
    
    return { success: false, message: "A critical system error occurred while securing your checkout." };
  }
}
