export interface LocalCartItem {
  product_id: number;
  quantity: number;
}

const KEY = "bp_cart";

export const cartStorage = {
  read(): LocalCartItem[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as LocalCartItem[]) : [];
    } catch {
      return [];
    }
  },
  write(items: LocalCartItem[]) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* storage unavailable */
    }
  },
};

export function addToLocal(items: LocalCartItem[], product_id: number, quantity: number): LocalCartItem[] {
  const existing = items.find((i) => i.product_id === product_id);
  if (existing) {
    return items.map((i) => (i.product_id === product_id ? { ...i, quantity: i.quantity + quantity } : i));
  }
  return [...items, { product_id, quantity }];
}

export function setLocalQuantity(items: LocalCartItem[], product_id: number, quantity: number): LocalCartItem[] {
  if (quantity <= 0) return items.filter((i) => i.product_id !== product_id);
  return items.map((i) => (i.product_id === product_id ? { ...i, quantity } : i));
}
