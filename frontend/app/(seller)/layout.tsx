import "@/app/globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import SellerSidebar from "@/components/Sidebar/SellerSidebar";
import { Navbar } from "@/components/Navbar/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-primary`}
      >
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <SellerSidebar />

          {/* Main content — offset by sidebar width on large screens */}
          <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
            {/* Navbar stays fixed at the top of the content column */}
            <Navbar />

            {/* Page content scrolls below the navbar */}
            <main className="flex-1 bg-background">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}