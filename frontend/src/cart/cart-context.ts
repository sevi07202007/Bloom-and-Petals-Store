import { createContext } from "react";
import type { Product } from "../api/types";

/** A unified cart line regardless of whether the cart lives locally or on the server. */
export interface CartLine {
  key: string;
  product: Product;
  quantity: number;
  lineTotal: number;
}

export interface CartState {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  add: (product: Product, quantity?: number) => Promise<void>;
  setQuantity: (line: CartLine, quantity: number) => Promise<void>;
  remove: (line: CartLine) => Promise<void>;
  clear: () => Promise<void>;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const CartContext = createContext<CartState | null>(null);
