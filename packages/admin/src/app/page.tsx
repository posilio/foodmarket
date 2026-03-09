// Admin dashboard homepage — quick links to the main management sections.
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome to the FoodWebshop admin.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <Link
          href="/orders"
          className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <p className="text-2xl mb-2">📦</p>
          <p className="font-semibold text-gray-900">Manage Orders</p>
          <p className="text-sm text-gray-500 mt-1">
            View, filter, and update order statuses
          </p>
        </Link>
        <Link
          href="/products"
          className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <p className="text-2xl mb-2">🥦</p>
          <p className="font-semibold text-gray-900">Manage Products</p>
          <p className="text-sm text-gray-500 mt-1">
            View products and update stock levels
          </p>
        </Link>
      </div>
    </>
  );
}
