/**
 * Overlay visual "Scanner Tático" — réplica exata do protótipo.
 * Usa canvases off-screen com dithering Bayer (estilo softLayer do protótipo).
 * Camadas pré-renderizadas em 8x (768×576) → upscale nearest-neighbor para 1x.
 * Cores idênticas ao protótipo (ACC, BC, CC, SC_, D0, C5).
 */
import * as Phaser from 'phaser';
import type { EvaMap } from '../scenes/eva/mapaProvisorio';
import { vn } from '../scenes/pixelArt';

// Bayer 8x8 para dithering ordered (prototype exact)
const BAYER8 = [
  [  0, 32,  8, 40,  2, 34, 10, 42],
  [ 48, 16, 56, 24, 50, 18, 58, 26],
  [ 12, 44,  4, 36, 14, 46,  6, 38],
  [ 60, 28, 52, 20, 62, 30, 54, 22],
  [  3, 35, 11, 43,  1, 33,  9, 41],
  [ 51, 19, 59, 27, 49, 17, 57, 25],
  [ 15, 47,  7, 39, 13, 45,  5, 37],
  [ 63, 31, 55, 23, 61, 29, 53, 21],
].map(row => row.map(v => (v + 0.5) / 64));

// Prototype color constants (exact from prototype)
const hex = (c: string) => {
  const v = parseInt(c.slice(1), 16);
  return [v >> 16 & 255, v >> 8 & 255, v & 255] as [number, number, number];
};

const P = ['#1a0d0b','#4a2216','#8f3e1f','#c96f3b','#f0c08a','#f7ead8'].map(hex);
const ACC = {
  clay: hex('#6fb0a0'),
  sulf: hex('#e3d06a'),
  alert: hex('#ff6a45'),
  safe: hex('#9ad48a'),
  soft: hex('#ffd27a'),
};

// BC = elevation bands (8 levels), C5 = contour color
const BC = ['#1a0d0b','#341711','#4f2216','#6e3019','#91431f','#b5602f','#d68a52','#f0c08a'].map(hex);
const C5 = hex('#f7ead8'); // P[5]

export type LayerMode = 'mapa' | 'topografia' | 'minerais' | 'terreno';

export class MapLayerOverlay {
  private scene: Phaser.Scene;
  private currentMode: LayerMode = 'mapa';
  private sprite: Phaser.GameObjects.Image;
  private map: EvaMap;
  private renderedLayers = new Map<string, HTMLCanvasElement>();

  constructor(scene: Phaser.Scene, map: EvaMap) {
    this.scene = scene;
    this.map = map;

    // Sprite único que troca de textura - layers são renderizados sob demanda (lazy)
    this.sprite = this.scene.add.image(0, 0, 'layer-topografia');
    this.sprite.setOrigin(0).setDepth(-500).setVisible(false);
  }

