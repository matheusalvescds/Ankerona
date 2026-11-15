/**
 * MAPA PROVISÓRIO da EVA, gerado no código como no protótipo (96 x 72 tiles).
 * TEMPORARY EVA map, generated in code as in the prototype (96 x 72 tiles).
 *
 * O mapa real é do Arthur (src/map/), feito a partir do JSON do terreno do Aylton (data/).
 * Quando ele existir, basta entregar um objeto com a mesma interface EvaMap: a cena não muda.
 * The real map belongs to Arthur (src/map/), built from Aylton's terrain JSON (data/).
 * Once it exists, just hand over an object with the same EvaMap interface: the scene stays the same.
 */
import { hash, vn } from '../pixelArt';
import { generateMineralsLayer, type MineralGenInput } from '../../map/MineralGenerator';

/** Tipos de tile do protótipo. / Prototype tile types. */
export const TILE = { ground: 0, rock: 1, cliff: 2, sand: 3, habitat: 4, rover: 5, sharp: 6 } as const;
export type Tile = (typeof TILE)[keyof typeof TILE];

export interface Point {
  x: number;
  y: number;
}
export interface Rect extends Point {
  w: number;
  h: number;
}

/**
 * Rocha exposta no chão (do protótipo): lamito de Yellowknife Bay e estratos do Monte Sharp.
 * Exposed bedrock (from the prototype): Yellowknife Bay mudstone and Mount Sharp strata.
 */
export const BEDROCK = { none: 0, mudstone: 1, strata: 2 } as const;
export type Bedrock = (typeof BEDROCK)[keyof typeof BEDROCK];

export type PoiId = 'ykb' | 'bag' | 'box';
export type SecretId = 'erosion' | 'namib' | 'sulfur';
export type CrewId = 'commander' | 'doctor' | 'engineer';

/** Valores da camada de minerais. / Minerals layer values. */
export const MINERALS = { none: 0, clay: 1, sulfates: 2, both: 3 } as const;
export type Minerals = (typeof MINERALS)[keyof typeof MINERALS];

/** O que a cena da EVA precisa saber do mapa (a combinar com o Arthur). / What the EVA scene needs from the map (to agree with Arthur). */
export interface EvaMap {
  width: number;
  height: number;
  tileAt(x: number, y: number): Tile;
  walkable(x: number, y: number): boolean;
  start: Point;
  habitat: Rect;
  rover: Rect;
  pois: { id: PoiId; x: number; y: number }[];
  secrets: { id: SecretId; x: number; y: number }[];
  crew: { id: CrewId; x: number; y: number }[];
  /** Rochas grandes (2x2 tiles); x, y = canto de cima à esquerda. / Big boulders (2x2); x, y = top-left. */
  boulders: { x: number; y: number; kind: number }[];
  isBoulder(x: number, y: number): boolean;
  /** Seixos soltos, só decoração. / Loose pebbles, decoration only. */
  isPebble(x: number, y: number): boolean;
  /** Rota principal (desenha rastros de roda). / Main route (draws wheel tracks). */
  onPath(x: number, y: number): boolean;
  /** Altitude de 0 a 1, sobe para o Monte Sharp. / Elevation 0 to 1, rising toward Mount Sharp. */
  elevation(x: number, y: number): number;
  /** Rocha exposta no chão deste tile. / Exposed bedrock on this tile. */
  bedrock(x: number, y: number): Bedrock;
  /** Rocha solta que fica em cima da rocha exposta (desenhada junto com ela). / Loose rock sitting on the bedrock (drawn with it). */
  rockOnBedrock(x: number, y: number): Bedrock;
  /** Minerais neste tile (0=none, 1=clay, 2=sulfates, 3=both). / Minerals at this tile. */
  minerals(x: number, y: number): Minerals;
}

const MW = 96, MH = 72;

