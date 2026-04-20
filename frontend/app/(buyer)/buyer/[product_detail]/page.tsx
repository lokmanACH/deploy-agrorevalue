'use client';

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Clock, Package, Coins, Truck, TrendingUp,
  Wifi, WifiOff, Loader2, AlertCircle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { BuyModal } from "@/components/ui/BuyModal";
import { NegotiateModal } from "@/components/ui/NegotiateModal";
import { api } from "@/utils/apiClient";

// ─── Backend types ─────────────────────────────────────────────────────────────

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
  status: string;
  start_time: string;
  deliveryPrice: number;
  end_time: string;
  created_at: string;
}

interface RawImage {
  id: number;
  product_id: number;
  image_url: string;
}

interface RawUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
}

interface RawLocation {
  id: number;
  address: string;
}

interface RawCategory {
  id: number;
  name: string;
}

interface LiveBid {
  order: number;
  id: number;
  product_id: number;
  buyer_id: number;
  quantity_requested: number;
  price_per_kg: number;
  total_price: number;
  status: string;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    avatar: string;
    email: string;
    phone: string | null;
  };
}

interface BidsResponse {
  type: "bids_update";
  product_id: number;
  bids: LiveBid[];
  status?: string | null;
  allocations?: any[] | null;
}

// ─── Derived UI type ──────────────────────────────────────────────────────────

interface ProductUI {
  id: number;
  image: string;
  name: string;
  category: string;
  quality: "A" | "B" | "C";
  quantity: number;
  location: string;
  kiloPrice: number;
  totalPrice: number;
  deliveryPrice: number;
  timeLeft: string;
  sellerName: string;
  description: string;
}

type ModalType = "buy" | "negotiate" | null;
type PollStatus = "connecting" | "open" | "closed" | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const qualityColors = {
  A: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  B: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  C: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
};

