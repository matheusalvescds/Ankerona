/**
 * Caixa de diálogo: texto digitado letra a letra, nome de quem fala e retrato.
 * Dialogue box: typewriter text, speaker name and portrait.
 *
 * Igual ao protótipo: A mostra a frase inteira; com a frase completa, A passa para a próxima.
 * Same as the prototype: A completes the line; once complete, A moves to the next one.
 *
 * Uso / Usage:
 *   const dlg = new DialogBox(scene);
 *   dlg.say([{ who: 'who.commander', text: 'travel.5' }], () => ...);
 *   // na ação A ou B da cena / on the scene's A or B action:
 *   dlg.advance();
 *
 * Pergunta com opções: uma linha com `choices`. As setas trocam a opção, A escolhe, B escolhe a opção `cancel`, e tocar numa opção também escolhe.
 * Question with options: a line with `choices`. Arrows change the option, A picks, B picks the `cancel` option, and tapping an option picks it too.
 */
import * as Phaser from 'phaser';
import { onLangChange, t, type TextKey } from '../i18n/i18n';
import { artUrl } from '../scenes/art';
import { unlockGuide } from './guideEntries';
import { esc, screenLayer, type ScreenLayer } from './Screen';

export interface Line {
  /** Chave do nome de quem fala (também escolhe o retrato). / Speaker name key (also picks the portrait). */
  who?: TextKey;
  /** Nome montado na hora, no lugar de who. / Name built on the fly, instead of who. */
  name?: () => string;
  /** Chave do texto, ou uma função que monta o texto já traduzido. / Text key, or a function that builds the translated text. */
  text: TextKey | (() => string);
  /** Borda vermelha de alerta. / Red alert border. */
  alert?: boolean;
  /** Nome em verde e registra esta entrada do Guia (id em guideEntries.ts). / Green name; records this Guide entry (id in guideEntries.ts). */
  guide?: string;
  /** Chamado quando a linha aparece. / Called when the line shows up. */
  onShow?: () => void;
  /** Opções para responder; a escolhida fecha o diálogo e roda `pick`. / Options to answer; the chosen one closes the dialogue and runs `pick`. */
  choices?: { text: TextKey | (() => string); pick?: () => void }[];
  /** Opção que o B escolhe (padrão: a primeira). / Option that B picks (default: the first). */
  cancel?: number;
}

/** Retrato de cada pessoa (arte do Matheus). Ana fica à direita. / Each person's portrait. Ana sits on the right. */
const PORTRAITS: Partial<Record<TextKey, { src: () => string; right?: boolean }>> = {
  'who.selari': { src: () => artUrl('portraitAna'), right: true },
  'who.commander': { src: () => artUrl('portraitKeli') },
  'crew.commander.name': { src: () => artUrl('portraitKeli') },
  'who.doctor': { src: () => artUrl('portraitNatan') },
  'crew.doctor.name': { src: () => artUrl('portraitNatan') },
  'crew.engineer.name': { src: () => artUrl('portraitRossi') },
};

const CHARS_PER_SECOND = 60; // mesmo ritmo do protótipo / same pace as the prototype

export class DialogBox {
  private layer: ScreenLayer;
  private box: HTMLDivElement;
  private whoEl: HTMLDivElement;
  private txtEl: HTMLDivElement;
  private ptEl: HTMLImageElement;
  private lines: Line[] = [];
  private index = 0;
  private full = '';
  private shown = 0;
  private done?: () => void;
  private chEl: HTMLDivElement;
  private sel = 0;

