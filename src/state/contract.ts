/**
 * PROPOSTA de contrato entre o estado da partida (Miguel) e as cenas/HUD (Jonatha).
 * PROPOSAL for the contract between game state (Miguel) and scenes/HUD (Jonatha).
 *
 * Só tipos, sem regras. O Miguel implementa as regras (O₂, bateria, traje, eventos) em src/state/.
 * As cenas apenas leem este estado e escutam os eventos; não recalculam nada.
 * Types only, no rules. Miguel implements the rules (O₂, battery, suit, events) in src/state/.
 * Scenes only read this state and listen to events; they never recompute anything.
 *
 * A combinar com o Miguel antes de usar. / To be agreed with Miguel before use.
 */

/** Faixa de cor das barras do HUD. / HUD bar color band. */
export type Level = 'ok' | 'warn' | 'danger'; // verde / amarelo / vermelho — green / yellow / red

export interface HudSnapshot {
  o2: number; // 0–100 (%)
  /** O₂ necessário para voltar ao abrigo mais próximo (marcador VOLTA da v3). / O₂ needed to reach the nearest shelter (v3 RETURN marker). */
  o2Return: number;
  battery: number; // 0–100 (%), bateria do Tatu / Tatu's battery
  suit: number; // 0–100 (%), integridade do traje / suit integrity
  doseMSv: number; // dose acumulada em mSv / accumulated dose in mSv
  sol: number; // dia marciano / Martian day
  minutes: number; // minutos desde 00:00 do sol / minutes since 00:00 of the sol
  layer: string; // camada ativa: 'mapa' | 'topografia' | 'minerais' | 'terreno' / active layer
  /** Chave de texto do objetivo atual (pt.json/en.json). / Text key of the current objective. */
  objectiveKey: string;
  target?: { x: number; y: number }; // alvo da seta de objetivo, em tiles / objective arrow target, in tiles
  /** Noite marciana (depois das 18h). / Martian night (after 18:00). */
  night?: boolean;
  /** Escuridão da câmera, 0 (dia) a 1 (noite plena). / Camera darkness, 0 (day) to 1 (full night). */
  darkness?: number;
  /** Temperatura do ar em °C. / Air temperature in °C. */
  tempC?: number;
  /** Parte da geração solar do Tatu perdida pela poeira nos painéis, 0 a 0,6. / Share of the Tatu's solar output lost to panel dust, 0 to 0.6. */
  panelDust?: number;
  /** Tatu hibernando: sem bateria, instrumentos desligados. / Tatu hibernating: no battery, instruments off. */
  tatuOff?: boolean;
  /** Rodas do Tatu, 0 a 100 (%); abaixo de 50 o Tatu gasta 50% mais bateria. / Tatu wheels, 0 to 100 (%); below 50 the Tatu uses 50% more battery. */
  wheels?: number;
  /** Fase do evento solar: 'warn' (alerta) ou 'active' (partículas). Falta se não há evento. / Solar event phase: 'warn' (alert) or 'active' (particles). Absent if no event. */
  solarPhase?: 'warn' | 'active';
  /** Minutos até as partículas chegarem (warn) ou até o fim (active). / Minutes until the particles arrive (warn) or until the end (active). */
  solarMinutes?: number;
  /** Minutos de jogo de O₂ restantes, parada, agora. / Game minutes of O₂ left, standing, right now. */
  o2Minutes?: number;
  /** Minutos de jogo até o ponto de retorno (quando O₂ − necessário chega a 0). Falta se não há como calcular ou está no abrigo. / Game minutes until the point of return (when O₂ − needed hits 0). Absent if it cannot be computed or at shelter. */
  returnInMin?: number;
}

/** Eventos que o estado dispara e as cenas escutam. / Events the state emits and scenes listen to. */
export interface GameEvents {
  /** Alerta de erupção solar; minutesToShelter = minutos até as partículas chegarem. / Solar flare alert; minutesToShelter = minutes until the particles arrive. */
  'solar-alert': { minutesToShelter: number };
  /** As partículas chegaram (fora do abrigo a dose sobe rápido). / The particles arrived (outside shelter the dose rises fast). */
  'solar-arrival': void;
  /** Fim do evento; doseMSv = dose recebida do alerta até o fim. / Event over; doseMSv = dose received from the alert to the end. */
  'solar-alert-end': { doseMSv: number };
  'night-start': void;
  'night-end': void;
  /** Entardecer: 16h30, fora do abrigo, uma vez por sol. / Dusk: 16:30, outside shelter, once per sol. */
  'dusk-warning': { minutesToNight: number };
  /** Opacidade do véu de poeira, 0 a 1; 0 = a tempestade começou ou acabou. / Dust veil opacity, 0 to 1; 0 = storm just began or ended. */
  'dust-storm': { opacity: number };
  'tatu-off': void;
  'tatu-on': void;
  /** Redemoinho surgiu em (x, y), em tiles; a posição de cada quadro vem de getDevil(). / Dust devil appeared at (x, y), in tiles; per-frame position comes from getDevil(). */
  'devil-spawn': { x: number; y: number };
  'devil-hit-tatu': { cleaned: boolean };
  'devil-hit-player': void;
  /** Passo em rocha pontiaguda: dano ao traje; first = a primeira vez (diálogo e guia). / Step on spiky rock: suit damage; first = first time (dialogue and guide). */
  'suit-damaged': { suit: number; first: boolean };
  /** Passo em rocha pontiaguda; first = a primeira vez (aviso do Tatu). / Step on spiky rock; first = the first time (Tatu warning). */
  'wheels-damaged': { wheels: number; first: boolean };
  /** As rodas chegaram a 40% ou menos (uma vez). / Wheels reached 40% or less (once). */
  'wheels-low': { wheels: number };
  /** Ponto de retorno: O₂ − necessário caiu abaixo de 6 pontos. Uma vez por saída. / Point of return: O₂ − needed fell under 6 points. Once per excursion. */
  'return-warning': { o2: number; need: number };
  /** O₂ ficou abaixo do necessário para voltar (conta na avaliação). / O₂ fell under what is needed to return (counts in the evaluation). */
  'return-breach': { o2: number; need: number };
  /** Começou a recarregar O₂ no abrigo; slow = recarga lenta na tempestade. / O₂ refill began at shelter; slow = slow refill in the storm. */
  'o2-refill': { slow: boolean };
  'eva-failed': { reasonKey: string };
  'guide-unlocked': { entryId: string };
  'layer-unlocked': { layer: string };
}

export interface GameStateReader {
  getHud(): HudSnapshot;
  levelOf(value: number): Level;
  on<K extends keyof GameEvents>(event: K, fn: (payload: GameEvents[K]) => void): () => void;
}
