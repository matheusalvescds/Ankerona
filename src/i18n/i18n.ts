/**
 * Idiomas do jogo: português e inglês.
 * Game languages: Portuguese and English.
 *
 * Os textos ficam em src/content/pt.json e en.json (revisados pelo Bruno), nunca no código.
 * Texts live in src/content/pt.json and en.json (reviewed by Bruno), never in the code.
 *
 * Uso / Usage:
 *   t('ui.play')                 -> "▶ JOGAR" ou/or "▶ PLAY"
 *   t('hud.sol', { sol: 1 })     -> substitui {sol} / replaces {sol}
 *   onLangChange(() => ...)      -> redesenhar textos ao trocar / redraw texts on switch
 *   {A} e {B} nos textos viram o botão certo: A/B no toque, Z/X no teclado (src/ui/device.ts).
 *   {A} and {B} in texts become the right button: A/B on touch, Z/X on a keyboard (src/ui/device.ts).
 */
import pt from '../content/pt.json';
import en from '../content/en.json';

export type Lang = 'pt' | 'en';
export type TextKey = keyof typeof pt;

const DICTS: Record<Lang, Record<string, string>> = { pt, en };
const STORAGE_KEY = 'ankerona-lang';
const listeners = new Set<(lang: Lang) => void>();

/** Lê o idioma salvo; se não houver, usa o do navegador. / Reads the saved language; falls back to the browser's. */
function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'pt' || saved === 'en') return saved;
  } catch {
    // localStorage pode estar bloqueado (aba anônima). / localStorage may be blocked (private tab).
  }
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

let current: Lang = initialLang();

export function getLang(): Lang {
  return current;
}

/** Troca o idioma, salva e avisa quem estiver ouvindo. / Switches language, saves it and notifies listeners. */
export function setLang(lang: Lang): void {
  if (lang === current) return;
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Sem persistência, o jogo segue funcionando. / Without persistence, the game still works.
  }
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  listeners.forEach((fn) => fn(lang));
}

export function toggleLang(): void {
  setLang(current === 'pt' ? 'en' : 'pt');
}

let buttons: { A: string; B: string } = { A: 'A', B: 'B' };

/** Nomes dos botões A e B usados nos textos. / Names of the A and B buttons used in texts. */
export function setButtonLabels(labels: { A: string; B: string }): void {
  buttons = labels;
}

/** Redesenha os textos sem trocar o idioma (ex.: trocou de teclado para toque). / Redraws texts without switching language (e.g. keyboard to touch). */
export function refreshTexts(): void {
  listeners.forEach((fn) => fn(current));
}

/** Registra um ouvinte; devolve a função para cancelar. / Registers a listener; returns the unsubscribe function. */
export function onLangChange(fn: (lang: Lang) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Texto traduzido. Se a chave faltar no idioma atual, usa o português e avisa no console.
 * Translated text. If the key is missing in the current language, falls back to Portuguese and warns.
 */
export function t(key: TextKey, vars?: Record<string, string | number>): string {
  let text = DICTS[current][key];
  if (text === undefined) {
    console.warn(`[i18n] chave sem tradução / missing key: ${current}.${key}`);
    text = DICTS.pt[key] ?? key;
  }
  if (vars) {
    for (const [name, value] of Object.entries(vars)) text = text.split(`{${name}}`).join(String(value));
  }
  // ◀ e ▶ seguidos de U+FE0E ficam como texto, não emoji (iPhone). / ◀ and ▶ followed by U+FE0E stay text, not emoji (iPhone).
  return text.split('{A}').join(buttons.A).split('{B}').join(buttons.B).replace(/[\u25B6\u25C0](?!\uFE0E)/g, '$&\uFE0E');
}

/** Formata número no padrão do idioma (1.234,5 / 1,234.5). / Formats numbers per language. */
export function formatNumber(value: number, digits = 0): string {
  return value.toLocaleString(current === 'pt' ? 'pt-BR' : 'en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

document.documentElement.lang = current === 'pt' ? 'pt-BR' : 'en';
