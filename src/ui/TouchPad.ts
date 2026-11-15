/**
 * Botões na tela para celular: direcional, A e B, como no console do protótipo.
 * O direcional é deslizante e tem 8 direções: arrastar o dedo troca a direção, e entre duas setas vale a diagonal.
 * O padrão é um joystick; com ?joystick=0 na URL volta o direcional de setas (também deslizante, com 8 direções).
 * On-screen buttons for mobile: d-pad, A and B, like the prototype's console.
 * The d-pad slides and has 8 directions: dragging the finger changes direction, and between two arrows it's a diagonal.
 * The default is a joystick; with ?joystick=0 in the URL the arrow d-pad comes back (also sliding, with 8 directions).
 *
 * Aparece sozinho em celular e tablet, ou quando a pessoa toca na tela; some quando ela usa o teclado
 * (classe ak-touch, colocada por src/ui/device.ts). ?toque=1 na URL força os botões em qualquer tela.
 * C (camada), G (guia) e V (zoom) ficam como botões no próprio HUD da EVA.
 * Shows up by itself on phones and tablets, or when the player touches the screen; hides when they use the
 * keyboard (ak-touch class, set by src/ui/device.ts). ?toque=1 in the URL forces the buttons on any screen.
 * C (layer), G (guide) and V (zoom) are buttons on the EVA HUD itself.
 */
import { onLangChange, t, type TextKey } from '../i18n/i18n';
import { arrowSvg } from './arrows';
import { inputBus, type Action, type Dir } from './controls';

const DIR_LABEL: Record<Dir, TextKey> = { up: 'pad.up', down: 'pad.down', left: 'pad.left', right: 'pad.right' };

/** Joystick é o padrão; ?joystick=0 mostra o direcional de setas. / Joystick is the default; ?joystick=0 shows the arrow d-pad. */
const JOYSTICK = new URLSearchParams(location.search).get('joystick') !== '0';
/**
 * Diagonal quando o lado menor passa de tan(27,5°): cada diagonal pega 35° e cada seta 55°, para as setas
 * continuarem fáceis de acertar.
 * Diagonal when the smaller side passes tan(27.5°): each diagonal takes 35° and each arrow 55°, so the arrows
 * stay easy to hit.
 */
const DIAGONAL = Math.tan((27.5 * Math.PI) / 180);

/** Cria o controle na página. O CSS decide quando ele aparece. / Creates the pad on the page. CSS decides when it shows. */
export function mountTouchPad(): void {
  const pad = document.createElement('div');
  pad.className = 'ak-pad';
  const dirs = (['up', 'left', 'right', 'down'] as Dir[])
    .map((d) => `<button class="${d}" data-dir="${d}">${arrowSvg(d)}</button>`)
    .join('');
  const stick = JOYSTICK ? `<div class="dpad joy"><span class="knob"></span></div>` : `<div class="dpad">${dirs}<span class="c"></span></div>`;
  pad.innerHTML = `${stick}<div class="ab"><button class="b" data-act="B">B</button><button class="a" data-act="A">A</button></div>`;
  document.body.appendChild(pad);

  // Direcional deslizante: o quadrado todo é uma área só. A direção vem de onde o dedo está em relação ao centro,
  // e arrastar o dedo troca a direção sem precisar levantar. Na diagonal ficam duas direções seguradas juntas.
  // Sliding d-pad: the whole square is one area. The direction comes from where the finger is relative to the
  // center, and dragging the finger changes direction without lifting it. A diagonal holds two directions together.
  const dpad = pad.querySelector<HTMLDivElement>('.dpad')!;
  const knob = dpad.querySelector<HTMLSpanElement>('.knob');
  let finger: number | null = null;
  let held: Dir[] = [];
  let main: Dir | null = null;
  const hold = (dirs: Dir[]) => {
    for (const d of held.filter((d) => !dirs.includes(d))) {
      dpad.querySelector(`.${d}`)?.classList.remove('on');
      inputBus.emit('dir-up', d);
    }
    // A mais forte entra por último, para ser a mais recente. / The stronger one goes in last, so it is the newest.
    for (const d of dirs.filter((d) => !held.includes(d)).reverse()) {
      dpad.querySelector(`.${d}`)?.classList.add('on');
      inputBus.emit('dir-down', d);
    }
    held = dirs;
    // Menus recebem uma direção só: a do eixo mais forte. / Menus get one direction only: the stronger axis.
    const next = dirs[0] ?? null;
    if (next && next !== main) inputBus.emit('dir-press', next);
    main = next;
  };
  const dirsAt = (e: PointerEvent): Dir[] => {
    const r = dpad.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy), max = r.width / 2 - (knob ? knob.offsetWidth / 2 : 0);
    // A bolinha do joystick segue o dedo até a borda. / The joystick knob follows the finger up to the edge.
    if (knob) {
      const k = len > max ? max / len : 1;
      knob.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
    }
    // No meio (até 1/6 do tamanho) não anda. / In the middle (up to 1/6 of the size) it does not move.
    if (len < r.width / 6) return [];
    const h: Dir = dx > 0 ? 'right' : 'left', v: Dir = dy > 0 ? 'down' : 'up';
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (Math.min(ax, ay) > Math.max(ax, ay) * DIAGONAL) return ax > ay ? [h, v] : [v, h];
    return [ax > ay ? h : v];
  };
  dpad.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (finger !== null) return;
    finger = e.pointerId;
    dpad.setPointerCapture?.(e.pointerId);
    dpad.classList.add('held');
    hold(dirsAt(e));
  });
  dpad.addEventListener('pointermove', (e) => {
    if (e.pointerId === finger) hold(dirsAt(e));
  });
  const release = (e: PointerEvent) => {
    if (e.pointerId !== finger) return;
    finger = null;
    dpad.classList.remove('held');
    if (knob) knob.style.transform = '';
    hold([]);
  };
  dpad.addEventListener('pointerup', release);
  dpad.addEventListener('pointercancel', release);
  dpad.addEventListener('lostpointercapture', release);

  // Toques nos espaços entre os botões não chegam na página (evita seleção e zoom no celular).
  // Taps on the gaps between buttons do not reach the page (avoids selection and zoom on phones).
  for (const area of [dpad, pad.querySelector<HTMLDivElement>('.ab')!]) {
    area.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    area.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  document.addEventListener('selectstart', (e) => e.preventDefault());

  pad.querySelectorAll<HTMLButtonElement>('[data-act]').forEach((bt) => {
    bt.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      inputBus.emit('action', bt.dataset.act as Action);
    });
  });

  const labels = () => {
    pad.setAttribute('aria-label', t('pad.label'));
    pad.querySelectorAll<HTMLButtonElement>('[data-dir]').forEach((bt) => bt.setAttribute('aria-label', t(DIR_LABEL[bt.dataset.dir as Dir])));
    pad.querySelector('.a')!.setAttribute('aria-label', t('pad.a'));
    pad.querySelector('.b')!.setAttribute('aria-label', t('pad.b'));
  };
  labels();
  onLangChange(labels);
}
