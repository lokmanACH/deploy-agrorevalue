"use client";

import { Icons } from "./Icons";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ setSidebarOpen }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const navigation = [
    { name: "Tableau de Bord", href: "/admin", icon: Icons.dashboard },
    { name: "Acheteurs", href: "/admin/buyers", icon: Icons.users },
    { name: "Vendeurs", href: "/admin/sellers", icon: Icons.wallet },
    { name: "Paramètres", href: "/admin/settings", icon: Icons.settings },
  ];

  const filteredNav = navigation.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Check initial state after hydration
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 transition-colors duration-300 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 lg:hidden"
        >
          <Icons.menu className="h-6 w-6" />
        </button>

        <div className="hidden lg:flex lg:items-center relative" ref={searchRef}>
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="h-10 w-80 rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
          />
          {isSearchOpen && searchQuery.trim() !== "" && (
            <div className="absolute top-12 left-0 w-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg overflow-hidden flex flex-col py-2 z-50">
              {filteredNav.length > 0 ? (
                filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearchOpen(false);
                        router.push(item.href);
                      }}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 transition-colors w-full text-left"
                    >
                      <Icon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      {item.name}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Aucun résultat trouvé.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={toggleTheme}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          title="Basculer le thème"
        >
          {isDark ? <Icons.sun className="h-5 w-5" /> : <Icons.moon className="h-5 w-5" />}
        </button>

        <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
          <Icons.bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950 transition-colors duration-300" />
        </button>

        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 transition-colors duration-300" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Admin</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Super Admin</p>
          </div>
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-zinc-200 bg-emerald-100 dark:border-zinc-800 dark:bg-emerald-900/50 transition-colors duration-300">
            <img
              src="https://i.pinimg.com/736x/2e/ae/fd/2eaefd75d164be0b17ef6f09749d0da8.jpg"
              alt="Admin avatar"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
