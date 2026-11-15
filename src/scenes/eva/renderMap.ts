/**
 * Desenha o chão da EVA uma vez numa textura grande, com a arte do Matheus, igual ao artefato final.
 * Draws the EVA ground once into one big texture, with Matheus's art, matching the final artifact.
 *
 * Portado de renderBase(), paintGround() e drawWalls() do protótipo:
 *   - regolito, ventifatos, crateras, seixos e rastros de roda (tiles da arte);
 *   - areia escura das Dunas Bagnold, lamito rachado de Yellowknife Bay e estratos do Monte Sharp
 *     (texturas geradas no código, como diz o LEIAME da arte), com bordas pontilhadas;
 *   - encostas como uma faixa contínua que faz curva quando muda de linha.
 * Ported from the prototype's renderBase(), paintGround() and drawWalls():
 *   - regolith, ventifacts, craters, pebbles and wheel tracks (art tiles);
 *   - dark Bagnold Dunes sand, cracked Yellowknife Bay mudstone and Mount Sharp strata
 *     (textures generated in code, as the art LEIAME says), with dithered edges;
 *   - cliffs as one continuous strip that curves where it steps a row.
 *
 * As rochas grandes, as rochas médias, o habitat e o rover NÃO entram aqui: a cena desenha com a versão 2x.
 * Big rocks, medium rocks, the habitat and the rover are NOT baked here: the scene draws them with the 2x art.
 */
import * as Phaser from 'phaser';
import { TILE_SIZE as T } from '../../config';
import { ART, type ArtKey } from '../art';
import { hash, vn } from '../pixelArt';
import { BEDROCK, TILE, type EvaMap } from './mapaProvisorio';
import { getMap } from '../../map/MapLoader';

export const MAP_TEXTURE = 'eva-map';
/** Textura de dados para shader (R=terreno, G=obstacle, B=topografia, A=minerais) */
export const MAP_DATA_TEXTURE = 'eva-map-data';
/** Quadros da areia que anda com o vento. / Frames of the sand creeping with the wind. */
export const SAND_FRAMES = ['eva-sand-0', 'eva-sand-1', 'eva-sand-2', 'eva-sand-3'];

const TAU = Math.PI * 2;
type RGB = [number, number, number];
const rgb = (c: string): RGB => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
/** Matriz de Bayer 4x4 para o pontilhado. / 4x4 Bayer matrix for dithering. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

/** Textura 64x64 que se repete sem emenda. / 64x64 texture that tiles seamlessly. */
function texture(fn: (x: number, y: number) => RGB): Uint8ClampedArray {
  const d = new Uint8ClampedArray(64 * 64 * 4);
  for (let y = 0; y < 64; y++)
    for (let x = 0; x < 64; x++) {
      const [r, g, b] = fn(x, y), o = (y * 64 + x) * 4;
      d[o] = r;
      d[o + 1] = g;
      d[o + 2] = b;
      d[o + 3] = 255;
    }
  return d;
}

// Areia basáltica escura: ondulações grandes com pequenas por cima, 4 quadros andando com o vento.
// Dark basaltic sand: big ripples with small ones on top, 4 frames creeping downwind.
const SAND_PAL = ['#401d1b', '#4f231f', '#5e2a23', '#73352a', '#8d4333'].map(rgb);
const ripples = (frame: number) =>
  texture((x, y) => {
    const ph = (frame / 4) * TAU;
    const big = Math.sin((TAU * (2 * x + 3 * y)) / 64 + 0.9 * Math.sin((TAU * x) / 64) + ph);
    const small = Math.sin((TAU * (7 * x + 10 * y)) / 64 + 1.1 * Math.sin((TAU * 2 * y) / 64) + ph * 3);
    const v = big * 0.72 + small * 0.28 + (hash(x, y, 5) < 0.05 ? 0.35 : 0);
    return SAND_PAL[v > 0.8 ? 4 : v > 0.42 ? 3 : v > -0.12 ? 2 : v > -0.62 ? 1 : 0];
  });

