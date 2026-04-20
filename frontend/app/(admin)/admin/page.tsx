"use client";

import { useState, useEffect } from "react";
import { Icons } from "@/components/admin/Icons";
import { api } from "@/utils/apiClient";

// ─── Types matching the backend schema ────────────────────────────────────────

interface User {
  id: number;
  role: "seller" | "buyer" | string;
  is_active: boolean;
  first_name: string;
  last_name: string;
  company_name: string;
  email: string;
  created_at: string;
}

interface Revenue {
  id: number;
  user_id: number;
  total_price: number;
  date: string; // "DD-MM-YYYY"
  expire_date?: string;
}

interface Bid {
  id: number;
  product_id: number;
  buyer_id: number;
  quantity_requested: number;
  price_per_kg: number;
  total_price: number;
  status: string;
  created_at: string;
}

// ─── Helper: loading skeleton ─────────────────────────────────────────────────

function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-lg ${className}`}
      style={style}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [timeframe, setTimeframe] = useState("Cette année");
  const [skeletonHeights, setSkeletonHeights] = useState<number[]>([]);

  const [users, setUsers] = useState<User[]>([]);
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Initialize skeleton heights on mount ──────────────────────────────────
  useEffect(() => {
    setSkeletonHeights(Array(12).fill(0).map(() => Math.random() * 60 + 20));
  }, []);

  // ── Fetch all data on mount ───────────────────────────────────────────────
  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const [usersData, revenueData, bidsData] = await Promise.all([
          api.get<User[]>("users"),
          api.get<Revenue[]>("revenue"),
          api.get<Bid[]>("bids"),
        ]);
        setUsers(usersData);
        setRevenue(revenueData);
        setBids(bidsData);
      } catch (err: any) {
        setError(err.message || "Impossible de joindre le serveur.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  // ── Derived KPIs ──────────────────────────────────────────────────────────
  const totalRevenue = revenue.reduce((acc, r) => acc + r.total_price, 0);
  const totalBids = bids.length;
  const totalSellers = users.filter((u) => u.role === "seller").length;
  const activeUsers = users.filter((u) => u.is_active).length;

  // ── Chart computation ─────────────────────────────────────────────────────
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  let chartLabels: string[] = [];
  let chartValues: number[] = [];

  if (timeframe === "Cette année") {
    chartLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    chartValues = Array(12).fill(0);

    revenue.forEach((rev) => {
      if (rev.date) {
        // Date format is "DD-MM-YYYY"
        const parts = rev.date.split("-");
        if (parts.length === 3) {
          const month = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          if (year === currentYear && month >= 1 && month <= 12) {
            chartValues[month - 1] += rev.total_price;
          }
        }
      }
    });
  } else {
    chartLabels = ["Semaine 1", "Semaine 2", "Semaine 3", "Semaine 4"];
    chartValues = Array(4).fill(0);

    revenue.forEach((rev) => {
      if (rev.date) {
        const parts = rev.date.split("-");
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          if (month === currentMonth && year === currentYear) {
            const week = Math.min(Math.floor((day - 1) / 7), 3);
            chartValues[week] += rev.total_price;
          }
        }
      }
    });
  }

  const maxRevenue = Math.max(...chartValues, 1);
  const chartHeights = chartValues.map((v) =>
    v === 0 ? 0 : (v / maxRevenue) * 100
  );

  // ── Recent bids (last 5) ──────────────────────────────────────────────────
  const recentBids = [...bids]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const stats = [
    {
      name: "Chiffre d'Affaires",
      value: loading ? null : `${totalRevenue.toLocaleString("fr-DZ")} DZD`,
      change: "+12%",
      trend: "up",
      icon: Icons.dollar,
    },
    {
      name: "Utilisateurs Actifs",
      value: loading ? null : activeUsers.toString(),
      change: "+5.4%",
      trend: "up",
      icon: Icons.users,
    },
    {
      name: "Total de Bids",
      value: loading ? null : totalBids.toString(),
      change: "+2.1%",
      trend: "up",
      icon: Icons.trendingUp,
    },
    {
      name: "Vendeurs Total",
      value: loading ? null : totalSellers.toString(),
      change: "+14.5%",
      trend: "up",
      icon: Icons.wallet,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Tableau de Bord
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Bienvenue sur l'administration AgroRevalue. Voici ce qui se passe aujourd'hui.
          </p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900">
          Générer un Rapport
        </button>
      </div>

      {/* ── Error Banner ───────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <Icons.close className="w-4 h-4 shrink-0" />
          <span>
            <strong>Erreur de connexion :</strong> {error}. Vérifiez que le serveur backend est actif sur{" "}
            <code className="font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">
              http://localhost:5000
            </code>
          </span>
        </div>
      )}

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md group"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.trend === "up"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                >
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {stat.name}
                </p>
                {stat.value === null ? (
                  <Skeleton className="h-8 w-3/4 mt-1" />
                ) : (
                  <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                    {stat.value}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Chart + Recent Bids ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Aperçu des Revenus
            </h2>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option>Ce mois</option>
              <option>Cette année</option>
            </select>
          </div>

          {loading ? (
            <div className="h-[300px] flex items-end justify-between gap-2 pb-6">
              {skeletonHeights.map((height, i) => (
                <Skeleton
                  key={i}
                  className="flex-1"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          ) : (
            <div className="h-[300px] w-full flex items-end justify-between gap-2 pb-6 relative mt-8">
              {chartHeights.map((height, i) => (
                <div
                  key={i}
                  className="flex-1 group relative flex flex-col justify-end h-full"
                >
                  <div
                    className={`w-full rounded-t-sm transition-all duration-500 ${height > 0
                        ? "bg-emerald-100 dark:bg-emerald-900/40 group-hover:bg-emerald-500 dark:group-hover:bg-emerald-400 cursor-pointer"
                        : "bg-transparent"
                      }`}
                    style={{
                      height: `${height}%`,
                      minHeight: height > 0 ? "4px" : "0",
                    }}
                  />
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-zinc-400 whitespace-nowrap">
                    {chartLabels[i]}
                  </span>
                  {height > 0 && (
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity -top-10 left-1/2 -translate-x-1/2 bg-zinc-800 dark:bg-black text-white text-xs py-1.5 px-2.5 rounded shadow-lg whitespace-nowrap z-10 pointer-events-none">
                      {chartValues[i].toLocaleString("fr-DZ")} DZD
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bids */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Derniers Bids
            </h2>
            {!loading && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {bids.length} total
              </span>
            )}
          </div>

          <div className="space-y-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : recentBids.length > 0 ? (
              recentBids.map((bid, i) => (
                <div key={bid.id} className="flex gap-4 relative">
                  {i !== recentBids.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-[-24px] w-px bg-zinc-200 dark:bg-zinc-800" />
                  )}
                  <div className="relative z-10 w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border-2 border-white dark:border-zinc-950">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      Bid de {bid.quantity_requested} kg à {bid.price_per_kg} DZD/kg
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {new Date(bid.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <span
                      className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${bid.status === "accepted"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : bid.status === "rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                    >
                      {bid.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Aucun bid récent.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
