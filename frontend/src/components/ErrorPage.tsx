import { Link } from "react-router-dom";
import { BloomMark } from "./ui/Logo";

export type ErrorKind = 404 | 403 | 500;

const COPY: Record<ErrorKind, { eyebrow: string; title: string; text: string }> = {
  404: { eyebrow: "404 · Not found", title: "This page has wilted", text: "The link may be old, or the page was moved. Let's get you back to something fresh." },
  403: { eyebrow: "403 · No access", title: "This garden is staff only", text: "You don't have permission to view this page. If you think you should, sign in with a different account." },
  500: { eyebrow: "500 · Something went wrong", title: "We dropped the vase", text: "An unexpected error happened on our side. Try again in a moment, or head back home." },
};

/** A drooping version of the bloom mark for error states. */
function WiltedBloom() {
  return (
    <div className="relative mx-auto w-40 h-40 mb-8">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-100 via-cream-100 to-sage-100" />
      <div className="absolute inset-0 flex items-center justify-center">
        <BloomMark size={96} className="rotate-[28deg] translate-y-2 drop-shadow-sm animate-fadeUp" />
      </div>
      {/* fallen petals */}
      <span className="absolute left-6 bottom-5 w-4 h-7 rounded-full bg-rose-300/70 rotate-[60deg]" />
      <span className="absolute right-7 bottom-3 w-3.5 h-6 rounded-full bg-rose-400/60 -rotate-[25deg]" />
      <span className="absolute right-14 bottom-1 w-3 h-5 rounded-full bg-rose-200 rotate-[15deg]" />
    </div>
  );
}

interface Props {
  kind: ErrorKind;
  detail?: string;
  onRetry?: () => void;
}

export default function ErrorPage({ kind, detail, onRetry }: Props) {
  const copy = COPY[kind];
  return (
    <div className="container-x py-16 md:py-24">
      <div className="max-w-lg mx-auto text-center animate-fadeUp">
        <WiltedBloom />
        <p className="eyebrow mb-3">{copy.eyebrow}</p>
        <h1 className="text-4xl md:text-5xl font-medium leading-tight mb-4">{copy.title}</h1>
        <p className="text-ink-500 leading-relaxed">{copy.text}</p>
        {detail && <p className="mt-4 text-xs text-ink-300 font-mono break-words">{detail}</p>}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          {kind === 500 && <button className="btn-secondary" onClick={onRetry ?? (() => window.location.reload())}>Try again</button>}
          {kind === 403 && <Link to="/login" className="btn-secondary">Sign in</Link>}
          <Link to="/" className="btn-primary" reloadDocument={kind === 500}>Back home</Link>
          <Link to="/shop" className="btn-ghost">Browse the shop</Link>
        </div>
      </div>
    </div>
  );
}
