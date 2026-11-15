#!/usr/bin/env node
/**
 * Gera o JSON do mapa da Cratera Gale para Ankerona.
 * Node.js version - runs without Python.
 * Map: 96x72 tiles (16x16 each), based on real NASA data.
 */
const fs = require('fs');
const path = require('path');

// Config
const MAP_WIDTH = 96;
const MAP_HEIGHT = 72;
const TILE_SIZE = 16;
const SEED = 42;

// Seeded random for reproducibility
function createSeededRandom(seed) {
  let state = seed;
  return function() {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const rand = createSeededRandom(SEED);

function random() { return rand(); }
function randomInt(min, max) { return Math.floor(random() * (max - min + 1)) + min; }

// Terrain types (matching sprites)
const TERRAIN = {
  regolith: 0,
  ventifact: 1,
  slope: 2,
};

const OBSTACLE = {
  none: 0,
  rock_small: 1,
  rock_medium: 2,
  rock_large: 3,
  rock_spiky: 4,
  ventifact: 5,
  pebble: 6,
  pebble_group: 7,
  crater_small: 8,
  crater_medium: 9,
  meteorite: 10,
  boxwork: 11,
  sulfur: 12,
  wheel_tracks: 13,
};

const MARKER = {
  none: 0,
  beacon: 1,
  beacon_visited: 2,
  shelter: 3,
  radiation: 4,
  sensor_hit: 5,
};

const LAYER = {
  mapa: 0,
  topografia: 1,
  minerais: 2,
  terreno: 3,
};

const POIS = {
  landing: { x: 48, y: 50, name: 'landing_2012', desc: 'Pouso 2012' },
  yellowknife: { x: 30, y: 35, name: 'yellowknife_bay', desc: 'Yellowknife Bay' },
  bagnold: { x: 70, y: 20, name: 'bagnold_dunes', desc: 'Dunas Bagnold' },
  boxwork: { x: 80, y: 15, name: 'boxwork', desc: 'Boxwork formations' },
  sharp: { x: 85, y: 10, name: 'mount_sharp', desc: 'Mount Sharp' },
};

function generateBaseTerrain() {
  const terrain = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      row.push(random() < 0.15 ? TERRAIN.ventifact : TERRAIN.regolith);
    }
    terrain.push(row);
  }
  return terrain;
}

function addSlopes(terrain) {
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const prob = (15 - y) / 15 * 0.3;
      if (random() < prob) {
        terrain[y][x] = TERRAIN.slope;
      }
    }
  }
}

function addObstacles(terrain) {
  const obstacles = Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill(OBSTACLE.none));

  // Rock medium (bloqueiam 1 tile)
  for (let i = 0; i < 120; i++) {
    const x = randomInt(0, MAP_WIDTH - 1);
    const y = randomInt(0, MAP_HEIGHT - 1);
    if (random() < 0.7) obstacles[y][x] = OBSTACLE.rock_medium;
  }

  // Rock large (2x2 tiles)
  for (let i = 0; i < 15; i++) {
    const x = randomInt(0, MAP_WIDTH - 2);
    const y = randomInt(0, MAP_HEIGHT - 2);
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        obstacles[y + dy][x + dx] = OBSTACLE.rock_large;
      }
    }
  }

  // Rock spiky (dano ao traje)
  for (let i = 0; i < 40; i++) {
    const x = randomInt(0, MAP_WIDTH - 1);
    const y = randomInt(0, MAP_HEIGHT - 1);
    obstacles[y][x] = OBSTACLE.rock_spiky;
  }

  // Ventifatos
  for (let i = 0; i < 30; i++) {
    const x = randomInt(0, MAP_WIDTH - 4);
    const y = randomInt(0, MAP_HEIGHT - 1);
    for (let dx = 0; dx < 4; dx++) {
      obstacles[y][x + dx] = OBSTACLE.ventifact;
    }
  }

  // Crateras pequenas
  for (let i = 0; i < 10; i++) {
    const x = randomInt(0, MAP_WIDTH - 1);
    const y = randomInt(0, MAP_HEIGHT - 1);
    obstacles[y][x] = OBSTACLE.crater_small;
  }

  // Crateras médias
  for (let i = 0; i < 5; i++) {
    const x = randomInt(0, MAP_WIDTH - 1);
    const y = randomInt(0, MAP_HEIGHT - 1);
    obstacles[y][x] = OBSTACLE.crater_medium;
  }

  // Meteoritos
  for (let i = 0; i < 3; i++) {
    const x = randomInt(0, MAP_WIDTH - 1);
    const y = randomInt(0, MAP_HEIGHT - 1);
    obstacles[y][x] = OBSTACLE.meteorite;
  }

  // Seixos
  for (let i = 0; i < 50; i++) {
    const x = randomInt(0, MAP_WIDTH - 1);
    const y = randomInt(0, MAP_HEIGHT - 1);
    obstacles[y][x] = OBSTACLE.pebble;
  }

  // Grupos de seixos
  for (let i = 0; i < 10; i++) {
    const x = randomInt(0, MAP_WIDTH - 1);
    const y = randomInt(0, MAP_HEIGHT - 1);
    obstacles[y][x] = OBSTACLE.pebble_group;
  }

  // Rastros de roda
  for (let i = 0; i < 20; i++) {
    const x = 48 + randomInt(-5, 5);
    const y = 50 + randomInt(-5, 5);
    if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
      obstacles[y][x] = OBSTACLE.wheel_tracks;
    }
  }

  // Boxwork
  for (let i = 0; i < 3; i++) {
    const x = randomInt(75, 90);
    const y = randomInt(10, 20);
    if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
      obstacles[y][x] = OBSTACLE.boxwork;
    }
  }

  // Sulfur
  for (let i = 0; i < 2; i++) {
    const x = randomInt(60, 85);
    const y = randomInt(15, 30);
    if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
      obstacles[y][x] = OBSTACLE.sulfur;
    }
  }

  return obstacles;
}

