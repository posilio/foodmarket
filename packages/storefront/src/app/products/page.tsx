// Products listing page — 4-column grid with category filter pills.
import { getProducts, getCategories } from '../../lib/api';
import { ProductCard } from '../../components/ProductCard';
import { CategoryFilterPills } from '../../components/CategoryFilterPills';

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(category),
    getCategories(),
  ]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      {/* Heading */}
      <div className="mb-8">
        <h1
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: 600,
            fontSize: '40px',
            color: 'var(--color-text)',
            lineHeight: 1.1,
          }}
        >
          {category
            ? categories.find(c => c.slug === category)?.name ?? 'Products'
            : 'All Products'}
        </h1>
        <p
          className="mt-2"
          style={{
            fontFamily: 'Jost, sans-serif',
            fontWeight: 300,
            fontSize: '15px',
            color: 'var(--color-text-muted)',
          }}
        >
          {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter pills */}
      <div className="mb-8">
        <CategoryFilterPills categories={categories} activeSlug={category} />
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div
          className="py-20 text-center rounded-2xl"
          style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <p style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif' }}>
            No products found in this category.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 list-none p-0">
          {products.map(product => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
