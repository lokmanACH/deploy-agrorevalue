import { MapPin, Clock, Package, Coins,  Truck } from "lucide-react";
import Link from "next/link";

interface ProductCardProps {
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
  onBuy: () => void;
  onNegotiate: () => void;
  onView?: () => void;
}

const qualityColors = {
  A: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  B: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  C: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
};

export function ProductCard({
  id,
  image,
  name,
  category,
  quantity,
  quality,
  location,
  kiloPrice,
  totalPrice,
  deliveryPrice,
  timeLeft,
  onBuy,
  onNegotiate,
  onView,
}: ProductCardProps) {
  const formattedTotal = totalPrice.toLocaleString("fr-DZ");
  const formattedDelivery = deliveryPrice.toLocaleString("fr-DZ");
  const formattedKiloPrice = kiloPrice.toLocaleString("fr-DZ");

  return (
    <div className="w-72 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200">

      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        
        <Link
          href={`/buyer/${id}`}
          onClick={(e) => {
            if (onView) {
              e.preventDefault(); // 🚨 STOP navigation
              onView();           // open modal instead
            }
          }}
          className="block w-full h-full"
        >
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </Link>

        {/* Time left badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
          <Clock className="w-3 h-3" />
          {timeLeft}
        </div>
        {/* Quality badge */}
        <div className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border ${qualityColors[quality]}`}>
          Catégorie {quality}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">

        {/* Name + meta */}
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">
          {name}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{category}</p>

        {/* Info rows */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Package className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <span>Quantité disponible : <span className="font-medium text-zinc-800 dark:text-zinc-200">{quantity}</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Coins className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <span>Prix au kilo : <span className="font-medium text-zinc-800 dark:text-zinc-200">{formattedKiloPrice} DA</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Truck className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <span>Livraison : <span className="font-medium text-zinc-800 dark:text-zinc-200">{formattedDelivery} DA</span></span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-zinc-100 dark:border-zinc-800" />

        {/* Price */}
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Prix total de la totalité</p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mt-0.5">
              {formattedTotal}{" "}
              <span className="text-sm font-normal text-zinc-500">DA</span>
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={onBuy}
            className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Achat immédiat
          </button>
          <button
            onClick={onNegotiate}
            className="h-9 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-semibold rounded-lg transition-colors"
          >
            Proposer un prix
          </button>
        </div>
      </div>
    </div>
  );
}