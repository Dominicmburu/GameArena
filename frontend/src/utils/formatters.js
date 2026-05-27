// Shared currency + number formatting helpers.
// Money is always stored and displayed as WHOLE KES (no cents, no decimals).
// Any decimal input (e.g. user typing 10.76) is floored: 10.76 → 10.

export const floorKES = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
};

export const formatKES = (value) =>
  `KES ${floorKES(value).toLocaleString('en-KE')}`;

export const formatKESCompact = (value) => {
  const n = floorKES(value);
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `KES ${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `KES ${n.toLocaleString('en-KE')}`;
};
