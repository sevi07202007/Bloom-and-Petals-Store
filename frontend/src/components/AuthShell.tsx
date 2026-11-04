import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { catalogApi } from "../api/catalog";
import { ProductImage } from "./ui/ProductImage";
import { CheckIcon } from "./ui/Icons";
import Logo from "./ui/Logo";

const PERKS = ["Same-day delivery before 1pm", "Order history and easy reorders", "Saved delivery details"];

export default function AuthShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  const featured = useQuery({
    queryKey: ["products", { in_stock: true, ordering: "-price" }],
    queryFn: () => catalogApi.products({ in_stock: true, ordering: "-price" }),
    staleTime: 5 * 60_000,
  });
  const hero = featured.data?.results.find((p) => p.primary_image) ?? featured.data?.results[0];

  return (
    <div className="min-h-[calc(100vh-7rem)] grid lg:grid-cols-[1.1fr_1fr]">
      {/* Photo panel */}
      <aside className="relative hidden lg:block overflow-hidden">
        {hero ? <ProductImage product={hero} className="absolute inset-0" /> : <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-cream-100 to-sage-100" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/30 to-transparent" />
        <div className="relative h-full flex flex-col justify-between p-12 text-cream-50">
          <Logo tone="light" />
          <div className="max-w-md animate-fadeUp">
            <p className="eyebrow text-rose-300 mb-4">From the studio</p>
            <p className="font-display text-4xl xl:text-5xl leading-[1.08]">
              “The flowers arrived before I'd finished my coffee.”
            </p>
            <p className="text-cream-200 text-sm mt-5">— Priya, a regular on Petal Lane</p>
            {hero && (
              <Link to={`/products/${hero.slug}`} className="mt-8 inline-flex items-center gap-3 rounded-full bg-white/10 backdrop-blur px-4 py-2 text-sm hover:bg-white/20 transition">
                <span className="text-cream-200">Pictured</span>
                <span className="font-medium">{hero.name}</span>
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <section className="flex items-center justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-md animate-fadeUp">
          <p className="eyebrow mb-3">Welcome</p>
          <h1 className="text-4xl md:text-5xl font-medium leading-tight mb-3">{title}</h1>
          <p className="text-ink-500 mb-8">{intro}</p>
          <div className="card p-6 md:p-8">{children}</div>
          <ul className="mt-8 space-y-2 text-sm text-ink-500">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center"><CheckIcon width={12} height={12} /></span>
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
