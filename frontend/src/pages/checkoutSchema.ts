import { z } from "zod";

export const shippingSchema = z.object({
  shipping_name: z.string().min(2, "Name is required"),
  shipping_address1: z.string().min(3, "Address is required"),
  shipping_address2: z.string().optional(),
  shipping_city: z.string().min(2, "City is required"),
  shipping_postal_code: z.string().min(3, "Postal code is required"),
  shipping_country: z.string().length(2, "Use a 2-letter country code"),
  shipping_phone: z.string().optional(),
  notes: z.string().optional(),
});

export type ShippingForm = z.infer<typeof shippingSchema>;
