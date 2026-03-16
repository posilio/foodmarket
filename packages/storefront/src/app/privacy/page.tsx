// Static privacy policy page (AVG/GDPR — Dutch storefront)
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — FoodMarket',
  description: 'How FoodMarket collects, uses, and retains your personal data.',
};

export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      <div className="max-w-[760px] mx-auto px-6 py-16">

        {/* Back link */}
        <Link
          href="/"
          className="text-sm hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-primary)', fontFamily: 'Jost, sans-serif' }}
        >
          ← Back to home
        </Link>

        {/* Title */}
        <h1
          className="mt-6 mb-2"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: 600,
            fontSize: 'clamp(32px, 5vw, 48px)',
            color: 'var(--color-text)',
          }}
        >
          Privacy Policy
        </h1>
        <p
          className="mb-10"
          style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: '14px', color: 'var(--color-text-muted)' }}
        >
          Last updated: March 2025
        </p>

        <div
          className="space-y-10"
          style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: '15px', lineHeight: '1.75', color: 'var(--color-text)' }}
        >

          {/* 1 — Who we are */}
          <section>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '24px', marginBottom: '8px' }}>
              1. Who we are
            </h2>
            <p>
              FoodMarket is an online retailer of specialty international ingredients, operating from the Netherlands.
              We are the data controller for the personal data you provide when using this website.
              You can reach us at{' '}
              <a
                href="mailto:info@foodmarket.nl"
                style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
              >
                info@foodmarket.nl
              </a>.
            </p>
          </section>

          {/* 2 — What we collect */}
          <section>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '24px', marginBottom: '8px' }}>
              2. What personal data we collect
            </h2>
            <p className="mb-3">When you create an account or place an order we collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Name</strong> (first and last name)</li>
              <li><strong>Email address</strong></li>
              <li><strong>Delivery address</strong> (street, city, postal code, country)</li>
              <li><strong>Order history</strong> (products ordered, quantities, prices, dates)</li>
              <li><strong>Payment status</strong> (paid / unpaid — we do not store payment card details)</li>
            </ul>
            <p className="mt-3">
              We do not collect any special categories of personal data (such as health data, religion, or ethnicity).
            </p>
          </section>

          {/* 3 — Why we collect it */}
          <section>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '24px', marginBottom: '8px' }}>
              3. Why we collect it (legal basis)
            </h2>
            <div className="space-y-3">
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-border)' }}
              >
                <p className="font-medium mb-1" style={{ fontWeight: 500 }}>Order fulfilment</p>
                <p>
                  We need your name and address to ship your order and your email to send you a confirmation and delivery updates.
                  Legal basis: <em>performance of a contract</em> (Art. 6(1)(b) GDPR).
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-border)' }}
              >
                <p className="font-medium mb-1" style={{ fontWeight: 500 }}>Account management</p>
                <p>
                  Your email and password hash are stored so you can log in, view your order history, and manage your addresses.
                  Legal basis: <em>performance of a contract</em> (Art. 6(1)(b) GDPR).
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-border)' }}
              >
                <p className="font-medium mb-1" style={{ fontWeight: 500 }}>Tax and legal obligations</p>
                <p>
                  Dutch law (Belastingdienst) requires us to retain financial records for 7 years.
                  Legal basis: <em>legal obligation</em> (Art. 6(1)(c) GDPR).
                </p>
              </div>
            </div>
          </section>

          {/* 4 — Retention */}
          <section>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '24px', marginBottom: '8px' }}>
              4. How long we keep your data
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Order records</strong> — 7 years from the order date, as required by Dutch tax law (art. 52 AWR).
              </li>
              <li>
                <strong>Account data</strong> — until you request deletion of your account. After deletion, your personal
                details are removed from active systems within 30 days. Order records required for tax purposes are
                retained separately for the applicable period with all personal identifiers removed where legally permitted.
              </li>
              <li>
                <strong>Session tokens</strong> — refresh tokens expire after 30 days of inactivity and are purged automatically.
              </li>
            </ul>
          </section>

          {/* 5 — Third parties */}
          <section>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '24px', marginBottom: '8px' }}>
              5. Third-party data sharing
            </h2>
            <p>
              We do not sell or share your personal data with third parties for marketing purposes.
              The only external processor we use is:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>
                <strong>Mollie B.V.</strong> — payment processing. When you pay for an order, you are redirected to
                Mollie&apos;s secure payment page. Mollie processes your payment details under their own privacy policy
                and is certified PCI-DSS compliant. We only receive a payment status confirmation (paid / failed).
              </li>
            </ul>
            <p className="mt-3">
              We do not use Google Analytics, Facebook Pixel, or any other advertising or tracking tools.
            </p>
          </section>

          {/* 6 — Cookies */}
          <section>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '24px', marginBottom: '8px' }}>
              6. Cookies and local storage
            </h2>
            <p>
              We use browser <strong>localStorage</strong> for two purposes only:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li><strong>Login session</strong> — to keep you logged in between page visits (JWT token).</li>
              <li><strong>Shopping cart</strong> — to remember what you have added to your cart.</li>
            </ul>
            <p className="mt-3">
              We do not use tracking cookies, advertising cookies, or any third-party cookie scripts.
            </p>
          </section>

          {/* 7 — Your rights */}
          <section>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '24px', marginBottom: '8px' }}>
              7. Your rights under the AVG / GDPR
            </h2>
            <p className="mb-3">Under the General Data Protection Regulation you have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Recht op inzage (Right of access)</strong> — you may request a copy of all personal data we hold about you.</li>
              <li><strong>Recht op correctie (Right to rectification)</strong> — you may ask us to correct inaccurate or incomplete data.</li>
              <li><strong>Recht op verwijdering (Right to erasure)</strong> — you may ask us to delete your account and personal data, subject to legal retention obligations.</li>
              <li><strong>Recht op beperking (Right to restriction)</strong> — you may ask us to restrict processing of your data in certain circumstances.</li>
              <li><strong>Recht op overdraagbaarheid (Right to data portability)</strong> — you may request your data in a structured, machine-readable format.</li>
              <li><strong>Recht van bezwaar (Right to object)</strong> — you may object to processing based on legitimate interests.</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, email us at{' '}
              <a
                href="mailto:info@foodmarket.nl"
                style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
              >
                info@foodmarket.nl
              </a>
              . We will respond within 30 days.
            </p>
            <p className="mt-3">
              If you believe we are processing your data unlawfully, you have the right to lodge a complaint with the Dutch data
              protection authority: <strong>Autoriteit Persoonsgegevens</strong> (autoriteitpersoonsgegevens.nl).
            </p>
          </section>

          {/* 8 — Security */}
          <section>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '24px', marginBottom: '8px' }}>
              8. Security
            </h2>
            <p>
              Passwords are stored as bcrypt hashes — we never store plain-text passwords. All data is transmitted over HTTPS.
              Access to the production database is restricted to authorised personnel only.
            </p>
          </section>

          {/* 9 — Changes */}
          <section>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '24px', marginBottom: '8px' }}>
              9. Changes to this policy
            </h2>
            <p>
              We may update this policy from time to time. Material changes will be announced by email to registered customers.
              The date at the top of this page always reflects the latest revision.
            </p>
          </section>

          {/* Contact */}
          <section
            className="rounded-2xl p-6"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '22px', marginBottom: '8px' }}>
              Contact
            </h2>
            <p>
              Questions about this privacy policy?<br />
              Email us at{' '}
              <a
                href="mailto:info@foodmarket.nl"
                style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 400 }}
              >
                info@foodmarket.nl
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
