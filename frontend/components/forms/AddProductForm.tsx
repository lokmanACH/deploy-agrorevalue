"use client";

import { useState, useEffect } from "react";
import { Plus, Upload, BadgeCheck, Loader2, AlertCircle } from "lucide-react";
import { api, getUser } from "@/utils/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddProductFormProps {
  onSuccess: () => void;
}

interface RawCategory {
  id: number;
  name: string;
}

interface RawLocation {
  id: number;
  user_id: number;
  id_wilaya: number;
  id_commune: number;
  address: string;
}

interface RawWilaya {
  id: string;
  code: string;
  name: string;
  ar_name: string;
}

interface RawCommune {
  id: string;
  post_code: string;
  name: string;
  wilaya_id: string;
  ar_name: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const QUALITIES = ["A", "B", "C"] as const;
const OFFERS_PERIOD = ["3 Minutes", "24 heures", "48 heures", "78 heures"];

const qualityColors: Record<"A" | "B" | "C", string> = {
  A: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  B: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  C: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
};

const EMPTY_FORM = {
  name: "", category_id: 0, quantity: "", unit: "kg",
  quality: "A" as "A" | "B" | "C",
  wilaya_id: "", commune_id: "", kiloPrice: "", deliveryPrice: "", duration: "24 heures", description: "",
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = "w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all";
const labelCls = "block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5";

// ─── Helper: Duration to minutes ───────────────────────────────────────

function durationToMinutes(duration: string): number {
  const durationMap: Record<string, number> = {
    "3 Minutes": 3,
    "24 heures": 24 * 60,
    "48 heures": 48 * 60,
    "78 heures": 78 * 60,
  };
  return durationMap[duration] || 24 * 60;
}

// ─── AddProductForm ───────────────────────────────────────────────────────────

export function AddProductForm({ onSuccess }: AddProductFormProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState<RawCategory[]>([]);
  const [wilayas, setWilayas] = useState<RawWilaya[]>([]);
  const [communes, setCommunes] = useState<RawCommune[]>([]);
  const [filteredCommunes, setFilteredCommunes] = useState<RawCommune[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories, wilayas and communes on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = getUser();
        if (!user) {
          setError("Vous devez être connecté");
          setLoadingData(false);
          return;
        }

        // Load categories, wilayas and communes
        const [rawCategories, rawWilayas, rawCommunes] = await Promise.all([
          api.get<RawCategory[]>("product_categories"),
          api.get<RawWilaya[]>("wilaya"),
          api.get<RawCommune[]>("commune"),
        ]);

        console.log("Loaded data:", {
          categoriesCount: rawCategories.length,
          wilayasCount: rawWilayas.length,
          communesCount: rawCommunes.length,
        });

        setCategories(rawCategories);
        setWilayas(rawWilayas);
        setCommunes(rawCommunes);

        setError(null);
      } catch (err: any) {
        console.error("Error loading data:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Update filtered communes when wilaya changes
  useEffect(() => {
    if (form.wilaya_id) {
      const filtered = communes.filter((c) => c.wilaya_id === form.wilaya_id);
      console.log(`Wilaya ${form.wilaya_id} selected, found ${filtered.length} communes`);
      setFilteredCommunes(filtered);
      // Reset commune selection when wilaya changes
      setForm((prev) => ({ ...prev, commune_id: "" }));
    } else {
      setFilteredCommunes([]);
    }
  }, [form.wilaya_id, communes]);

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);
      setImageNames((prev) => [...prev, ...files.map((f) => f.name)]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImageNames((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const base64String = e.target?.result as string;
          
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const token = typeof window !== 'undefined' ? localStorage.getItem('agro_token') : null;
          const response = await fetch(`${apiUrl}/api/upload`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ image: base64String }),
          });

          if (!response.ok) {
            console.error("Upload failed:", response.statusText);
            throw new Error("Erreur lors du téléchargement de l'image");
          }

          const data = await response.json();
          console.log("Image upload response:", data);
          resolve(data.image_url || data.path);
        } catch (error: any) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error("Erreur lors de la lecture du fichier"));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = getUser();
      if (!user) {
        throw new Error("Vous devez être connecté pour publier une offre");
      }

      // Debug: log all form values
      console.log("Form submission attempt:", {
        name: form.name,
        category_id: form.category_id,
        quantity: form.quantity,
        kiloPrice: form.kiloPrice,
        duration: form.duration,
        wilaya_id: form.wilaya_id,
        commune_id: form.commune_id,
      });

      if (!form.name || !form.category_id || !form.quantity || !form.kiloPrice || !form.duration || !form.wilaya_id || !form.commune_id) {
        const missing = [
          !form.name && "Nom du produit",
          !form.category_id && "Catégorie",
          !form.quantity && "Quantité",
          !form.kiloPrice && "Prix au kilo",
          !form.duration && "Durée",
          !form.wilaya_id && "Wilaya",
          !form.commune_id && "Commune",
        ].filter(Boolean).join(", ");
        throw new Error(`Champs manquants: ${missing}`);
      }

      // Get wilaya and commune names for address
      const selectedWilaya = wilayas.find((w) => w.id === form.wilaya_id);
      const selectedCommune = filteredCommunes.find((c) => c.id === form.commune_id);
      
      if (!selectedWilaya || !selectedCommune) {
        throw new Error("Wilaya ou commune sélectionnée invalide");
      }

      // Create or find location for this wilaya/commune
      // First, try to get existing location for user
      const existingLocations = await api.get<RawLocation[]>("locations");
      let locationId: number;
      
      const userLocationForWiCommune = existingLocations.find(
        (loc) => loc.user_id === user.id && 
                 loc.id_wilaya === parseInt(form.wilaya_id) && 
                 loc.id_commune === parseInt(form.commune_id)
      );

      if (userLocationForWiCommune) {
        locationId = userLocationForWiCommune.id;
      } else {
        // Create new location
        const newLocation = await api.post<RawLocation>("locations", {
          user_id: user.id,
          id_wilaya: parseInt(form.wilaya_id),
          id_commune: parseInt(form.commune_id),
          address: `${selectedCommune.name}, ${selectedWilaya.name}`,
        });
        locationId = newLocation.id;
      }

      // Calculate end_time based on duration
      const durationMinutes = durationToMinutes(form.duration);
      const now = new Date();
      const endTime = new Date(now.getTime() + durationMinutes * 60000);

      // Upload all images if provided
      const imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const imageUrl = await uploadImage(file);
          imageUrls.push(imageUrl);
        }
      }

      // Create product object
      const newProduct = {
        seller_id: user.id,
        category_id: form.category_id,
        title: form.name,
        description: form.description || "",
        quality: form.quality,
        quantity_available: parseInt(form.quantity),
        price_full_sale: parseInt(form.quantity) * parseInt(form.kiloPrice),
        starting_price: parseInt(form.kiloPrice),
        location_id: locationId,
        deliveryPrice: parseInt(form.deliveryPrice) || 0,
        status: "active",
        start_time: now.toISOString(),
        end_time: endTime.toISOString(),
      };

      // Submit product to backend
      const createdProduct = await api.post<{ id: number }>("products", newProduct);

      // If images were uploaded, create product_images records for each
      if (imageUrls.length > 0 && createdProduct.id) {
        for (const imageUrl of imageUrls) {
          await api.post("product_images", {
            product_id: createdProduct.id,
            image_url: imageUrl,
          });
        }
      }

      // Reset form
      setForm(EMPTY_FORM);
      setImageFiles([]);
      setImageNames([]);
      // Call success callback
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la publication de l'offre");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Nouvelle offre</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Renseignez les informations de votre lot agricole</p>
      </div>

      <div className="p-6 space-y-5">

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg px-4 py-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Image upload */}
        <div>
          <label className={labelCls}>Photos du lot</label>
          <label className="flex flex-col items-center justify-center h-32 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group">
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} disabled={loading} />
            {imageNames.length > 0 ? (
              <div className="flex flex-col items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <BadgeCheck className="w-4 h-4" />
                <span>{imageNames.length} photo{imageNames.length > 1 ? "s" : ""} sélectionnée{imageNames.length > 1 ? "s" : ""}</span>
              </div>
            ) : (
              <>
                <Upload className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500 transition-colors mb-1.5" />
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Cliquez pour uploader des photos</span>
                <span className="text-xs text-zinc-400 mt-0.5">PNG, JPG jusqu'à 5 MB chacun</span>
              </>
            )}
          </label>
          {imageNames.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Photos uploadées:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {imageNames.map((name, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 truncate">{name}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      disabled={loading}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Name + category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nom du produit</label>
            <input type="text" placeholder="Ex : Tomates fraîches" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} disabled={loading || loadingData} />
          </div>
          <div>
            <label className={labelCls}>Catégorie</label>
            {loadingData ? (
              <div className={`${inputCls} flex items-center justify-center`}>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              </div>
            ) : (
              <select value={form.category_id || ""} onChange={(e) => update("category_id", parseInt(e.target.value))} className={inputCls} disabled={loading}>
                <option value="">Sélectionner…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Quantity + quality */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Quantité disponible</label>
            <input type="number" placeholder="Ex : 1200" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} className={inputCls} disabled={loading || loadingData} />
          </div>
          <div>
            <label className={labelCls}>Qualité</label>
            <div className="flex gap-2 h-10">
              {QUALITIES.map((q) => (
                <button
                  key={q}
                  onClick={() => update("quality", q)}
                  disabled={loading || loadingData}
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

        {/* Price + duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Prix au kilo / litre (DA)</label>
            <input type="number" placeholder="185" value={form.kiloPrice} onChange={(e) => update("kiloPrice", e.target.value)} className={inputCls} disabled={loading} />
          </div>
          <div>
            <label className={labelCls}>Durée de l'offre</label>
            <select value={form.duration} onChange={(e) => update("duration", e.target.value)} className={inputCls} disabled={loading}>
              {OFFERS_PERIOD.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Delivery price */}
        <div>
          <label className={labelCls}>Frais de livraison (DA) <span className="text-zinc-400">(optionnel)</span></label>
          <input type="number" placeholder="0" value={form.deliveryPrice} onChange={(e) => update("deliveryPrice", e.target.value)} className={inputCls} disabled={loading} />
        </div>

        {/* Computed total */}
        {form.quantity && form.kiloPrice && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-emerald-700 dark:text-emerald-400">Prix total estimé du lot</span>
            <span className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
              {(Number(form.quantity) * Number(form.kiloPrice)).toLocaleString("fr-DZ")} DA
            </span>
          </div>
        )}

        {/* Description */}
        <div>
          <label className={labelCls}>Description <span className="text-zinc-400">(optionnel)</span></label>
          <textarea
            rows={3}
            placeholder="Informations supplémentaires sur le lot…"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
            disabled={loading}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => {
              setForm(EMPTY_FORM);
              setError(null);
            }}
            className="h-10 px-5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Réinitialiser
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publication en cours…
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Publier l'offre
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}