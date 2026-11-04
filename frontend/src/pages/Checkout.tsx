import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../api/orders";
import { errorMessage } from "../api/client";
import type { InsufficientStockError } from "../api/types";
import { useAuth } from "../auth/useAuth";
import { useCart } from "../cart/useCart";
import { Price } from "../components/Price";
import { ErrorBox } from "../components/Status";
import { ProductImage } from "../components/ui/ProductImage";

import { shippingSchema, type ShippingForm } from "./checkoutSchema";

export default function Checkout() {
  const { user } = useAuth();
  const { lines, subtotal } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { shipping_name: `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim(), shipping_country: "US", shipping_phone: user?.phone ?? "" },
  });

  const onSubmit = async (data: ShippingForm) => {
    if (submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const order = await ordersApi.checkout(data);
      await ordersApi.confirmPayment(order.number); // stubbed payment provider
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      navigate(`/orders/${order.number}/confirmation`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        const data = err.response.data as InsufficientStockError;
        setError(`Not enough stock: ${data.insufficient.map((i) => `${i.name} (only ${i.available} left)`).join(", ")}`);
        await queryClient.invalidateQueries({ queryKey: ["cart"] });
      } else {
        setError(errorMessage(err));
      }
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  const field = (name: keyof ShippingForm, label: string, placeholder?: string) => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} className="input" {...register(name)} placeholder={placeholder} />
      {errors[name] && <p className="text-xs text-rose-700 mt-1">{errors[name]?.message}</p>}
    </div>
  );

  return (
    <div className="container-x py-10">
      <div className="mb-8"><p className="eyebrow mb-2">Almost there</p><h1 className="text-4xl md:text-5xl font-medium">Checkout</h1></div>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-10 items-start">
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 md:p-8 space-y-5" noValidate>
          <h2 className="font-display text-2xl">Where should we deliver?</h2>
          {field("shipping_name", "Recipient name")}
          {field("shipping_address1", "Address")}
          {field("shipping_address2", "Apartment, suite (optional)")}
          <div className="grid sm:grid-cols-2 gap-5">
            {field("shipping_city", "City")}
            {field("shipping_postal_code", "Postal code")}
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {field("shipping_country", "Country code", "US")}
            {field("shipping_phone", "Phone (optional)")}
          </div>
          <div>
            <label className="label" htmlFor="notes">Card message or delivery notes</label>
            <textarea id="notes" className="input" rows={3} placeholder="“Happy birthday, Mum. Love always.”" {...register("notes")} />
          </div>
          {error && <ErrorBox message={error} />}
          <button className="btn-primary w-full py-3 text-base" disabled={submitting || lines.length === 0}>
            {submitting ? "Placing your order…" : <>Place order · <Price value={subtotal} /></>}
          </button>
          <p className="text-xs text-ink-500 text-center">School-project payment simulation: no payment is collected or verified.</p>
        </form>

        <aside className="card p-6 space-y-4 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl">Your bag</h2>
          {lines.length === 0 && <p className="text-sm text-ink-500">Nothing in your bag yet. <Link to="/shop" className="text-rose-700">Shop</Link></p>}
          <ul className="space-y-3">
            {lines.map((l) => (
              <li key={l.key} className="flex gap-3 items-center text-sm">
                <div className="w-12 h-14 rounded-lg overflow-hidden flex-shrink-0"><ProductImage product={l.product} /></div>
                <span className="flex-1 min-w-0 truncate">{l.quantity} × {l.product.name}</span>
                <Price value={l.lineTotal} />
              </li>
            ))}
          </ul>
          <div className="border-t border-cream-200 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-500">Subtotal</span><Price value={subtotal} /></div>
            <div className="flex justify-between"><span className="text-ink-500">Delivery</span><span className="text-sage-600">Free</span></div>
            <div className="flex justify-between font-medium text-lg pt-2"><span>Total</span><Price value={subtotal} /></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
