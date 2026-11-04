import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { catalogApi } from "../api/catalog";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/ui/Skeleton";
import { ArrowIcon, HeartIcon, LeafIcon, TruckIcon } from "../components/ui/Icons";
import { ProductImage } from "../components/ui/ProductImage";

const CATEGORY_BLURB: Record<string, string> = {
  roses: "Classic, garden and blush",
  "seasonal-bouquets": "What's freshest right now",
  tulips: "Dutch stems, by the twenty",
  plants: "Green company for your home",
  occasions: "Say it with stems",
};

export default function Home() {
  const categories = useQuery({ queryKey: ["categories"], queryFn: catalogApi.categories });
  const fresh = useQuery({ queryKey: ["products", { in_stock: true, ordering: "-created_at" }], queryFn: () => catalogApi.products({ in_stock: true, ordering: "-created_at" }) });
  const hero = fresh.data?.results[0];

  return (
    <div>
      {/* Hero */}
      <section className="container-x pt-10 md:pt-16 pb-16 grid md:grid-cols-2 gap-10 items-center">
        <div className="animate-fadeUp">
          <p className="eyebrow mb-4">Hand-tied every morning</p>
          <h1 className="text-5xl md:text-7xl font-medium leading-[1.02]">
            Flowers that feel <em className="text-rose-600 not-italic font-normal italic">like a letter</em>
          </h1>
          <p className="mt-6 text-ink-500 max-w-md leading-relaxed">
            Seasonal bouquets and houseplants from our studio on Petal Lane. Chosen at dawn, wrapped by hand,
            delivered the same day.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="btn-primary px-7 py-3 text-base">Shop the collection <ArrowIcon width={18} height={18} /></Link>
            <Link to="/shop?category=seasonal-bouquets" className="btn-secondary px-7 py-3 text-base">This week's stems</Link>
          </div>
        </div>
        <div className="relative animate-fadeUp [animation-delay:120ms]">
          <div className="absolute -inset-4 bg-gradient-to-tr from-rose-100 via-cream-100 to-sage-100 rounded-[2.5rem] -z-10 rotate-2" />
          <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-lift">
            {hero ? <ProductImage product={hero} /> : <div className="w-full h-full skeleton" />}
          </div>
          {hero && (
            <Link to={`/products/${hero.slug}`} className="absolute bottom-5 left-5 card px-4 py-3 flex items-center gap-3 hover:shadow-lift transition">
              <span className="text-xs text-ink-500">Featured</span>
              <span className="text-sm font-medium">{hero.name}</span>
              <ArrowIcon width={16} height={16} className="text-rose-600" />
            </Link>
          )}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-cream-200 bg-white">
        <div className="container-x py-6 grid sm:grid-cols-3 gap-6 text-sm">
          {[
            { icon: <TruckIcon />, title: "Same-day delivery", text: "Order by 1pm, in their hands by evening." },
            { icon: <LeafIcon />, title: "Market fresh", text: "Stems chosen at the flower market each morning." },
            { icon: <HeartIcon />, title: "7-day freshness promise", text: "If it wilts early, we replace it. Simple." },
          ].map((f) => (
            <div key={f.title} className="flex gap-3 items-start">
              <span className="text-rose-600 mt-0.5">{f.icon}</span>
              <div><p className="font-medium">{f.title}</p><p className="text-ink-500">{f.text}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-x py-20">
        <div className="flex items-end justify-between mb-8">
          <div><p className="eyebrow mb-2">Browse</p><h2 className="text-4xl font-medium">By collection</h2></div>
          <Link to="/shop" className="hidden sm:inline-flex items-center gap-1 text-sm text-rose-700">All products <ArrowIcon width={16} height={16} /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.data?.map((c, i) => {
            const sample = fresh.data?.results.find((p) => p.category.slug === c.slug);
            return (
              <Link key={c.id} to={`/shop?category=${c.slug}`} className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-cream-100 animate-fadeUp" style={{ animationDelay: `${i * 60}ms` }}>
                {sample ? <ProductImage product={sample} className="transition duration-700 group-hover:scale-105" /> : null}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/10 to-transparent" />
                <div className="absolute bottom-0 p-4 text-cream-50">
                  <p className="font-display text-2xl leading-none">{c.name}</p>
                  <p className="text-xs text-cream-200 mt-1">{CATEGORY_BLURB[c.slug] ?? c.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Fresh this week */}
      <section className="container-x pb-20">
        <div className="flex items-end justify-between mb-8">
          <div><p className="eyebrow mb-2">Just in</p><h2 className="text-4xl font-medium">Fresh this week</h2></div>
        </div>
        {fresh.isLoading ? <ProductGridSkeleton /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {fresh.data?.results.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Story band */}
      <section className="bg-sage-700 text-cream-50">
        <div className="container-x py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="eyebrow text-rose-300 mb-3">Our studio</p>
            <h2 className="text-4xl md:text-5xl font-medium leading-tight">Small shop. Big on the little things.</h2>
          </div>
          <p className="text-cream-200 leading-relaxed">
            We're a two-person studio with one van and a lot of opinions about ranunculus. Every bouquet is
            conditioned overnight, wrapped in recycled kraft, and tied with cotton twine. No foam, no fuss.
          </p>
        </div>
      </section>
    </div>
  );
}
