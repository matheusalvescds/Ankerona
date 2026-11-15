/**
 * Epílogo: carta à próxima tripulação sobre o pôr do sol azul, depois o logo e o resumo da missão.
 * Epilogue: letter to the next crew over the blue sunset, then the logo and the mission summary.
 *
 * A ou B adianta as animações. VER GUIA (ou G) abre o Guia de Campo. JOGAR DE NOVO volta ao título.
 * A or B fast-forwards the animations. VIEW GUIDE (or G) opens the Field Guide. PLAY AGAIN goes back to the title.
 *
 * Os números do resumo virão do estado da partida (Miguel); por enquanto chegam pelos dados da cena.
 * Summary numbers will come from the game state (Miguel); for now they arrive as scene data.
 */
import * as Phaser from 'phaser';
import { SCENES } from '../config';
import { getLang, onLangChange, t } from '../i18n/i18n';
import { onAction, onDirPress } from '../ui/controls';
import { FieldGuide } from '../ui/FieldGuide';
import { GUIDE_TOTAL, guideCount } from '../ui/guideEntries';
import { esc, screenLayer, type ScreenLayer } from '../ui/Screen';
import { assetUrl } from '../ui/UiText';
import { ART } from './art';
import { playMusic } from '../audio/audio';

export interface EndingData {
  /** Sem estes dois, conta pelo Guia registrado. / Without these two, counts from the recorded Guide. */
  guide?: number; // entradas do Guia / Guide entries
  extras?: number; // extras encontradas / extras found
  clock?: string; // ex.: "SOL 1 13:40"
}

const LOGOS = { pt: 'assets/sprites/11_Logo/logo_ankerona_pt.png', en: 'assets/sprites/11_Logo/logo_ankerona_en.png' } as const;

export class EndingScene extends Phaser.Scene {
  private layer!: ScreenLayer;
  private guide!: FieldGuide;
  private info: EndingData = {};
  private fast = false;

  constructor() {
    super(SCENES.ending);
  }

  init(data: EndingData): void {
    this.info = data ?? {};
    this.fast = false;
  }

  create(): void {
    playMusic(this, 'menu');
    this.add.image(0, 0, ART.bgEnd).setOrigin(0);
    this.layer = screenLayer(this);
    this.guide = new FieldGuide(this, 40);
    this.render();
    onDirPress(this, (d) => this.guide.handlesDir(d));
    onAction(this, (a) => {
      if (this.guide.handles(a)) return;
      if (a === 'guide') return this.openGuide();
      // Com tudo na tela, A joga de novo (para quem usa só o teclado). / With everything shown, A plays again (keyboard only).
      if (a === 'A' && this.fast) this.scene.start(SCENES.title);
      else if (a === 'A' || a === 'B') this.skip();
    });
    // Ao trocar o idioma, mostra tudo de uma vez no novo idioma. / On language switch, show everything at once.
    const off = onLangChange(() => ((this.fast = true), this.render()));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, off);
  }

  private render(): void {
    const d = this.info;
    const count = guideCount();
    const stats = [`${t('ending.guide')} ${d.guide ?? count.total}/${GUIDE_TOTAL}`, `EXTRAS ${d.extras ?? count.extras}/3`];
    if (d.clock) stats.push(d.clock);
    const alt = `${t('meta.title')}. ${t('title.tagline')}`;
    this.layer.set(`<div class="ov end${this.fast ? ' fast' : ''}">
      <div class="ep ep1">
        <p style="animation-delay:2.8s">${esc(t('ending.l0'))}</p>
        <p style="animation-delay:4.8s">${esc(t('ending.l1'))}</p>
        <p style="animation-delay:7s">${esc(t('ending.l2'))}</p>
      </div>
      <div class="ep ep2"><div class="fin">${esc(t('ending.fin'))}</div></div>
      <div class="ep ep3">
        <img src="${assetUrl(LOGOS[getLang()])}" alt="${esc(alt)}">
        <div class="stats">${esc(stats.join(' · '))}</div>
        <div class="acts"><button class="view">${esc(t('ending.viewGuide'))}</button><button class="again">${esc(t('ending.again'))}</button></div>
      </div>
      <span class="skipe">${esc(t('ui.skipA'))}</span>
    </div>`);
    this.layer.find('.view')!.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.openGuide();
    });
    this.layer.find('.again')!.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.scene.start(SCENES.title);
    });
  }

  /** Abre o guia já com o resumo todo na tela. / Opens the guide with the whole summary on screen. */
  private openGuide(): void {
    this.skip();
    this.guide.open();
  }

  private skip(): void {
    if (this.fast) return;
    this.fast = true;
    this.layer.find('.ov')?.classList.add('fast');
  }
}
