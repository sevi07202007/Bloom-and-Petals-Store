import { Link } from "react-router-dom";
import { useCart } from "../cart/useCart";
import { Price } from "./Price";
import QuantityInput from "./QuantityInput";
import { ProductImage } from "./ui/ProductImage";
import { CloseIcon, TrashIcon } from "./ui/Icons";

export default function MiniCart() {
  const { drawerOpen, closeDrawer, lines, subtotal, itemCount, setQuantity, remove } = useCart();
  if (!drawerOpen) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-ink-900/40" onClick={closeDrawer} />
      <aside className="absolute inset-y-0 right-0 w-[min(100vw,26rem)] bg-cream-50 shadow-lift flex flex-col animate-slideIn" aria-label="Cart">
        <div className="flex items-center justify-between px-6 h-16 border-b border-cream-200">
          <h2 className="font-display text-2xl">Your bag <span className="text-ink-300 text-lg">({itemCount})</span></h2>
          <button onClick={closeDrawer} aria-label="Close cart" className="p-2 -mr-2"><CloseIcon /></button>
        </div>

        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
            <p className="font-display text-2xl">Your bag is empty</p>
            <p className="text-sm text-ink-500">Fresh stems are waiting.</p>
            <Link to="/shop" onClick={closeDrawer} className="btn-primary">Browse the shop</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-cream-200 px-6">
              {lines.map((line) => (
                <li key={line.key} className="py-4 flex gap-4">
                  <div className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0"><ProductImage product={line.product} /></div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${line.product.slug}`} onClick={closeDrawer} className="font-medium text-sm hover:text-rose-700 line-clamp-2">{line.product.name}</Link>
                    <p className="text-xs text-ink-500 mt-0.5"><Price value={line.product.price} /></p>
                    <div className="mt-2 flex items-center justify-between">
                      <QuantityInput small value={line.quantity} max={line.product.stock_quantity} onChange={(v) => setQuantity(line, v)} />
                      <button onClick={() => remove(line)} className="text-ink-300 hover:text-rose-600" aria-label="Remove"><TrashIcon width={16} height={16} /></button>
                    </div>
                  </div>
                  <Price value={line.lineTotal} className="text-sm font-medium" />
                </li>
              ))}
            </ul>
            <div className="border-t border-cream-200 p-6 space-y-4 bg-white">
              <div className="flex justify-between font-medium"><span>Subtotal</span><Price value={subtotal} /></div>
              <p className="text-xs text-ink-500">Delivery calculated at checkout.</p>
              <Link to="/checkout" onClick={closeDrawer} className="btn-primary w-full">Checkout</Link>
              <Link to="/cart" onClick={closeDrawer} className="btn-secondary w-full">View bag</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
