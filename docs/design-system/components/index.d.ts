/** Mikaido: ванільні функції бандла, window.Mikaido. Без React. */
declare namespace Mikaido {
  /** SVG піксельної іконки 12 × 12 з currentColor. */
  function pix(name: keyof typeof IC, cls?: string): string;
  const IC: Record<string, string[]>;
  /** Знак потрібного оптичного розміру: від 120 px металевий, 48–119 пласкі контурні ноги, менше суцільні. */
  function markAt(px: number, o?: { metal?: "graphite" | "silver"; shadow?: boolean; real?: boolean }): string;
  function markFlat(o?: { legs?: "outline" | "solid"; sw?: number; leg?: string; mono?: string; bg?: string; line?: boolean; glint?: 0 | 1 | 2 }): string;
  function markReal(o?: { metal?: "graphite" | "silver"; sw?: number; shadow?: boolean }): string;
  /** Піксельний знак 16 × 16 (фавікон). */
  function pixel(o?: { leg?: string; mono?: string | null; themed?: boolean }): string;
  /** Голограми пакетів: page, calendar, nodes, box. */
  const HOLO: {
    mount(cv: HTMLCanvasElement, model: "page" | "calendar" | "nodes" | "box", style: "vox", opts?: { dark?: boolean; base?: "grid" | "marks" | "shadow" | "none" | "beam"; scan?: boolean; noGlitch?: boolean }): void;
    start(): void; redraw(): void; iris(t: number, dark?: boolean): [number, number, number];
  };
  /** Розшифрування тексту з data-t, 900 мс. */
  function decode(el: HTMLElement, text?: string): void;
  /** Друк термінала, до 50 знаків і 3 с. */
  function type(el: HTMLElement, text?: string, o?: { speed?: number }): Promise<void>;
  /** Піксельне розчинення полотна над блоком, 650 мс (телефон 450). */
  function dissolve(cv: HTMLCanvasElement, o?: { dur?: number; dir?: 1 | -1; color?: string; cell?: number; done?: () => void }): void;
  /** Піксельний градієнт ірису на полотні. */
  function dither(cv: HTMLCanvasElement, o?: { dark?: boolean; h?: number }): void;
  /** Піксельний сплеск при натисканні кнопки A. */
  function burst(e: MouseEvent, el: HTMLElement): void;
  /** Чи дозволено рух: window.MK_MOTION або системне «менше руху». */
  function MO(): boolean;
}
