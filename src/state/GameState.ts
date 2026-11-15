/**
 * Estado da partida da EVA (regras do Miguel). Substitui o TempState de src/scenes/eva/estadoProvisorio.ts:
 * mesma API (tick, getHud, on, unlockLayer, nextLayer, minutesTotal), então a cena só troca o `new`.
 * EVA game state (Miguel's rules). Replaces TempState from src/scenes/eva/estadoProvisorio.ts:
 * same API (tick, getHud, on, unlockLayer, nextLayer, minutesTotal), so the scene only swaps the `new`.
 *
 * Sem Phaser e sem texto: só números, eventos e chaves de texto (src/state/contract.ts).
 * No Phaser and no text: only numbers, events and text keys (src/state/contract.ts).
 *
 * Relógio e noite marciana; Tatu solar (bateria, poeira, tempestade, redemoinhos, rodas); O₂ e ponto de retorno; evento solar; traje.
 * Clock and Martian night; solar Tatu (battery, dust, storm, devils, wheels); O₂ and the point of return; solar event; suit integrity.
 */
import { SOL_MINUTES, darkness, hourOfSol, isNight, minuteOfSol, solOf, tempC } from './clock';
import type { GameEvents, GameStateReader, HudSnapshot, Level } from './contract';
import { NIGHT_EFFECTS, NightSystem, type Emit } from './night';
import { SOLAR, SolarEventSystem, type SolarPhase } from './solar';
import { TatuSystem, TATU, type DustDevil, type Pos } from './tatu';
import { SUIT, SuitSystem } from './suit';
import { O2, OxygenSystem, o2PerMinute, ReturnCosts, returnNeed, stepEffort, stepMinutes, type ReturnGrid, type StepInfo } from './oxygen';

/** Minutos de jogo por segundo real (protótipo). / Game minutes per real second (prototype). */
const GAME_MIN_PER_SEC = 2;
/** Média do RAD na superfície (mSv por dia). / RAD surface average (mSv per day). */
const DOSE_PER_DAY = 0.64;
/** Hora de início: 08:00 do sol 1. / Start time: 08:00 on sol 1. */
const START_MINUTES = 8 * 60;
/** Maior pedaço de tempo integrado de uma vez (a luz do sol muda ao longo do intervalo). / Largest chunk integrated at once (sunlight changes over the interval). */
const CHUNK_MIN = 5;

/** Camadas na ordem do protótipo. / Layers in the prototype's order. */
export const LAYERS = ['mapa', 'topografia', 'minerais', 'terreno'] as const;
export type LayerId = (typeof LAYERS)[number];

/** Camadas liberadas no começo (protótipo: MAPA + TOPOGRAFIA). / Layers unlocked at start (prototype: MAPA + TOPOGRAFIA). */
export const INITIAL_LAYERS: LayerId[] = ['mapa', 'topografia'];

/** Nome de cada camada como aparece no protótipo. / Each layer's name as shown in the prototype. */
export const LAYER_DISPLAY: Record<LayerId, string> = {
  mapa: 'MAPA',
  topografia: 'TOPOGRAFIA',
  minerais: 'MINERAIS',
  terreno: 'TERRENO',
};

type Listener = (payload: never) => void;

export class GameState implements GameStateReader {
  private total = START_MINUTES;
  private dose = 0;
  private sheltered = true; // começa no habitat / starts at the habitat
  private atHabitat = true;
  private tatu = new TatuSystem();
  private actors: { player?: Pos; tatu?: Pos } = {};
  private oxygen = new OxygenSystem();
  private suit = new SuitSystem();
  private solar = new SolarEventSystem();
  private returnCosts: ReturnCosts | null = null;
  private retWarned = false;
  private inBreach = false;
  /** Números da missão para a tela de avaliação. / Mission numbers for the evaluation screen. */
  readonly stats = { o2Min: 100, breaches: 0, o2Outs: 0, nightAborts: 0, wheelsMin: 100, solarDose: 0, suitMin: 100, suitBreaches: 0 };
  private layers: LayerId[] = INITIAL_LAYERS.slice();
  private active: LayerId = 'mapa';
  private listeners = new Map<string, Set<Listener>>();
  private night = new NightSystem();

