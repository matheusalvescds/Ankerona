/**
 * Gera camada de minerais baseada na geologia real de Gale Crater (NASA/CRISM/Curiosity).
 * Módulo compartilhado entre EvaMapLoader e mapaProvisorio para evitar duplicação.
 */

const MIN_NONE = 0, MIN_CLAY = 1, MIN_SULFATES = 2, MIN_BOTH = 3;
const BNONE = 0, BMUD = 1, BSTRATA = 2;

/**
 * Interface para dados necessários à geração de minerais
 */
export interface MineralGenInput {
  width: number;
  height: number;
  elevation: Float32Array;
  bedrock: Uint8Array;      // BEDROCK enum values
  bedRock: Uint8Array;      // BEDROCK enum values for rocks on bedrock
  tile: Uint8Array;         // TILE enum values
  pois: { id: string; x: number; y: number }[];
  ykbPosition: { x: number; y: number };
}

/**
 * Gera camada de minerais baseada na geologia real:
 * - Yellowknife Bay: Smectite clay minerals (argilominerais) - lamito lacustrino
 * - Monte Sharp: Mg-sulfatos, Ca-sulfatos (gipsita), Fe-sulfatos - estratos superiores
 * - Zona de transição: argila + sulfatos na fronteira argila-sulfato
 */
export function generateMineralsLayer(input: MineralGenInput): Uint8Array {
  const { width: MW, height: MH, elevation, bedrock, bedRock, tile, pois, ykbPosition } = input;
  const I = (x: number, y: number) => y * MW + x;
  const minerals = new Uint8Array(MW * MH);

  const ykbRadius = 18; // ~300m raio em torno de Yellowknife Bay

  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      const idx = I(x, y);

      // Só em rocha exposta (bedrock) ou chão limpo
      if (bedrock[idx] === BNONE && bedRock[idx] === BNONE && tile[idx] !== 0) {
        minerals[idx] = MIN_NONE;
        continue;
      }

      const dk = Math.hypot(x - ykbPosition.x, y - ykbPosition.y);
      const elev = elevation[idx];

      // Clay (smectita): depósitos lacustres de Yellowknife Bay
      // Lamito (BMUD) perto de YKB = alta probabilidade de argila
      let clayScore = 0;
      if (bedrock[idx] === BMUD || bedRock[idx] === BMUD) {
        clayScore = 0.9;
      } else if (dk < ykbRadius) {
        clayScore = 0.6 * (1 - dk / ykbRadius);
      }

      // Sulfatos: estratos superiores do Monte Sharp (elevação mais alta)
      let sulfateScore = 0;
      if (bedrock[idx] === BSTRATA || bedRock[idx] === BSTRATA) {
        if (elev > 0.55) {
          sulfateScore = 0.85;
        } else if (elev > 0.4) {
          sulfateScore = 0.4;
        }
      } else if (elev > 0.65) {
        sulfateScore = 0.5;
      }

      // Zona de transição (fronteira argila-sulfato): mineralogia mista
      // Ocorre em elevações médias onde ambos processos se sobrepõem
      const geoNoise = perlin2D(x / 8, y / 8, 99) * 0.15;
      clayScore += geoNoise;
      sulfateScore -= geoNoise * 0.5; // Anti-correlacionado

      const clayThresh = 0.5;
      const sulfateThresh = 0.5;

      let mineralVal = MIN_NONE;
      if (clayScore > clayThresh && sulfateScore > sulfateThresh) {
        mineralVal = MIN_BOTH; // Zona de transição
      } else if (clayScore > clayThresh) {
        mineralVal = MIN_CLAY;
      } else if (sulfateScore > sulfateThresh) {
        mineralVal = MIN_SULFATES;
      }

      // Garante mineralogia correta nos POIs para a história
      const isYkb = pois.some(p => p.id === 'ykb' && p.x === x && p.y === y);
      if (isYkb) mineralVal = MIN_CLAY; // YKB = argila

      const isBoxwork = pois.some(p => p.id === 'box' && p.x === x && p.y === y);
      if (isBoxwork) mineralVal = MIN_SULFATES; // Boxwork = sulfatos

      minerals[idx] = mineralVal;
    }
  }

  // Cellular Automata suavização para manchas minerais contíguas (realismo geológico)
  for (let iter = 0; iter < 2; iter++) {
    const next = new Uint8Array(MW * MH);
    for (let y = 1; y < MH - 1; y++) {
      for (let x = 1; x < MW - 1; x++) {
        const idx = I(x, y);
        if (minerals[idx] === MIN_NONE) continue; // Não expande para áreas estéreis

        // Conta vizinhos do mesmo mineral
        let clayNeighbors = 0, sulfNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const n = minerals[I(x + dx, y + dy)];
            if (n === MIN_CLAY || n === MIN_BOTH) clayNeighbors++;
            if (n === MIN_SULFATES || n === MIN_BOTH) sulfNeighbors++;
          }
        }

        // Reforça mineral dominante na vizinhança
        if (clayNeighbors >= 5 && minerals[idx] !== MIN_SULFATES) {
          next[idx] = minerals[idx] === MIN_CLAY ? MIN_CLAY : MIN_BOTH;
        } else if (sulfNeighbors >= 5 && minerals[idx] !== MIN_CLAY) {
          next[idx] = minerals[idx] === MIN_SULFATES ? MIN_SULFATES : MIN_BOTH;
        } else {
          next[idx] = minerals[idx];
        }
      }
    }
    minerals.set(next);
  }

  return minerals;
}

/** Ruído Perlin 2D determinístico via hash */
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