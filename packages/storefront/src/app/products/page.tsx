// Product listing page — styled grid with optional category filter.
import Link from "next/link";
import { getProducts } from "../../lib/api";
import { formatPrice } from "../../lib/format";

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;
  const products = await getProducts(category);

  const heading = category
    ? category.replace(/-/g, " ")
    : "Products";

  return (
    <>
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
        ← Home
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8 capitalize">
        {heading}
      </h1>

      {products.length === 0 && (
        <p className="text-gray-500">No products found.</p>
      )}

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0">
        {products.map((product) => {
          const activePrices = product.variants
            .filter((v) => v.isActive)
            .map((v) => v.priceEuroCents);
          const lowestPrice =
            activePrices.length > 0 ? Math.min(...activePrices) : null;
          const inStock = product.variants.some((v) => v.stockQuantity > 0);

          return (
            <li
              key={product.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <Link href={`/products/${product.slug}`}>
                {product.imageUrl && (
                  <div className="aspect-square w-full overflow-hidden bg-gray-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </Link>
              <div className="p-5">
              <Link
                href={`/products/${product.slug}`}
                className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors"
              >
                {product.name}
              </Link>
              <p className="text-sm text-gray-500 mt-1">
                {product.countryOfOrigin}
              </p>
              <p className="text-sm text-gray-500">{product.category.name}</p>

              {product.dietaryLabels.length > 0 && (
                <p className="text-xs text-green-600 font-medium mt-2">
                  {product.dietaryLabels
                    .map((d) => d.label.replace(/_/g, " "))
                    .join(", ")}
                </p>
              )}

              {product.allergens.length > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Contains: {product.allergens.map((a) => a.allergen).join(", ")}
                </p>
              )}

              {lowestPrice !== null && (
                <p className="text-base font-semibold text-gray-900 mt-3">
                  From {formatPrice(lowestPrice)}
                </p>
              )}

              <p className={`text-xs mt-1 ${inStock ? "text-green-600" : "text-red-400"}`}>
                {inStock ? "In stock" : "Out of stock"}
              </p>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
