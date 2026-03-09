// Root layout for the storefront app — nav, main content area, and footer.
import type { Metadata } from "next";
import Link from "next/link";
import { Providers } from "../context/Providers";
import { NavCartCount } from "../components/NavCartCount";
import "./globals.css";

export const metadata: Metadata = {
  title: "FoodWebshop",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-6">
              <Link href="/" className="font-bold text-gray-900 text-lg">
                🛒 FoodWebshop
              </Link>
              <Link
                href="/products"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Products
              </Link>
              <div className="ml-auto">
                <NavCartCount />
              </div>
            </nav>

            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
              {children}
            </main>

            <footer className="text-center text-sm text-gray-400 py-6 border-t border-gray-100">
              © 2026 FoodWebshop — Netherlands
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
