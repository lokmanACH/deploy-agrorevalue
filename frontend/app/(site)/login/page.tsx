"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/utils/apiClient";
import { Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await signIn(form.email, form.password);

      // Redirect by role
      if (user.role === "buyer")  router.push("/buyer");
      else if (user.role === "seller") router.push("/seller");
      else if (user.role === "admin")  router.push("/admin");
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

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 pt-1 pb-2">
            Credentials de démonstration :{" "}
            <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
              buyer1@email.com / 1234
            </span>
          </p>
        </form>

      </div>
    </div>
  );
}