// Lamito parecido com o de Sheepbed: placas separadas por rachaduras e alguns veios claros.
// Sheepbed-like mudstone: plates split by cracks, a few light mineral veins.
function mudstone(): Uint8ClampedArray {
  const seeds = [...Array(34)].map((_, k) => ({ x: hash(k, 1, 71) * 64, y: hash(k, 2, 71) * 64, c: Math.floor(hash(k, 3, 71) * 4) }));
  const pal = ['#c98252', '#d7905a', '#dc955d', '#cf8a55'].map(rgb);
  const crack = rgb('#7d4430'), bevel = rgb('#ae6945'), vein = rgb('#e6be92');
  return texture((x, y) => {
    let d1 = 1e9, d2 = 1e9, c = 0;
    for (const p of seeds) {
      let dx = Math.abs(x - p.x), dy = Math.abs(y - p.y);
      dx = Math.min(dx, 64 - dx);
      dy = Math.min(dy, 64 - dy);
      const d = Math.hypot(dx, dy);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        c = p.c;
      } else if (d < d2) d2 = d;
    }
    const e = d2 - d1;
    if (e < 1.1) return crack;
    if (e < 2.1) return (x + y) & 1 ? bevel : pal[c];
    if (Math.abs(Math.sin((TAU * (3 * x + y)) / 64 + 2 * Math.sin((TAU * y) / 64))) < 0.035 && c === 0) return vein;
    return pal[c];
  });
}

// Estratos de sulfato do Monte Sharp: camadas finas que acompanham a encosta.
// Mount Sharp sulfate strata: thin layers that follow the slope.
function strata(): Uint8ClampedArray {
  const pal = ['#b5602f', '#c17040', '#a9552b', '#cf8550', '#b0592d'].map(rgb);
  return texture((x, y) => {
    const v = y + 2.2 * Math.sin((TAU * x) / 64) + 0.8 * Math.sin((TAU * 3 * x) / 64);
    const k = Math.floor((((v % 64) + 64) % 64) / 3);
    return pal[(k * 7 + Math.floor(k / 3)) % 5];
  });
}

