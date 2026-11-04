import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { catalogApi } from "../api/catalog";
import ProductCard from "../components/ProductCard";
import { ErrorBox } from "../components/Status";
import { ProductGridSkeleton } from "../components/ui/Skeleton";
import { SearchIcon } from "../components/ui/Icons";

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const query = {
    category: params.get("category") ?? undefined,
    search: params.get("search") ?? undefined,
    in_stock: params.get("in_stock") === "1" ? true : undefined,
    ordering: params.get("ordering") ?? "name",
    page: Number(params.get("page") ?? 1),
  };
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  const categories = useQuery({ queryKey: ["categories"], queryFn: catalogApi.categories });
  const products = useQuery({ queryKey: ["products", query], queryFn: () => catalogApi.products(query) });
  const current = categories.data?.find((c) => c.slug === query.category);
  const pages = products.data ? Math.ceil(products.data.count / 24) : 0;

  return (
    <div className="container-x py-10">
      <div className="mb-8">
        <p className="eyebrow mb-2">{current ? "Collection" : "Shop"}</p>
        <h1 className="text-4xl md:text-5xl font-medium">{current?.name ?? "All flowers & plants"}</h1>
        {current?.description && <p className="text-ink-500 mt-2 max-w-xl">{current.description}</p>}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
        <button onClick={() => set("category", "")} className={`chip px-4 py-2 whitespace-nowrap border ${!query.category ? "bg-ink-900 text-cream-50 border-ink-900" : "bg-white border-cream-200 hover:border-rose-300"}`}>All</button>
        {categories.data?.map((c) => (
          <button key={c.id} onClick={() => set("category", c.slug)} className={`chip px-4 py-2 whitespace-nowrap border ${query.category === c.slug ? "bg-ink-900 text-cream-50 border-ink-900" : "bg-white border-cream-200 hover:border-rose-300"}`}>{c.name}</button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-10">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" width={18} height={18} />
          <input className="input pl-10" placeholder="Search roses, tulips, peonies…" defaultValue={query.search}
            onKeyDown={(e) => e.key === "Enter" && set("search", (e.target as HTMLInputElement).value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
          <input type="checkbox" className="accent-rose-600" checked={!!query.in_stock} onChange={(e) => set("in_stock", e.target.checked ? "1" : "")} /> In stock only
        </label>
        <div className="sm:ml-auto flex items-center gap-2 text-sm">
          <span className="text-ink-500">Sort</span>
          <select className="input w-auto py-2" value={query.ordering} onChange={(e) => set("ordering", e.target.value)}>
            <option value="name">Name</option>
            <option value="price">Price: low to high</option>
            <option value="-price">Price: high to low</option>
            <option value="-created_at">Newest</option>
          </select>
        </div>
      </div>

      {products.isLoading && <ProductGridSkeleton count={12} />}
      {products.isError && <ErrorBox message="Could not load products." />}
      {products.data && (
        <>
          <p className="text-xs text-ink-500 mb-6">{products.data.count} {products.data.count === 1 ? "product" : "products"}</p>
          {products.data.count === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-3xl">Nothing here yet</p>
              <p className="text-ink-500 mt-2">Try another collection or clear your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {products.data.results.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          {pages > 1 && (
            <div className="flex gap-2 justify-center mt-14">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={n === query.page ? "btn-dark w-10 px-0" : "btn-secondary w-10 px-0"} onClick={() => set("page", String(n))}>{n}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
