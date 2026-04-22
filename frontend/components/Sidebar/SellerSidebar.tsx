"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Home, User, LogOut, Menu, X } from "lucide-react";

const SellerSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const navLinks = [
    { href: "/seller", label: "Accueil", icon: Home },
    { href: "/seller/profile", label: "Profil", icon: User },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between">
        <button
          onClick={toggleSidebar}
          className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link href="/seller/profile" className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">John Doe</span>
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">JD</div>
        </Link>
      </div>

      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 z-40 bg-zinc-900/80 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 z-40 w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 top-16 bottom-0 lg:top-0 lg:h-screen h-[calc(100vh-4rem)] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Desktop header */}
        <div className="hidden lg:flex items-center h-16 px-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/seller" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              AR
            </div>
            <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              AgroRevalue
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4 px-3 mt-4">
            Menu principal
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-400 dark:text-zinc-500"
                  }`}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Logout Button */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href="/"
            onClick={closeSidebar}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-red-400 to-red-500/90 text-white font-semibold rounded-lg hover:from-red-500/90 hover:to-red-500 transition shadow-md hover:shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            <span>Se déconnecter</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default SellerSidebar;