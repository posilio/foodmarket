// Root layout for the admin app — nav with logout, main content area.
import type { Metadata } from "next";
import Link from "next/link";
import { Providers } from "./Providers";
import { LogoutButton } from "../components/LogoutButton";
import { AdminGuard } from "../components/AdminGuard";
import "./globals.css";

export const metadata: Metadata = {
  title: "FoodWebshop Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-6">
              <Link href="/" className="font-bold text-gray-900 text-lg">
                🛒 FoodWebshop Admin
              </Link>
              <Link
                href="/orders"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Orders
              </Link>
              <Link
                href="/products"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Products
              </Link>
              <Link
                href="/customers"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Customers
              </Link>
              <Link
                href="/import"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Import
              </Link>
              <div className="ml-auto">
                <LogoutButton />
              </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-10">
              <AdminGuard>{children}</AdminGuard>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
