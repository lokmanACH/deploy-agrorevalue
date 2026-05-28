"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, AlertCircle, CheckCircle, X } from "lucide-react";
import { api, getUser } from "@/utils/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DonationFormProps {
  organizationId: number;
  organizationName: string;
  organizationEmail: string;
  onSuccess: () => void;
  onClose: () => void;
}

interface RawProduct {
  id: number;
  seller_id: number;
  category_id: number;
  title: string;
  description: string;
  quality: "A" | "B" | "C";
  quantity_available: number;
  price_full_sale: number;
  starting_price: number;
  location_id: number;
  deliveryPrice: number;
  status: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

interface RawCategory {
  id: number;
  name: string;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = "w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all";
const textareaCls = "w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none";
const labelCls = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2";
const buttonCls = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200";

const EMPTY_FORM = {
  product_id: 0,
  quantity: "",
  message: "",
};

export const DonationForm = ({
  organizationId,
  organizationName,
  organizationEmail,
  onSuccess,
  onClose,
}: DonationFormProps) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [products, setProducts] = useState<RawProduct[]>([]);
  const [categories, setCategories] = useState<RawCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ─── Load seller products ─────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getUser();
        if (!user?.id) throw new Error("Not authenticated");

        const [productsRes, categoriesRes] = await Promise.all([
          api.get(`/api/products?seller_id=${user.id}`),
          api.get("/api/categories"),
        ]) as [{ data: RawProduct[] }, { data: RawCategory[] }];

        setProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        setError("Impossible de charger les produits");
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ─── Handle form changes ──────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "product_id" ? parseInt(value) : value,
    }));
  };

  // ─── Handle submission ────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.product_id || !form.quantity) {
      setError("Veuillez sélectionner un produit et la quantité");
      return;
    }

    const quantityNum = parseInt(form.quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError("La quantité doit être un nombre positif");
      return;
    }

    try {
      setSubmitting(true);
      const user = await getUser();

      // Create donation record (backend would handle email sending)
      const response = await api.post("/api/donations", {
        seller_id: user?.id,
        organization_id: organizationId,
        product_id: form.product_id,
        quantity: quantityNum,
        message: form.message,
        organization_email: organizationEmail,
        organization_name: organizationName,
      });

      setSuccess(true);
      onSuccess();

      // Reset form after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Erreur lors de la création du don"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Get selected product for quantity validation ────────────────────────────

  const selectedProduct = products.find((p) => p.id === form.product_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Faire un don à {organizationName}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error message */}
          {error && (
            <div className="flex items-gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="flex items-gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Don créé avec succès!
              </p>
            </div>
          )}

          {/* Product selection */}
          <div>
            <label htmlFor="product_id" className={labelCls}>
              Sélectionner un produit
            </label>
            {products.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Aucun produit disponible. Créez d'abord un produit.
              </p>
            ) : (
              <select
                id="product_id"
                name="product_id"
                value={form.product_id}
                onChange={handleChange}
                className={inputCls}
                required
              >
                <option value={0}>-- Choisir un produit --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title} (Disponible: {product.quantity_available} unités)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className={labelCls}>
              Quantité à donner
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="ex: 10"
              min="1"
              max={selectedProduct?.quantity_available || undefined}
              className={inputCls}
              required
            />
            {selectedProduct && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Disponible: {selectedProduct.quantity_available} unités
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className={labelCls}>
              Message (optionnel)
            </label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Ajouter une note ou un message..."
              rows={3}
              className={textareaCls}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`${buttonCls} flex-1 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700`}
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`${buttonCls} flex-1 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={submitting || !products.length}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer le don
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
