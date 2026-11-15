/**
 * Entradas do Guia de Campo: 9 na rota e 3 extras escondidas, na ordem do protótipo.
 * Field Guide entries: 9 on the route and 3 hidden extras, in the prototype's order.
 *
 * Os textos (título, dado, lição, fonte, diário e legenda da foto) ficam em pt.json/en.json:
 *   guide.<id>.title | .body | .lesson | .src, diary.<id>, photo.<id>.caption
 * Texts (title, fact, lesson, source, diary and photo caption) live in pt.json/en.json.
 *
 * Também guarda quais entradas já foram registradas na partida.
 * Also keeps which entries were recorded in this run.
 */
import type { TextKey } from '../i18n/i18n';

export interface GuideEntry {
  id: string;
  /** Extra escondida, fora da rota. / Hidden extra, off the route. */
  extra?: boolean;
  /** Foto real da NASA em public/assets/guide/. / Real NASA photo in public/assets/guide/. */
  photo?: string;
}

export const GUIDE: GuideEntry[] = [
  { id: 'cruise' },
  { id: 'env' },
  { id: 'dust' },
  { id: 'water', photo: 'PIA17595' },
  { id: 'sand', photo: 'PIA20284' },
  { id: 'power' },
  { id: 'spe' },
  { id: 'rocks', photo: 'PIA20334' },
  { id: 'box', photo: 'PIA26559' },
  { id: 'erosion', extra: true, photo: 'PIA17595' },
  { id: 'namib', extra: true, photo: 'PIA20284' },
  { id: 'sulfur', extra: true, photo: 'PIA26309' },
];

export const GUIDE_TOTAL = GUIDE.length;

/** Chave de texto de uma parte da entrada. / Text key for one part of an entry. */
export function guideKey(id: string, part: 'title' | 'body' | 'lesson' | 'src'): TextKey {
  return `guide.${id}.${part}` as TextKey;
}

// ---------------------------------------------------------------- progresso / progress

const unlocked = new Set<string>();
const listeners = new Set<(id: string) => void>();

/**
 * Registra uma entrada. Devolve true se for nova (e avisa quem estiver ouvindo).
 * Quando o estado do Miguel existir, o evento 'guide-unlocked' dele chama esta função.
 * Records an entry. Returns true if it is new (and notifies listeners).
 * Once Miguel's state exists, its 'guide-unlocked' event calls this function.
 */
export function unlockGuide(id: string): boolean {
  if (unlocked.has(id) || !GUIDE.some((g) => g.id === id)) return false;
  unlocked.add(id);
  listeners.forEach((fn) => fn(id));
  return true;
}

export function hasGuide(id: string): boolean {
  return unlocked.has(id);
}

export function guideCount(): { total: number; extras: number } {
  return { total: unlocked.size, extras: GUIDE.filter((g) => g.extra && unlocked.has(g.id)).length };
}

/** Partida nova: guia vazio. / New run: empty guide. */
export function resetGuide(): void {
  unlocked.clear();
}

/** Ouve entradas novas; devolve a função para cancelar. / Listens for new entries; returns the unsubscribe function. */
export function onGuideUnlock(fn: (id: string) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
