"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Package, X, BadgeCheck, Loader2, AlertCircle } from "lucide-react";
import { AddProductForm } from "@/components/forms/AddProductForm";
import { OffersTab } from "@/components/seller/Offerstab";
import { DonateForm } from "@/components/forms/DonateForm";
import { api, getUser, formatImageUrl } from "@/utils/apiClient";

// ─── Backend types ────────────────────────────────────────────────────────────

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

interface RawImage {
  id: number;
  product_id: number;
  image_url: string;
}

interface RawLocation {
  id: number;
  user_id: number;
  id_wilaya: number;
  id_commune: number;
  address: string;
}

interface RawCategory {
  id: number;
  name: string;
}

interface RawBid {
  id: number;
  product_id: number;
  buyer_id: number;
  quantity_requested: number;
  price_per_kg: number;
  created_at: string;
}

interface RawUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar?: string;
  is_verified: boolean;
  is_active: boolean;
}

interface RawAllocation {
  id: number;
  product_id: number;
  buyer_id: number;
  bid_id: number;
  allocated_quantity: number;
  final_price: number;
  order: number;
  created_at: string;
}

interface BidApiItem {
  order?: number;
  id: number;
  product_id: number;
  buyer_id: number;
  quantity_requested: number;
  price_per_kg: number;
  total_price?: number;
  status?: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    avatar?: string;
    email?: string;
    phone?: string | null;
  };
}

interface BidsResponse {
  type: "bids_update";
  product_id: number;
  bids: BidApiItem[];
  status?: string | null;
  allocations?: {
    id: number;
    product_id: number;
    buyer_id: number;
    bid_id: number;
    allocated_quantity: number;
    final_price: number;
    order: number;
    created_at: string;
  }[] | null;
}

// ─── UI types ─────────────────────────────────────────────────────────────────

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
  status: "active" | "closed";
  offers: number;
  buyers?: Buyer[];
  allocations?: Allocation[];
}

interface Buyer {
  bidId: number;
  buyerId: number;
  name: string;
  quantity: string;
  proposedPrice: number;
  bidHistory?: { price: number; timestamp: string }[];
}

interface Allocation {
  id: number;
  buyerName: string;
  buyerId: number;
  buyerEmail?: string | null;
  buyerPhone?: string | null;
  quantity: number;
  finalPrice: number;
  order: number;
}

type Tab = "add" | "offers" | "donate";

// ─── Helper functions ──────────────────────────────────────────────────────────

function timeLeft(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return "Terminé";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  return days > 0 ? `${days}j ${hours}h` : `${hours}h`;
}

function mapToOffer(
  product: RawProduct,
  imageMap: Map<number, string>,
  locationMap: Map<number, string>,
  categoryMap: Map<number, string>,
  userMap: Map<number, RawUser>,
  bidMap: Map<number, RawBid[]>,
  allocationMap: Map<number, (RawAllocation & { buyerName: string })[]>
): Offer {
  const bids = bidMap.get(product.id) || [];
  const allocations = allocationMap.get(product.id) || [];

  const status = product.status as "active" | "closed";

  const bestBidsPerBuyer = new Map<number, RawBid>();
  const allBidsPerBuyer = new Map<number, RawBid[]>();
  
  for (const bid of bids) {
    // Track all bids for history
    if (!allBidsPerBuyer.has(bid.buyer_id)) {
      allBidsPerBuyer.set(bid.buyer_id, []);
    }
    allBidsPerBuyer.get(bid.buyer_id)!.push(bid);

    // Track best bid
    const existing = bestBidsPerBuyer.get(bid.buyer_id);
    if (!existing || bid.price_per_kg > existing.price_per_kg) {
      bestBidsPerBuyer.set(bid.buyer_id, bid);
    }
  }

  const uiBuyers: Buyer[] = Array.from(bestBidsPerBuyer.values())
    .sort((a, b) => b.price_per_kg - a.price_per_kg)
    .map((bid) => {
      const buyer = userMap.get(bid.buyer_id);
      const buyerAllBids = allBidsPerBuyer.get(bid.buyer_id) || [];
      
      return {
        bidId: bid.id,
        buyerId: bid.buyer_id,
        name: buyer ? `${buyer.first_name} ${buyer.last_name}` : "Acheteur",
        quantity: `${bid.quantity_requested} kg`,
        proposedPrice: bid.price_per_kg,
        bidHistory: buyerAllBids
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((b) => ({
            price: b.price_per_kg,
            timestamp: b.created_at,
          })),
      };
    });

  return {
    id: product.id,
    image: formatImageUrl(imageMap.get(product.id)),
    name: product.title,
    category: categoryMap.get(product.category_id) || "Autre",
    quantity: `${product.quantity_available} kg`,
    quality: product.quality,
    location: locationMap.get(product.location_id) || "Algérie",
    kiloPrice: product.starting_price,
    totalPrice: product.price_full_sale,
    deliveryPrice: product.deliveryPrice,
    timeLeft: timeLeft(product.end_time),
    status: status as "active" | "closed",
    offers: bestBidsPerBuyer.size,
    buyers: uiBuyers.slice(0, 3),
    allocations: allocations.map((a) => {
      const buyer = userMap.get(a.buyer_id);
      return {
        id: a.id,
        buyerName: a.buyerName,
        buyerId: a.buyer_id,
        buyerEmail: buyer?.email,
        buyerPhone: buyer?.phone,
        quantity: a.allocated_quantity,
        finalPrice: a.final_price,
        order: a.order,
      };
    }),
  };
}

