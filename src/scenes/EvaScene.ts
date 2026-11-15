/**
 * EVA: caminhada pela Cratera Gale em visão de cima, nas três fases do protótipo.
 * EVA: top-down walk through Gale Crater, in the prototype's three phases.
 *
 *   Fase 1 / Phase 1: Yellowknife Bay (tutorial, camada Minerais / Minerals layer)
 *   Fase 2 / Phase 2: Dunas Bagnold (areia fofa, camada Terreno / soft sand, Terrain layer)
 *   Fase 3 / Phase 3: formações boxwork (amostra) e volta ao habitat / boxwork (sample) and back to the habitat
 *
 * O que é do Jonatha aqui: cena, câmera (V muda o zoom), personagens, diálogos, HUD, seta de objetivo,
 * Guia de Campo (G) e a passagem entre fases.
 * O que NÃO é: regras de O₂, bateria, traje, evento solar e noite (Miguel, src/state/), o mapa real e o
 * desenho das camadas de dados (Arthur, src/map/). O estado vem de src/state/GameState.ts (Miguel); a cena só
 * avisa quando a Ana está no abrigo, escurece a tela e mostra os avisos. O mapa ainda é ./eva/mapaProvisorio.ts.
 * Jonatha's part here: scene, camera (V toggles zoom), characters, dialogue, HUD, objective arrow,
 * Field Guide (G) and phase flow.
 * Not Jonatha's: O₂, battery, suit, solar event and night rules (Miguel, src/state/), the real map and
 * drawing the data layers (Arthur, src/map/). The state comes from src/state/GameState.ts (Miguel); the scene only
 * reports when Ana is sheltered, darkens the screen and shows the notices. The map is still ./eva/mapaProvisorio.ts.
 *
 * Evento solar: as regras ainda estão em ./eva/eventoSolarProvisorio.ts (até irem para src/state/). Aqui fica o abrigo:
 * A perto do habitat ou do rover entra, A dentro sai; a tripulação perto entra junto e só sai quando o evento acaba.
 * Solar event: the rules still live in ./eva/eventoSolarProvisorio.ts (until they move to src/state/). The shelter lives here:
 * A next to the habitat or the rover goes in, A inside goes out; nearby crew go in too and only come out when the event ends.
 */
import * as Phaser from 'phaser';
import { EVA_PIXEL, GAME_HEIGHT, GAME_WIDTH, SCENES, TILE_SIZE as T } from '../config';
import { formatNumber, onLangChange, t, type TextKey } from '../i18n/i18n';
import type { DialogBox, Line } from '../ui/DialogBox';
import { HeldDirs, onAction, onDirPress, type Action, type Dir } from '../ui/controls';
import { guideCount, onGuideUnlock, unlockGuide, guideKey } from '../ui/guideEntries';
import { ART, type ArtKey } from './art';
import type { TargetBrief } from '../ui/TatuPanel';
import type { HudSnapshot } from '../state/contract';
import { buttonLabel } from '../ui/device';
import type { EndingData } from './EndingScene';
import type { EvaUiScene } from './EvaUiScene';
import { GameState, type LayerId } from '../state/GameState';
import { O2 } from '../state/oxygen';
import { loadMap } from '../map/MapLoader';
import { buildTempMap, TILE, type CrewId, type EvaMap, type Point, type Rect } from './eva/mapaProvisorio';
import { renderMap, SAND_FRAMES, sandBox } from './eva/renderMap';
import { SOLAR, SolarEvent, type SolarNews } from './eva/eventoSolarProvisorio';
import { hash, P } from './pixelArt';
import { MapLayerOverlay, type LayerMode } from '../renderer/MapLayerOverlay';
import type { GaleMapView } from './eva/GaleMapOverlay';
import { play, playMusic } from '../audio/audio';

/** Etapas da missão (a 2, evento solar, é do Miguel). / Mission steps (step 2, solar event, is Miguel's). */
const STEP = { ykb: 0, bag: 1, solar: 2, box: 3, home: 4 } as const;
type Step = (typeof STEP)[keyof typeof STEP];

export interface EvaData {
  /** Para o modo de teste: começar numa etapa. / For test mode: start at a step. */
  step?: Step;
  pos?: Point;
  /** Para o modo de teste: hora do sol em que a EVA começa. / For test mode: sol hour the EVA starts at. */
  hour?: number;
}

interface Walker {
  x: number;
  y: number;
  ox: number;
  oy: number;
  /** Progresso do passo, 0 a 1. / Step progress, 0 to 1. */
  mt: number;
  dur: number;
  dir: Dir;
}

const DIRS: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
/** Para onde olhar num passo (na diagonal, para o lado). / Where to face on a step (sideways on a diagonal). */
const dirOf = ([dx, dy]: [number, number]): Dir => (dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down');
// Na EVA a tela tem 2 pixels por pixel do jogo: personagens, Tatu, veículos e rochas usam a arte 2x com escala 0,5 (como no protótipo).
// In the EVA the screen has 2 pixels per game pixel: characters, Tatu, vehicles and rocks use the 2x art at 0.5 scale (as in the prototype).
const HD = 1 / EVA_PIXEL;
const ANA_SHEET: Record<Dir, ArtKey> = { up: ART.anaUp2x, down: ART.anaDown2x, left: ART.anaLeft2x, right: ART.anaRight2x };
/** Passos da caminhada: [quadro, espelhado] (WALK do protótipo). / Walk steps: [frame, mirrored] (prototype WALK). */
const WALK: Record<Dir, [number, boolean][]> = {
  down: [[1, false], [0, false], [1, true], [0, false]],
  up: [[1, false], [0, false], [1, true], [0, false]],
  left: [[2, false], [0, false], [3, false], [0, false]],
  right: [[2, false], [0, false], [3, false], [0, false]],
};
const CREW_SHEET: Record<CrewId, ArtKey> = { commander: ART.keli2x, doctor: ART.natan2x, engineer: ART.rossi2x };
/** Redemoinhos de poeira na planície (o Curiosity já filmou alguns em Gale). / Dust devils on the plain (Curiosity has filmed them in Gale). */
const DEVILS = [{ x: 40, y: 58 }, { x: 72, y: 44 }, { x: 20, y: 30 }];
const CREW_NAME: Record<CrewId, TextKey> = { commander: 'crew.commander.name', doctor: 'crew.doctor.name', engineer: 'crew.engineer.name' };
const CREW_ROLE: Record<CrewId, TextKey> = { commander: 'crew.commander.role', doctor: 'crew.doctor.role', engineer: 'crew.engineer.role' };
const POI_NAME = { ykb: 'poi.ykb.name', bag: 'poi.bag.name', box: 'poi.box.name' } as const satisfies Record<string, TextKey>;

/**
 * Ponto de limpeza do traje (escova e painel eletrostático): fica do lado do Natan (à direita dele). Limpar leva 10 minutos de jogo.
 * Depois de limpo, o traje suja de novo quando a Ana dá mais de 12 passos (o habitat fica a uns 5 passos).
 * Dá para limpar de novo sempre que ela tiver andado depois da última limpeza.
 * Suit cleaning point (brush and electrostatic panel): sits next to Natan (on his right). Cleaning takes 10 game minutes.
 * Once clean, the suit gets dusty again after Ana takes more than 12 steps (the habitat is about 5 steps away).
 * She can clean again any time she has walked since the last cleaning.
 */
const CLEAN = { dx: 1, dy: 0, minutes: 10, dirtySteps: 12 } as const;

/** Abrigos: o habitat e o rover pressurizado. / Shelters: the habitat and the pressurized rover. */
type ShelterId = 'hab' | 'rov';
const SHELTER_NAME: Record<ShelterId, TextKey> = { hab: 'eva.shelter.hab', rov: 'eva.shelter.rov' };
/** Em qual abrigo cada tripulante entra (o mais perto dele). / Which shelter each crew member uses (the nearest one). */
const CREW_SHELTER: Record<CrewId, ShelterId> = { commander: 'hab', doctor: 'hab', engineer: 'rov' };
/** Entrando, dentro ou saindo do abrigo. / Going in, inside or coming out of the shelter. */
type ShelterMove = 'out' | 'enter' | 'in' | 'exit';
/** Duração de cada animação de entrar ou sair (s). / Length of each going in or out animation (s). */
const DOOR_TIME = 1;
const ease = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x));

// Tatu: vai na frente guiando o caminho, na mesma velocidade da Ana, e nunca passa de 2 tiles na frente dela
// (se o próximo passo o deixar mais longe, ele espera a Ana). Se ela ficar para trás ou for para outro lado, volta logo;
// se ficar muito longe (preso atrás de rocha, por exemplo), reaparece do lado dela, ainda dentro da tela.
// Tatu leads the way at Ana's speed and never gets more than 2 tiles ahead of her (if the next step would take it
// farther, it waits for Ana). If she falls behind or goes another way, it comes right back;
// if it ends up too far (stuck behind a rock, for example), it shows up next to her again, still on screen.
const TATU_LEAD = 2, TATU_NEAR = 3, TATU_WAIT = 0.3, TATU_FAR = 5;
const TATU_SPEED = {
  lead: 0.16, // igual à Ana / same as Ana
  sand: 0.34, // na areia fofa, igual à Ana / on soft sand, same as Ana
  back: 0.12, // um pouco mais rápido, só para alcançar a Ana / a bit faster, only to catch up with Ana
} as const;

