/**
 * Ajudantes de pixel art usados pelas cenas (portados do protótipo).
 * Pixel-art helpers used by the scenes (ported from the prototype).
 */
import * as Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

/** Paleta de óxido de ferro, do escuro ao claro (P[0]..P[5] no protótipo). / Iron-oxide palette, dark to light. */
export const P = [0x1a0d0b, 0x4a2216, 0x8f3e1f, 0xc96f3b, 0xf0c08a, 0xf7ead8] as const;

/** Número pseudoaleatório fixo para (x, y, semente). / Fixed pseudo-random number for (x, y, seed). */
export function hash(x: number, y: number, s: number): number {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Ruído suave (value noise). / Smooth value noise. */
export function vn(x: number, y: number, s: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`;

/**
 * Planeta com três tons e pontilhado, desenhado uma vez numa textura.
 * Three-tone dithered planet, drawn once into a texture.
 */
export function planetTexture(scene: Phaser.Scene, key: string, r: number, c1: number, c2: number, c3: number): string {
  if (scene.textures.exists(key)) return key;
  const size = r * 2 + 1;
  const tex = scene.textures.createCanvas(key, size, size);
  if (!tex) return key;
  const ctx = tex.getContext();
  for (let y = -r; y <= r; y++)
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y > r * r + r * 0.6) continue;
      const k = (x * 0.8 + y * 0.45) / r + ((x + y) & 1 ? 0.07 : -0.07);
      ctx.fillStyle = hex(k > 0.42 ? c3 : k > 0 ? c2 : c1);
      ctx.fillRect(x + r, y + r, 1, 1);
    }
  tex.refresh();
  return key;
}

/** Disco simples de uma cor. / Plain one-color disc. */
export function disc(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number, color: number): void {
  g.fillStyle(color);
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) g.fillRect(cx + x, cy + y, 1, 1);
}

const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: Math.floor(hash(i, 1, 91) * GAME_WIDTH),
  y: Math.floor(hash(i, 2, 91) * GAME_HEIGHT),
  b: hash(i, 3, 91),
}));

/**
 * Céu estrelado que pisca; scroll move as estrelas para a esquerda.
 * Twinkling starfield; scroll moves the stars to the left.
 */
export function drawStars(g: Phaser.GameObjects.Graphics, time: number, scroll = 0, minX = -1): void {
  for (const s of STARS) {
    const twinkle = Math.sin(time * 2 + s.b * 20) > 0.6;
    const x = (((s.x - scroll * (0.3 + s.b)) % GAME_WIDTH) + GAME_WIDTH) % GAME_WIDTH;
    if (x <= minX) continue;
    g.fillStyle(s.b > 0.8 ? (twinkle ? P[4] : P[5]) : s.b > 0.45 ? P[3] : P[2]);
    g.fillRect(Math.floor(x), s.y, 1, 1);
  }
}

/** Borda colorida pulsando (alerta). / Pulsing colored border (alert). */
export function vignette(g: Phaser.GameObjects.Graphics, color: number, alpha: number): void {
  const W = GAME_WIDTH, H = GAME_HEIGHT;
  for (let k = 0; k < 6; k++) {
    g.fillStyle(color, alpha * (1 - k / 6));
    g.fillRect(k * 2, k * 2, W - k * 4, 2);
    g.fillRect(k * 2, H - k * 2 - 2, W - k * 4, 2);
    g.fillRect(k * 2, k * 2, 2, H - k * 4);
    g.fillRect(W - k * 2 - 2, k * 2, 2, H - k * 4);
  }
}
