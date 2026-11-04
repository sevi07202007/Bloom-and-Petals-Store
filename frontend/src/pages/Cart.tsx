import { Link } from "react-router-dom";
import { useCart } from "../cart/useCart";
import { Price } from "../components/Price";
import QuantityInput from "../components/QuantityInput";
import { PageHeader, Spinner } from "../components/Status";
import { ProductImage } from "../components/ui/ProductImage";
import { TrashIcon } from "../components/ui/Icons";

export default function Cart() {
  const { lines, subtotal, loading, setQuantity, remove } = useCart();

  if (loading) return <Spinner />;
  if (lines.length === 0)
    return (
      <div className="container-x py-24 text-center">
        <p className="font-display text-4xl mb-3">Your bag is empty</p>
        <p className="text-ink-500 mb-8">Fresh stems are waiting in the shop.</p>
        <Link to="/shop" className="btn-primary">Browse flowers</Link>
      </div>
    );

  return (
    <div className="container-x py-10">
      <PageHeader eyebrow="Your bag" title={`${lines.length} ${lines.length === 1 ? "item" : "items"}`} />
      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-10 items-start">
        <ul className="card divide-y divide-cream-200">
          {lines.map((line) => (
            <li key={line.key} className="p-5 flex gap-5">
              <Link to={`/products/${line.product.slug}`} className="w-24 h-28 rounded-xl overflow-hidden flex-shrink-0"><ProductImage product={line.product} /></Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${line.product.slug}`} className="font-medium hover:text-rose-700">{line.product.name}</Link>
                <p className="text-sm text-ink-500"><Price value={line.product.price} /> each</p>
                {line.quantity > line.product.stock_quantity && (
                  <p className="text-xs text-rose-700 mt-1">Only {line.product.stock_quantity} available right now</p>
                )}
                <div className="mt-3 flex items-center gap-4">
                  <QuantityInput value={line.quantity} max={line.product.stock_quantity} onChange={(v) => setQuantity(line, v)} />
                  <button className="text-ink-300 hover:text-rose-600 flex items-center gap-1 text-xs" onClick={() => remove(line)}><TrashIcon width={14} height={14} /> Remove</button>
                </div>
              </div>
              <Price value={line.lineTotal} className="font-medium" />
            </li>
          ))}
        </ul>
        <aside className="card p-6 space-y-4 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl">Summary</h2>
          <div className="flex justify-between text-sm"><span className="text-ink-500">Subtotal</span><Price value={subtotal} /></div>
          <div className="flex justify-between text-sm"><span className="text-ink-500">Delivery</span><span className="text-sage-600">Free</span></div>
          <div className="border-t border-cream-200 pt-4 flex justify-between font-medium text-lg"><span>Total</span><Price value={subtotal} /></div>
          <Link to="/checkout" className="btn-primary w-full py-3">Checkout</Link>
          <Link to="/shop" className="block text-center text-sm text-ink-500 hover:text-rose-700">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
