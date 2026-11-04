import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { Product } from "../api/types";

export const product: Product = {
  id: 1, name: "Classic Red Roses", slug: "classic-red-roses", sku: "BP-1", price: "49.00",
  category: { id: 1, name: "Roses", slug: "roses", description: "" },
  stock_quantity: 3, in_stock: true, is_low_stock: true, primary_image: null,
};

export const handlers = [
  http.get("/api/products/", () => HttpResponse.json({ count: 1, next: null, previous: null, results: [product] })),
  http.get("/api/products/:slug", () => HttpResponse.json(product)),
  http.get("/api/categories/", () => HttpResponse.json([product.category])),
];

export const server = setupServer(...handlers);
