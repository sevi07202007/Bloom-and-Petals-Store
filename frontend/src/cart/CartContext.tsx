import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../api/cart";
import { catalogApi } from "../api/catalog";
import type { Product } from "../api/types";
import { useAuth } from "../auth/useAuth";
import { addToLocal, cartStorage, setLocalQuantity, type LocalCartItem } from "./cartStorage";
import { CartContext, type CartLine, type CartState } from "./cart-context";

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [local, setLocal] = useState<LocalCartItem[]>(() => cartStorage.read());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    cartStorage.write(local);
  }, [local]);

  // Logged in: cart comes from the server.
  const serverCart = useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.get,
    enabled: !!user,
  });

  // Logged out: we only store ids+qty, so fetch product details for display.
  const localIds = local.map((i) => i.product_id);
  const localProducts = useQuery({
    queryKey: ["cart-products", localIds],
    queryFn: async () => {
      const page = await catalogApi.products({ page: 1 });
      // Small catalog; fetch all pages lazily if needed.
      const all = [...page.results];
      let next = page.next;
      let pageNo = 2;
      while (next) {
        const more = await catalogApi.products({ page: pageNo++ });
        all.push(...more.results);
        next = more.next;
      }
      return all.filter((p) => localIds.includes(p.id));
    },
    enabled: !user && local.length > 0,
  });

  // On login, merge the guest cart into the server cart once.
  useEffect(() => {
    if (!user || authLoading) return;
    const guest = cartStorage.read();
    if (guest.length === 0) return;
    cartApi
      .merge(guest)
      .then(() => {
        cartStorage.clear();
        setLocal([]);
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      })
      .catch(() => {
        /* leave guest cart intact so nothing is lost */
      });
  }, [user, authLoading, queryClient]);

  const lines: CartLine[] = useMemo(() => {
    if (user) {
      return (serverCart.data?.items ?? []).map((i) => ({
        key: String(i.id),
        product: i.product,
        quantity: i.quantity,
        lineTotal: Number(i.line_total),
      }));
    }
    const byId = new Map((localProducts.data ?? []).map((p) => [p.id, p]));
    return local.flatMap((i) => {
      const product = byId.get(i.product_id);
      return product
        ? [{ key: `local-${i.product_id}`, product, quantity: i.quantity, lineTotal: Number(product.price) * i.quantity }]
        : [];
    });
  }, [user, serverCart.data, local, localProducts.data]);

  const invalidate = useCallback(() => queryClient.invalidateQueries({ queryKey: ["cart"] }), [queryClient]);

  const add = useCallback(
    async (product: Product, quantity = 1) => {
      if (user) {
        await cartApi.add(product.id, quantity);
        await invalidate();
      } else {
        setLocal((items) => addToLocal(items, product.id, quantity));
      }
    },
    [user, invalidate],
  );

  const setQuantity = useCallback(
    async (line: CartLine, quantity: number) => {
      if (user) {
        if (quantity <= 0) await cartApi.remove(Number(line.key));
        else await cartApi.update(Number(line.key), quantity);
        await invalidate();
      } else {
        setLocal((items) => setLocalQuantity(items, line.product.id, quantity));
      }
    },
    [user, invalidate],
  );

  const remove = useCallback((line: CartLine) => setQuantity(line, 0), [setQuantity]);

  const clear = useCallback(async () => {
    if (user) {
      await cartApi.clear();
      await invalidate();
    } else {
      setLocal([]);
    }
  }, [user, invalidate]);

  const value = useMemo<CartState>(
    () => ({
      lines,
      itemCount: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.lineTotal, 0),
      loading: user ? serverCart.isLoading : localProducts.isLoading,
      add,
      setQuantity,
      remove,
      clear,
      drawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [lines, user, serverCart.isLoading, localProducts.isLoading, add, setQuantity, remove, clear, drawerOpen, openDrawer, closeDrawer],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
