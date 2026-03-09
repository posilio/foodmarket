// Root layout — fixed nav, page content, footer.
import type { Metadata } from 'next';
import Link from 'next/link';
import { Providers } from '../context/Providers';
import { NavCartCount } from '../components/NavCartCount';
import { NavAuthLink } from '../components/NavAuthLink';
import { NavScrollShadow } from '../components/NavScrollShadow';
import './globals.css';

export const metadata: Metadata = {
  title: 'FoodMarket',
  description: 'Specialty international ingredients delivered in the Netherlands',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          {/* Fixed navigation */}
          <NavScrollShadow>
            <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center gap-8">
              <Link
                href="/"
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: 600,
                  fontSize: '22px',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                }}
                className="shrink-0"
              >
                FoodMarket
              </Link>

              <div className="hidden md:flex items-center gap-7">
                <Link
                  href="/"
                  className="text-sm hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--color-text)', fontFamily: 'Jost, sans-serif' }}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="text-sm hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--color-text)', fontFamily: 'Jost, sans-serif' }}
                >
                  Products
                </Link>
              </div>

              <div className="ml-auto flex items-center gap-6">
                <NavAuthLink />
                <NavCartCount />
              </div>
            </div>
          </NavScrollShadow>

          {/* Page content — pt-16 clears fixed nav */}
          <main className="pt-16 min-h-screen">
            {children}
          </main>

          {/* Footer */}
          <footer
            className="py-16"
            style={{
              backgroundColor: 'var(--color-text)',
              borderTop: '2px solid var(--color-primary)',
            }}
          >
            <div className="max-w-[1200px] mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                {/* Brand */}
                <div>
                  <p
                    className="mb-3"
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '24px',
                      color: '#F7F5F0',
                    }}
                  >
                    FoodMarket
                  </p>
                  <p
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontStyle: 'italic',
                      fontSize: '15px',
                      color: 'rgba(247,245,240,0.6)',
                    }}
                  >
                    Specialty ingredients from around the world
                  </p>
                </div>

                {/* About */}
                <div>
                  <h4
                    className="text-xs tracking-widest uppercase mb-4"
                    style={{ color: 'rgba(247,245,240,0.45)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}
                  >
                    About
                  </h4>
                  <ul className="space-y-2.5" style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: '14px', color: 'rgba(247,245,240,0.65)' }}>
                    <li>Our story</li>
                    <li>Quality promise</li>
                    <li>Sourcing</li>
                  </ul>
                </div>

                {/* Shop */}
                <div>
                  <h4
                    className="text-xs tracking-widest uppercase mb-4"
                    style={{ color: 'rgba(247,245,240,0.45)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}
                  >
                    Shop
                  </h4>
                  <ul className="space-y-2.5" style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: '14px' }}>
                    <li><Link href="/products" style={{ color: 'rgba(247,245,240,0.65)' }}>All products</Link></li>
                    <li><Link href="/products?category=japanese" style={{ color: 'rgba(247,245,240,0.65)' }}>Japanese</Link></li>
                    <li><Link href="/products?category=indian-spices" style={{ color: 'rgba(247,245,240,0.65)' }}>Indian Spices</Link></li>
                    <li><Link href="/products?category=middle-eastern" style={{ color: 'rgba(247,245,240,0.65)' }}>Middle Eastern</Link></li>
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h4
                    className="text-xs tracking-widest uppercase mb-4"
                    style={{ color: 'rgba(247,245,240,0.45)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}
                  >
                    Contact
                  </h4>
                  <ul className="space-y-2.5" style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: '14px', color: 'rgba(247,245,240,0.65)' }}>
                    <li>info@foodmarket.nl</li>
                    <li>Netherlands</li>
                  </ul>
                </div>
              </div>

              <div className="border-t pt-6" style={{ borderColor: 'rgba(247,245,240,0.08)' }}>
                <p
                  className="text-xs text-center"
                  style={{ color: 'rgba(247,245,240,0.35)', fontFamily: 'Jost, sans-serif' }}
                >
                  © 2025 FoodMarket — specialty ingredients from around the world
                </p>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