  /** Renderiza uma camada para textura Phaser via canvas off-screen com dithering Bayer (prototype exact).
   * Uses lazy rendering - only renders when first needed to save memory (~20MB at startup). */
  private renderLayerToTexture(mode: 'topografia' | 'minerais' | 'terreno'): void {
    // Check if already rendered
    if (this.renderedLayers.has(mode)) {
      const cachedCanvas = this.renderedLayers.get(mode)!;
      const key = `layer-${mode}`;
      if (this.scene.textures.exists(key)) this.scene.textures.remove(key);
      this.scene.textures.addCanvas(key, cachedCanvas);
      return;
    }

    const canvas = document.createElement('canvas');
    const canvasW = this.map.width * 8;
    const canvasH = this.map.height * 8;
    canvas.width = canvasW;
    canvas.height = canvasH;
    const cctx = canvas.getContext('2d')!;
    const img = cctx.createImageData(canvasW, canvasH);
    const d = img.data;

    const maxX = this.map.width - 1;
    const maxY = this.map.height - 1;

    // Bilinear interpolation do elevation real do mapa (já normalizado 0-1 com exagero)
    const elevAt = (u: number, v: number): number => {
      // u,v estão em coordenadas de tile (0 to width-1, 0 to height-1)
      const x = Math.max(0, Math.min(maxX, u));
      const y = Math.max(0, Math.min(maxY, v));
      const x0 = Math.floor(x), y0 = Math.floor(y);
      const x1 = Math.min(x0 + 1, maxX), y1 = Math.min(y0 + 1, maxY);
      const fx = x - x0, fy = y - y0;
      const e00 = this.map.elevation(x0, y0);
      const e10 = this.map.elevation(x1, y0);
      const e01 = this.map.elevation(x0, y1);
      const e11 = this.map.elevation(x1, y1);
      return (e00 * (1 - fx) + e10 * fx) * (1 - fy) + (e01 * (1 - fx) + e11 * fx) * fy;
    };

    const bandAt = (u: number, v: number): number => {
      const e = elevAt(u, v);
      return Math.max(0, Math.min(7, Math.floor(e * 8)));
    };

    // Preparar campos de minerais para interpolação bilinear (só para modo minerais)
    let clay: Float32Array | null = null;
    let sulf: Float32Array | null = null;
    if (mode === 'minerais') {
      const mapW = this.map.width, mapH = this.map.height;
      clay = new Float32Array(mapW * mapH);
      sulf = new Float32Array(mapW * mapH);
      for (let y = 0; y < mapH; y++) {
        for (let x = 0; x < mapW; x++) {
          const m = this.map.minerals(x, y);
          clay[y * mapW + x] = (m === 1 || m === 3) ? 1 : 0;
          sulf[y * mapW + x] = (m === 2 || m === 3) ? 1 : 0;
        }
      }
    }

    const at = (f: Float32Array, u: number, v: number): number => {
      const mapW = this.map.width, mapH = this.map.height;
      const x = Math.max(0, Math.min(mapW - 2, Math.floor(u)));
      const y = Math.max(0, Math.min(mapH - 2, Math.floor(v)));
      const fx = Math.max(0, Math.min(1, u - x));
      const fy = Math.max(0, Math.min(1, v - y));
      const a = f[y * mapW + x] + (f[y * mapW + x + 1] - f[y * mapW + x]) * fx;
      const b = f[(y + 1) * mapW + x] + (f[(y + 1) * mapW + x + 1] - f[(y + 1) * mapW + x]) * fx;
      return a + (b - a) * fy;
    };

    const smooth = (a: number, b: number, t: number): number => {
      t = Math.max(0, Math.min(1, (t - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };

    for (let py = 0; py < canvasH; py++) {
      for (let px = 0; px < canvasW; px++) {
        const u = px / 8, v = py / 8;
        const iu = Math.floor(u), iv = Math.floor(v);
        if (iu < 0 || iu >= this.map.width || iv < 0 || iv >= this.map.height) continue;

        let r = 0, g = 0, b = 0, a = 0;

        if (mode === 'topografia') {
          const e = elevAt(u, v);
          const band = Math.max(0, Math.min(7, Math.floor(e * 8)));
          const isContour = (bandAt(u + 1/8, v) !== bandAt(u, v)) || (bandAt(u, v + 1/8) !== bandAt(u, v));

          if (isContour) {
            // Contour: C5 with alpha 230 (prototype: [...C5, 230])
            [r, g, b] = C5;
            a = 230;
          } else {
            // Band color: BC[band] with alpha 150 (prototype: [...BC[b0], 150])
            [r, g, b] = BC[band];
            a = 150;
          }
        } else if (mode === 'minerais') {
          // Bilinear interpolation + smoothstep + noise + Bayer dithering
          // clay and sulf are guaranteed initialized here (mode === 'minerais')
          // -0.5 because tile value is at center
          const uu = (px + 0.5) / 8 - 0.5;
          const vv = (py + 0.5) / 8 - 0.5;
          // noise to break up perfect diamond edges
          const n = (vn(px / 6, py / 6, 5) - 0.5) * 0.35;

          const kc = smooth(0.3, 0.7, at(clay!, uu, vv) + n);
          const ks = smooth(0.3, 0.7, at(sulf!, uu, vv) + n);
          const th = BAYER8[py & 7][px & 7];

          if (kc > th) {
            [r, g, b] = ACC.clay;
          } else if (ks > th) {
            [r, g, b] = ACC.sulf;
          } else {
            continue; // transparent
          }
          a = 200;
        } else { // terreno
          // Terrain layer: soft sand, sharp rocks, slopes, shelters
          // Uses map tile data to render terrain features
          const tileType = this.map.tileAt(Math.floor(u), Math.floor(v));

          if (tileType === 3) { // SAND - soft sand
            [r, g, b] = ACC.soft; // #ffd27a - soft sand color
            a = 200;
          } else if (tileType === 6) { // SHARP - sharp rocks
            [r, g, b] = ACC.alert; // #ff6a45 - alert/sharp rock color
            a = 220;
          } else if (tileType === 2) { // CLIFF - slope/rock
            [r, g, b] = P[2]; // P[2] - rust color for slopes
            a = 180;
          } else if (tileType === 4 || tileType === 5) { // HAB/ROV - shelter
            [r, g, b] = ACC.safe; // #9ad48a - safe/shelter color
            a = 220;
          } else {
            continue; // transparent for walkable ground
          }
        }

        const didx = (py * canvasW + px) * 4;
        d[didx] = r;
        d[didx + 1] = g;
        d[didx + 2] = b;
        d[didx + 3] = a;
      }
    }

    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(img, 0, 0);

    // Scale up to 1x resolution with nearest neighbor (prototype: up() does this)
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = this.map.width * 16;
    finalCanvas.height = this.map.height * 16;
    const fctx = finalCanvas.getContext('2d')!;
    fctx.imageSmoothingEnabled = false;
    fctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, finalCanvas.width, finalCanvas.height);

    // Cache for lazy loading
    this.renderedLayers.set(mode, finalCanvas);

    const key = `layer-${mode}`;
    if (this.scene.textures.exists(key)) this.scene.textures.remove(key);
    this.scene.textures.addCanvas(`layer-${mode}`, finalCanvas);
  }

  /** Troca modo */
  setMode(mode: LayerMode): void {
    if (mode === 'mapa') {
      this.sprite?.setVisible(false);
      return;
    }
    // Lazy render: only generate layer texture when first needed
    this.renderLayerToTexture(mode);
    this.sprite!.setTexture(`layer-${mode}`);
    this.sprite!.setVisible(true);
  }

  getMode(): LayerMode {
    return this.currentMode;
  }

  /** Limpa overlay */
  clear(): void {
    this.setMode('mapa');
  }
}