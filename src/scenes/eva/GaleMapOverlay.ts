/**
 * Mapa da missão (tecla M): o mapa de verdade da EVA, visto de cima, e onde ele fica na Cratera Gale.
 * Mission map (M key): the real EVA map seen from above, and where it sits in Gale Crater.
 *
 * Esquerda: o mesmo mapa em que a Ana anda, reduzido. Mostra a Ana (piscando), o Tatu, o habitat e o rover (abrigos),
 * as rochas que bloqueiam, os alvos (visitado, atual e a visitar), os pontos extras (opcionais), uma linha até o alvo
 * atual e o pedaço que aparece na tela.
 * Direita: a Cratera Gale inteira, com o Monte Sharp, o Peace Vallis e os lugares reais do Curiosity, e a Ana no lugar
 * equivalente da cratera.
 * Left: the same map Ana walks on, scaled down. Shows Ana (blinking), the Tatu, the habitat and rover (shelters),
 * blocking rocks, the targets (visited, current and still to visit), the extra (optional) spots, a line to the current
 * target and the part shown on screen.
 * Right: the whole Gale Crater, with Mount Sharp, Peace Vallis and Curiosity's real sites, and Ana at the matching spot.
 *
 * Tudo é lido da cena a cada quadro (getView), então o mapa nunca fica diferente do jogo.
 * Everything is read from the scene each frame (getView), so the map never drifts from the game.
 */
import * as Phaser from 'phaser';
import { onLangChange, t, type TextKey } from '../../i18n/i18n';
import { esc, screenLayer, type ScreenLayer } from '../../ui/Screen';
import { GALE_CRATER_DIAMETER_KM, MS_PALETTE } from '../../map/galeConstants';
import { hash, vn } from '../pixelArt';
import { MAP_TEXTURE } from './renderMap';
import { TILE, type EvaMap, type Point, type Rect } from './mapaProvisorio';

/** O que o mapa precisa saber da EVA agora. / What the map needs to know about the EVA right now. */
export interface GaleMapView {
  map: EvaMap;
  /** Posições em tiles (com fração no meio do passo). / Tile positions (fractional mid-step). */
  player: Point;
  tatu: Point;
  devil: Point | null;
  /** Alvo atual em tiles e o nome dele. / Current target in tiles and its name. */
  target: Point;
  targetName: string;
  /** Alvos já visitados (ykb, bag, box). / Targets already visited. */
  visited: ReadonlySet<string>;
  /** Pontos extras já encontrados (erosion, namib, sulfur). / Extra spots already found. */
  found: ReadonlySet<string>;
  /** Pedaço do mapa que aparece na tela, em tiles. / Part of the map shown on screen, in tiles. */
  view: Rect;
}

/** Pixels por tile no mapa da EVA. / Pixels per tile on the EVA map. */
const K = 4;
/** Lado do desenho da cratera, em pixels, e km por pixel. / Crater drawing side, in pixels, and km per pixel. */
const GS = 120;
const KM_PX = 180 / GS;
const COL = { ink: '#1a0d0b', dark: '#4a2216', sand: '#f0c08a', suit: '#f7ead8', signal: '#9fd8ff', safe: '#9ad48a', tatu: '#ff9a4a', extra: '#e3d06a' };

/**
 * Lugares reais do Curiosity, em km a partir do centro da Gale (leste, norte). Valores aproximados, a partir das
 * coordenadas publicadas pela NASA (pouso em 4,59° S 137,44° L; centro da cratera em 5,4° S 137,8° L).
 * `game` liga cada lugar ao ponto do jogo que o representa.
 * Curiosity's real sites, in km from Gale's center (east, north). Approximate values, from the coordinates NASA published
 * (landing at 4.59° S 137.44° E; crater center at 5.4° S 137.8° E). `game` links each site to the game spot that stands for it.
 */
const SITES = [
  { id: 'home', km: { x: -21.2, y: 48.0 } },
  { id: 'ykb', km: { x: -20.3, y: 48.0 } },
  { id: 'bag', km: { x: -24.8, y: 39.7 } },
  { id: 'box', km: { x: -24.2, y: 33.2 } },
] as const;
/** Monte Sharp: base (centro e raios em km) e pico (5,08° S 137,85° L). / Mount Sharp: base (center and radii in km) and peak. */
const SHARP_BASE = { x: 5, y: 5, rx: 45, ry: 37 };
const SHARP_PEAK = { x: 3, y: 19 };

