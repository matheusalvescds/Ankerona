/**
 * Camada de interface da EVA, numa cena própria por cima do mapa: HUD, seta de objetivo,
 * caixa de diálogo, avisos curtos, aviso de abrigo e Guia de Campo.
 * EVA interface layer, in its own scene on top of the map: HUD, objective arrow,
 * dialogue box, short notices, shelter notice and Field Guide.
 *
 * Fica separada para não ser afetada pelo zoom da câmera do mapa (tecla V).
 * Kept separate so the map camera zoom (V key) doesn't affect it.
 */
import * as Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENES } from '../config';
import { DialogBox } from '../ui/DialogBox';
import { FieldGuide } from '../ui/FieldGuide';
import { Hud } from '../ui/Hud';
import { TatuPanel } from '../ui/TatuPanel';
import type { EvaScene } from './EvaScene';
import { pixelArrows } from '../ui/arrows';
import { esc, screenLayer, type ScreenLayer } from '../ui/Screen';
import { P } from './pixelArt';
import { GaleMapOverlay } from './eva/GaleMapOverlay';

/** Área livre abaixo do HUD, onde a seta pode ficar. / Free area below the HUD, where the arrow may sit. */
const ARROW_TOP = 30;

export class EvaUiScene extends Phaser.Scene {
  dlg!: DialogBox;
  hud!: Hud;
  guide!: FieldGuide;
  tatuPanel!: TatuPanel;
  private layer!: ScreenLayer;
  private arrow!: Phaser.GameObjects.Graphics;
  private toastT = 0;
  private clock = 0;
  galeMapOverlay!: GaleMapOverlay;

  constructor() {
    super(SCENES.evaUi);
  }

