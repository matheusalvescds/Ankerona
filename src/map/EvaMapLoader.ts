/**
 * Carrega o mapa da Cratera Gale do JSON e implementa a interface EvaMap.
 * Geração procedural baseada em dados reais da NASA:
 * - Vento dominante NW→SE (315°) forma dunas barcânicas/transversais em Bagnold
 * - Areia acumula em bacias topográficas (Yellowknife Bay, fundo da cratera)
 * - Encostas >15° (Monte Sharp) não retêm areia
 * - Sombra orográfica (lee side) cria micro-dunas atrás de rochas/encostas
 * - Cellular Automata funde "poças" isoladas em manchas contíguas
 * - TOPOGRAFIA: Dados reais NASA HiRISE DTM (via TopographyLoader)
 */
import { loadMap, getMap, inBounds } from './MapLoader';
import { hash, vn } from '../scenes/pixelArt';
import { loadTopography } from './TopographyLoader';
import { generateMineralsLayer } from './MineralGenerator';
import type { EvaMap, Point, Rect, Tile, Bedrock, Minerals } from '../scenes/eva/mapaProvisorio';

const { ground: R, rock: ROCK, cliff: CLIFF, sand: SAND, habitat: HAB, rover: ROV, sharp: SHARP } = { ground: 0, rock: 1, cliff: 2, sand: 3, habitat: 4, rover: 5, sharp: 6 } as const;
const { none: BNONE, mudstone: BMUD, strata: BSTRATA } = { none: 0, mudstone: 1, strata: 2 } as const;

// Minerals layer values (matching MapData.ts MineralsValue enum) - imported from MineralGenerator
const MIN_NONE = 0;

interface SandGenConfig {
  windDirection: { x: number; y: number };
  basinWeight: number;
  slopeWeight: number;
  leeWeight: number;
  noiseWeight: number;
  duneWavelength: number;
  rippleWavelength: number;
  threshold: number;
  caIterations: number;
  slopeCutoff: number;
}

const SAND_CONFIG: SandGenConfig = {
  windDirection: { x: -0.7071, y: 0.7071 },   // NW → SE (315°), normalizado
  basinWeight: 0.35,
  slopeWeight: 0.25,
  leeWeight: 0.20,
  noiseWeight: 0.20,
  duneWavelength: 18,       // ~300m em escala do mapa (dunas barcânicas)
  rippleWavelength: 1.5,    // Ondulações superficiais
  threshold: 0.58,          // Ajuste fino: mais alto = areia mais concentrada
  caIterations: 4,          // Cellular Automata para coalescência
  slopeCutoff: 0.18,        // ~10° em elevação normalizada
};

/** Ruído Perlin 2D determinístico via hash (para geração de areia/dunas) */
function perlin2D(x: number, y: number, seed: number): number {
  const X = Math.floor(x), Y = Math.floor(y);
  const fx = x - X, fy = y - Y;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);

  const h = (ix: number, iy: number) => {
    let n = (ix * 374761393 + iy * 668265263 + seed * 1234567) & 0x7fffffff;
    n = (n ^ (n >> 13)) * 1274126177;
    n = (n ^ (n >> 16)) & 0x7fffffff;
    return n / 0x7fffffff;
  };

  const n00 = h(X, Y);
  const n10 = h(X + 1, Y);
  const n01 = h(X, Y + 1);
  const n11 = h(X + 1, Y + 1);

  const nx0 = n00 * (1 - u) + n10 * u;
  const nx1 = n01 * (1 - u) + n11 * u;
  return nx0 * (1 - v) + nx1 * v;  // 0-1
}

