/**
 * Boot: carrega a arte do Matheus e espera as fontes antes de desenhar qualquer texto.
 * Boot: loads Matheus's art and waits for the web fonts before drawing any text.
 *
 * Modo de teste: ?cena=... na URL vai direto para uma etapa (como o painel "pular para" do protótipo).
 * Test mode: ?cena=... in the URL jumps straight to a step (like the prototype's "jump to" panel).
 *   ?cena=teaser | viagem | pouso | eva | dunas | solar | boxwork | retorno | final
 *   (solar: começa o evento de partículas solares nas dunas / starts the solar particle event at the dunes)
 *   Na EVA, &x=..&y=.. coloca a Ana num tile, para conferir a arte. / In the EVA, &x=..&y=.. puts Ana on a tile, to check the art.
 *   Na EVA, &hora=16 começa às 16h, para testar a noite. / In the EVA, &hora=16 starts at 16:00, to test the night.
 * Depois esse atalho fica escondido na versão publicada. / Later this shortcut gets hidden in the published build.
 */
import * as Phaser from 'phaser';
import { FONTS, PALETTE, SCENES } from '../config';
import { t } from '../i18n/i18n';
import { GUIDE, resetGuide, unlockGuide } from '../ui/guideEntries';
import { uiText } from '../ui/UiText';
import { preloadArt } from './art';
import { preloadAudio } from '../audio/audio';

/** Atalhos do modo de teste. / Test-mode shortcuts. */
const JUMPS: Record<string, [string, object?]> = {
  teaser: [SCENES.teaser],
  viagem: [SCENES.travel],
  pouso: [SCENES.landing],
  eva: [SCENES.eva],
  dunas: [SCENES.eva, { step: 1, pos: { x: 30, y: 50 } }],
  solar: [SCENES.eva, { step: 2, pos: { x: 50, y: 34 } }],
  boxwork: [SCENES.eva, { step: 3, pos: { x: 76, y: 22 } }],
  retorno: [SCENES.eva, { step: 4, pos: { x: 82, y: 12 } }],
  final: [SCENES.ending],
};

export class BootScene extends Phaser.Scene {
  private loading?: Phaser.GameObjects.DOMElement;

  constructor() {
    super(SCENES.boot);
  }

  preload(): void {
    this.loading = uiText(this, 80, 72, t('ui.loading'), { size: 6, color: PALETTE.sand });
    preloadArt(this);
    preloadAudio(this);
  }

  create(): void {
    // Texto do Phaser é desenhado em canvas: a fonte precisa estar pronta antes.
    // Phaser text is drawn on a canvas: the font must be ready first.
    const fonts = [`8px ${FONTS.pixel}`, `16px ${FONTS.term}`];
    const timeout = new Promise((resolve) => setTimeout(resolve, 3000)); // se a fonte falhar, segue com a reserva / if a font fails, continue with the fallback
    Promise.race([Promise.all(fonts.map((f) => document.fonts.load(f))), timeout]).finally(() => {
      this.loading?.destroy();
      const q = new URLSearchParams(location.search);
      const name = q.get('cena') ?? '';
      const jump = JUMPS[name];
      if (jump && jump[0] === SCENES.eva && q.has('x') && q.has('y')) jump[1] = { ...jump[1], pos: { x: Number(q.get('x')), y: Number(q.get('y')) } };
      if (jump && jump[0] === SCENES.eva && q.has('hora')) jump[1] = { ...jump[1], hour: Number(q.get('hora')) };
      resetGuide();
      // No final de teste, o Guia vem completo. / On the test ending, the Guide comes complete.
      if (name === 'final') GUIDE.forEach((g) => unlockGuide(g.id));
      if (jump) this.scene.start(jump[0], jump[1]);
      else this.scene.start(SCENES.title);
    });
  }
}
