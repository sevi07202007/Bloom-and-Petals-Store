import type { Product } from "../../api/types";

const PETALS = ["from-rose-100 to-cream-100", "from-sage-100 to-cream-100", "from-cream-200 to-rose-50", "from-rose-50 to-sage-50"];

/** Product photo with a soft botanical fallback when no image is set. */
export function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  if (product.primary_image) {
    return <img src={product.primary_image} alt={product.name} loading="lazy" className={`w-full h-full object-cover ${className}`} />;
  }
  const grad = PETALS[product.id % PETALS.length];
  return (
    <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 120" className="w-1/2 h-1/2 text-rose-300/70" fill="currentColor" aria-hidden>
        {[0, 60, 120, 180, 240, 300].map((r) => (
          <ellipse key={r} cx="60" cy="38" rx="14" ry="26" transform={`rotate(${r} 60 60)`} />
        ))}
        <circle cx="60" cy="60" r="10" className="text-gold-400" fill="currentColor" />
      </svg>
    </div>
  );
}
