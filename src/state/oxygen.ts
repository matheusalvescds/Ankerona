/**
 * O₂ do traje e ponto de retorno (marcador VOLTA).
 * Suit O₂ and the point of return (the RETURN marker).
 *
 * Só lógica, sem Phaser e sem texto. Regras e números vêm do protótipo v3.
 * Logic only, no Phaser and no text. Rules and numbers come from the v3 prototype.
 * Ciência / Science: uma pessoa consome ~0,84 kg de O₂ por dia; no traje o estoque é fixo e esforço (areia, subida) gasta mais.
 * A person uses ~0.84 kg of O₂ per day; the suit stock is fixed and effort (sand, climbing) uses more.
 */
import { NIGHT_EFFECTS } from './night';
import type { Pos } from './tatu';

export const O2 = {
  suitMinutes: 480, // o traje dura 480 min de jogo com esforço 1 / the suit lasts 480 game minutes at effort 1
  refillPerSecond: 25, // % por segundo real no abrigo / % per real second at shelter
  refillPerSecondStorm: 6, // recarga lenta: pouca energia na tempestade / slow refill: little power in the storm
  returnMargin: 6, // aviso quando O₂ − necessário < 6 pontos / warns when O₂ − needed < 6 points
  returnSafety: 1.2, // folga de 20% no custo de volta / 20% safety on the return cost
  returnFixed: 2, // + 2 pontos fixos (eclusa) / + 2 fixed points (airlock)
  faintPenaltyMinutes: 60, // O₂ zerado: EVA abortada, perde 1 h / O₂ at zero: EVA aborted, loses 1 h
} as const;

/** Como a astronauta deu o passo. / How the astronaut took the step. */
export interface StepInfo {
  sand?: boolean; // areia fofa: passo lento e cansativo / soft sand: slow and tiring
  uphill?: boolean; // subida: esforço maior / uphill: more effort
  sharp?: boolean; // rocha pontiaguda (rodas do Tatu) / spiky rock (Tatu wheels)
}
export type StepKind = 'ground' | 'sand' | 'sharp';

/** Minutos de jogo que um passo leva. / Game minutes one step takes. */
export const stepMinutes = (kind: StepKind | boolean | undefined): number => (kind === 'sand' || kind === true ? 6 : 3);
/** Esforço de um passo (multiplica o consumo de O₂). / Step effort (multiplies O₂ use). */
export const stepEffort = (kind: StepKind | boolean | undefined, uphill = false): number =>
  (kind === 'sand' || kind === true ? 1.6 : 1.2) * (uphill ? 1.25 : 1);

/** % de O₂ gasto por minuto de jogo com esforço 1. / % of O₂ used per game minute at effort 1. */
export const o2PerMinute = 100 / O2.suitMinutes;

export class OxygenSystem {
  o2 = 100;
  private refilling = false;

  /** Gasta O₂ por `m` minutos com esforço `effort`; à noite gasta o dobro. / Uses O₂ for `m` minutes at `effort`; twice as much at night. */
  drain(m: number, effort: number, night: boolean): void {
    this.o2 = Math.max(0, this.o2 - m * o2PerMinute * effort * (night ? NIGHT_EFFECTS.o2Drain : 1));
  }

  /** Recarrega no abrigo. Devolve true no primeiro quadro de uma recarga. / Refills at shelter. Returns true on the first frame of a refill. */
  refill(dt: number, storm: boolean): boolean {
    if (this.o2 >= 99.5) {
      this.refilling = false;
      return false;
    }
    this.o2 = Math.min(100, this.o2 + dt * (storm ? O2.refillPerSecondStorm : O2.refillPerSecond));
    const started = !this.refilling;
    this.refilling = true;
    return started;
  }

  /** Minutos de jogo de O₂ restantes, parada, agora (noite gasta o dobro). / Game minutes of O₂ left, standing, right now (night uses double). */
  minutesLeft(night: boolean): number {
    return this.o2 / (o2PerMinute * (night ? NIGHT_EFFECTS.o2Drain : 1));
  }
}

/** Grade do mapa vista pelo cálculo de volta. / Map grid as seen by the return calculation. */
export interface ReturnGrid {
  width: number;
  height: number;
  /** Tipo de piso do tile, ou null se a astronauta não anda ali. / Floor kind of the tile, or null if the astronaut cannot walk there. */
  kindAt(x: number, y: number): StepKind | null;
  /** Tiles que contam como abrigo (perto do habitat e do rover). / Tiles that count as shelter (near the habitat and the rover). */
  shelterTiles: Pos[];
}

/** Custo de O₂ (%) para voltar de cada tile ao abrigo mais próximo. / O₂ cost (%) to return from each tile to the nearest shelter. */
export class ReturnCosts {
  static readonly UNREACHABLE = 1e9;
  private readonly cost: Float32Array;
  constructor(private readonly grid: ReturnGrid) {
    const { width: w, height: h } = grid;
    this.cost = new Float32Array(w * h).fill(ReturnCosts.UNREACHABLE);
    // Dijkstra com fila de prioridade simples (heap binário). / Dijkstra with a simple binary-heap priority queue.
    const heap: [number, number][] = [];
    const push = (c: number, i: number): void => {
      heap.push([c, i]);
      let k = heap.length - 1;
      while (k > 0) {
        const p = (k - 1) >> 1;
        if (heap[p][0] <= heap[k][0]) break;
        [heap[p], heap[k]] = [heap[k], heap[p]];
        k = p;
      }
    };
    const pop = (): [number, number] => {
      const top = heap[0];
      const last = heap.pop() as [number, number];
      if (heap.length) {
        heap[0] = last;
        let k = 0;
        for (;;) {
          const l = 2 * k + 1, r = l + 1;
          let m = k;
          if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
          if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
          if (m === k) break;
          [heap[m], heap[k]] = [heap[k], heap[m]];
          k = m;
        }
      }
      return top;
    };
    for (const s of grid.shelterTiles) {
      if (s.x < 0 || s.y < 0 || s.x >= w || s.y >= h || grid.kindAt(s.x, s.y) === null) continue;
      this.cost[s.y * w + s.x] = 0;
      push(0, s.y * w + s.x);
    }
    while (heap.length) {
      const [c, i] = pop();
      if (c > this.cost[i]) continue;
      const x = i % w, y = (i / w) | 0;
      const kind = grid.kindAt(x, y);
      if (kind === null) continue;
      // custo de pisar neste tile (como na v3: o tile de onde se sai) / cost of stepping on this tile (as in v3: the tile being left)
      const step = stepMinutes(kind) * stepEffort(kind) * o2PerMinute;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h || grid.kindAt(nx, ny) === null) continue;
        const ni = ny * w + nx;
        if (c + step < this.cost[ni]) {
          this.cost[ni] = c + step;
          push(c + step, ni);
        }
      }
    }
  }
  /** % de O₂ para voltar a pé de (x, y), de dia. / % of O₂ to walk back from (x, y), by day. */
  at(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.grid.width || y >= this.grid.height) return ReturnCosts.UNREACHABLE;
    return this.cost[y * this.grid.width + x];
  }
}

/** O₂ necessário (%) para voltar de um custo base: folga de 20%, dobro à noite, + 2 fixos. / O₂ needed (%) from a base cost: 20% safety, double at night, + 2 fixed. */
export function returnNeed(baseCost: number, night: boolean): number {
  if (baseCost >= ReturnCosts.UNREACHABLE / 10) return 100;
  return Math.min(100, baseCost * O2.returnSafety * (night ? NIGHT_EFFECTS.returnCost : 1) + O2.returnFixed);
}
