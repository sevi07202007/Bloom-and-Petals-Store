import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { errorMessage } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { ErrorBox } from "../components/Status";
import AuthShell from "../components/AuthShell";
import AuthField from "../components/AuthField";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(form);
      navigate(params.get("next") ?? "/");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create an account" intro="Save your details, track orders, and reorder favourites.">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <AuthField id="first_name" label="First name" value={form.first_name} onChange={update("first_name")} required autoComplete="given-name" />
          <AuthField id="last_name" label="Last name" value={form.last_name} onChange={update("last_name")} required autoComplete="family-name" />
        </div>
        <AuthField id="email" label="Email" type="email" value={form.email} onChange={update("email")} required autoComplete="email" placeholder="you@example.com" />
        <AuthField id="password" label="Password" type="password" value={form.password} onChange={update("password")} minLength={8} required autoComplete="new-password" placeholder="At least 8 characters" />
        {error && <ErrorBox message={error} />}
        <button className="btn-primary w-full py-3" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
        <p className="text-sm text-center text-ink-500">Already have an account? <Link to="/login" className="text-rose-700">Sign in</Link></p>
      </form>
    </AuthShell>
  );
}
