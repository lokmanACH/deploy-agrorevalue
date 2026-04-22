"use client";

import { useState } from "react";
import { Plus, Upload, BadgeCheck, Loader2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Quality = "A" | "B" | "C";

type Wilaya = {
  id: string;
  name: string;
};

type Commune = {
  id: string;
  name: string;
};

type DonateFormState = {
  name: string;
  category: string;
  quantity: string;
  unit: string;
  quality: Quality;
  location: string;
  kiloPrice: string;
  deliveryPrice: string;
  duration: string;
  description: string;
  wilaya_id: string;
  commune_id: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["Légumes", "Fruits", "Céréales", "Légumineuses", "Huile", "Lait & dérivés", "Viandes", "Plantes aromatiques", "Engrais"];
const QUALITIES: readonly Quality[] = ["A", "B", "C"];
const OFFERS_PERIOD = ["3 Minutes", "24 heures", "48 heures", "78 heures"];

const qualityColors: Record<Quality, string> = {
  A: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  B: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  C: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
};

const EMPTY_FORM: DonateFormState = {
  name: "",
  category: "",
  quantity: "",
  unit: "kg",
  quality: "A",
  location: "",
  kiloPrice: "",
  deliveryPrice: "",
  duration: "",
  description: "",
  wilaya_id: "",
  commune_id: "",
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = "w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all";
const labelCls = "block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5";

// ─── DonateForm ───────────────────────────────────────────────────────────

export function DonateForm() {
  const [form, setForm] = useState<DonateFormState>(EMPTY_FORM);
  const [imageName, setImageName] = useState("");

  const loadingData = false;
  const loading = false;
  const wilayas: Wilaya[] = [];
  const filteredCommunes: Commune[] = [];

  const update = <K extends keyof DonateFormState>(field: K, value: DonateFormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Faire un don</h2>
      </div>

      <div className="p-6 space-y-5">

        {/* Image upload */}
        <div>
          <label className={labelCls}>Photos du lot</label>
          <label className="flex flex-col items-center justify-center h-32 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageName(e.target.files?.[0]?.name ?? "")} />
            {imageName ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <BadgeCheck className="w-4 h-4" />
                <span className="truncate max-w-xs">{imageName}</span>
              </div>
            ) : (
              <>
                <Upload className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500 transition-colors mb-1.5" />
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Cliquez pour uploader des photos</span>
                <span className="text-xs text-zinc-400 mt-0.5">PNG, JPG jusqu'à 5 MB chacun</span>
              </>
            )}
          </label>
        </div>

        {/* Name + category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nom du produit</label>
            <input type="text" placeholder="Ex : Tomates fraîches" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Catégorie</label>
            <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputCls}>
              <option value="">Sélectionner…</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Quantity + quality */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Quantité disponible</label>
            <input type="number" placeholder="Ex : 1200" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Qualité</label>
            <div className="flex gap-2 h-10">
              {QUALITIES.map((q) => (
                <button
                  key={q}
                  onClick={() => update("quality", q)}
                  className={`flex-1 rounded-lg border text-sm font-semibold transition-all ${
                    form.quality === q
                      ? qualityColors[q]
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wilaya + Commune */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Wilaya (Province)</label>
            {loadingData ? (
              <div className={`${inputCls} flex items-center justify-center`}>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              </div>
            ) : (
              <select value={form.wilaya_id || ""} onChange={(e) => update("wilaya_id", e.target.value)} className={inputCls} disabled={loading}>
                <option value="">Sélectionner une wilaya…</option>
                {wilayas.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className={labelCls}>Commune</label>
            {loadingData ? (
              <div className={`${inputCls} flex items-center justify-center`}>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              </div>
            ) : !form.wilaya_id ? (
              <div className="text-sm text-zinc-500 dark:text-zinc-400 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                Sélectionnez d'abord une wilaya
              </div>
            ) : filteredCommunes.length === 0 ? (
              <div className="text-sm text-zinc-500 dark:text-zinc-400 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                Aucune commune disponible
              </div>
            ) : (
              <select value={form.commune_id || ""} onChange={(e) => update("commune_id", e.target.value)} className={inputCls} disabled={loading}>
                <option value="">Sélectionner une commune…</option>
                {filteredCommunes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Description <span className="text-zinc-400">(optionnel)</span></label>
          <textarea
            rows={3}
            placeholder="Informations supplémentaires sur le lot…"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => setForm(EMPTY_FORM)}
            className="h-10 px-5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            Réinitialiser
          </button>
          <button
            className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter le don
          </button>
        </div>
      </div>
    </div>
  );
}