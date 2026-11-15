/**
 * PROVISÓRIO: evento de partículas solares (a "tempestade solar") com os números do protótipo v3, até o Miguel
 * passar estas regras para src/state/ (eventos 'solar-alert' e 'solar-alert-end' do contrato).
 * Sem Phaser e sem texto: só fases, minutos e dose. A cena cuida do abrigo, da animação e dos avisos.
 * PROVISIONAL: solar particle event (the "solar storm") with prototype v3 numbers, until Miguel moves these
 * rules into src/state/ (the contract's 'solar-alert' and 'solar-alert-end' events).
 * No Phaser and no text: only phases, minutes and dose. The scene handles the shelter, animation and notices.
 */

/** Números do protótipo (simulados, como diz o Guia). / Prototype numbers (simulated, as the Guide says). */
export const SOLAR = {
  /** Minutos de aviso até as partículas chegarem. / Warning minutes until the particles arrive. */
  warnMin: 45,
  /** Minutos de partículas lá fora. / Minutes of particles outside. */
  activeMin: 60,
  /**
   * Dose em mSv por hora, dentro do abrigo e exposta. Dentro, a blindagem segura quase tudo (no protótipo era 10,
   * o que fazia a dose subir muito mesmo abrigada).
   * Dose in mSv per hour, inside the shelter and exposed. Inside, the shielding stops almost everything (the prototype
   * used 10, which made the dose climb a lot even when sheltered).
   */
  rateSheltered: 0.2,
  rateExposed: 90,
  /** Dentro do abrigo o tempo passa 10 vezes mais rápido. / Inside the shelter time runs 10 times faster. */
  insideSpeed: 10,
  /** Média do RAD na superfície, para comparar a dose em dias. / RAD surface average, to compare the dose in days. */
  dosePerDay: 0.64,
  /** Dose exposta que dispara cada aviso (mSv). / Exposed dose that triggers each warning (mSv). */
  steps: [20, 50, 80],
} as const;

export type SolarPhase = 'warn' | 'active' | 'done';
/** O que mudou neste passo. / What changed in this step. */
export type SolarNews = 'arrived' | 'exposed' | 'dose20' | 'dose50' | 'abort' | 'end';

export class SolarEvent {
  phase: SolarPhase = 'warn';
  /** Minutos que faltam na fase atual. / Minutes left in the current phase. */
  left: number = SOLAR.warnMin;
  /** Dose a mais por causa do evento (mSv). / Extra dose because of the event (mSv). */
  dose = 0;
  /** Dose recebida do lado de fora. / Dose received outside. */
  exposed = 0;
  /** Os sensores falharam (camadas fora do ar enquanto exposta). / Sensors failed (layers down while exposed). */
  noisy = false;
  private level = 0;

  /** Passa `gm` minutos de jogo. / Advances `gm` game minutes. */
  tick(gm: number, sheltered: boolean): SolarNews[] {
    const news: SolarNews[] = [];
    if (this.phase === 'warn') {
      this.left -= gm;
      if (this.left <= 0) {
        this.phase = 'active';
        this.left = SOLAR.activeMin;
        news.push('arrived');
      }
    } else if (this.phase === 'active') {
      const rate = sheltered ? SOLAR.rateSheltered : SOLAR.rateExposed;
      this.dose += (rate * gm) / 60;
      this.left -= gm;
      if (!sheltered) {
        this.exposed += (rate * gm) / 60;
        if (this.level < 1) {
          this.level = 1;
          this.noisy = true;
          news.push('exposed');
        } else if (this.level < 2 && this.exposed >= SOLAR.steps[0]) {
          this.level = 2;
          news.push('dose20');
        } else if (this.level < 3 && this.exposed >= SOLAR.steps[1]) {
          this.level = 3;
          news.push('dose50');
        } else if (this.level < 4 && this.exposed >= SOLAR.steps[2]) {
          this.level = 4;
          news.push('abort');
        }
      }
      if (this.left <= 0) {
        this.phase = 'done';
        this.left = 0;
        news.push('end');
      }
    }
    return news;
  }

  /** Dose comparada com dias na superfície. / Dose compared with days on the surface. */
  static days(dose: number): number {
    return Math.round(dose / SOLAR.dosePerDay);
  }
}
