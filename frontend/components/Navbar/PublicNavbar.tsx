"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Search, Globe, Menu, X } from "lucide-react";

export function PublicNavbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    if (typeof window === 'undefined') return;
    
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
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200 bg-emerald-500/80 backdrop-blur-md dark:border-zinc-800 transition-colors duration-300">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left — Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            AR
          </div>
          <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 hidden sm:block">
            AgroRevalue
          </span>
        </Link>


        {/* Right — Desktop actions */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/login"
            className="h-9 px-4 flex items-center text-sm font-medium rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-800 transition-colors"
          >
            Se Connecter
          </Link>

          <Link
            href="/signup"
            className="h-9 px-4 flex items-center text-sm font-medium rounded-full bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-sm"
          >
            S&apos;inscrire
          </Link>

          <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />

          {/* Language + theme */}
          <button className="flex items-center gap-1.5 text-sm text-zinc-50 dark:text-zinc-950 hover:text-zinc-200 dark:hover:text-zinc-800 transition-colors px-2">
            <Globe className="w-4 h-4" />
            <span className="hidden lg:inline">Langues</span>
          </button>

          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-50 dark:text-zinc-950  transition-colors"
          >
            {isDark ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
              </svg>
            )}
          </button>
        </div>

        {/* Right — Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`sm:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-2 px-4 py-4">
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center h-10 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Se Connecter
          </Link>
          <Link
            href="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center h-10 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            S&apos;inscrire
          </Link>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Globe className="w-4 h-4" />
              Langues
            </button>
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            >
              {isDark ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}