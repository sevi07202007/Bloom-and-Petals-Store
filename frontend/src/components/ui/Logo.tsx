import { Link } from "react-router-dom";

/** The bloom mark: five rose petals, a gold heart, and a sage leaf. */
export function BloomMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden>
      <defs>
        <linearGradient id="bp-petal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2778a" />
          <stop offset="1" stopColor="#b53352" />
        </linearGradient>
      </defs>
      <path d="M32 58 C32 46 26 40 18 38" fill="none" stroke="#3f6145" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M18 38 C11 36 9 30 12 27 C18 27 22 31 18 38 Z" fill="#527a58" />
      <g transform="translate(32 28)">
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} rx="7.5" ry="13" cy="-12" fill="url(#bp-petal)" transform={`rotate(${r})`} />
        ))}
        <circle r="5.5" fill="#d9b36a" />
        <circle r="2" cx="-1.5" cy="-1.5" fill="#fdfbf7" opacity=".8" />
      </g>
    </svg>
  );
}

interface LogoProps {
  size?: "sm" | "md" | "lg";
  tone?: "dark" | "light";
  to?: string | null;
  className?: string;
}

/** Mark + wordmark. Pass tone="light" on dark backgrounds. */
export default function Logo({ size = "md", tone = "dark", to = "/", className = "" }: LogoProps) {
  const text = { sm: "text-xl", md: "text-2xl md:text-[1.75rem]", lg: "text-3xl" }[size];
  const mark = { sm: 26, md: 34, lg: 44 }[size];
  const color = tone === "light" ? "text-cream-50" : "text-ink-900";
  const amp = tone === "light" ? "text-rose-300" : "text-rose-600";
  const inner = (
    <span className={`inline-flex items-center gap-2.5 font-display font-medium tracking-tight ${text} ${color} ${className}`}>
      <BloomMark size={mark} />
      <span>Bloom <span className={`${amp} italic`}>&amp;</span> Petals</span>
    </span>
  );
  return to ? <Link to={to} aria-label="Bloom & Petals home">{inner}</Link> : inner;
}
