/**
 * Em que aparelho a pessoa joga (computador, celular ou tablet) e com o quê (teclado ou toque).
 * Which device the player is on (computer, phone or tablet) and what they play with (keyboard or touch).
 *
 * No começo: tela de toque vira celular (lado menor até 600 px) ou tablet; o resto é computador.
 * Depois, segue o último uso: apertou uma tecla, vira teclado; tocou na tela, vira toque. Assim um tablet
 * com teclado ou um notebook com tela de toque mostram o botão certo. ?toque=1 na URL força o toque.
 * At start: a touch screen is a phone (short side up to 600 px) or a tablet; anything else is a computer.
 * After that, it follows the last input: a key press means keyboard, a touch means touch. So a tablet
 * with a keyboard or a touchscreen laptop shows the right button. ?toque=1 in the URL forces touch.
 *
 * No toque aparecem os botões na tela (classe ak-touch no <html>) e os textos dizem A e B.
 * No teclado os botões somem e os textos dizem Z e X (as teclas de A e B em controls.ts).
 * With touch the on-screen buttons show (ak-touch class on <html>) and texts say A and B.
 * With a keyboard the buttons hide and texts say Z and X (the A and B keys in controls.ts).
 */
import { refreshTexts, setButtonLabels } from '../i18n/i18n';

export type Device = 'pc' | 'phone' | 'tablet';
export type InputMode = 'keys' | 'touch';

/** Tecla mostrada para cada botão no teclado. / Key shown for each button on a keyboard. */
const KEY_LABEL = { A: 'Z', B: 'X' } as const;

function detectDevice(): Device {
  const touch = matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints > 0 && matchMedia('(hover: none)').matches);
  if (!touch) return 'pc';
  return Math.min(screen.width, screen.height) <= 600 ? 'phone' : 'tablet';
}

const device: Device = detectDevice();
const forced = new URLSearchParams(location.search).get('toque') === '1';
let mode: InputMode = forced || device !== 'pc' ? 'touch' : 'keys';

/** Aparelho detectado no começo. / Device detected at start. */
export function getDevice(): Device {
  return device;
}

/** Teclado ou toque, agora. / Keyboard or touch, right now. */
export function getInputMode(): InputMode {
  return mode;
}

/** Nome do botão como a pessoa vê: A/B no toque, Z/X no teclado. / Button name as the player sees it. */
export function buttonLabel(button: 'A' | 'B'): string {
  return mode === 'touch' ? button : KEY_LABEL[button];
}

function apply(): void {
  document.documentElement.classList.toggle('ak-touch', mode === 'touch');
  setButtonLabels({ A: buttonLabel('A'), B: buttonLabel('B') });
}

function setMode(next: InputMode): void {
  if (next === mode) return;
  mode = next;
  apply();
  // O jogo muda de tamanho com os botões na tela, e os textos trocam A por Z. / The game resizes with the pad, and texts swap A for Z.
  window.dispatchEvent(new Event('resize'));
  refreshTexts();
}

/** Liga a detecção. Chamar uma vez, antes do jogo. / Starts detection. Call once, before the game. */
export function startDeviceDetection(): void {
  apply();
  window.addEventListener('keydown', () => !forced && setMode('keys'), true);
  window.addEventListener('pointerdown', (e) => e.pointerType === 'touch' && setMode('touch'), true);
}