export function renderMap(scene: Phaser.Scene, map: EvaMap): string {
  const MW = map.width, MH = map.height, W = MW * T, H = MH * T;
  const I = (x: number, y: number) => y * MW + x;
  const inMap = (x: number, y: number) => x >= 0 && y >= 0 && x < MW && y < MH;
  // Ao jogar de novo as texturas já existem: apaga antes de recriar. / On replay the textures already exist: remove them before recreating.
  for (const key of [MAP_TEXTURE, MAP_DATA_TEXTURE, ...SAND_FRAMES]) if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(MAP_TEXTURE, W, H)!;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;

  /** Copia um quadro de uma textura do Phaser. / Copies a frame from a Phaser texture. */
  const blit = (key: ArtKey, frame: number | undefined, x: number, y: number, flip = false) => {
    const f = scene.textures.getFrame(key, frame);
    if (!f) return;
    const src = f.source.image as CanvasImageSource, w = f.cutWidth, h = f.cutHeight;
    if (flip) {
      ctx.save();
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(src, f.cutX, f.cutY, w, h, 0, 0, w, h);
      ctx.restore();
    } else ctx.drawImage(src, f.cutX, f.cutY, w, h, x, y, w, h);
  };

  const erosion = map.secrets.find((s) => s.id === 'erosion')!;
  const ykb = map.pois.find((p) => p.id === 'ykb')!;
  const box = map.pois.find((p) => p.id === 'box')!;

  // 1) Chão e decoração, tile a tile. / Ground and decoration, tile by tile.
  for (let y = 0; y < MH; y++)
    for (let x = 0; x < MW; x++) {
      const X = x * T, Y = y * T, t = map.tileAt(x, y);
      // Ventifatos: rochas esculpidas pelo vento, mais comuns perto da laje polida. / Wind-carved rocks, more common near the polished slab.
      const nearErosion = Math.hypot(x - erosion.x, y - erosion.y) < 9;
      // Rocha pontiaguda nunca usa o chão de ventifatos, que é inofensivo e confundia. / Sharp rock never uses the harmless ventifact ground, which was misleading.
      if (t !== TILE.sharp && hash(x, y, 123) < (nearErosion ? 0.3 : 0.035)) blit(ART.ventGround, Math.floor(hash(x, y, 124) * 4), X, Y, hash(x, y, 84) < 0.5);
      else {
        const h = hash(x, y, 83);
        blit(ART.regolith, h < 0.45 ? 3 : h < 0.72 ? 0 : h < 0.9 ? 1 : 2, X, Y, hash(x, y, 84) < 0.5);
      }
      if (t === TILE.sand || t === TILE.cliff) continue;
      const bare = !map.bedrock(x, y);
      // Todo tile que machuca o traje mostra a rocha pontiaguda, e só ele. Antes metade virava ventifato ou pedrinha e parecia chão comum.
      // Every tile that hurts the suit shows the sharp rock, and only those do. Before, half became ventifacts or pebbles and looked like plain ground.
      if (t === TILE.sharp) {
        blit(ART.rockSharp, undefined, X, Y + 2, hash(x, y, 90) < 0.5);
        continue;
      }
      if (map.isPebble(x, y) && bare) {
        if (hash(x, y, 91) < 0.2) blit(ART.pebbleGroups, Math.floor(hash(x, y, 94) * 4), X + 2, Y + 6, hash(x, y, 92) < 0.5);
        else blit(ART.pebbles, Math.floor(hash(x, y, 95) * 4), X + 2, Y + 6, hash(x, y, 92) < 0.5);
      } else if (t === TILE.ground && bare) {
        const h = hash(x, y, 93), onPath = map.onPath(x, y), dk = Math.hypot(x - ykb.x, y - ykb.y);
        if (onPath && h < 0.2) blit(ART.tracks, undefined, X, Y);
        else if (!onPath && h < 0.012) blit(ART.craterMid, undefined, X, Y + 1);
        else if (!onPath && h < 0.03) blit(ART.craterSmall, undefined, X + 2, Y + 3);
        else if (!onPath && h < 0.0306) blit(ART.meteor, undefined, X + 2, Y + 5);
        else if (!onPath && dk < 16 && h < 0.06) blit(ART.vein, undefined, X + 1, Y + 5, hash(x, y, 127) < 0.5);
        else if (h < 0.11) blit(ART.pebbleGroups, Math.floor(hash(x, y, 128) * 4), X + 1, Y + 6, hash(x, y, 129) < 0.5);
      }
    }

  // 2) Boxwork no alvo final (PIA26559). / Boxwork at the final target.
  blit(ART.boxwork, undefined, box.x * T - 8, box.y * T - 14);

  // 3) Areia, lamito e estratos por cima, com bordas orgânicas e pontilhadas. / Sand, mudstone and strata on top, organic dithered edges.
  const sandMask = paintGround(ctx, map, W, H);

  // 4) Rochas médias que ficam em cima da rocha exposta. / Medium rocks sitting on the bedrock.
  for (let y = 0; y < MH; y++)
    for (let x = 0; x < MW; x++)
      if (map.tileAt(x, y) === TILE.rock && !map.isBoulder(x, y) && map.rockOnBedrock(x, y))
        blit(ART.rocksMid, Math.floor(hash(x, y, 126) * 4), x * T, y * T, hash(x, y, 92) < 0.5);

  // 5) Encostas. / Cliffs.
  drawWalls(scene, ctx, map, I, inMap);

  tex.refresh();

  // 6) Gera textura de dados para shader (R=terreno, G=obstacle, B=topografia, A=minerais)
  // Shader espera valores 0-3 por canal (enums TopographyValue, MineralsValue)
  const mapData = getMap();
  const dataImg = ctx.createImageData(W, H);
  const dd = dataImg.data;
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      const o = (y * W + x) * 4;
      // R: terrenoLayer (0-4) → escala para 0-63 (4 * 16 = 64)
      dd[o] = (mapData.layers.terreno[y][x] & 0xF) * 16;
      // G: obstacleType (0-13) → escala para 0-208 (13 * 16 = 208)
      dd[o + 1] = (mapData.obstacles[y][x] & 0xF) * 16;
      // B: topografia - TopographyValue enum (0-3): Low=0, Medium=1, High=2, Contour=3
      // Usa elevation do mapa real (já normalizado 0-1 com exagero 2.5x) + detecção de curva de nível
      const elevNorm = map.elevation(x, y);
      // Curva de nível = mudança de banda (0-7) entre vizinhos; comparar o float direto marcaria quase todo tile.
      // Contour = band (0-7) change between neighbours; comparing the raw float would flag almost every tile.
      const band = (e: number): number => Math.max(0, Math.min(7, Math.floor(e * 8)));
      const isContour = (x < MW - 1 && band(map.elevation(x + 1, y)) !== band(elevNorm)) ||
                        (y < MH - 1 && band(map.elevation(x, y + 1)) !== band(elevNorm));
      let topoVal: number;
      if (isContour) {
        topoVal = 3; // Contour
      } else if (elevNorm < 0.33) {
        topoVal = 0; // Low
      } else if (elevNorm < 0.66) {
        topoVal = 1; // Medium
      } else {
        topoVal = 2; // High
      }
      dd[o + 2] = topoVal * 64; // 0, 64, 128, 192
      // A: minerais - MineralsValue enum (0-3): None=0, Clay=1, Sulfates=2, Both=3
      // Usa minerais procedurais do EvaMap (não o JSON estático)
      const mineralVal = map.minerals(x, y);
      dd[o + 3] = (mineralVal & 0x3) * 64; // 0, 64, 128, 192
    }
  }
  const dataTex = scene.textures.createCanvas(MAP_DATA_TEXTURE, W, H)!;
  dataTex.getContext().putImageData(dataImg, 0, 0);
  dataTex.refresh();

  sandFrames(scene, sandMask, W, H);
  return MAP_TEXTURE;
}

