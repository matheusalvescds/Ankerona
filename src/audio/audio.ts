/**
 * Trilha e efeitos sonoros do jogo. As cenas só chamam playMusic('eva') ou play('passo').
 * Game music and sound effects. Scenes only call playMusic('eva') or play('passo').
 *
 * Os efeitos e a música do menu carregam na BootScene. As outras músicas (a do prólogo tem uns 5 MB) carregam
 * só quando a cena pede, para o jogo abrir rápido.
 * Effects and the menu music load in BootScene. The other tracks (the prologue is about 5 MB) load only when
 * a scene asks for them, so the game opens fast.
 *
 * O navegador só deixa tocar som depois do primeiro toque ou tecla. Se a música for pedida antes, ela começa
 * nesse primeiro toque.
 * The browser only allows sound after the first tap or key press. If music is asked for earlier, it starts
 * on that first tap.
 */
import * as Phaser from 'phaser';
import { assetUrl } from '../ui/UiText';

const A = 'assets/audio/';

/** Músicas: [arquivo, volume]. Todas tocam em loop. / Music: [file, volume]. All of them loop. */
const MUSIC = {
  menu: ['musica/menu.mp3', 0.45], // título e final / title and ending
  prologo: ['musica/prologo.mp3', 0.6], // teaser, viagem e pouso / teaser, travel and landing
  eva: ['musica/gale.mp3', 0.55], // EVA na Cratera Gale / EVA in Gale Crater
} as const;

/** Efeitos: [arquivo, volume]. / Effects: [file, volume]. */
const SFX = {
  passo: ['efeitos/passo.wav', 0.3], // cada passo da Ana / each step Ana takes
  camada: ['efeitos/troca_camada.wav', 0.6], // trocar a camada de dados (C ou L) / switching the data layer (C or L)
  alertaSolar: ['efeitos/alerta_solar.wav', 0.7], // aviso e chegada do evento solar / solar event warning and arrival
} as const;

export type MusicId = keyof typeof MUSIC;
export type SfxId = keyof typeof SFX;

const key = (id: string) => `audio-${id}`;
const FADE_MS = 600;

/** Música tocando agora (o gerenciador de som é um só para o jogo todo). / Music playing now (one sound manager for the whole game). */
let current: { id: MusicId; sound: Phaser.Sound.BaseSound } | null = null;
/** Última música pedida (pode ainda estar carregando). / Last music asked for (may still be loading). */
let wanted: MusicId | null = null;

/** Carrega os efeitos e a música do menu. Chamado no preload da BootScene. / Loads effects and the menu music. Called from BootScene preload. */
export function preloadAudio(scene: Phaser.Scene): void {
  for (const [id, [file]] of Object.entries(SFX)) scene.load.audio(key(id), assetUrl(A + file));
  scene.load.audio(key('menu'), assetUrl(A + MUSIC.menu[0]));
}

/** Toca um efeito, se já estiver carregado. / Plays an effect, if already loaded. */
export function play(scene: Phaser.Scene, id: SfxId, detune = 0): void {
  if (scene.sound.locked || !scene.cache.audio.exists(key(id))) return;
  scene.sound.play(key(id), { volume: SFX[id][1], detune });
}

/**
 * Troca a música com fade. Pedir a mesma que já toca não faz nada. Se o arquivo ainda não carregou, carrega e
 * toca quando chegar (se ninguém tiver pedido outra nesse meio-tempo).
 * Switches music with a fade. Asking for the one already playing does nothing. If the file is not loaded yet,
 * it loads it and plays when it arrives (unless another one was asked for in the meantime).
 */
export function playMusic(scene: Phaser.Scene, id: MusicId): void {
  wanted = id;
  if (current?.id === id) return;
  const k = key(id);
  if (!scene.cache.audio.exists(k)) {
    scene.load.audio(k, assetUrl(A + MUSIC[id][0]));
    scene.load.once(`filecomplete-audio-${k}`, () => {
      if (wanted === id && scene.sys.isActive()) playMusic(scene, id);
    });
    scene.load.start();
    return;
  }
  if (scene.sound.locked) {
    scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
      if (wanted === id && scene.sys.isActive()) playMusic(scene, id);
    });
    return;
  }
  fadeOut(scene);
  const sound = scene.sound.add(k, { loop: true, volume: 0 });
  sound.play();
  scene.tweens.add({ targets: sound, volume: MUSIC[id][1], duration: FADE_MS });
  current = { id, sound };
}

/** Para a música com fade. / Stops the music with a fade. */
export function stopMusic(scene: Phaser.Scene): void {
  wanted = null;
  fadeOut(scene);
}

function fadeOut(scene: Phaser.Scene): void {
  if (!current) return;
  const old = current.sound;
  current = null;
  scene.tweens.add({ targets: old, volume: 0, duration: FADE_MS, onComplete: () => old.destroy() });
}

/**
 * Baixa as músicas maiores em segundo plano (no título), para elas já estarem no cache do navegador quando a
 * cena pedir.
 * Downloads the bigger tracks in the background (on the title screen), so they are already in the browser cache
 * when a scene asks for them.
 */
export function prefetchMusic(): void {
  for (const id of ['prologo', 'eva'] as const) fetch(assetUrl(A + MUSIC[id][0])).catch(() => undefined);
}