export class EvaScene extends Phaser.Scene {
  private map!: EvaMap;
  private state!: GameState;
  /** Escurece a tela no entardecer e à noite. / Darkens the screen at dusk and at night. */
  private shade!: Phaser.GameObjects.Graphics;
  private hudT = 0;
  private dlg!: DialogBox;
  private ui!: EvaUiScene;
  private held!: HeldDirs;
  private ana!: Phaser.GameObjects.Sprite;
  private anaW!: Walker;
  private tatu!: Phaser.GameObjects.Sprite;
  private tatuW!: Walker & { wait: number; mode: 'lead' | 'back'; think: number };
  private crew: { id: CrewId; x: number; y: number; sprite: Phaser.GameObjects.Sprite; move: ShelterMove; t: number; delay: number }[] = [];
  /** Evento solar em andamento (provisório). / Ongoing solar event (provisional). */
  private solar?: SolarEvent;
  /** A Ana no abrigo: qual, e se está entrando, dentro ou saindo. / Ana in the shelter: which one, and whether going in, inside or coming out. */
  private anaIn?: { k: ShelterId; move: Exclude<ShelterMove, 'out'>; t: number };
  /** Entrando no habitat no fim da missão. / Going into the habitat at the end of the mission. */
  private homing = false;
  /** Já mostrou o aviso de entrar no habitat. / Already showed the enter-the-habitat notice. */
  private homeHint = false;
  /** Efeitos do evento solar por cima do mapa. / Solar event effects over the map. */
  private fx!: Phaser.GameObjects.Graphics;
  private beacons = new Map<string, Phaser.GameObjects.Sprite>();
  private shines = new Map<string, Phaser.GameObjects.Sprite>();
  private marks!: Phaser.GameObjects.Graphics;
  /** Ícone em cima do Tatu e poeira no ar. / Icon above the Tatu and dust in the air. */
  private overlay!: Phaser.GameObjects.Graphics;
  private sand?: Phaser.GameObjects.Image;
  private devils: Phaser.GameObjects.Sprite[] = [];
  /** Redemoinho de verdade do Miguel (src/state/tatu.ts), que anda até o Tatu e limpa os painéis. / Miguel's real dust devil (src/state/tatu.ts), which heads for the Tatu and cleans the panels. */
  private devilSprite?: Phaser.GameObjects.Sprite;
  /** O primeiro redemoinho que limpa os painéis ganha uma fala; os outros, só aviso. / The first devil that cleans the panels gets a line; the others, just a notice. */
  private devilTold = false;
  /** Traje limpo na estação (e a Ana ainda perto dela). / Suit cleaned at the station (and Ana still near it). */
  private suitClean = false;
  /** Passos desde a última limpeza. / Steps since the last cleaning. */
  private cleanSteps = 0;
  private cleanHint = false;
  /** Tile da estação de limpeza. / Cleaning station tile. */
  private station: Point = { x: 0, y: 0 };
  /** Sprite da estação de limpeza (quadro 0 apagado). / Cleaning station sprite (frame 0 off). */
  private stationSprite!: Phaser.GameObjects.Sprite;
  private rover!: Phaser.GameObjects.Sprite;
  private mapOverlay!: MapLayerOverlay;
  private step: Step = STEP.ykb;
  private visited = new Set<string>();
  private found = new Set<string>();
  private walkFrame = 0;
  private clock = 0;
  private bumpT = 0;
  private zoomed = false;
  private finished = false;
  /** A interface já existe. / The interface exists. */
  private live = false;
  private start: EvaData = {};

  constructor() {
    super(SCENES.eva);
  }

  init(data: EvaData): void {
    this.start = data ?? {};
    this.step = this.start.step ?? STEP.ykb;
    this.visited = new Set();
    this.found = new Set();
    // Ao pular para uma etapa, as anteriores contam como visitadas. / Jumping to a step marks earlier ones visited.
    if (this.step > STEP.ykb) this.visited.add('ykb');
    if (this.step > STEP.bag) this.visited.add('bag');
    if (this.step > STEP.box) this.visited.add('box');
    // Modo de teste: o que viria antes já fica liberado, como no protótipo. / Test mode: earlier unlocks come pre-unlocked, as in the prototype.
    this.state = new GameState();
    if (this.start.hour !== undefined) this.state.debugSetMinutes(this.start.hour * 60);
    if (this.step > STEP.ykb) {
      ['cruise', 'env', 'dust', 'water'].forEach(unlockGuide);
      this.state.unlockLayer('minerais');
    }
    if (this.step > STEP.bag) {
      unlockGuide('sand');
      this.state.unlockLayer('terreno');
    }
    if (this.step > STEP.box) unlockGuide('box');
    this.hudT = 0;
    this.crew = [];
    this.solar = undefined;
    this.anaIn = undefined;
    this.homing = false;
    this.homeHint = false;
    this.suitClean = false;
    this.cleanSteps = 0;
    this.cleanHint = false;
    this.devils = [];
    this.devilSprite = undefined;
    this.devilTold = false;
    this.beacons.clear();
    this.shines.clear();
    this.clock = 0;
    this.zoomed = false;
    this.finished = false;
    this.live = false;
  }

  async create(): Promise<void> {
    // Tela com o dobro de pixels só na EVA; as outras cenas continuam em 160x144. / Double-pixel screen only in the EVA; other scenes stay 160x144.
    this.setScreen(false);
    playMusic(this, 'eva');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.setGameSize(GAME_WIDTH, GAME_HEIGHT));

    // Mapa da missão: o de antes (mapaProvisorio), com a mesma areia, rochas e alvos do protótipo.
    // O gerador procedural do Arthur (src/map/EvaMapLoader.ts) fica no repositório e volta quando a areia for ajustada.
    // O map.json ainda é carregado porque o renderMap usa as camadas dele na textura de dados.
    // Mission map: the previous one (mapaProvisorio), with the prototype's sand, rocks and targets.
    // Arthur's procedural generator (src/map/EvaMapLoader.ts) stays in the repository and comes back once the sand is tuned.
    // map.json is still loaded because renderMap uses its layers in the data texture.
    await loadMap();
    this.map = buildTempMap();
    this.giveReturnGrid();
    const W = this.map.width * T, H = this.map.height * T;
    this.cameras.main.setBackgroundColor(P[0]);

    // Mapa base
    const mapTex = renderMap(this, this.map);
    this.add.image(0, 0, mapTex).setOrigin(0).setDepth(-1000);
    // Areia das Dunas Bagnold andando com o vento. / Bagnold Dunes sand creeping with the wind.
    if (sandBox.w) this.sand = this.add.image(sandBox.x, sandBox.y, SAND_FRAMES[0]).setOrigin(0).setDepth(-990);
    this.placeRocks();

    const hab = this.map.habitat, rov = this.map.rover;
    this.add.image(hab.x * T, (hab.y + hab.h) * T, ART.habitat2x).setOrigin(0, 1).setScale(HD).setDepth((hab.y + hab.h) * T);
    this.rover = this.add.sprite(rov.x * T, (rov.y + rov.h) * T, ART.rover2x, 0).setOrigin(0, 1).setScale(HD).setDepth((rov.y + rov.h) * T);

    this.marks = this.add.graphics().setDepth(-500);
    for (const p of this.map.pois) {
      this.beacons.set(p.id, this.add.sprite(p.x * T - 2, p.y * T - 4, ART.beacon2x, 0).setOrigin(0).setScale(HD).setDepth(p.y * T + 16));
    }
    for (const s of this.map.secrets) {
      this.shines.set(s.id, this.add.sprite(s.x * T + 2, s.y * T + 2, ART.shine, 0).setOrigin(0).setDepth(s.y * T).setVisible(false));
    }
    for (const c of this.map.crew) {
      const sprite = this.add.sprite(c.x * T - 2, c.y * T - 8, CREW_SHEET[c.id], 0).setOrigin(0).setScale(HD).setDepth(c.y * T + 16);
      this.crew.push({ ...c, sprite, move: 'out', t: 0, delay: 0 });
    }
    const doc = this.map.crew.find((c) => c.id === 'doctor')!;
    this.station = { x: doc.x + CLEAN.dx, y: doc.y + CLEAN.dy };
    this.stationSprite = this.add.sprite(this.station.x * T, (this.station.y + 1) * T, ART.station2x, 0).setOrigin(0, 1).setScale(HD).setDepth((this.station.y + 1) * T);
    for (let i = 0; i < DEVILS.length; i++) this.devils.push(this.add.sprite(0, 0, ART.devil, 0).setOrigin(0).setDepth(-400));
    this.devilSprite = this.add.sprite(0, 0, ART.devil, 0).setOrigin(0.5, 1).setVisible(false);
    this.overlay = this.add.graphics().setDepth(6000);
    this.fx = this.add.graphics().setDepth(6500);
    this.shade = this.add.graphics().setDepth(7000);

    this.held = new HeldDirs(this);
    const pos = this.start.pos ?? this.map.start;
    this.anaW = { x: pos.x, y: pos.y, ox: pos.x, oy: pos.y, mt: 1, dur: 0.16, dir: 'down' };
    this.ana = this.add.sprite(0, 0, ANA_SHEET.down, 0).setOrigin(0).setScale(HD);
    this.tatuW = { x: pos.x - 1, y: pos.y, ox: pos.x - 1, oy: pos.y, mt: 1, dur: TATU_SPEED.lead, dir: 'right', wait: 0, mode: 'lead', think: 0 };
    this.tatu = this.add.sprite(0, 0, ART.tatuSide2x, 0).setOrigin(0).setScale(HD);
    this.placeWalkers();
    this.refreshMarkers();
    this.updateShelter();

    // Câmera: segue a Ana, sem sair do mapa. / Camera: follows Ana, never leaving the map.
    const cam = this.cameras.main;
    cam.setBounds(0, 0, W, H);
    cam.startFollow(this.ana, true, 1, 1, -8, -6);
    cam.setRoundPixels(true);

