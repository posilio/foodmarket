// Storefront homepage — hero, origin region cards, product type pills, featured products.
import Link from 'next/link';
import { getCategoryTree, getProducts } from '../lib/api';
import { ProductCard } from '../components/ProductCard';

export default async function HomePage() {
  const [{ originRegions, productTypes }, allProducts] = await Promise.all([
    getCategoryTree(),
    getProducts(),
  ]);

  const featured = allProducts.slice(0, 4);

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="w-full relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-primary)', minHeight: '420px' }}
      >
        <div className="max-w-[1200px] mx-auto px-6 py-16 flex items-center gap-12 min-h-[420px]">
          <div className="flex-1 animate-fade-up">
            <p
              className="text-xs tracking-[0.2em] uppercase mb-4"
              style={{ color: 'var(--color-accent)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}
            >
              Specialty Ingredients
            </p>
            <h1
              className="leading-[1.1] mb-4"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 600,
                fontSize: 'clamp(36px, 5vw, 60px)',
                color: '#fff',
              }}
            >
              Flavours from every corner of the world
            </h1>
            <p
              className="mt-4 max-w-md"
              style={{
                fontFamily: 'Jost, sans-serif',
                fontWeight: 300,
                fontSize: '16px',
                color: 'rgba(255,255,255,0.75)',
              }}
            >
              Authentic, quality-sourced ingredients for the adventurous kitchen
            </p>
            <Link
              href="/products"
              className="inline-block mt-8 px-8 py-3 rounded-full font-medium transition-colors text-sm"
              style={{
                backgroundColor: '#fff',
                color: 'var(--color-primary)',
                fontFamily: 'Jost, sans-serif',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Shop now →
            </Link>
          </div>

          <div
            className="hidden lg:grid shrink-0"
            style={{
              gridTemplateColumns: 'repeat(3, 72px)',
              gridTemplateRows: 'repeat(3, 72px)',
              gap: '8px',
              transform: 'rotate(-3deg)',
            }}
          >
            {[
              '#2D6A4F', '#52B788', '#D8EDD6',
              '#52B788', '#B7935A', '#2D6A4F',
              '#D8EDD6', '#2D6A4F', '#52B788',
            ].map((color, i) => (
              <div
                key={i}
                className="rounded-xl"
                style={{ backgroundColor: color, opacity: 0.85 }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse by Origin ── */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <h2
          className="mb-8 text-center"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: 600,
            fontSize: '32px',
            color: 'var(--color-text)',
          }}
        >
          Browse by origin
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 list-none p-0">
          {originRegions.map(region => (
            <li key={region.id}>
              <Link
                href={`/products?region=${region.slug}`}
                className="block py-8 px-6 rounded-2xl text-center"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  textDecoration: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <p style={{ fontSize: '48px', lineHeight: 1 }}>{region.emoji ?? '🌍'}</p>
                <p
                  className="mt-3"
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontWeight: 600,
                    fontSize: '20px',
                    color: 'var(--color-text)',
                  }}
                >
                  {region.name}
                </p>
                <p
                  className="mt-1 text-xs"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}
                >
                  {region.children.length} countr{region.children.length !== 1 ? 'ies' : 'y'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Browse by Type ── */}
      <section
        style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
        className="py-12"
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <h2
            className="mb-6 text-center"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 600,
              fontSize: '32px',
              color: 'var(--color-text)',
            }}
          >
            Shop by product type
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {productTypes.map(pt => (
              <Link
                key={pt.id}
                href={`/products?type=${pt.slug}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  fontFamily: 'Jost, sans-serif',
                  fontWeight: 500,
                  textDecoration: 'none',
                  border: '1px solid transparent',
                }}
              >
                <span>{pt.emoji}</span>
                <span>{pt.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products ── */}
      {featured.length > 0 && (
        <section className="py-16">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex items-baseline justify-between mb-8">
              <h2
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: 600,
                  fontSize: '32px',
                  color: 'var(--color-text)',
                }}
              >
                Popular picks
              </h2>
              <Link
                href="/products"
                className="text-sm"
                style={{ color: 'var(--color-primary)', fontFamily: 'Jost, sans-serif' }}
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
