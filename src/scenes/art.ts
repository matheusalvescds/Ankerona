/**
 * Lista da arte do Matheus usada pelas cenas, com o tamanho de quadro de cada tira.
 * Os tamanhos vêm do LEIAME do pacote (public/assets/sprites/LEIAME.md).
 * List of Matheus's art used by the scenes, with each strip's frame size.
 * Sizes come from the pack's LEIAME (public/assets/sprites/LEIAME.md).
 *
 * A BootScene carrega tudo uma vez; as cenas usam só as chaves (ART.xxx).
 * BootScene loads everything once; scenes use only the keys (ART.xxx).
 */
import * as Phaser from 'phaser';
import { assetUrl } from '../ui/UiText';

const S = 'assets/sprites/';

/** Imagens inteiras. / Whole images. */
const IMAGES = {
  bgTitle: '09_Cenas/titulo.png',
  bgSpace: '09_Cenas/viagem_espaco.png',
  bgMoon: '09_Cenas/teaser_lua.png',
  bgEnd: '09_Cenas/epilogo_por_do_sol.png',
  edlGround: '09_Cenas/pouso_chao_gale.png',
  marsHorizon: '09_Cenas/marte_horizonte.png',
  mars: '09_Cenas/marte.png',
  earth: '09_Cenas/terra.png',
  moonSmall: '09_Cenas/lua_pequena.png',
  moonLarge: '09_Cenas/lua_grande.png',
  habitat: '03_Veiculos/habitat.png',
  boxwork: '04_Rochas_e_decoracao/boxwork.png',
  rockSharp: '04_Rochas_e_decoracao/rocha_pontiaguda.png',
  rockSmall: '04_Rochas_e_decoracao/rocha_pequena.png',
  rockOld: '04_Rochas_e_decoracao/rocha_media_antiga.png',
  craterSmall: '04_Rochas_e_decoracao/cratera_pequena.png',
  craterMid: '04_Rochas_e_decoracao/cratera_media.png',
  meteor: '04_Rochas_e_decoracao/meteorito.png',
  vein: '04_Rochas_e_decoracao/pedra_com_veios.png',
  tracks: '04_Rochas_e_decoracao/rastros_de_roda.png',
  tripod: '06_Marcadores/tripe_ponto_visitado.png',
  tripod2x: '06_Marcadores/tripe_ponto_visitado_2x.png',
  habitat2x: '03_Veiculos/habitat_2x.png',
  sulfur: '04_Rochas_e_decoracao/cristais_de_enxofre.png',
  portraitAna: '01_Personagens/retratos/retrato_ana_selari.png',
  portraitKeli: '01_Personagens/retratos/retrato_keli_hastor.png',
  portraitNatan: '01_Personagens/retratos/retrato_natan_jonas.png',
  portraitRossi: '01_Personagens/retratos/retrato_rossi_brook.png',
} as const;

