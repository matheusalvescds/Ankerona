/**
 * Constantes do Mapa da Cratera Gale (overlay esquemático tecla M).
 * Baseado na imagem PIA15687 (NASA/JPL-Caltech/ESA/DLR/FU Berlin/MSSS).
 * Gale Crater schematic map constants (M key overlay).
 * Based on image PIA15687 (NASA/JPL-Caltech/ESA/DLR/FU Berlin/MSSS).
 */

import type { Point } from '../scenes/eva/mapaProvisorio';

/** Diâmetro real da Cratera Gale em km. / Real diameter of Gale Crater in km. */
export const GALE_CRATER_DIAMETER_KM = 154;

/**
 * Dimensões do overlay do mapa da cratera (resolução própria, independente da EVA).
 * 512×384 = proporção 4:3, 2x a resolução base para nitidez.
 * Overlay dimensions for crater map (own resolution, independent from EVA).
 * 512×384 = 4:3 ratio, 2x base resolution for sharpness.
 */
export const OVERLAY_WIDTH = 512;
export const OVERLAY_HEIGHT = 384;

/** Centro e raio da cratera no overlay (pixels). / Crater center and radius in overlay (pixels). */
export const OVERLAY_CENTER: Point = { x: OVERLAY_WIDTH / 2, y: OVERLAY_HEIGHT / 2 };
export const OVERLAY_CRATER_RADIUS = 150; // Raio da cratera em pixels no overlay (300px diâmetro)

/** Fator de conversão px → km no overlay. / px to km conversion factor in overlay. */
export const KM_PER_PX_OVERLAY = GALE_CRATER_DIAMETER_KM / (OVERLAY_CRATER_RADIUS * 2); // ~0.51 km/px

/**
 * Limites da área jogável na cratera real (km relativos ao centro da cratera).
 * Baseado em PIA15687: pouso em ~(-15, -10) km do centro, Boxwork em ~(10, 15) km.
 * A área jogável cobre aproximadamente 25×25 km da cratera (não os 154 km inteiros).
 */
export const GALE_PLAYABLE_BOUNDS = {
  // Coordenadas na cratera real (km relativos ao centro da cratera)
  minXKm: -18,  // Oeste
  maxXKm: 18,   // Leste
  minYKm: -12,  // Sul
  maxYKm: 18,   // Norte (Monte Sharp)

  // Centro do mapa jogável em coordenadas da cratera
  centerKm: { x: 0, y: 3 },

  // Largura/altura da área jogável em km
  widthKm: 36,
  heightKm: 30,
} as const;

/** Centro do mapa do jogo (tiles). Ajustar conforme geração real. / Crater center in game map (tiles). Adjust per actual generation. */
export const MAP_CENTER_TILE: Point = { x: 48, y: 36 };

/**
 * Tamanho do tile do jogo em km (área jogável apenas).
 * O mapa jogável (96×72 tiles) cobre ~36×30 km, não a cratera inteira.
 */
export const TILE_SIZE_KM_X = GALE_PLAYABLE_BOUNDS.widthKm / 96;   // ~0.375 km/tile
export const TILE_SIZE_KM_Y = GALE_PLAYABLE_BOUNDS.heightKm / 72;  // ~0.417 km/tile

/** POIs no overlay (coordenadas fixas baseadas em PIA15687, em pixels do overlay 512×384). */
export interface GalePOI {
  id: string;
  x: number;     // Pixels no overlay (0-512)
  y: number;     // Pixels no overlay (0-384)
  labelKey: string;
  color?: number;
  visitedColor?: number;
}

/** POIs da missão (rota principal) - posições no overlay 512×384. */
export const GALE_MISSION_POIS: GalePOI[] = [
  { id: 'landing', x: 180, y: 160, labelKey: 'galeMap.landing2012', color: 0x9fd8ff },   // Bradbury Landing
  { id: 'ykb', x: 195, y: 155, labelKey: 'galeMap.yellowknifeBay', color: 0x9fd8ff },    // Yellowknife Bay
  { id: 'bag', x: 200, y: 175, labelKey: 'galeMap.bagnoldDunes', color: 0x9fd8ff },       // Dunas Bagnold
  { id: 'boxwork', x: 220, y: 195, labelKey: 'galeMap.boxwork', color: 0x9fd8ff },        // Formações Boxwork
];

/** POIs geográficos (rótulos de região) - posições no overlay 512×384. */
export const GALE_GEOGRAPHIC_POIS: GalePOI[] = [
  { id: 'mountSharp', x: 320, y: 120, labelKey: 'galeMap.mountSharp', color: 0xf0c08a },
  { id: 'aeolisPalus', x: 140, y: 135, labelKey: 'galeMap.aeolisPalus', color: 0xf0c08a },
  { id: 'peaceVallis', x: 120, y: 60, labelKey: 'galeMap.peaceVallis', color: 0xf0c08a },
];

