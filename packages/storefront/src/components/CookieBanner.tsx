'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'cookie-consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(600px, calc(100vw - 32px))',
        backgroundColor: 'var(--color-text)',
        color: '#F7F5F0',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        zIndex: 9999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        flexWrap: 'wrap',
      }}
    >
      <p
        style={{
          fontFamily: 'Jost, sans-serif',
          fontWeight: 300,
          fontSize: '13px',
          lineHeight: '1.5',
          color: 'rgba(247,245,240,0.85)',
          flex: '1 1 260px',
          margin: 0,
        }}
      >
        We use cookies for login sessions and cart storage. No tracking or advertising cookies.{' '}
        <Link
          href="/privacy"
          style={{
            color: 'var(--color-accent)',
            textDecoration: 'none',
            fontWeight: 400,
          }}
        >
          Privacy policy
        </Link>
      </p>

      <button
        onClick={accept}
        style={{
          flexShrink: 0,
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 20px',
          fontFamily: 'Jost, sans-serif',
          fontWeight: 500,
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
      >
        Accept
      </button>
    </div>
  );
}
