'use client';
import { useRouter } from 'next/navigation';
import type { Category } from '../types';

interface Props {
  categories: Category[];
  activeSlug: string | undefined;
}

export function CategoryFilterPills({ categories, activeSlug }: Props) {
  const router = useRouter();

  function go(slug: string | undefined) {
    router.push(slug ? `/products?category=${slug}` : '/products');
  }

  const pills = [{ id: 'all', name: 'All', slug: undefined as string | undefined }, ...categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {pills.map(pill => {
        const active = pill.slug === activeSlug || (!pill.slug && !activeSlug);
        return (
          <button
            key={pill.id}
            onClick={() => go(pill.slug)}
            className="shrink-0 text-sm px-4 py-1.5 rounded-full border transition-all"
            style={active ? {
              backgroundColor: 'var(--color-primary)',
              borderColor: 'var(--color-primary)',
              color: '#fff',
              fontFamily: 'Jost, sans-serif',
              fontWeight: 500,
            } : {
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
              fontFamily: 'Jost, sans-serif',
            }}
          >
            {pill.name}
          </button>
        );
      })}
    </div>
  );
}
