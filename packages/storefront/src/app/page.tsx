// Storefront homepage — categories listing and call to action.
import Link from "next/link";
import { getCategories } from "../lib/api";

const CATEGORY_STYLE: Record<string, { emoji: string; color: string }> = {
  "asian-sauces":       { emoji: "🥢", color: "bg-red-50 border-red-200" },
  "grains-rice":        { emoji: "🌾", color: "bg-yellow-50 border-yellow-200" },
  "middle-eastern":     { emoji: "🫙", color: "bg-orange-50 border-orange-200" },
  "latin-american":     { emoji: "🌶️", color: "bg-green-50 border-green-200" },
  "african":            { emoji: "🌍", color: "bg-amber-50 border-amber-200" },
  "european-specialty": { emoji: "🫒", color: "bg-emerald-50 border-emerald-200" },
  "japanese":           { emoji: "🍱", color: "bg-pink-50 border-pink-200" },
  "indian-spices":      { emoji: "🍛", color: "bg-purple-50 border-purple-200" },
};

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
        {categories.map((category) => {
          const style = CATEGORY_STYLE[category.slug] ?? { emoji: "🛒", color: "bg-white border-gray-200" };
          return (
            <li key={category.id}>
              <Link
                href={`/products?category=${category.slug}`}
                className={`block p-4 rounded-xl border ${style.color} hover:shadow-sm transition-all`}
              >
                <p className="text-2xl mb-1">{style.emoji}</p>
                <p className="font-medium text-gray-800">{category.name}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {category._count.products} products
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
