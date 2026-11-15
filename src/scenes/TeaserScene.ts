/**
 * Teaser: 8 telas da história da exploração espacial, do sonho à Artemis II.
 * Teaser: 8 screens of space exploration history, from the dream to Artemis II.
 *
 * Igual ao protótipo: cada tela tem retratos esmaecidos que se alternam e um selo com o ano.
 * Entre anos diferentes aparece o contador ("8 ANOS DEPOIS"). No fim, contagem T-3, T-2, T-1, IGNIÇÃO.
 * A avança, B pula para a Viagem.
 * Same as the prototype: each screen has fading portraits and a year stamp.
 * Between different years a counter rolls ("8 YEARS LATER"). At the end, T-3, T-2, T-1, IGNITION.
 * A advances, B skips to the Travel scene.
 *
 * Arte: sprites do Matheus no canvas (ART) e retratos em public/assets/teaser/.
 * Art: Matheus's sprites on the canvas (ART) and portraits in public/assets/teaser/.
 */
import * as Phaser from 'phaser';
import { GAME_WIDTH, SCENES } from '../config';
import { onLangChange, t, type TextKey } from '../i18n/i18n';
import { onAction } from '../ui/controls';
import { esc, screenLayer, type ScreenLayer } from '../ui/Screen';
import { assetUrl } from '../ui/UiText';
import { ART } from './art';
import { P, disc, drawStars, hash, planetTexture } from './pixelArt';
import { playMusic } from '../audio/audio';

type Art = 'intro' | 'ham' | 'orbit' | 'moon' | 'a13' | 'robots' | 'artemis' | 'mars';
type AltKey = `teaser.alt.${string}` & TextKey;

interface Pic {
  file: string;
  alt: AltKey;
}

interface TeaserScreen {
  art: Art;
  lines: number;
  /** Ano numérico para o contador; 'today' = ano atual. / Numeric year for the counter; 'today' = current year. */
  year?: number | 'today';
  pics?: Pic[];
  /** Ilustração de tela cheia com Marte pulsando em (x%, y%). / Full-screen illustration with Mars pulsing at (x%, y%). */
  scene?: Pic & { mars: [number, number] };
  /** Última linha em destaque. / Last line highlighted. */
  bigLast?: boolean;
}

const pic = (file: string, alt: string): Pic => ({ file: `assets/teaser/${file}`, alt: `teaser.alt.${alt}` as AltKey });

const SCREENS: TeaserScreen[] = [
  { art: 'intro', lines: 3, scene: { ...pic('intro.jpg', 'intro'), mars: [64.5, 19.4] } },
  { art: 'ham', lines: 4, year: 1961, pics: [pic('ham.jpg', 'ham')] },
  { art: 'orbit', lines: 3, year: 1961, pics: [pic('shepard.jpg', 'shepard'), pic('glenn.jpg', 'glenn'), pic('ride.jpg', 'ride')] },
  { art: 'moon', lines: 3, year: 1969, pics: [pic('armstrong.jpg', 'armstrong'), pic('aldrin.jpg', 'aldrin'), pic('collins.jpg', 'collins')] },
  { art: 'a13', lines: 4, year: 1970, pics: [pic('lovell.jpg', 'lovell'), pic('swigert.jpg', 'swigert'), pic('haise.jpg', 'haise')] },
  {
    art: 'robots',
    lines: 3,
    year: 1976,
    pics: [pic('viking.jpg', 'viking'), pic('spirit.jpg', 'spirit'), pic('opportunity.jpg', 'opportunity'), pic('curiosity.jpg', 'curiosity'), pic('perseverance.jpg', 'perseverance')],
  },
  {
    art: 'artemis',
    lines: 3,
    year: 'today',
    pics: [pic('artemis_1.jpg', 'artemisCrew'), pic('artemis_2.jpg', 'artemisCrew'), pic('artemis_koch.jpg', 'koch'), pic('artemis_hansen.jpg', 'hansen')],
  },
  { art: 'mars', lines: 2, bigLast: true },
];

const key = (i: number, part: string) => `teaser.${i}.${part}` as TextKey;

