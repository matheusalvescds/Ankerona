/**
 * Constantes visuais do jogo (regras do time no documento de contexto).
 * Game-wide visual constants (team rules from the context document).
 */

/** Resolução interna, escalada sem suavização. / Internal resolution, scaled without smoothing. */
export const GAME_WIDTH = 160;
export const GAME_HEIGHT = 144;

/**
 * Na EVA, a tela tem 2 pixels por pixel do jogo, para a arte 2x mostrar todo o detalhe (como no protótipo).
 * In the EVA, the screen has 2 pixels per game pixel, so the 2x art shows all its detail (as in the prototype).
 */
export const EVA_PIXEL = 2;

/** Tiles de 16x16; personagens de 16x24, ancorados pela base. / 16x16 tiles; 16x24 characters, anchored at the bottom. */
export const TILE_SIZE = 16;
export const CHARACTER_SIZE = { width: 16, height: 24 } as const;

/** Paleta base de óxido de ferro. / Base iron-oxide palette. */
export const PALETTE = {
  ink: '#1a0d0b',
  rustDark: '#4a2216',
  rust: '#8f3e1f',
  ochre: '#c96f3b',
  sand: '#f0c08a',
  suit: '#f7ead8',
  // Cores de destaque do design system. / Design system accent colors.
  safe: '#9ad48a',
  sulf: '#e3d06a',
  alert: '#ff6a45',
  clay: '#6fb0a0',
  signal: '#9fd8ff',
  space: '#100914',
} as const;

/** Mesma paleta em número, para Graphics e câmera. / Same palette as numbers, for Graphics and camera. */
export const PALETTE_HEX = {
  ink: 0x1a0d0b,
  rustDark: 0x4a2216,
  rust: 0x8f3e1f,
  ochre: 0xc96f3b,
  sand: 0xf0c08a,
  suit: 0xf7ead8,
  safe: 0x9ad48a,
  alert: 0xff6a45,
  space: 0x100914,
} as const;

/** Fontes (arquivos do Google Fonts via @fontsource). / Fonts (Google Fonts files via @fontsource). */
export const FONTS = {
  pixel: '"Press Start 2P"', // títulos e HUD / titles and HUD
  term: 'VT323', // diálogos / dialogue
} as const;

/** Chaves das cenas, em um só lugar. / Scene keys, in one place. */
export const SCENES = {
  boot: 'Boot',
  title: 'Title',
  teaser: 'Teaser',
  travel: 'Travel',
  landing: 'Landing',
  eva: 'Eva',
  evaUi: 'EvaUi',
  ending: 'Ending',
} as const;

export type SceneKey = (typeof SCENES)[keyof typeof SCENES];
