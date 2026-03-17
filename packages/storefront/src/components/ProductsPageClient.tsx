'use client';
// Client component that receives all products + category tree and filters in-memory.
// Filter state lives in useState — no URL changes, no server round-trips, instant response.
import { useState, useMemo } from 'react';
import { SearchInput } from './SearchInput';
import { DualFilterPills } from './DualFilterPills';
import { ProductCard } from './ProductCard';
import type { Product, CategoryTree } from '../types';

interface Props {
  allProducts: Product[];
  categoryTree: CategoryTree;
  initialRegion?: string;
  initialType?: string;
}

export function ProductsPageClient({ allProducts, categoryTree, initialRegion, initialType }: Props) {
  const { originRegions, productTypes } = categoryTree;

  const [activeRegion, setActiveRegion] = useState<string | undefined>(initialRegion);
  const [activeCountry, setActiveCountry] = useState<string | undefined>(undefined);
  const [activeType, setActiveType] = useState<string | undefined>(initialType);
  const [q, setQ] = useState('');

  // Build id-lookup maps from the category tree
  const regionById = useMemo(() => new Map(originRegions.map(r => [r.id, r])), [originRegions]);
  const regionBySlug = useMemo(() => new Map(originRegions.map(r => [r.slug, r])), [originRegions]);
  const countryBySlug = useMemo(() => {
    const m = new Map<string, (typeof originRegions)[0]['children'][0]>();
    for (const r of originRegions) for (const c of r.children) m.set(c.slug, c);
    return m;
  }, [originRegions]);
  const typeBySlug = useMemo(() => new Map(productTypes.map(t => [t.slug, t])), [productTypes]);

  const filtered = useMemo(() => {
    let result = allProducts;

    // Origin filter — country takes priority over region
    if (activeCountry) {
      const countryId = countryBySlug.get(activeCountry)?.id;
      if (countryId) result = result.filter(p => p.category.id === countryId);
    } else if (activeRegion) {
      const regionId = regionBySlug.get(activeRegion)?.id;
      if (regionId) {
        result = result.filter(p => {
          // product.category is ORIGIN_COUNTRY; its parentId is the region id
          return p.category.parentId === regionId;
        });
      }
    }

    // Type filter
    if (activeType) {
      const typeId = typeBySlug.get(activeType)?.id;
      if (typeId) result = result.filter(p => p.typeCategory?.id === typeId);
    }

    // Search filter
    if (q.trim()) {
      const lower = q.trim().toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        (p.description ?? '').toLowerCase().includes(lower)
      );
    }

    return result;
  }, [allProducts, activeRegion, activeCountry, activeType, q, regionBySlug, countryBySlug, typeBySlug]);

  // Derive heading
  const heading = useMemo(() => {
    if (q.trim()) return `Results for "${q.trim()}"`;
    if (activeCountry) return countryBySlug.get(activeCountry)?.name ?? 'Products';
    if (activeRegion) return regionBySlug.get(activeRegion)?.name ?? 'Products';
    if (activeType) return typeBySlug.get(activeType)?.name ?? 'Products';
    return 'All Products';
  }, [q, activeCountry, activeRegion, activeType, countryBySlug, regionBySlug, typeBySlug]);

  function handleRegionChange(slug: string | undefined) {
    setActiveRegion(slug);
    setActiveCountry(undefined);
  }

  function handleCountryChange(slug: string | undefined) {
    setActiveCountry(slug);
    // Keep activeRegion set so the country sub-row stays visible
    if (slug) {
      const country = countryBySlug.get(slug);
      if (country) {
        // Find parent region slug
        for (const r of originRegions) {
          if (r.children.some(c => c.id === country.id)) {
            setActiveRegion(r.slug);
            break;
          }
        }
      }
    }
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
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchInput initialValue={q} onChange={setQ} />
      </div>

      {/* Dual filter rows */}
      <DualFilterPills
        originRegions={originRegions}
        productTypes={productTypes}
        activeRegion={activeRegion}
        activeCountry={activeCountry}
        activeType={activeType}
        onRegionChange={handleRegionChange}
        onCountryChange={handleCountryChange}
        onTypeChange={setActiveType}
      />

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          className="py-20 text-center rounded-2xl"
          style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <p style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif' }}>
            {q.trim() ? `No products found for "${q.trim()}".` : 'No products found.'}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 list-none p-0">
          {filtered.map(product => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
