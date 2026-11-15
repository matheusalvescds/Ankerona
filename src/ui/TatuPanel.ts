/**
 * Painel de Dados do Tatu (tecla T ou Z/A perto do Tatu).
 * Tatu Mission Data Panel (T key or Z/A near Tatu).
 *
 * Exibe telemetria do rover (bateria, rodas, painéis), briefing do alvo atual,
 * estação meteorológica REMS, radiação na superfície RAD, gravação de vento da SuperCam,
 * e atalhos rápidos para o Guia de Campo e Mapa da Cratera Gale.
 * Displays rover telemetry (battery, wheels, panels), current target briefing,
 * REMS weather station, RAD surface radiation, SuperCam wind recording,
 * and quick shortcuts to the Field Guide and Gale Crater Map.
 */
import * as Phaser from 'phaser';
import { onLangChange, t, type TextKey } from '../i18n/i18n';
import type { Action, Dir } from './controls';
import { daylight, tempC } from '../state/clock';
import type { HudSnapshot } from '../state/contract';
import { guideCount, GUIDE_TOTAL } from './guideEntries';
import { esc, screenLayer, type ScreenLayer } from './Screen';

export type TatuViewId = 'status' | 'target' | 'weather' | 'rad' | 'sound';

export interface TargetBrief {
  id: string;
  name: string;
  what: TextKey;
  why: TextKey;
  look: string;
  src: string;
}

export interface TatuPanelOptions {
  getHudSnapshot: () => HudSnapshot;
  getTargetBrief: () => TargetBrief;
  getTatuMode: () => 'lead' | 'back';
  onOpenGuide?: () => void;
  onOpenMap?: () => void;
}

/** Itens do menu principal do Tatu. / Tatu main menu items. */
const MENU_ITEMS = [
  { id: 'status', label: 'tatu.item.status' as TextKey, badge: 'TEL' },
  { id: 'target', label: 'tatu.item.target' as TextKey, badge: 'OBJ' },
  { id: 'weather', label: 'tatu.item.weather' as TextKey, badge: 'REMS' },
  { id: 'rad', label: 'tatu.item.rad' as TextKey, badge: 'RAD' },
  { id: 'sound', label: 'tatu.item.sound' as TextKey, badge: 'MIC' },
  { id: 'guide', label: 'tatu.item.guide' as TextKey, badge: 'GUIA' },
  { id: 'map', label: 'tatu.item.map' as TextKey, badge: 'GALE' },
] as const;

export class TatuPanel {
  private layer: ScreenLayer;
  private sel = 0;
  private currentView: string | null = null;
  private onClose?: () => void;
  private opts: TatuPanelOptions;
  private audioCtx: AudioContext | null = null;

