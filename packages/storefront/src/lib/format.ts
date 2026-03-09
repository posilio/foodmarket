// Utility functions for formatting data for display.

// Converts integer euro cents to a formatted price string.
// e.g. 249 → "€2,49" (Dutch locale formatting)
export function formatPrice(euroCents: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(euroCents / 100);
}
