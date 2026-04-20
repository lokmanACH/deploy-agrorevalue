"use client";

import { useState } from "react";
import { Icons } from "@/components/admin/Icons";

// ─── Toggle Switch component ───────────────────────────────────────────────────

function Toggle({
  enabled,
  onChange,
  id,
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
  id: string;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
        enabled ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
      </div>
      <div className="p-6">{children}</div>
      {footer && (
        <div className="bg-zinc-50/70 dark:bg-zinc-900/40 p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
          {footer}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SettingsPage() {
  // Admin profile
  const [firstName, setFirstName] = useState("Admin");
  const [lastName, setLastName] = useState("AgroRevalue");
  const [email, setEmail] = useState("admin@agrorevalue.com");
  const [phone, setPhone] = useState("+213 555 123 456");
  const [password, setPassword] = useState("");

  // Platform config
  const [commissionRate, setCommissionRate] = useState("5");
  const [minBidKg, setMinBidKg] = useState("50");
  const [maxBidKg, setMaxBidKg] = useState("10000");
  const [sessionTimeout, setSessionTimeout] = useState("60");

  // Notifications
  const [notifyNewUser, setNotifyNewUser] = useState(true);
  const [notifyNewBid, setNotifyNewBid] = useState(true);
  const [notifyVerification, setNotifyVerification] = useState(true);
  const [notifyRevenue, setNotifyRevenue] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(true);

  // Platform status
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [biddingEnabled, setBiddingEnabled] = useState(true);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [dangerConfirm, setDangerConfirm] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveProfile = () => {
    if (!email.includes("@")) {
      showToast("Adresse email invalide.", "error");
      return;
    }
    showToast("Profil administrateur mis à jour avec succès !");
  };

  const handleSavePlatform = () => {
    if (Number(commissionRate) < 0 || Number(commissionRate) > 50) {
      showToast("Le taux de commission doit être entre 0 et 50 %.", "error");
      return;
    }
    showToast("Configuration plateforme sauvegardée !");
  };

  const handleSaveNotifications = () => {
    showToast("Préférences de notifications mises à jour !");
  };

  return (
    <div className="space-y-8 max-w-4xl relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
              : "bg-red-600 text-white"
          }`}
        >
          <svg className={`w-4 h-4 shrink-0 ${toast.type === "success" ? "text-emerald-400 dark:text-emerald-600" : "text-red-200"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {toast.type === "success" ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            )}
          </svg>
          {toast.msg}
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Paramètres</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Gérez la configuration globale de la plateforme, vos préférences et votre compte administrateur.
        </p>
      </div>

      {/* ── Admin Profile ─────────────────────────────────────────────────── */}
      <Section
        title="Profil Administrateur"
        description="Mettez à jour vos informations de connexion et de contact."
        footer={
          <>
            <button
              onClick={() => { setFirstName("Admin"); setLastName("AgroRevalue"); setEmail("admin@agrorevalue.com"); setPhone("+213 555 123 456"); setPassword(""); }}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            >
              Réinitialiser
            </button>
            <button
              onClick={handleSaveProfile}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
            >
              Sauvegarder
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* First Name */}
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Prénom</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-zinc-900 dark:text-white transition-all"
            />
          </div>
          {/* Last Name */}
          <div className="space-y-1.5">
            <label htmlFor="lastName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nom</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-zinc-900 dark:text-white transition-all"
            />
          </div>
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="adminEmail" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email administrateur</label>
            <input
              id="adminEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-zinc-900 dark:text-white transition-all"
            />
          </div>
          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="adminPhone" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Numéro de téléphone</label>
            <input
              id="adminPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-zinc-900 dark:text-white transition-all"
            />
          </div>
          {/* Password */}
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="adminPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nouveau mot de passe{" "}
              <span className="text-zinc-400 font-normal">(laisser vide pour ne pas modifier)</span>
            </label>
            <input
              id="adminPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-zinc-900 dark:text-white transition-all"
            />
          </div>
        </div>
      </Section>

      {/* ── Platform Configuration ─────────────────────────────────────────── */}
      <Section
        title="Configuration de la Plateforme"
        description="Paramètres commerciaux et règles de fonctionnement de la marketplace."
        footer={
          <button
            onClick={handleSavePlatform}
            className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
          >
            Sauvegarder
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="commissionRate" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Taux de commission (%)
            </label>
            <div className="relative">
              <input
                id="commissionRate"
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full h-10 px-3 pr-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-zinc-900 dark:text-white transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pointer-events-none">%</span>
            </div>
            <p className="text-xs text-zinc-400">Commission prélevée sur chaque transaction réussie.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sessionTimeout" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Délai d&apos;expiration de session (min)
            </label>
            <div className="relative">
              <input
                id="sessionTimeout"
                type="number"
                min="5"
                max="480"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full h-10 px-3 pr-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-zinc-900 dark:text-white transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pointer-events-none">min</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="minBidKg" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Quantité minimale de bid (kg)
            </label>
            <div className="relative">
              <input
                id="minBidKg"
                type="number"
                min="1"
                value={minBidKg}
                onChange={(e) => setMinBidKg(e.target.value)}
                className="w-full h-10 px-3 pr-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-zinc-900 dark:text-white transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pointer-events-none">kg</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="maxBidKg" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Quantité maximale de bid (kg)
            </label>
            <div className="relative">
              <input
                id="maxBidKg"
                type="number"
                min="1"
                value={maxBidKg}
                onChange={(e) => setMaxBidKg(e.target.value)}
                className="w-full h-10 px-3 pr-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-zinc-900 dark:text-white transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pointer-events-none">kg</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Platform Status ─────────────────────────────────────────────────── */}
      <Section
        title="Statut de la Plateforme"
        description="Contrôlez l'accès aux fonctionnalités principales en temps réel."
      >
        <div className="space-y-5">
          {[
            {
              id: "toggle-maintenance",
              label: "Mode maintenance",
              desc: "Suspend l'accès public à la plateforme. Seuls les admins peuvent se connecter.",
              enabled: maintenanceMode,
              onChange: setMaintenanceMode,
              danger: true,
            },
            {
              id: "toggle-registration",
              label: "Inscriptions ouvertes",
              desc: "Permet aux nouveaux utilisateurs de créer un compte sur la plateforme.",
              enabled: registrationOpen,
              onChange: setRegistrationOpen,
              danger: false,
            },
            {
              id: "toggle-bidding",
              label: "Activité des bids",
              desc: "Autorise les acheteurs à soumettre des offres sur les produits disponibles.",
              enabled: biddingEnabled,
              onChange: setBiddingEnabled,
              danger: false,
            },
          ].map((item) => (
            <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border ${item.danger ? "border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20" : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30"}`}>
              <div>
                <p className={`text-sm font-medium ${item.danger ? "text-red-800 dark:text-red-300" : "text-zinc-800 dark:text-zinc-200"}`}>
                  {item.label}
                  {item.danger && item.enabled && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 uppercase tracking-wider">Actif</span>
                  )}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{item.desc}</p>
              </div>
              <Toggle id={item.id} enabled={item.enabled} onChange={item.onChange} />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Notifications ───────────────────────────────────────────────────── */}
      <Section
        title="Préférences de Notifications"
        description="Choisissez les événements pour lesquels vous souhaitez être alerté."
        footer={
          <button
            onClick={handleSaveNotifications}
            className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
          >
            Sauvegarder
          </button>
        }
      >
        <div className="space-y-4">
          {[
            { id: "notif-new-user", label: "Nouvelle inscription", desc: "Quand un utilisateur s'inscrit sur la plateforme.", enabled: notifyNewUser, onChange: setNotifyNewUser },
            { id: "notif-new-bid", label: "Nouveau bid", desc: "Quand un acheteur soumet une offre sur un produit.", enabled: notifyNewBid, onChange: setNotifyNewBid },
            { id: "notif-verification", label: "Demande de vérification", desc: "Quand un vendeur demande la validation de son entreprise.", enabled: notifyVerification, onChange: setNotifyVerification },
            { id: "notif-revenue", label: "Rapport de revenus quotidien", desc: "Reçois un résumé des revenus et bids chaque soir.", enabled: notifyRevenue, onChange: setNotifyRevenue },
            { id: "notif-email", label: "Notifications par email", desc: `Envoyer les alertes à ${email}.`, enabled: notifyEmail, onChange: setNotifyEmail },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{item.label}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{item.desc}</p>
              </div>
              <Toggle id={item.id} enabled={item.enabled} onChange={item.onChange} />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Danger Zone ─────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-red-200 dark:border-red-900/30 shadow-sm overflow-hidden">
        <div className="border-b border-red-200 dark:border-red-900/30 p-6 bg-red-50/30 dark:bg-red-950/10">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-400">Zone de danger</h2>
          <p className="text-sm text-red-600/80 dark:text-red-500/80 mt-0.5">
            Ces actions sont irréversibles. Agissez avec précaution.
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 dark:border-red-900/30">
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Réinitialiser les données de démonstration</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Supprime toutes les données de test et restaure l&apos;état initial de la base de données.</p>
            </div>
            {dangerConfirm ? (
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setDangerConfirm(false)} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                  Annuler
                </button>
                <button
                  onClick={() => { setDangerConfirm(false); showToast("Données réinitialisées."); }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  Confirmer
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDangerConfirm(true)}
                className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