  /** Passa o tempo real `dt` (s), pausado durante diálogos e no guia. / Advances real time `dt` (s), paused in dialogue and guide. */
  tick(dt: number): void {
    // abrigada durante as partículas solares, o tempo corre 4x / sheltered during the solar particles, time runs 4x
    const fast = this.sheltered && this.solar.phase === 'active' ? SOLAR.shelterTimeFactor : 1;
    this.advance(dt * GAME_MIN_PER_SEC * fast);
    this.updateOxygen(dt);
    this.tatu.updateDevil(dt, this.total, hourOfSol(this.total), this.actors.tatu, this.actors.player, this.em);
  }

  /** Recarga no abrigo, aviso de retorno e O₂ zerado ou traje comprometido (`dt` em segundos reais). / Refill at shelter, return warning and depleted O₂ or breached suit (`dt` in real seconds). */
  private updateOxygen(dt: number): void {
    if (this.sheltered) {
      if (this.oxygen.refill(dt, this.tatu.storm)) this.em('o2-refill', { slow: this.tatu.storm });
      this.suit.repair(dt);
      this.retWarned = false;
      this.inBreach = false;
      return;
    }
    const o2 = this.oxygen.o2;
    this.stats.o2Min = Math.min(this.stats.o2Min, o2);
    this.stats.suitMin = Math.min(this.stats.suitMin, this.suit.integrity);
    const need = this.returnNeedNow();
    if (this.returnCosts) {
      if (!this.retWarned && o2 - need < O2.returnMargin) {
        this.retWarned = true;
        this.em('return-warning', { o2, need });
      }
      if (!this.inBreach && o2 < need) {
        this.inBreach = true;
        this.stats.breaches++;
        this.em('return-breach', { o2, need });
      }
    }
    if (this.suit.breached) {
      this.stats.suitBreaches++;
      this.retWarned = false;
      this.inBreach = false;
      this.penalty(SUIT.breachPenaltyMinutes);
      this.suit.reset();
      this.oxygen.o2 = 100;
      this.em('eva-failed', { reasonKey: 'eva.fail.suit' });
      return;
    }
    if (o2 <= 0) {
      this.stats.o2Outs++;
      this.retWarned = false;
      this.inBreach = false;
      this.penalty(O2.faintPenaltyMinutes); // a hora perdida passa primeiro; depois o traje é reabastecido / the lost hour passes first; then the suit is refilled
      this.oxygen.o2 = 100;
      this.suit.reset();
      this.em('eva-failed', { reasonKey: 'eva.fail.o2' });
    }
  }

  /**
   * Hora perdida depois de uma falha: o Tatu já está levando a Ana ao habitat, então ela conta como abrigada.
   * Sem isso, se a hora passasse das 19h30, a noite abortava a EVA de novo (duas falhas seguidas e nightAborts errado).
   * Lost time after a failure: the Tatu is already taking Ana to the habitat, so she counts as sheltered.
   * Without this, if the hour went past 19:30, the night aborted the EVA again (two failures in a row and a wrong nightAborts).
   */
  private penalty(minutes: number): void {
    this.sheltered = true;
    this.atHabitat = true;
    this.advance(minutes);
  }

  /** O₂ (%) necessário para voltar ao abrigo da posição atual; 0 se não dá para calcular. / O₂ (%) needed to return to shelter from the current position; 0 if it cannot be computed. */
  private returnNeedNow(): number {
    const p = this.actors.player;
    if (!this.returnCosts || !p) return 0;
    return returnNeed(this.returnCosts.at(Math.round(p.x), Math.round(p.y)), isNight(this.total));
  }

  /** A cena entrega o mapa uma vez: o estado calcula o custo de voltar de cada tile. / The scene hands over the map once: the state computes the return cost from each tile. */
  setReturnGrid(grid: ReturnGrid): void {
    this.returnCosts = new ReturnCosts(grid);
  }

