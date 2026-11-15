/**
 * Tipos e constantes do mapa da Cratera Gale.
 * Map data types and constants for Gale Crater.
 */
import { TILE_SIZE } from '../config';

/** Dimensões do mapa em tiles. / Map dimensions in tiles. */
export const MAP_WIDTH = 96;
export const MAP_HEIGHT = 72;

/** Tamanho do tile em pixels do jogo. / Tile size in game pixels. */
export const MAP_TILE_SIZE = TILE_SIZE; // 16

/** Largura/altura do mapa em pixels do jogo. / Map width/height in game pixels. */
export const MAP_PIXEL_WIDTH = MAP_WIDTH * MAP_TILE_SIZE;  // 1536
export const MAP_PIXEL_HEIGHT = MAP_HEIGHT * MAP_TILE_SIZE; // 1152

/** Tipos de terreno base. / Base terrain types. */
export enum TerrainType {
  Regolith = 0,   // regolito plano / flat regolith
  Ventifact = 1,  // chão com ventifatos / ground with ventifacts
  Slope = 2,      // encosta / slope
}

/** Tipos de obstáculos. / Obstacle types. */
export enum ObstacleType {
  None = 0,
  RockSmall = 1,      // rocha_pequena 10x8
  RockMedium = 2,     // rochas_medias 16x16 (bloqueiam 1 tile)
  RockLarge = 3,      // rochas_grandes 32x32 (bloqueiam 2x2 tiles)
  RockSpiky = 4,      // rocha_pontiaguda 16x12 (dano ao traje)
  Ventifact = 5,      // ventifatos 16x8
  Pebble = 6,         // seixos 12x8
  PebbleGroup = 7,    // seixos_grupos 14x10
  CraterSmall = 8,    // cratera_pequena 12x10
  CraterMedium = 9,   // cratera_media 16x14
  Meteorite = 10,     // meteorito 12x9
  Boxwork = 11,       // boxwork 32x28
  Sulfur = 12,        // cristais_de_enxofre 16x14
  WheelTracks = 13,   // rastros_de_roda 16x16
}

/** Tipos de marcadores. / Marker types. */
export enum MarkerType {
  None = 0,
  Beacon = 1,           // baliza
  BeaconVisited = 2,    // tripe_ponto_visitado
  Shelter = 3,          // marcador_abrigo
  Radiation = 4,        // alerta_radiacao
  SensorHit = 5,        // acertos_no_sensor
}

/** Camadas de dados do Guia. / Guide data layers. */
export enum LayerType {
  Mapa = 0,         // MAPA - vista normal
  Topografia = 1,   // TOPOGRAFIA - elevação
  Minerais = 2,     // MINERAIS - argila/sulfatos
  Terreno = 3,      // TERRENO - risco/abrigo
}

/** Valores da camada Topografia. / Topography layer values. */
export enum TopographyValue {
  Low = 0,        // mais baixo / lowest
  Medium = 1,     // médio / middle
  High = 2,       // mais alto / highest
  Contour = 3,    // curva de nível / contour line
}

/** Valores da camada Minerais. / Minerals layer values. */
export enum MineralsValue {
  None = 0,
  Clay = 1,       // argilominerais / clay minerals
  Sulfates = 2,   // sulfatos / sulfates
  Both = 3,       // ambos / both
}

/** Valores da camada Terreno. / Terrain layer values. */
export enum TerrainLayerValue {
  FirmRegolith = 0,      // regolito firme / firm regolith
  SoftSand = 1,          // areia fofa / soft sand
  SpikyRocks = 2,        // rochas pontiagudas / spiky rocks
  SlopeOrRock = 3,       // encosta ou rocha / slope or rock
  Shelter = 4,           // abrigo / shelter
}

/** Ponto de interesse (POI). / Point of interest. */
export interface POI {
  x: number;
  y: number;
  name: string;
  desc: string;
}

/** Estrutura completa do mapa. / Complete map structure. */
export interface MapData {
  version: string;
  seed: number;
  width: number;
  height: number;
  tileSize: number;
  terrain: number[][];        // TerrainType[][]
  obstacles: number[][];      // ObstacleType[][]
  markers: number[][];        // MarkerType[][]
  layers: {
    mapa: number[][];         // 0=livre, 1=bloqueado
    topografia: number[][];   // TopographyValue[][]
    minerais: number[][];     // MineralsValue[][]
    terreno: number[][];      // TerrainLayerValue[][]
  };
  pois: Record<string, POI>;
  terrainTypes: Record<string, number>;
  obstacleTypes: Record<string, number>;
  markerTypes: Record<string, number>;
  layerTypes: Record<string, number>;
}

/** Resultado de verificação de tile. / Tile check result. */
export interface TileInfo {
  walkable: boolean;
  terrain: TerrainType;
  obstacle: ObstacleType;
  marker: MarkerType;
  layers: {
    mapa: number;
    topografia: TopographyValue;
    minerais: MineralsValue;
    terreno: TerrainLayerValue;
  };
  pixelX: number;
  pixelY: number;
}

/** Posição no mapa em tiles. / Position in map tiles. */
export interface TilePos {
  x: number;
  y: number;
}

/** Retângulo no mapa (em tiles). / Rectangle in map (tiles). */
export interface MapRect {
  x: number;
  y: number;
  width: number;
  height: number;
}