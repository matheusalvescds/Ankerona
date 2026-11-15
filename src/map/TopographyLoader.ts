/**
 * Carrega e processa a topografia da Cratera Gale para a camada TOPOGRAFIA. Os dados são uma aproximação procedural
 * calibrada em elevações reais de pontos de referência (HiRISE/MOLA), não o DTM bruto da NASA.
 * Loads and processes the Gale Crater topography for the TOPOGRAPHY layer. The data is a procedural approximation
 * calibrated on real elevations of reference points (HiRISE/MOLA), not the raw NASA DTM.
 * - Carrega arquivo binário .bin (uint16 raw, 96x72) + metadata.json
 * - Converte uint16 -> float metros reais
 * - Aplica exagero vertical 2.5x em runtime
 * - Fornece elevation(x,y) normalizado 0-1, bandAt(u,v) 0-7, contourAt(u,v) boolean
 * - Fallback: elevação procedural se arquivo falhar
 */

import { assetUrl } from '../ui/UiText';
import { vn } from '../scenes/pixelArt';

// Metadados esperados do topography-meta.json
interface TopographyMeta {
  source: string;
  datum: string;
  bounds_deg: { west: number; east: number; south: number; north: number };
  size_px: [number, number];
  elevation_range_m: [number, number];
  pixel_scale_m: number;
  contour_interval_m: number;
  vertical_exaggeration: number;
}

// Interface pública do loader
export interface TopographyData {
  /** Elevação normalizada 0-1 para o shader (já com exagero aplicado) */
  elevation(x: number, y: number): number;
  /** Banda interna 0-7 para o canal B da textura (já com exagero) */
  bandAt(u: number, v: number): number;
  /** True se cruza curva de nível de 100m (após exagero) */
  contourAt(u: number, v: number): boolean;
  /** Elevação real em metros (sem exagero) */
  rawElevation(x: number, y: number): number;
  /** Metadados carregados */
  meta: TopographyMeta;
}

// Cache singleton
let topographyCache: TopographyData | null = null;
let loadPromise: Promise<TopographyData> | null = null;

// Constantes do mapa
const MAP_WIDTH = 96;
const MAP_HEIGHT = 72;
const MAP_SIZE = MAP_WIDTH * MAP_HEIGHT;
const I = (x: number, y: number) => y * MAP_WIDTH + x;
const inBounds = (x: number, y: number) => x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT;

/**
 * Elevação procedural fallback (mesma lógica do EvaMapLoader original)
 */
function proceduralElevation(x: number, y: number): number {
  const MW = MAP_WIDTH, MH = MAP_HEIGHT;
  return 0.5 * (x / (MW - 1)) + 0.5 * ((MH - 1 - y) / (MH - 1)) + 0.3 * (vn(x / 12, y / 12, 3) - 0.5) + 0.1 * (vn(x / 4, y / 4, 8) - 0.5);
}

/**
 * Cria implementação fallback usando elevação procedural
 */
function createFallbackTopography(meta: TopographyMeta): TopographyData {
  const [elevMin, elevMax] = meta.elevation_range_m;
  const elevRange = elevMax - elevMin;

  // Cache de elevações procedurais
  const elevCache = new Float32Array(MAP_SIZE);
  const bandCache = new Uint8Array(MAP_SIZE);
  const contourCache = new Uint8Array(MAP_SIZE);

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const e = proceduralElevation(x, y);
      elevCache[I(x, y)] = Math.max(0, Math.min(1, e));
      bandCache[I(x, y)] = Math.max(0, Math.min(7, Math.floor(e * 8)));
    }
  }

  // Calcular curvas de nível no cache procedural
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const b0 = bandCache[I(x, y)];
      const b1 = x + 1 < MAP_WIDTH ? bandCache[I(x + 1, y)] : b0;
      const b2 = y + 1 < MAP_HEIGHT ? bandCache[I(x, y + 1)] : b0;
      contourCache[I(x, y)] = (b0 !== b1 || b0 !== b2) ? 1 : 0;
    }
  }

  return {
    elevation(x: number, y: number): number {
      if (!inBounds(x, y)) return 0;
      return elevCache[I(x, y)];
    },
    bandAt(u: number, v: number): number {
      const x = Math.floor(u), y = Math.floor(v);
      if (!inBounds(x, y)) return 0;
      return bandCache[I(x, y)];
    },
    contourAt(u: number, v: number): boolean {
      const x = Math.floor(u), y = Math.floor(v);
      if (!inBounds(x, y)) return false;
      return contourCache[I(x, y)] === 1;
    },
    rawElevation(x: number, y: number): number {
      if (!inBounds(x, y)) return elevMin;
      return elevCache[I(x, y)] * elevRange + elevMin;
    },
    meta
  };
}

/**
 * Carrega arquivo binário .bin (uint16 raw) e metadata, retorna TopographyData
 */