export class GaleMapOverlay {
  private layer: ScreenLayer;
  private visible = false;
  private clock = 0;
  private evaBase?: HTMLCanvasElement;
  /** Alvo e visitados quando o HTML foi montado; se mudarem, monta de novo. / Target and visited when the HTML was built; rebuilt if they change. */
  private builtFor = '';
  private galeBase?: HTMLCanvasElement;
  private offLang: () => void;

  constructor(
    private scene: Phaser.Scene,
    private getView: () => GaleMapView | null,
    depth = 50,
  ) {
    this.layer = screenLayer(scene, depth);
    this.offLang = onLangChange(() => {
      if (this.visible) this.build();
    });
  }

  /** Monta o HTML (ao abrir e ao trocar de idioma). / Builds the HTML (on open and on language change). */
  private build(): void {
    const v = this.getView();
    if (!v) return;
    const m = v.map;
    this.builtFor = this.signature(v);
    const pct = (p: Point) => `left:${((p.x + 0.5) / m.width) * 100}%;top:${((p.y + 0.5) / m.height) * 100}%`;
    const tag = (p: Point, text: string, cls = '') => `<span class="gm-tag ${cls}" style="${pct(p)}">${esc(text)}</span>`;
    // Nome dos abrigos em cima, dos alvos embaixo, para não se cobrirem. / Shelter names above, target names below, so they don't overlap.
    const top = (r: Rect): Point => ({ x: r.x + (r.w - 1) / 2, y: r.y - 0.5 });
    const tags = [
      tag(top(m.habitat), t('poi.home.name'), 'safe up'),
      tag(top(m.rover), t('galeMap.rover'), 'safe up'),
      ...m.pois.map((p) => tag({ x: p.x, y: p.y + 0.8 }, t(`poi.${p.id}.name` as TextKey), v.visited.has(p.id) ? 'done' : '')),
      // Extras: o nome aparece depois de encontrar. / Extras: the name shows once found.
      ...m.secrets.map((q) => tag({ x: q.x, y: q.y + 0.8 }, v.found.has(q.id) ? t(`guide.${q.id}.title` as TextKey) : t('galeMap.extraUnknown'), 'extra')),
    ].join('');
    const key = (cls: string, text: string, wide = false) => `<li${wide ? ' class="wide"' : ''}><i class="gm-k ${cls}"></i>${esc(text)}</li>`;
    this.layer.set(`<div class="ov gmap">
      <div class="gh">${esc(t('galeMap.title'))}<span>${esc(t('galeMap.close'))}</span></div>
      <div class="gm-body">
        <div class="gm-eva"><canvas class="gm-c" width="${m.width * K}" height="${m.height * K}"></canvas>${tags}<span class="gm-tag you" hidden>${esc(t('galeMap.you'))}</span><span class="gm-tag tatu" hidden>TATU</span></div>
        <div class="gm-side">
          <div class="gm-sub">${esc(t('galeMap.inGale'))}</div>
          <div class="gm-gale"><canvas class="gm-g" width="${GS}" height="${GS}"></canvas><span class="gm-n">${esc(t('galeMap.north'))}</span><span class="gm-ms">${esc(t('galeMap.mountSharp'))}</span></div>
        </div>
      </div>
      <ul class="gm-legend">
        ${key('target', `${t('galeMap.target')}: ${v.targetName}`, true)}
        ${key('you', t('galeMap.you'))}${key('tatu', 'TATU')}${key('safe', t('galeMap.shelter'))}
        ${key('todo', t('galeMap.todo'))}${key('done', t('galeMap.done'))}${key('extra', t('galeMap.extra'))}
      </ul>
      <div class="gm-foot">${esc(t('galeMap.footer'))}</div>
    </div>`);
    this.draw();
  }

  private signature(v: GaleMapView): string {
    return `${v.targetName}|${[...v.visited].join(',')}|${[...v.found].join(',')}`;
  }

