'use client';
// Debounced search input that updates the URL ?q= param without a full page reload.
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface SearchInputProps {
  initialValue?: string;
  /** When provided, disables URL navigation and calls this with the debounced value instead. */
  onChange?: (q: string) => void;
}

export function SearchInput({ initialValue = '', onChange }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync if the URL is cleared externally — only when operating in URL mode
  useEffect(() => {
    if (!onChange) setValue(searchParams.get('q') ?? '');
  }, [searchParams, onChange]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (onChange) {
      timerRef.current = setTimeout(() => onChange(next.trim()), 200);
    } else {
      timerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (next.trim()) {
          params.set('q', next.trim());
        } else {
          params.delete('q');
        }
        router.replace(`${pathname}?${params.toString()}`);
      }, 300);
    }
  }

  function handleClear() {
    setValue('');
    if (timerRef.current) clearTimeout(timerRef.current);
    if (onChange) {
      onChange('');
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('q');
      router.replace(`${pathname}?${params.toString()}`);
    }
  }

  return (
    <div style={{ position: 'relative', maxWidth: '400px' }}>
      {/* Search icon */}
      <span
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-text-muted)',
          pointerEvents: 'none',
          fontSize: '15px',
        }}
      >
        &#128269;
      </span>

      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Search products…"
        aria-label="Search products"
        style={{
          width: '100%',
          paddingLeft: '36px',
          paddingRight: value ? '32px' : '12px',
          paddingTop: '9px',
          paddingBottom: '9px',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontFamily: 'Jost, sans-serif',
          fontSize: '14px',
          outline: 'none',
        }}
      />

      {value && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            fontSize: '14px',
            padding: 0,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
