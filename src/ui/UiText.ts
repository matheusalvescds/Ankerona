/**
 * Texto de interface desenhado pelo navegador (HTML), por cima do canvas.
 * Interface text drawn by the browser (HTML), on top of the canvas.
 *
 * O canvas do jogo tem só 160x144 pixels. Texto desenhado nele fica borrado ou
 * serrilhado quando ampliado. Como no protótipo, títulos, HUD, diálogos e Guia
 * usam HTML: o Phaser posiciona e escala, e o navegador desenha a fonte nítida.
 * The game canvas is only 160x144 pixels. Text drawn on it gets blurry or jagged
 * when scaled up. As in the prototype, titles, HUD, dialogue and Guide use HTML:
 * Phaser positions and scales it, and the browser draws the font crisply.
 *
 * Tamanhos e posições são em pixels do jogo (160x144). / Sizes and positions are in game pixels (160x144).
 */
import * as Phaser from 'phaser';
import { FONTS, PALETTE } from '../config';

export interface UiTextOptions {
  font?: keyof typeof FONTS; // 'pixel' (Press Start 2P) | 'term' (VT323)
  size?: number; // em pixels do jogo / in game pixels
  color?: string;
  align?: 'left' | 'center' | 'right';
  width?: number; // largura máxima para quebrar linha / max width for line wrap
  lineHeight?: number; // multiplicador / multiplier
  className?: string;
}

export function uiText(scene: Phaser.Scene, x: number, y: number, text: string, opts: UiTextOptions = {}): Phaser.GameObjects.DOMElement {
  const el = document.createElement('div');
  el.className = `ui-text ${opts.className ?? ''}`.trim();
  Object.assign(el.style, {
    fontFamily: FONTS[opts.font ?? 'pixel'],
    fontSize: `${opts.size ?? 8}px`,
    lineHeight: String(opts.lineHeight ?? 1.4),
    color: opts.color ?? PALETTE.sand,
    textAlign: opts.align ?? 'center',
    whiteSpace: 'pre-line',
    width: opts.width ? `${opts.width}px` : 'auto',
    userSelect: 'none',
    pointerEvents: 'none',
  } satisfies Partial<CSSStyleDeclaration>);
  el.textContent = text;
  return scene.add.dom(x, y, el);
}

/** Imagem de interface (ex.: logo), nítida em qualquer tela. / Interface image (e.g. logo), crisp on any screen. */
export function uiImage(scene: Phaser.Scene, x: number, y: number, src: string, width: number, alt: string): Phaser.GameObjects.DOMElement {
  const img = document.createElement('img');
  img.className = 'ui-image';
  img.src = src;
  img.alt = alt;
  img.style.width = `${width}px`;
  img.style.display = 'block';
  const obj = scene.add.dom(x, y, img);
  img.addEventListener('load', () => obj.updateSize());
  return obj;
}

/** Caminho de um arquivo em public/, funcionando em qualquer subpasta. / Path to a file in public/, working from any subfolder. */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}

/** Troca o texto mantendo o elemento. / Changes the text, keeping the element. */
export function setUiText(obj: Phaser.GameObjects.DOMElement, text: string): void {
  (obj.node as HTMLElement).textContent = text;
  obj.updateSize();
}

/** Torna o texto clicável (toque ou mouse). / Makes the text clickable (touch or mouse). */
export function makeButton(obj: Phaser.GameObjects.DOMElement, onPress: () => void): Phaser.GameObjects.DOMElement {
  const node = obj.node as HTMLElement;
  node.style.pointerEvents = 'auto';
  node.style.cursor = 'pointer';
  node.setAttribute('role', 'button');
  node.tabIndex = 0;
  node.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    onPress();
  });
  return obj;
}
