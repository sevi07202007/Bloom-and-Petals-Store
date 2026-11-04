import { useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useCart } from "../cart/useCart";
import { BagIcon, CloseIcon, MenuIcon, UserIcon } from "./ui/Icons";
import Logo from "./ui/Logo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const [open, setOpen] = useState(false);

  const link = ({ isActive }: { isActive: boolean }) =>
    `text-sm tracking-wide transition ${isActive ? "text-rose-700" : "text-ink-700 hover:text-rose-700"}`;

  return (
    <header className="sticky top-0 z-30 bg-cream-50/85 backdrop-blur border-b border-cream-200">
      <div className="bg-sage-700 text-cream-50 text-xs text-center py-1.5 tracking-wide">
        Free same-day delivery on orders over $60 · Hand-tied fresh every morning
      </div>
      <div className="container-x h-16 flex items-center justify-between gap-6">
        <button className="md:hidden p-2 -ml-2 text-ink-700" aria-label="Menu" onClick={() => setOpen(true)}>
          <MenuIcon />
        </button>

        <Logo />

        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <NavLink to="/shop" className={link}>Shop all</NavLink>
          <NavLink to="/shop?category=roses" className={link}>Roses</NavLink>
          <NavLink to="/shop?category=seasonal-bouquets" className={link}>Seasonal</NavLink>
          <NavLink to="/shop?category=plants" className={link}>Plants</NavLink>
          <NavLink to="/shop?category=occasions" className={link}>Occasions</NavLink>
        </nav>

        <div className="flex items-center gap-1">
          {user ? (
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/account/orders" className="btn-ghost px-3"><UserIcon /> <span>{user.first_name || "Account"}</span></NavLink>
              {user.is_staff && <a href="/admin/" className="btn-ghost px-3 text-sage-700">Admin</a>}
              <button onClick={logout} className="btn-ghost px-3 text-ink-500">Sign out</button>
            </div>
          ) : (
            <NavLink to="/login" className="hidden md:inline-flex btn-ghost px-3"><UserIcon /> Sign in</NavLink>
          )}
          <button onClick={openDrawer} className="relative p-2 text-ink-900 hover:text-rose-700 transition" aria-label="Open cart">
            <BagIcon width={22} height={22} />
            {itemCount > 0 && (
              <span data-testid="cart-badge" className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-rose-600 text-white text-[10px] font-semibold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {open && createPortal(
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-cream-50 shadow-lift p-6 flex flex-col gap-6 animate-fadeUp">
            <div className="flex items-center justify-between">
              <Logo size="sm" to={null} />
              <button onClick={() => setOpen(false)} aria-label="Close"><CloseIcon /></button>
            </div>
            <nav className="flex flex-col gap-4 text-lg font-display" onClick={() => setOpen(false)}>
              <Link to="/shop">Shop all</Link>
              <Link to="/shop?category=roses">Roses</Link>
              <Link to="/shop?category=seasonal-bouquets">Seasonal</Link>
              <Link to="/shop?category=tulips">Tulips</Link>
              <Link to="/shop?category=plants">Plants</Link>
              <Link to="/shop?category=occasions">Occasions</Link>
            </nav>
            <div className="mt-auto border-t border-cream-200 pt-4 flex flex-col gap-3 text-sm" onClick={() => setOpen(false)}>
              {user ? (
                <>
                  <Link to="/account/orders">My orders</Link>
                  {user.is_staff && <a href="/admin/">Admin</a>}
                  <button className="text-left text-ink-500" onClick={logout}>Sign out</button>
                </>
              ) : (
                <Link to="/login" className="btn-primary">Sign in</Link>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
}
