// Storefront homepage — hero, category grid, featured products.
import Link from 'next/link';
import { getCategories, getProducts } from '../lib/api';
import { ProductCard } from '../components/ProductCard';

const CATEGORY_STYLE: Record<string, { emoji: string }> = {
  'asian-sauces':       { emoji: '🥢' },
  'grains-rice':        { emoji: '🌾' },
  'middle-eastern':     { emoji: '🫙' },
  'latin-american':     { emoji: '🌶️' },
  'african':            { emoji: '🌍' },
  'european-specialty': { emoji: '🫒' },
  'japanese':           { emoji: '🍱' },
  'indian-spices':      { emoji: '🍛' },
};

export default async function HomePage() {
  const [categories, allProducts] = await Promise.all([
    getCategories(),
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
          {/* Text block */}
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

          {/* Decorative grid */}
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

      {/* ── Categories ── */}
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
          Shop by category
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 list-none p-0">
          {categories.map(category => {
            const style = CATEGORY_STYLE[category.slug] ?? { emoji: '🛒' };
            return (
              <li key={category.id}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="block py-8 px-6 rounded-2xl text-center group"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    textDecoration: 'none',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={undefined}
                >
                  <p style={{ fontSize: '48px', lineHeight: 1 }}>{style.emoji}</p>
                  <p
                    className="mt-3"
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontWeight: 600,
                      fontSize: '20px',
                      color: 'var(--color-text)',
                    }}
                  >
                    {category.name}
                  </p>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}
                  >
                    {category._count.products} products
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Featured products ── */}
      {featured.length > 0 && (
        <section style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }} className="py-16">
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
