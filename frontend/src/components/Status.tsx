export function Spinner({ label = "Loading…" }: { label?: string }) {
  return <p className="text-ink-500 py-16 text-center text-sm">{label}</p>;
}

export function ErrorBox({ message }: { message: string }) {
  return <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 text-sm">{message}</div>;
}

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-gold-400/30 text-ink-900",
    paid: "bg-sage-100 text-sage-700",
    fulfilled: "bg-sage-600 text-white",
    cancelled: "bg-cream-200 text-ink-500",
  };
  const label: Record<string, string> = { pending: "Awaiting payment", paid: "Paid", fulfilled: "Delivered", cancelled: "Cancelled" };
  return <span className={`chip ${map[status] ?? ""}`}>{label[status] ?? status}</span>;
}

export function PageHeader({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <div className="mb-10">
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h1 className="text-4xl md:text-5xl font-medium">{title}</h1>
      {intro && <p className="text-ink-500 mt-3 max-w-xl">{intro}</p>}
    </div>
  );
}
