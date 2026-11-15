/**
 * Tatu solar: bateria, poeira nos painéis, tempestade de poeira, redemoinhos que limpam e rodas.
 * Solar Tatu: battery, dust on the panels, dust storm, cleaning dust devils and wheels.
 * Ciência / Science: em 2013, rochas pontiagudas furaram e rasgaram as rodas de alumínio do Curiosity. / In 2013, spiky rocks punctured and tore the Curiosity's aluminum wheels.
 *
 * Só lógica, sem Phaser e sem texto. Regras e números vêm do protótipo v3 (guia-sobrevivencia-v3.html).
 * Logic only, no Phaser and no text. Rules and numbers come from the v3 prototype.
 * Ciência / Science: o Opportunity caiu de 645 Wh para 22 Wh na tempestade de 2018; redemoinhos limparam os painéis de Spirit e Opportunity.
 * The Opportunity fell from 645 Wh to 22 Wh in the 2018 storm; dust devils cleaned the Spirit and Opportunity panels.
 */
import { NIGHT_EFFECTS, type Emit } from './night';
import { daylight } from './clock';

export const TATU = {
  solarPerHour: 10, // % de bateria por hora ao meio-dia, painéis limpos e céu limpo / % battery per hour at noon, clean panels and sky
  baseUsePerHour: 1, // consumo parado / idle use
  // Gasto de bateria por camada de dados ligada, em % por hora (o MAPA não gasta). Valores escolhidos pelo time:
  // o protótipo usa um único valor para todas as camadas. Entram no balanceamento.
  // Battery use per data layer on, in % per hour (MAPA costs nothing). Values chosen by the team:
  // the prototype uses a single value for every layer. They go into the balancing.
  layerDrainPerHour: {
    topografia: 4,
    minerais: 6,
    terreno: 8,
  } as const,
  stormUsePerHour: 2, // aquecimento extra na tempestade / extra heating in the storm
  habitatChargePerHour: 30, // recarga na base / charging at the base
  stepCost: 0.25, // % de bateria por passo / % battery per step
  panelMax: 0.6, // no máximo 60% da geração se perde / at most 60% of the output is lost
  panelPerStep: 0.004,
  panelPerStepStorm: 0.012,
  panelCleanMinutes: 15, // limpar os painéis no habitat leva 15 min / cleaning panels at the habitat takes 15 min
  offBelow: 0, // hiberna ao zerar / hibernates at zero
  onAbove: 10, // volta quando passar de 10% / wakes above 10%
  tauBase: 0.5, // opacidade do ar sem tempestade / air opacity without a storm
  tauMax: 9,
  tauPerMinute: 0.21, // sobe até o máximo em ~40 min de jogo / reaches the max in ~40 game minutes
  tauAttenuation: 0.33, // Beer-Lambert simplificada: luz = e^(−tau·0,33) / simplified Beer-Lambert
  wheels: {
    perSharpStep: 3, // % de rodas perdido por passo em rocha pontiaguda / % of wheels lost per step on spiky rock
    wornBelow: 50, // abaixo disso as rodas estão gastas / below this the wheels are worn
    useFactor: 1.5, // rodas gastas: o Tatu gasta 50% mais bateria / worn wheels: the Tatu uses 50% more battery
    lowWarnAt: 40, // aviso de rodas baixas / low-wheels warning
  },
  devil: {
    fromHour: 11,
    toHour: 16,
    spacingMin: 110, // mín. de minutos de jogo entre redemoinhos / min game minutes between devils
    spawnDistance: 7, // tiles
    speed: 2.2, // tiles por segundo / tiles per second
    life: 6.5, // segundos / seconds
    hitTatu: 1.1, // raio de contato, em tiles / contact radius, in tiles
    hitPlayer: 0.9,
    cleans: 0.35, // tira 35 pontos de poeira do painel / removes 0.35 of panel dust
  },
} as const;

export type LayerId = 'mapa' | 'topografia' | 'minerais' | 'terreno';

