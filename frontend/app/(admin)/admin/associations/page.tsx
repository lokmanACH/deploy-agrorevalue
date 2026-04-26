"use client";

import { useState, useEffect } from "react";
import { Icons } from "@/components/admin/Icons";
import { api } from "@/utils/apiClient";
import { mockData } from "../mockData";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: number;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  first_name: string;
  last_name: string;
  company_name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface Revenue {
  id: number;
  user_id: number;
  total_price: number;
  date: string;
}

interface CompanyVerification {
  id: number;
  user_id: number;
  business_id: string;
  business_license: string[];
  status: string;
}

// ─── Helper: status badge ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Actif"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30"
      : status === "En attente"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30"
        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SellersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [selectedLicenses, setSelectedLicenses] = useState<{ urls: string[]; businessId: string } | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<number, string>>({});
  const [editingSeller, setEditingSeller] = useState<any>(null);
  const [editStatusValue, setEditStatusValue] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // ── API state ─────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [verifications, setVerifications] = useState<CompanyVerification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [u, r, v] = await Promise.all([
          api.get<User[]>("users"),
          api.get<Revenue[]>("revenue"),
          api.get<CompanyVerification[]>("company_verification"),
        ]);
        setUsers(u);
        setRevenue(r);
        setVerifications(v);
      } catch {
        // Fall back to mock data
        setUsers(mockData.users as any);
        setRevenue(mockData.revenue as any);
        setVerifications(mockData.company_verification as any);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Derived seller rows ───────────────────────────────────────────────────
  const baseSellers = users
    .filter((u) => u.role === "association")
    .map((user) => {
      const totalRevenue = revenue
        .filter((r) => r.user_id === user.id)
        .reduce((sum, r) => sum + r.total_price, 0);

      const verification = verifications.find((v) => v.user_id === user.id);
      const licenseUrls = verification?.business_license || [];
      const businessId = verification?.business_id || "Non renseigné";
      const verifStatus = verification?.status;

      let status = "Inactif";

      if (user.is_active) {
        if (user.is_verified) status = "Actif";
        else status = "En attente";
      }

      if (statusOverrides[user.id]) status = statusOverrides[user.id];

      return {
        originalId: user.id,
        id: `${user.id}`,
        name: `${user.first_name} ${user.last_name}`,
        company: user.company_name,
        email: user.email,
        phone: user.phone,
        date: new Date(user.created_at).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        revenueNumber: totalRevenue,
        revenue: `${totalRevenue.toLocaleString("fr-DZ")} DZD`,
        status,
        verified: verifStatus === "approved",
        licenses: licenseUrls,
        businessId,
      };
    });

  const filteredSellers = baseSellers.filter((s) => {
    const q = searchTerm.toLowerCase();
    const searchMatch =
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.company.toLowerCase().includes(q);
    const statusMatch = statusFilter === "Tous" || s.status === statusFilter;
    return searchMatch && statusMatch;
  });

  // ── KPI stats ─────────────────────────────────────────────────────────────
  const totalSellers = baseSellers.length;
  const enAttente = baseSellers.filter((s) => s.status === "En attente").length;
  const totalRevenueGlobal = baseSellers.reduce((sum, s) => sum + s.revenueNumber, 0);
  const avgMonthlyVolume = totalRevenueGlobal / 12;

  const statsCards = [
    {
      name: "Total associations",
      value: loading ? "—" : totalSellers.toString(),
      icon: Icons.wallet,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
    },
    {
      name: "En attente de validation",
      value: loading ? "—" : enAttente.toString(),
      icon: Icons.fileText,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/30",
    },
  ];

  // ── Handlers ──────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExportCSV = () => {
    const rows = [
      ["ID association", "Nom complet", "Entreprise", "Email", "Téléphone", "Date inscription", "Revenus (DZD)", "Statut"].join(","),
      ...filteredSellers.map((s) =>
        [s.id, `"${s.name}"`, `"${s.company}"`, s.email, s.phone, s.date, s.revenueNumber, s.status].join(",")
      ),
    ];
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.join("\n"));
    link.download = "associations.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV exporté avec succès !");
  };

  const handleDownloadAll = (urls: string[]) => {
    urls.forEach((url, i) => {
      const link = document.createElement("a");
      link.href = url;
      link.download = `licence_document_${i + 1}`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleSaveStatus = () => {
    if (editingSeller) {




      // Inactif
      // En attente
      // Actif
      if(editStatusValue == "Actif"){
        api.put<User[]>(`users/${editingSeller.originalId}`,{
          is_active: true,
          is_verified: true
        })
      }

      if(editStatusValue == "En attente"){
        api.put<User[]>(`users/${editingSeller.originalId}`,{
          is_active: true,
          is_verified: false
        })
      }

      if(editStatusValue == "Inactif"){
        api.put<User[]>(`users/${editingSeller.originalId}`,{
          is_active: false,
        })
      }


      setStatusOverrides((prev) => ({ ...prev, [editingSeller.originalId]: editStatusValue }));
      setEditingSeller(null);
      showToast(`Statut de ${editingSeller.name} mis à jour.`);
    }
  };

  // ─── Skeleton row ─────────────────────────────────────────────────────────
  const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-zinc-100 dark:border-zinc-800">
      {[...Array(8)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
        </td>
      ))}
    </tr>
  );

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium">
          <svg className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Gestion des associations
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Consultez et gérez l'ensemble des associations.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Icons.download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* ── Stats Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statsCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.name}</p>
              {loading ? (
                <div className="h-7 w-20 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="relative w-full sm:w-96">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher une association..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 text-sm min-w-[170px]">
              <Icons.dashboard className="w-4 h-4 text-zinc-400 ml-2 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm font-medium text-zinc-700 dark:text-zinc-300 py-2 pl-2 pr-4 outline-none focus:ring-0 cursor-pointer w-full appearance-none"
              >
                <option value="Tous">Tous les statuts</option>
                <option value="Actif">Actif</option>
                <option value="En attente">En attente</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">ID association</th>
                <th className="px-6 py-4 font-medium">Nom / Entreprise</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Date d&apos;inscription</th>
                <th className="px-6 py-4 font-medium">Revenus générés</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-center">Documents</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
              ) : filteredSellers.length > 0 ? (
                filteredSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">{seller.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-xs shrink-0">
                          {seller.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-800 dark:text-zinc-200">{seller.name}</p>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500">{seller.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <a href={`mailto:${seller.email}`} title={seller.email} className="text-zinc-400 hover:text-emerald-600 transition-colors p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full">
                          <Icons.mail className="w-4 h-4" />
                        </a>
                        <a href={`tel:${seller.phone}`} title={seller.phone} className="text-zinc-400 hover:text-emerald-600 transition-colors p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full">
                          <Icons.phone className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{seller.date}</td>
                    <td className="px-6 py-4 font-medium text-zinc-700 dark:text-zinc-300">{seller.revenue}</td>
                    <td className="px-6 py-4"><StatusBadge status={seller.status} /></td>
                    <td className="px-6 py-4 text-center">
                      {seller.licenses.length > 0 ? (
                        <div className="flex justify-center">
                          <button
                            onClick={() => setSelectedLicenses({ urls: seller.licenses, businessId: seller.businessId })}
                            className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 p-2 rounded-lg transition-colors relative"
                            title="Voir les licences"
                          >
                            <Icons.fileText className="w-4 h-4" />
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold border border-white dark:border-zinc-950">
                              {seller.licenses.length}
                            </span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-300 dark:text-zinc-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setEditingSeller(seller); setEditStatusValue(seller.status); }}
                        className="text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:border-emerald-300 dark:hover:border-emerald-700"
                      >
                        Éditer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                      <Icons.wallet className="w-10 h-10 opacity-30" />
                      <p className="font-medium">Aucune association trouvée</p>
                      <p className="text-sm">Essayez de modifier vos filtres de recherche.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/20">
          <div>
            {loading ? "Chargement…" : `${filteredSellers.length} résultat${filteredSellers.length !== 1 ? "s" : ""} sur ${baseSellers.length} association${baseSellers.length !== 1 ? "s" : ""}`}
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 opacity-40 cursor-not-allowed text-xs">Précédent</button>
            <button className="px-3 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 opacity-40 cursor-not-allowed text-xs">Suivant</button>
          </div>
        </div>
      </div>

      {/* ── Licenses Modal ─────────────────────────────────────── */}
      {selectedLicenses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative border border-zinc-200 dark:border-zinc-800">
            <button onClick={() => setSelectedLicenses(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded-lg">
              <Icons.close className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-1">Documents d&apos;entreprise</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              N° registre commerce : <span className="font-medium text-zinc-900 dark:text-zinc-100">{selectedLicenses.businessId}</span>
            </p>
            <div className="space-y-3 mb-6">
              {selectedLicenses.urls.map((url, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                      <Icons.fileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Licence_{i + 1}.jpg</p>
                      <p className="text-xs text-zinc-400">Document joint par l&apos;utilisateur</p>
                    </div>
                  </div>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors">
                    Ouvrir
                  </a>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button onClick={() => setSelectedLicenses(null)} className="flex-1 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Fermer</button>
              <button onClick={() => handleDownloadAll(selectedLicenses.urls)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                <Icons.download className="w-4 h-4" />Tout télécharger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Status Modal ─────────────────────────────────── */}
      {editingSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative border border-zinc-200 dark:border-zinc-800">
            <button onClick={() => setEditingSeller(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded-lg">
              <Icons.close className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-1">Modifier le statut</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              association : <span className="font-medium text-zinc-900 dark:text-zinc-100">{editingSeller.name}</span>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Nouveau statut</label>
              <select value={editStatusValue} onChange={(e) => setEditStatusValue(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-white cursor-pointer">
                <option value="Actif">Actif</option>
                <option value="En attente">En attente</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingSeller(null)} className="flex-1 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Annuler</button>
              <button onClick={handleSaveStatus} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">Sauvegarder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