/** Quanto tempo cada tela fica, em segundos (fórmula do protótipo). / How long each screen stays, in seconds. */
function duration(s: TeaserScreen): number {
  return 1.4 + s.lines * 0.85 + 3.6 + (s.pics ? (s.pics.length - 1) * 1.8 : 0);
}

function yearOf(s: TeaserScreen): number | null {
  if (s.year === undefined) return null;
  return s.year === 'today' ? new Date().getFullYear() : s.year;
}

export class TeaserScene extends Phaser.Scene {
  private layer!: ScreenLayer;
  private g!: Phaser.GameObjects.Graphics;
  private fx!: Phaser.GameObjects.Graphics;
  private obj: Partial<Record<string, Phaser.GameObjects.Image | Phaser.GameObjects.Sprite>> = {};
  private index = 0;
  private screenT = 0;
  private clock = 0;
  /** Durante transições só aparecem estrelas. / During transitions only stars show. */
  private busy = false;
  /** Cancela transições antigas. / Cancels stale transitions. */
  private token = 0;

  constructor() {
    super(SCENES.teaser);
  }

  create(): void {
    playMusic(this, 'prologo');
    this.index = 0;
    this.clock = 0;
    this.busy = false;
    this.cameras.main.setBackgroundColor(P[0]);
    this.g = this.add.graphics().setDepth(0);
    this.buildArt();
    this.fx = this.add.graphics().setDepth(3);
    this.layer = screenLayer(this);

    onAction(this, (a) => {
      if (a === 'B') return this.goTravel();
      if (a === 'A' && !this.busy) this.next();
    });
    const off = onLangChange(() => !this.busy && this.showScreen(this.index));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, off);

