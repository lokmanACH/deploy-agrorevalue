"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Store } from "lucide-react";

type AccountType = "buyer" | "seller" | null;

const PRODUCTS = [
  "Céréales", "Légumineuses", "Fruits frais", "Légumes",
  "Huile d'olive", "Dattes", "Lait & dérivés", "Viandes",
  "Plantes aromatiques", "Engrais",
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptNotifs, setAcceptNotifs] = useState(false);

  const [form, setForm] = useState({
    name: "",
    rc: "",
    phone: "",
    location: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleProduct = (product: string) =>
    setSelectedProducts((prev) =>
      prev.includes(product) ? prev.filter((p) => p !== product) : [...prev, product]
    );

  const handleSubmit = () => {
    if (!acceptTerms) return alert("Veuillez accepter les conditions d'utilisation.");
    if (!acceptNotifs) return alert("Veuillez accepter de recevoir les notifications.");
    console.log({ ...form, accountType, selectedProducts });
    // TODO: call your API here
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">

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
            Créer un compte
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Rejoignez la plateforme de revalorisation agricole
          </p>

          {/* Step indicators */}
          <div className="flex gap-1.5 mt-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  n < step
                    ? "bg-emerald-600"
                    : n === step
                    ? "bg-emerald-400"
                    : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="px-7 py-6">

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Account type */}
              <div>
                <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                  Type de compte
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["buyer", "seller"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setAccountType(type)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                        accountType === type
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        accountType === type
                          ? "bg-emerald-100 dark:bg-emerald-900/50"
                          : "bg-zinc-100 dark:bg-zinc-800"
                      }`}>
                        {type === "buyer"
                          ? <ShoppingCart className={`w-4 h-4 ${accountType === type ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"}`} />
                          : <Store className={`w-4 h-4 ${accountType === type ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"}`} />
                        }
                      </div>
                      <span className={`text-sm font-medium ${accountType === type ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-700 dark:text-zinc-300"}`}>
                        {type === "buyer" ? "Acheteur" : "Vendeur"}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {type === "buyer" ? "Acheter des lots agricoles" : "Mettre en vente des lots"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Nom de l&apos;établissement
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : SAS AgroNord"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">
                    N° registre du commerce
                  </label>
                  <input
                    type="text"
                    placeholder="RC123456"
                    value={form.rc}
                    onChange={(e) => update("rc", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    placeholder="+213 6XX XXX XXX"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Localisation
                  </label>
                  <input
                    type="text"
                    placeholder="Alger, Constantine…"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <p className="text-xs text-zinc-400 mt-1">Peut être précisée ultérieurement</p>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Continuer
              </button>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Adresse e-mail professionnelle
                </label>
                <input
                  type="email"
                  placeholder="contact@entreprise.dz"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <p className="text-xs text-zinc-400 mt-1">
                  Doit correspondre au domaine de votre entreprise pour validation
                </p>
              </div>

              <div>
                <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Mot de passe
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              {/* Buyer product preferences */}
              {accountType === "buyer" && (
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1">
                    Produits qui vous intéressent
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                    Recevez des notifications à chaque nouvel ajout correspondant à vos préférences
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCTS.map((product) => (
                      <button
                        key={product}
                        onClick={() => toggleProduct(product)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-150 ${
                          selectedProducts.includes(product)
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                            : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                        }`}
                      >
                        {product}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="h-10 px-5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    J&apos;accepte les{" "}
                    <Link href="/terms" className="text-emerald-600 hover:underline">
                      conditions d&apos;utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link href="/privacy" className="text-emerald-600 hover:underline">
                      politique de confidentialité
                    </Link>{" "}
                    de la plateforme.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptNotifs}
                    onChange={(e) => setAcceptNotifs(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    J&apos;accepte de recevoir des notifications relatives aux nouvelles offres et aux activités de la plateforme.
                  </span>
                </label>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Votre compte sera vérifié via votre{" "}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    numéro de registre du commerce
                  </span>{" "}
                  et votre{" "}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    adresse e-mail professionnelle
                  </span>
                  . Un email de confirmation vous sera envoyé après soumission.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="h-10 px-5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Créer mon compte
                </button>
              </div>
            </div>
          )}
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-4">
                Vous avez déjà un compte ?{" "}
                <Link href="/login" className="text-emerald-600 font-medium hover:underline">
                  Se connecter
                </Link>
            </p>

        </div>
      </div>
    </div>
  );
}