  /** Mapa da EVA reduzido, com as rochas que bloqueiam em destaque (desenhado uma vez). / Scaled-down EVA map, blocking rocks highlighted (drawn once). */
  private makeEvaBase(m: EvaMap): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = m.width * K;
    c.height = m.height * K;
    const g = c.getContext('2d')!;
    if (this.scene.textures.exists(MAP_TEXTURE)) {
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = 'high';
      g.drawImage(this.scene.textures.get(MAP_TEXTURE).getSourceImage() as CanvasImageSource, 0, 0, c.width, c.height);
    }
    // As rochas grandes são sprites à parte, fora da textura: marca as rochas com pontinhos discretos.
    // Boulders are separate sprites, not in the texture: rocks get subtle dots.
    g.fillStyle = 'rgba(26,13,11,.45)';
    for (let y = 0; y < m.height; y++)
      for (let x = 0; x < m.width; x++) if (m.tileAt(x, y) === TILE.rock) g.fillRect(x * K + 1, y * K + 1, K - 2, K - 2);
    return c;
  }

  /** Cratera Gale em pixel art, no mesmo estilo do protótipo (desenhada uma vez). / Gale Crater in pixel art, prototype style (drawn once). */
  private makeGaleBase(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = c.height = GS;
    const g = c.getContext('2d')!;
    const R = GALE_CRATER_DIAMETER_KM / 2 / KM_PX, mid = GS / 2;
    const img = g.createImageData(GS, GS);
    const put = (i: number, col: number) => {
      img.data[i * 4] = (col >> 16) & 255;
      img.data[i * 4 + 1] = (col >> 8) & 255;
      img.data[i * 4 + 2] = col & 255;
      img.data[i * 4 + 3] = 255;
    };
    for (let y = 0; y < GS; y++)
      for (let x = 0; x < GS; x++) {
        const dx = x + 0.5 - mid, dy = y + 0.5 - mid, r = Math.hypot(dx, dy), n = vn(x / 4, y / 4, 91) - 0.5;
        let col: number;
        if (r > R + 5) col = n > 0.1 ? 0x5a2a1a : 0x4f2416;
        else if (r > R - 4) {
          const lit = (-dx - dy) / (r || 1);
          col = lit > 0.35 ? 0xd68a52 : lit < -0.35 ? 0x6e3019 : 0xa85a32;
        } else {
          col = n > 0.15 ? 0x7a3a20 : 0x70341d;
          // Monte Sharp: camadas que sobem da base até o pico. / Mount Sharp: layers rising from the base to the peak.
          const kx = dx * KM_PX, ky = -dy * KM_PX;
          const level = (e: number) => {
            const cx = SHARP_BASE.x + (SHARP_PEAK.x - SHARP_BASE.x) * e, cy = SHARP_BASE.y + (SHARP_PEAK.y - SHARP_BASE.y) * e;
            const s = 1 - e * 0.85;
            return ((kx - cx) / (SHARP_BASE.rx * s)) ** 2 + ((ky - cy) / (SHARP_BASE.ry * s)) ** 2 < 1 + n * 0.5;
          };
          let k = -1;
          for (let i = 0; i < 5; i++) if (level(i / 5)) k = i;
          if (k >= 0) col = MS_PALETTE[k];
        }
        put(y * GS + x, col);
      }
    g.putImageData(img, 0, 0);
    const toPx = (p: Point) => ({ x: Math.round(mid + p.x / KM_PX), y: Math.round(mid - p.y / KM_PX) });
    // Peace Vallis desce da borda noroeste até o leque perto do pouso. / Peace Vallis runs from the northwest rim to the fan near the landing site.
    g.fillStyle = '#4a2216';
    for (let s = 0; s <= 1; s += 0.02) {
      const p = toPx({ x: -48 + s * 22 + Math.sin(s * 8) * 2, y: 62 - s * 9 });
      g.fillRect(p.x, p.y, 1, 1);
    }
    g.fillStyle = '#b8703f';
    for (let i = 0; i < 14; i++) {
      const p = toPx({ x: -26 + (hash(i, 1, 93) - 0.5) * 7, y: 53 + (hash(i, 2, 93) - 0.5) * 4 });
      g.fillRect(p.x, p.y, 1, 1);
    }
    // Área da EVA (onde ficam os lugares reais). / EVA area (where the real sites are).
    const xs = SITES.map((s) => toPx(s.km).x), ys = SITES.map((s) => toPx(s.km).y);
    const x0 = Math.min(...xs) - 3, y0 = Math.min(...ys) - 3, x1 = Math.max(...xs) + 3, y1 = Math.max(...ys) + 3;
    g.strokeStyle = COL.suit;
    g.lineWidth = 1;
    g.strokeRect(x0 + 0.5, y0 + 0.5, x1 - x0, y1 - y0);
    for (const s of SITES) {
      const p = toPx(s.km);
      g.fillStyle = COL.ink;
      g.fillRect(p.x - 1, p.y - 1, 3, 3);
      g.fillStyle = s.id === 'home' ? COL.safe : COL.signal;
      g.fillRect(p.x, p.y, 1, 1);
    }
    return c;
  }

  /**
   * Onde a Ana estaria na cratera: mistura os lugares reais pelo inverso da distância aos pontos do jogo.
   * Em cima de um alvo, cai exatamente no lugar real dele.
   * Where Ana would be in the crater: blends the real sites by inverse distance to the game spots.
   * On top of a target, it lands exactly on its real site.
   */
  private toGale(v: GaleMapView, p: Point): Point {
    const m = v.map;
    const game: Record<string, Point> = { home: { x: m.habitat.x + 1, y: m.habitat.y + 1 } };
    for (const q of m.pois) game[q.id] = q;
    let sx = 0, sy = 0, sw = 0;
    for (const s of SITES) {
      const gp = game[s.id];
      if (!gp) continue;
      const d2 = (p.x - gp.x) ** 2 + (p.y - gp.y) ** 2;
      if (d2 < 1e-6) return s.km;
      const w = 1 / d2;
      sx += s.km.x * w;
      sy += s.km.y * w;
      sw += w;
    }
    return sw ? { x: sx / sw, y: sy / sw } : SITES[0].km;
  }

  /** Redesenha os marcadores (a cada quadro, com o mapa aberto). / Redraws the markers (each frame, while open). */
  private draw(): void {
    const v = this.getView();
    const ec = this.layer.find<HTMLCanvasElement>('.gm-c'), gc = this.layer.find<HTMLCanvasElement>('.gm-g');
    if (!v || !ec || !gc) return;
    const m = v.map;
    this.evaBase ??= this.makeEvaBase(m);
    this.galeBase ??= this.makeGaleBase();
    const blink = (this.clock * 2) % 1 < 0.6, pulse = (this.clock * 1.4) % 1;

    // ---- mapa da EVA / EVA map
    const g = ec.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    g.drawImage(this.evaBase, 0, 0);
    const px = (x: number) => Math.round(x * K + K / 2);
    const box = (x: number, y: number, s: number, fill: string, edge = COL.ink) => {
      g.fillStyle = edge;
      g.fillRect(px(x) - s / 2 - 1, px(y) - s / 2 - 1, s + 2, s + 2);
      g.fillStyle = fill;
      g.fillRect(px(x) - s / 2, px(y) - s / 2, s, s);
    };
    // Pedaço que aparece na tela. / Part shown on screen.
    g.strokeStyle = 'rgba(247,234,216,.55)';
    g.lineWidth = 1;
    g.strokeRect(Math.round(v.view.x * K) + 0.5, Math.round(v.view.y * K) + 0.5, Math.round(v.view.w * K), Math.round(v.view.h * K));
    // Abrigos. / Shelters.
    for (const r of [m.habitat, m.rover]) {
      g.fillStyle = COL.ink;
      g.fillRect(r.x * K - 1, r.y * K - 1, r.w * K + 2, r.h * K + 2);
      g.fillStyle = COL.safe;
      g.fillRect(r.x * K, r.y * K, r.w * K, r.h * K);
      g.fillStyle = COL.ink;
      g.fillRect(r.x * K + 2, r.y * K + 2, r.w * K - 4, r.h * K - 4);
      g.fillStyle = COL.safe;
      g.fillRect(r.x * K + 4, r.y * K + 4, r.w * K - 8, r.h * K - 8);
    }
    // Linha tracejada da Ana até o alvo atual. / Dashed line from Ana to the current target.
    const tx = px(v.target.x), ty = px(v.target.y), ax = px(v.player.x), ay = px(v.player.y);
    const len = Math.hypot(tx - ax, ty - ay);
    g.fillStyle = COL.suit;
    for (let d = 6; d < len - 6; d += 4) if (((d / 4) | 0) % 2 === 0) g.fillRect(Math.round(ax + ((tx - ax) * d) / len), Math.round(ay + ((ty - ay) * d) / len), 2, 2);
    // Alvos: visitado (areia, com tripé), atual (azul, anel que abre) e a visitar (vazado). / Targets: visited, current and still to visit.
    for (const q of m.pois) {
      const cur = Math.abs(q.x - v.target.x) < 0.5 && Math.abs(q.y - v.target.y) < 0.5 && !v.visited.has(q.id);
      if (v.visited.has(q.id)) box(q.x, q.y, 5, COL.sand);
      else if (cur) {
        const r = 4 + pulse * 7;
        g.strokeStyle = `rgba(247,234,216,${1 - pulse})`;
        g.strokeRect(px(q.x) - r + 0.5, px(q.y) - r + 0.5, r * 2, r * 2);
        box(q.x, q.y, 7, COL.signal);
        g.fillStyle = COL.ink;
        g.fillRect(px(q.x) - 1, px(q.y) - 1, 2, 2);
      } else {
        box(q.x, q.y, 6, COL.ink, COL.signal);
      }
    }
    // Alvo atual que não é um ponto (abrigo no evento solar, ou o habitat na volta). / Current target that isn't a point (shelter or habitat).
    if (!m.pois.some((q) => Math.abs(q.x - v.target.x) < 0.5 && Math.abs(q.y - v.target.y) < 0.5)) {
      const r = 8 + pulse * 7;
      g.strokeStyle = `rgba(247,234,216,${1 - pulse})`;
      g.strokeRect(px(v.target.x + 1) - r + 0.5, px(v.target.y + 1) - r + 0.5, r * 2, r * 2);
    }
    // Extras: losango vazado até encontrar, cheio depois. / Extras: hollow diamond until found, filled afterwards.
    for (const q of m.secrets) {
      const cx = px(q.x), cy = px(q.y), f = v.found.has(q.id);
      for (let i = -3; i <= 3; i++) {
        const w = 3 - Math.abs(i);
        g.fillStyle = COL.ink;
        g.fillRect(cx - w - 1, cy + i, w * 2 + 3, 1);
        g.fillStyle = COL.extra;
        if (f || Math.abs(i) === 3 || w === 0) g.fillRect(cx - w, cy + i, w * 2 + 1, 1);
        else {
          g.fillRect(cx - w, cy + i, 1, 1);
          g.fillRect(cx + w, cy + i, 1, 1);
        }
      }
    }
    // Redemoinho, Ana (piscando) e o Tatu por cima, para nunca sumir atrás dela. / Dust devil, Ana (blinking) and the Tatu on top, so it never hides behind her.
    if (v.devil) box(v.devil.x, v.devil.y, 4, COL.sand, COL.dark);
    if (blink) {
      box(v.player.x, v.player.y, 8, COL.signal);
      g.fillStyle = COL.ink;
      g.fillRect(ax - 2, ay - 2, 4, 4);
    } else box(v.player.x, v.player.y, 8, COL.ink, COL.signal);
    const same = Math.abs(v.tatu.x - v.player.x) < 1.5 && Math.abs(v.tatu.y - v.player.y) < 1.5;
    // Colado na Ana, o Tatu fica um pouco de lado para os dois aparecerem. / Right next to Ana, the Tatu shifts a bit so both show.
    const tpos = same ? { x: v.player.x + 1.8, y: v.player.y + 1.2 } : v.tatu;
    box(tpos.x, tpos.y, 6, COL.tatu);
    const place = (sel: string, p: Point) => {
      const el = this.layer.find(sel);
      if (!el) return;
      el.hidden = false;
      el.style.left = `${((p.x + 0.5) / m.width) * 100}%`;
      el.style.top = `${((p.y + 0.5) / m.height) * 100}%`;
    };
    place('.gm-tag.you', v.player);
    place('.gm-tag.tatu', tpos);

    // ---- Cratera Gale / Gale Crater
    const h = gc.getContext('2d')!;
    h.imageSmoothingEnabled = false;
    h.drawImage(this.galeBase, 0, 0);
    const kp = this.toGale(v, v.player), gx = Math.round(GS / 2 + kp.x / KM_PX), gy = Math.round(GS / 2 - kp.y / KM_PX);
    h.fillStyle = blink ? COL.signal : COL.ink;
    h.fillRect(gx - 2, gy - 2, 5, 5);
    h.fillStyle = blink ? COL.ink : COL.signal;
    h.fillRect(gx - 1, gy - 1, 3, 3);
  }

  update(dt: number): void {
    if (!this.visible) return;
    this.clock += dt;
    const v = this.getView();
    if (v && this.signature(v) !== this.builtFor) return this.build();
    this.draw();
  }

  show(): void {
    if (this.visible) return;
    this.visible = true;
    this.clock = 0;
    this.build();
  }

  hide(): void {
    this.visible = false;
    this.layer.set('');
  }

  isVisible(): boolean {
    return this.visible;
  }

  destroy(): void {
    this.offLang();
    this.layer.set('');
  }
}
