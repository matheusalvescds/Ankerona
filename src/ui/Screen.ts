/**
 * Camada HTML do tamanho da tela (160x144, ou o dobro na EVA), por cima do canvas.
 * Screen-sized HTML layer (160x144, or double in the EVA), on top of the canvas.
 *
 * Usada pelas telas que, no protótipo, eram HTML: Teaser, Pouso, Epílogo e a caixa de diálogo.
 * Os estilos ficam em src/ui/screens.css, com as mesmas classes do protótipo.
 * Used by the screens that were HTML in the prototype: Teaser, Landing, Epilogue and the dialogue box.
 * Styles live in src/ui/screens.css, with the prototype's own class names.
 */
import * as Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

export interface ScreenLayer {
  root: HTMLDivElement;
  obj: Phaser.GameObjects.DOMElement;
  /** Troca todo o conteúdo. / Replaces all content. */
  set(html: string): void;
  /** Busca um elemento dentro da camada. / Finds an element inside the layer. */
  find<T extends HTMLElement = HTMLElement>(selector: string): T | null;
}

export function screenLayer(scene: Phaser.Scene, depth = 10): ScreenLayer {
  const root = document.createElement('div');
  root.className = 'ak-screen';
  // Acompanha o tamanho da tela do jogo (a EVA usa o dobro). Como o CSS usa cqw, o conteúdo escala junto.
  // Follows the game screen size (the EVA uses double). Since the CSS uses cqw, the content scales with it.
  const fit = () => {
    root.style.width = `${scene.scale.width || GAME_WIDTH}px`;
    root.style.height = `${scene.scale.height || GAME_HEIGHT}px`;
  };
  fit();
  scene.scale.on(Phaser.Scale.Events.RESIZE, fit);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.scale.off(Phaser.Scale.Events.RESIZE, fit));
  const obj = scene.add.dom(0, 0, root).setOrigin(0, 0).setDepth(depth);
  // Fica parada na tela mesmo se a câmera andar. / Stays fixed on screen even when the camera moves.
  obj.setScrollFactor(0);
  // O Phaser põe pointer-events: auto e display: block na camada; sem isto, uma camada escondida (ex.: o Guia)
  // ficava por cima e roubava os cliques (era o bug dos botões do final). Só os botões recebem clique.
  // Phaser sets pointer-events: auto and display: block on the layer; without this, a hidden layer (e.g. the Guide)
  // sat on top and stole clicks (that was the ending buttons bug). Only buttons take clicks.
  obj.pointerEvents = 'none';
  return {
    root,
    obj,
    set(html: string) {
      root.innerHTML = html;
    },
    find<T extends HTMLElement = HTMLElement>(selector: string) {
      return root.querySelector<T>(selector);
    },
  };
}

/** Escapa texto para colocar em HTML. / Escapes text for use inside HTML. */
export function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
