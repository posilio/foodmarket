// Storefront homepage — categories listing and call to action.
import Link from "next/link";
import { getCategories } from "../lib/api";

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">FoodWebshop</h1>
      <p className="text-gray-500 mb-8">
        International food products delivered in the Netherlands
      </p>

      <Link
        href="/products"
        className="inline-block bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors mb-10"
      >
        Browse all products
      </Link>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Categories</h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 list-none p-0">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/products?category=${category.slug}`}
              className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-sm transition-all"
            >
              <p className="font-medium text-gray-800">{category.name}</p>
              <p className="text-sm text-gray-400 mt-1">
                {category._count.products} products
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
