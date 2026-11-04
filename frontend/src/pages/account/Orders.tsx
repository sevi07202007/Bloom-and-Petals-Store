import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ordersApi } from "../../api/orders";
import { Price } from "../../components/Price";
import { OrderStatusBadge, PageHeader, Spinner } from "../../components/Status";
import { ArrowIcon } from "../../components/ui/Icons";

export default function Orders() {
  const orders = useQuery({ queryKey: ["orders"], queryFn: ordersApi.list });
  if (orders.isLoading) return <Spinner />;
  const list = orders.data?.results ?? [];
  return (
    <div className="container-x py-10 max-w-3xl">
      <PageHeader eyebrow="Account" title="My orders" />
      {list.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl mb-2">No orders yet</p>
          <Link to="/shop" className="text-rose-700 text-sm">Find something lovely</Link>
        </div>
      ) : (
        <ul className="card divide-y divide-cream-200">
          {list.map((o) => (
            <li key={o.id}>
              <Link to={`/account/orders/${o.number}`} className="flex items-center justify-between gap-4 p-5 hover:bg-cream-50 transition">
                <div>
                  <p className="font-medium">{o.number}</p>
                  <p className="text-sm text-ink-500">{new Date(o.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })} · {o.items.reduce((n, i) => n + i.quantity, 0)} items</p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={o.status} />
                  <Price value={o.total} className="font-medium" />
                  <ArrowIcon width={16} height={16} className="text-ink-300" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
