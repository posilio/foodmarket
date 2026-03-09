'use client';
import { useEffect, useState } from 'react';

export function NavScrollShadow({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 4); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b transition-shadow duration-200 ${scrolled ? 'shadow-md' : ''}`}
      style={{ borderBottomColor: 'var(--color-border)' }}
    >
      {children}
    </nav>
  );
}