/** Tiras horizontais: [arquivo, largura, altura do quadro]. / Horizontal strips: [file, frame width, frame height]. */
const SHEETS = {
  anaDown: ['01_Personagens/ana_selari/ana_frente.png', 16, 24],
  anaUp: ['01_Personagens/ana_selari/ana_costas.png', 16, 24],
  anaLeft: ['01_Personagens/ana_selari/ana_esquerda.png', 16, 24],
  anaRight: ['01_Personagens/ana_selari/ana_direita.png', 16, 24],
  keli: ['01_Personagens/tripulacao/keli_hastor.png', 20, 24],
  natan: ['01_Personagens/tripulacao/natan_jonas.png', 20, 24],
  rossi: ['01_Personagens/tripulacao/rossi_brook.png', 20, 24],
  tatuDown: ['02_Tatu/tatu_frente.png', 20, 18],
  tatuUp: ['02_Tatu/tatu_costas.png', 20, 18],
  tatuSide: ['02_Tatu/tatu_lado.png', 20, 18],
  rover: ['03_Veiculos/rover_pressurizado.png', 48, 32],
  rocksMid: ['04_Rochas_e_decoracao/rochas_medias.png', 16, 16],
  rocksBig: ['04_Rochas_e_decoracao/rochas_grandes.png', 32, 32],
  ventifacts: ['04_Rochas_e_decoracao/ventifatos.png', 16, 8],
  pebbles: ['04_Rochas_e_decoracao/seixos.png', 12, 8],
  pebbleGroups: ['04_Rochas_e_decoracao/seixos_grupos.png', 14, 10],
  regolith: ['05_Terreno/regolito.png', 16, 16],
  ventGround: ['05_Terreno/chao_ventifatos.png', 16, 16],
  cliff: ['05_Terreno/encosta.png', 32, 32],
  beacon: ['06_Marcadores/baliza.png', 20, 20],
  dust: ['07_Efeitos/poeira_passos.png', 12, 10],
  shine: ['07_Efeitos/brilho_descoberta.png', 12, 12],
  ship: ['10_Teaser_e_viagem/nave_transporte.png', 66, 34],
  edl: ['10_Teaser_e_viagem/pouso_sequencia.png', 40, 46],
  rocket: ['10_Teaser_e_viagem/foguete_mercury_redstone.png', 34, 62],
  mercury: ['10_Teaser_e_viagem/capsula_mercury_orbita.png', 14, 14],
  apollo13: ['10_Teaser_e_viagem/apollo13.png', 50, 28],
  robotRover: ['10_Teaser_e_viagem/rover_robos.png', 26, 18],
  orion: ['10_Teaser_e_viagem/orion_artemis2.png', 44, 32],
  devil: ['07_Efeitos/redemoinho_poeira.png', 14, 26],
  spark: ['07_Efeitos/faisca_rocha.png', 10, 10],
  // Versões 2x (o dobro de detalhe), usadas na EVA com escala 0,5. / 2x versions (double detail), used in the EVA at 0.5 scale.
  anaDown2x: ['01_Personagens/ana_selari/ana_frente_2x.png', 32, 48],
  anaUp2x: ['01_Personagens/ana_selari/ana_costas_2x.png', 32, 48],
  anaLeft2x: ['01_Personagens/ana_selari/ana_esquerda_2x.png', 32, 48],
  anaRight2x: ['01_Personagens/ana_selari/ana_direita_2x.png', 32, 48],
  keli2x: ['01_Personagens/tripulacao/keli_hastor_2x.png', 40, 48],
  natan2x: ['01_Personagens/tripulacao/natan_jonas_2x.png', 40, 48],
  rossi2x: ['01_Personagens/tripulacao/rossi_brook_2x.png', 40, 48],
  tatuDown2x: ['02_Tatu/tatu_frente_2x.png', 40, 36],
  tatuUp2x: ['02_Tatu/tatu_costas_2x.png', 40, 36],
  tatuSide2x: ['02_Tatu/tatu_lado_2x.png', 40, 36],
  rover2x: ['03_Veiculos/rover_pressurizado_2x.png', 96, 64],
  // Estação de limpeza do traje: 0 apagada, 1 a 3 luz subindo, 4 acesa. / Suit cleaning station: 0 off, 1 to 3 light going up, 4 lit.
  station2x: ['03_Veiculos/estacao_limpeza_2x.png', 32, 64],
  rocksMid2x: ['04_Rochas_e_decoracao/rochas_medias_2x.png', 32, 32],
  rocksBig2x: ['04_Rochas_e_decoracao/rochas_grandes_2x.png', 64, 64],
  beacon2x: ['06_Marcadores/baliza_2x.png', 40, 40],
} as const satisfies Record<string, readonly [string, number, number]>;

export type ArtKey = keyof typeof IMAGES | keyof typeof SHEETS;

/** Chaves de textura iguais aos nomes acima. / Texture keys equal to the names above. */
export const ART = Object.fromEntries([...Object.keys(IMAGES), ...Object.keys(SHEETS)].map((k) => [k, k])) as { [K in ArtKey]: K };

/** Caminho público de uma imagem inteira (para usar em HTML). / Public path of a whole image (for HTML use). */
export function artUrl(key: keyof typeof IMAGES): string {
  return assetUrl(S + IMAGES[key]);
}

/** Carrega toda a arte. Chamado no preload da BootScene. / Loads all art. Called from BootScene preload. */
export function preloadArt(scene: Phaser.Scene): void {
  for (const [key, file] of Object.entries(IMAGES)) scene.load.image(key, assetUrl(S + file));
  for (const [key, [file, frameWidth, frameHeight]] of Object.entries(SHEETS)) {
    scene.load.spritesheet(key, assetUrl(S + file), { frameWidth, frameHeight });
  }
}
