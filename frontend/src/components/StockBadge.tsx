import type { Product } from "../api/types";

export function StockBadge({ product }: { product: Product }) {
  if (!product.in_stock) return <span className="chip bg-ink-900/80 text-cream-50 backdrop-blur">Sold out</span>;
  if (product.is_low_stock)
    return <span className="chip bg-gold-400/90 text-ink-900 backdrop-blur">Only {product.stock_quantity} left</span>;
  return null;
}

export function StockText({ product }: { product: Product }) {
  if (!product.in_stock) return <span className="text-sm text-ink-500">Currently sold out</span>;
  if (product.is_low_stock) return <span className="text-sm text-gold-500 font-medium">Only {product.stock_quantity} left in the studio</span>;
  return <span className="text-sm text-sage-600 font-medium">In stock · ready for same-day delivery</span>;
}
