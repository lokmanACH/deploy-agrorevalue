'use client';

import { useState } from "react";
import {
  Plus, Package, MapPin, Clock, Trash2, TrendingUp, BadgeCheck,
  Hourglass, Users, ChevronDown, Award, Pencil, X, Loader2, AlertCircle,
} from "lucide-react";
import { api } from "@/utils/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Allocation {
  id: number;
  buyerName: string;
  quantity: number;
  finalPrice: number;
  order: number;
}

interface Buyer {
  bidId: number;
  buyerId: number;
  name: string;
  quantity: string;
  proposedPrice: number;
}

interface Offer {
  id: number;
  image: string;
  name: string;
  category: string;
  quantity: string;
  quality: "A" | "B" | "C";
  location: string;
  kiloPrice: number;
  totalPrice: number;
  deliveryPrice: number;
  timeLeft: string;
  status: "active" | "pending" | "sold" | "expired";
  offers: number;
  buyers?: Buyer[];
  allocations?: Allocation[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const statusConfig = {
  active:  { label: "Active",      className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
  pending: { label: "En attente",  className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  sold:    { label: "Vendu",       className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  expired: { label: "Expirée",     className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700" },
};

const inputCls = "w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all";
const labelCls = "block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5";

// ─── EditModal ────────────────────────────────────────────────────────────────

interface EditModalProps {
  offer: Offer;
  onClose: () => void;
  onSaved: (updated: Partial<Offer> & { id: number }) => void;
}

function EditModal({ offer, onClose, onSaved }: EditModalProps) {
  const [form, setForm] = useState({
    name:          offer.name,
    kiloPrice:     String(offer.kiloPrice),
    totalPrice:    String(offer.totalPrice),
    deliveryPrice: String(offer.deliveryPrice),
    quantity:      offer.quantity,
    status:        offer.status,
    quality:       offer.quality,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const qty = parseInt(form.quantity);
      const kp  = parseInt(form.kiloPrice);

      let totalPrice: number;
      let startingPrice: number;

      if (form.quality === "C") {
        // For quality C, kiloPrice is the total price directly
        totalPrice = kp;
        startingPrice = kp / qty;
      } else {
        // For quality A/B, kiloPrice is per unit
        totalPrice = qty * kp;
        startingPrice = kp;
      }

      const payload: Record<string, unknown> = {
        title:              form.name,
        starting_price:     startingPrice,
        price_full_sale:    totalPrice,
        deliveryPrice:      parseInt(form.deliveryPrice) || 0,
        quantity_available: qty,
        status:             form.status,
      };

      await api.put(`products/${offer.id}`, payload);

      onSaved({
        id:           offer.id,
        name:         form.name,
        kiloPrice:    startingPrice,
        totalPrice:   totalPrice,
        deliveryPrice: parseInt(form.deliveryPrice) || 0,
        quantity:     form.quantity,
        status:       form.status as Offer["status"],
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-0.5">
          Modifier l'offre
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
          Mettez à jour les informations de votre lot.
        </p>

        {error && (
          <div className="mb-4 flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className={labelCls}>Nom du produit</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputCls}
              disabled={loading}
            />
          </div>

          {/* Quantity + kilo price / total price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Quantité (kg)</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                className={inputCls}
                disabled={loading}
              />
            </div>
            <div>
              <label className={labelCls}>
                {form.quality === "C" ? "Prix total du lot (DA)" : "Prix au kilo (DA)"}
              </label>
              <input
                type="number"
                value={form.quality === "C" ? form.totalPrice : form.kiloPrice}
                onChange={(e) => update("kiloPrice", e.target.value)}
                className={inputCls}
                disabled={loading}
                placeholder={form.quality === "C" ? "5000" : "185"}
              />
              {form.quality === "C" && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Prix complet sans calcul au kilo</p>
              )}
            </div>
          </div>

          {/* Delivery price */}
          <div>
            <label className={labelCls}>Frais de livraison (DA)</label>
            <input
              type="number"
              value={form.deliveryPrice}
              onChange={(e) => update("deliveryPrice", e.target.value)}
              className={inputCls}
              disabled={loading}
            />
          </div>

          {/* Status */}
          <div>
            <label className={labelCls}>Statut</label>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className={inputCls}
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="pending">En attente</option>
              <option value="closed">Fermée</option>
            </select>
          </div>

          {/* Computed total preview */}
          {form.quantity && form.kiloPrice && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-emerald-700 dark:text-emerald-400">Prix total</span>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                {form.quality === "C" 
                  ? Number(form.kiloPrice).toLocaleString("fr-DZ")
                  : (Number(form.quantity) * Number(form.kiloPrice)).toLocaleString("fr-DZ")
                } DA
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-10 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DeleteConfirmModal ────────────────────────────────────────────────────────

interface DeleteConfirmProps {
  offer: Offer;
  onClose: () => void;
  onConfirmed: (id: number) => void;
}

function DeleteConfirmModal({ offer, onClose, onConfirmed }: DeleteConfirmProps) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`products/${offer.id}`);
      onConfirmed(offer.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Supprimer cette offre ?
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Cette action est irréversible.
            </p>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 mb-5">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{offer.name}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{offer.quantity} · {offer.category}</p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-10 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 h-10 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── StatsBar ─────────────────────────────────────────────────────────────────

function StatsBar({ offers }: { offers: Offer[] }) {
  const active  = offers.filter((o) => o.status === "active").length;
  const sold    = offers.filter((o) => o.status === "sold").length;
  const pending = offers.filter((o) => o.status === "pending").length;

  const stats = [
    { label: "Offres actives",  value: active,  icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    { label: "Ventes conclues", value: sold,    icon: BadgeCheck, color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-950/30" },
    { label: "En attente",      value: pending, icon: Hourglass,  color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/30" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{s.label}</p>
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{s.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── OfferRow ─────────────────────────────────────────────────────────────────

interface OfferRowProps {
  offer: Offer;
  onDelete:   (id: number) => void;
  onUpdate:   (updated: Partial<Offer> & { id: number }) => void;
}

function OfferRow({ offer, onDelete, onUpdate }: OfferRowProps) {
  const [expanded,     setExpanded]     = useState(false);
  const [showEdit,     setShowEdit]     = useState(false);
  const [showDeleteDlg, setShowDeleteDlg] = useState(false);

  const cfg        = statusConfig[offer.status];
  const buyers     = offer.buyers     ?? [];
  const allocations = offer.allocations ?? [];
  const isSold     = offer.status === "sold" && allocations.length > 0;

  return (
    <>
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        {/* ── Main row ── */}
        <div
          className="p-4 flex gap-4 items-start hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          onClick={() => setExpanded((v) => !v)}
        >
          {/* Product image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={offer.image}
            alt={offer.name}
            className="w-16 h-16 rounded-lg object-cover shrink-0 bg-zinc-100 dark:bg-zinc-800"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">{offer.name}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{offer.category}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${cfg.className}`}>
                {cfg.label}
              </span>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <Package className="w-3 h-3" />{offer.quantity}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <MapPin className="w-3 h-3" />{offer.location}
              </span>
              {offer.status === "active" && (
                <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <Clock className="w-3 h-3" />
                  {offer.quality === "A" || offer.quality === "B" 
                    ? "Permanent" 
                    : offer.timeLeft}
                </span>
              )}
              {offer.offers > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <TrendingUp className="w-3 h-3" />{offer.offers} proposition{offer.offers > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {offer.totalPrice.toLocaleString("fr-DZ")}
                </span>
                <span className="text-xs text-zinc-500">DA</span>
                <span className="text-xs text-zinc-400 ml-1">{offer.quality === "C" ? " (prix total)" : offer.kiloPrice + " /kg"}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Expand buyers */}
                <button
                  onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  {isSold ? "Allocations" : "Acheteurs"}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>

                {/* Edit */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />Modifier
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDeleteDlg(true); }}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-red-100 dark:border-red-900/50 text-xs text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Buyers/Allocations panel ── */}
        {expanded && (
          <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-3">
            {isSold ? (
              <>
                <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5" />
                  Gagnants de l'enchère
                </p>
                <div className="space-y-2">
                  {allocations.map((alloc) => (
                    <div
                      key={alloc.id}
                      className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-950/10 rounded-lg border border-emerald-100 dark:border-emerald-900/30"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                        {alloc.order}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{alloc.buyerName}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{alloc.quantity} kg</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {alloc.finalPrice.toLocaleString("fr-DZ")} DA
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {(alloc.finalPrice / alloc.quantity).toFixed(2)} DA/kg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-3">
                  Propositions reçues
                </p>
                {buyers.length === 0 ? (
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
                    Aucune proposition pour le moment.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {buyers.map((buyer) => (
                      <div
                        key={buyer.bidId}
                        className="flex items-center gap-3 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-400 shrink-0">
                          {buyer.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                          {buyer.name}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-3">{buyer.quantity}</span>
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {buyer.proposedPrice.toFixed(2)} DA/kg
                        </span>
                        <div className="ml-4 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                          Total :{" "}
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            {(buyer.proposedPrice * parseInt(buyer.quantity)).toLocaleString("fr-DZ")} DA
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showEdit && (
        <EditModal
          offer={offer}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => {
            onUpdate(updated);
            setShowEdit(false);
          }}
        />
      )}
      {showDeleteDlg && (
        <DeleteConfirmModal
          offer={offer}
          onClose={() => setShowDeleteDlg(false)}
          onConfirmed={(id) => {
            onDelete(id);
            setShowDeleteDlg(false);
          }}
        />
      )}
    </>
  );
}

// ─── OffersTab ────────────────────────────────────────────────────────────────

interface OffersTabProps {
  offers: Offer[];
  onDelete: (id: number) => void;
  onUpdate: (updated: Partial<Offer> & { id: number }) => void;
  onAddNew: () => void;
}

export function OffersTab({ offers, onDelete, onUpdate, onAddNew }: OffersTabProps) {
  return (
    <div>
      <StatsBar offers={offers} />

      {offers.length > 0 ? (
        <div className="space-y-3">
          {offers.map((offer) => (
            <OfferRow
              key={offer.id}
              offer={offer}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-zinc-900 dark:text-zinc-50 font-medium mb-1">Aucune offre publiée</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Commencez par ajouter votre premier lot.</p>
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter une offre
          </button>
        </div>
      )}
    </div>
  );
}