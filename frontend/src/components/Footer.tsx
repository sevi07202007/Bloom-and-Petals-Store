import { Link } from "react-router-dom";
import Logo from "./ui/Logo";

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink-900 text-cream-100">
      <div className="container-x py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-4"><Logo size="lg" tone="light" /></div>
          <p className="text-sm text-ink-300 max-w-sm leading-relaxed">
            A small neighbourhood florist. Every stem is chosen at the morning market, conditioned in our studio,
            and hand-tied the day it's delivered.
          </p>
        </div>
        <div>
          <p className="eyebrow text-rose-300 mb-4">Shop</p>
          <ul className="space-y-2 text-sm text-ink-300">
            <li><Link to="/shop?category=roses" className="hover:text-white">Roses</Link></li>
            <li><Link to="/shop?category=seasonal-bouquets" className="hover:text-white">Seasonal bouquets</Link></li>
            <li><Link to="/shop?category=plants" className="hover:text-white">Plants</Link></li>
            <li><Link to="/shop?category=occasions" className="hover:text-white">Occasions</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-rose-300 mb-4">Studio</p>
          <ul className="space-y-2 text-sm text-ink-300">
            <li>12 Petal Lane, Springfield</li>
            <li>Mon – Sat, 8am – 6pm</li>
            <li>hello@bloomandpetals.example</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-5 text-xs text-ink-300 flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Bloom &amp; Petals. Case-study project.</span>
          <span>Photography via Wikimedia Commons, CC licensed.</span>
        </div>
      </div>
    </footer>
  );
}
