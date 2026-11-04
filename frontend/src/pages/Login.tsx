import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { errorMessage } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { ErrorBox } from "../components/Status";
import AuthShell from "../components/AuthShell";
import AuthField from "../components/AuthField";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      navigate(params.get("next") ?? "/");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" intro="Sign in to see your orders and check out faster.">
      <form onSubmit={submit} className="space-y-4">
        <AuthField id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" />
        <AuthField id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••" />
        {error && <ErrorBox message={error} />}
        <button className="btn-primary w-full py-3" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        <p className="text-sm text-center text-ink-500">New here? <Link to={`/register${params.get("next") ? `?next=${params.get("next")}` : ""}`} className="text-rose-700">Create an account</Link></p>
        <div className="rounded-xl bg-cream-100 px-4 py-3 text-xs text-ink-500 text-center">
          Demo customer: <button type="button" className="font-medium text-rose-700" onClick={() => { setEmail("jane@example.com"); setPassword("customer123"); }}>jane@example.com / customer123</button>
        </div>
      </form>
    </AuthShell>
  );
}