  constructor(scene: Phaser.Scene, depth = 30) {
    this.layer = screenLayer(scene, depth);
    this.layer.set(`<div class="dlg" hidden><img class="pt" alt="" hidden><div class="who"></div><div class="txt"></div><div class="ch" hidden></div><div class="more">▼</div></div>`);
    this.box = this.layer.find<HTMLDivElement>('.dlg')!;
    this.whoEl = this.layer.find<HTMLDivElement>('.who')!;
    this.txtEl = this.layer.find<HTMLDivElement>('.txt')!;
    this.ptEl = this.layer.find<HTMLImageElement>('.pt')!;
    this.chEl = this.layer.find<HTMLDivElement>('.ch')!;
    // Toque na caixa também avança; toque numa opção escolhe. / Tapping the box also advances; tapping an option picks it.
    this.box.style.pointerEvents = 'auto';
    this.box.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const opt = (e.target as HTMLElement).closest<HTMLElement>('[data-ch]');
      if (opt && this.shown >= this.full.length) return this.pick(Number(opt.dataset.ch));
      this.advance();
    });
    scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    const off = onLangChange(() => this.isOpen && this.showLine(true));
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      off();
      scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
    });
  }

  get isOpen(): boolean {
    return !this.box.hidden;
  }

  say(lines: Line[], done?: () => void): void {
    this.lines = lines;
    this.index = 0;
    this.done = done;
    this.showLine();
  }

  /** A ou B: completa a frase ou passa para a próxima. / A or B: completes the line or moves on. */
  advance(): void {
    if (!this.isOpen) return;
    if (this.shown < this.full.length) {
      this.shown = this.full.length;
      this.txtEl.textContent = this.full;
      return;
    }
    if (this.lines[this.index].choices) return; // pergunta: só sai escolhendo / question: only closes by picking
    this.index++;
    if (this.index >= this.lines.length) {
      this.box.hidden = true;
      const cb = this.done;
      this.done = undefined;
      cb?.();
    } else this.showLine();
  }

  private showLine(keepProgress = false): void {
    const line = this.lines[this.index];
    this.full = typeof line.text === 'function' ? line.text() : t(line.text);
    if (!keepProgress) {
      this.shown = 0;
      this.sel = 0;
    }
    this.drawChoices();
    const pt = line.who ? PORTRAITS[line.who] : undefined;
    this.box.hidden = false;
    const name = line.name ? line.name() : line.who ? t(line.who) : '';
    this.whoEl.hidden = !name;
    this.whoEl.innerHTML = esc(name);
    this.ptEl.hidden = !pt;
    if (pt) this.ptEl.src = pt.src();
    this.box.classList.toggle('has-pt', !!pt);
    this.box.classList.toggle('pt-r', !!pt?.right);
    this.box.classList.toggle('alert', !!line.alert);
    this.box.classList.toggle('guide', !!line.guide);
    this.box.classList.remove('ready');
    this.fitText();
    this.txtEl.textContent = this.full.slice(0, Math.floor(this.shown));
    if (!keepProgress) {
      if (line.guide) unlockGuide(line.guide);
      line.onShow?.();
    }
  }

  /** Opções da pergunta, com ▶ na escolhida. / Question options, with ▶ on the selected one. */
  private drawChoices(): void {
    const ch = this.lines[this.index]?.choices;
    this.chEl.hidden = !ch;
    this.box.classList.toggle('ask', !!ch);
    if (!ch) return;
    this.chEl.innerHTML = ch
      .map((c, i) => `<button type="button" data-ch="${i}" class="${i === this.sel ? 'sel' : ''}">${esc(typeof c.text === 'function' ? c.text() : t(c.text))}</button>`)
      .join('');
  }

  /** Escolhe uma opção: fecha o diálogo e roda a ação dela. / Picks an option: closes the dialogue and runs its action. */
  private pick(i: number): void {
    const ch = this.lines[this.index]?.choices?.[i];
    if (!ch) return;
    this.box.hidden = true;
    this.done = undefined;
    ch.pick?.();
  }

  /** Setas numa pergunta trocam a opção. Devolve true se usou a seta. / Arrows on a question change the option. Returns true if it used the arrow. */
  handlesDir(dir: string): boolean {
    const ch = this.isOpen ? this.lines[this.index]?.choices : undefined;
    if (!ch) return false;
    if (dir === 'up' || dir === 'left') this.sel = (this.sel + ch.length - 1) % ch.length;
    else this.sel = (this.sel + 1) % ch.length;
    this.drawChoices();
    return true;
  }

  /** Diminui a fonte até a frase caber na caixa, como no protótipo. / Shrinks the font until the line fits, as in the prototype. */
  private fitText(): void {
    const el = this.txtEl;
    el.style.fontSize = '';
    el.textContent = this.full;
    let size = 5;
    while (el.scrollHeight > el.clientHeight + 1 && size > 3.4) {
      size -= 0.3;
      el.style.fontSize = `${size}cqw`;
    }
  }

  private update(_time: number, delta: number): void {
    if (!this.isOpen) return;
    if (this.shown < this.full.length) {
      this.shown = Math.min(this.full.length, this.shown + (delta / 1000) * CHARS_PER_SECOND);
      this.txtEl.textContent = this.full.slice(0, Math.floor(this.shown));
    } else this.box.classList.add('ready');
  }

  destroy(): void {
    this.layer.obj.destroy();
  }

  /** Para a cena: se o diálogo estiver aberto, ele consome A e B. / For the scene: when open, the dialogue consumes A and B. */
  handles(action: string): boolean {
    if (!this.isOpen) return false;
    const line = this.lines[this.index];
    if (line.choices && (action === 'A' || action === 'B')) {
      if (this.shown < this.full.length) this.advance();
      else this.pick(action === 'A' ? this.sel : line.cancel ?? 0);
      return true;
    }
    if (action === 'A' || action === 'B') this.advance();
    return true;
  }
}
