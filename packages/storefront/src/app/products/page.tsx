// Products listing page — dual filter rows (origin region/country + product type) + search.
import { Suspense } from 'react';
import { getProducts, getCategoryTree } from '../../lib/api';
import { ProductCard } from '../../components/ProductCard';
import { DualFilterPills } from '../../components/DualFilterPills';
import { SearchInput } from '../../components/SearchInput';

interface ProductsPageProps {
  searchParams: Promise<{ region?: string; country?: string; type?: string; q?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { region, country, type, q } = await searchParams;
  const [products, { originRegions, productTypes }] = await Promise.all([
    getProducts({ region, country, type, q }),
    getCategoryTree(),
  ]);

  // Resolve display heading
  let heading = 'All Products';
  if (q) {
    heading = `Results for "${q}"`;
  } else if (country) {
    const countryObj = originRegions.flatMap(r => r.children).find(c => c.slug === country);
    if (countryObj) heading = countryObj.name;
  } else if (region) {
    const regionObj = originRegions.find(r => r.slug === region);
    if (regionObj) heading = regionObj.name;
  } else if (type) {
    const typeObj = productTypes.find(t => t.slug === type);
    if (typeObj) heading = typeObj.name;
  }

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
          {heading}
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

      {/* Search */}
      <div className="mb-6">
        <Suspense>
          <SearchInput initialValue={q ?? ''} />
        </Suspense>
      </div>

      {/* Dual filter rows */}
      <Suspense>
        <DualFilterPills
          originRegions={originRegions}
          productTypes={productTypes}
          activeRegion={region}
          activeCountry={country}
          activeType={type}
        />
      </Suspense>

      {/* Grid */}
      {products.length === 0 ? (
        <div
          className="py-20 text-center rounded-2xl"
          style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <p style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif' }}>
            {q ? `No products found for "${q}".` : 'No products found.'}
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
