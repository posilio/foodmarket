// Custom 404 page — renders inside the root layout (nav + footer included automatically).
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-24 text-center">
      <p
        className="mb-4"
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontWeight: 400,
          fontSize: '80px',
          lineHeight: 1,
          color: 'var(--color-primary)',
          opacity: 0.3,
        }}
      >
        404
      </p>
      <h1
        className="mb-3"
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontWeight: 600,
          fontSize: '36px',
          color: 'var(--color-text)',
        }}
      >
        Page not found
      </h1>
      <p
        className="mb-10"
        style={{
          fontFamily: 'Jost, sans-serif',
          fontWeight: 300,
          fontSize: '15px',
          color: 'var(--color-text-muted)',
        }}
      >
        We couldn&apos;t find what you were looking for.
      </p>
      <Link
        href="/products"
        className="inline-block px-8 py-3 rounded-xl text-sm transition-opacity hover:opacity-90"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          fontFamily: 'Jost, sans-serif',
          fontWeight: 500,
          textDecoration: 'none',
        }}
      >
        Browse products →
      </Link>
    </div>
  );
}