export interface Pos {
  x: number;
  y: number;
}
export interface DustDevil extends Pos {
  vx: number;
  vy: number;
  life: number;
  hitTatu: boolean;
  hitPlayer: boolean;
}
export interface TatuEnv {
  total: number; // minutos de jogo no fim do intervalo / game minutes at the end of the interval
  night: boolean;
  layerOn: LayerId; // camada ativa; 'mapa' não gasta / active layer; 'mapa' costs nothing
  atHabitat: boolean;
}

/** Número pseudoaleatório fixo (0–1) a partir de um inteiro. / Fixed pseudo-random number (0–1) from an integer. */
function hash01(n: number): number {
  let x = (Math.imul(Math.floor(n) | 0, 0x9e3779b1) ^ 0x85ebca6b) >>> 0;
  x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d) >>> 0;
  x ^= x >>> 12;
  return (x >>> 0) / 4294967296;
}

export class TatuSystem {
  battery = 100;
  panelDust = 0; // 0 a 0,6: parte da geração perdida / 0 to 0.6: share of output lost
  off = false;
  wheels = 100; // 0 a 100 (%) / 0 to 100 (%)
  devil: DustDevil | null = null;
  private stormMin: number | null = null; // minutos desde o início da tempestade / minutes since storm start
  private tau: number = TATU.tauBase;
  private lastOpacity = 0;
  private wheelsHit = false;
  private wheelsLowWarned = false;
  private lastDevilAt = 560; // 09h20 do sol 1, como no protótipo / 09:20 on sol 1, as in the prototype

  get storm(): boolean {
    return this.stormMin !== null;
  }
  /** Opacidade da tempestade para o véu de poeira: 0 a 1. / Storm opacity for the dust veil: 0 to 1. */
  get opacity(): number {
    return this.storm ? (this.tau - TATU.tauBase) / (TATU.tauMax - TATU.tauBase) : 0;
  }
  /** Parte da luz que atravessa a poeira do ar. / Share of light that crosses the dust in the air. */
  get transmittance(): number {
    return Math.exp(-this.tau * TATU.tauAttenuation);
  }

  startStorm(emit: Emit): void {
    if (this.storm) return;
    this.stormMin = 0;
    this.lastOpacity = 0;
    emit('dust-storm', { opacity: 0 });
  }

  endStorm(emit: Emit): void {
    if (!this.storm) return;
    this.stormMin = null;
    this.tau = TATU.tauBase;
    this.lastOpacity = 0;
    emit('dust-storm', { opacity: 0 });
  }

  /** Passa `m` minutos de jogo (use pedaços de até 5 min). / Advances `m` game minutes (use chunks of up to 5 min). */
  advance(m: number, env: TatuEnv, emit: Emit): void {
    if (this.storm) {
      this.stormMin = (this.stormMin ?? 0) + m;
      this.tau = Math.min(TATU.tauMax, TATU.tauBase + this.stormMin * TATU.tauPerMinute);
      const op = this.opacity;
      if (Math.abs(op - this.lastOpacity) >= 0.02) {
        this.lastOpacity = op;
        emit('dust-storm', { opacity: op });
      }
    }
    const h = m / 60;
    let gain = TATU.solarPerHour * daylight(env.total - m / 2) * this.transmittance * (1 - this.panelDust) * h;
    if (env.atHabitat) gain += TATU.habitatChargePerHour * h;

    const layerDrainPerHour = env.layerOn !== 'mapa' ? TATU.layerDrainPerHour[env.layerOn] : 0;

    const use =
      (TATU.baseUsePerHour * h +
        layerDrainPerHour * h +
        (env.night ? NIGHT_EFFECTS.batteryPerHour * h : 0) +
        (this.storm ? TATU.stormUsePerHour * h : 0)) *
      (this.wheels < TATU.wheels.wornBelow ? TATU.wheels.useFactor : 1);
    this.setBattery(this.battery + gain - use, emit);
  }

