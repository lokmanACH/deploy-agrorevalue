"use client";

import { useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { api, getUser } from "@/utils/apiClient";

interface Product {
  id: number;
  name: string;
  quantity: string | number;
  kiloPrice: number;
  totalPrice: number;
}

interface NegotiateModalProps {
  product: Product;
  onClose: () => void;
}

export function NegotiateModal({ product, onClose }: NegotiateModalProps) {
  const [quantity, setQuantity] = useState("");
  const [offerKiloPrice, setOfferKiloPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const user = getUser();

    if (!user) {
      setError("Vous devez être connecté pour proposer un prix.");
      return;
    }

    const qty = Number(quantity);
    const price = Number(offerKiloPrice);

    if (!quantity || isNaN(qty) || qty <= 0) {
      setError("Veuillez saisir une quantité valide.");
      return;
    }

    if (!offerKiloPrice || isNaN(price) || price <= 0) {
      setError("Veuillez saisir un prix valide.");
      return;
    }

    try {
      setLoading(true);
      const obj = {
        product_id: product.id,
        buyer_id: user.id,
        quantity_requested: qty,
        price_per_kg: price,
        total_price: price * qty,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      
      await api.post("bids", obj);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de l'envoi de l'offre. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-7 relative">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
          Proposer un prix
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
          Faites une offre pour{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{product.name}</span>.{" "}
          Le vendeur sera notifié.
        </p>

        {error && (
          <div className="mb-5 flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Quantité</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">{product.quantity}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Prix au Kilo</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {product.kiloPrice.toLocaleString("fr-DZ")} DA
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Prix demandé</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {product.totalPrice.toLocaleString("fr-DZ")} DA
            </span>
          </div>
        </div>

        <div className="mb-5 space-y-4">
          <div>
            <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">
              Quantité souhaitée
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="Ex : 1000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={loading}
                className="w-full h-10 px-3 pr-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">kg</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">
              Prix au kilo proposé
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="Ex : 50"
                value={offerKiloPrice}
                onChange={(e) => setOfferKiloPrice(e.target.value)}
                disabled={loading}
                className="w-full h-10 px-3 pr-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">DA</span>
            </div>
            {offerKiloPrice && Number(offerKiloPrice) < product.kiloPrice && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">
                Votre prix est{" "}
                {Math.round((1 - Number(offerKiloPrice) / product.kiloPrice) * 100)}% en dessous
                du prix demandé.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-10 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button 
            className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-50" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Envoyer l'offre"}
          </button>
        </div>
      </div>
    </div>
  );
}