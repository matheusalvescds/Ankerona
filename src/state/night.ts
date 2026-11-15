/**
 * Noite marciana: avisos, início, fim e EVA abortada fora do abrigo.
 * Martian night: warnings, start, end and the EVA aborted outside shelter.
 *
 * Só lógica e chaves de texto. As cenas escutam os eventos e escurecem a câmera lendo darkness().
 * Logic and text keys only. Scenes listen to the events and darken the camera by reading darkness().
 */
import { DUSK_WARN_H, NIGHT_ABORT_AFTER_MIN, NIGHT_END_H, NIGHT_START_H, crossed, hourOfSol, isNight, minutesIntoNight, solOf } from './clock';
import type { GameEvents } from './contract';

/** Multiplicadores e custos da noite, para os outros sistemas (O₂, bateria do Tatu) usarem. / Night multipliers and costs for the other systems (O₂, Tatu battery). */
export const NIGHT_EFFECTS = {
  o2Drain: 2, // O₂ gasta o dobro / O₂ drains twice as fast
  returnCost: 2, // o O₂ de volta ao abrigo dobra (marcador VOLTA) / O₂ needed to get back doubles (RETURN marker)
  batteryPerHour: 6, // aquecimento do Tatu: −6% de bateria por hora / Tatu heating: −6% battery per hour
} as const;

export type Emit = <K extends keyof GameEvents>(event: K, payload: GameEvents[K]) => void;

export class NightSystem {
  private warnedSol = 0;
  private aborted = false;

  /** Chamado a cada tick com o tempo antes e depois. / Called each tick with the time before and after. */
  update(prev: number, now: number, sheltered: boolean, emit: Emit): void {
    const night = isNight(now);

    if (crossed(prev, now, NIGHT_START_H)) emit('night-start', undefined as never);
    if (crossed(prev, now, NIGHT_END_H)) {
      this.aborted = false;
      emit('night-end', undefined as never);
    }

    // Aviso do entardecer: uma vez por sol, entre 16h30 e 18h, se estiver fora do abrigo.
    // Dusk warning: once per sol, between 16:30 and 18:00, if outside shelter.
    const h = hourOfSol(now);
    if (h >= DUSK_WARN_H && h < NIGHT_START_H && !sheltered && this.warnedSol !== solOf(now)) {
      this.warnedSol = solOf(now);
      emit('dusk-warning', { minutesToNight: Math.round((NIGHT_START_H - h) * 60) });
    }

    // Noite fora do abrigo por 90 min (19h30): EVA abortada, uma vez por noite.
    // 90 min of night outside shelter (19:30): EVA aborted, once per night.
    if (night && !sheltered && !this.aborted && minutesIntoNight(now) >= NIGHT_ABORT_AFTER_MIN) {
      this.aborted = true;
      emit('eva-failed', { reasonKey: 'eva.fail.night' });
    }
  }
}