export async function loadTopography(): Promise<TopographyData> {
  // Retornar cache se já carregado
  if (topographyCache) return topographyCache;

  // Retornar promise existente se já está carregando
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      console.log('[TopographyLoader] Carregando topography-meta.json...');
      const metaResponse = await fetch(assetUrl('data/topography-meta.json'));
      if (!metaResponse.ok) throw new Error(`Meta HTTP ${metaResponse.status}`);
      const meta: TopographyMeta = await metaResponse.json();

      console.log('[TopographyLoader] Carregando topography.bin...');
      const binResponse = await fetch(assetUrl('data/topography.bin'));
      if (!binResponse.ok) throw new Error(`BIN HTTP ${binResponse.status}`);
      const arrayBuffer = await binResponse.arrayBuffer();

      if (arrayBuffer.byteLength !== MAP_SIZE * 2) {
        throw new Error(`Tamanho inválido: ${arrayBuffer.byteLength} bytes, esperado ${MAP_SIZE * 2}`);
      }

      // Ler uint16 little-endian explicitamente (DataView garante endianness correta em qualquer plataforma)
      const dataView = new DataView(arrayBuffer);
      const uint16Data = new Uint16Array(MAP_SIZE);
      for (let i = 0; i < MAP_SIZE; i++) {
        uint16Data[i] = dataView.getUint16(i * 2, true); // true = little-endian
      }
      console.log('[TopographyLoader] Dados binários carregados:', uint16Data.length, 'valores');

      // Converter uint16 -> metros reais
      // Valor 0 = -5000m, 65535 = -3000m (linear)
      const [elevMin, elevMax] = meta.elevation_range_m;
      const elevRange = elevMax - elevMin; // 2000m

      // O .bin guarda a primeira linha no SUL (origem SO, como em generate_topography.py), mas o grid do jogo
      // tem y=0 no NORTE (topo da tela). Por isso a linha é invertida ao ler.
      // The .bin stores its first row at the SOUTH (SW origin, as in generate_topography.py), but the game grid
      // has y=0 at the NORTH (top of the screen). That is why the row is flipped when reading.
      const elevMeters = new Float32Array(MAP_SIZE);
      for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
          const normalized = uint16Data[(MAP_HEIGHT - 1 - y) * MAP_WIDTH + x] / 65535.0;
          elevMeters[I(x, y)] = normalized * elevRange + elevMin;
        }
      }

      // Aplicar exagero vertical 2.5x
      const exaggeration = meta.vertical_exaggeration;

      // Calcular média real dos dados para centrar o exagero (evita hardcoded -4100)
      let sumElev = 0;
      for (let i = 0; i < MAP_SIZE; i++) sumElev += elevMeters[i];
      const meanElev = sumElev / MAP_SIZE;

      const exaggeratedElev = new Float32Array(MAP_SIZE);
      const normalizedElev = new Float32Array(MAP_SIZE);
      const bandCache = new Uint8Array(MAP_SIZE);
      const contourCache = new Uint8Array(MAP_SIZE);

      // elevMeters já está com y=0 no norte (ver a inversão acima). / elevMeters already has y=0 at the north (see the flip above).
      for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
          const idx = I(x, y);
          const elevM = elevMeters[idx];

          // Aplicar exagero vertical centrado na média real dos dados
          const exaggerated = meanElev + (elevM - meanElev) * exaggeration;
          const clamped = Math.max(elevMin, Math.min(elevMax, exaggerated));

          // Normalizar para 0-1
          const norm = (clamped - elevMin) / elevRange;
          exaggeratedElev[idx] = clamped;
          normalizedElev[idx] = Math.max(0, Math.min(1, norm));

          // Banda 0-7 (8 bandas internas para o shader)
          bandCache[idx] = Math.max(0, Math.min(7, Math.floor(norm * 8)));
        }
      }

      // Calcular curvas de nível (mudança de banda entre pixels adjacentes)
      for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
          const idx = I(x, y);
          const b0 = bandCache[idx];
          const b1 = x + 1 < MAP_WIDTH ? bandCache[I(x + 1, y)] : b0;
          const b2 = y + 1 < MAP_HEIGHT ? bandCache[I(x, y + 1)] : b0;
          contourCache[idx] = (b0 !== b1 || b0 !== b2) ? 1 : 0;
        }
      }

      topographyCache = {
        elevation(x: number, y: number): number {
          if (!inBounds(x, y)) return 0;
          return normalizedElev[I(x, y)];
        },
        bandAt(u: number, v: number): number {
          const x = Math.floor(u), y = Math.floor(v);
          if (!inBounds(x, y)) return 0;
          return bandCache[I(x, y)];
        },
        contourAt(u: number, v: number): boolean {
          const x = Math.floor(u), y = Math.floor(v);
          if (!inBounds(x, y)) return false;
          return contourCache[I(x, y)] === 1;
        },
        rawElevation(x: number, y: number): number {
          if (!inBounds(x, y)) return elevMin;
          return exaggeratedElev[I(x, y)];
        },
        meta
      };

      console.log('[TopographyLoader] Topografia carregada e processada com sucesso');
      return topographyCache;

    } catch (error) {
      console.warn('[TopographyLoader] Falha ao carregar dados reais, usando fallback procedural:', error);
      // Fallback procedural
      const fallbackMeta: TopographyMeta = {
        source: "Procedural fallback (vn + slope NE)",
        datum: "MOLA areoid",
        bounds_deg: { west: 137.45, east: 138.15, south: -5.55, north: -4.85 },
        size_px: [MAP_WIDTH, MAP_HEIGHT],
        elevation_range_m: [-5000, -3000],
        pixel_scale_m: 16.0,
        contour_interval_m: 100,
        vertical_exaggeration: 2.5
      };
      topographyCache = createFallbackTopography(fallbackMeta);
      return topographyCache;
    }
  })();

  return loadPromise;
}

// Exportar função para pré-carregar (chamar na BootScene)
export function preloadTopography(): Promise<TopographyData> {
  return loadTopography();
}

// Limpar cache (útil para testes)
export function clearTopographyCache(): void {
  topographyCache = null;
  loadPromise = null;
}