import { api } from "./client";
import type { Order, Paginated, ShippingInput } from "./types";

export const ordersApi = {
  checkout: (shipping: ShippingInput) => api.post<Order>("/checkout/", shipping).then((r) => r.data),
  list: () => api.get<Paginated<Order>>("/orders/").then((r) => r.data),
  get: (number: string) => api.get<Order>(`/orders/${number}/`).then((r) => r.data),
  confirmPayment: (number: string) =>
    api.post<Order>(`/payments/${number}/confirm/`).then((r) => r.data),
};
