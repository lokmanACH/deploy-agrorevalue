"use client";

import { useState } from "react";
import { Icons } from "@/components/admin/Icons";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FaqItem {
  question: string;
  answer: string;
}

// ─── FAQ Accordion Item ────────────────────────────────────────────────────────

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group"
          >
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              {item.question}
            </span>
            <svg
              className={`w-4 h-4 text-zinc-400 shrink-0 ml-4 transition-transform duration-200 ${openIndex === i ? "rotate-180 text-emerald-500" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === i && (
            <div className="px-5 pb-5 pt-1 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HelpPage() {
  const faqItems: FaqItem[] = [
    {
      question: "Comment valider un compte vendeur ?",
      answer:
        'Accédez à la page "Vendeurs" depuis le menu latéral. Trouvez le vendeur concerné dans la liste, cliquez sur "Éditer" et changez son statut de "En attente" à "Actif". Si le vendeur a joint des documents, vous pouvez les consulter via le bouton de document avant validation.',
    },
    {
      question: "Comment exporter la liste des utilisateurs ?",
      answer:
        'Sur les pages Acheteurs et Vendeurs, un bouton "Exporter CSV" est disponible en haut à droite. Il génère un fichier CSV contenant tous les utilisateurs correspondant aux filtres actuellement actifs (recherche + statut). Le fichier est téléchargé directement dans votre navigateur.',
    },
    {
      question: "Comment activer le mode maintenance ?",
      answer:
        'Rendez-vous dans Paramètres > Statut de la Plateforme. Activez le toggle "Mode maintenance". Cela suspend immédiatement l\'accès public à la plateforme. Seuls les utilisateurs administrateurs pourront se connecter pendant cette période.',
    },
    {
      question: "Comment interpréter les données du tableau de bord principal ?",
      answer:
        "Le tableau de bord affiche les KPIs principaux : chiffre d'affaires total, utilisateurs actifs, nombre de bids, et total vendeurs. Le graphique de revenus peut être filtré par mois ou par année. Les données sont récupérées en temps réel depuis le backend API au chargement de la page.",
    },
    {
      question: "Que signifient les différents statuts utilisateur ?",
      answer:
        '"Actif" : le compte est vérifié et l\'utilisateur peut se connecter et utiliser toutes les fonctionnalités. "En attente" : l\'utilisateur attend la validation de son compte ou de ses documents. "Inactif" : le compte a été désactivé manuellement par un administrateur.',
    },
    {
      question: "Comment fonctionne le système de bids ?",
      answer:
        "Les acheteurs soumettent des offres (bids) sur des produits mis en enchère par les vendeurs. Chaque bid précise une quantité en kg et un prix par kg. Le vendeur peut ensuite accepter ou rejeter les offres. En cas d'acceptation, une allocation est créée et le revenu est enregistré.",
    },
    {
      question: "Les modifications de statut sont-elles persistées ?",
      answer:
        "Dans la version actuelle, les modifications de statut effectuées via le bouton \"Éditer\" sont conservées localement dans l'état React de la session en cours. Pour persister ces modifications, il faudra connecter les appels API PUT/PATCH au backend. Le système est prêt techniquement pour cette intégration.",
    },
    {
      question: "Comment contacter le support technique ?",
      answer:
        "Envoyez un email à support@agrorevalue.com en décrivant votre problème, votre URL de page et toute capture d'écran pertinente. Vous pouvez aussi utiliser le bouton de contact rapide en bas de cette page.",
    },
  ];

  const quickLinks = [
    { label: "Tableau de bord", href: "/admin", icon: Icons.dashboard, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
    { label: "Acheteurs", href: "/admin/buyers", icon: Icons.users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30" },
    { label: "Vendeurs", href: "/admin/sellers", icon: Icons.wallet, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/30" },
    { label: "Paramètres", href: "/admin/settings", icon: Icons.settings, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30" },
  ];

  const features = [
    {
      step: "01",
      icon: Icons.dashboard,
      title: "Suivre les performances",
      desc: "Visualisez les revenus via le graphique dynamique. Filtrez par mois ou par année. Les KPIs sont calculés en temps réel depuis l'API backend.",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
    },
    {
      step: "02",
      icon: Icons.users,
      title: "Gérer les Acheteurs",
      desc: "Consultez les acheteurs inscrits, vérifiez leurs documents, changez leur statut (Actif / En attente / Inactif) et exportez la liste en CSV.",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/30",
    },
    {
      step: "03",
      icon: Icons.wallet,
      title: "Superviser les Vendeurs",
      desc: "Gérez les comptes vendeurs et agriculteurs. Téléchargez ou ouvrez leurs licences commerciales. Validez ou suspendez les comptes en un clic.",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/30",
    },
    {
      step: "04",
      icon: Icons.settings,
      title: "Configurer la plateforme",
      desc: "Ajustez les taux de commission, les limites de bids, la maintenance, les inscriptions et vos préférences de notification depuis les Paramètres.",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/30",
    },
  ];

  const shortcuts = [
    { keys: ["Ctrl", "K"], action: "Ouvrir la recherche rapide" },
    { keys: ["Esc"], action: "Fermer les modals ouverts" },
    { keys: ["Tab"], action: "Naviguer entre les champs de formulaire" },
    { keys: ["Enter"], action: "Confirmer un formulaire ou une action" },
    { keys: ["Ctrl", "S"], action: "Sauvegarder (sur les pages de paramètres)" },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-3xl p-10 text-white shadow-xl overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full bg-white" />
          <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-white" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Centre d&apos;aide
          </div>
          <h1 className="text-3xl font-bold mb-3">Comment pouvons-nous vous aider ?</h1>
          <p className="text-emerald-100 text-base max-w-xl mb-8">
            Retrouvez ici toute la documentation du tableau de bord, les réponses aux questions fréquentes et comment contacter notre support technique.
          </p>
          <a
            href="mailto:support@agrorevalue.com"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-emerald-50 transition-colors shadow-md"
          >
            <Icons.mail className="w-4 h-4" />
            Contacter le support
          </a>
        </div>
      </div>

      {/* ── Quick Navigation ──────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Navigation rapide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all group"
            >
              <div className={`p-3 rounded-xl ${link.bg} group-hover:scale-110 transition-transform duration-200`}>
                <link.icon className={`w-5 h-5 ${link.color}`} />
              </div>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Feature Documentation ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-8">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
          Guide des fonctionnalités
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          Tout ce que vous pouvez faire sur ce tableau de bord administrateur.
        </p>
        <div className="space-y-6">
          {features.map((f, i) => (
            <div key={i} className="flex gap-5 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div className={`p-2.5 rounded-xl ${f.bg}`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <span className={`text-xs font-bold ${f.color} opacity-60`}>{f.step}</span>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{f.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Questions fréquentes
        </h2>
        <FaqAccordion items={faqItems} />
      </div>

      {/* ── Keyboard Shortcuts ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Raccourcis clavier</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Naviguez plus vite avec ces raccourcis.
          </p>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{s.action}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <>
                    {j > 0 && <span key={`plus-${j}`} className="text-zinc-400 text-xs">+</span>}
                    <kbd key={k} className="px-2 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm">
                      {k}
                    </kbd>
                  </>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Contact & Version ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Contact card */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
              <Icons.mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">Support technique</h3>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Notre équipe technique vous répond sous 24h ouvrées.
          </p>
          <a
            href="mailto:support@agrorevalue.com"
            className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            support@agrorevalue.com
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        {/* Version info */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <Icons.fileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">Informations système</h3>
          </div>
          <div className="space-y-2 text-sm">
            {[
              { label: "Version du tableau de bord", value: "v2.1.0" },
              { label: "Stack", value: "Next.js 14 + FastAPI" },
              { label: "Environnement", value: "Développement" },
              { label: "Dernière mise à jour", value: "Avril 2026" },
            ].map((row, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">{row.label}</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
