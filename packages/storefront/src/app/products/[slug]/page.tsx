// Product detail page — two-column layout with variant selector and quantity picker.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '../../../lib/api';
import { ProductVariantControl } from '../../../components/ProductVariantControl';

const COUNTRY_FLAG: Record<string, string> = {
  'Thailand': '🇹🇭', 'Vietnam': '🇻🇳', 'Japan': '🇯🇵',
  'South Korea': '🇰🇷', 'China': '🇨🇳', 'India': '🇮🇳',
  'Lebanon': '🇱🇧', 'Turkey': '🇹🇷', 'Morocco': '🇲🇦',
  'Ethiopia': '🇪🇹', 'Nigeria': '🇳🇬', 'Kenya': '🇰🇪',
  'Mozambique': '🇲🇿', 'Tunisia': '🇹🇳', 'Iran': '🇮🇷',
  'Jordan': '🇯🇴', 'Mexico': '🇲🇽', 'Peru': '🇵🇪',
  'Brazil': '🇧🇷', 'Argentina': '🇦🇷', 'France': '🇫🇷',
  'Italy': '🇮🇹', 'Spain': '🇪🇸', 'Greece': '🇬🇷',
  'Portugal': '🇵🇹', 'Germany': '🇩🇪', 'Netherlands': '🇳🇱',
  'Indonesia': '🇮🇩',
};

const DIETARY_STYLE: Record<string, { emoji: string; label: string; bg: string; color: string }> = {
  VEGAN:       { emoji: '🌱', label: 'Vegan',       bg: 'var(--color-primary-light)', color: 'var(--color-primary)' },
  VEGETARIAN:  { emoji: '🥗', label: 'Vegetarian',  bg: '#F0FAF0', color: '#2A7A2A' },
  GLUTEN_FREE: { emoji: '🌾', label: 'Gluten free', bg: '#FFFBEB', color: '#92400E' },
  DAIRY_FREE:  { emoji: '🥛', label: 'Dairy free',  bg: '#EFF6FF', color: '#1D4ED8' },
  HALAL:       { emoji: '☪️', label: 'Halal',       bg: '#F5F3FF', color: '#5B21B6' },
  KOSHER:      { emoji: '✡️', label: 'Kosher',      bg: '#F5F3FF', color: '#5B21B6' },
  NUT_FREE:    { emoji: '🥜', label: 'Nut free',    bg: '#FFF7ED', color: '#C2410C' },
};

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const activeVariants = product.variants.filter(v => v.isActive);
  const flag = COUNTRY_FLAG[product.countryOfOrigin] ?? '🌍';

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm" style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif' }}>
        <Link href="/products" style={{ color: 'var(--color-text-muted)' }}>Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category.slug}`} style={{ color: 'var(--color-text-muted)' }}>
          {product.category.name}
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text)' }}>{product.name}</span>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left — image */}
        <div className="lg:w-[55%]">
          <div
            className="w-full rounded-2xl overflow-hidden"
            style={{
              aspectRatio: '1/1',
              backgroundColor: 'var(--color-primary-light)',
            }}
          >
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 'clamp(80px, 15vw, 140px)',
                    fontWeight: 600,
                    color: 'var(--color-primary)',
                    opacity: 0.35,
                  }}
                >
                  {product.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right — info */}
        <div className="lg:w-[45%] flex flex-col">
          {/* Origin + category */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}
            >
              {flag} {product.countryOfOrigin}
            </p>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-xs px-3 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                fontFamily: 'Jost, sans-serif',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              {product.category.name}
            </Link>
          </div>

          {/* Product name */}
          <h1
            className="mb-4 leading-tight"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 600,
              fontSize: 'clamp(28px, 4vw, 42px)',
              color: 'var(--color-text)',
            }}
          >
            {product.name}
          </h1>

          {/* Description */}
          {product.description && (
            <p
              className="mb-6 leading-relaxed"
              style={{
                fontFamily: 'Jost, sans-serif',
                fontWeight: 300,
                fontSize: '15px',
                lineHeight: 1.7,
                color: 'var(--color-text-muted)',
              }}
            >
              {product.description}
            </p>
          )}

          {/* Dietary labels */}
          {product.dietaryLabels.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {product.dietaryLabels.map(d => {
                const s = DIETARY_STYLE[d.label] ?? { emoji: '✓', label: d.label.replace(/_/g, ' '), bg: 'var(--color-primary-light)', color: 'var(--color-primary)' };
                return (
                  <span
                    key={d.id}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: s.bg, color: s.color, fontFamily: 'Jost, sans-serif', fontWeight: 500 }}
                  >
                    {s.emoji} {s.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Variant control (client) */}
          <ProductVariantControl productName={product.name} variants={activeVariants} imageUrl={product.imageUrl} />

          {/* Allergens */}
          {product.allergens.length > 0 && (
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
              <p
                className="text-xs tracking-widest uppercase mb-3"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}
              >
                Allergens
              </p>
              <div className="flex flex-wrap gap-2">
                {product.allergens.map(a => (
                  <span
                    key={a.id}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      fontFamily: 'Jost, sans-serif',
                      fontWeight: 500,
                    }}
                  >
                    {a.allergen}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