export function buildTempMap(): EvaMap {
  const tile = new Uint8Array(MW * MH);
  const elev = new Float32Array(MW * MH);
  const band = new Uint8Array(MW * MH);
  const I = (x: number, y: number) => y * MW + x;
  const inMap = (x: number, y: number) => x >= 0 && y >= 0 && x < MW && y < MH;

  const habitat: Rect = { x: 9, y: 59, w: 3, h: 3 };
  const rover: Rect = { x: 60, y: 48, w: 3, h: 2 };
  const start: Point = { x: 12, y: 61 };
  const pois: EvaMap['pois'] = [
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
    // Perto da saída como a comandante, mas fora da porta do habitat, para conversar com ele não fazer a Ana entrar.
    // O ponto de limpeza do traje fica do lado dele.
    // Near the exit like the commander, but off the habitat door, so talking to him doesn't send Ana inside.
    // The suit cleaning point sits next to him.
    { id: 'doctor', x: 13, y: 63 },
    { id: 'engineer', x: 59, y: 49 },
  ];
  const path = new Set<number>();
  const boulders: EvaMap['boulders'] = [];
  const boulderCells = new Set<number>();
  const pebbles = new Set<number>();
  const { ground: R, rock: ROCK, cliff: CLIFF, sand: SAND, habitat: HAB, rover: ROV, sharp: SHARP } = TILE;

  // Elevação sobe para o Monte Sharp (nordeste). / Elevation rises toward Mount Sharp (north-east).
  for (let y = 0; y < MH; y++)
    for (let x = 0; x < MW; x++) {
      const e = 0.5 * (x / (MW - 1)) + 0.5 * ((MH - 1 - y) / (MH - 1)) + 0.3 * (vn(x / 12, y / 12, 3) - 0.5) + 0.1 * (vn(x / 4, y / 4, 8) - 0.5);
      elev[I(x, y)] = e;
      band[I(x, y)] = Math.max(0, Math.min(7, Math.floor(e * 8)));
    }
  for (let y = 0; y < MH; y++)
    for (let x = 0; x < MW; x++) {
      let t: number = R;
      const e = elev[I(x, y)];
      const sx = 50 + (vn(x / 8, y / 8, 5) - 0.5) * 12;
      if (y >= 20 && y <= 50 && Math.abs(x - sx) < 7 && vn(x / 5, y / 5, 9) > 0.26) t = SAND;
      if (t === R) {
        const b = band[I(x, y)];
        const edge = y + 1 < MH && band[I(x, y + 1)] < b;
        if (edge && e > 0.56) t = CLIFF;
        else if (hash(x, y, 11) < 0.06) t = ROCK;
      }
      if (x === 0 || y === 0 || x === MW - 1 || y === MH - 1) t = CLIFF;
      tile[I(x, y)] = t;
    }

  const clear = (x: number, y: number) => {
    if (inMap(x, y) && x > 0 && y > 0 && x < MW - 1 && y < MH - 1) {
      const t = tile[I(x, y)];
      if (t === ROCK || t === CLIFF) tile[I(x, y)] = R;
    }
  };
  // Abre a rota entre os pontos, sempre transitável. / Carves the route between points, always walkable.
  const carve = (a: Point, b: Point, s: number) => {
    let x = a.x, y = a.y, k = 0;
    clear(x, y);
    path.add(I(x, y));
    while ((x !== b.x || y !== b.y) && k < 400) {
      k++;
      const dx = b.x - x, dy = b.y - y;
      const hor = dy === 0 || (dx !== 0 && hash(x + k, y, s) < Math.abs(dx) / (Math.abs(dx) + Math.abs(dy)));
      if (hor) x += Math.sign(dx);
      else y += Math.sign(dy);
      clear(x, y);
      path.add(I(x, y));
    }
  };
  const way: Point[] = [start, { x: 24, y: 56 }, pois[0], { x: 40, y: 44 }, pois[1], { x: 58, y: 44 }, { x: 62, y: 46 }, { x: 68, y: 32 }, { x: 76, y: 22 }, pois[2]];
  for (let i = 0; i < way.length - 1; i++) carve(way[i], way[i + 1], 40 + i);
  secrets.forEach((s, i) => carve(s.from, s, 70 + i));
  // Rochas pontiagudas no caminho do boxwork. / Sharp rocks on the way to the boxwork.
  for (let y = 24; y <= 40; y++) for (let x = 62; x <= 74; x++) if (tile[I(x, y)] === R && vn(x / 3, y / 3, 31) > 0.45) tile[I(x, y)] = SHARP;
  const ring = (cx: number, cy: number, w: number, h: number, r: number) => {
    for (let y = cy - r; y < cy + h + r; y++) for (let x = cx - r; x < cx + w + r; x++) clear(x, y);
  };
  pois.forEach((p) => ring(p.x, p.y, 1, 1, 1));
  ring(habitat.x, habitat.y, habitat.w, habitat.h, 2);
  ring(rover.x, rover.y, rover.w, rover.h, 1);
  for (let y = habitat.y; y < habitat.y + habitat.h; y++) for (let x = habitat.x; x < habitat.x + habitat.w; x++) tile[I(x, y)] = HAB;
  for (let y = rover.y; y < rover.y + rover.h; y++) for (let x = rover.x; x < rover.x + rover.w; x++) tile[I(x, y)] = ROV;

  // Rochas grandes 2x2, longe da rota e dos pontos importantes. / 2x2 boulders, away from the route and key spots.
  const keep: Point[] = [start, ...pois, ...secrets, ...crew, { x: habitat.x + 1, y: habitat.y + 1 }, { x: rover.x + 1, y: rover.y }];
  for (let y = 2; y < MH - 3; y++)
    for (let x = 2; x < MW - 3; x++) {
      if (hash(x, y, 121) >= 0.02) continue;
      const cells = [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]];
      if (!cells.every(([cx, cy]) => tile[I(cx, cy)] === R && !path.has(I(cx, cy)))) continue;
      if (keep.some((q) => Math.abs(q.x - x) < 5 && Math.abs(q.y - y) < 5)) continue;
      if (boulders.some((q) => Math.abs(q.x - x) < 3 && Math.abs(q.y - y) < 3)) continue;
      boulders.push({ x, y, kind: Math.floor(hash(x, y, 122) * 4) });
      cells.forEach(([cx, cy]) => {
        tile[I(cx, cy)] = ROCK;
        boulderCells.add(I(cx, cy));
      });
    }
  // Encosta de um tile só parece uma caixa: vira rocha. / A lone cliff tile looks like a box: make it a rock.
  for (let y = 1; y < MH - 1; y++)
    for (let x = 1; x < MW - 1; x++) {
      const i = I(x, y);
      if (tile[i] !== CLIFF) continue;
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => tile[I(x + dx, y + dy)] !== CLIFF)) tile[i] = ROCK;
    }
  // Dunas ativas enterram as rochas. / Active dunes bury the rocks.
  const nearSand = (x: number, y: number) => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inMap(x + dx, y + dy) && tile[I(x + dx, y + dy)] === SAND) return true;
    return false;
  };
  for (let k = boulders.length - 1; k >= 0; k--) {
    const q = boulders[k];
    const cells = [[0, 0], [1, 0], [0, 1], [1, 1]];
    if (cells.some(([dx, dy]) => nearSand(q.x + dx, q.y + dy))) {
      cells.forEach(([dx, dy]) => {
        const i = I(q.x + dx, q.y + dy);
        tile[i] = R;
        boulderCells.delete(i);
      });
      boulders.splice(k, 1);
    }
  }
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const i = I(x, y);
    if (tile[i] === ROCK && !boulderCells.has(i) && nearSand(x, y)) tile[i] = R;
  }
  // Pedras pequenas são só decoração: dá para pisar. / Small rocks are decoration: you can step on them.
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const i = I(x, y);
    if (tile[i] === ROCK && !boulderCells.has(i) && hash(x, y, 91) < 0.4) {
      tile[i] = R;
      pebbles.add(i);
    }
  }

  // Áreas de rocha exposta, como regions() do protótipo. / Bedrock areas, like the prototype's regions().
  const bed = new Uint8Array(MW * MH), bedRock = new Uint8Array(MW * MH);
  const ykb = pois[0];
  for (let y = 0; y < MH; y++)
    for (let x = 0; x < MW; x++) {
      const i = I(x, y);
      if (tile[i] !== R) continue;
      const dk = Math.hypot(x - ykb.x, y - ykb.y);
      const m = 0.55 * vn(x / 4, y / 4, 44) + 0.3 * vn(x / 9, y / 9, 47) + 0.6 * (1 - dk / 13);
      if (dk < 17 && m > 0.83) bed[i] = BEDROCK.mudstone;
      else if (0.6 * vn(x / 6, y / 6, 46) + 0.3 * vn(x / 11, y / 11, 48) + (elev[i] - 0.8) * 2.2 > 0.62) bed[i] = BEDROCK.strata;
    }
  // Tira tiles soltos para a borda ficar lisa. / Drops stray tiles so the outline stays smooth.
  for (const kind of [BEDROCK.mudstone, BEDROCK.strata]) {
    const has = (x: number, y: number) => (bed[I(x, y)] === kind ? 1 : 0);
    for (let y = 1; y < MH - 1; y++)
      for (let x = 1; x < MW - 1; x++) {
        const i = I(x, y), n = has(x + 1, y) + has(x - 1, y) + has(x, y + 1) + has(x, y - 1);
        if (bed[i] === kind && n <= 1) bed[i] = BEDROCK.none;
        else if (bed[i] !== kind && n >= 3 && tile[i] === R) bed[i] = kind;
      }
  }
  // Os estratos são a própria encosta da montanha: sem paredes soltas dentro deles (vira chão andável).
  // The strata are the mountain's own outcrops: no separate cliff walls inside them (it becomes walkable ground).
  for (let y = 1; y < MH - 1; y++)
    for (let x = 1; x < MW - 1; x++) {
      const i = I(x, y);
      if (tile[i] !== CLIFF) continue;
      if ([I(x + 1, y), I(x - 1, y), I(x, y + 1), I(x, y - 1)].filter((j) => bed[j] === BEDROCK.strata).length >= 2) {
        tile[i] = R;
        bed[i] = BEDROCK.strata;
      }
    }
  for (let y = 1; y < MH - 1; y++)
    for (let x = 1; x < MW - 1; x++) {
      const i = I(x, y);
      if (tile[i] !== ROCK) continue;
      let m = 0, st = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const b = bed[I(x + dx, y + dy)];
          if (b === BEDROCK.mudstone) m++;
          if (b === BEDROCK.strata) st++;
        }
      if (m >= 2) bedRock[i] = BEDROCK.mudstone;
      else if (st >= 2) bedRock[i] = BEDROCK.strata;
    }

  const tileAt = (x: number, y: number): Tile => (inMap(x, y) ? (tile[I(x, y)] as Tile) : CLIFF);

  // Gera camada de minerais usando módulo compartilhado (deduplicado com EvaMapLoader)
  const mineralInput: MineralGenInput = {
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

  const mineralsFn = (x: number, y: number): Minerals =>
    inMap(x, y) ? (mineralsLayer[I(x, y)] as Minerals) : MINERALS.none;

  return {
    width: MW,
    height: MH,
    tileAt,
    walkable: (x, y) => {
      const t = tileAt(x, y);
      return inMap(x, y) && (t === R || t === SAND || t === SHARP);
    },
    start,
    habitat,
    rover,
    pois,
    secrets: secrets.map(({ id, x, y }) => ({ id, x, y })),
    crew,
    boulders,
    isBoulder: (x, y) => boulderCells.has(I(x, y)),
    isPebble: (x, y) => pebbles.has(I(x, y)),
    onPath: (x, y) => path.has(I(x, y)),
    elevation: (x, y) => elev[I(Math.max(0, Math.min(MW - 1, x)), Math.max(0, Math.min(MH - 1, y)))],
    bedrock: (x, y) => (inMap(x, y) ? (bed[I(x, y)] as Bedrock) : BEDROCK.none),
    rockOnBedrock: (x, y) => (inMap(x, y) ? (bedRock[I(x, y)] as Bedrock) : BEDROCK.none),
    minerals: mineralsFn,
  };
}
