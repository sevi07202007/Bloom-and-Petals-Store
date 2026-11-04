import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ordersApi } from "../../api/orders";
import { Price } from "../../components/Price";
import { OrderStatusBadge, Spinner } from "../../components/Status";
import ErrorPage from "../../components/ErrorPage";
import axios from "axios";

export default function OrderDetail() {
  const { number = "" } = useParams();
  const order = useQuery({ queryKey: ["order", number], queryFn: () => ordersApi.get(number) });
  if (order.isLoading) return <Spinner />;
  if (order.isError || !order.data) {
    const status = axios.isAxiosError(order.error) ? order.error.response?.status : undefined;
    return <ErrorPage kind={status === 403 || status === 401 ? 403 : status === 404 ? 404 : 500} />;
  }
  const o = order.data;
  return (
    <div className="container-x py-10 max-w-4xl">
      <Link to="/account/orders" className="text-sm text-ink-500 hover:text-rose-700">← All orders</Link>
      <div className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{new Date(o.created_at).toLocaleDateString(undefined, { dateStyle: "long" })}</p>
          <h1 className="text-4xl font-medium">{o.number}</h1>
        </div>
        <OrderStatusBadge status={o.status} />
      </div>
      <div className="grid md:grid-cols-[minmax(0,1fr)_300px] gap-6">
        <div className="card p-6 space-y-3">
          <h2 className="font-display text-2xl mb-2">Items</h2>
          {o.items.map((i) => (
            <div key={i.id} className="flex justify-between text-sm"><span>{i.quantity} × {i.product_name} <span className="text-ink-300">@ <Price value={i.unit_price} /></span></span><Price value={i.line_total} /></div>
          ))}
          <div className="border-t border-cream-200 pt-3 flex justify-between font-medium text-lg"><span>Total</span><Price value={o.total} /></div>
        </div>
        <div className="card p-6 text-sm space-y-1">
          <h2 className="font-display text-2xl mb-2">Delivery</h2>
          <p className="font-medium">{o.shipping_name}</p>
          <p>{o.shipping_address1}</p>
          {o.shipping_address2 && <p>{o.shipping_address2}</p>}
          <p>{o.shipping_city}, {o.shipping_postal_code}</p>
          <p>{o.shipping_country}</p>
          {o.notes && <p className="text-ink-500 italic pt-2">“{o.notes}”</p>}
          {o.paid_at && <p className="text-ink-500 pt-3 text-xs">Paid {new Date(o.paid_at).toLocaleString()}</p>}
        </div>
      </div>
    </div>
  );
}
