"use client";

import { useState, useEffect } from "react";
import { Heart, Mail, MapPin, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/utils/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Organization {
  id: number;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  mission: string;
  image_url?: string;
}

interface CharitableOrganizationsProps {
  onSelectOrganization: (org: Organization) => void;
  onContactOrganization: (org: Organization) => void;
}

export const CharitableOrganizations = ({
  onSelectOrganization,
  onContactOrganization,
}: CharitableOrganizationsProps) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/api/organizations");
        setOrganizations(response.data || []);
      } catch (err) {
        console.error("Error loading organizations:", err);
        setError("Impossible de charger les organisations");
        // Set some mock organizations as fallback for demo
        setOrganizations([
          {
            id: 1,
            name: "Croissant Rouge Algérien",
            description: "Organisation humanitaire dédiée à l'aide d'urgence",
            email: "contact@cra.dz",
            phone: "+213 21 23 45 67",
            address: "Alger, Algérie",
            website: "www.cra.dz",
            mission: "Fournir une aide d'urgence et humanitaire",
          },
          {
            id: 2,
            name: "Agence pour le Développement Social",
            description: "Aide aux familles nécessiteuses et développement",
            email: "contact@ads.dz",
            phone: "+213 21 34 56 78",
            address: "Blida, Algérie",
            website: "www.ads.dz",
            mission: "Développement social et réduction de la pauvreté",
          },
          {
            id: 3,
            name: "Fondation pour l'Enfance",
            description: "Protection et aide aux enfants en difficulté",
            email: "contact@enfance.dz",
            phone: "+213 21 45 67 89",
            address: "Oran, Algérie",
            website: "www.enfance.dz",
            mission: "Protéger et aider les enfants vulnérables",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error && organizations.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-gap-2">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <p className="text-sm text-amber-700 dark:text-amber-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {organizations.map((org) => (
        <div
          key={org.id}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200 overflow-hidden hover:shadow-lg"
        >
          {/* Organization Image */}
          {org.image_url && (
            <div className="w-full h-40 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center overflow-hidden">
              <img
                src={org.image_url}
                alt={org.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-zinc-900 dark:text-white line-clamp-2">
                  {org.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {org.mission}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {org.description}
            </p>

            {/* Contact info */}
            <div className="space-y-2 text-sm">
              {org.email && (
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 truncate">
                  <Mail className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <a
                    href={`mailto:${org.email}`}
                    className="truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                  >
                    {org.email}
                  </a>
                </div>
              )}
              {org.phone && (
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <span className="text-xs">📱</span>
                  <a
                    href={`tel:${org.phone}`}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                  >
                    {org.phone}
                  </a>
                </div>
              )}
              {org.address && (
                <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400">
                  <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs">{org.address}</span>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onSelectOrganization(org)}
                className="flex-1 px-3 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <Heart className="w-4 h-4" />
                Faire un don
              </button>
              <button
                onClick={() => onContactOrganization(org)}
                className="flex-1 px-3 py-2.5 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <Mail className="w-4 h-4" />
                Contacter
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
