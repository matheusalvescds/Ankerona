/**
 * Título: logo, botão Jogar, escolha de idioma (PT-BR / EN-US) e dica de controle.
 * Segue a tela de título do protótipo.
 * Title: logo, Play button, language choice (PT-BR / EN-US) and control hint.
 * Follows the prototype's title screen.
 *
 * Arte do Matheus (public/assets/sprites/): fundo 09_Cenas/titulo.png e logo em PT e EN (11_Logo).
 * Jogar (A) abre o Teaser.
 * Matheus's art (public/assets/sprites/): background 09_Cenas/titulo.png and PT/EN logo (11_Logo).
 * Play (A) opens the Teaser.
 */
import * as Phaser from 'phaser';
import { GAME_WIDTH, PALETTE, SCENES } from '../config';
import { getLang, onLangChange, setLang, t, type Lang } from '../i18n/i18n';
import { onAction, onDirPress } from '../ui/controls';
import { arrowSvg, pixelArrows } from '../ui/arrows';
import { resetGuide } from '../ui/guideEntries';
import { esc } from '../ui/Screen';
import { assetUrl, makeButton, setUiText, uiImage, uiText } from '../ui/UiText';
import { ART } from './art';
import { playMusic, prefetchMusic } from '../audio/audio';

/** Posições e tamanhos em pixels do jogo. / Positions and sizes in game pixels. */
const LAYOUT = { logoY: 47, logoW: 137, playY: 101, langY: 115, plateY: 130 } as const;
/** Logo com o texto no idioma certo. / Logo with the text in the right language. */
const LOGOS: Record<Lang, string> = {
  pt: 'assets/sprites/11_Logo/logo_ankerona_pt.png',
  en: 'assets/sprites/11_Logo/logo_ankerona_en.png',
};
const LANGS: Lang[] = ['pt', 'en'];

export class TitleScene extends Phaser.Scene {
  private logo!: Phaser.GameObjects.DOMElement;
  private play!: Phaser.GameObjects.DOMElement;
  private prompt!: Phaser.GameObjects.DOMElement;
  private langRow!: HTMLDivElement;

  constructor() {
    super(SCENES.title);
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    playMusic(this, 'menu');
    prefetchMusic();
    // Fundo em pixel art 160x144, carregado na BootScene. / 160x144 pixel-art background, loaded in BootScene.
    this.add.image(0, 0, ART.bgTitle).setOrigin(0);

    this.logo = uiImage(this, cx, LAYOUT.logoY, assetUrl(LOGOS[getLang()]), LAYOUT.logoW, '');

    this.play = uiText(this, cx, LAYOUT.playY, '', { font: 'pixel', size: 5.8, color: PALETTE.suit, className: 'ui-blink' });
    makeButton(this.play, () => this.startGame());

    this.langRow = this.buildLangRow();
    this.add.dom(cx, LAYOUT.langY, this.langRow);

    // Placa escura com a assinatura e a dica de controle. / Dark plate with the signature and the control hint.
    this.prompt = uiText(this, cx, LAYOUT.plateY, '', { font: 'term', size: 6.2, color: PALETTE.suit, lineHeight: 1.05 });
    Object.assign((this.prompt.node as HTMLElement).style, { background: 'rgba(26, 13, 11, 0.86)', padding: '1px 3px', whiteSpace: 'pre', textShadow: 'none' });

    // Controles do time: Z/Enter/Espaço = A; setas e C trocam o idioma.
    // Team controls: Z/Enter/Space = A; arrows and C switch the language.
    // Teclado e botões na tela: A começa, ◀ ▶ e C trocam o idioma. / Keyboard and on-screen buttons: A starts, ◀ ▶ and C switch language.
    onAction(this, (a) => {
      if (a === 'A') this.startGame();
      else if (a === 'layer') setLang(getLang() === 'pt' ? 'en' : 'pt');
    });
    onDirPress(this, (d) => {
      if (d === 'left') setLang('pt');
      else if (d === 'right') setLang('en');
    });

    const off = onLangChange(() => this.refreshTexts());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, off);
    this.refreshTexts();
  }

  /** ◀ [PT-BR] [EN-US] ▶ */
  private buildLangRow(): HTMLDivElement {
    const row = document.createElement('div');
    row.className = 'ui-text';
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', 'Idioma / Language');
    Object.assign(row.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '2.6px',
      fontFamily: '"Press Start 2P"',
      fontSize: '3.9px',
      color: PALETTE.rust,
      pointerEvents: 'auto',
    } satisfies Partial<CSSStyleDeclaration>);
    row.insertAdjacentHTML('beforeend', arrowSvg('left'));
    for (const lang of LANGS) {
      const btn = document.createElement('button');
      btn.className = 'ui-lang';
      btn.dataset.lang = lang;
      btn.textContent = lang === 'pt' ? 'PT-BR' : 'EN-US';
      btn.style.font = 'inherit';
      btn.style.cursor = 'pointer';
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        setLang(lang);
      });
      row.append(btn);
    }
    row.insertAdjacentHTML('beforeend', arrowSvg('right'));
    return row;
  }

  /** Redesenha todos os textos no idioma atual. / Redraws every text in the current language. */
  private refreshTexts(): void {
    const logo = this.logo.node as HTMLImageElement;
    logo.src = assetUrl(LOGOS[getLang()]);
    logo.alt = `${t('meta.title')}. ${t('title.tagline')}`;
    // Seta em pixel no lugar do ▶ do texto (no celular ele virava emoji). / Pixel arrow instead of the text's ▶ (it became an emoji on phones).
    (this.play.node as HTMLElement).innerHTML = pixelArrows(esc(t('ui.play')));
    this.play.updateSize();
    setUiText(this.prompt, `${t('title.signature')}\n${t('title.prompt')}`);
    const lang = getLang();
    this.langRow.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
      const active = b.dataset.lang === lang;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
  }

  private startGame(): void {
    resetGuide(); // partida nova / new run
    this.scene.start(SCENES.teaser);
  }
}
