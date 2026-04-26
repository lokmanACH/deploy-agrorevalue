"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/utils/apiClient";
import { Loader2, AlertCircle } from "lucide-react";

const DEV_CREDENTIALS = [
  { role: "admin",   email: "admin@email.com",   password: "1234" },
  { role: "vendeur",  email: "seller1@email.com",  password: "1234" },
  { role: "vendeur",  email: "seller2@email.com",  password: "1234" },
  { role: "acheteur 1", email: "buyer11@email.com",  password: "1234" },
  { role: "acheteur 2", email: "buyer10@email.com",  password: "1234" },
  { role: "association", email: "association@email.com",  password: "1234" },
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOpen, setDevOpen] = useState(false);
  const [activeCredential, setActiveCredential] = useState<number | null>(null);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const loginAs = (index: number) => {
    setActiveCredential(index);
    setForm({
      email: DEV_CREDENTIALS[index].email,
      password: DEV_CREDENTIALS[index].password,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await signIn(form.email, form.password);

      if (user.role === "buyer")       router.push("/buyer");
      else if (user.role === "seller") router.push("/seller");
      else if (user.role === "admin")  router.push("/admin");
      else if (user.role === "association")  router.push("/association");
      else router.push("/");
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              AR
            </div>
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              AgroRevalue
            </span>
          </Link>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Connexion
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Bienvenue, connectez-vous à votre compte
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">
              Adresse e-mail
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="contact@entreprise.dz"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
              disabled={loading}
              className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-zinc-500 dark:text-zinc-400">
                Mot de passe
              </label>
            </div>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              disabled={loading}
              className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Connexion…" : "Se connecter"}
          </button>

        </form>
      </div>

      {/* Dev credentials */}
      
      <button
        type="button"
        onClick={() => setDevOpen(!devOpen)}
        className="fixed bottom-3 right-3 z-10"
      >
        <span className="fixed bottom-3 right-3 z-10 text-[12px] px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800">
          Clickez pour tester avec des comptes pré-remplis
        </span>
      </button>
      {devOpen && (
      <div className="fixed bottom-0 right-0 p-3 font-mono">
        <div className="mb-2 min-w-50 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 shadow-sm">
          {DEV_CREDENTIALS.map((c, i) => (
            <div
              key={c.email}
              className="flex items-center justify-between gap-2 py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400">{c.role}</span>
                <span className="text-xs text-zinc-700 dark:text-zinc-300">{c.email}</span>
                <span className="text-xs text-zinc-700 dark:text-zinc-300">{c.password}</span>
              </div>
              <button
                type="button"
                onClick={() => loginAs(i)}
                className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                  activeCredential === i
                    ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-transparent"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                {activeCredential === i ? "activé" : "utiliser"}
              </button>
            </div>
          ))}
        </div>
      </div>
      )}
    
    </div> 
  );
}