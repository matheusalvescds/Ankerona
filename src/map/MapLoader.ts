/**
 * Carrega e consulta o JSON do mapa da Cratera Gale.
 * Loads and queries the Gale Crater map JSON.
 */
import { assetUrl } from '../ui/UiText';
import {
  MapData,
  TileInfo,
  TilePos,
  POI,
} from './MapData';

// Re-export types for convenience
export type { MapData, TileInfo, TilePos, POI } from './MapData';

let mapCache: MapData | null = null;

/** Carrega o mapa (apenas uma vez). / Loads map (once). */
export async function loadMap(): Promise<MapData> {
  if (mapCache) return mapCache;

  const response = await fetch(assetUrl('data/map.json'));
  if (!response.ok) {
    throw new Error(`Falha ao carregar mapa: ${response.status}`);
  }
  const data = await response.json() as MapData;
  mapCache = data;
  return data;
}

/** Obtém o mapa carregado (deve ter chamado loadMap antes). / Gets loaded map. */
export function getMap(): MapData {
  const map = mapCache;
  if (!map) {
    throw new Error('Mapa não carregado. Chame loadMap() primeiro.');
  }
  return map;
}

/** Verifica se posição está dentro do mapa. / Checks if position is inside map. */
export function inBounds(x: number, y: number): boolean {
  return x >= 0 && x < 96 && y >= 0 && y < 72;
}

/** Converte pixels do jogo para tiles. / Converts game pixels to tiles. */
export function pixelToTile(px: number, py: number): TilePos {
  return {
    x: Math.floor(px / 16),
    y: Math.floor(py / 16),
  };
}

/** Converte tiles para pixels do jogo (centro do tile). / Converts tiles to game pixels (tile center). */
export function tileToPixel(tx: number, ty: number): { x: number; y: number } {
  return {
    x: tx * 16 + 8,
    y: ty * 16 + 8,
  };
}

/** Obtém info completa de um tile. / Gets full tile info. */
export function getTileInfo(x: number, y: number): TileInfo | null {
  const map = getMap();
  if (!inBounds(x, y)) return null;

  const blockingObstacles = [
    2, // RockMedium
    3, // RockLarge
    4, // RockSpiky
    9, // CraterMedium
    10, // Meteorite
    11, // Boxwork
  ];
  const walkable = !blockingObstacles.includes(map.obstacles[y][x]);

  return {
    walkable,
    terrain: map.terrain[y][x],
    obstacle: map.obstacles[y][x],
    marker: map.markers[y][x],
    layers: {
      mapa: map.layers.mapa[y][x],
      topografia: map.layers.topografia[y][x],
      minerais: map.layers.minerais[y][x],
      terreno: map.layers.terreno[y][x],
    },
    pixelX: (x * 16) + 8,
    pixelY: (y * 16) + 8,
  };
}

/** Verifica se tile é transitável. / Checks if tile is walkable. */
export function isWalkable(x: number, y: number): boolean {
  const info = getTileInfo(x, y);
  return info?.walkable ?? false;
}

/** Obtém tipo de terreno do tile. / Gets tile terrain type. */
export function getTerrain(x: number, y: number): number {
  if (!inBounds(x, y)) return 0;
  return getMap().terrain[y][x];
}

/** Obtém obstáculo do tile. / Gets tile obstacle. */
export function getObstacle(x: number, y: number): number {
  if (!inBounds(x, y)) return 0;
  return getMap().obstacles[y][x];
}

/** Obtém marcador do tile. / Gets tile marker. */
export function getMarker(x: number, y: number): number {
  if (!inBounds(x, y)) return 0;
  return getMap().markers[y][x];
}

/** Obtém valor de uma camada no tile. / Gets layer value at tile. */
export function getLayer(layer: number, x: number, y: number): number {
  if (!inBounds(x, y)) return 0;

  const map = getMap();
  switch (layer) {
    case 0: // Mapa
      return map.layers.mapa[y][x];
    case 1: // Topografia
      return map.layers.topografia[y][x];
    case 2: // Minerais
      return map.layers.minerais[y][x];
    case 3: // Terreno
      return map.layers.terreno[y][x];
    default:
      return 0;
  }
}

/** Obtém POI por nome. / Gets POI by name. */
export function getPOI(name: string): POI | undefined {
  return getMap().pois[name];
}

/** Obtém todos os POIs. / Gets all POIs. */
export function getAllPOIs(): Record<string, POI> {
  return getMap().pois;
}

/** Encontra caminho simples (BFS) entre tiles. / Finds simple path (BFS) between tiles. */
export function findPath(start: TilePos, goal: TilePos): TilePos[] | null {
  if (!inBounds(start.x, start.y) || !inBounds(goal.x, goal.y)) return null;
  if (!isWalkable(start.x, start.y) || !isWalkable(goal.x, goal.y)) return null;

  const queue: TilePos[] = [start];
  const visited = new Set<string>();
  const cameFrom = new Map<string, TilePos>();
  const key = (p: TilePos) => `${p.x},${p.y}`;

  visited.add(key(start));

  const dirs = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.x === goal.x && current.y === goal.y) {
      const path: TilePos[] = [];
      let curr: TilePos | undefined = current;
      while (curr) {
        path.unshift(curr);
        curr = cameFrom.get(key(curr));
      }
      return path;
    }

    for (const dir of dirs) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;
      const nkey = `${nx},${ny}`;

      if (inBounds(nx, ny) && !visited.has(nkey) && isWalkable(nx, ny)) {
        visited.add(nkey);
        cameFrom.set(nkey, current);
        queue.push({ x: nx, y: ny });
      }
    }
  }

  return null;
}

/** Obtém tiles em um retângulo. / Gets tiles in rectangle. */
export function getTilesInRect(rect: { x: number; y: number; width: number; height: number }): TileInfo[] {
  const results: TileInfo[] = [];
  for (let y = rect.y; y < rect.y + rect.height; y++) {
    for (let x = rect.x; x < rect.x + rect.width; x++) {
      const info = getTileInfo(x, y);
      if (info) results.push(info);
    }
  }
  return results;
}

/** Obtém tiles vizinhos (4-direções). / Gets neighboring tiles (4-dir). */
export function getNeighbors(x: number, y: number): TileInfo[] {
  const neighbors: TileInfo[] = [];
  for (const dir of [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }]) {
    const info = getTileInfo(x + dir.x, y + dir.y);
    if (info) neighbors.push(info);
  }
  return neighbors;
}

/** Distância de Manhattan entre tiles. / Manhattan distance between tiles. */
export function manhattanDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/** Verifica se linha reta entre tiles é transitável (Bresenham). / Checks if line between tiles is walkable. */
export function lineOfSight(x0: number, y0: number, x1: number, y1: number): boolean {
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    if (!isWalkable(x, y)) return false;
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
    if (x === x1 && y === y1) break;
  }
  return true;
}

/** Obtém retângulo do mapa em pixels. / Gets map bounds in pixels. */
export function getMapPixelBounds(): { x: number; y: number; width: number; height: number } {
  return {
    x: 0,
    y: 0,
    width: 1536,
    height: 1152,
  };
}