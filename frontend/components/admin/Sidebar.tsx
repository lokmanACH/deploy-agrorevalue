"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "./Icons";
import { useState } from "react";
import { LogOut } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Tableau de Bord", href: "/admin", icon: Icons.dashboard },
    { name: "Acheteurs", href: "/admin/buyers", icon: Icons.users },
    { name: "Vendeurs", href: "/admin/sellers", icon: Icons.wallet },
    { name: "Paramètres", href: "/admin/settings", icon: Icons.settings },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-zinc-900/80 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              AR
            </div>
            <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              AgroRevalue
            </span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <Icons.close className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4 px-3 mt-4">
            Menu principal
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50"
                  }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-400 dark:text-zinc-500"
                    }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="bg-linear-to-r from-emerald-600 to-teal-600 rounded-xl p-4 text-white shadow-md">
            <h4 className="font-semibold text-sm mb-1">Besoin d&apos;aide ?</h4>
            <p className="text-xs text-emerald-100 mb-3 opacity-90">
              Veuillez contacter le support.
            </p>
            <Link 
              href="/admin/help"
              className="flex justify-center w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs py-2 rounded-lg font-medium transition-colors"
            >
              Documentation
            </Link>
          </div>
        </div>

                {/* Logout */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-red-400 to-red-500/90 text-white font-semibold rounded-lg hover:from-red-500/90 hover:to-red-500 transition shadow-md hover:shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            <span>Se déconnecter</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