  create(): void {
    this.toastT = 0;
    this.clock = 0;
    this.arrow = this.add.graphics().setDepth(5);
    // A EVA usa uma tela maior; a seta é desenhada em 160x144 e ampliada. / The EVA uses a bigger screen; the arrow is drawn at 160x144 and scaled up.
    const fit = () => this.arrow.setScale(this.scale.width / GAME_WIDTH);
    fit();
    this.scale.on(Phaser.Scale.Events.RESIZE, fit);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, fit));
    this.hud = new Hud(this, 15);
    this.layer = screenLayer(this, 20);
    this.layer.set('<div class="toast" hidden></div><div class="shel" hidden></div>');
    this.dlg = new DialogBox(this, 30);
    this.guide = new FieldGuide(this, 40);

    // O painel pergunta à EvaScene só na hora de desenhar, então ela não precisa estar pronta agora.
    // The panel asks the EvaScene only when drawing, so it does not need to be ready now.
    const eva = this.scene.get(SCENES.eva) as EvaScene;
    this.tatuPanel = new TatuPanel(this, {
      getHudSnapshot: () => eva.getHudSnapshot(),
      getTargetBrief: () => eva.getTatuBrief(),
      getTatuMode: () => eva.getTatuMode(),
      onOpenGuide: () => this.guide.open(),
      onOpenMap: () => this.openGaleMap(),
    }, 45);

    // Mapa da missão (tecla M): lê a EVA a cada quadro. / Mission map (M key): reads the EVA each frame.
    this.galeMapOverlay = new GaleMapOverlay(this, () => eva.getMapView(), 50);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.galeMapOverlay.destroy());
  }

  /** Aviso curto abaixo do HUD. / Short notice below the HUD. */
  toast(text: string, kind?: 'good' | 'bad'): void {
    const el = this.layer.find('.toast');
    if (!el) return;
    // Com o aviso de abrigo aberto, o aviso curto desce um pouco. / With the shelter notice open, the short notice moves down a bit.
    const under = this.layer.find('.shel')?.hidden === false;
    el.className = `toast${kind ? ` ${kind}` : ''}${under ? ' under' : ''}`;
    el.innerHTML = esc(text);
    el.hidden = false;
    this.toastT = 2.2;
  }

  /**
   * Aviso pequeno, embaixo, enquanto a Ana está no abrigo (null esconde). `risk` deixa a ação em vermelho.
   * Small notice at the bottom while Ana is in the shelter (null hides it). `risk` turns the action red.
   */
  shelterNote(note: { title: string; action: string; risk: boolean } | null): void {
    const el = this.layer.find('.shel');
    if (!el) return;
    if (!note) {
      el.hidden = true;
      return;
    }
    const html = `<b>${pixelArrows(esc(note.title))}</b><br><i class="${note.risk ? 'risk' : ''}">${esc(note.action)}</i>`;
    if (el.innerHTML !== html) el.innerHTML = html;
    el.hidden = false;
  }

  hideToast(): void {
    const el = this.layer.find('.toast');
    if (el) el.hidden = true;
    this.toastT = 0;
  }

  /**
   * Seta de objetivo na borda da tela, apontando para o alvo (em pixels da tela de 160x144).
   * Só aparece quando o alvo está fora da tela. null esconde.
   * Objective arrow on the screen edge, pointing at the target (in 160x144 screen pixels).
   * Only shows when the target is off screen. null hides it.
   */
  pointTo(target: { x: number; y: number } | null): void {
    const g = this.arrow;
    g.clear();
    if (!target) return;
    const W = GAME_WIDTH, H = GAME_HEIGHT;
    const { x: tx, y: ty } = target;
    if (tx >= 0 && tx <= W && ty >= ARROW_TOP && ty <= H) return;
    // Mesma conta do protótipo: centro da área livre, raio de 72 x 50. / Same math as the prototype.
    const cx = W / 2, cy = (H + ARROW_TOP - 4) / 2, ang = Math.atan2(ty - cy, tx - cx);
    const ax = Math.round(Phaser.Math.Clamp(cx + Math.cos(ang) * 72, 8, W - 8));
    const ay = Math.round(Phaser.Math.Clamp(cy + Math.sin(ang) * 50, ARROW_TOP + 6, H - 8));
    // Triângulo mais comprido que largo, para a ponta ficar clara. / Longer than wide, so the tip reads clearly.
    const tri = (tip: number, back: number, half: number, color: number) => {
      const c = Math.cos(ang), s = Math.sin(ang);
      const pt = (x: number, y: number) => ({ x: ax + x * c - y * s, y: ay + x * s + y * c });
      const a = pt(tip, 0), b = pt(-back, -half), d = pt(-back, half);
      g.fillStyle(color, 1).fillTriangle(a.x, a.y, b.x, b.y, d.x, d.y);
    };
    tri(7, 5, 4.5, P[0]);
    tri(5, 3.5, 2.8, ((this.clock * 3) | 0) % 2 ? P[5] : P[4]);
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    this.clock += dt;
    if (this.toastT > 0) {
      this.toastT -= dt;
      if (this.toastT <= 0) this.hideToast();
    }

    // Mapa da missão aberto: redesenha a Ana, o Tatu e os alvos. / Mission map open: redraws Ana, the Tatu and the targets.
    this.galeMapOverlay?.update(dt);
  }

  /** Abre o mapa da Cratera Gale (tecla M). / Opens the Gale Crater map (M key). */
  openGaleMap(): void {
    if (this.galeMapOverlay.isVisible()) return;
    this.galeMapOverlay.show();
    this.hud.setVisible(false); // Oculta HUD principal
    this.layer.find('.toast')!.hidden = true; // Esconde toast
    this.toastT = 0;
    // A EvaScene pausa o jogo ao ouvir isto. / The EvaScene pauses the game on this.
    this.scene.get(SCENES.eva).events.emit('gale-map-opened');
  }

  /** Fecha o mapa da Cratera Gale. / Closes the Gale Crater map. */
  closeGaleMap(): void {
    if (!this.galeMapOverlay.isVisible()) return;
    this.galeMapOverlay.hide();
    this.hud.setVisible(true); // Restaura HUD
    this.scene.get(SCENES.eva).events.emit('gale-map-closed');
  }

  /** Alterna o mapa da Cratera Gale. / Toggles the Gale Crater map. */
  toggleGaleMap(): void {
    if (this.galeMapOverlay.isVisible()) {
      this.closeGaleMap();
    } else {
      this.openGaleMap();
    }
  }

  /** Abre o Painel do Tatu (tecla T). / Opens the Tatu Panel (T key). */
  openTatuPanel(): void {
    if (this.tatuPanel.isOpen) return;
    // O painel também fecha sozinho (B ou T, ou ao abrir o Guia ou o Mapa): o retorno devolve o HUD.
    // The panel also closes on its own (B or T, or when opening the Guide or the Map): the callback brings the HUD back.
    this.tatuPanel.open(() => this.hud.setVisible(true));
    this.hud.setVisible(false);
    this.layer.find('.toast')!.hidden = true;
    this.toastT = 0;
  }

  /** Fecha o Painel do Tatu. / Closes the Tatu Panel. */
  closeTatuPanel(): void {
    if (!this.tatuPanel.isOpen) return;
    this.tatuPanel.close();
  }

  /** Alterna o Painel do Tatu. / Toggles the Tatu Panel. */
  toggleTatuPanel(): void {
    if (this.tatuPanel.isOpen) {
      this.closeTatuPanel();
    } else {
      this.openTatuPanel();
    }
  }

}
