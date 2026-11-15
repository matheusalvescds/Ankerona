/**
 * Ponto de entrada: cria o jogo Phaser 4 em 160x144, escalado sem suavização.
 * Entry point: creates the Phaser 4 game at 160x144, scaled without smoothing.
 */
import * as Phaser from 'phaser';
// Fontes do time (as mesmas do Google Fonts), servidas pelo próprio jogo: funcionam sem internet.
// Team fonts (the same as Google Fonts), served by the game itself: they work offline.
import '@fontsource/press-start-2p';
import '@fontsource/vt323';
import './ui/ui.css';
import './ui/screens.css';
import { GAME_HEIGHT, GAME_WIDTH, PALETTE } from './config';
import { BootScene } from './scenes/BootScene';
import { EndingScene } from './scenes/EndingScene';
import { EvaScene } from './scenes/EvaScene';
import { EvaUiScene } from './scenes/EvaUiScene';
import { LandingScene } from './scenes/LandingScene';
import { TeaserScene } from './scenes/TeaserScene';
import { TitleScene } from './scenes/TitleScene';
import { TravelScene } from './scenes/TravelScene';
import { mountTouchPad } from './ui/TouchPad';
import { startDeviceDetection } from './ui/device';

// Botões na tela em celulares (antes do jogo, para o jogo já medir o espaço certo).
// On-screen buttons on phones (before the game, so it measures the right space).
mountTouchPad();
// Computador, celular ou tablet: mostra os botões na tela só no toque e o nome certo do botão nos textos.
// Computer, phone or tablet: shows the on-screen pad only on touch and the right button name in texts.
startDeviceDetection();

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: PALETTE.ink,
  // pixelArt liga roundPixels e desliga o antialias. / pixelArt turns on roundPixels and turns off antialias.
  pixelArt: true,
  roundPixels: true,
  scale: {
    // FIT mantém a proporção 160:144 no computador e no celular. / FIT keeps the 160:144 ratio on desktop and mobile.
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // Container HTML para os textos de interface (ver src/ui/UiText.ts). / HTML container for UI text (see src/ui/UiText.ts).
  dom: { createContainer: true },
  input: { activePointers: 3 }, // botões na tela no celular / on-screen buttons on mobile
  // Ordem da demo. / Demo order.
  scene: [BootScene, TitleScene, TeaserScene, TravelScene, LandingScene, EvaScene, EvaUiScene, EndingScene],
});
