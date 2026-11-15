/**
 * Setas em pixel art (SVG) no lugar dos caracteres ◀ ▶ ▲ ▼. No celular (principalmente no iPhone),
 * ◀ e ▶ viravam emojis azuis; assim as setas ficam iguais em todo aparelho e combinam com o jogo.
 * Pixel-art arrows (SVG) instead of the ◀ ▶ ▲ ▼ characters. On phones (iPhone especially),
 * ◀ and ▶ turned into blue emojis; this way arrows look the same on every device and match the game.
 */
export type ArrowDir = 'up' | 'down' | 'left' | 'right';

// Triângulos de 4x7 (lados) e 7x4 (cima e baixo). / 4x7 (sides) and 7x4 (up and down) triangles.
const SHAPES: Record<ArrowDir, [string, string]> = {
  right: ['0 0 4 7', 'M0 0h1v7H0zM1 1h1v5H1zM2 2h1v3H2zM3 3h1v1H3z'],
  left: ['0 0 4 7', 'M3 0h1v7H3zM2 1h1v5H2zM1 2h1v3H1zM0 3h1v1H0z'],
  down: ['0 0 7 4', 'M0 0h7v1H0zM1 1h5v1H1zM2 2h3v1H2zM3 3h1v1H3z'],
  up: ['0 0 7 4', 'M3 0h1v1H3zM2 1h3v1H2zM1 2h5v1H1zM0 3h7v1H0z'],
};

/** Uma seta em SVG, na cor do texto. / One SVG arrow, in the text color. */
export function arrowSvg(dir: ArrowDir): string {
  const [box, path] = SHAPES[dir];
  const side = dir === 'left' || dir === 'right';
  return `<svg class="ak-arrow ${side ? 'h' : 'v'}" viewBox="${box}" aria-hidden="true"><path d="${path}"/></svg>`;
}

const CHAR: Record<string, ArrowDir> = { '◀': 'left', '▶': 'right', '▲': 'up', '▼': 'down' };

/** Troca ◀ ▶ ▲ ▼ num HTML já escapado pelas setas em SVG. / Swaps ◀ ▶ ▲ ▼ in already-escaped HTML for the SVG arrows. */
export function pixelArrows(html: string): string {
  return html.replace(/([◀▶▲▼])︎?/g, (_, ch: string) => arrowSvg(CHAR[ch]));
}
