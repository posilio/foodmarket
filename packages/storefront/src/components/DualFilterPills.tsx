'use client';
// Dual filter rows for the products page.
// Uses callbacks instead of router.push — filtering is instant and client-side.
import type { Category } from '../types';

interface Props {
  originRegions: Array<Category & { children: Category[] }>;
  productTypes: Category[];
  activeRegion?: string;
  activeCountry?: string;
  activeType?: string;
  onRegionChange: (slug: string | undefined) => void;
  onCountryChange: (slug: string | undefined) => void;
  onTypeChange: (slug: string | undefined) => void;
}

export function DualFilterPills({
  originRegions, productTypes,
  activeRegion, activeCountry, activeType,
  onRegionChange, onCountryChange, onTypeChange,
}: Props) {
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
    background: 'none',
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
          onClick={() => { onRegionChange(undefined); onCountryChange(undefined); }}
          style={{ ...pillBase, ...(!activeRegion && !activeCountry ? pillActive : pillInactive) }}
        >
          All
        </button>
        {originRegions.map(region => {
          const isActive = activeRegion === region.slug || (!!activeCountry && expandedRegion?.slug === region.slug);
          return (
            <button
              key={region.id}
              onClick={() => { onRegionChange(region.slug); onCountryChange(undefined); }}
              style={{ ...pillBase, ...(isActive ? pillActive : pillInactive) }}
            >
              <span>{region.emoji}</span>
              <span>{region.name}</span>
            </button>
          );
        })}
      </div>

      {/* Country sub-row */}
      {expandedRegion && expandedRegion.children.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', paddingLeft: '16px' }}>
          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: '4px' }}>
            Country
          </span>
          <button
            onClick={() => onCountryChange(undefined)}
            style={{ ...pillBase, ...(!activeCountry ? pillActive : pillInactive), fontSize: '12px', padding: '4px 12px' }}
          >
            All {expandedRegion.name}
          </button>
          {expandedRegion.children.map(country => (
            <button
              key={country.id}
              onClick={() => onCountryChange(country.slug)}
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
          onClick={() => onTypeChange(undefined)}
          style={{ ...pillBase, ...(!activeType ? pillActive : pillInactive) }}
        >
          All types
        </button>
        {productTypes.map(pt => (
          <button
            key={pt.id}
            onClick={() => onTypeChange(pt.slug)}
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
