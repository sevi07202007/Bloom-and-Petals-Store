import { api } from "./client";
import type { CartItem, ServerCart } from "./types";

export const cartApi = {
  get: () => api.get<ServerCart>("/cart/").then((r) => r.data),
  add: (product_id: number, quantity: number) =>
    api.post<CartItem>("/cart/items/", { product_id, quantity }).then((r) => r.data),
  update: (id: number, quantity: number) =>
    api.patch<CartItem>(`/cart/items/${id}/`, { quantity }).then((r) => r.data),
  remove: (id: number) => api.delete(`/cart/items/${id}/`),
  merge: (items: { product_id: number; quantity: number }[]) =>
    api.post<ServerCart>("/cart/merge/", items).then((r) => r.data),
  clear: () => api.delete("/cart/clear/"),
};
