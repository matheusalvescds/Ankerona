/**
 * Relógio marciano e noite: funções puras, sem Phaser e sem texto.
 * Martian clock and night: pure functions, no Phaser and no text.
 *
 * Tempo em "minutos de jogo desde 00:00 do sol 1" (mesma unidade do contrato: HudSnapshot.minutes).
 * Time in "game minutes since 00:00 of sol 1" (same unit as the contract: HudSnapshot.minutes).
 * Dados: um sol dura 24h39min35s; em Gale o REMS (Curiosity) mediu ~0 °C de máxima e ~−70 °C de mínima.
 * Data: a sol lasts 24h39min35s; at Gale the Curiosity REMS measured ~0 °C highs and ~−70 °C lows.
 */

/** Duração do sol em minutos (24h39min35s). / Length of a sol in minutes. */
export const SOL_MINUTES = 1479.5;

/** Horários do dia, em horas do sol. / Times of day, in sol hours. */
export const NIGHT_START_H = 18; // a noite começa às 18h / night starts at 18:00
export const NIGHT_END_H = 6; // e termina às 06h / and ends at 06:00
export const DUSK_WARN_H = 16.5; // aviso do comandante / commander's warning
/** Depois de quanto tempo de noite, fora do abrigo, a EVA é abortada (19h30). / Night time outside shelter before the EVA is aborted (19:30). */
export const NIGHT_ABORT_AFTER_MIN = 90;

/** Chaves [hora, escuridão 0–1] da câmera: entardecer a partir de 17h, noite plena às 19h. / Camera keys [hour, darkness 0–1]. */
const DARKNESS_KEYS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [5.5, 1],
  [6.5, 0.2],
  [7.5, 0],
  [17, 0],
  [18, 0.6],
  [19, 1],
  [24.7, 1],
];

/** Minutos desde 00:00 do sol atual (0 a 1479,5). / Minutes since 00:00 of the current sol. */
export function minuteOfSol(totalMinutes: number): number {
  return ((totalMinutes % SOL_MINUTES) + SOL_MINUTES) % SOL_MINUTES;
}

/** Hora do sol (0 a 24,65). / Sol hour (0 to 24.65). */
export function hourOfSol(totalMinutes: number): number {
  return minuteOfSol(totalMinutes) / 60;
}

/** Número do sol, começando em 1. / Sol number, starting at 1. */
export function solOf(totalMinutes: number): number {
  return 1 + Math.floor(totalMinutes / SOL_MINUTES);
}

/** É noite? Depois das 18h e antes das 06h. / Is it night? After 18:00 and before 06:00. */
export function isNight(totalMinutes: number): boolean {
  const h = hourOfSol(totalMinutes);
  return h >= NIGHT_START_H || h < NIGHT_END_H;
}

/** Minutos desde as 18h da noite atual (0 se for dia). / Minutes since 18:00 of the current night (0 by day). */
export function minutesIntoNight(totalMinutes: number): number {
  if (!isNight(totalMinutes)) return 0;
  const m = minuteOfSol(totalMinutes);
  return m >= NIGHT_START_H * 60 ? m - NIGHT_START_H * 60 : m + (SOL_MINUTES - NIGHT_START_H * 60);
}

/** Escuridão para a câmera: 0 = dia claro, 1 = noite plena. / Camera darkness: 0 = bright day, 1 = full night. */
export function darkness(totalMinutes: number): number {
  const h = hourOfSol(totalMinutes);
  for (let i = 1; i < DARKNESS_KEYS.length; i++) {
    const [h1, d1] = DARKNESS_KEYS[i];
    if (h <= h1) {
      const [h0, d0] = DARKNESS_KEYS[i - 1];
      return d0 + ((d1 - d0) * (h - h0)) / (h1 - h0);
    }
  }
  return 1;
}

/** Luz solar útil, 0 a 1 (0 à noite, pico ao meio-dia). Usada nos painéis do Tatu. / Usable sunlight, 0 to 1 (0 at night, peak at noon). Used by the Tatu's panels. */
export function daylight(totalMinutes: number): number {
  const h = hourOfSol(totalMinutes);
  if (h <= NIGHT_END_H || h >= NIGHT_START_H) return 0;
  return Math.sin((Math.PI * (h - NIGHT_END_H)) / (NIGHT_START_H - NIGHT_END_H));
}

/** Temperatura do ar em °C: máxima ~0 às 14h, mínima ~−70 às 02h. / Air temperature in °C: ~0 high at 14:00, ~−70 low at 02:00. */
export function tempC(totalMinutes: number): number {
  const h = hourOfSol(totalMinutes);
  return -35 + 35 * Math.cos((2 * Math.PI * (h - 14)) / 24.65);
}

/** O ponto de uma hora do sol foi cruzado entre dois instantes? (funciona na virada do sol) / Was a sol-hour mark crossed between two instants? (works across sol rollover) */
export function crossed(prev: number, now: number, hour: number): boolean {
  const at = hour * 60;
  return Math.floor((now - at) / SOL_MINUTES) > Math.floor((prev - at) / SOL_MINUTES);
}
