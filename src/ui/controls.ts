/**
 * Controles do time, iguais em todas as cenas.
 * Team controls, the same in every scene.
 *
 *   Setas / WASD       andar (duas juntas: diagonal) / walk (two together: diagonal)
 *   Z, Enter, Espaço   A: confirmar / confirm
 *   X, Esc, Backspace  B: voltar / back
 *   C                  trocar a camada / switch layer
 *   G                  Guia de Campo / Field Guide
 *   V                  zoom da câmera / camera zoom
 *
 * Os botões na tela (src/ui/TouchPad.ts e os botões do HUD) mandam as mesmas ações pelo inputBus,
 * então cada cena escuta teclado e toque do mesmo jeito.
 * On-screen buttons (src/ui/TouchPad.ts and the HUD buttons) send the same actions through inputBus,
 * so every scene hears keyboard and touch the same way.
 */
import * as Phaser from 'phaser';

export type Action = 'A' | 'B' | 'layer' | 'guide' | 'zoom' | 'map' | 'tatu';
export type Dir = 'up' | 'down' | 'left' | 'right';

const ACTION_KEYS: Record<Action, string[]> = {
  A: ['Z', 'ENTER', 'SPACE'],
  B: ['X', 'ESC', 'BACKSPACE'],
  layer: ['C', 'L'],
  guide: ['G'],
  zoom: ['V'],
  map: ['M'],
  tatu: ['T'],
};

const DIR_KEYS: Record<Dir, string[]> = {
  up: ['UP', 'W'],
  down: ['DOWN', 'S'],
  left: ['LEFT', 'A'],
  right: ['RIGHT', 'D'],
};

/**
 * Canal dos botões na tela. Eventos: 'action' (Action), 'dir-down' (Dir), 'dir-up' (Dir) e 'dir-press' (Dir).
 * 'dir-down' e 'dir-up' dizem o que está segurado (na diagonal são duas direções juntas); 'dir-press' é um toque
 * de menu, uma direção só por vez.
 * Channel for on-screen buttons. Events: 'action' (Action), 'dir-down' (Dir), 'dir-up' (Dir) and 'dir-press' (Dir).
 * 'dir-down' and 'dir-up' say what is held (a diagonal is two directions at once); 'dir-press' is a menu press,
 * one direction at a time.
 */
export const inputBus = new Phaser.Events.EventEmitter();

/** Ouve o canal até a cena fechar. / Listens to the channel until the scene shuts down. */
function listenBus(scene: Phaser.Scene, event: string, fn: (value: never) => void): void {
  inputBus.on(event, fn);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => inputBus.off(event, fn));
}

/** Liga as ações da cena (teclado e toque). Desliga sozinho quando a cena fecha. / Binds the scene's actions (keyboard and touch). Unbinds on shutdown. */
export function onAction(scene: Phaser.Scene, fn: (action: Action) => void): void {
  const kb = scene.input.keyboard;
  if (kb) {
    for (const [action, keys] of Object.entries(ACTION_KEYS) as [Action, string[]][]) {
      for (const key of keys) kb.on(`keydown-${key}`, (e: KeyboardEvent) => {
        if (!e.repeat) fn(action);
      });
    }
  }
  listenBus(scene, 'action', fn);
}

/** Avisa a cada direção apertada (sem repetir ao segurar). Usado em menus. / Fires on each direction press (no hold repeat). Used in menus. */
export function onDirPress(scene: Phaser.Scene, fn: (dir: Dir) => void): void {
  const kb = scene.input.keyboard;
  if (kb) {
    for (const [dir, keys] of Object.entries(DIR_KEYS) as [Dir, string[]][]) {
      for (const key of keys) kb.on(`keydown-${key}`, (e: KeyboardEvent) => {
        if (!e.repeat) fn(dir);
      });
    }
  }
  listenBus(scene, 'dir-press', fn);
}

/** Direções seguradas agora, da mais recente para a mais antiga. / Directions held now, newest first. */
export class HeldDirs {
  private held: Dir[] = [];

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard;
    if (kb) {
      for (const [dir, keys] of Object.entries(DIR_KEYS) as [Dir, string[]][]) {
        for (const key of keys) {
          kb.on(`keydown-${key}`, () => this.press(dir));
          kb.on(`keyup-${key}`, () => this.release(dir));
        }
      }
    }
    listenBus(scene, 'dir-down', (d: Dir) => this.press(d));
    listenBus(scene, 'dir-up', (d: Dir) => this.release(d));
    const clear = () => (this.held = []);
    window.addEventListener('blur', clear);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => window.removeEventListener('blur', clear));
  }

  press(dir: Dir): void {
    if (!this.held.includes(dir)) this.held.unshift(dir);
  }

  release(dir: Dir): void {
    this.held = this.held.filter((d) => d !== dir);
  }

  clear(): void {
    this.held = [];
  }

  get current(): Dir | undefined {
    return this.held[0];
  }

  /**
   * Passo somando as direções seguradas: uma na horizontal e uma na vertical viram diagonal.
   * Se as duas de um eixo estão seguradas, vale a mais recente.
   * Step adding up the held directions: one horizontal and one vertical make a diagonal.
   * If both directions of one axis are held, the newest wins.
   */
  get step(): [number, number] | undefined {
    const h = this.held.find((d) => d === 'left' || d === 'right');
    const v = this.held.find((d) => d === 'up' || d === 'down');
    if (!h && !v) return undefined;
    return [h === 'left' ? -1 : h === 'right' ? 1 : 0, v === 'up' ? -1 : v === 'down' ? 1 : 0];
  }
}