function computeTimeLeft(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return "Terminé";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  return days > 0 ? `${days}j ${hours}h` : `${hours}h`;
}

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${days}j`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ProductDetailPage = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { product_detail } = useParams();
  const router = useRouter();

  const productId = product_detail ? Number(product_detail) : null;

  const [product, setProduct] = useState<ProductUI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalType>(null);

  const [bids, setBids] = useState<LiveBid[]>([]);
  const [pollStatus, setPollStatus] = useState<PollStatus>("connecting");

  const [flashIds, setFlashIds] = useState<Set<number>>(new Set());
  const prevBidIds = useRef<Set<number>>(new Set());

  // ── Poll bids every 5 seconds ───────────────────────────────────────────────
  // useEffect(() => {
  //   if (!productId) {
  //     setPollStatus("closed");
  //     return;
  //   }

  //   let isActive = true;
  //   let intervalId: ReturnType<typeof setInterval> | null = null;

  //   const fetchBids = async (showConnecting = false) => {
  //     try {
  //       if (!isActive) return;
  //       if (showConnecting) setPollStatus("connecting");

  //       const data = await api.get<BidsResponse>(`/bids/${productId}`);
  //       console.log(data)

  //       if (!isActive) return;

  //       if (data?.type === "bids_update" && Array.isArray(data.bids)) {
  //         setBids(data.bids);
  //         setPollStatus("open");
  //       } else {
  //         setBids([]);
  //         setPollStatus("error");
  //       }
  //     } catch (err) {
  //       if (!isActive) return;
  //       console.error("Polling bids error:", err);
  //       setPollStatus("error");
  //     }
  //   };

  //   fetchBids(true);
  //   intervalId = setInterval(() => {
  //     fetchBids(false);
  //   }, 5000);

  //   return () => {
  //     isActive = false;
  //     if (intervalId) clearInterval(intervalId);
  //     setPollStatus("closed");
  //   };
  // }, [productId]);


useEffect(() => {
  if (!productId) return;

  let isActive = true;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const fetchBids = async (showLoading = false) => {
    try {
      if (!isActive) return;
      if (showLoading) setPollStatus("connecting");

      const res = await fetch(`${API_URL}/api/bids/${productId}`);

      // ❗ check if response is OK
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json(); // ✅ now safe

      if (!isActive) return;

      console.log("API:", data);

      if (data?.type === "bids_update" && Array.isArray(data.bids)) {
        setBids(data.bids);
        setPollStatus("open");
      } else {
        setBids([]);
        setPollStatus("error");
      }

    } catch (err) {
      if (!isActive) return;
      console.error("Polling bids error:", err);
      setPollStatus("error");
    }
  };

  // first call
  fetchBids(true);

  // every 5 seconds
  intervalId = setInterval(() => {
    fetchBids(false);
  }, 5000);

  // cleanup
  return () => {
    isActive = false;
    if (intervalId) clearInterval(intervalId);
    setPollStatus("closed");
  };
}, [productId]);

const reconnect = async () => {
  if (!productId) return;

  try {
    setPollStatus("connecting");

    const res = await fetch(`http://localhost:5000/api/bids/${productId}`);
    if (!res.ok) throw new Error("Request failed");

    const data = await res.json();

    if (data?.type === "bids_update") {
      setBids(data.bids || []);
      setPollStatus("open");
    } else {
      setPollStatus("error");
    }
  } catch (err) {
    console.error("Manual fetch error:", err);
    setPollStatus("error");
  }
}


  

  // ── Flash new bids when they arrive ─────────────────────────────────────────
  useEffect(() => {
    if (bids.length === 0) return;

    const currentIds = new Set(bids.map((b) => b.id));
    const newIds = new Set<number>();

    currentIds.forEach((id) => {
      if (!prevBidIds.current.has(id)) {
        newIds.add(id);
      }
    });

    if (newIds.size > 0) {
      setFlashIds(newIds);

      const timeoutId = setTimeout(() => {
        setFlashIds(new Set());
      }, 1800);

      prevBidIds.current = currentIds;
      return () => clearTimeout(timeoutId);
    }

    prevBidIds.current = currentIds;
  }, [bids]);

  // ── Fetch product details from REST API ─────────────────────────────────────
  useEffect(() => {
    if (!productId) return;

    let isActive = true;

    async function loadProduct() {
      try {
        if (!isActive) return;
        setLoading(true);
        setError(null);

        const [rawProduct, rawImages, rawLocations, rawCategories, rawUsers] =
          await Promise.all([
            api.get<RawProduct>(`products/${productId}`),
            api.get<RawImage[]>("product_images"),
            api.get<RawLocation[]>("locations"),
            api.get<RawCategory[]>("product_categories"),
            api.get<RawUser[]>("users"),
          ]);

        if (!isActive) return;

        const image =
          rawImages.find((i) => i.product_id === productId)?.image_url ??
          "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&h=400&fit=crop";

        const location =
          rawLocations.find((l) => l.id === rawProduct.location_id)?.address ?? "Algérie";

        const category =
          rawCategories.find((c) => c.id === rawProduct.category_id)?.name ?? "Autre";

        const seller = rawUsers.find((u) => u.id === rawProduct.seller_id);
        const sellerName = seller
          ? `${seller.first_name} ${seller.last_name}`
          : "Vendeur inconnu";

        setProduct({
          id: rawProduct.id,
          image,
          name: rawProduct.title,
          category,
          quality: rawProduct.quality,
          quantity: rawProduct.quantity_available,
          location,
          kiloPrice: rawProduct.starting_price,
          totalPrice: rawProduct.price_full_sale,
          deliveryPrice: rawProduct.deliveryPrice,
          timeLeft: computeTimeLeft(rawProduct.end_time),
          sellerName,
          description: rawProduct.description,
        });
      } catch (err: any) {
        if (!isActive) return;
        setError(err?.message || "Erreur lors du chargement du produit");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isActive = false;
    };
  }, [productId]);

  // ── Render: Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-zinc-500">Chargement du produit…</p>
      </div>
    );
  }

  // ── Render: Error ───────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error ?? "Produit introuvable"}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline"
        >
          Retour
        </button>
      </div>
    );
  }

  const highestBid = bids.length ? Math.max(...bids.map((b) => b.price_per_kg)) : null;

  const wsIndicator = {
    open: { icon: Wifi, color: "text-emerald-500", label: "En direct" },
    connecting: { icon: Loader2, color: "text-amber-500 animate-spin", label: "Connexion…" },
    closed: { icon: WifiOff, color: "text-zinc-400", label: "Déconnecté" },
    error: { icon: WifiOff, color: "text-red-500", label: "Erreur API" },
  }[pollStatus];

  const WsIcon = wsIndicator.icon;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux offres
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

          <div className="space-y-5">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
              <div className="relative h-56 sm:h-72 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  <Clock className="w-3 h-3" />{product.timeLeft}
                </div>
                <div className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border ${qualityColors[product.quality]}`}>
                  Catégorie {product.quality}
                </div>
              </div>

              <div className="p-5">
                <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{product.name}</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{product.category}</p>

                {product.description && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
                    {product.description}
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { icon: Package, label: "Quantité", value: product.quantity },
                    { icon: Coins, label: "Prix de départ", value: `${product.kiloPrice.toLocaleString("fr-DZ")} DA/kg` },
                    { icon: MapPin, label: "Localisation", value: product.location },
                    { icon: Truck, label: "Livraison", value: product.deliveryPrice > 0 ? `${product.deliveryPrice.toLocaleString("fr-DZ")} DA` : "À définir" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-2">
                      <Icon className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                    {product.totalPrice.toLocaleString("fr-DZ")}
                  </span>
                  <span className="text-sm text-zinc-500">DA</span>
                  <span className="text-sm text-zinc-400 ml-1">· lot complet</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Propositions des acheteurs
                </h2>

                <div className="flex items-center gap-3">
                  {bids.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {bids.length} proposition{bids.length > 1 ? "s" : ""}
                    </span>
                  )}

                  <button
                    onClick={reconnect}
                    title="Actualiser"
                    className={`flex items-center gap-1 text-xs font-medium ${wsIndicator.color} transition-colors`}
                  >
                    <WsIcon className="w-3.5 h-3.5" />
                    {wsIndicator.label}
                  </button>
                </div>
              </div>

              {pollStatus === "open" && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs text-zinc-400">Mise à jour toutes les 5 secondes</span>
                </div>
              )}

              {bids.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-8">
                  {pollStatus === "connecting"
                    ? "Chargement des propositions…"
                    : "Aucune proposition pour le moment."}
                </p>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {bids.map((bid, idx) => {
                    const isNew = flashIds.has(bid.id);
                    const isFirst = idx === 0;

                    return (
                      <div
                        key={bid.id}
                        className={`flex items-center gap-3 py-3 rounded-lg px-2 -mx-2 transition-all duration-500 ${
                          isNew ? "bg-emerald-50 dark:bg-emerald-950/30" : ""
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isFirst
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                        }`}>
                          {bid.order}
                        </div>

                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-400 shrink-0">
                          {initials(bid.user.first_name, bid.user.last_name)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                              {bid.user.first_name} {bid.user.last_name}
                            </span>

                            {isFirst && (
                              <span className="shrink-0 text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                🏆 1er
                              </span>
                            )}

                            {isNew && (
                              <span className="shrink-0 text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                                Nouveau
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-zinc-400 mt-0.5">
                            {relativeTime(bid.created_at)}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {bid.price_per_kg.toLocaleString("fr-DZ")} DA/kg
                          </p>
                          <p className="text-xs text-zinc-400">
                            {bid.quantity_requested.toLocaleString("fr-DZ")} kg
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 lg:sticky lg:top-24">
              <button
                onClick={() => setModal("buy")}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors mb-2"
              >
                Achat immédiat — {product.totalPrice.toLocaleString("fr-DZ")} DA
              </button>

              <button
                onClick={() => setModal("negotiate")}
                className="w-full h-10 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-semibold rounded-xl transition-colors"
              >
                Proposer un prix
              </button>

              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Résumé
                </p>

                {[
                  { label: "Vendeur", value: product.sellerName },
                  { label: "Wilaya", value: product.location },
                  { label: "Propositions", value: String(bids.length) },
                  ...(highestBid
                    ? [{ label: "Meilleur prix proposé", value: `${highestBid.toLocaleString("fr-DZ")} DA/kg`, green: true }]
                    : []),
                ].map(({ label, value, green }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
                    <span className={`text-sm font-medium ${green ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-900 dark:text-zinc-50"}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {modal === "buy" && (
        <BuyModal product={product} onClose={() => setModal(null)} />
      )}

      {modal === "negotiate" && (
        <NegotiateModal product={product} onClose={() => setModal(null)} />
      )}
    </div>
  );
};

export default ProductDetailPage;