/** Interpolação bilinear num campo por tile. / Bilinear interpolation over a per-tile field. */
function bil(F: Float32Array, MW: number, MH: number, u: number, v: number): number {
  u = Math.max(0, Math.min(MW - 1, u));
  v = Math.max(0, Math.min(MH - 1, v));
  const x0 = Math.floor(u), y0 = Math.floor(v), x1 = Math.min(x0 + 1, MW - 1), y1 = Math.min(y0 + 1, MH - 1), fx = u - x0, fy = v - y0;
  return (F[y0 * MW + x0] * (1 - fx) + F[y0 * MW + x1] * fx) * (1 - fy) + (F[y1 * MW + x0] * (1 - fx) + F[y1 * MW + x1] * fx) * fy;
}

/**
 * Pinta areia, lamito e estratos pixel a pixel (paintGround do protótipo). Devolve a máscara da areia.
 * Paints sand, mudstone and strata pixel by pixel (the prototype's paintGround). Returns the sand mask.
 */
function paintGround(ctx: CanvasRenderingContext2D, map: EvaMap, W: number, H: number): Uint8Array {
  const MW = map.width, MH = map.height;
  const img = ctx.getImageData(0, 0, W, H), d = img.data;
  const mask = new Uint8Array(W * H);
  const RIP = ripples(0), MUD = mudstone(), STR = strata();
  const FS = new Float32Array(MW * MH), FM = new Float32Array(MW * MH), FT = new Float32Array(MW * MH);
  for (let y = 0; y < MH; y++)
    for (let x = 0; x < MW; x++) {
      const i = y * MW + x, t = map.tileAt(x, y);
      FS[i] = t === TILE.sand ? 1 : 0;
      FM[i] = map.bedrock(x, y) === BEDROCK.mudstone || map.rockOnBedrock(x, y) === BEDROCK.mudstone ? 1 : 0;
      FT[i] = map.bedrock(x, y) === BEDROCK.strata || map.rockOnBedrock(x, y) === BEDROCK.strata ? 1 : 0;
    }
  // 0: areia pode ir para chão comum; 1: rocha exposta só em chão comum ou rocha em cima dela.
  // 0: sand may spill onto plain ground; 1: bedrock only on plain ground or rocks sitting on it.
  const can = (tx: number, ty: number, kind: 0 | 1) => {
    if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return false;
    const t = map.tileAt(tx, ty);
    return kind === 0 ? t === TILE.sand || t === TILE.ground : t === TILE.ground || (t === TILE.rock && !!map.rockOnBedrock(tx, ty));
  };
  const field = (F: Float32Array, X: number, Y: number, s: number) =>
    bil(F, MW, MH, (X + 0.5) / T - 0.5, (Y + 0.5) / T - 0.5) + (vn(X / 9, Y / 9, s) - 0.5) * 0.34 + (vn(X / 3, Y / 3, s + 1) - 0.5) * 0.12;
  // Na faixa da borda, os dois chãos se misturam por pontilhado, como poeira assentando.
  // In the edge band, the two grounds mix through dithering, like dust settling.
  const mix = (o: number, q: number, src: Uint8ClampedArray, v: number, lo: number, hi: number, X: number, Y: number) => {
    if ((v - lo) / (hi - lo) <= BAYER[(Y & 3) * 4 + (X & 3)]) return false;
    d[o] = src[q];
    d[o + 1] = src[q + 1];
    d[o + 2] = src[q + 2];
    return true;
  };
  const copy = (o: number, q: number, src: Uint8ClampedArray) => {
    d[o] = src[q];
    d[o + 1] = src[q + 1];
    d[o + 2] = src[q + 2];
  };
  const dim = (o: number, k: number) => {
    d[o] = (d[o] * k) | 0;
    d[o + 1] = (d[o + 1] * k) | 0;
    d[o + 2] = (d[o + 2] * k) | 0;
  };
  for (let Y = 0; Y < H; Y++)
    for (let X = 0; X < W; X++) {
      const tx = (X / T) | 0, ty = (Y / T) | 0, o = (Y * W + X) * 4, q = ((Y & 63) * 64 + (X & 63)) * 4;
      if (can(tx, ty, 0)) {
        const v = field(FS, X, Y, 31);
        if (v > 0.58) {
          copy(o, q, RIP);
          mask[Y * W + X] = 1;
          continue;
        }
        if (v > 0.42 && mix(o, q, RIP, v, 0.42, 0.58, X, Y)) {
          mask[Y * W + X] = 1;
          continue;
        }
        if (v > 0.36 && !map.isPebble(tx, ty)) dim(o, 0.86);
      }
      if (!can(tx, ty, 1)) continue;
      let v = field(FM, X, Y, 33);
      if (v > 0.6) {
        copy(o, q, MUD);
        continue;
      }
      if (v > 0.44 && mix(o, q, MUD, v, 0.44, 0.6, X, Y)) continue;
      if (v > 0.38 && field(FM, X - 2, Y - 2, 33) > 0.5) {
        dim(o, 0.82);
        continue;
      }
      v = field(FT, X, Y, 35);
      if (v > 0.6) {
        copy(o, q, STR);
        continue;
      }
      if (v > 0.44 && mix(o, q, STR, v, 0.44, 0.6, X, Y)) continue;
      if (v > 0.38 && field(FT, X - 2, Y - 2, 35) > 0.5) dim(o, 0.82);
    }
  ctx.putImageData(img, 0, 0);
  return mask;
}

