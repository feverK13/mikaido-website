/* Матриця Байєра 4 × 4, пороги 0..1. Логіку перенесено з docs/design-system/components/bundle.js без змін. */
export const B4: number[][] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16))