  /** Cada passo da astronauta suja os painéis e gasta um pouco. / Each astronaut step dirties the panels and costs a little. */
  onStep(emit: Emit): void {
    this.panelDust = Math.min(TATU.panelMax, this.panelDust + (this.storm ? TATU.panelPerStepStorm : TATU.panelPerStep));
    this.setBattery(this.battery - TATU.stepCost, emit);
  }

  /** Passo em rocha pontiaguda: as rodas do Tatu perdem 3%. / Step on spiky rock: the Tatu's wheels lose 3%. */
  damageWheels(emit: Emit): void {
    const W = TATU.wheels;
    this.wheels = Math.max(0, this.wheels - W.perSharpStep);
    const first = !this.wheelsHit;
    this.wheelsHit = true;
    emit('wheels-damaged', { wheels: this.wheels, first });
    if (first) emit('guide-unlocked', { entryId: 'rocks' }); // abre o verbete do Guia / opens the Guide entry
    if (this.wheels <= W.lowWarnAt && !this.wheelsLowWarned) {
      this.wheelsLowWarned = true;
      emit('wheels-low', { wheels: this.wheels });
    }
  }

  /** Rodas gastas? (o Tatu gasta mais bateria) / Worn wheels? (the Tatu uses more battery) */
  get wheelsWorn(): boolean {
    return this.wheels < TATU.wheels.wornBelow;
  }

  /** Limpa os painéis (no habitat). Devolve false se já estavam limpos. / Cleans the panels (at the habitat). Returns false if already clean. */
  cleanPanels(): boolean {
    if (this.panelDust <= 0.05) return false;
    this.panelDust = 0;
    return true;
  }

  private setBattery(value: number, emit: Emit): void {
    this.battery = Math.max(0, Math.min(100, value));
    if (!this.off && this.battery <= TATU.offBelow) {
      this.off = true;
      emit('tatu-off', undefined as never);
    } else if (this.off && this.battery > TATU.onAbove) {
      this.off = false;
      emit('tatu-on', undefined as never);
    }
  }

  /**
   * Redemoinhos: surgem ao meio-dia, andam até o Tatu e limpam parte dos painéis. `dt` em segundos reais.
   * Dust devils: appear around midday, head for the Tatu and clean part of the panels. `dt` in real seconds.
   */
  updateDevil(dt: number, total: number, hour: number, tatu: Pos | undefined, player: Pos | undefined, emit: Emit): void {
    const D = TATU.devil;
    if (!this.devil) {
      if (!this.storm && tatu && hour >= D.fromHour && hour <= D.toHour && total - this.lastDevilAt > D.spacingMin) {
        const ang = hash01(Math.floor(total)) * Math.PI * 2;
        const x = tatu.x + Math.cos(ang) * D.spawnDistance;
        const y = tatu.y + Math.sin(ang) * D.spawnDistance;
        const vx = ((tatu.x - x) / D.spawnDistance) * D.speed;
        const vy = ((tatu.y - y) / D.spawnDistance) * D.speed;
        this.devil = { x, y, vx, vy, life: D.life, hitTatu: false, hitPlayer: false };
        this.lastDevilAt = total;
        emit('devil-spawn', { x, y });
      }
      return;
    }
    const v = this.devil;
    v.x += v.vx * dt;
    v.y += v.vy * dt;
    v.life -= dt;
    if (tatu && !v.hitTatu && Math.hypot(v.x - tatu.x, v.y - tatu.y) < D.hitTatu) {
      v.hitTatu = true;
      const cleaned = this.panelDust > 0.05;
      this.panelDust = Math.max(0, this.panelDust - D.cleans);
      emit('devil-hit-tatu', { cleaned });
    }
    if (player && !v.hitPlayer && Math.hypot(v.x - player.x, v.y - player.y) < D.hitPlayer) {
      v.hitPlayer = true;
      emit('devil-hit-player', undefined as never);
    }
    if (v.life <= 0) this.devil = null;
  }
}