/**
 * Encostas viradas para o sul, numa faixa contínua que faz uma curva suave quando sobe ou desce uma linha.
 * South-facing cliffs as one continuous strip that bends smoothly where the contour steps a row.
 */
function drawWalls(scene: Phaser.Scene, ctx: CanvasRenderingContext2D, map: EvaMap, I: (x: number, y: number) => number, inMap: (x: number, y: number) => boolean): void {
  const MW = map.width, MH = map.height;
  const isC = (x: number, y: number) => inMap(x, y) && x > 0 && x < MW - 1 && map.tileAt(x, y) === TILE.cliff;
  const seen = new Uint8Array(MW * MH);
  const nextRow = (x: number, y: number) => (isC(x + 1, y) ? y : isC(x + 1, y - 1) ? y - 1 : isC(x + 1, y + 1) ? y + 1 : null);
  const hasLeft = (x: number, y: number) => isC(x - 1, y) || isC(x - 1, y - 1) || isC(x - 1, y + 1);
  // Quadros de encosta.png: 0 ponta esquerda, 1-3 meios, 4 ponta direita, 5 curta. / encosta.png frames.
  const column = (frame: number, sx: number, X: number, Y: number) => {
    const f = scene.textures.getFrame(ART.cliff, frame);
    if (f) ctx.drawImage(f.source.image as CanvasImageSource, f.cutX + sx, f.cutY, 1, 32, X, Y, 1, 32);
  };
  for (let y = 0; y < MH; y++)
    for (let x = 0; x < MW; x++) {
      if (!isC(x, y) || seen[I(x, y)] || hasLeft(x, y)) continue;
      // Segue a encosta para a direita. / Follow the wall to the right.
      const run: number[] = [];
      let cx = x, cy: number | null = y;
      while (cx < MW && cy !== null && isC(cx, cy) && !seen[I(cx, cy)]) {
        seen[I(cx, cy)] = 1;
        run.push(cy);
        cy = nextRow(cx, cy);
        cx++;
      }
      const X0 = x * T, N = run.length;
      if (N === 1) {
        const f = scene.textures.getFrame(ART.cliff, 5);
        if (f) ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, 32, 32, X0 - 8, run[0] * T - 6, 32, 32);
        continue;
      }
      // Altura por coluna de pixel, suavizada: um degrau vira uma curva longa. / Per-column height, smoothed: a step becomes a long curve.
      const L = N * T, raw = new Float32Array(L), h = new Float32Array(L);
      for (let k = 0; k < L; k++) raw[k] = run[k >> 4] * T;
      const R = 14;
      for (let k = 0; k < L; k++) {
        let s = 0, c = 0;
        for (let j = -R; j <= R; j++) {
          s += raw[Math.min(L - 1, Math.max(0, k + j))];
          c++;
        }
        h[k] = s / c;
      }
      for (let k = 0; k < L; k++) {
        const X = X0 + k, Y = Math.round(h[k]) - 6;
        if (k < 16) column(0, k, X, Y);
        else if (k >= L - 16) column(4, 16 + (k - (L - 16)), X, Y);
        else column(1 + Math.floor(hash(X >> 5, run[k >> 4], 141) * 3), X & 31, X, Y);
      }
    }
}

