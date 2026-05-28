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
  deliveryPrice: number;
  quality?: "A" | "B" | "C";
}

interface BuyModalProps {
  product: Product;
  onClose: () => void;
}

export function BuyModal({ product, onClose }: BuyModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState("");

  const maxQuantity = typeof product.quantity === "string" 
    ? parseFloat(product.quantity) 
    : product.quantity;

  const parsedSelected = selectedQuantity ? parseFloat(selectedQuantity) : 0;
  const totalCost = parsedSelected * product.kiloPrice + product.deliveryPrice;

  const onSubmit = async () => {
    setError(null);
    const user = getUser();
    
    if (!user) {
      setError("Vous devez être connecté pour acheter ce produit.");
      return;
    }

    const qty = parseFloat(selectedQuantity);
    if (!selectedQuantity || isNaN(qty) || qty <= 0) {
      setError("Veuillez saisir une quantité valide.");
      return;
    }

    if (qty > maxQuantity) {
      setError(`La quantité ne peut pas dépasser ${maxQuantity} kg.`);
      return;
    }

    try {
      setLoading(true);
      
      const obj = {
        product_id: product.id,
        buyer_id: user.id,
        quantity_requested: qty,
        price_per_kg: product.kiloPrice,
        total_price: product.kiloPrice * qty,
        status: "pending",
        created_at: new Date().toISOString()
      };
      
      const res_bid = await api.post<any>("bids", obj);
      
      await api.post("allocations", {
        product_id: product.id,
        buyer_id: user.id,
        bid_id: res_bid.id,
        allocated_quantity: qty,
        final_price: product.kiloPrice * qty + product.deliveryPrice,
        order: 1,
        created_at: new Date().toISOString()
      });
      
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de la confirmation de l'achat. Veuillez réessayer.");
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
          Confirmer l&apos;achat
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
          Sélectionnez la quantité que vous souhaitez acheter.
        </p>

        {error && (
          <div className="mb-5 flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Produit</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">{product.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Quantité disponible</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">{maxQuantity} kg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">{product.quality === "C" ? "Prix total" : "Prix au Kilo"}</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {product.kiloPrice.toLocaleString("fr-DZ")} DA
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Livraison</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {product.deliveryPrice.toLocaleString("fr-DZ")} DA
            </span>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">
            Quantité souhaitée <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder={`Max ${maxQuantity} kg`}
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(e.target.value)}
              disabled={loading}
              min="1"
              max={maxQuantity}
              className="w-full h-10 px-3 pr-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">kg</span>
          </div>
        </div>

        {selectedQuantity && parsedSelected > 0 && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-emerald-700 dark:text-emerald-400">Sous-total</span>
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                {(parsedSelected * product.kiloPrice).toLocaleString("fr-DZ")} DA
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-emerald-700 dark:text-emerald-400">Livraison</span>
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                {product.deliveryPrice.toLocaleString("fr-DZ")} DA
              </span>
            </div>
            <div className="border-t border-emerald-200 dark:border-emerald-800 pt-2 flex justify-between">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Total</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                {totalCost.toLocaleString("fr-DZ")} DA
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-10 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button 
            className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-50" 
            onClick={onSubmit}
            disabled={loading || !selectedQuantity || parseFloat(selectedQuantity) <= 0 || parseFloat(selectedQuantity) > maxQuantity}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}