'use client';
// Reviews section for product detail page.
// Shows average rating, existing reviews, and a submit form for logged-in customers.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { getReviews, submitReview } from '../lib/api';
import type { Review } from '../types';

interface ReviewsSectionProps {
  slug: string;
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          style={{
            fontSize: `${size}px`,
            color: i <= rating ? '#D97706' : 'var(--color-border)',
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <span style={{ display: 'inline-flex', gap: '4px', cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          style={{
            fontSize: '28px',
            color: i <= (hovered || value) ? '#D97706' : 'var(--color-border)',
            transition: 'color 0.1s',
            userSelect: 'none',
          }}
          role="button"
          aria-label={`Rate ${i} star${i !== 1 ? 's' : ''}`}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function ReviewsSection({ slug }: ReviewsSectionProps) {
  const { token, isLoggedIn } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form state
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function loadReviews() {
    setLoading(true);
    getReviews(slug)
      .then(data => {
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      })
      .catch(() => {/* silently ignore */})
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadReviews(); }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setSubmitError('Please select a star rating.'); return; }
    if (!token) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await submitReview(slug, rating, body, token);
      setRating(0);
      setBody('');
      setSubmitted(true);
      loadReviews();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '48px', marginTop: '48px' }}>
      {/* Section heading + summary */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <h2
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: 600,
            fontSize: '28px',
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          Reviews
        </h2>
        {averageRating !== null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Stars rating={Math.round(averageRating)} size={18} />
            <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '14px', color: 'var(--color-text-muted)' }}>
              {averageRating.toFixed(1)} ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
            </span>
          </span>
        )}
        {totalReviews === 0 && !loading && (
          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '14px', color: 'var(--color-text-muted)' }}>
            No reviews yet
          </span>
        )}
      </div>

      {/* Existing reviews */}
      {reviews.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reviews.map(review => (
            <li
              key={review.id}
              style={{
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <Stars rating={review.rating} size={15} />
                <span style={{ fontFamily: 'Jost, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>
                  {review.customer.firstName}
                </span>
                <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {formatDate(review.createdAt)}
                </span>
              </div>
              {review.body && (
                <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: '15px', lineHeight: 1.6, color: 'var(--color-text)', margin: 0 }}>
                  {review.body}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Write a review */}
      <div
        style={{
          padding: '28px',
          borderRadius: '12px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h3 style={{ fontFamily: 'Jost, sans-serif', fontWeight: 600, fontSize: '16px', color: 'var(--color-text)', margin: '0 0 16px 0' }}>
          Write a review
        </h3>

        {!isLoggedIn ? (
          <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>
            <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Sign in</Link>
            {' '}to leave a review.
          </p>
        ) : submitted ? (
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '14px', color: 'var(--color-primary)', margin: 0, fontWeight: 500 }}>
            ✓ Thank you for your review!
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Star picker */}
            <div>
              <label style={{ display: 'block', fontFamily: 'Jost, sans-serif', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 500 }}>
                Rating *
              </label>
              <StarPicker value={rating} onChange={setRating} />
            </div>

            {/* Body */}
            <div>
              <label
                htmlFor="review-body"
                style={{ display: 'block', fontFamily: 'Jost, sans-serif', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 500 }}
              >
                Review (optional)
              </label>
              <textarea
                id="review-body"
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={4}
                placeholder="Share your experience with this product…"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '14px',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {submitError && (
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '13px', color: '#DC2626', margin: 0 }}>
                {submitError}
              </p>
            )}

            <div>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '10px 24px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: 'Jost, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Submitting…' : 'Submit review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
