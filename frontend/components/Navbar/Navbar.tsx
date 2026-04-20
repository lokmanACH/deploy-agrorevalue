// "use client";

// import { useState, useEffect } from "react";
// import { Search, Bell } from "lucide-react";

// const data = JSON.parse(localStorage.getItem("agro_user") || "{}");
// const BUYER = { name: data.first_name + " " + data.last_name, company: data.company_name || "El baraka superette" , initials: (data.first_name ? data.first_name[0] : "E") + (data.last_name ? data.last_name[0] : "B")  };

// export function Navbar() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isDark, setIsDark] = useState(false);
//   const [profileOpen, setProfileOpen] = useState(false);

//   useEffect(() => {
//     setIsDark(document.documentElement.classList.contains("dark"));
//   }, []);

//   const toggleTheme = () => {
//     if (document.documentElement.classList.contains("dark")) {
//       document.documentElement.classList.remove("dark");
//       localStorage.setItem("theme", "light");
//       setIsDark(false);
//     } else {
//       document.documentElement.classList.add("dark");
//       localStorage.setItem("theme", "dark");
//       setIsDark(true);
//     }
//   };

//   return (
//     <header className="sticky top-0 z-30 w-full h-16 border-b border-zinc-200 bg-emerald-500/80 backdrop-blur-md dark:border-zinc-800 transition-colors duration-300 flex items-center px-4 sm:px-6 gap-4">

//       {/* Search */}
//       <div className="relative flex-1 max-w-md">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
//         <input
//           type="text"
//           placeholder="Rechercher un produit, une wilaya…"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="h-9 w-full rounded-full border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
//         />
//       </div>

//       {/* Right actions */}
//       <div className="flex items-center gap-2 ml-auto">

//         {/* Theme toggle */}
//         <button
//           onClick={toggleTheme}
//           className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-950 hover:bg-zinc-100 transition-colors"
//         >
//           {isDark ? (
//             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//               <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z" />
//             </svg>
//           ) : (
//             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//               <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
//             </svg>
//           )}
//         </button>

//         {/* Notifications */}
//         <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-950 hover:bg-zinc-100  transition-colors">
//           <Bell className="h-4 w-4" />
//           {/* Unread dot */}
//           <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950" />
//         </button>

//         <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

//         {/* Profile dropdown */}
//         <div className="flex items-center gap-3 pl-2">
//           <div className="text-right hidden sm:block">
//             <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{BUYER.name}</p>
//             <p className="text-xs text-zinc-600 dark:text-zinc-950">{BUYER.company}</p>
//           </div>
//           <div className="relative h-10 w-10 overflow-hidden rounded-full border border-zinc-200 bg-emerald-100 dark:border-zinc-800 dark:bg-emerald-900/50 transition-colors duration-300">
//             <img
//               src="https://i.pinimg.com/736x/2e/ae/fd/2eaefd75d164be0b17ef6f09749d0da8.jpg"
//               alt="Admin avatar"
//               className="h-full w-full object-cover"
//             />
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }



"use client";

import { useState, useEffect } from "react";
import { Search, Bell } from "lucide-react";

type BuyerType = {
  name: string;
  company: string;
  initials: string;
};

const DEFAULT_BUYER: BuyerType = {
  name: "Utilisateur",
  company: "El baraka superette",
  initials: "EB",
};

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [buyer, setBuyer] = useState<BuyerType>(DEFAULT_BUYER);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));

    const raw = localStorage.getItem("agro_user");

    if (raw) {
      try {
        const data = JSON.parse(raw);

        setBuyer({
          name:
            `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
            "Utilisateur",
          company: data.company_name || "El baraka superette",
          initials: `${data.first_name ? data.first_name[0] : "E"}${
            data.last_name ? data.last_name[0] : "B"
          }`,
        });
      } catch (error) {
        console.error("Invalid agro_user in localStorage:", error);
      }
    }
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
    <header className="sticky top-0 z-30 w-full h-16 border-b border-zinc-200 bg-emerald-500/80 backdrop-blur-md dark:border-zinc-800 transition-colors duration-300 flex items-center px-4 sm:px-6 gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Rechercher un produit, une wilaya…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 w-full rounded-full border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-950 hover:bg-zinc-100 transition-colors"
        >
          {isDark ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
              />
            </svg>
          )}
        </button>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-950 hover:bg-zinc-100 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950" />
        </button>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {buyer.name}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-950">
              {buyer.company}
            </p>
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