import { Link } from "react-router-dom";
import type { Product } from "../api/types";
import { useCart } from "../cart/useCart";
import { Price } from "./Price";
import { StockBadge } from "./StockBadge";
import { ProductImage } from "./ui/ProductImage";
import { useToast } from "./ui/useToast";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { toast } = useToast();

  const onAdd = async () => {
    await add(product, 1);
    toast({ title: "Added to your bag", description: product.name });
  };

  return (
    <div className="group animate-fadeUp">
      <Link to={`/products/${product.slug}`} className="relative block aspect-[4/5] rounded-2xl overflow-hidden bg-cream-100">
        <ProductImage product={product} className="transition duration-700 group-hover:scale-105" />
        <div className="absolute top-3 left-3"><StockBadge product={product} /></div>
        {product.in_stock && (
          <button
            onClick={(e) => { e.preventDefault(); onAdd(); }}
            className="absolute bottom-3 inset-x-3 btn-dark opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
          >
            Add to bag
          </button>
        )}
      </Link>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <Link to={`/products/${product.slug}`} className="font-medium text-sm leading-snug hover:text-rose-700">{product.name}</Link>
          <p className="text-xs text-ink-500 mt-0.5">{product.category.name}</p>
        </div>
        <Price value={product.price} className="text-sm font-medium whitespace-nowrap" />
      </div>
      {!product.in_stock && (
        <button className="btn-secondary w-full mt-3 md:hidden" disabled>Out of stock</button>
      )}
      {product.in_stock && (
        <button className="btn-secondary w-full mt-3 md:hidden" onClick={onAdd}>Add to bag</button>
      )}
    </div>
  );
}
