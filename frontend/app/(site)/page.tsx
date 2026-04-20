"use client";

import Link from "next/link";
import { useState } from "react";
import { X, Search, SlidersHorizontal } from "lucide-react";
import Hero from "@/components/ui/Hero";
import { ProductCard } from "@/components/ui/ProductCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
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
  onView?: () => void;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS: Product[] = [
  { id: 1, image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop", name: "Tomates fraîches", category: "Légumes · Lot en gros", quantity: "1.2 Tonnes", quality: "A", location: "Mazida, Béjaïa", kiloPrice: 185, totalPrice: 222000, deliveryPrice: 8000, timeLeft: "2j 14h" },
  { id: 2, image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&h=300&fit=crop", name: "Pommes de terre", category: "Légumes · Lot en gros", quantity: "3 Tonnes", quality: "A", location: "Aïn Defla", kiloPrice: 60, totalPrice: 180000, deliveryPrice: 12000, timeLeft: "1j 6h" },
  { id: 3, image: "https://images.unsplash.com/photo-1574226516831-e1dff420e562?w=400&h=300&fit=crop", name: "Dattes Deglet Nour", category: "Fruits · Premium", quantity: "500 kg", quality: "A", location: "Biskra", kiloPrice: 750, totalPrice: 375000, deliveryPrice: 9500, timeLeft: "4j 2h" },
  { id: 4, image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=400&h=300&fit=crop", name: "Oranges de saison", category: "Fruits · Lot en gros", quantity: "2 Tonnes", quality: "B", location: "Blida", kiloPrice: 70, totalPrice: 140000, deliveryPrice: 7000, timeLeft: "3j 18h" },
  { id: 5, image: "https://images.unsplash.com/photo-1506484381205-f7945653044d?w=400&h=300&fit=crop", name: "Blé dur", category: "Céréales · Lot industriel", quantity: "10 Tonnes", quality: "B", location: "Sétif", kiloPrice: 52, totalPrice: 520000, deliveryPrice: 25000, timeLeft: "6j 0h" },
  { id: 6, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop", name: "Huile d'olive extra", category: "Huile · Premium", quantity: "800 L", quality: "A", location: "Tizi Ouzou", kiloPrice: 1200, totalPrice: 960000, deliveryPrice: 15000, timeLeft: "5j 9h" },
  { id: 7, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop", name: "Poivrons rouges", category: "Légumes · Lot en gros", quantity: "600 kg", quality: "A", location: "Annaba", kiloPrice: 150, totalPrice: 90000, deliveryPrice: 6000, timeLeft: "1j 22h" },
  { id: 8, image: "https://images.unsplash.com/photo-1558818498-28c1e002b655?w=400&h=300&fit=crop", name: "Lentilles vertes", category: "Légumineuses · Sec", quantity: "4 Tonnes", quality: "B", location: "M'Sila", kiloPrice: 120, totalPrice: 480000, deliveryPrice: 18000, timeLeft: "7j 3h" },
];

const CATEGORIES = ["Tous", "Légumes", "Fruits", "Céréales", "Légumineuses", "Huile"];

// ─── Auth Modal ───────────────────────────────────────────────────────────────

function AuthModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
          Connectez-vous pour continuer
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
          Créez un compte acheteur pour soumettre des offres et participer aux enchères agro-alimentaires.
        </p>

        <div className="flex flex-col gap-2.5">
          <Link
            href="/signup"
            className="flex items-center justify-center h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Créer un compte
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center h-10 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-medium rounded-lg transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const isAuthenticated = false;
  const [showAuth, setShowAuth] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "Tous" || p.category.startsWith(activeCategory);
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Hero />

      {/* ── Sticky filter bar ─────────────────────────────────────────────── */}
      <div className="sticky top-16 z-20 border-b border-zinc-200 bg-emerald-500/80 backdrop-blur-md dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">

          {/* Search — full width on mobile, capped on larger screens */}
          <div className="relative w-full sm:w-64 lg:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Produit, wilaya…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Category pills row — scrollable, hides scrollbar */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <SlidersHorizontal className="w-4 h-4 text-zinc-50 shrink-0" />
            {/* Scrollable pill strip with hidden scrollbar */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 pb-0.5 -mb-0.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 h-8 px-3.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    activeCategory === cat
                      ? "bg-emerald-900 text-white shadow-sm"
                      : "border border-zinc-200 dark:border-zinc-700 text-white hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-emerald-600 dark:hover:bg-emerald-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Count — hidden on very small screens to save space */}
          <span className="hidden sm:block text-xs text-zinc-400 shrink-0">
            {filtered.length} offre{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Product grid ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile result count */}
        <p className="sm:hidden text-xs text-zinc-400 mb-4">
          {filtered.length} offre{filtered.length !== 1 ? "s" : ""}
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                image={product.image}
                name={product.name}
                category={product.category}
                quantity={product.quantity}
                quality={product.quality}
                location={product.location}
                kiloPrice={product.kiloPrice}
                totalPrice={product.totalPrice}
                deliveryPrice={product.deliveryPrice}
                timeLeft={product.timeLeft}
                onBuy={() => setShowAuth(true)}
                onNegotiate={() => setShowAuth(true)}
                onView={() => {
                  if (!isAuthenticated) setShowAuth(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-zinc-900 dark:text-zinc-50 font-medium mb-1">Aucune offre trouvée</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Essayez un autre terme ou catégorie.</p>
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}