import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ordersApi } from "../api/orders";
import { Price } from "../components/Price";
import { OrderStatusBadge, Spinner } from "../components/Status";
import { CheckIcon } from "../components/ui/Icons";

export default function OrderConfirmation() {
  const { number = "" } = useParams();
  const order = useQuery({ queryKey: ["order", number], queryFn: () => ordersApi.get(number) });
  if (order.isLoading || !order.data) return <Spinner />;
  const o = order.data;
  return (
    <div className="container-x py-16">
      <div className="max-w-xl mx-auto text-center animate-fadeUp">
        <div className="mx-auto w-16 h-16 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center mb-6"><CheckIcon width={28} height={28} /></div>
        <p className="eyebrow mb-2">Order {o.number}</p>
        <h1 className="text-4xl md:text-5xl font-medium">Thank you, {o.shipping_name.split(" ")[0]}.</h1>
        <p className="text-ink-500 mt-4">Your flowers are being wrapped. Status: <OrderStatusBadge status={o.status} /></p>
        <p className="text-xs text-ink-500 mt-3">Payment status is simulated for this school project. No payment was collected or verified.</p>

        <div className="card p-6 mt-10 text-left space-y-3">
          {o.items.map((i) => (
            <div key={i.id} className="flex justify-between text-sm"><span>{i.quantity} × {i.product_name}</span><Price value={i.line_total} /></div>
          ))}
          <div className="border-t border-cream-200 pt-3 flex justify-between font-medium"><span>Total</span><Price value={o.total} /></div>
          <p className="text-xs text-ink-500 pt-2">Delivering to {o.shipping_address1}, {o.shipping_city} {o.shipping_postal_code}</p>
        </div>

        <div className="flex gap-3 justify-center mt-8">
          <Link to="/account/orders" className="btn-secondary">My orders</Link>
          <Link to="/shop" className="btn-primary">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
