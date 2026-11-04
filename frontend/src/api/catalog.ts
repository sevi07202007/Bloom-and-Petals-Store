import { api } from "./client";
import type { Category, Paginated, Product } from "./types";

export interface ProductQuery {
  category?: string;
  search?: string;
  in_stock?: boolean;
  ordering?: string;
  page?: number;
}

export const catalogApi = {
  categories: () => api.get<Category[]>("/categories/").then((r) => r.data),
  products: (params: ProductQuery = {}) =>
    api.get<Paginated<Product>>("/products/", { params }).then((r) => r.data),
  product: (slug: string) => api.get<Product>(`/products/${slug}/`).then((r) => r.data),
};
