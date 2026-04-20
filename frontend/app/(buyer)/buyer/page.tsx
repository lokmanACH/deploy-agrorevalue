"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Loader2, AlertCircle } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { BuyModal } from "@/components/ui/BuyModal";
import { NegotiateModal } from "@/components/ui/NegotiateModal";
import { api, formatImageUrl } from "@/utils/apiClient";

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
}

type ModalType = "buy" | "negotiate" | null;

function timeLeft(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return "Terminé";

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);

  return days > 0 ? `${days}j ${hours}h` : `${hours}h`;
}

export default function BuyerDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["Tous"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const [rawProducts, rawImages, rawLocations, rawCategories] =
          await Promise.all([
            api.get<RawProduct[]>("products"),
            api.get<RawImage[]>("product_images"),
            api.get<RawLocation[]>("locations"),
            api.get<RawCategory[]>("product_categories"),
          ]);

        const imageMap = new Map<number, string>();
        rawImages.forEach((img) => {
          if (!imageMap.has(img.product_id)) {
            imageMap.set(img.product_id, img.image_url);
          }
        });

        const locationMap = new Map<number, string>();
        rawLocations.forEach((loc) => {
          locationMap.set(loc.id, loc.address);
        });

        const categoryMap = new Map<number, string>();
        rawCategories.forEach((cat) => {
          categoryMap.set(cat.id, cat.name);
        });

        const uniqueCategoryNames = Array.from(
          new Set(rawCategories.map((c) => c.name))
        );
        setCategories(["Tous", ...uniqueCategoryNames]);

        const mappedProducts: Product[] = rawProducts
          .filter((p) => p.status === "active")
          .map((p) => ({
            id: p.id,
            image: formatImageUrl(imageMap.get(p.id)),
            name: p.title,
            category: categoryMap.get(p.category_id) || "Autre",
            quantity: `${p.quantity_available} kg`,
            quality: p.quality,
            location: locationMap.get(p.location_id) || "Algérie",
            kiloPrice: p.starting_price,
            totalPrice: p.price_full_sale,
            deliveryPrice: p.deliveryPrice,
            timeLeft: timeLeft(p.end_time),
          }));

        setProducts(mappedProducts);
      } catch (err: any) {
        setError(err?.message || "Impossible de charger les produits");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const handleAction = (type: "buy" | "negotiate", product: Product) => {
    setActiveProduct(product);
    setModal(type);
  };

  const closeModal = () => {
    setModal(null);
    setActiveProduct(null);
  };

  const filtered = products.filter((p) => {
    const searchValue = search.trim().toLowerCase();

    const matchSearch =
      p.name.toLowerCase().includes(searchValue) ||
      p.location.toLowerCase().includes(searchValue);

    const matchCategory =
      activeCategory === "Tous" || p.category === activeCategory;

    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="sticky top-16 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
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

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <SlidersHorizontal className="w-4 h-4 text-zinc-400 shrink-0" />
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 pb-0.5 -mb-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 h-8 px-3.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    activeCategory === cat
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <span className="hidden sm:block text-xs text-zinc-400 shrink-0">
            {filtered.length} offre{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <p className="sm:hidden text-xs text-zinc-400 mb-4">
          {filtered.length} offre{filtered.length !== 1 ? "s" : ""}
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm text-zinc-500">Chargement des offres…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <p className="text-xs text-zinc-400">
              Vérifiez que le serveur backend est démarré sur le port 5000.
            </p>
          </div>
        ) : filtered.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            style={{
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            }}
          >
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
                onBuy={() => handleAction("buy", product)}
                onNegotiate={() => handleAction("negotiate", product)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-zinc-900 dark:text-zinc-50 font-medium mb-1">
              Aucune offre trouvée
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {products.length === 0
                ? "Aucune enchère active pour le moment."
                : "Essayez un autre terme ou catégorie."}
            </p>
          </div>
        )}
      </div>

      {modal === "buy" && activeProduct && (
        <BuyModal product={activeProduct} onClose={closeModal} />
      )}
      {modal === "negotiate" && activeProduct && (
        <NegotiateModal product={activeProduct} onClose={closeModal} />
      )}
    </div>
  );
}