  /** Passa `minutes` minutos de jogo, em pedaços de até 5 min. / Advances `minutes` game minutes, in chunks of up to 5 min. */
  advance(minutes: number, effort = 1): void {
    let left = minutes;
    while (left > 1e-9) {
      const m = Math.min(CHUNK_MIN, left);
      left -= m;
      const prev = this.total;
      this.total += m;
      const rate = this.solar.doseRate(this.sheltered) ?? DOSE_PER_DAY / 24; // mSv por hora / mSv per hour
      this.dose += rate * (m / 60);
      if (!this.sheltered) this.oxygen.drain(m, effort * this.suit.leakMultiplier(), isNight(this.total));
      this.solar.advance(m, this.dose, this.em);
      this.night.update(prev, this.total, this.sheltered, this.em);
      this.tatu.advance(
        m,
        { total: this.total, night: isNight(this.total), layerOn: this.active, atHabitat: this.sheltered && this.atHabitat },
        this.em,
      );
    }
  }

  /** Emite um evento; se o Tatu hiberna, volta para o MAPA. / Emits an event; if the Tatu hibernates, goes back to MAPA. */
  private em: Emit = (event, payload) => {
    if (event === 'tatu-off') this.active = 'mapa';
    if (event === 'solar-alert-end') this.stats.solarDose = (payload as { doseMSv: number }).doseMSv;
    if (event === 'eva-failed' && (payload as { reasonKey: string }).reasonKey === 'eva.fail.night') this.stats.nightAborts++;
    this.emit(event, payload);
  };

  /**
   * A cena avisa se a astronauta está abrigada. `at` diz onde: só o habitat recarrega o Tatu (sem `at`, vale habitat).
   * The scene tells whether the astronaut is sheltered. `at` says where: only the habitat recharges the Tatu (no `at` means habitat).
   */
  setSheltered(sheltered: boolean, at: 'habitat' | 'rover' = 'habitat'): void {
    this.sheltered = sheltered;
    this.atHabitat = at === 'habitat';
  }

  /** Posições em tiles da astronauta e do Tatu, a cada quadro (os redemoinhos precisam delas). / Tile positions of the astronaut and the Tatu, each frame (dust devils need them). */
  setActors(player: Pos, tatu: Pos): void {
    this.actors = { player, tatu };
  }

  /**
   * Um passo da astronauta: gasta bateria do Tatu e processa dano em rocha pontiaguda (traje e rodas).
   * One astronaut step: drains Tatu battery and processes sharp rock damage (suit and wheels).
   * Se `advanceTime` for true (modo por turnos), avança os minutos do passo.
   * If `advanceTime` is true (turn-based mode), advances step minutes.
   */
  registerStep(info: StepInfo = {}, advanceTime = false): void {
    if (advanceTime) {
      this.advance(stepMinutes(info.sand), stepEffort(info.sand, info.uphill));
    }
    this.tatu.onStep(this.em);
    if (info.sharp) {
      this.suit.damageSharp(this.em);
      this.stats.suitMin = Math.min(this.stats.suitMin, this.suit.integrity);
      this.tatu.damageWheels(this.em);
      this.stats.wheelsMin = Math.min(this.stats.wheelsMin, this.tatu.wheels);
    }
  }

  /** Limpar os painéis no habitat (tecla A): leva 15 min. Devolve false se já estavam limpos. / Clean the panels at the habitat (A key): takes 15 min. Returns false if already clean. */
  cleanPanels(): boolean {
    if (!this.tatu.cleanPanels()) return false;
    this.advance(TATU.panelCleanMinutes);
    return true;
  }

  /** Começa o evento de partículas solares (a cena escolhe o momento da história). / Starts the solar particle event (the scene picks the story moment). */
  startSolarEvent(): void {
    this.solar.start(this.dose, this.em);
  }
  /** Encerra o evento agora, por exemplo ao pular para o próximo sol. / Ends the event now, e.g. when skipping to the next sol. */
  finishSolarEvent(): void {
    this.solar.finish(this.dose, this.em);
  }
  get solarPhase(): SolarPhase {
    return this.solar.phase;
  }

  /** Começa a tempestade de poeira (na volta ao habitat). / Starts the dust storm (on the way back to the habitat). */
  startStorm(): void {
    this.tatu.startStorm(this.em);
  }
  endStorm(): void {
    this.tatu.endStorm(this.em);
  }
  get stormActive(): boolean {
    return this.tatu.storm;
  }
  get isTatuOff(): boolean {
    return this.tatu.off;
  }
  /** Redemoinho ativo agora (posição em tiles) ou null. / Active dust devil now (tile position) or null. */
  getDevil(): Readonly<DustDevil> | null {
    return this.tatu.devil;
  }

