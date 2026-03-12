export function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;
  return `$${vol.toFixed(2)}`;
}

export function formatPrice(price: number): string {
  if (price < 0.0001) return `$${price.toExponential(2)}`;
  return `$${price.toFixed(4)}`;
}
