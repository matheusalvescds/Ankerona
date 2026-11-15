/**
 * HUD da EVA: barras de O₂, bateria e traje (verde, amarelo e vermelho), hora "SOL 1 08:00" com sol, entardecer ou lua e temperatura,
 * dose em mSv, camada ativa e objetivo atual (tocar no ⓘ repete a instrução). Botões de zoom, guia e camada para quem joga no toque.
 * EVA HUD: O₂, battery and suit bars (green, yellow and red), "SOL 1 08:00" clock with sun, dusk or moon and temperature, dose in mSv,
 * active layer and current objective (tapping ⓘ repeats the briefing). Zoom, guide and layer buttons for touch players.
 *
 * O HUD só mostra: os valores vêm do estado da partida (src/state/contract.ts, HudSnapshot).
 * The HUD only displays: values come from the game state (src/state/contract.ts, HudSnapshot).
 */
import * as Phaser from 'phaser';
import { formatNumber, onLangChange, t, type TextKey } from '../i18n/i18n';
import type { HudSnapshot } from '../state/contract';
import { inputBus, type Action } from './controls';
import { esc, screenLayer, type ScreenLayer } from './Screen';
import { assetUrl } from './UiText';

/** Quadros de 08_HUD/icones_hud.png. / Frames of 08_HUD/icones_hud.png. */
const ICON = { o2: 0, battery: 1, suit: 2, rad: 3, sun: 4, layer: 5 } as const;

/**
 * Faixas de cor de cada barra, iguais às do protótipo (abaixo de "low" fica vermelho, abaixo de "mid" amarelo).
 * Color bands per bar, as in the prototype (below "low" is red, below "mid" is yellow).
 */
const BANDS = { o2: [25, 50], battery: [30, 60], suit: [50, 80] } as const;
type BarId = keyof typeof BANDS;

// Desenhos de 8x8 pixels para os botões. / 8x8 pixel drawings for the buttons.
const SVG_ZOOM = '<path fill="currentColor" d="M2 0h3v1H2zM1 1h1v1H1zM5 1h1v1H5zM0 2h1v3H0zM6 2h1v3H6zM1 5h1v1H1zM5 5h1v1H5zM2 6h3v1H2zM6 6h1v1H6zM7 7h1v1H7zM2 3h3v1H2z"/>';
const SVG_BOOK = '<path fill="currentColor" d="M0 1h3v1H0zM5 1h3v1H5zM0 2h1v5H0zM7 2h1v5H7zM3 2h2v6H3zM1 6h2v1H1zM5 6h2v1H5z"/>';

function icon(frame: number, alt = ''): string {
  const url = assetUrl('assets/sprites/08_HUD/icones_hud.png');
  return `<i class="ico" role="${alt ? 'img' : 'presentation'}" aria-label="${esc(alt)}" style="background-image:url('${url}');background-position:${frame * 20}% 0"></i>`;
}

export class Hud {
  private layer: ScreenLayer;
  private last?: { snap: HudSnapshot; objective: string; zoomed: boolean; alert: boolean; glitch: boolean };
  /** Toque no objetivo (ⓘ): rever a instrução da fase. / Tap on the objective (ⓘ): see the phase briefing again. */
  onBrief?: () => void;

