/**
 * Guia de Campo: as 12 entradas, com página do diário, foto real da NASA, dado real, lição e fonte.
 * Field Guide: the 12 entries, with diary page, real NASA photo, real fact, lesson and source.
 *
 * Abre com G na EVA e pelo botão VER GUIA no Final. ◀ ▶ trocam de entrada, ▲ ▼ rolam o texto, A/B/G fecham.
 * Opens with G in the EVA and from the VIEW GUIDE button on the Ending. ◀ ▶ switch entries, ▲ ▼ scroll, A/B/G close.
 *
 * Uso / Usage:
 *   const guide = new FieldGuide(scene);
 *   guide.open(() => ...);          // ao fechar / on close
 *   if (guide.handles(action)) return;
 */
import * as Phaser from 'phaser';
import { onLangChange, t, type TextKey } from '../i18n/i18n';
import type { Action, Dir } from './controls';
import { GUIDE, GUIDE_TOTAL, guideCount, guideKey, hasGuide } from './guideEntries';
import { pixelArrows } from './arrows';
import { esc, screenLayer, type ScreenLayer } from './Screen';
import { assetUrl } from './UiText';

export class FieldGuide {
  private layer: ScreenLayer;
  private sel = 0;
  private onClose?: () => void;

  constructor(scene: Phaser.Scene, depth = 40) {
    this.layer = screenLayer(scene, depth);
    this.layer.root.hidden = true;
    const off = onLangChange(() => this.isOpen && this.render());
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, off);
  }

  get isOpen(): boolean {
    return !this.layer.root.hidden;
  }

  /** Abre na última entrada vista. / Opens on the last entry seen. */
  open(onClose?: () => void): void {
    this.onClose = onClose;
    this.layer.root.hidden = false;
    this.render();
  }

  close(): void {
    if (!this.isOpen) return;
    this.layer.root.hidden = true;
    this.layer.set('');
    const cb = this.onClose;
    this.onClose = undefined;
    cb?.();
  }

  /** Com o guia aberto, ele consome as ações. / While open, the guide consumes actions. */
  handles(action: Action): boolean {
    if (!this.isOpen) return false;
    if (action === 'A' || action === 'B' || action === 'guide') this.close();
    return true;
  }

  /** Direção apertada: ◀ ▶ troca a entrada, ▲ ▼ rola. / Direction pressed: ◀ ▶ switch entry, ▲ ▼ scroll. */
  handlesDir(dir: Dir): boolean {
    if (!this.isOpen) return false;
    if (dir === 'left' || dir === 'right') {
      this.sel = (this.sel + (dir === 'left' ? GUIDE_TOTAL - 1 : 1)) % GUIDE_TOTAL;
      this.render();
    } else {
      const body = this.layer.find('.gbody');
      body?.scrollBy({ top: dir === 'up' ? -14 : 14 });
    }
    return true;
  }

  private render(): void {
    const entry = GUIDE[this.sel];
    const has = hasGuide(entry.id);
    let extraN = 0;
    const list = GUIDE.map((g, k) => {
      const label = g.extra ? `E${++extraN}` : String(k + 1);
      const got = hasGuide(g.id);
      const cls = [got && 'got', k === this.sel && 'sel', g.extra && 'ex'].filter(Boolean).join(' ');
      const aria = got ? t(guideKey(g.id, 'title')) : t('guide.ui.locked');
      return `<button data-g="${k}" class="${cls}" aria-label="${esc(aria)}">${label}</button>`;
    }).join('');

    let body: string;
    if (has) {
      const caption = entry.photo ? t(`photo.${entry.id}.caption` as TextKey) : '';
      const photo = entry.photo
        ? `<figure><img src="${assetUrl(`assets/guide/${entry.photo}.jpg`)}" alt="${esc(t('guide.ui.photoAlt') + caption)}"><figcaption>${esc(`${t('guide.ui.realPhoto')} · ${caption} · ${t('guide.ui.credit')}`)}</figcaption></figure>`
        : '';
      body = `<h3>${esc(t(guideKey(entry.id, 'title')))}</h3>${photo}
        <p class="diary">${esc(t(`diary.${entry.id}` as TextKey))}</p>
        <p><span class="tag">${esc(t('guide.ui.realData'))}</span> ${esc(t(guideKey(entry.id, 'body')))}</p>
        <p class="lesson">${esc(t(guideKey(entry.id, 'lesson')))}</p>
        <p class="src">${esc(t(guideKey(entry.id, 'src')))}</p>`;
    } else {
      body = `<h3>???</h3><p class="locked">${esc(t(entry.extra ? 'guide.ui.lockedExtra' : 'guide.ui.lockedRoute'))}</p>`;
    }

    this.layer.set(`<div class="ov guide" role="dialog" aria-label="${esc(t('guide.ui.title'))}">
      <div class="gh">${esc(t('guide.ui.title'))}<span>${guideCount().total}/${GUIDE_TOTAL}</span></div>
      <div class="glist">${list}</div>
      <div class="gbody">${body}</div>
      <div class="gfoot">${pixelArrows(esc(t('guide.ui.foot')))}</div>
    </div>`);
    this.layer.root.querySelectorAll<HTMLButtonElement>('[data-g]').forEach((bt) =>
      bt.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sel = Number(bt.dataset.g);
        this.render();
      }),
    );
    // A rolagem do texto funciona com o dedo. / The text scrolls with a finger.
    const gbody = this.layer.find('.gbody');
    if (gbody) gbody.style.pointerEvents = 'auto';
  }
}
