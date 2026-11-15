/**
 * Evento de partículas solares (SPE): alerta, chegada das partículas, dose e fim.
 * Solar particle event (SPE): warning, particle arrival, dose and end.
 *
 * Só lógica, sem Phaser e sem texto. Regras e números vêm do protótipo v3 (guia-sobrevivencia-v3.html).
 * Logic only, no Phaser and no text. Rules and numbers come from the v3 prototype.
 * Ciência / Science: o RAD (Curiosity) mediu ~0,64 mSv/dia na superfície; uma erupção solar pode elevar a dose em pouco tempo.
 * The RAD (Curiosity) measured ~0.64 mSv/day on the surface; a solar flare can raise the dose in a short time.
 */
import type { Emit } from './night';

export const SOLAR = {
  warnMinutes: 45, // do alerta à chegada das partículas (o diário do jogo fala em 45 min) / from alert to particle arrival (the game diary says 45 min)
  activeMinutes: 40, // duração das partículas / how long the particles last
  doseRateOpen: 2.0, // mSv por hora, fora do abrigo / mSv per hour, outside shelter
  doseRateShelter: 0.05, // mSv por hora, abrigada / mSv per hour, sheltered
  shelterTimeFactor: 4, // abrigada durante o evento, o tempo corre 4x / sheltered during the event, time runs 4x
} as const;

export type SolarPhase = 'none' | 'warn' | 'active' | 'done';

export class SolarEventSystem {
  phase: SolarPhase = 'none';
  /** Minutos que faltam: para as partículas chegarem (warn) ou para o fim (active). / Minutes left: until the particles arrive (warn) or until the end (active). */
  left = 0;
  private doseStart = 0;

  get running(): boolean {
    return this.phase === 'warn' || this.phase === 'active';
  }

  /** Começa o evento (a cena escolhe o momento da história). Devolve false se já começou. / Starts the event (the scene picks the story moment). Returns false if it already began. */
  start(dose: number, emit: Emit): boolean {
    if (this.phase !== 'none') return false;
    this.phase = 'warn';
    this.left = SOLAR.warnMinutes;
    this.doseStart = dose;
    emit('solar-alert', { minutesToShelter: SOLAR.warnMinutes });
    return true;
  }

  /** Taxa de dose do evento (mSv/h), ou null se as partículas não estão chegando agora. / Event dose rate (mSv/h), or null if particles are not arriving right now. */
  doseRate(sheltered: boolean): number | null {
    if (this.phase !== 'active') return null;
    return sheltered ? SOLAR.doseRateShelter : SOLAR.doseRateOpen;
  }

  /** Passa `m` minutos. `dose` é a dose total já com este intervalo somado. / Advances `m` minutes. `dose` is the total dose already including this interval. */
  advance(m: number, dose: number, emit: Emit): void {
    if (this.phase === 'warn') {
      this.left -= m;
      if (this.left <= 0) {
        this.phase = 'active';
        this.left = SOLAR.activeMinutes;
        emit('solar-arrival', undefined as never);
      }
    } else if (this.phase === 'active') {
      this.left -= m;
      if (this.left <= 0) this.finish(dose, emit);
    }
  }

  /** Encerra o evento agora (também usado ao pular para o próximo sol). / Ends the event now (also used when skipping to the next sol). */
  finish(dose: number, emit: Emit): number {
    if (!this.running) return 0;
    this.phase = 'done';
    this.left = 0;
    const received = dose - this.doseStart;
    emit('solar-alert-end', { doseMSv: received });
    emit('guide-unlocked', { entryId: 'spe' }); // abre o verbete do Guia / opens the Guide entry
    return received;
  }
}