/** Inclinação local (Sobel simplificado) */
function calcSlope(elev: Float32Array, x: number, y: number, MW: number, MH: number): number {
  const I = (x: number, y: number) => y * MW + x;
  const get = (x: number, y: number) => elev[I(Math.max(0, Math.min(MW - 1, x)), Math.max(0, Math.min(MH - 1, y)))];
  const dx = (get(x + 1, y) - get(x - 1, y)) * 0.5;
  const dy = (get(x, y + 1) - get(x, y - 1)) * 0.5;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Fator Lee (sombra orográfica): areia deposita a sotavento de obstáculos */
interface MapDataForLee {
  width: number;
  height: number;
  terrain: number[][];
  obstacles: number[][];
}
function calcLeeFactor(map: MapDataForLee, x: number, y: number, wind: { x: number; y: number }): number {
  const sampleDist = 3;
  const ux = Math.round(x - wind.x * sampleDist);
  const uy = Math.round(y - wind.y * sampleDist);
  if (ux < 0 || ux >= map.width || uy < 0 || uy >= map.height) return 0;
  const upwindTerrain = map.terrain[uy][ux];
  const upwindObstacle = map.obstacles[uy][ux];
  // Obstáculo upwind: encosta (2) ou rocha média/grande/pontiaguda/cratera/boxwork
  const isObstacle = upwindTerrain === 2 || upwindObstacle >= 2;
  return isObstacle ? 1 : 0;
}

/** Profundidade de bacia normalizada (0=topo, 1=fundo) */
function calcBasinFactor(elev: Float32Array, x: number, y: number, MW: number, MH: number, radius = 2): number {
  const I = (x: number, y: number) => y * MW + x;
  const e = elev[I(x, y)];
  let localMin = e, localMax = e;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < MW && ny >= 0 && ny < MH) {
        const ne = elev[I(nx, ny)];
        if (ne < localMin) localMin = ne;
        if (ne > localMax) localMax = ne;
      }
    }
  }
  return localMax > localMin ? (e - localMin) / (localMax - localMin) : 0.5;
}

/** Gera campo de areia procedural usando topografia + vento + ruído */
function generateSandField(map: any, elev: Float32Array, MW: number, MH: number, cfg: SandGenConfig): Uint8Array {
  const I = (x: number, y: number) => y * MW + x;
  const potential = new Float32Array(MW * MH);

  // Passo 1: Campo de potencial (0-1)
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      const idx = I(x, y);
      const basin = 1 - calcBasinFactor(elev, x, y, MW, MH);        // fundos = 1
      const slope = calcSlope(elev, x, y, MW, MH);
      const slopeFactor = slope < cfg.slopeCutoff ? 1 - slope / cfg.slopeCutoff : 0;
      const lee = calcLeeFactor(map, x, y, cfg.windDirection);
      const duneNoise = perlin2D(x / cfg.duneWavelength, y / cfg.duneWavelength, 7);
      const rippleNoise = perlin2D(x / cfg.rippleWavelength, y / cfg.rippleWavelength, 13) * 0.3;

      potential[idx] =
        basin * cfg.basinWeight +
        slopeFactor * cfg.slopeWeight +
        lee * cfg.leeWeight +
        (duneNoise + rippleNoise) * cfg.noiseWeight;
    }
  }

  // Passo 2: Threshold inicial
  const mask = new Uint8Array(MW * MH);
  for (let i = 0; i < MW * MH; i++) mask[i] = potential[i] > cfg.threshold ? 1 : 0;

  // Passo 3: Cellular Automata - funde manchas isoladas ("poças")
  for (let iter = 0; iter < cfg.caIterations; iter++) {
    const next = new Uint8Array(MW * MH);
    for (let y = 1; y < MH - 1; y++) {
      for (let x = 1; x < MW - 1; x++) {
        const idx = I(x, y);
        let neighbors = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) neighbors += mask[I(x + dx, y + dy)];
        // Regra B3/S23-like adaptada: mantém se 4+ vizinhos, nasce se 5+
        next[idx] = (mask[idx] && neighbors >= 4) || (!mask[idx] && neighbors >= 5) ? 1 : 0;
      }
    }
    mask.set(next);
  }

  // Passo 4: Exclusão de áreas críticas (POIs, habitat, rover, path principal)
  // Será aplicado depois no loop principal via `clear()`

  return mask;
}