  /** Custos da noite agora (1 de dia). O sistema de O₂ multiplica por isto (a bateria do Tatu já usa a noite sozinha). / Night costs right now (1 by day). The O₂ system multiplies by this (the Tatu battery already handles night itself). */
  get o2DrainFactor(): number {
    return isNight(this.total) ? NIGHT_EFFECTS.o2Drain : 1;
  }
  get returnCostFactor(): number {
    return isNight(this.total) ? NIGHT_EFFECTS.returnCost : 1;
  }

  getHud(): HudSnapshot {
    return {
      o2: this.oxygen.o2,
      o2Return: this.sheltered ? 0 : this.returnNeedNow(),
      battery: this.tatu.battery,
      suit: this.suit.integrity,
      doseMSv: this.dose,
      sol: solOf(this.total),
      minutes: minuteOfSol(this.total),
      layer: this.active,
      objectiveKey: 'eva.target',
      night: isNight(this.total),
      darkness: darkness(this.total),
      tempC: tempC(this.total),
      panelDust: this.tatu.panelDust,
      tatuOff: this.tatu.off,
      wheels: this.tatu.wheels,
      solarPhase: this.solar.running ? (this.solar.phase as 'warn' | 'active') : undefined,
      solarMinutes: this.solar.running ? this.solar.left : undefined,
      o2Minutes: this.oxygen.minutesLeft(isNight(this.total)),
      returnInMin: this.returnInMin(),
    };
  }

  /** Minutos até o ponto de retorno; undefined no abrigo ou sem mapa. / Minutes until the point of return; undefined at shelter or without a map. */
  private returnInMin(): number | undefined {
    if (this.sheltered || !this.returnCosts || !this.actors.player) return undefined;
    const drain = o2PerMinute * (isNight(this.total) ? NIGHT_EFFECTS.o2Drain : 1);
    return Math.max(0, (this.oxygen.o2 - this.returnNeedNow()) / drain);
  }

  levelOf(value: number): Level {
    return value < 25 ? 'danger' : value < 50 ? 'warn' : 'ok';
  }

  on<K extends keyof GameEvents>(event: K, fn: (payload: GameEvents[K]) => void): () => void {
    const set = this.listeners.get(event) ?? new Set<Listener>();
    set.add(fn as Listener);
    this.listeners.set(event, set);
    return () => set.delete(fn as Listener);
  }

  private emit<K extends keyof GameEvents>(event: K, payload: GameEvents[K]): void {
    this.listeners.get(event)?.forEach((fn) => (fn as (p: GameEvents[K]) => void)(payload));
  }

  /** Libera uma camada (instrumento novo). / Unlocks a layer (new instrument). */
  unlockLayer(layer: LayerId): void {
    if (this.layers.includes(layer)) return;
    this.layers.push(layer);
    this.layers.sort((a, b) => LAYERS.indexOf(a) - LAYERS.indexOf(b));
    this.emit('layer-unlocked', { layer });
  }

  /** Força a camada MAPA (evento solar). / Forces the MAPA layer (solar event). */
  forceMapaLayer(): void {
    this.active = 'mapa';
  }

  /** Tecla C: próxima camada liberada. Devolve a camada ativa. / C key: next unlocked layer. Returns the active layer. */
  nextLayer(): LayerId {
    if (this.tatu.off) return this.active; // sem energia: só o MAPA / no power: MAPA only
    const i = this.layers.indexOf(this.active);
    this.active = this.layers[(i + 1) % this.layers.length];
    return this.active;
  }

  /** Tempo total para o resumo do Final. / Total time for the Ending summary. */
  get minutesTotal(): number {
    return this.total;
  }

  /** Só para testes: define o O₂. / Tests only: sets the O₂. */
  debugSetO2(value: number): void {
    this.oxygen.o2 = value;
  }

  /** Só para testes: define a bateria do Tatu. / Tests only: sets the Tatu battery. */
  debugSetBattery(value: number): void {
    this.tatu.battery = value;
  }

  /** Só para testes: pula para um horário. / Tests only: jumps to a time. */
  debugSetMinutes(total: number): void {
    this.total = total;
  }
}

export { SOL_MINUTES };
