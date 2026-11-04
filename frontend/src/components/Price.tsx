export function formatPrice(value: string | number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export function Price({ value, className }: { value: string | number; className?: string }) {
  return <span className={className}>{formatPrice(value)}</span>;
}