function addMarkers(terrain) {
  const markers = Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill(MARKER.none));

  // Beacons at POIs
  for (const poi of Object.values(POIS)) {
    const { x, y } = poi;
    if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
      markers[y][x] = MARKER.beacon;
    }
  }

  // Shelters
  markers[50][48] = MARKER.shelter; // Habitat
  markers[35][30] = MARKER.shelter; // Rover

  // Radiation alerts
  for (let i = 0; i < 3; i++) {
    const x = randomInt(10, MAP_WIDTH - 10);
    const y = randomInt(10, MAP_HEIGHT - 10);
    markers[y][x] = MARKER.radiation;
  }

  return markers;
}

function generateLayers(terrain, obstacles) {
  const layers = { mapa: [], topografia: [], minerais: [], terreno: [] };

  for (let y = 0; y < MAP_HEIGHT; y++) {
    const mapaRow = [];
    const topoRow = [];
    const mineraisRow = [];
    const terrenoRow = [];

    for (let x = 0; x < MAP_WIDTH; x++) {
      const obs = obstacles[y][x];
      const terr = terrain[y][x];

      // MAPA: 0=livre, 1=bloqueado
      const blocking = [OBSTACLE.rock_medium, OBSTACLE.rock_large, OBSTACLE.rock_spiky,
                        OBSTACLE.crater_medium, OBSTACLE.meteorite, OBSTACLE.boxwork];
      mapaRow.push(blocking.includes(obstacles[y][x]) ? 1 : 0);

      // TOPOGRAFIA: 0=baixo, 1=médio, 2=alto, 3=curva
      const baseElev = (MAP_HEIGHT - y) / MAP_HEIGHT * 2;
      const noise = random() * 0.5;
      const elev = Math.min(Math.max(Math.floor(baseElev + noise), 0), 3);
      topoRow.push(elev);

      // MINERAIS: 0=nenhum, 1=argila, 2=sulfatos, 3=ambos
      let mineral = 0;
      if (y >= 30 && y < 45 && x >= 20 && x < 45 && random() < 0.4) mineral = 1;
      else if (y < 20 && x >= 60 && x < 95 && random() < 0.3) mineral = 2;
      else if (y >= 20 && y < 30 && x >= 45 && x < 65 && random() < 0.2) mineral = 3;
      mineraisRow.push(mineral);

      // TERRENO: 0=firme, 1=fofa, 2=pontiaguda, 3=encosta/rocha, 4=abrigo
      let terrVal = 0;
      if (obstacles[y][x] === OBSTACLE.rock_spiky) terrVal = 2;
      else if (terrain[y][x] === 2) terrVal = 3;
      else if (random() < 0.1 && y > 40) terrVal = 1;
      else terrVal = 0;
      terrenoRow.push(terrVal);
    }

    layers.mapa.push(mapaRow);
    layers.topografia.push(topoRow);
    layers.minerais.push(mineraisRow);
    layers.terreno.push(terrenoRow);
  }

  // Add shelter markers to terrain layer
  terrain[50][48] = 4;
  terrain[35][30] = 4;

  return layers;
}

function buildMap() {
  console.log('Gerando terreno base...');
  const terrain = generateBaseTerrain();
  console.log('Adicionando encostas...');
  addSlopes(terrain);
  console.log('Adicionando obstáculos...');
  const obstacles = addObstacles(terrain);
  console.log('Adicionando marcadores...');
  const markers = addMarkers(terrain);
  console.log('Gerando camadas de dados...');
  const layers = generateLayers(terrain, obstacles);

  return {
    version: '1.0',
    seed: SEED,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    tileSize: 16,
    terrain,
    obstacles,
    markers,
    layers,
    pois: POIS,
    terrainTypes: { regolith: 0, ventifact: 1, slope: 2 },
    obstacleTypes: {
      none: 0, rock_small: 1, rock_medium: 2, rock_large: 3,
      rock_spiky: 4, ventifact: 5, pebble: 6, pebble_group: 7,
      crater_small: 8, crater_medium: 9, meteorite: 10,
      boxwork: 11, sulfur: 12, wheel_tracks: 13,
    },
    markerTypes: { none: 0, beacon: 1, beacon_visited: 2, shelter: 3, radiation: 4, sensor_hit: 5 },
    layerTypes: { mapa: 0, topografia: 1, minerais: 2, terreno: 3 },
  };
}

// Run
console.log('=== Gerador de Mapa Ankerona (Node.js) ===');
const mapData = buildMap();

const outputPath = path.join(__dirname, '..', 'data', 'map.json');
fs.writeFileSync(outputPath, JSON.stringify(mapData), 'utf8');

console.log(`Mapa salvo em ${outputPath}`);
console.log(`Dimensões: ${MAP_WIDTH}x${MAP_HEIGHT} tiles`);
console.log(`Tamanho: ~${(JSON.stringify(mapData).length / 1024).toFixed(1)} KB`);