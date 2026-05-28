import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { PublicNavbar } from "@/components/Navbar/PublicNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tatmeen – Une seconde chance pour chaque surplus, une nouvelle valeur pour l'économie",
  description: "Tatmeen est un marché secondaire numérique dédié à la valorisation des surplus agroalimentaires. La plateforme permet aux agriculteurs, grossistes et producteurs de commercialiser leurs excédents auprès d'acheteurs professionnels grâce à un système combinant vente directe en gros et enchères électroniques.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PublicNavbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}