  constructor(scene: Phaser.Scene, depth = 15) {
    this.layer = screenLayer(scene, depth);
    this.build();
    const off = onLangChange(() => {
      this.build();
      if (this.last) this.update(this.last.snap, this.last.objective, this.last.zoomed, this.last.alert, this.last.glitch);
    });
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, off);
  }

  setVisible(on: boolean): void {
    this.layer.root.hidden = !on;
  }

  private build(): void {
    const bar = (id: BarId, label: TextKey) =>
      `<div class="o2">${icon(ICON[id], t(label))}<div class="bar" data-bar="${id}" role="meter" aria-label="${esc(t(label))}" aria-valuemin="0" aria-valuemax="100"><b></b>${id === 'o2' ? `<i class="ret" title="${esc(t('hud.o2Return'))}" hidden></i>` : ''}</div></div>`;
    const btn = (act: Action, cls: string, label: TextKey, inner: string) =>
      `<button class="hb ${cls}" data-act="${act}" aria-label="${esc(t(label))}">${inner}</button>`;
    this.layer.set(`<div class="hud">
      <div class="row">
        ${bar('o2', 'hud.o2')}${bar('battery', 'hud.battery')}${bar('suit', 'hud.suit')}
        <span class="hbs">
          ${btn('zoom', 'hi', 'hud.zoom', `<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true">${SVG_ZOOM}</svg>`)}
          ${btn('guide', 'hi', 'hud.guide', `<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true">${SVG_BOOK}</svg>`)}
        </span>
      </div>
      <div class="row">
        <span class="sky">${icon(ICON.sun)}<i class="moon" aria-hidden="true"></i><b class="clock"></b><b class="temp" aria-label="${esc(t('hud.temp'))}"></b></span>
        <span>${icon(ICON.rad, t('hud.dose'))}<b class="dose"></b></span>
        ${btn('layer', 'hl', 'hud.layer', `${icon(ICON.layer)}<span class="layer"></span>`)}
      </div>
      <button class="obj" aria-live="polite" title="${esc(t('hud.brief'))}"></button>
    </div>`);
    this.layer.find('.obj')?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.onBrief?.();
    });
    this.layer.root.querySelectorAll<HTMLButtonElement>('[data-act]').forEach((bt) =>
      bt.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        inputBus.emit('action', bt.dataset.act as Action);
      }),
    );
  }

  /**
   * Atualiza tudo com o retrato atual do estado. `alert` deixa o objetivo vermelho piscando; `glitch` faz o HUD tremer
   * (sensores com ruído no evento solar).
   * Updates everything from the current state snapshot. `alert` makes the objective blink red; `glitch` shakes the HUD
   * (noisy sensors during the solar event).
   */
  update(snap: HudSnapshot, objective: string, zoomed: boolean, alert = false, glitch = false): void {
    this.last = { snap, objective, zoomed, alert, glitch };
    const find = (sel: string) => this.layer.find(sel);
    for (const id of Object.keys(BANDS) as BarId[]) {
      const value = Math.max(0, Math.min(100, id === 'o2' ? snap.o2 : id === 'battery' ? snap.battery : snap.suit));
      const el = find(`[data-bar="${id}"]`);
      if (!el) continue;
      const [low, mid] = BANDS[id];
      el.classList.toggle('low', value < low);
      el.classList.toggle('mid', value >= low && value < mid);
      el.setAttribute('aria-valuenow', String(Math.round(value)));
      (el.firstElementChild as HTMLElement).style.width = `${value}%`;
    }
    // Marca VOLTA na barra de O₂: abaixo dela a Ana não chega mais ao abrigo. / RETURN mark on the O₂ bar: below it Ana can no longer reach shelter.
    const ret = find('.ret');
    if (ret) {
      const need = Math.min(100, snap.o2Return);
      ret.hidden = !(need > 0);
      ret.style.left = `${need}%`;
      ret.classList.toggle('near', snap.o2 - need < 6);
    }
    const hh = String(Math.floor(snap.minutes / 60)).padStart(2, '0');
    const mm = String(Math.floor(snap.minutes % 60)).padStart(2, '0');
    setText(find('.clock'), t('hud.clock', { sol: snap.sol, time: `${hh}:${mm}` }));
    // Casas decimais de sobra para a dose não parecer parada depois de 10 mSv. / Enough decimals so the dose doesn't look stuck after 10 mSv.
    const d = snap.doseMSv;
    setText(find('.dose'), `${formatNumber(d, d >= 100 ? 1 : d >= 10 ? 2 : 3)} mSv`);
    setText(find('.layer'), t(`layer.${snap.layer}.name` as TextKey));
    // Dia, entardecer e noite: o ícone vira lua e a temperatura fica em alerta (como no protótipo v3).
    // Day, dusk and night: the icon turns into a moon and the temperature goes to alert (as in prototype v3).
    const hour = snap.minutes / 60;
    const sky = snap.night ? 'night' : hour >= 17 || hour < 7.5 ? 'dusk' : 'day';
    const skyEl = find('.sky');
    if (skyEl && skyEl.dataset.sky !== sky) skyEl.dataset.sky = sky;
    const tempEl = find('.temp');
    if (tempEl && snap.tempC !== undefined) {
      const c = Math.round(snap.tempC);
      setText(tempEl, `${c < 0 ? '−' : ''}${Math.abs(c)}°C`);
      tempEl.classList.toggle('warn', hour >= 16.5 || !!snap.night);
    }
    setText(find('.obj'), objective);
    find('.obj')?.classList.toggle('alert', alert);
    find('.hud')?.classList.toggle('glitch', glitch);
    find('[data-act="zoom"]')?.setAttribute('aria-pressed', String(zoomed));
  }
}

/** Só mexe no DOM se o texto mudou. / Only touches the DOM when the text changed. */
function setText(el: HTMLElement | null, text: string): void {
  if (el && el.textContent !== text) el.textContent = text;
}
