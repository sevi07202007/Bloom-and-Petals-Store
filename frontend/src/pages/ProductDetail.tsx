import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { catalogApi } from "../api/catalog";
import { useCart } from "../cart/useCart";
import { Price } from "../components/Price";
import ProductCard from "../components/ProductCard";
import QuantityInput from "../components/QuantityInput";
import ErrorPage from "../components/ErrorPage";
import { StockText } from "../components/StockBadge";
import { CheckIcon, LeafIcon, TruckIcon } from "../components/ui/Icons";
import { ProductImage } from "../components/ui/ProductImage";
import { Skeleton } from "../components/ui/Skeleton";
import { useToast } from "../components/ui/useToast";

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const { add, openDrawer } = useCart();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const product = useQuery({ queryKey: ["product", slug], queryFn: () => catalogApi.product(slug) });
  const related = useQuery({
    queryKey: ["products", { category: product.data?.category.slug, in_stock: true }],
    queryFn: () => catalogApi.products({ category: product.data!.category.slug, in_stock: true }),
    enabled: !!product.data,
  });

  if (product.isLoading)
    return (
      <div className="container-x py-10 grid md:grid-cols-2 gap-12">
        <Skeleton className="aspect-[4/5] rounded-[2rem]" />
        <div className="space-y-4 pt-6"><Skeleton className="h-4 w-24" /><Skeleton className="h-12 w-3/4" /><Skeleton className="h-6 w-20" /><Skeleton className="h-24" /></div>
      </div>
    );
  if (product.isError || !product.data) return <ErrorPage kind={404} />;
  const p = product.data;

  const onAdd = async () => {
    await add(p, qty);
    toast({ title: `Added ${qty} to your bag`, description: p.name });
    openDrawer();
  };

  return (
    <div className="container-x py-10">
      <nav className="text-xs text-ink-500 mb-6 flex gap-2">
        <Link to="/shop" className="hover:text-rose-700">Shop</Link><span>/</span>
        <Link to={`/shop?category=${p.category.slug}`} className="hover:text-rose-700">{p.category.name}</Link><span>/</span>
        <span className="text-ink-900">{p.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
        <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-soft animate-fadeUp"><ProductImage product={p} /></div>

        <div className="md:sticky md:top-28 animate-fadeUp [animation-delay:80ms]">
          <p className="eyebrow mb-3">{p.category.name}</p>
          <h1 className="text-4xl md:text-5xl font-medium leading-tight">{p.name}</h1>
          <div className="mt-4 flex items-baseline gap-4">
            <Price value={p.price} className="text-2xl font-medium" />
            <StockText product={p} />
          </div>
          <p className="mt-6 text-ink-700 leading-relaxed">{p.description}</p>

          <div className="mt-8 flex items-center gap-4">
            <QuantityInput value={qty} max={p.stock_quantity} onChange={(v) => setQty(Math.max(1, v))} />
            <button className="btn-primary flex-1 py-3 text-base" disabled={!p.in_stock} onClick={onAdd}>
              {p.in_stock ? "Add to bag" : "Sold out"}
            </button>
          </div>

          <ul className="mt-8 space-y-3 text-sm text-ink-700 border-t border-cream-200 pt-6">
            <li className="flex gap-3"><TruckIcon className="text-rose-600 flex-shrink-0" /> Same-day delivery when ordered before 1pm</li>
            <li className="flex gap-3"><LeafIcon className="text-rose-600 flex-shrink-0" /> Foam-free, wrapped in recycled kraft paper</li>
            <li className="flex gap-3"><CheckIcon className="text-rose-600 flex-shrink-0" /> 7-day freshness guarantee</li>
          </ul>
          <p className="mt-6 text-xs text-ink-300">SKU {p.sku}</p>
        </div>
      </div>

      {related.data && related.data.results.filter((r) => r.id !== p.id).length > 0 && (
        <section className="mt-24">
          <p className="eyebrow mb-2">You may also like</p>
          <h2 className="text-3xl font-medium mb-8">More from {p.category.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {related.data.results.filter((r) => r.id !== p.id).slice(0, 4).map((r) => <ProductCard key={r.id} product={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
