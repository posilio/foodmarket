// Product detail page — full product info with variant prices and badge labels.
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "../../../lib/api";
import { formatPrice } from "../../../lib/format";
import { Badge } from "../../../components/Badge";
import { AddToCartButton } from "../../../components/AddToCartButton";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const activeVariants = product.variants.filter((v) => v.isActive);

  return (
    <>
      <Link
        href="/products"
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block"
      >
        ← Back to products
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-1">{product.name}</h1>
      <p className="text-gray-500 text-sm mb-4">{product.countryOfOrigin}</p>

      <p className="text-sm mb-4">
        <Link
          href={`/products?category=${product.category.slug}`}
          className="text-sm text-green-600 hover:underline"
        >
          {product.category.name}
        </Link>
      </p>

      {product.description && (
        <p className="text-gray-600 mt-4 mb-6 leading-relaxed">
          {product.description}
        </p>
      )}

      {(product.dietaryLabels.length > 0 || product.allergens.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {product.dietaryLabels.map((d) => (
            <Badge key={d.id} variant="green">
              {d.label.replace(/_/g, " ")}
            </Badge>
          ))}
          {product.allergens.map((a) => (
            <Badge key={a.id} variant="amber">
              {a.allergen}
            </Badge>
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Available sizes
      </h2>

      <ul className="space-y-3 list-none p-0">
        {activeVariants.map((variant) => (
          <li
            key={variant.id}
            className="bg-white border border-gray-200 rounded-lg px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800">{variant.label}</span>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatPrice(variant.priceEuroCents)}
                </p>
                <p
                  className={`text-xs ${
                    variant.stockQuantity > 0 ? "text-green-600" : "text-red-400"
                  }`}
                >
                  {variant.stockQuantity > 0
                    ? `In stock (${variant.stockQuantity} available)`
                    : "Out of stock"}
                </p>
              </div>
            </div>
            <AddToCartButton
              variantId={variant.id}
              productName={product.name}
              variantLabel={variant.label}
              priceEuroCents={variant.priceEuroCents}
              inStock={variant.stockQuantity > 0}
            />
          </li>
        ))}
        {activeVariants.length === 0 && (
          <li className="text-gray-500 text-sm">No variants available</li>
        )}
      </ul>
    </>
  );
}
