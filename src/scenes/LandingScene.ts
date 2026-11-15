/**
 * Pouso: os "7 minutos de terror", com contagem, fases e velocidade.
 * Landing: the "7 minutes of terror", with countdown, phases and speed.
 *
 * O Matheus vai redesenhar esta tela; por enquanto segue o protótipo. A acelera até o pouso.
 * Matheus will redesign this screen; for now it follows the prototype. A skips ahead to touchdown.
 */
import * as Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENES } from '../config';
import { formatNumber, onLangChange, t, type TextKey } from '../i18n/i18n';
import { onAction } from '../ui/controls';
import { esc, screenLayer, type ScreenLayer } from '../ui/Screen';
import { ART } from './art';
import { drawStars } from './pixelArt';
import { playMusic } from '../audio/audio';

const DUR = 9; // segundos da animação / animation seconds
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const HAZE = [0xa8, 0x5a, 0x32]; // céu de Marte perto do chão / Martian sky near the ground
const INK = [0x1a, 0x0d, 0x0b];

/** Fase e velocidade em cada instante (valores do protótipo). / Phase and speed at each moment (prototype values). */
function phaseAt(t: number): { key: TextKey; speed: number } {
  if (t < 2.6) return { key: 'landing.phase.heat', speed: 21000 - (21000 - 1500) * (t / 2.6) };
  if (t < 5.2) return { key: 'landing.phase.chute', speed: 1500 - (1500 - 300) * ((t - 2.6) / 2.6) };
  if (t < 7.8) return { key: 'landing.phase.powered', speed: 300 - 297 * ((t - 5.2) / 2.6) };
  return { key: 'landing.phase.landed', speed: 0 };
}

export class LandingScene extends Phaser.Scene {
  private layer!: ScreenLayer;
  private sky!: Phaser.Textures.CanvasTexture;
  private stars!: Phaser.GameObjects.Graphics;
  private horizon!: Phaser.GameObjects.Image;
  private ground!: Phaser.GameObjects.Image;
  private capsule!: Phaser.GameObjects.Sprite;
  private t = 0;
  private clock = 0;
  private done = false;

  constructor() {
    super(SCENES.landing);
  }

  create(): void {
    playMusic(this, 'prologo');
    this.t = 0;
    this.clock = 0;
    this.done = false;
    if (!this.textures.exists('landing-sky')) this.textures.createCanvas('landing-sky', GAME_WIDTH, GAME_HEIGHT);
    this.sky = this.textures.get('landing-sky') as Phaser.Textures.CanvasTexture;
    this.add.image(0, 0, 'landing-sky').setOrigin(0);
    this.stars = this.add.graphics();
    this.horizon = this.add.image(0, 0, ART.marsHorizon).setOrigin(0);
    this.ground = this.add.image(0, 0, ART.edlGround).setOrigin(0);
    this.capsule = this.add.sprite(60, 0, ART.edl, 0).setOrigin(0);

    this.layer = screenLayer(this);
    this.render();
    onAction(this, (a) => {
      if (a === 'A') this.t = Math.max(this.t, 8.6);
    });
    const off = onLangChange(() => this.render());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, off);
  }

  private render(): void {
    this.layer.set(
      `<div class="ov edl"><span class="hd">${esc(t('landing.title'))}</span><span class="clock">7:00</span><span class="ph">${esc(t('landing.phase.entry'))}</span><span class="v">${esc(t('landing.speed', { v: formatNumber(21000) }))}</span><div class="note">${esc(t('landing.note'))}</div></div>`,
    );
    this.updateTexts();
  }

  private updateTexts(): void {
    const left = Math.max(0, 420 * (1 - this.t / DUR));
    const clock = this.layer.find('.clock');
    if (!clock) return;
    clock.textContent = `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`;
    const ph = phaseAt(this.t);
    this.layer.find('.ph')!.textContent = t(ph.key);
    this.layer.find('.v')!.textContent = t('landing.speed', { v: formatNumber(Math.round(ph.speed)) });
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(0.05, delta / 1000);
    this.t += dt;
    this.clock += dt;
    this.updateTexts();
    this.draw();
    if (this.t > DUR + 1.2 && !this.done) {
      this.done = true;
      this.scene.start(SCENES.eva);
    }
  }

  private draw(): void {
    const t = this.t, H = GAME_HEIGHT, W = GAME_WIDTH;
    const air = Math.max(0, Math.min(1, (t - 1.2) / 3.5));
    // Céu: do preto do espaço para a névoa cor de caramelo, em faixas pontilhadas.
    // Sky: from black space to butterscotch haze, in dithered bands.
    const ctx = this.sky.getContext();
    const mix = (k: number) => `rgb(${INK.map((v, n) => Math.round(v + (HAZE[n] - v) * k)).join(',')})`;
    for (let y = 0; y < H; y++) {
      const k = air * Math.pow(y / H, 0.8), b = Math.floor(k * 6) / 6, nb = Math.min(1, b + 1 / 6), f = k * 6 - Math.floor(k * 6);
      ctx.fillStyle = mix(b);
      ctx.fillRect(0, y, W, 1);
      ctx.fillStyle = mix(nb);
      for (let x = y & 1; x < W; x += 2) if (f > BAYER[(y & 3) * 4 + (x & 3)]) ctx.fillRect(x, y, 1, 1);
    }
    this.sky.refresh();

    this.stars.clear();
    if (air < 1) {
      this.stars.setAlpha(1 - air);
      drawStars(this.stars, this.clock);
    }

    this.horizon.setVisible(t < 2.6).setY(H - Math.round(20 + t * 9));
    const gy = Math.round(H - Math.min(72, Math.max(0, t - 2.2) * 11));
    this.ground.setVisible(t >= 2.2).setY(gy);

    const tick = ((this.clock * 8) | 0) % 2;
    // Quadros: plasma 1-2, paraquedas, escudo solto, retrofoguetes 1-2, pousada. / Frames: plasma, chute, shield off, retros, landed.
    const frame = t < 2.6 ? tick : t < 4.6 ? 2 : t < 5.2 ? 3 : t < 7.8 ? 4 + tick : 6;
    const bottom = t >= 7.8 ? gy + 60 : Math.min(gy + 60, 70 + t * 6);
    this.capsule.setFrame(frame).setY(Math.round(bottom) - 46);
  }
}