    this.showScreen(0);
  }

  /** Cria os objetos de arte uma vez; o update escolhe quais aparecem. / Creates art objects once; update picks which show. */
  private buildArt(): void {
    const add = (name: string, o: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite) => {
      o.setVisible(false).setDepth(name === 'moonBg' ? 1 : 2);
      this.obj[name] = o;
    };
    add('planetIntro', this.add.image(80, 170, planetTexture(this, 'planet78', 78, P[1], P[2], P[3])));
    add('planetHam', this.add.image(80, 175, planetTexture(this, 'planet72', 72, P[1], P[2], P[3])));
    add('planetRobots', this.add.image(80, 165, planetTexture(this, 'planet92', 92, P[1], P[2], P[3])));
    add('rocket', this.add.sprite(10, 44, ART.rocket, 0).setOrigin(0));
    add('earth', this.add.image(20, 34, ART.earth).setOrigin(0).setDisplaySize(36, 36));
    add('mercury', this.add.sprite(0, 0, ART.mercury, 0).setOrigin(0));
    // A Lua do protótipo aparece espelhada. / The prototype shows the Moon mirrored.
    add('moonBg', this.add.image(0, 0, ART.bgMoon).setOrigin(0).setFlipX(true));
    add('moonSmall', this.add.image(6, 30, ART.moonSmall).setOrigin(0));
    add('apollo13', this.add.sprite(40, 22, ART.apollo13, 0).setOrigin(0));
    add('robotRover', this.add.sprite(30, 56, ART.robotRover, 0).setOrigin(0));
    add('moonLarge', this.add.image(10, 22, ART.moonLarge).setOrigin(0));
    add('orion', this.add.sprite(62, 28, ART.orion, 0).setOrigin(0));
    add('mars', this.add.image(80, 54, ART.mars));
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(0.05, delta / 1000);
    this.clock += dt;
    if (!this.busy) {
      this.screenT += dt;
      if (this.screenT > duration(SCREENS[this.index])) this.next();
    }
    this.drawArt();
  }

  private drawArt(): void {
    const g = this.g, fx = this.fx, s = SCREENS[this.index], tt = this.screenT, T = this.clock;
    g.clear();
    fx.clear();
    for (const o of Object.values(this.obj)) o?.setVisible(false);
    g.fillStyle(P[0]).fillRect(0, 0, GAME_WIDTH, 144);
    if (this.busy) {
      drawStars(g, T);
      return;
    }
    drawStars(g, T, s.art === 'artemis' ? tt * 6 : 0);
    const show = (name: string) => this.obj[name]!.setVisible(true);
    const sprite = (name: string) => show(name) as Phaser.GameObjects.Sprite;

    switch (s.art) {
      case 'intro':
        show('planetIntro');
        break;
      case 'ham': {
        show('planetHam');
        const rt = tt - 1.2;
        const r = sprite('rocket');
        if (rt < 0) r.setFrame(0).setY(44);
        else r.setFrame(rt < 0.5 ? 1 : 2 + ((T * 8) % 2 | 0)).setY(44 - Math.round(rt * rt * 4));
        break;
      }
      case 'orbit': {
        show('earth');
        for (let k = 0; k < 64; k++) {
          const an = (k / 64) * Math.PI * 2;
          fx.fillStyle(k % 2 ? P[2] : P[3]).fillRect(Math.round(38 + Math.cos(an) * 30), Math.round(52 + Math.sin(an) * 10), 1, 1);
        }
        const an = tt * 1.4;
        const ox = Math.round(38 + Math.cos(an) * 30), oy = Math.round(52 + Math.sin(an) * 10);
        // A cápsula some quando passa atrás da Terra. / The capsule hides behind the Earth.
        if (Math.sin(an) > -0.2 || Math.abs(Math.cos(an)) > 0.6) sprite('mercury').setFrame((tt * 3) % 4 | 0).setPosition(ox - 7, oy - 7);
        break;
      }
      case 'moon':
        show('moonBg');
        break;
      case 'a13': {
        show('moonSmall');
        const x = Math.round(40 + Math.sin(tt) * 2);
        sprite('apollo13').setFrame(tt < 1.6 ? 0 : tt < 2.4 ? 1 : 2).setX(x);
        if (tt >= 1.6)
          for (let k = 0; k < 10; k++) {
            const ang = hash(k, tt | 0, 55) * 6.28, r = ((tt - 1.6) * 14 + k * 3) % 26;
            fx.fillStyle(k % 2 ? P[5] : P[4]).fillRect(Math.round(x + 22 + Math.cos(ang) * r), Math.round(32 + Math.sin(ang) * r), 1, 1);
          }
        break;
      }
      case 'robots':
        show('planetRobots');
        sprite('robotRover').setFrame((tt * 8) % 4 | 0).setX(Math.floor(30 + ((tt * 10) % 100)));
        break;
      case 'artemis': {
        show('moonLarge');
        const f = ((tt * 2) | 0) % 5 === 4 ? 2 : ((tt * 2) | 0) % 2;
        sprite('orion').setFrame(f).setX(Math.floor(62 + tt * 7));
        disc(fx, 142, 34, 2, P[3]);
        fx.fillStyle(P[4]).fillRect(142, 34, 1, 1);
        break;
      }
      case 'mars': {
        const r = Math.floor(Math.min(46, 4 + tt * 12));
        (show('mars') as Phaser.GameObjects.Image).setDisplaySize(2 * r, 2 * r);
        break;
      }
    }
  }

  /** Monta o HTML de uma tela. / Builds a screen's HTML. */
  private showScreen(i: number): void {
    this.index = i;
    this.screenT = 0;
    const s = SCREENS[i];
    const lines = Array.from({ length: s.lines }, (_, k) => {
      const big = s.bigLast && k === s.lines - 1;
      return `<p class="${big ? 'big' : ''}" style="animation-delay:${0.35 + k * 0.85}s">${esc(t(key(i, `line${k}`)))}</p>`;
    }).join('');

    let picHtml = '';
    if (s.scene) {
      const twinkles = Array.from({ length: 12 }, (_, k) =>
        `<i class="tz-tw" style="left:${(hash(k, i, 7) * 100).toFixed(1)}%;top:${(hash(k, i, 8) * 55).toFixed(1)}%;animation-delay:${(hash(k, i, 9) * 2).toFixed(2)}s"></i>`,
      ).join('');
      picHtml = `<div class="tz-scene"><img src="${assetUrl(s.scene.file)}" alt="${esc(t(s.scene.alt))}"><i class="tz-mars" style="left:${s.scene.mars[0]}%;top:${s.scene.mars[1]}%"></i>${twinkles}</div><div class="tz-shade2"></div>`;
    } else if (s.pics && s.pics.length > 1) {
      const slot = duration(s) / s.pics.length;
      picHtml = s.pics
        .map((p, k) => {
          const a = (k * slot).toFixed(2), z = ((k + 1) * slot - 0.5).toFixed(2);
          const anim =
            k < s.pics!.length - 1
              ? `ak-ghost 1s ease-out ${a}s forwards, ak-ghostout .8s ease-in ${z}s forwards, ak-drift 14s linear ${a}s forwards`
              : `ak-ghost 1s ease-out ${a}s forwards, ak-drift 14s linear ${a}s forwards`;
          return `<img class="tz-img" src="${assetUrl(p.file)}" alt="${esc(t(p.alt))}" style="animation:${anim}">`;
        })
        .join('');
    } else if (s.pics) {
      picHtml = `<img class="tz-img" src="${assetUrl(s.pics[0].file)}" alt="${esc(t(s.pics[0].alt))}">`;
    }

    const year = s.year !== undefined ? `<span class="yr">${esc(t(key(i, 'year')))}</span>` : '';
    this.layer.set(
      `<div class="ov teaser${s.scene ? ' scene' : ''}">${picHtml}<span class="skip">${esc(t('ui.skipB'))}</span>${year}<div class="lines">${lines}</div></div>`,
    );
  }

  /** Sai da tela atual com fade e roda o contador de anos quando preciso. / Fades out and rolls the years when needed. */
  private next(): void {
    if (this.index >= SCREENS.length - 1) return this.launch();
    const tok = ++this.token;
    const to = this.index + 1;
    this.busy = true;
    this.fadeOut();
    this.time.delayedCall(550, () => {
      if (tok !== this.token) return;
      const a = yearOf(SCREENS[this.index]), b = yearOf(SCREENS[to]);
      const show = () => {
        this.busy = false;
        this.showScreen(to);
      };
      if (a && b && b > a) this.rollYears(a, b, SCREENS[to].year === 'today', tok, show);
      else show();
    });
  }

  private fadeOut(): void {
    this.layer.find('.ov')?.classList.add('tz-out');
  }

  private rollYears(a: number, b: number, today: boolean, tok: number, done: () => void): void {
    const label = b - a > 1 ? t('teaser.yearsLater', { n: b - a }) : t('teaser.oneYearLater');
    this.layer.set(`<div class="ov teaser rollv"><div class="roll"><span class="rl">${esc(label)}</span><span class="ry">${a}</span></div></div>`);
    const el = this.layer.find('.ry')!;
    this.tweens.addCounter({
      from: a,
      to: b,
      duration: Math.min(1700, 600 + (b - a) * 35),
      ease: 'Cubic.easeOut',
      onUpdate: (tw) => (el.textContent = String(Math.round(tw.getValue() ?? b))),
      onComplete: () => {
        if (tok !== this.token) return;
        if (today) this.time.delayedCall(350, () => tok === this.token && (el.textContent = t('teaser.6.year')));
        this.time.delayedCall(today ? 1100 : 650, () => {
          if (tok !== this.token) return;
          this.fadeOut();
          this.time.delayedCall(450, () => tok === this.token && done());
        });
      },
    });
  }

  /** Contagem final e ignição. / Final countdown and ignition. */
  private launch(): void {
    const tok = ++this.token;
    this.busy = true;
    this.fadeOut();
    this.time.delayedCall(550, () => {
      if (tok !== this.token) return;
      this.layer.set(
        `<div class="ov teaser rollv"><div class="roll"><span class="rl">${esc(t('teaser.launch.title'))}</span><span class="ry">T-3</span><span class="rl">${esc(t('teaser.launch.count'))}</span></div></div>`,
      );
      const el = this.layer.find('.ry')!;
      let n = 3;
      const tick = this.time.addEvent({
        delay: 850,
        repeat: 3,
        callback: () => {
          if (tok !== this.token) return tick.remove();
          n--;
          if (n > 0) el.textContent = `T-${n}`;
          else if (n === 0) el.textContent = t('teaser.launch.ignition');
          else {
            this.fadeOut();
            this.time.delayedCall(500, () => tok === this.token && this.goTravel());
          }
        },
      });
    });
  }

  private goTravel(): void {
    this.token++;
    this.scene.start(SCENES.travel);
  }
}