/**
 * Cria os 4 quadros da areia andando, só no retângulo das dunas. Devolve onde fica esse retângulo.
 * Creates the 4 frames of creeping sand, only over the dunes' bounding box.
 */
export let sandBox = { x: 0, y: 0, w: 0, h: 0 };
function sandFrames(scene: Phaser.Scene, mask: Uint8Array, W: number, H: number): void {
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let Y = 0; Y < H; Y++)
    for (let X = 0; X < W; X++)
      if (mask[Y * W + X]) {
        if (X < x0) x0 = X;
        if (X > x1) x1 = X;
        if (Y < y0) y0 = Y;
        if (Y > y1) y1 = Y;
      }
  if (x1 < 0) {
    sandBox = { x: 0, y: 0, w: 0, h: 0 };
    return;
  }
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  sandBox = { x: x0, y: y0, w, h };
  SAND_FRAMES.forEach((key, f) => {
    const src = ripples(f);
    const tex = scene.textures.createCanvas(key, w, h)!;
    const c = tex.getContext(), img = c.createImageData(w, h), d = img.data;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const X = x0 + x, Y = y0 + y;
        if (!mask[Y * W + X]) continue;
        const o = (y * w + x) * 4, q = ((Y & 63) * 64 + (X & 63)) * 4;
        d[o] = src[q];
        d[o + 1] = src[q + 1];
        d[o + 2] = src[q + 2];
        d[o + 3] = 255;
      }
    c.putImageData(img, 0, 0);
    tex.refresh();
  });
}