function SuccessToast({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-3 rounded-xl shadow-lg">
      <BadgeCheck className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
      <span className="text-sm font-medium">Offre publiée avec succès !</span>
      <button
        onClick={onClose}
        className="ml-2 text-zinc-400 dark:text-zinc-500 hover:text-white dark:hover:text-zinc-900 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SellerDashboardPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
 
  const [tab, setTab] = useState<Tab>("offers");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSellerProducts = async () => {
    try {
      setLoading(true);
      const user = getUser();

      if (!user) {
        setError("Vous devez être connecté");
        setLoading(false);
        return;
      }

      const [rawProducts, rawImages, rawLocations, rawCategories, rawBids, rawUsers, rawAllocations] =
        await Promise.all([
          api.get<RawProduct[]>("products"),
          api.get<RawImage[]>("product_images"),
          api.get<RawLocation[]>("locations"),
          api.get<RawCategory[]>("product_categories"),
          api.get<RawBid[]>("bids"),
          api.get<RawUser[]>("users"),
          api.get<RawAllocation[]>("allocations"),
        ]);

      const sellerProducts = rawProducts.filter((p) => p.seller_id === user.id);

      const imageMap = new Map<number, string>();
      rawImages.forEach((img) => {
        if (!imageMap.has(img.product_id)) imageMap.set(img.product_id, img.image_url);
      });

      const locationMap = new Map<number, string>();
      rawLocations.forEach((loc) => locationMap.set(loc.id, loc.address));

      const categoryMap = new Map<number, string>();
      rawCategories.forEach((cat) => categoryMap.set(cat.id, cat.name));

      const userMap = new Map<number, RawUser>();
      rawUsers.forEach((u) => userMap.set(u.id, u));

      const bidMap = new Map<number, RawBid[]>();
      rawBids.forEach((bid) => {
        if (!bidMap.has(bid.product_id)) bidMap.set(bid.product_id, []);
        bidMap.get(bid.product_id)!.push(bid);
      });

      const allocationMap = new Map<number, (RawAllocation & { buyerName: string })[]>();
      rawAllocations.forEach((alloc) => {
        const buyer = userMap.get(alloc.buyer_id);
        const allocWithName = {
          ...alloc,
          buyerName: buyer ? `${buyer.first_name} ${buyer.last_name}` : "Acheteur",
        };
        if (!allocationMap.has(alloc.product_id)) allocationMap.set(alloc.product_id, []);
        allocationMap.get(alloc.product_id)!.push(allocWithName);
      });

      const mapped: Offer[] = sellerProducts.map((p) =>
        mapToOffer(p, imageMap, locationMap, categoryMap, userMap, bidMap, allocationMap)
      );

      setOffers(mapped);
      setError(null);
    } catch (err: any) {
      console.error("Error loading products:", err);
      setError(err.message || "Impossible de charger vos offres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerProducts();
  }, []);

  const activeProductIds = useMemo(() => {
    return offers
      .filter((o) => o.status === "active")
      .map((o) => o.id);
  }, [offers]);

  useEffect(() => {
    if (activeProductIds.length === 0) return;

    let isActive = true;

    const fetchAll = async () => {
      try {
        const responses: BidsResponse[] = await Promise.all(
          activeProductIds.map(async (productId) => {
            const res = await fetch(`${API_URL}/api/bids/${productId}`);

            if (!res.ok) {
              throw new Error(`HTTP error ${res.status} for product ${productId}`);
            }

            return (await res.json()) as BidsResponse;
          })
        );

        if (!isActive) return;

        setOffers((prev) =>
          prev.map((offer) => {
            const match = responses.find((r) => r.product_id === offer.id);
            if (!match) return offer;

            const bestByBuyer = new Map<number, BidApiItem>();
            const allBidsByBuyer = new Map<number, BidApiItem[]>();
            
            (match.bids || []).forEach((bid) => {
              // Track all bids for history
              if (!allBidsByBuyer.has(bid.buyer_id)) {
                allBidsByBuyer.set(bid.buyer_id, []);
              }
              allBidsByBuyer.get(bid.buyer_id)!.push(bid);

              // Track best bid
              const existing = bestByBuyer.get(bid.buyer_id);
              if (!existing || bid.price_per_kg > existing.price_per_kg) {
                bestByBuyer.set(bid.buyer_id, bid);
              }
            });

            const buyers: Buyer[] = Array.from(bestByBuyer.values())
              .sort((a, b) => b.price_per_kg - a.price_per_kg)
              .map((bid) => {
                const buyerAllBids = allBidsByBuyer.get(bid.buyer_id) || [];
                return {
                  bidId: bid.id,
                  buyerId: bid.buyer_id,
                  name: bid.user
                    ? `${bid.user.first_name} ${bid.user.last_name}`
                    : "Acheteur",
                  quantity: `${bid.quantity_requested} kg`,
                  proposedPrice: bid.price_per_kg,
                  bidHistory: buyerAllBids
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((b) => ({
                      price: b.price_per_kg,
                      timestamp: b.created_at,
                    })),
                };
              });

            const allocations: Allocation[] = (match.allocations || []).map((alloc) => {
              const buyerBid = (match.bids || []).find((b) => b.buyer_id === alloc.buyer_id);
              const buyerName = buyerBid?.user
                ? `${buyerBid.user.first_name} ${buyerBid.user.last_name}`
                : "Acheteur";

              return {
                id: alloc.id,
                buyerName,
                buyerId: alloc.buyer_id,
                buyerEmail: buyerBid?.user?.email,
                buyerPhone: buyerBid?.user?.phone,
                quantity: alloc.allocated_quantity,
                finalPrice: alloc.final_price,
                order: alloc.order,
              };
            });

            const nextStatus = (match.status as "active" | "closed");

            return {
              ...offer,
              offers: bestByBuyer.size,
              buyers: buyers.slice(0, 3),
              allocations,
              status: nextStatus,
            };
          })
        );
      } catch (err) {
        if (!isActive) return;
        console.error("Polling seller bids error:", err);
      }
    };

    fetchAll();
    const intervalId = setInterval(fetchAll, 5000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [activeProductIds]);

  const handleDelete = (id: number) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
  };

  const handleUpdate = (updated: Partial<Offer> & { id: number }) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
    );
  };

  const handlePublish = () => {
    setShowToast(true);
    setTab("offers");
    setTimeout(() => setShowToast(false), 3500);
    setTimeout(() => loadSellerProducts(), 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="sticky top-16 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 w-fit">
            <button
              onClick={() => setTab("add")}
              className={`flex items-center gap-2 h-8 px-4 rounded-md text-sm font-medium transition-all ${
                tab === "add"
                  ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <Plus className="w-4 h-4" />
              Ajouter une offre
            </button>
            <button
              onClick={() => setTab("offers")}
              className={`flex items-center gap-2 h-8 px-4 rounded-md text-sm font-medium transition-all ${
                tab === "offers"
                  ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <Package className="w-4 h-4" />
              Mes offres
              <span className="ml-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {offers.filter((o) => o.status === "active").length}
              </span>
            </button>
            <button
              onClick={() => setTab("donate")}
              className={`flex items-center gap-2 h-8 px-4 rounded-md text-sm font-medium transition-all ${
                tab === "donate"
                  ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <Package className="w-4 h-4" />
              Faire un don
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm text-zinc-500">Chargement de vos offres…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <p className="text-xs text-zinc-400">
              Vérifiez que le serveur backend est démarré sur le port 5000.
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            {tab === "add" && <AddProductForm onSuccess={handlePublish} />}
            {tab === "offers" && (
              <OffersTab
                offers={offers}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onAddNew={() => setTab("add")}
              />
            )}
            {tab === "donate" && <DonateForm />}
          </>
        )}
      </div>

      {showToast && <SuccessToast onClose={() => setShowToast(false)} />}
    </div>
  );
}