  constructor(scene: Phaser.Scene, opts: TatuPanelOptions, depth = 45) {
    this.opts = opts;
    this.layer = screenLayer(scene, depth);
    this.layer.root.hidden = true;
    const off = onLangChange(() => this.isOpen && this.render());
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      off();
      this.stopWind();
    });
  }

  get isOpen(): boolean {
    return !this.layer.root.hidden;
  }

  open(onClose?: () => void): void {
    this.onClose = onClose;
    this.currentView = null;
    this.layer.root.hidden = false;
    this.render();
  }

  close(): void {
    if (!this.isOpen) return;
    this.stopWind();
    this.layer.root.hidden = true;
    this.layer.set('');
    const cb = this.onClose;
    this.onClose = undefined;
    cb?.();
  }

  handles(action: Action): boolean {
    if (!this.isOpen) return false;
    if (action === 'B') {
      if (this.currentView !== null) {
        this.currentView = null;
        this.stopWind();
        this.render();
      } else {
        this.close();
      }
      return true;
    }
    if (action === 'A') {
      if (this.currentView === null) {
        this.selectItem(this.sel);
      } else if (this.currentView === 'sound') {
        this.playWind();
      }
      return true;
    }
    if (action === 'tatu') {
      this.close();
      return true;
    }
    return true;
  }

  handlesDir(dir: Dir): boolean {
    if (!this.isOpen) return false;
    if (this.currentView === null) {
      if (dir === 'up') {
        this.sel = (this.sel + MENU_ITEMS.length - 1) % MENU_ITEMS.length;
        this.render();
        return true;
      }
      if (dir === 'down') {
        this.sel = (this.sel + 1) % MENU_ITEMS.length;
        this.render();
        return true;
      }
    }
    return true;
  }

  private selectItem(index: number): void {
    this.sel = index;
    const item = MENU_ITEMS[index];
    if (item.id === 'guide') {
      this.close();
      this.opts.onOpenGuide?.();
      return;
    }
    if (item.id === 'map') {
      this.close();
      this.opts.onOpenMap?.();
      return;
    }
    this.currentView = item.id;
    this.render();
    if (item.id === 'sound') this.playWind();
  }

  private render(): void {
    const v = this.currentView;
    const snap = this.opts.getHudSnapshot();
    const brief = this.opts.getTargetBrief();
    let bodyHtml = '';
    let footHtml = '';

    if (v === null) {
      const itemsHtml = MENU_ITEMS.map((item, idx) => {
        let badge: string = item.badge;
        if (item.id === 'status') badge = `${Math.round(snap.battery)}%`;
        else if (item.id === 'target') badge = brief.name;
        else if (item.id === 'guide') badge = `${guideCount().total}/${GUIDE_TOTAL}`;
        const isSel = idx === this.sel;
        return `<button data-idx="${idx}" class="${isSel ? 'sel' : ''}">
          <span>${esc(t(item.label))}</span>
          <span class="badge">${esc(badge)}</span>
        </button>`;
      }).join('');

      bodyHtml = `<div class="tatu-menu">${itemsHtml}</div>`;
      footHtml = `<div class="tatu-foot">${esc(t('tatu.foot.menu'))}</div>`;
    } else if (v === 'status') {
      const isOff = snap.tatuOff;
      const isWorn = (snap.wheels ?? 100) < 50;
      const dustPct = Math.round((snap.panelDust ?? 0) * 100);
      const mode = this.opts.getTatuMode();
      bodyHtml = `<div class="tatu-view">
        <p class="big">${esc(t('tatu.status.battery', { battery: Math.round(snap.battery) }))}</p>
        ${isOff ? `<p style="color:#ff6a45">${esc(t('tatu.status.hibernating'))}</p>` : ''}
        <p class="big">${esc(t('tatu.status.wheels', { wheels: Math.round(snap.wheels ?? 100) }))}</p>
        ${isWorn ? `<p style="color:#ff6a45">${esc(t('tatu.status.wheelsWorn'))}</p>` : ''}
        <p class="big">${dustPct > 5 ? esc(t('tatu.status.dust', { dust: dustPct })) : esc(t('tatu.status.clean'))}</p>
        <p class="big">${esc(t('tatu.status.mode', { mode: mode === 'lead' ? t('tatu.status.lead') : t('tatu.status.back') }))}</p>
        <p style="margin-top:2cqw">${esc(t('tatu.status.desc'))}</p>
      </div>`;
      footHtml = `<div class="tatu-foot">${esc(t('tatu.foot.back'))}</div>`;
    } else if (v === 'target') {
      bodyHtml = `<div class="tatu-view">
        <p class="big">${esc(brief.name.toUpperCase())}</p>
        <p><span class="bk">${esc(t('tatu.brief.what'))}</span> ${esc(t(brief.what))}</p>
        <p><span class="bk">${esc(t('tatu.brief.why'))}</span> ${esc(t(brief.why))}</p>
        <p><span class="bk">${esc(t('tatu.brief.look'))}</span> ${esc(brief.look)}</p>
        <p class="src">${esc(t('tatu.brief.src'))}${esc(brief.src)}</p>
      </div>`;
      footHtml = `<div class="tatu-foot">${esc(t('tatu.foot.back'))}</div>`;
    } else if (v === 'weather') {
      const w = this.calcWeather(snap);
      bodyHtml = `<div class="tatu-view">
        <p class="big">${esc(t('tatu.weather.air', { temp: w.air }))} · ${esc(t('tatu.weather.ground', { temp: w.ground }))}</p>
        <p class="big">${esc(t('tatu.weather.pressure', { p: w.p.toFixed(1) }))} · ${esc(t('tatu.weather.uv', { uv: t(w.uv) }))}</p>
        <p>${esc(t('tatu.weather.desc'))}</p>
        <p class="src">${esc(t('tatu.weather.src'))}</p>
      </div>`;
      footHtml = `<div class="tatu-foot">${esc(t('tatu.foot.back'))}</div>`;
    } else if (v === 'rad') {
      const isEvent = snap.solarPhase === 'active';
      bodyHtml = `<div class="tatu-view">
        <p class="big">${esc(t('tatu.rad.dose', { dose: snap.doseMSv.toFixed(2) }))}</p>
        <p class="big" style="color:${isEvent ? '#ff6a45' : '#9ad48a'}">${esc(isEvent ? t('tatu.rad.rateAlert') : t('tatu.rad.rateNormal'))}</p>
        <p>${esc(t('tatu.rad.desc'))}</p>
        <p class="src">${esc(t('tatu.rad.src'))}</p>
      </div>`;
      footHtml = `<div class="tatu-foot">${esc(t('tatu.foot.back'))}</div>`;
    } else if (v === 'sound') {
      bodyHtml = `<div class="tatu-view">
        <p class="big wave">▁▃▅▂▆▃▁▄▂▅▃</p>
        <p>${esc(t('tatu.sound.desc'))}</p>
        <p class="src">${esc(t('tatu.sound.src'))}</p>
      </div>`;
      footHtml = `<div class="tatu-foot">${esc(t('tatu.foot.sound'))}</div>`;
    }

    this.layer.set(`<div class="ov tatu-panel">
      <div class="gh">${esc(t('tatu.title'))}<span>${esc(t('tatu.subtitle'))}</span></div>
      ${bodyHtml}
      ${footHtml}
    </div>`);

    this.layer.root.querySelectorAll<HTMLButtonElement>('[data-idx]').forEach((bt) => {
      bt.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.selectItem(Number(bt.dataset.idx));
      });
    });
  }

  /**
   * Clima do painel. O ar é o mesmo do relógio do HUD (src/state/clock.ts), para os dois nunca discordarem;
   * o solo é mais frio que o ar à noite e mais quente de dia; o UV segue a luz do dia.
   * Panel weather. The air is the same as the HUD clock (src/state/clock.ts), so the two never disagree;
   * the ground is colder than the air at night and warmer by day; UV follows daylight.
   */
  private calcWeather(snap: HudSnapshot): { air: number; ground: number; p: number; uv: TextKey } {
    const day = daylight(snap.minutes);
    const air = Math.round(snap.tempC ?? tempC(snap.minutes));
    const ground = Math.round(air - 8 + 24 * day);
    const p = 8.3 + 0.35 * Math.cos((2 * Math.PI * (snap.minutes / 60 - 5)) / 24);
    const uv: TextKey = day > 0.6 ? 'tatu.weather.uvHigh' : day > 0.2 ? 'tatu.weather.uvMid' : 'tatu.weather.uvLow';
    return { air, ground, p, uv };
  }

  private playWind(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = this.audioCtx || new AudioCtx();
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const len = ctx.sampleRate * 2.5;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 220;
      filter.Q.value = 1.8;
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(0.08, ctx.currentTime);
      gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      src.connect(filter);
      filter.connect(gn);
      gn.connect(ctx.destination);
      src.start();
    } catch {
      // Áudio desabilitado ou sem permissão
    }
  }

  private stopWind(): void {
    if (this.audioCtx && this.audioCtx.state === 'running') {
      try {
        this.audioCtx.suspend();
      } catch {
        // Ignora erro ao suspender
      }
    }
  }
}
