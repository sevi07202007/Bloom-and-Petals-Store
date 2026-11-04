interface Props {
  value: number;
  max?: number;
  small?: boolean;
  onChange: (value: number) => void;
}

export default function QuantityInput({ value, max, small, onChange }: Props) {
  const pad = small ? "px-2 py-0.5 text-sm" : "px-3.5 py-2";
  return (
    <div className="inline-flex items-center rounded-full border border-cream-200 bg-white">
      <button type="button" aria-label="Decrease" className={`${pad} text-ink-500 hover:text-rose-700`} onClick={() => onChange(value - 1)}>−</button>
      <span className={`min-w-[2rem] text-center text-sm font-medium`} data-testid="qty">{value}</span>
      <button type="button" aria-label="Increase" className={`${pad} text-ink-500 hover:text-rose-700 disabled:opacity-30`} disabled={max !== undefined && value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}