    // Diálogo e avisos ficam numa cena por cima, livre do zoom. / Dialogue and notices live in a scene on top, free from zoom.
    this.scene.launch(SCENES.evaUi);
    this.ui = this.scene.get(SCENES.evaUi) as EvaUiScene;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scene.stop(SCENES.evaUi));
    this.ui.events.once(Phaser.Scenes.Events.CREATE, () => this.ready());
  }

  /** A interface está pronta: começa a EVA. / The interface is ready: the EVA begins. */
  private ready(): void {
    this.dlg = this.ui.dlg;
    this.live = true;
    onAction(this, (a) => this.onAction(a));
    onDirPress(this, (d) => this.dlg.handlesDir(d) || this.ui.guide.handlesDir(d) || !!this.ui.tatuPanel?.handlesDir(d));
    // Avisos de entrada nova no Guia e de camada nova. / Notices for a new Guide entry and a new layer.
    const offs = [
      onLangChange(() => this.ui.hideToast()),
      onGuideUnlock((id) => this.toast(t('guide.toast', { title: t(guideKey(id, 'title')).toUpperCase() }), 'good')),
      this.state.on('layer-unlocked', ({ layer }) => this.toast(t('hud.layerNew', { name: this.layerName(layer) }), 'good')),
      // Noite marciana (regras do Miguel em src/state/night.ts). / Martian night (Miguel's rules in src/state/night.ts).
      this.state.on('dusk-warning', () => this.duskWarning()),
      this.state.on('night-start', () => this.toast(t('eva.night.start'), 'bad')),
      this.state.on('night-end', () => this.toast(t('eva.night.end'), 'good')),
      this.state.on('suit-damaged', ({ suit, first }) => {
        if (first) {
          this.held.clear();
          this.dlg.say([
            { who: 'who.selari', alert: true, text: 'eva.rocks.selari' },
            { who: 'who.commander', text: 'eva.rocks.hastor' },
            { who: 'who.guide', text: 'eva.rocks.guide', guide: 'rocks' },
          ]);
        } else {
          this.toast(t('eva.suit.damaged', { suit: Math.round(suit) }), 'bad');
        }
      }),
      this.state.on('wheels-low', ({ wheels }) => this.toast(t('eva.wheels.low', { wheels: Math.round(wheels) }), 'bad')),
      this.state.on('eva-failed', ({ reasonKey }) => this.evaFailed(reasonKey)),
      // Ponto de retorno: o O₂ que sobra mal dá para voltar ao abrigo. / Point of return: the O₂ left barely gets Ana back to shelter.
      this.state.on('return-warning', ({ o2, need }) => {
        this.held.clear();
        this.dlg.say([{ who: 'who.commander', alert: true, text: () => t('eva.return.warn', { o2: Math.round(o2), need: Math.ceil(need) }) }]);
      }),
      this.state.on('return-breach', () => this.toast(t('eva.return.obj'), 'bad')),
      // Redemoinhos de poeira (regras do Miguel em src/state/tatu.ts). / Dust devils (Miguel's rules in src/state/tatu.ts).
      this.state.on('devil-spawn', () => this.toast(t('eva.devil.seen'))),
      this.state.on('devil-hit-tatu', ({ cleaned }) => {
        if (cleaned && !this.devilTold) {
          this.devilTold = true;
          this.held.clear();
          this.dlg.say([{ who: 'who.tatu', text: 'eva.devil.first' }]);
        } else this.toast(t(cleaned ? 'eva.devil.cleaned' : 'eva.devil.passed'), cleaned ? 'good' : undefined);
      }),
      this.state.on('devil-hit-player', () => this.toast(t('eva.devil.suit'))),
    ];
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => offs.forEach((off) => off()));
    this.ui.hud.onBrief = () => this.brief();

    // Mapa da Cratera Gale (tecla M): enquanto aberto, o jogo fica pausado (ver `paused`).
    // Gale Crater map (M key): while open, the game stays paused (see `paused`).
    // A flag volta a false aqui porque o objeto da cena é reaproveitado entre partidas.
    // The flag goes back to false here because the scene object is reused between playthroughs.
    this.galeMapOpen = false;
    const onMapOpened = (): void => {
      this.galeMapOpen = true;
      this.held.clear();
    };
    const onMapClosed = (): void => {
      this.galeMapOpen = false;
    };
    this.events.on('gale-map-opened', onMapOpened);
    this.events.on('gale-map-closed', onMapClosed);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off('gale-map-opened', onMapOpened);
      this.events.off('gale-map-closed', onMapClosed);
    });

    // Cria overlay de camadas (Scanner Tático)
    this.mapOverlay = new MapLayerOverlay(this, this.map);

    this.updateHud();
    if (this.step === STEP.ykb && !this.start.pos) {
      this.intro();
    } else if (this.step === STEP.solar) {
      this.startSolar();
    } else if (this.step === STEP.box) {
      // Start at boxwork: show briefing and set up
      this.toast(this.targetText());
      this.dlg.say([
        { who: 'who.commander', text: 'brief.box.1' },
        { who: 'who.commander', text: 'brief.box.2' },
      ]);
    } else if (this.step === STEP.home) {
      // Start at home: show briefing for return
      this.toast(this.targetText());
      this.dlg.say([
        { who: 'who.commander', text: 'brief.home.1' },
        { who: 'who.commander', text: 'brief.home.2' },
      ]);
    } else {
      this.toast(this.targetText());
    }
  }

  // ---------------------------------------------------------------- diálogos / dialogue

  private intro(): void {
    const CMD = 'who.commander', GUIDE = 'who.guide';
    const n = (i: number) => `eva.intro.${i}` as TextKey;
    this.dlg.say(
      [
        { who: CMD, text: n(0) },
        { who: CMD, text: n(1) },
        { who: CMD, text: n(2) },
        { who: GUIDE, text: n(3), guide: 'env' },
        { who: CMD, text: n(4) },
        { who: GUIDE, text: n(5), guide: 'dust' },
        { who: CMD, text: n(6) },
        { who: CMD, text: n(7) },
        { who: CMD, text: n(8) },
        { who: CMD, text: 'brief.ykb.1' },
        { who: CMD, text: 'brief.ykb.2' },
        { who: CMD, text: n(9) },
      ],
      () => this.toast(this.targetText()),
    );
  }

  private visitPoi(id: 'ykb' | 'bag' | 'box'): void {
    this.visited.add(id);
    this.refreshMarkers();
    const SEL = 'who.selari', CMD = 'who.commander', GUIDE = 'who.guide', INSTR = 'who.instrument';
    const k = (i: number) => `eva.${id}.${i}` as TextKey;
    let lines: Line[] = [];
    let next: Step = this.step;
    if (id === 'ykb') {
      lines = [
        { who: SEL, text: k(0) },
        { who: CMD, text: k(1) },
        { who: GUIDE, text: k(2), guide: 'water' },
        { who: INSTR, text: k(3), onShow: () => this.state.unlockLayer('minerais') },
        { who: CMD, text: k(4) },
        { who: CMD, text: 'brief.bag.1' },
        { who: CMD, text: 'brief.bag.2' },
      ];
      next = STEP.bag;
    } else if (id === 'bag') {
      // Depois das dunas começa o evento de partículas solares; ao terminar, segue para o boxwork (como no protótipo).
      // After the dunes the solar particle event starts; when it ends, it moves on to the boxwork (as in the prototype).
      lines = [
        { who: SEL, text: k(0) },
        { who: CMD, text: k(1) },
        { who: GUIDE, text: k(2), guide: 'sand' },
        { who: INSTR, text: k(3), onShow: () => this.state.unlockLayer('terreno') },
      ];
      next = STEP.solar;
    } else {
      lines = [
        { who: SEL, text: k(0) },
        { who: CMD, text: k(1) },
        { who: GUIDE, text: k(2), guide: 'box' },
        { who: SEL, text: k(3) },
        { who: CMD, text: k(4) },
        { who: CMD, text: 'brief.home.2' },
      ];
      next = STEP.home;
    }
    this.dlg.say(lines, () => {
      this.step = next;
      if (next === STEP.solar) return this.startSolar();
      this.refreshMarkers();
      this.toast(this.targetText());
    });
  }

  /** Repete a instrução da fase atual (ⓘ no objetivo). / Repeats the current phase briefing (ⓘ on the objective). */
  private brief(): void {
    if (this.paused || this.finished) return;
    this.held.clear();
    if (this.step === STEP.solar && this.solar?.phase !== 'done') {
      this.dlg.say([
        { who: 'who.commander', text: 'eva.spe.1' },
        { who: 'who.commander', text: 'eva.spe.2' },
      ]);
      return;
    }
    const id = this.step === STEP.ykb ? 'ykb' : this.step === STEP.bag ? 'bag' : this.step === STEP.home ? 'home' : 'box';
    this.dlg.say([
      { who: 'who.commander', text: `brief.${id}.1` as TextKey },
      { who: 'who.commander', text: `brief.${id}.2` as TextKey },
    ]);
  }

  /** Avisa o estado se a Ana está ao lado do habitat ou do rover pressurizado. / Tells the state whether Ana is next to the habitat or the pressurized rover. */
  private updateShelter(): void {
    this.state.setSheltered(this.isSafe());
  }

  /**
   * Protegida das partículas solares: só dentro do abrigo (entrou com A). Ficar do lado de fora, mesmo colada na porta, não protege.
   * Protected from the solar particles: only inside the shelter (went in with A). Staying outside, even right by the door, does not protect.
   */
  private inShelter(): boolean {
    return !!this.anaIn;
  }

  /** Dentro do abrigo ou ao lado dele. / Inside the shelter or right next to it. */
  private isSafe(): boolean {
    return !!this.anaIn || this.shelterNear() !== null;
  }

  /** 16h30 fora do abrigo: a comandante pede para voltar. / 16:30 outside shelter: the commander asks Ana to come back. */
  private duskWarning(): void {
    const time = this.clockText().split(' ').pop() ?? '';
    this.held.clear();
    this.dlg.say([{ who: 'who.commander', alert: true, text: () => t('eva.dusk.warn', { time }) }]);
  }

  /**
   * 19h30 fora do abrigo: a EVA é abortada e o Tatu leva a Ana de volta ao habitat.
   * 19:30 outside shelter: the EVA is aborted and the Tatu brings Ana back to the habitat.
   */
  private evaFailed(reasonKey: string): void {
    this.held.clear();
    this.ui.guide.close();
    this.dlg.say([{ who: 'who.commander', alert: true, text: reasonKey as TextKey }], () => this.toast(this.targetText()));
    const s = this.map.start, p = this.anaW, tt = this.tatuW;
    Object.assign(p, { x: s.x, y: s.y, ox: s.x, oy: s.y, mt: 1, dir: 'down' });
    Object.assign(tt, { x: s.x - 1, y: s.y, ox: s.x - 1, oy: s.y, mt: 1, mode: 'lead', wait: 0 });
    this.placeWalkers();
    this.updateShelter();
  }

  // ---------------------------------------------------------------- evento solar e abrigo / solar event and shelter

  /** Os satélites detectam a erupção: 45 minutos para chegar a um abrigo. / Satellites detect the flare: 45 minutes to reach a shelter. */
  private startSolar(): void {
    this.solar = new SolarEvent();
    play(this, 'alertaSolar');
    this.held.clear();
    this.refreshMarkers();
    this.dlg.say(
      [
        { who: 'who.commander', alert: true, text: 'eva.spe.0' },
        { who: 'who.commander', alert: true, text: 'eva.spe.1' },
        { who: 'who.commander', text: 'eva.spe.2' },
      ],
      () => this.updateHud(),
    );
  }

  /** Reage ao que mudou no evento solar. / Reacts to what changed in the solar event. */
  private solarNews(n: SolarNews): void {
    const sp = this.solar!;
    const CMD = 'who.commander', DOC = 'who.doctor';
    this.held.clear();
    if (n === 'arrived') {
      play(this, 'alertaSolar');
      this.toast(t('eva.spe.arrived'), 'bad');
      // A tripulação que ainda está lá fora corre para o abrigo. / Crew still outside rush to the shelter.
      this.crew.filter((c) => c.move === 'out').forEach((c, i) => this.crewMove(c, 'enter', 0.45 * i));
    } else if (n === 'exposed') {
      // Os sensores falham: as camadas de dados saem do ar. / Sensors fail: the data layers go down.
      this.state.forceMapaLayer();
      this.toast(t('eva.spe.noise'), 'bad');
      this.dlg.say([{ who: CMD, alert: true, text: 'eva.spe.hit' }]);
    } else if (n === 'dose20') {
      this.dlg.say([{ who: DOC, alert: true, text: () => t('eva.spe.dose', { dose: fmtDose(sp.exposed), days: SolarEvent.days(sp.exposed) }) }]);
    } else if (n === 'dose50') {
      this.dlg.say([{ who: DOC, alert: true, text: 'eva.spe.limit' }]);
    } else if (n === 'abort') {
      this.dlg.say(
        [
          { who: CMD, alert: true, text: 'eva.spe.abort' },
          { who: CMD, alert: true, text: 'eva.spe.evac' },
        ],
        () => this.evacuate(),
      );
    } else if (n === 'end') {
      const d = sp.dose;
      this.dlg.say(
        [
          // Abaixo de um dia de superfície, diz que o abrigo funcionou. / Under one surface day, says the shelter worked.
          { who: CMD, text: () => t(SolarEvent.days(d) < 1 ? 'eva.spe.endLow' : 'eva.spe.end', { dose: fmtDose(d), days: SolarEvent.days(d) }) },
          { who: 'who.guide', text: 'eva.spe.guide', guide: 'spe' },
          { who: CMD, text: 'eva.spe.next' },
          { who: CMD, text: 'brief.box.1' },
          { who: CMD, text: 'brief.box.2' },
        ],
        () => {
          this.step = STEP.box;
          this.refreshMarkers();
          if (this.anaIn?.move === 'in') this.toast(t('eva.shelter.leave'), 'good');
          else this.toast(this.targetText());
        },
      );
    }
    this.updateHud();
  }

  /** Dose alta demais: o Tatu leva a Ana às pressas para dentro do habitat. / Dose too high: the Tatu rushes Ana into the habitat. */
  private evacuate(): void {
    const s = this.map.start, p = this.anaW, tt = this.tatuW;
    Object.assign(p, { x: s.x, y: s.y, ox: s.x, oy: s.y, mt: 1, dir: 'down' });
    Object.assign(tt, { x: s.x - 1, y: s.y, ox: s.x - 1, oy: s.y, mt: 1, mode: 'lead', wait: 0 });
    this.anaIn = { k: 'hab', move: 'in', t: 0 };
    this.crew.filter((c) => CREW_SHELTER[c.id] === 'hab' && c.move === 'out').forEach((c) => this.crewMove(c, 'in', 0));
    this.cameras.main.fadeIn(500, 0x1a, 0x0d, 0x0b);
    this.placeWalkers();
    this.updateShelter();
  }

  /**
   * Entrega o mapa ao estado uma vez, para ele calcular quanto O₂ custa voltar de cada tile (ponto de retorno).
   * Abrigo = tiles livres colados no habitat ou no rover, os mesmos em que a Ana fica abrigada.
   * Hands the map to the state once, so it can work out the O₂ cost of getting back from each tile (point of return).
   * Shelter = free tiles right next to the habitat or the rover, the same ones where Ana counts as sheltered.
   */
  private giveReturnGrid(): void {
    const m = this.map, shelterTiles: Point[] = [];
    for (let y = 0; y < m.height; y++)
      for (let x = 0; x < m.width; x++) if (m.walkable(x, y) && (nearRect(m.habitat, x, y) || nearRect(m.rover, x, y))) shelterTiles.push({ x, y });
    this.state.setReturnGrid({
      width: m.width,
      height: m.height,
      shelterTiles,
      kindAt: (x, y) => {
        if (!m.walkable(x, y)) return null;
        const tl = m.tileAt(x, y);
        return tl === TILE.sand ? 'sand' : tl === TILE.sharp ? 'sharp' : 'ground';
      },
    });
  }

  /** Posição em tiles de quem anda, no meio do passo. / Tile position of a walker, mid-step. */
  private walkerPos(w: Walker): Point {
    return { x: w.ox + (w.x - w.ox) * w.mt, y: w.oy + (w.y - w.oy) * w.mt };
  }

  private shelterRect(k: ShelterId): Rect {
    return k === 'hab' ? this.map.habitat : this.map.rover;
  }

  /** Abrigo colado na Ana, se houver. / Shelter right next to Ana, if any. */
  private shelterNear(): ShelterId | null {
    const p = this.anaW;
    if (nearRect(this.map.habitat, p.x, p.y)) return 'hab';
    if (nearRect(this.map.rover, p.x, p.y)) return 'rov';
    return null;
  }

  /** Abrigo mais perto da Ana (alvo durante o evento). / Shelter closest to Ana (target during the event). */
  private nearestShelter(): ShelterId {
    const p = this.anaW, h = this.map.habitat, r = this.map.rover;
    return Math.abs(p.x - r.x) + Math.abs(p.y - r.y) < Math.abs(p.x - h.x) + Math.abs(p.y - h.y) ? 'rov' : 'hab';
  }

  /**
   * Porta em que a Ana pode entrar agora: um abrigo durante o evento solar, ou o habitat na volta para casa.
   * Door Ana can go through right now: a shelter during the solar event, or the habitat on the way home.
   */
  private doorHere(): ShelterId | null {
    if (this.anaIn || this.anaW.mt < 1 || this.finished) return null;
    const k = this.shelterNear();
    if (k && this.canShelter()) return k;
    if (k === 'hab' && this.step === STEP.home) return 'hab';
    return null;
  }

  private isStation(x: number, y: number): boolean {
    return x === this.station.x && y === this.station.y;
  }

  /**
   * Limpa o traje no ponto de limpeza: poeira saindo da Ana, 10 minutos de jogo e o aviso de traje limpo.
   * Cleans the suit at the cleaning point: dust coming off Ana, 10 game minutes and the suit-clean notice.
   */
  private cleanSuit(): void {
    this.held.clear();
    if (this.suitClean && this.cleanSteps === 0) return this.toast(t('eva.clean.done'), 'good');
    this.cleanSteps = 0;
    const x = this.anaW.x * T, y = this.anaW.y * T;
    [0, 150, 300, 450].forEach((ms, i) => this.time.delayedCall(ms, () => this.dust(x + (i % 2 ? 6 : -4), y - 4 + i * 3)));
    this.stationGlow();
    this.state.advance(CLEAN.minutes);
    this.suitClean = true;
    this.cleanHint = true;
    this.toast(t('eva.clean.done'), 'good');
  }

  /**
   * Na volta para casa: com o traje limpo, entra; sujo, o Natan pergunta se a Ana quer entrar assim mesmo.
   * On the way home: with a clean suit, goes in; dirty, Natan asks whether Ana wants to go in anyway.
   */
  private askHome(): void {
    if (this.suitClean) return this.goHome();
    this.held.clear();
    this.dlg.say([
      {
        who: 'who.doctor',
        alert: true,
        text: 'eva.clean.ask',
        choices: [{ text: 'eva.clean.back', pick: () => {
          this.held.clear();
          this.toast(t('eva.clean.hint'));
        } }, { text: 'eva.clean.go', pick: () => this.goHome() }],
        cancel: 0,
      },
    ]);
  }

  /**
   * Luz do painel eletrostático durante a limpeza: o zigue-zague acende de baixo para cima duas vezes, fica todo aceso
   * um instante e apaga. Quadros do sprite: 0 apagado, 1 a 3 faixa subindo, 4 todo aceso.
   * Electrostatic panel light while cleaning: the zigzag lights up from bottom to top twice, stays fully lit for a moment
   * and goes off. Sprite frames: 0 off, 1 to 3 band going up, 4 fully lit.
   */
  private stationGlow(): void {
    const seq = [1, 2, 3, 1, 2, 3, 4];
    seq.forEach((f, i) => this.time.delayedCall(i * 140, () => this.stationSprite.setFrame(f)));
    this.time.delayedCall(seq.length * 140 + 700, () => this.stationSprite.setFrame(0));
  }

  /** Fim da missão: a Ana entra no habitat e vem o epílogo. / Mission end: Ana goes into the habitat and the epilogue follows. */
  private goHome(): void {
    this.held.clear();
    this.homing = true;
    this.anaIn = { k: 'hab', move: 'enter', t: 0 };
    this.ui.hideToast();
  }

  /** Dá para entrar no abrigo agora (evento ainda não acabou). / Can go into the shelter now (event not over yet). */
  private canShelter(): boolean {
    return !!this.solar && this.solar.phase !== 'done' && !this.anaIn;
  }

  /** Porta do abrigo, no mesmo referencial dos personagens. / Shelter door, in the same frame as the characters. */
  private door(k: ShelterId): Point {
    const r = this.shelterRect(k);
    return { x: (r.x + r.w / 2) * T - 8, y: (r.y + r.h) * T - 14 };
  }

  /** A Ana entra; a tripulação daquele abrigo entra logo atrás. / Ana goes in; that shelter's crew follow right behind. */
  private enterShelter(k: ShelterId): void {
    this.held.clear();
    this.anaIn = { k, move: 'enter', t: 0 };
    this.crew.filter((c) => CREW_SHELTER[c.id] === k && c.move === 'out').forEach((c, i) => this.crewMove(c, 'enter', 0.5 + 0.45 * i));
    this.updateShelter();
  }

  /** A Ana sai. A tripulação fica até o evento acabar. / Ana goes out. The crew stay until the event ends. */
  private exitShelter(): void {
    if (!this.anaIn) return;
    if (this.solar && this.solar.phase !== 'done') this.toast(t('eva.shelter.still'), 'bad');
    this.anaIn = { k: this.anaIn.k, move: 'exit', t: 0 };
  }

  private crewMove(c: (typeof this.crew)[number], move: ShelterMove, delay: number): void {
    c.move = move;
    c.t = 0;
    c.delay = delay;
  }

  /** Anda as animações de porta. / Runs the door animations. */
  private updateDoors(dt: number): void {
    const z = this.anaIn;
    if (z && z.move !== 'in') {
      z.t += dt;
      if (z.t > DOOR_TIME) {
        if (z.move === 'enter') this.anaIn = { k: z.k, move: 'in', t: 0 };
        else this.anaIn = undefined;
        if (this.homing) return this.finish();
        this.updateShelter();
        this.updateHud();
      }
    }
    const over = !this.solar || this.solar.phase === 'done';
    let out = 0;
    for (const c of this.crew) {
      // Fim do evento: a tripulação sai, um de cada vez. / Event over: the crew come out, one at a time.
      if (c.move === 'in' && over) this.crewMove(c, 'exit', 0.45 * out++);
      if (c.move !== 'enter' && c.move !== 'exit') continue;
      c.t += dt;
      if (c.t > c.delay + DOOR_TIME) c.move = c.move === 'enter' ? 'in' : 'out';
    }
  }

  /**
   * Onde desenhar quem está passando pela porta: da sua posição até a porta (entrando) ou de volta (saindo), sumindo na porta.
   * Where to draw someone going through the door: from their spot to the door (going in) or back (coming out), fading at the door.
   */
  private doorPose(k: ShelterId, move: ShelterMove, tt: number, hx: number, hy: number) {
    const d = this.door(k), enter = move === 'enter';
    const f = enter ? ease(tt / 0.8) : 1 - ease((tt - 0.2) / 0.8);
    const a = enter ? 1 - ease((tt - 0.65) / 0.3) : ease(tt / 0.3);
    return { x: hx + (d.x - hx) * f, y: hy + (d.y - hy) * f, a, moving: f > 0 && f < 1, dx: d.x - hx, enter };
  }

  /** Texto do objetivo, com a contagem do evento solar. / Objective text, with the solar event countdown. */
  private objective(): { text: string; alert: boolean } {
    const sp = this.solar;
    if (this.step !== STEP.solar || !sp || sp.phase === 'done') {
      // Passou do ponto de retorno: o objetivo vira voltar ao abrigo. / Past the point of return: the objective becomes heading back.
      const h = this.state.getHud();
      if (h.o2Return > 0 && h.o2 - h.o2Return < O2.returnMargin) return { text: t('eva.return.obj'), alert: true };
      return { text: this.targetText(), alert: false };
    }
    const min = Math.max(1, Math.ceil(sp.left));
    if (sp.phase === 'warn') return { text: t('eva.spe.objWarn', { min }), alert: true };
    if (this.inShelter()) return { text: t('eva.spe.objSafe', { min }), alert: true };
    return { text: t('eva.spe.objExposed', { min }), alert: true };
  }

  /** Aviso pequeno embaixo enquanto a Ana está dentro do abrigo. / Small notice at the bottom while Ana is inside the shelter. */
  private shelterNote(): void {
    const z = this.anaIn;
    if (!z || z.move !== 'in') return this.ui.shelterNote(null);
    const sp = this.solar && this.solar.phase !== 'done' ? this.solar : null;
    const name = t('eva.shelter.inside', { name: t(SHELTER_NAME[z.k]) });
    this.ui.shelterNote({
      title: sp ? `${name} ▶▶ ${Math.max(1, Math.ceil(sp.left))} MIN` : `${name} · ${t('eva.shelter.over')}`,
      action: t(sp ? 'eva.shelter.exitRisk' : 'eva.shelter.exit'),
      risk: !!sp,
    });
  }

  private talk(id: CrewId): void {
    const say: Record<CrewId, TextKey[]> = {
      commander: [this.step === STEP.home ? 'crew.commander.say1' : 'crew.commander.say0'],
      doctor: ['crew.doctor.say0'],
      engineer: ['crew.engineer.say0', 'crew.engineer.say1'],
    };
    const name = () => `${t(CREW_NAME[id])} · ${t(CREW_ROLE[id]).toUpperCase()}`;
    this.dlg.say(say[id].map((text) => ({ who: CREW_NAME[id], name, text })));
  }

  private discover(id: string): void {
    this.found.add(id);
    // Os cristais de enxofre ficam onde a bota quebrou a pedra. / The sulfur crystals stay where the boot broke the rock.
    const s = this.map.secrets.find((q) => q.id === id);
    if (id === 'sulfur' && s) this.add.image(s.x * T, s.y * T + 2, ART.sulfur).setOrigin(0).setDepth(-480);
    const title = `guide.${id}.title` as TextKey;
    this.dlg.say([
      { who: 'who.discovery', text: `secret.${id}.say` as TextKey },
      { who: 'who.guideExtra', text: () => t('secret.found', { title: t(title) }), guide: id },
    ]);
  }

  // ---------------------------------------------------------------- objetivo / objective

  private target(): Point & { name: () => string } {
    const poi = (id: 'ykb' | 'bag' | 'box') => {
      const p = this.map.pois.find((q) => q.id === id)!;
      return { x: p.x, y: p.y, name: () => t(POI_NAME[id]) };
    };
    if (this.step === STEP.ykb) return poi('ykb');
    if (this.step === STEP.bag) return poi('bag');
    if (this.step === STEP.solar && this.solar?.phase !== 'done') {
      const k = this.nearestShelter(), r = this.shelterRect(k);
      return { x: r.x, y: r.y, name: () => t(k === 'hab' ? 'poi.home.name' : 'poi.rover.name') };
    }
    if (this.step === STEP.box || this.step === STEP.solar) return poi('box');
    return { x: this.map.habitat.x, y: this.map.habitat.y, name: () => t('poi.home.name') };
  }

  private targetText(): string {
    return t('eva.target', { name: this.target().name().toUpperCase() });
  }

  private refreshMarkers(): void {
    for (const [id, b] of this.beacons) b.setVisible(!this.visited.has(id));
    for (const p of this.map.pois) {
      // Tripé no ponto visitado. / Tripod at the visited point.
      if (this.visited.has(p.id) && !this.children.getByName(`tripod-${p.id}`))
        this.add.image(p.x * T + 2, p.y * T + 2, ART.tripod2x).setOrigin(0).setScale(HD).setDepth(p.y * T + 14).setName(`tripod-${p.id}`);
    }
  }

  // ---------------------------------------------------------------- entrada / input

  private onAction(a: Action): void {
    if (this.finished) return;
    if (this.ui.guide.handles(a)) return;
    if (this.dlg.handles(a)) return;
    // Painel do Tatu aberto: ele fica com todas as ações (B ou T fecham). / Tatu panel open: it takes every action (B or T close it).
    if (this.ui.tatuPanel?.handles(a)) return;
    if (a === 'guide') {
      this.held.clear();
      this.ui.hideToast();
      this.ui.guide.open();
      return;
    }
    // Mapa da Cratera Gale (tecla M): com ele aberto, M, A ou B fecham e as outras ações ficam paradas.
    // Gale Crater map (M key): while open, M, A or B close it and the other actions are ignored.
    if (this.ui.galeMapOverlay?.isVisible()) {
      if (a === 'map' || a === 'A' || a === 'B') this.ui.closeGaleMap();
      return;
    }
    if (a === 'map') {
      this.ui.toggleGaleMap();
      return;
    }
    // Painel de Dados do Tatu (tecla T, ou A perto do Tatu). / Tatu Data Panel (T key, or A near the Tatu).
    if (a === 'tatu') {
      this.openTatuPanel();
      return;
    }
    // Dentro do abrigo, A ou B sai. / Inside the shelter, A or B goes out.
    if (this.anaIn) {
      if (this.anaIn.move === 'in' && !this.homing && (a === 'A' || a === 'B')) this.exitShelter();
      if (a === 'A' || a === 'B') return;
    }
    if (a === 'layer' && this.solar?.noisy && this.solar.phase === 'active' && !this.inShelter()) {
      this.toast(t('eva.spe.noise'), 'bad');
      return;
    }
    if (a === 'layer') {
      // Usa o GameState.nextLayer() para sincronizar com HUD e camadas desbloqueadas
      const nextLayer = this.state.nextLayer();
      this.setMapLayer(nextLayer as LayerMode);
      play(this, 'camada');
      return;
    }
    if (a === 'zoom') {
      this.zoomed = !this.zoomed;
      this.setScreen(this.zoomed);
      this.toast(t(this.zoomed ? 'eva.zoom.wide' : 'eva.zoom.normal'));
      this.updateHud();
      return;
    }
    if (a === 'A') {
      const p = this.anaW;
      const k = this.doorHere();
      if (k && this.step === STEP.home) return this.askHome();
      if (k) return this.enterShelter(k);
      if (Math.abs(this.station.x - p.x) + Math.abs(this.station.y - p.y) <= 1) return this.cleanSuit();
      const near = this.crew.find((c) => c.move === 'out' && Math.abs(c.x - p.x) + Math.abs(c.y - p.y) <= 1);
      if (near) return this.talk(near.id);
      const tt = this.tatuW;
      if (Math.max(Math.abs(tt.x - p.x), Math.abs(tt.y - p.y)) <= 1) this.openTatuPanel();
    }
  }

  /** Abre o Painel do Tatu e solta as setas, para a Ana não andar sozinha ao fechar. / Opens the Tatu Panel and releases the arrows, so Ana does not walk on her own when it closes. */
  private openTatuPanel(): void {
    this.held.clear();
    this.ui.hideToast();
    this.ui.openTatuPanel();
  }

  /** Retrato do HUD, com a dose do evento solar da cena (o Hud e o Painel do Tatu leem o mesmo). / HUD snapshot, with the scene's solar-event dose (the Hud and the Tatu Panel read the same). */
  getHudSnapshot(): HudSnapshot {
    const snap = this.state.getHud(), sp = this.solar;
    // A dose do evento solar ainda vem do arquivo provisório. / The solar event dose still comes from the provisional file.
    if (sp) snap.doseMSv += sp.dose;
    if (sp?.phase === 'active') snap.solarPhase = 'active';
    return snap;
  }

  /** Modo do Tatu: 'lead' guia a Ana, 'back' volta para perto dela. / Tatu mode: 'lead' guides Ana, 'back' returns to her. */
  getTatuMode(): 'lead' | 'back' {
    return this.tatuW.mode;
  }

  /** O que o mapa da missão (tecla M) mostra agora. / What the mission map (M key) shows right now. */
  getMapView(): GaleMapView | null {
    if (!this.map || !this.anaW) return null;
    const tg = this.target(), v = this.cameras.main.worldView;
    return {
      map: this.map,
      player: this.walkerPos(this.anaW),
      tatu: this.walkerPos(this.tatuW),
      devil: this.state.getDevil(),
      target: { x: tg.x, y: tg.y },
      targetName: tg.name(),
      visited: this.visited,
      found: this.found,
      view: { x: v.x / T, y: v.y / T, w: v.width / T, h: v.height / T },
    };
  }

  /** Resumo do alvo atual para o Painel do Tatu (mesma lógica de target()). / Current-target brief for the Tatu Panel (same logic as target()). */
  getTatuBrief(): TargetBrief {
    const id = this.step === STEP.ykb ? 'ykb'
      : this.step === STEP.bag ? 'bag'
      : this.step === STEP.solar && this.solar?.phase !== 'done' ? 'shel'
      : this.step === STEP.home ? 'home'
      : 'box';
    const k = (field: string) => `brief.${id}.${field}` as TextKey;
    return { id, name: t(k('name')), what: k('what'), why: k('why'), look: t(k('look')), src: t(k('src')) };
  }

  /**
   * Anda um tile em 8 direções. Na diagonal só passa se os dois lados também estiverem livres (sem cortar quina de
   * rocha), e se a diagonal estiver fechada ela tenta seguir só na horizontal ou só na vertical, para deslizar
   * encostada nas paredes. O passo na diagonal é mais longo, então leva mais tempo: a velocidade é a mesma.
   * Walks one tile in 8 directions. A diagonal only goes through if both sides are free too (no cutting rock
   * corners), and if the diagonal is blocked it tries just the horizontal or just the vertical, to slide along
   * walls. A diagonal step is longer, so it takes longer: the speed stays the same.
   */
  private tryMove(): void {
    const p = this.anaW;
    const step = this.held.step;
    if (!step || p.mt < 1 || this.paused || this.finished || this.anaIn) return;
    const [dx, dy] = step;
    // Na diagonal tenta primeiro a diagonal, depois o eixo da seta mais recente, depois o outro.
    // On a diagonal it tries the diagonal first, then the axis of the newest arrow, then the other one.
    const newest = this.held.current;
    const tries: [number, number][] = !dx || !dy ? [[dx, dy]]
      : newest === 'left' || newest === 'right' ? [[dx, dy], [dx, 0], [0, dy]] : [[dx, dy], [0, dy], [dx, 0]];
    const crewAt = (x: number, y: number) => this.crew.find((c) => c.move === 'out' && c.x === x && c.y === y);
    const free = (x: number, y: number) => this.map.walkable(x, y) && !crewAt(x, y) && !this.isStation(x, y);
    const ok = ([sx, sy]: [number, number]) =>
      free(p.x + sx, p.y + sy) && (!sx || !sy || (this.map.walkable(p.x + sx, p.y) && this.map.walkable(p.x, p.y + sy)));
    const go = tries.find(ok);
    // Olha para o lado na diagonal (a Ana só tem desenho para 4 lados). / Faces sideways on a diagonal (Ana only has 4-way art).
    p.dir = dirOf(go ?? [dx, dy]);
    if (!go) {
      if (this.bumpT > 0) return;
      // Avisa sobre o que está na frente, na direção que a pessoa pediu. / Tells about what is ahead, in the direction asked.
      const npc = crewAt(p.x + dx, p.y + dy);
      if (this.isStation(p.x + dx, p.y + dy)) {
        this.toast(t('eva.clean.station'));
        this.bumpT = 1;
        return;
      }
      if (npc) {
        this.toast(t('eva.talkTo', { name: t(CREW_NAME[npc.id]) }));
        this.bumpT = 1;
        return;
      }
      const wall = ([[dx, dy], [dx, 0], [0, dy]] as [number, number][]).find(([sx, sy]) => (sx || sy) && !this.map.walkable(p.x + sx, p.y + sy));
      if (!wall) return;
      const tile = this.map.tileAt(p.x + wall[0], p.y + wall[1]);
      this.toast(t(tile === TILE.cliff ? 'eva.bump.cliff' : tile === TILE.rock ? 'eva.bump.rock' : 'eva.bump.shelter'), 'bad');
      this.bumpT = 1.2;
      return;
    }
    const nx = p.x + go[0], ny = p.y + go[1];
    this.dust(p.x * T + 2, p.y * T + 6);
    p.ox = p.x;
    p.oy = p.y;
    p.x = nx;
    p.y = ny;
    p.mt = 0;
    const tl = this.map.tileAt(nx, ny);
    const sand = tl === TILE.sand;
    const sharp = tl === TILE.sharp;
    // Areia fofa deixa a Ana mais lenta. / Soft sand slows Ana down.
    p.dur = (sand ? 0.34 : 0.16) * (go[0] && go[1] ? Math.SQRT2 : 1);
    // Faíscas e dano ao traje e rodas na rocha pontiaguda. / Sparks and suit/wheel damage on sharp rock.
    if (sharp) this.effect(ART.spark, 3, 300, nx * T + 3, ny * T - 2);
    this.state.registerStep({ sand, sharp });
    // Passo com tom um pouco diferente a cada vez, para não soar repetido. / Step with a slightly different pitch each time, so it does not sound repetitive.
    play(this, 'passo', (Math.random() - 0.5) * 300);
  }

  /** Chegou a um tile novo. / Arrived on a new tile. */
  private arrive(): void {
    const p = this.anaW;
    this.updateShelter();
    // Cada passo depois da limpeza traz poeira de volta. / Each step after cleaning brings dust back.
    if (this.suitClean && ++this.cleanSteps > CLEAN.dirtySteps) this.suitClean = false;

    // Hook: verifica minerais no tile atual para futura interação com Guia de Campo
    // MineralsValue: 1=Clay, 2=Sulfates, 3=Both
    const mineralVal = this.getMineralAt(p.x, p.y);
    if (mineralVal !== 0) {
      this.events.emit('mineral-detected', { x: p.x, y: p.y, mineral: mineralVal });
    }

    for (const s of this.map.secrets) {
      if (s.x === p.x && s.y === p.y && !this.found.has(s.id)) return this.discover(s.id);
    }
    for (const q of this.map.pois) {
      if (q.x !== p.x || q.y !== p.y || this.visited.has(q.id)) continue;
      const want = q.id === 'ykb' ? STEP.ykb : q.id === 'bag' ? STEP.bag : STEP.box;
      if (want === this.step) return this.visitPoi(q.id);
      if (this.bumpT <= 0) {
        this.toast(t('eva.order', { name: this.target().name().toUpperCase() }));
        this.bumpT = 1.5;
      }
    }
    // Volta para casa: perto do habitat, a Ana entra com A (dá tempo de limpar o traje antes).
    // Back home: next to the habitat, Ana goes in with A (there is time to clean the suit first).
    const atStation = Math.abs(this.station.x - p.x) + Math.abs(this.station.y - p.y) <= 1;
    if (atStation && !this.cleanHint) this.toast(t(this.suitClean ? 'eva.clean.done' : 'eva.clean.station'), this.suitClean ? 'good' : undefined);
    this.cleanHint = atStation;
    const home = this.step === STEP.home && nearRect(this.map.habitat, p.x, p.y);
    if (home && !this.homeHint) this.toast(t(this.suitClean ? 'eva.home.enter' : 'eva.clean.hint'), this.suitClean ? 'good' : 'bad');
    this.homeHint = home;
  }

  /** Obtém valor mineral no tile (x, y). Retorna MineralsValue: 0=None, 1=Clay, 2=Sulfates, 3=Both */
  private getMineralAt(x: number, y: number): number {
    return this.map.minerals(x, y);
  }

  private finish(): void {
    if (this.finished) return;
    this.finished = true;
    this.held.clear();
    const count = guideCount();
    const data: EndingData = { guide: count.total, extras: count.extras, clock: this.clockText() };
    this.cameras.main.fadeOut(600, 0x1a, 0x0d, 0x0b);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(SCENES.ending, data));
  }

  // ---------------------------------------------------------------- Tatu

  private tatuGoals(): [number, number][] {
    const tg = this.target();
    const r: Rect =
      this.step === STEP.home ? this.map.habitat
      : this.step === STEP.solar && this.solar?.phase !== 'done' ? this.shelterRect(this.nearestShelter())
      : { x: tg.x, y: tg.y, w: 1, h: 1 };
    const out: [number, number][] = [];
    for (let y = r.y - 3; y < r.y + r.h + 3; y++)
      for (let x = r.x - 3; x < r.x + r.w + 3; x++) {
        const d = Math.max(r.x - x, x - (r.x + r.w - 1), r.y - y, y - (r.y + r.h - 1));
        if (d === 2) out.push([x, y]);
      }
    return out;
  }

  /** Próximo passo do Tatu por busca em largura (do protótipo). / Tatu's next step by breadth-first search (from the prototype). */
  private tatuNext(fx: number, fy: number, goals: [number, number][], strict: boolean, bx = -9, by = -9): [number, number] | 'here' | null {
    const { width: MW, height: MH } = this.map;
    const I = (x: number, y: number) => y * MW + x;
    const inMap = (x: number, y: number) => x >= 0 && y >= 0 && x < MW && y < MH;
    const pass = (x: number, y: number) => {
      if (!this.map.walkable(x, y) || this.isStation(x, y)) return false;
      if (!strict) return true;
      // Evita rocha pontiaguda e areia fofa (lição do Curiosity e do Spirit). / Avoids sharp rock and soft sand.
      const tl = this.map.tileAt(x, y);
      return tl !== TILE.sharp && tl !== TILE.sand;
    };
    const dist = new Int16Array(MW * MH).fill(-1);
    const q: number[] = [];
    for (const [gx, gy] of goals)
      if (inMap(gx, gy) && (pass(gx, gy) || (gx === fx && gy === fy)) && dist[I(gx, gy)] < 0) {
        dist[I(gx, gy)] = 0;
        q.push(gx, gy);
      }
    for (let h = 0; h < q.length; h += 2) {
      const x = q[h], y = q[h + 1], d = dist[I(x, y)];
      if (x === fx && y === fy) break;
      for (const [dx, dy] of Object.values(DIRS)) {
        const nx = x + dx, ny = y + dy;
        if (!inMap(nx, ny) || dist[I(nx, ny)] >= 0) continue;
        if (!(nx === fx && ny === fy) && (!pass(nx, ny) || (nx === bx && ny === by))) continue;
        dist[I(nx, ny)] = d + 1;
        q.push(nx, ny);
      }
    }
    const d0 = dist[I(fx, fy)];
    if (d0 <= 0) return d0 === 0 ? 'here' : null;
    for (const [dx, dy] of Object.values(DIRS)) {
      const nx = fx + dx, ny = fy + dy;
      if (inMap(nx, ny) && dist[I(nx, ny)] === d0 - 1) return [nx, ny];
    }
    return null;
  }

  private updateTatu(dt: number): void {
    const tt = this.tatuW, p = this.anaW;
    if (tt.mt < 1) {
      tt.mt = Math.min(1, tt.mt + dt / tt.dur);
      return;
    }
    if (this.paused || this.finished || this.state.isTatuOff) return;
    const dp = Math.max(Math.abs(tt.x - p.x), Math.abs(tt.y - p.y));
    // A espera conta a cada quadro (antes contava só nos quadros em que o Tatu pensava e demorava uns 30 s).
    // The wait counts every frame (before it only counted on the Tatu's thinking frames and took about 30 s).
    tt.wait = tt.mode === 'lead' && dp > TATU_NEAR ? tt.wait + dt : 0;
    if (dp > TATU_FAR && !this.anaIn) return this.tatuJoin();
    tt.think -= dt;
    if (tt.think > 0) return;
    let nx: [number, number] | null = null;
    if (tt.mode === 'back') {
      if (dp <= 2) {
        tt.mode = 'lead';
        tt.wait = 0;
      } else {
        const n = this.tatuNext(tt.x, tt.y, [[p.x, p.y]], false);
        if (Array.isArray(n)) nx = n;
      }
    } else if (dp > TATU_NEAR) {
      if (tt.wait > TATU_WAIT) tt.mode = 'back';
    } else {
      const goals = this.tatuGoals();
      let n = this.tatuNext(tt.x, tt.y, goals, true, p.x, p.y);
      if (n === null) n = this.tatuNext(tt.x, tt.y, goals, false, p.x, p.y);
      // Não dispara na frente: só dá o passo se continuar a até 2 tiles da Ana. / No dashing ahead: only steps if it stays within 2 tiles of Ana.
      if (Array.isArray(n) && Math.max(Math.abs(n[0] - p.x), Math.abs(n[1] - p.y)) <= TATU_LEAD) nx = n;
    }
    if (nx && !(nx[0] === p.x && nx[1] === p.y)) {
      tt.ox = tt.x;
      tt.oy = tt.y;
      [tt.x, tt.y] = nx;
      tt.mt = 0;
      tt.dur = this.map.tileAt(tt.x, tt.y) === TILE.sand ? TATU_SPEED.sand : tt.mode === 'back' ? TATU_SPEED.back : TATU_SPEED.lead;
      const dx = tt.x - tt.ox, dy = tt.y - tt.oy;
      tt.dir = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down';
      tt.think = 0.02; // passo contínuo sem engasgo / continuous step without stutter
    } else {
      tt.think = 0.08; // sem movimento imediato: checa de novo em breve / no immediate step: check again soon
    }
  }

  /** Põe o Tatu num tile livre colado na Ana, de preferência atrás dela. / Puts the Tatu on a free tile next to Ana, preferably behind her. */
  private tatuJoin(): void {
    const tt = this.tatuW, p = this.anaW, [fx, fy] = DIRS[p.dir];
    const spots: [number, number][] = [[-fx, -fy], [-1, 0], [1, 0], [0, 1], [0, -1], [-1, 1], [1, 1], [-1, -1], [1, -1]];
    const free = (x: number, y: number) =>
      this.map.walkable(x, y) && !this.isStation(x, y) && !this.crew.some((c) => c.move === 'out' && c.x === x && c.y === y);
    const s = spots.find(([dx, dy]) => (dx || dy) && free(p.x + dx, p.y + dy));
    if (!s) return;
    Object.assign(tt, { x: p.x + s[0], y: p.y + s[1], ox: p.x + s[0], oy: p.y + s[1], mt: 1, mode: 'lead', wait: 0, think: 0.2 });
  }

  // ---------------------------------------------------------------- quadro a quadro / per frame

  update(_time: number, delta: number): void {
    const dt = Math.min(0.05, delta / 1000);
    this.clock += dt;
    if (this.bumpT > 0) this.bumpT -= dt;
    if (!this.live) return; // esperando a interface / waiting for the interface

    const p = this.anaW;
    if (p.mt < 1) {
      p.mt = Math.min(1, p.mt + dt / p.dur);
      this.walkFrame += dt * 11;
      if (p.mt >= 1) this.arrive();
    }
    this.tryMove();
    this.updateTatu(dt);
    this.updateDoors(dt);
    this.placeWalkers();
    this.animate();
    // O tempo para durante diálogos e no guia, como no protótipo. / Time stops during dialogue and in the guide, as in the prototype.
    if (!this.paused && !this.finished) {
      // Dentro do abrigo, durante o evento, o tempo corre 10 vezes mais rápido. / Inside the shelter, during the event, time runs 10 times faster.
      const fast = this.anaIn?.move === 'in' && this.solar && this.solar.phase !== 'done';
      const before = this.state.minutesTotal;
      // Posições da Ana e do Tatu para os redemoinhos e o ponto de retorno. / Ana and Tatu positions for the dust devils and the point of return.
      this.state.setActors(this.walkerPos(this.anaW), this.walkerPos(this.tatuW));
      this.state.tick(dt * (fast ? SOLAR.insideSpeed : 1));
      const sp = this.solar;
      if (sp && sp.phase !== 'done') for (const n of sp.tick(this.state.minutesTotal - before, this.inShelter())) this.solarNews(n);

      // Battery drain for active non-MAPA layer (protótipo: 100/200 por minuto extra)
      const activeLayer = this.state.getHud().layer;
      if (activeLayer !== 'mapa' && ['topografia', 'minerais', 'terreno'].includes(activeLayer)) {
        // 100/200 por minuto = 100/200 / 60 por segundo de jogo
        // dt é em segundos reais, mas state.tick já converte para minutos de jogo
        // O dreno já é aplicado dentro do state.tick via getHud().battery
      }
    }
    this.hudT -= dt;
    if (this.hudT <= 0) this.updateHud();
    this.updateShade();
    this.drawSolar();
    this.updateArrow();

  }

  private galeMapOpen = false;

  /**
   * Entardecer e noite: um véu escuro sobre o mapa, de 0 (dia) a 1 (noite plena), que fica azulado como o crepúsculo de Marte.
   * Dusk and night: a dark veil over the map, from 0 (day) to 1 (full night), turning bluish like the Martian twilight.
   */
  private updateShade(): void {
    const d = this.state.getHud().darkness ?? 0, v = this.cameras.main.worldView;
    this.shade.clear();
    if (d <= 0) return;
    const ink = [0x1a, 0x0d, 0x0b], blue = [0x14, 0x1a, 0x3a];
    const [r, g, b] = ink.map((c, i) => Math.round(c + (blue[i] - c) * d));
    this.shade.fillStyle((r << 16) | (g << 8) | b, d * 0.62).fillRect(v.x - 2, v.y - 2, v.width + 4, v.height + 4);
  }

  /**
   * Evento solar na tela: brilho laranja no aviso; lá fora, borda vermelha e pontos brilhando (as partículas aparecem assim
   * nas câmeras dos rovers); dentro do abrigo, a tela fica avermelhada enquanto o evento cresce e passa.
   * Solar event on screen: orange glow during the warning; outside, a red edge and bright dots (that is how particles show up
   * on rover cameras); inside the shelter, the screen turns reddish while the event builds up and fades.
   */
  private drawSolar(): void {
    const g = this.fx.clear(), sp = this.solar;
    if (!sp || sp.phase === 'done') return;
    const v = this.cameras.main.worldView, t = this.clock;
    const X = Math.floor(v.x), Y = Math.floor(v.y), W = Math.ceil(v.width), H = Math.ceil(v.height);
    const edge = (color: number, alpha: number) => {
      for (let i = 0; i < 4; i++) {
        const a = alpha * (1 - i / 4) * 0.5, w = 3;
        g.fillStyle(color, a).fillRect(X + i * w, Y + i * w, W - 2 * i * w, w).fillRect(X + i * w, Y + H - (i + 1) * w, W - 2 * i * w, w);
        g.fillStyle(color, a).fillRect(X + i * w, Y + (i + 1) * w, w, H - 2 * (i + 1) * w).fillRect(X + W - (i + 1) * w, Y + (i + 1) * w, w, H - 2 * (i + 1) * w);
      }
    };
    const hits = (n: number) => {
      for (let i = 0; i < n; i++) {
        const hx = X + Math.floor(Math.random() * (W - 3)) + 1, hy = Y + Math.floor(Math.random() * (H - 3)) + 1;
        g.fillStyle(0xffd27a, 0.8).fillRect(hx - 1, hy, 3, 1).fillRect(hx, hy - 1, 1, 3);
        g.fillStyle(0xffffff, 1).fillRect(hx, hy, 1, 1);
      }
    };
    if (this.anaIn?.move === 'in') {
      const it = sp.phase === 'warn' ? 0.25 + 0.25 * (1 - sp.left / SOLAR.warnMin) : 0.5 + 0.5 * Math.sin(Math.PI * Math.min(1, 1 - sp.left / SOLAR.activeMin));
      g.fillStyle(0x2a0c08, 0.18 + 0.25 * it).fillRect(X, Y, W, H);
      edge(0xff6a45, 0.25 + 0.5 * it);
      hits(Math.round(3 + it * 22));
    } else if (sp.phase === 'active' && !this.inShelter()) {
      edge(0xff6a45, 0.5 + 0.3 * Math.sin(t * 6));
      hits(4);
    } else if (sp.phase === 'warn') edge(0xffb347, 0.25 + 0.2 * Math.sin(t * 4));
  }

  /** Diálogo, guia, mapa da cratera ou painel do Tatu aberto. / Dialogue, guide, crater map or Tatu panel open. */
  private get paused(): boolean {
    return this.dlg.isOpen || this.ui.guide.isOpen || this.galeMapOpen || !!this.ui.tatuPanel?.isOpen;
  }

  // ---------------------------------------------------------------- HUD

  private updateHud(): void {
    this.hudT = 0.1;
    const snap = this.getHudSnapshot(), sp = this.solar, obj = this.objective();
    const glitch = !!sp && sp.phase === 'active' && !this.inShelter();
    this.ui.hud.update(snap, obj.text, this.zoomed, obj.alert, glitch);
    this.shelterNote();
  }

  /** Seta na borda da tela apontando para o alvo. / Arrow on the screen edge pointing at the target. */
  private updateArrow(): void {
    if (this.paused || this.finished || this.anaIn) return this.ui.pointTo(null);
    const tg = this.target(), cam = this.cameras.main, view = cam.worldView;
    const wx = tg.x * T + 8, wy = tg.y * T + 8;
    // Em pixels da tela de 160x144, com ou sem visão ampla. / In 160x144 screen pixels, with or without wide view.
    const k = GAME_WIDTH / view.width;
    this.ui.pointTo({ x: (wx - view.x) * k, y: (wy - view.y) * k });
  }

  private layerName(layer: string): string {
    return t(`layer.${layer as LayerId}.name` as TextKey);
  }

  /** Define modo de camada de visão (Mapa, Terreno, Topografia, Minerais).
   * Chamado pelos botões da UI (Hud.ts emite 'layer' via inputBus).
   * Não emite toast nem tem hotkeys — a UI cuida do feedback visual.
   */
  setMapLayer(mode: LayerMode): void {
    this.mapOverlay.setMode(mode);
  }

  private clockText(): string {
    const h = this.state.getHud();
    return t('hud.clock', { sol: h.sol, time: `${String(Math.floor(h.minutes / 60)).padStart(2, '0')}:${String(Math.floor(h.minutes % 60)).padStart(2, '0')}` });
  }

  private placeWalkers(): void {
    const p = this.anaW, k = p.mt;
    const ax = (p.ox + (p.x - p.ox) * k) * T, ay = (p.oy + (p.y - p.oy) * k) * T;
    const z = this.anaIn;
    if (z?.move === 'in') this.ana.setVisible(false);
    else if (z) {
      // Passando pela porta do abrigo. / Going through the shelter door.
      const ps = this.doorPose(z.k, z.move, z.t, ax, ay);
      const side: Dir = (ps.dx > 0) === ps.enter ? 'right' : 'left';
      const dir: Dir = Math.abs(ps.dx) > 8 && ps.a > 0.5 ? side : ps.enter ? 'up' : 'down';
      const [walk, flip] = ps.moving ? WALK[dir][((this.clock * 10) | 0) % 4] : [0, false];
      this.ana.setVisible(true).setAlpha(ps.a).setTexture(ANA_SHEET[dir], walk).setFlipX(flip);
      this.ana.setPosition(Math.round(ps.x), Math.round(ps.y) - 8).setDepth(ps.y + 16);
    } else {
      const [walk, flip] = k < 1 ? WALK[p.dir][(this.walkFrame | 0) % 4] : [0, false];
      this.ana.setVisible(true).setAlpha(1).setTexture(ANA_SHEET[p.dir], walk).setFlipX(flip);
      this.ana.setPosition(Math.round(ax), Math.round(ay) - 8).setDepth(ay + 16);
    }

    const tt = this.tatuW, kk = tt.mt;
    const cx = (tt.ox + (tt.x - tt.ox) * kk) * T, cy = (tt.oy + (tt.y - tt.oy) * kk) * T;
    const sheet = tt.dir === 'up' ? ART.tatuUp2x : tt.dir === 'down' ? ART.tatuDown2x : ART.tatuSide2x;
    const frame = kk < 1 ? (this.map.tileAt(tt.x, tt.y) === TILE.sand ? 4 : ((this.clock * 8) | 0) % 3) : 0;
    this.tatu.setTexture(sheet, frame).setFlipX(tt.dir === 'right');
    this.tatu.setPosition(Math.round(cx) - 2, Math.round(cy) - 3).setDepth(cy + 15);
  }

  private animate(): void {
    const T2 = this.clock, p = this.anaW;
    this.rover.setFrame(((T2 * 2) | 0) % 2);
    const target = this.target();
    for (const [id, b] of this.beacons) {
      const q = this.map.pois.find((x) => x.id === id)!;
      const cur = q.x === target.x && q.y === target.y;
      b.setFrame([0, 1, 2, 1][((T2 * (cur ? 6 : 3)) | 0) % 4]);
    }
    // A tripulação olha para a Ana e acena quando ela chega perto. / The crew faces Ana and waves when she is close.
    for (const c of this.crew) {
      const hx = c.x * T, hy = c.y * T;
      if (c.move === 'in') {
        c.sprite.setVisible(false);
        continue;
      }
      if (c.move !== 'out') {
        // Entrando ou saindo do abrigo, um de cada vez. / Going in or out of the shelter, one at a time.
        const ps = this.doorPose(CREW_SHELTER[c.id], c.move, c.t - c.delay, hx, hy);
        const right = (ps.dx > 0) === ps.enter;
        const frame = ps.moving ? (Math.abs(ps.dx) > 8 && ps.a > 0.5 ? (right ? 1 : 3) : ps.enter ? 2 : 0) : 0;
        c.sprite.setVisible(true).setAlpha(ps.a).setFrame(frame).setPosition(Math.round(ps.x) - 2, Math.round(ps.y) - 8).setDepth(ps.y + 16);
        continue;
      }
      const dx = p.x - c.x, dy = p.y - c.y;
      const near = !this.anaIn && Math.abs(dx) + Math.abs(dy) <= 1;
      const look = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : dy < 0 ? 2 : 0;
      c.sprite.setVisible(true).setAlpha(1).setPosition(hx - 2, hy - 8).setDepth(hy + 16);
      // Todos (Keli, Natan e Rossi) acompanham a Ana com o olhar; colada neles, fazem a animação de fala.
      // Everyone (Keli, Natan and Rossi) follows Ana with their eyes; right next to them, they play the talking animation.
      c.sprite.setFrame(near ? 4 + (((T2 * 3) | 0) % 2) : look);
    }
    // Brilho das descobertas só aparece de perto. / Discovery sparkle only shows up close.
    for (const s of this.map.secrets) {
      const sh = this.shines.get(s.id)!;
      const show = !this.found.has(s.id) && Math.abs(s.x - p.x) + Math.abs(s.y - p.y) <= 7;
      sh.setVisible(show);
      if (show) sh.setFrame(((T2 * 6 + s.x) | 0) % 4);
    }
    // Pontos ainda não visitados: anel que se abre; no alvo atual, feixe de luz e setinha. / Unvisited points: widening ring; on the current target, light beam and small arrow.
    this.overlay.clear();
    const g = this.marks.clear();
    this.map.pois.forEach((q, i) => {
      if (this.visited.has(q.id)) return;
      const cur = q.x === target.x && q.y === target.y, ph = (T2 * 1.6 + i) % 1, fx = q.x * T, fy = q.y * T;
      if (cur) g.fillStyle(P[5], 0.35).fillRect(fx + 7, fy - 40, 2, 44);
      g.lineStyle(1, cur ? P[5] : P[4], 1 - ph).strokeEllipse(fx + 8, fy + 13, (4 + ph * 9) * 2, (2 + ph * 4) * 2);
    });
    this.overlayArrow(target);
    // Redemoinhos andando devagar pela planície. / Dust devils drifting slowly across the plain.
    this.devils.forEach((d, i) => {
      const p0 = DEVILS[i];
      d.setPosition(Math.round((p0.x + Math.sin(T2 * 0.07 + i * 2) * 6) * T), Math.round((p0.y + Math.cos(T2 * 0.05 + i) * 3) * T) - 10);
      d.setFrame(((T2 * 10) | 0) % 6);
    });
    const dv = this.state.getDevil(), ds = this.devilSprite;
    if (ds) {
      ds.setVisible(!!dv);
      if (dv) {
        const y = Math.round(dv.y * T + 14);
        ds.setPosition(Math.round(dv.x * T + 8), y).setDepth(y).setFrame(((T2 * 10) | 0) % 6);
      }
    }
    this.sand?.setTexture(SAND_FRAMES[((T2 * 3) | 0) % 4]);
    this.drawOverlay();
  }

  /** Setinha balançando em cima da baliza do alvo atual. / Small bobbing arrow above the current target's beacon. */
  private overlayArrow(target: Point): void {
    const q = this.map.pois.find((p) => p.x === target.x && p.y === target.y);
    if (!q || this.visited.has(q.id)) return;
    const g = this.overlay, fx = q.x * T, by = q.y * T - 10 + Math.round(Math.sin(this.clock * 5) * 2);
    g.fillStyle(P[0], 1).fillRect(fx + 5, by, 6, 1);
    g.fillStyle(P[5], 1).fillRect(fx + 6, by + 1, 4, 1).fillRect(fx + 7, by + 2, 2, 1);
    g.fillStyle(P[4], 1).fillRect(fx + 6, by, 4, 1);
  }

  private dust(x: number, y: number): void {
    this.effect(ART.dust, 4, 400, x, y);
  }

  /** Efeito curto que passa pelos quadros e some. / Short effect that runs through its frames and disappears. */
  private effect(key: ArtKey, frames: number, ms: number, x: number, y: number): void {
    const d = this.add.sprite(x, y, key, 0).setOrigin(0).setDepth(y);
    let f = 0;
    this.time.addEvent({ delay: ms / frames, repeat: frames - 1, callback: () => (++f >= frames ? d.destroy() : d.setFrame(f)) });
  }

  /**
   * Tamanho da tela da EVA: sempre 2 pixels por pixel do jogo. A visão ampla (V) mostra o dobro do mapa
   * com a mesma nitidez, como no protótipo.
   * EVA screen size: always 2 pixels per game pixel. The wide view (V) shows twice the map
   * at the same sharpness, as in the prototype.
   */
  private setScreen(wide: boolean): void {
    const k = EVA_PIXEL * (wide ? 2 : 1);
    this.scale.setGameSize(GAME_WIDTH * k, GAME_HEIGHT * k);
    const cam = this.cameras.main;
    cam.setSize(GAME_WIDTH * k, GAME_HEIGHT * k);
    cam.setZoom(EVA_PIXEL);
  }

  /**
   * Rochas médias e grandes por cima do chão, com a arte 2x.
   * Medium and big rocks on top of the ground, with the 2x art.
   */
  private placeRocks(): void {
    const m = this.map;
    for (let y = 0; y < m.height; y++)
      for (let x = 0; x < m.width; x++)
        if (m.tileAt(x, y) === TILE.rock && !m.isBoulder(x, y) && !m.isPebble(x, y))
          this.add.image(x * T, y * T, ART.rocksMid2x, Math.floor(hash(x, y, 126) * 4)).setOrigin(0).setScale(HD).setFlipX(hash(x, y, 92) < 0.5).setDepth(-950);
    for (const q of m.boulders)
      this.add.image(q.x * T, (q.y + 2) * T, ART.rocksBig2x, q.kind).setOrigin(0, 1).setScale(HD).setFlipX(hash(q.x, q.y, 130) < 0.5).setDepth(-940);
  }

  /**
   * Ícone de dados em cima do Tatu (com balão quando ele espera ou volta) e poeira no ar.
   * Data icon above the Tatu (with a bubble when it waits or comes back) and dust in the air.
   */
  private drawOverlay(): void {
    const g = this.overlay, t = this.clock;
    const px = (x: number, y: number, w: number, h: number, c: number) => g.fillStyle(c, 1).fillRect(x, y, w, h);
    const tt = this.tatuW, kk = tt.mt;
    const cx = Math.round((tt.ox + (tt.x - tt.ox) * kk) * T), cy = Math.round((tt.oy + (tt.y - tt.oy) * kk) * T);
    const ix = cx + 4, iy = cy - 12 + Math.round(Math.sin(t * 4));
    const SAFE = 0x9ad48a, ALERT = 0xff6a45;
    px(ix - 1, iy - 1, 10, 9, P[0]);
    px(ix, iy, 8, 7, P[4]);
    px(ix + 1, iy + 1, 6, 4, P[0]);
    px(ix + 2, iy + 3, 1, 1, SAFE);
    px(ix + 3, iy + 2, 1, 2, SAFE);
    px(ix + 4, iy + 1, 1, 3, SAFE);
    px(ix + 3, iy + 7, 2, 2, P[0]);
    if (tt.mode === 'back' || tt.wait > 1) {
      const bx = ix + 10, by = iy - 4;
      px(bx - 1, by - 1, 7, 8, P[0]);
      px(bx, by, 5, 6, P[5]);
      if (tt.mode === 'back') {
        px(bx + 2, by + 1, 1, 3, ALERT);
        px(bx + 2, by + 5, 1, 1, ALERT);
      } else for (let k = 1; k <= 3; k++) px(bx + k, by + 3, 1, 1, P[0]);
    }
    // Perto de uma porta que dá para entrar: plaquinha "A ↓" (ou "Z ↓" no teclado) piscando em cima dela.
    // Next to a door Ana can go through: blinking "A ↓" sign (or "Z ↓" on a keyboard) above it.
    const k = this.paused ? null : this.doorHere();
    if (k && ((t * 2) | 0) % 2) {
      const d = this.door(k), bx = Math.round(d.x) + 1, by = this.shelterRect(k).y * T - 14;
      px(bx - 1, by - 1, 16, 12, P[0]);
      px(bx, by, 14, 10, SAFE);
      // Letra do botão (3x5) e seta para baixo (5x6). / Button letter (3x5) and down arrow (5x6).
      const A = buttonLabel('A') === 'A' ? ['.#.', '#.#', '###', '#.#', '#.#'] : ['###', '..#', '.#.', '#..', '###'];
      const DOWN = ['..#..', '..#..', '..#..', '#####', '.###.', '..#..'];
      A.forEach((row, y) => [...row].forEach((ch, x) => ch === '#' && px(bx + 2 + x, by + 3 + y, 1, 1, P[0])));
      DOWN.forEach((row, y) => [...row].forEach((ch, x) => ch === '#' && px(bx + 7 + x, by + 2 + y, 1, 1, P[0])));
    }
    // Poeira que o vento leva, presa à tela. / Dust carried by the wind, tied to the screen.
    const v = this.cameras.main.worldView, VW = v.width, VH = v.height;
    for (let i = 0; i < 10; i++) {
      const sx = (hash(i, 1, 99) * VW + t * (6 + i)) % VW, sy = (hash(i, 2, 99) * VH + Math.sin(t + i) * 4 + VH) % VH;
      px(Math.floor(v.x + sx), Math.floor(v.y + sy), 1, 1, i % 3 ? P[3] : P[4]);
    }
  }

  // ---------------------------------------------------------------- aviso curto / toast

  private toast(text: string, kind?: 'good' | 'bad'): void {
    this.ui.toast(text, kind);
  }
}

/** Dose no formato do HUD. / Dose in the HUD format. */
function fmtDose(d: number): string {
  return `${formatNumber(d, d >= 100 ? 1 : d >= 10 ? 2 : 3)} mSv`;
}

function nearRect(r: Rect, x: number, y: number): boolean {
  return x >= r.x - 1 && x <= r.x + r.w && y >= r.y - 1 && y <= r.y + r.h;
}