/** Constrói o EvaMap a partir do JSON do mapa com geração procedural topológica. */
export async function buildEvaMap(): Promise<EvaMap> {
  await loadMap();
  const map = getMap();
  const MW = map.width, MH = map.height;
  const I = (x: number, y: number) => y * MW + x;
  const inMap = (x: number, y: number) => inBounds(x, y);

  console.log('[EvaMapLoader] Map loaded:', MW, 'x', MH, 'terrain types:', new Set(map.terrain.flat()).size, 'obstacles:', new Set(map.obstacles.flat()).size);

  // Carregar topografia real (NASA HiRISE DTM) com fallback robusto
  console.log('[EvaMapLoader] Loading topography data...');
  let topo: Awaited<ReturnType<typeof loadTopography>>;
  try {
    topo = await loadTopography();
    console.log('[EvaMapLoader] Topography loaded:', topo.meta.source);
  } catch (error) {
    console.error('[EvaMapLoader] Critical: both real and fallback topography failed:', error);
    // Emergency procedural fallback - never throw
    const { vn } = await import('../scenes/pixelArt');
    const emergencyElev = new Float32Array(MW * MH);
    for (let y = 0; y < MH; y++) {
      for (let x = 0; x < MW; x++) {
        emergencyElev[y * MW + x] = 0.5 * (x / (MW - 1)) + 0.5 * ((MH - 1 - y) / (MH - 1)) + 0.3 * (vn(x / 12, y / 12, 3) - 0.5) + 0.1 * (vn(x / 4, y / 4, 8) - 0.5);
      }
    }
    topo = {
      elevation(x: number, y: number): number {
        if (!inBounds(x, y)) return 0;
        return Math.max(0, Math.min(1, emergencyElev[y * MW + x]));
      },
      bandAt(u: number, v: number): number {
        const bx = Math.floor(u), by = Math.floor(v);
        if (!inBounds(bx, by)) return 0;
        return Math.max(0, Math.min(7, Math.floor(topo.elevation(bx, by) * 8)));
      },
      contourAt(_u: number, _v: number): boolean { return false; },
      rawElevation(_x: number, _y: number): number { return -4000; },
      meta: { source: 'Emergency procedural', datum: 'MOLA', bounds_deg: { west: 137.45, east: 138.15, south: -5.55, north: -4.85 }, size_px: [MW, MH], elevation_range_m: [-5000, -3000], pixel_scale_m: 16.0, contour_interval_m: 100, vertical_exaggeration: 2.5 }
    };
  }

  // Arrays principais
  const tile = new Uint8Array(MW * MH);
  const elev = new Float32Array(MW * MH);
  const band = new Uint8Array(MW * MH);
  const path = new Set<number>();
  const boulders: EvaMap['boulders'] = [];
  const boulderCells = new Set<number>();
  const pebbles = new Set<number>();

  // Posições fixas (do feedback)
  const habitat: Rect = { x: 9, y: 59, w: 3, h: 3 };
  const rover: Rect = { x: 60, y: 48, w: 3, h: 2 };
  const start: Point = { x: 12, y: 61 };
const pois: { id: 'ykb' | 'bag' | 'box'; x: number; y: number }[] = [
    { id: 'ykb', x: 30, y: 50 },
    { id: 'bag', x: 50, y: 34 },
    { id: 'box', x: 82, y: 12 },
  ];
  const secrets: (EvaMap['secrets'][number] & { from: Point })[] = [
    { id: 'erosion', x: 20, y: 42, from: { x: 24, y: 56 } },
    { id: 'namib', x: 42, y: 24, from: { x: 50, y: 34 } },
    { id: 'sulfur', x: 88, y: 28, from: { x: 76, y: 22 } },
  ];
  const crew: EvaMap['crew'] = [
    { id: 'commander', x: 13, y: 60 },
    { id: 'doctor', x: 9, y: 62 },
    { id: 'engineer', x: 59, y: 49 },
  ];

  // 1) ELEVAÇÃO BASE: dados reais NASA HiRISE DTM (via TopographyLoader)
  // topo.elevation(x,y) retorna 0-1 normalizado (com exagero 2.5x aplicado)
  // topo.bandAt(u,v) retorna banda 0-7 para canal B da textura
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      elev[I(x, y)] = topo.elevation(x, y);
      band[I(x, y)] = topo.bandAt(x, y);
    }
  }

  // 2) CAMPO DE AREIA PROCEDURAL (Bagnold Dunes + bacias)
  // Usa elev real para cálculo de bacias/encostas
  const sandMask = generateSandField(map, elev, MW, MH, SAND_CONFIG);

  // 3) TIPO DE TILE BASE: decisão única por tile (sem sobreposição)
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      const idx = I(x, y);
      const e = elev[idx];
      const terrainType = map.terrain[y][x];      // 0=regolith, 1=ventifact, 2=slope
      const obstacleType = map.obstacles[y][x];
      const terrenoLayer = map.layers.terreno[y][x]; // 0=firm, 1=soft sand, 2=spiky, 3=slope/rock, 4=shelter
      const isSand = sandMask[idx] === 1;

      let t: number = R;

      // Prioridade 1: Areia procedural (sobrepõe regolith/ventifact, NÃO encostas/rochas)
      if (isSand && terrainType !== 2 && terrenoLayer !== 3 && obstacleType < 2) {
        t = SAND;
      }
      // Prioridade 2: Encosta (terrain JSON ou camada terreno)
      else if (terrainType === 2 || terrenoLayer === 3) {
        t = CLIFF;
      }
      // Prioridade 3: Rochas grandes/médias do JSON
      else if (obstacleType === 3) { // rock_large (32x32 = 2x2 tiles)
        t = ROCK;
      }
      else if (obstacleType === 2) { // rock_medium (16x16 = 1 tile)
        t = ROCK;
      }
      // Prioridade 4: Rocha pontiaguda (dano ao traje)
      else if (obstacleType === 4) {
        t = SHARP;
      }
      // Prioridade 5: Terreno plano - regolith/ventifact com detalhes
      else {
        const b = band[idx];
        const edge = y + 1 < MH && band[I(x, y + 1)] < b;
        if (edge && e > 0.56) t = CLIFF;
        else if (terrainType === 1 && hash(x, y, 11) < 0.08) t = ROCK; // ventifatos → rochas ocasionais
        else if (hash(x, y, 11) < 0.04) t = ROCK;
      }

      // Borda do mapa = encosta intransponível
      if (x === 0 || y === 0 || x === MW - 1 || y === MH - 1) t = CLIFF;

      tile[idx] = t;
    }
  }

  // 4) LIMPA ÁREAS CRÍTICAS (habitat, rover, POIs, path) — remove areia/rocha/encosta
  const clear = (x: number, y: number) => {
    if (inMap(x, y) && x > 0 && y > 0 && x < MW - 1 && y < MH - 1) {
      const t = tile[I(x, y)];
      if (t === ROCK || t === CLIFF || t === SAND) tile[I(x, y)] = R;
    }
  };

  const carve = (a: Point, b: Point, s: number) => {
    let x = a.x, y = a.y, k = 0;
    clear(x, y);
    path.add(I(x, y));
    while ((x !== b.x || y !== b.y) && k < 400) {
      k++;
      const dx = b.x - x, dy = b.y - y;
      const hor = dy === 0 || (dx !== 0 && hash(x + k, y, s) < Math.abs(dx) / (Math.abs(dx) + Math.abs(dy)));
      if (hor) x += Math.sign(dx); else y += Math.sign(dy);
      clear(x, y);
      path.add(I(x, y));
    }
  };

  const way: Point[] = [
    start, { x: 24, y: 56 }, pois[0], { x: 40, y: 44 }, pois[1],
    { x: 58, y: 44 }, { x: 62, y: 46 }, { x: 68, y: 32 }, { x: 76, y: 22 }, pois[2]
  ];
  for (let i = 0; i < way.length - 1; i++) carve(way[i], way[i + 1], 40 + i);
  secrets.forEach((s, i) => carve(s.from, s, 70 + i));

  // Rochas pontiagudas no caminho do boxwork (área controlada)
  for (let y = 24; y <= 40; y++) for (let x = 62; x <= 74; x++) if (tile[I(x, y)] === R && vn(x / 3, y / 3, 31) > 0.45) tile[I(x, y)] = SHARP;

  const ring = (cx: number, cy: number, w: number, h: number, r: number) => {
    for (let y = cy - r; y < cy + h + r; y++) for (let x = cx - r; x < cx + w + r; x++) clear(x, y);
  };
  pois.forEach((p) => ring(p.x, p.y, 1, 1, 1));
  ring(habitat.x, habitat.y, habitat.w, habitat.h, 2);
  ring(rover.x, rover.y, rover.w, rover.h, 1);

  // Marca habitat e rover (sobrepõe tudo)
  for (let y = habitat.y; y < habitat.y + habitat.h; y++) for (let x = habitat.x; x < habitat.x + habitat.w; x++) tile[I(x, y)] = HAB;
  for (let y = rover.y; y < rover.y + rover.h; y++) for (let x = rover.x; x < rover.x + rover.w; x++) tile[I(x, y)] = ROV;

  // 5) ROCHAS GRANDES 2x2 (boulders) — apenas em chão limpo, longe de path/POIs
  const keep: Point[] = [start, ...pois, ...secrets, ...crew, { x: habitat.x + 1, y: habitat.y + 1 }, { x: rover.x + 1, y: rover.y }];
  for (let y = 2; y < MH - 3; y++) {
    for (let x = 2; x < MW - 3; x++) {
      if (hash(x, y, 121) >= 0.02) continue;
      const cells = [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]];
      if (!cells.every(([cx, cy]) => tile[I(cx, cy)] === R && !path.has(I(cx, cy)))) continue;
      if (keep.some((q) => Math.abs(q.x - x) < 5 && Math.abs(q.y - y) < 5)) continue;
      if (boulders.some((q) => Math.abs(q.x - x) < 3 && Math.abs(q.y - y) < 3)) continue;
      boulders.push({ x, y, kind: Math.floor(hash(x, y, 122) * 4) });
      cells.forEach(([cx, cy]) => { tile[I(cx, cy)] = ROCK; boulderCells.add(I(cx, cy)); });
    }
  }

  // 6) ENCOSTA ISOLADA → ROCHA (evita "caixas" de 1 tile)
  for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) {
    const idx = I(x, y);
    if (tile[idx] !== CLIFF) continue;
    if ([[1,0],[-1,0],[0,1],[0,-1]].every(([dx,dy]) => tile[I(x+dx,y+dy)] !== CLIFF)) tile[idx] = ROCK;
  }

  // 7) DUNAS ATIVAS ENTERRAM ROCHAS (dinâmica eólica real)
  const nearSand = (x: number, y: number) => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inMap(x+dx, y+dy) && tile[I(x+dx, y+dy)] === SAND) return true;
    return false;
  };
  for (let k = boulders.length - 1; k >= 0; k--) {
    const q = boulders[k];
    const cells = [[0,0],[1,0],[0,1],[1,1]];
    if (cells.some(([dx,dy]) => nearSand(q.x+dx, q.y+dy))) {
      cells.forEach(([dx,dy]) => { const i = I(q.x+dx, q.y+dy); tile[i] = R; boulderCells.delete(i); });
      boulders.splice(k, 1);
    }
  }
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const idx = I(x, y);
    if (tile[idx] === ROCK && !boulderCells.has(idx) && nearSand(x, y)) tile[idx] = R;
  }

  // 8) SEIXOS (decoração, andáveis)
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const idx = I(x, y);
    if (tile[idx] === ROCK && !boulderCells.has(idx) && hash(x, y, 91) < 0.4) { tile[idx] = R; pebbles.add(idx); }
  }

  // 9) ROCHA EXPOSTA (BEDROCK): Lamito (Yellowknife Bay) + Estratos (Monte Sharp)
  const bed = new Uint8Array(MW * MH), bedRock = new Uint8Array(MW * MH);
  const ykb = pois[0];
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const idx = I(x, y);
    if (tile[idx] !== R) continue;
    const dk = Math.hypot(x - ykb.x, y - ykb.y);
    const m = 0.55 * vn(x / 4, y / 4, 44) + 0.3 * vn(x / 9, y / 9, 47) + 0.6 * (1 - dk / 13);
    if (dk < 17 && m > 0.83) bed[idx] = BMUD;
    else if (0.6 * vn(x / 6, y / 6, 46) + 0.3 * vn(x / 11, y / 11, 48) + (elev[idx] - 0.8) * 2.2 > 0.62) bed[idx] = BSTRATA;
  }
  // Suaviza bordas (morphological close)
  for (const kind of [BMUD, BSTRATA]) {
    const has = (x: number, y: number) => bed[I(x, y)] === kind ? 1 : 0;
    for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) {
      const idx = I(x, y), n = has(x+1,y) + has(x-1,y) + has(x,y+1) + has(x,y-1);
      if (bed[idx] === kind && n <= 1) bed[idx] = BNONE;
      else if (bed[idx] !== kind && n >= 3 && tile[idx] === R) bed[idx] = kind;
    }
  }
  // Estratos em encosta = chão andável (geologia real: affioramento)
  for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) {
    const idx = I(x, y);
    if (tile[idx] !== CLIFF) continue;
    if ([I(x+1,y),I(x-1,y),I(x,y+1),I(x,y-1)].filter(j => bed[j] === BSTRATA).length >= 2) { tile[idx] = R; bed[idx] = BSTRATA; }
  }
  // Rochas sobre bedrock
  for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) {
    const idx = I(x, y);
    if (tile[idx] !== ROCK) continue;
    let m = 0, st = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const b = bed[I(x+dx, y+dy)];
      if (b === BMUD) m++; else if (b === BSTRATA) st++;
    }
    if (m >= 2) bedRock[idx] = BMUD; else if (st >= 2) bedRock[idx] = BSTRATA;
  }

  // 10) GERA CAMADA DE MINERAIS (geologia real: CRISM + Curiosity) - usa módulo compartilhado
  const mineralInput = {
    width: MW,
    height: MH,
    elevation: elev,
    bedrock: bed,
    bedRock: bedRock,
    tile: tile,
    pois: pois,
    ykbPosition: ykb
  };
  const mineralsLayer = generateMineralsLayer(mineralInput);

  // 11) INTERFACE EvaMap
  const tileAt = (x: number, y: number): Tile => inMap(x, y) ? (tile[I(x, y)] as Tile) : CLIFF;

  // Walkable: chão, areia, rocha pontiaguda. NÃO encosta (CLIFF), NÃO rocha média/grande, NÃO habitat/rover
  const walkable = (x: number, y: number): boolean => {
    const t = tileAt(x, y);
    return inMap(x, y) && (t === R || t === SAND || t === SHARP);
  };

  const elevation = (x: number, y: number): number => elev[I(Math.max(0, Math.min(MW-1, x)), Math.max(0, Math.min(MH-1, y)))];
  const bedrock = (x: number, y: number): Bedrock => inMap(x, y) ? (bed[I(x, y)] as Bedrock) : BNONE;
  const rockOnBedrock = (x: number, y: number): Bedrock => inMap(x, y) ? (bedRock[I(x, y)] as Bedrock) : BNONE;
  const isBoulder = (x: number, y: number): boolean => boulderCells.has(I(x, y));
  const isPebble = (x: number, y: number): boolean => pebbles.has(I(x, y));
  const onPath = (x: number, y: number): boolean => path.has(I(x, y));
  const mineralsFn = (x: number, y: number): Minerals => inMap(x, y) ? (mineralsLayer[I(x, y)] as Minerals) : MIN_NONE;

  return { width: MW, height: MH, tileAt, walkable, start, habitat, rover, pois, secrets: secrets.map(({id,x,y})=>({id,x,y})), crew, boulders, isBoulder, isPebble, onPath, elevation, bedrock, rockOnBedrock, minerals: mineralsFn };
}