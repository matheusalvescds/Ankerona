/**
 * Viagem: a nave deixa a Terra rumo a Marte, com diálogos de bordo e um alerta de tempestade solar.
 * Travel: the ship leaves Earth for Mars, with onboard dialogue and a solar storm alert.
 *
 * Conforme os diálogos avançam, a Terra fica para trás e Marte cresce. A ou B avança o texto.
 * As the dialogue moves on, Earth falls behind and Mars grows. A or B advances the text.
 */
import * as Phaser from 'phaser';
import { PALETTE_HEX, SCENES } from '../config';
import { DialogBox, type Line } from '../ui/DialogBox';
import { onAction } from '../ui/controls';
import { ART } from './art';
import { P, drawStars, vignette } from './pixelArt';
import { playMusic } from '../audio/audio';

export class TravelScene extends Phaser.Scene {
  private dlg!: DialogBox;
  private bg!: Phaser.GameObjects.Image;
  private mars!: Phaser.GameObjects.Image;
  private ship!: Phaser.GameObjects.Sprite;
  private stars!: Phaser.GameObjects.Graphics;
  private fx!: Phaser.GameObjects.Graphics;
  private clock = 0;
  private lineIndex = 0;
  private flash = 0;

  constructor() {
    super(SCENES.travel);
  }

  create(): void {
    playMusic(this, 'prologo');
    this.clock = 0;
    this.lineIndex = 0;
    this.flash = 0;
    this.cameras.main.setBackgroundColor(P[0]);
    this.bg = this.add.image(0, 0, ART.bgSpace).setOrigin(0);
    this.stars = this.add.graphics();
    this.mars = this.add.image(0, 0, ART.mars).setOrigin(0);
    this.ship = this.add.sprite(46, 22, ART.ship, 1).setOrigin(0);
    this.fx = this.add.graphics();
    this.dlg = new DialogBox(this);

    const LOG = 'who.log', CMD = 'who.commander', GUIDE = 'who.guide';
    const lines: Line[] = [
      { who: LOG, text: 'travel.0' },
      { who: LOG, text: 'travel.1' },
      { who: CMD, text: 'travel.2', alert: true, onShow: () => (this.flash = 2.5) },
      { who: GUIDE, text: 'travel.3', guide: 'cruise' },
      { who: LOG, text: 'travel.4' },
      { who: CMD, text: 'travel.5' },
    ];
    const total = lines.length;
    this.dlg.say(
      lines.map((l, i) => ({ ...l, onShow: () => ((this.lineIndex = i / (total - 1)), l.onShow?.()) })),
      () => this.scene.start(SCENES.landing),
    );
    onAction(this, (a) => this.dlg.handles(a));
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(0.05, delta / 1000);
    this.clock += dt;
    if (this.flash > 0) this.flash -= dt;
    const T = this.clock, pr = this.lineIndex;

    // A Terra (no fundo) desliza para a esquerda. / Earth (in the background) slides to the left.
    const bx = Math.round(-pr * 70);
    this.bg.setX(bx);
    this.stars.clear();
    drawStars(this.stars, T, T * 10, bx + 42); // estrelas só no espaço aberto / stars only over open space

    const ms = Math.round(10 + pr * 40);
    this.mars.setDisplaySize(ms, ms).setPosition(Math.round(148 - pr * 20 - ms / 2), Math.round(34 - ms / 2));

    // Motor pisca; de vez em quando acendem as janelas. / Engine flickers; now and then the windows light up.
    this.ship.setFrame(((T / 2.5) | 0) % 4 === 3 ? 3 : 1 + (((T * 8) | 0) % 2)).setY(22 + Math.round(Math.sin(T * 2)));

    this.fx.clear();
    if (this.flash > 0) vignette(this.fx, PALETTE_HEX.alert, 0.45 + 0.35 * Math.sin(T * 10));
  }
}
