'use client';
// Dual filter rows for the products page:
// Row 1 — origin regions (clicking a region expands country sub-pills below)
// Row 2 — product types
import { useRouter, useSearchParams } from 'next/navigation';
import type { Category } from '../types';

interface Props {
  originRegions: Array<Category & { children: Category[] }>;
  productTypes: Category[];
  activeRegion?: string;
  activeCountry?: string;
  activeType?: string;
}

export function DualFilterPills({ originRegions, productTypes, activeRegion, activeCountry, activeType }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function buildUrl(params: Record<string, string | undefined>) {
    const next = new URLSearchParams();
    const q = searchParams.get('q');
    if (q) next.set('q', q);
    for (const [k, v] of Object.entries(params)) {
      if (v) next.set(k, v);
    }
    return `/products${next.toString() ? `?${next.toString()}` : ''}`;
  }

  // The region whose countries are shown (either active or hovered)
  const expandedRegion = activeCountry
    ? originRegions.find(r => r.children.some(c => c.slug === activeCountry))
    : activeRegion
    ? originRegions.find(r => r.slug === activeRegion)
    : null;

  const pillBase: React.CSSProperties = {
    fontFamily: 'Jost, sans-serif',
    fontWeight: 500,
    fontSize: '13px',
    padding: '6px 16px',
    borderRadius: '999px',
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.15s, color 0.15s',
    whiteSpace: 'nowrap' as const,
  };

  const pillActive: React.CSSProperties = {
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    borderColor: 'var(--color-primary)',
  };

  const pillInactive: React.CSSProperties = {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
  };

  return (
    <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Region row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: '4px' }}>
          Origin
        </span>
        <button
          onClick={() => router.push(buildUrl({ type: activeType }))}
          style={{ ...pillBase, ...((!activeRegion && !activeCountry) ? pillActive : pillInactive) }}
        >
          All
        </button>
        {originRegions.map(region => {
          const isActive = activeRegion === region.slug || (activeCountry && expandedRegion?.slug === region.slug);
          return (
            <button
              key={region.id}
              onClick={() => router.push(buildUrl({ region: region.slug, type: activeType }))}
              style={{ ...pillBase, ...(isActive ? pillActive : pillInactive) }}
            >
              <span>{region.emoji}</span>
              <span>{region.name}</span>
            </button>
          );
        })}
      </div>

      {/* Country sub-row — shown when a region is selected */}
      {expandedRegion && expandedRegion.children.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', paddingLeft: '16px' }}>
          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: '4px' }}>
            Country
          </span>
          <button
            onClick={() => router.push(buildUrl({ region: expandedRegion.slug, type: activeType }))}
            style={{ ...pillBase, ...(!activeCountry ? pillActive : pillInactive), fontSize: '12px', padding: '4px 12px' }}
          >
            All {expandedRegion.name}
          </button>
          {expandedRegion.children.map(country => (
            <button
              key={country.id}
              onClick={() => router.push(buildUrl({ country: country.slug, type: activeType }))}
              style={{ ...pillBase, ...(activeCountry === country.slug ? pillActive : pillInactive), fontSize: '12px', padding: '4px 12px' }}
            >
              <span>{country.emoji}</span>
              <span>{country.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Product type row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: '4px' }}>
          Type
        </span>
        <button
          onClick={() => router.push(buildUrl({ region: activeRegion, country: activeCountry }))}
          style={{ ...pillBase, ...(!activeType ? pillActive : pillInactive) }}
        >
          All types
        </button>
        {productTypes.map(pt => (
          <button
            key={pt.id}
            onClick={() => router.push(buildUrl({ region: activeRegion, country: activeCountry, type: pt.slug }))}
            style={{ ...pillBase, ...(activeType === pt.slug ? pillActive : pillInactive) }}
          >
            <span>{pt.emoji}</span>
            <span>{pt.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
