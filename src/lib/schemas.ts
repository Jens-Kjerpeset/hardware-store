import { z } from "zod";

export const checkoutSchema = z.object({
  productIds: z.custom<string[]>((val) => Array.isArray(val) && val.length > 0, "Cart cannot be empty"),
  customer: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please provide a valid email address"),
    phone: z.string().min(8, "Valid phone number is required"),
    address: z.string().min(1, "Address is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    city: z.string().min(1, "City is required"),
  }),
  shippingMethod: z.enum(["standard", "express", "pickup"]),
  paymentMethod: z.enum(["creditcard", "vipps", "klarna"]),
  cardNumber: z.string().optional(),
  acceptTerms: z.literal(true, {
    message: "You must accept the terms of service."
  })
});