/** Elementos de UI do overlay (posições em % para layout responsivo). */
export const GALE_UI_ELEMENTS = {
  northArrow: { xPct: 92, yPct: 8, labelKey: 'galeMap.north' },
  scaleBar: { xPct: 8, yPct: 88, lengthKm: 50, labelKey: 'galeMap.scale50km' },
  footer: { xPct: 50, yPct: 97, labelKey: 'galeMap.footer' },
} as const;

/** Elipse de pouso da Curiosity (20×7 km) em pixels do overlay. */
export const LANDING_ELLIPSE = {
  widthPx: Math.round(20 / KM_PER_PX_OVERLAY * 0.75),  // ~29px (com escala visual)
  heightPx: Math.round(7 / KM_PER_PX_OVERLAY * 0.75),   // ~10px
};

/** Rota da missão (conexão entre POIs). */
export const MISSION_ROUTE = ['landing', 'ykb', 'bag', 'boxwork'] as const;

/** Paleta de cores do mapa da cratera (estende a paleta P do pixelArt). */
export const GALE_PALETTE = {
  // Fundo da cratera (gradiente orgânico do rim ao centro)
  craterRim: 0x4a2216,       // P[1] - rustDark
  craterMid: 0x8f3e1f,       // P[2] - rust
  craterFloor: 0xc96f3b,     // P[3] - ochre
  craterCenter: 0xf0c08a,    // P[4] - sand

  // Monte Sharp (5 tons - IGUAL AO PROTÓTIPO)
  msBase: 0x8f3e1f,          // #8f3e1f
  msMid1: 0xa54d28,          // #a54d28
  msMid2: 0xb8622f,          // #b8622f
  msMid3: 0xc97b44,          // #c97b44
  msPeak: 0xdfa06a,          // #dfa06a

  // Peace Vallis (canal)
  peaceVallis: 0x4a2216,     // P[1] - rustDark

  // Leque aluvial
  alluvialFan: 0xb8703f,     // #b8703f

  // Elipse de pouso (tracejada) - accent P[5]
  landingEllipse: 0xf7ead8,  // P[5] - suit

  // Rota da missão (tracejada) - signal/safe
  missionRoute: 0x9fd8ff,    // signal / safe (#9fd8ff)

  // POIs
  poiOuter: 0x1a0d0b,        // P[0] - ink
  poiInner: 0xf7ead8,        // P[5] - suit

  // Tracker do jogador (pisca entre safe e P[0])
  trackerSafe: 0x9fd8ff,     // ACC.safe (#9fd8ff)
  trackerAccent: 0x1a0d0b,   // P[0] - ink

  // UI
  textPrimary: 0xf7ead8,     // P[5] - suit
  textSecondary: 0xf0c08a,   // P[4] - sand
  textPOI: 0x9fd8ff,         // signal
  footerBg: 0x1a0d0b,        // P[0] com alpha
} as const;

/** Paleta do Monte Sharp (5 tons) - EXATA DO PROTÓTIPO. */
export const MS_PALETTE = [0x8f3e1f, 0xa54d28, 0xb8622f, 0xc97b44, 0xdfa06a];

/**
 * Converte posição do jogador no mapa do jogo (tiles) para posição no overlay (pixels).
 * CORREÇÃO: O mapa jogável cobre apenas ~36×30 km da cratera, não 154 km.
 */
export function gameToOverlayPos(gameX: number, gameY: number): Point {
  // Converter tiles → km na área jogável
  const kmX = GALE_PLAYABLE_BOUNDS.minXKm + gameX * TILE_SIZE_KM_X;
  const kmY = GALE_PLAYABLE_BOUNDS.maxYKm - gameY * TILE_SIZE_KM_Y; // Y invertido (tile 0 = norte)

  // Converter km → px no overlay da cratera
  return {
    x: OVERLAY_CENTER.x + kmX / KM_PER_PX_OVERLAY,
    y: OVERLAY_CENTER.y - kmY / KM_PER_PX_OVERLAY, // Y invertido (canvas)
  };
}

/** Verifica se uma posição está dentro da cratera no overlay. */
export function isInsideCrater(x: number, y: number): boolean {
  const dx = x - OVERLAY_CENTER.x;
  const dy = y - OVERLAY_CENTER.y;
  return dx * dx + dy * dy <= OVERLAY_CRATER_RADIUS * OVERLAY_CRATER_RADIUS;
}

/** Helpers de noise (re-exportados do pixelArt para conveniência). */
export { hash, vn } from '../scenes/pixelArt';