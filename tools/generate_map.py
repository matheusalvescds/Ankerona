#!/usr/bin/env python3
"""
Gera o JSON do mapa da Cratera Gale para Ankerona.
Mapa 96x72 tiles (16x16 cada), baseado nos dados reais da NASA.
"""
import json
import random
from typing import Dict, List, Tuple

# Configuração do mapa
MAP_WIDTH = 96
MAP_HEIGHT = 72
TILE_SIZE = 16

# IDs de terreno (matching sprites em public/assets/sprites/05_Terreno/)
TERRAIN = {
    "regolith": 0,      # regolito plano
    "ventifact": 1,     # chão com ventifatos
    "slope": 2,         # encosta (desenhada em 2x)
}

# IDs de obstáculos (matching sprites em 04_Rochas_e_decoracao/)
OBSTACLE = {
    "none": 0,
    "rock_small": 1,    # rocha_pequena 10x8
    "rock_medium": 2,   # rochas_medias 16x16 (bloqueiam 1 tile)
    "rock_large": 3,    # rochas_grandes 32x32 (bloqueiam 2x2 tiles)
    "rock_spiky": 4,    # rocha_pontiaguda 16x12 (dano ao traje)
    "ventifact": 5,     # ventifatos 16x8
    "pebble": 6,        # seixos 12x8
    "pebble_group": 7,  # seixos_grupos 14x10
    "crater_small": 8,  # cratera_pequena 12x10
    "crater_medium": 9, # cratera_media 16x14
    "meteorite": 10,    # meteorito 12x9
    "boxwork": 11,      # boxwork 32x28
    "sulfur": 12,       # cristais_de_enxofre 16x14
    "wheel_tracks": 13, # rastros_de_roda 16x16
}

# IDs de marcadores (06_Marcadores/)
MARKER = {
    "none": 0,
    "beacon": 1,        # baliza
    "beacon_visited": 2, # tripe_ponto_visitado
    "shelter": 3,       # marcador_abrigo
    "radiation": 4,     # alerta_radiacao
    "sensor_hit": 5,    # acertos_no_sensor
}

# Camadas de dados (matching guia)
LAYER = {
    "mapa": 0,          # MAPA - vista normal
    "topografia": 1,    # TOPOGRAFIA - elevação
    "minerais": 2,      # MINERAIS - argila/sulfatos
    "terreno": 3,       # TERRENO - risco/abrigo
}

# POIs reais da Cratera Gale
POIS = {
    "landing": {"x": 48, "y": 50, "name": "landing_2012", "desc": "Pouso 2012"},
    "yellowknife": {"x": 30, "y": 35, "name": "yellowknife_bay", "desc": "Yellowknife Bay"},
    "bagnold": {"x": 70, "y": 20, "name": "bagnold_dunes", "desc": "Dunas Bagnold"},
    "boxwork": {"x": 80, "y": 15, "name": "boxwork", "desc": "Boxwork formations"},
    "sharp": {"x": 85, "y": 10, "name": "mount_sharp", "desc": "Mount Sharp"},
}

def generate_base_terrain() -> List[List[int]]:
    """Gera terreno base: regolito com algumas variações."""
    terrain = []
    for y in range(MAP_HEIGHT):
        row = []
        for x in range(MAP_WIDTH):
            # Maioria regolito, alguns ventifatos
            if random.random() < 0.15:
                row.append(TERRAIN["ventifact"])
            else:
                row.append(TERRAIN["regolith"])
        terrain.append(row)
    return terrain

def add_slopes(terrain: List[List[int]]) -> None:
    """Adiciona encostas (Monte Sharp ao fundo)."""
    # Encostas no topo (norte) - Monte Sharp
    for y in range(0, 15):
        for x in range(MAP_WIDTH):
            # Probabilidade aumenta conforme sobe
            prob = (15 - y) / 15 * 0.3
            if random.random() < prob:
                terrain[y][x] = TERRAIN["slope"]

def add_obstacles(terrain: List[List[int]]) -> List[List[int]]:
    """Adiciona obstáculos decorativos e funcionais."""
    obstacles = [[OBSTACLE["none"] for _ in range(MAP_WIDTH)] for _ in range(MAP_HEIGHT)]

    # Rochas médias (bloqueiam 1 tile) - espalhadas
    for _ in range(120):
        x = random.randint(0, MAP_WIDTH - 1)
        y = random.randint(0, MAP_HEIGHT - 1)
        if random.random() < 0.7:
            obstacles[y][x] = OBSTACLE["rock_medium"]

    # Rochas grandes (bloqueiam 2x2) - poucas
    for _ in range(15):
        x = random.randint(0, MAP_WIDTH - 2)
        y = random.randint(0, MAP_HEIGHT - 2)
        for dy in range(2):
            for dx in range(2):
                obstacles[y + dy][x + dx] = OBSTACLE["rock_large"]

    # Rochas pontiagudas (dano ao traje) - áreas de risco
    for _ in range(40):
        x = random.randint(0, MAP_WIDTH - 1)
        y = random.randint(0, MAP_HEIGHT - 1)
        obstacles[y][x] = OBSTACLE["rock_spiky"]

    # Ventifatos em áreas de vento
    for _ in range(30):
        x = random.randint(0, MAP_WIDTH - 3)
        y = random.randint(0, MAP_HEIGHT - 1)
        for dx in range(4):
            obstacles[y][x + dx] = OBSTACLE["ventifact"]

    # Crateras pequenas
    for _ in range(10):
        x = random.randint(0, MAP_WIDTH - 1)
        y = random.randint(0, MAP_HEIGHT - 1)
        obstacles[y][x] = OBSTACLE["crater_small"]

    # Crateras médias
    for _ in range(5):
        x = random.randint(0, MAP_WIDTH - 1)
        y = random.randint(0, MAP_HEIGHT - 1)
        obstacles[y][x] = OBSTACLE["crater_medium"]

    # Meteoritos raros
    for _ in range(3):
        x = random.randint(0, MAP_WIDTH - 1)
        y = random.randint(0, MAP_HEIGHT - 1)
        obstacles[y][x] = OBSTACLE["meteorite"]

    # Seixos soltos (pisáveis)
    for _ in range(50):
        x = random.randint(0, MAP_WIDTH - 1)
        y = random.randint(0, MAP_HEIGHT - 1)
        obstacles[y][x] = OBSTACLE["pebble"]

    # Grupos de seixos
    for _ in range(10):
        x = random.randint(0, MAP_WIDTH - 1)
        y = random.randint(0, MAP_HEIGHT - 1)
        obstacles[y][x] = OBSTACLE["pebble_group"]

    # Rastros de roda (perto do pouso)
    for i in range(20):
        x = 48 + random.randint(-5, 5)
        y = 50 + random.randint(-5, 5)
        if 0 <= x < MAP_WIDTH and 0 <= y < MAP_HEIGHT:
            obstacles[y][x] = OBSTACLE["wheel_tracks"]

    # Boxwork (perto do Monte Sharp)
    for _ in range(3):
        x = random.randint(75, 90)
        y = random.randint(10, 20)
        if 0 <= x < MAP_WIDTH and 0 <= y < MAP_HEIGHT:
            obstacles[y][x] = OBSTACLE["boxwork"]

    # Cristais de enxofre (descoberta rara)
    for _ in range(2):
        x = random.randint(60, 85)
        y = random.randint(15, 30)
        if 0 <= x < MAP_WIDTH and 0 <= y < MAP_HEIGHT:
            obstacles[y][x] = OBSTACLE["sulfur"]

    return obstacles

def add_markers(terrain: List[List[int]]) -> List[List[int]]:
    """Adiciona marcadores de missão."""
    markers = [[MARKER["none"] for _ in range(MAP_WIDTH)] for _ in range(MAP_HEIGHT)]

    # Balizas nos POIs
    for poi in POIS.values():
        x, y = poi["x"], poi["y"]
        if 0 <= x < MAP_WIDTH and 0 <= y < MAP_HEIGHT:
            markers[y][x] = MARKER["beacon"]

    # Marcadores de abrigo (habitat e rover)
    markers[50][48] = MARKER["shelter"]  # Habitat (pouso)
    markers[35][30] = MARKER["shelter"]  # Rover nas dunas

    # Alertas de radiação (evento solar)
    for _ in range(3):
        x = random.randint(10, MAP_WIDTH - 10)
        y = random.randint(10, MAP_HEIGHT - 10)
        markers[y][x] = MARKER["radiation"]

    return markers

def generate_layers(terrain: List[List[int]], obstacles: List[List[int]]) -> Dict[str, List[List[int]]]:
    """Gera as 4 camadas de dados do Guia."""
    layers = {}

    # MAPA - vista normal (0 = livre, 1 = bloqueado)
    mapa = [[0 for _ in range(MAP_WIDTH)] for _ in range(MAP_HEIGHT)]
    for y in range(MAP_HEIGHT):
        for x in range(MAP_WIDTH):
            # Bloqueado se rocha média/grande/pontiaguda
            obs = obstacles[y][x]
            if obs in [OBSTACLE["rock_medium"], OBSTACLE["rock_large"], OBSTACLE["rock_spiky"],
                       OBSTACLE["crater_medium"], OBSTACLE["meteorite"], OBSTACLE["boxwork"]]:
                mapa[y][x] = 1

    # TOPOGRAFIA - 0=baixo, 1=médio, 2=alto, 3=curva de nível
    topo = [[0 for _ in range(MAP_WIDTH)] for _ in range(MAP_HEIGHT)]
    for y in range(MAP_HEIGHT):
        for x in range(MAP_WIDTH):
            # Elevação aumenta para norte (Monte Sharp)
            base_elev = (MAP_HEIGHT - y) / MAP_HEIGHT * 2
            noise = random.random() * 0.5
            elev = int(base_elev + noise)
            topo[y][x] = min(max(elev, 0), 3)

    # MINERAIS - 0=nenhum, 1=argila, 2=sulfatos, 3=ambos
    minerais = [[0 for _ in range(MAP_WIDTH)] for _ in range(MAP_HEIGHT)]
    # Argila em Yellowknife Bay (baixa elevação)
    for y in range(30, 45):
        for x in range(20, 45):
            if random.random() < 0.4:
                minerals[y][x] = 1
    # Sulfatos no Monte Sharp (alta elevação)
    for y in range(0, 20):
        for x in range(60, 95):
            if random.random() < 0.3:
                minerals[y][x] = 2
    # Ambos na transição
    for y in range(20, 30):
        for x in range(45, 65):
            if random.random() < 0.2:
                minerals[y][x] = 3

    # TERRENO - 0=regolito firme, 1=areia fofa, 2=rochas pontiagudas, 3=encosta/rocha, 4=abrigo
    terreno_layer = [[0 for _ in range(MAP_WIDTH)] for _ in range(MAP_HEIGHT)]
    for y in range(MAP_HEIGHT):
        for x in range(MAP_WIDTH):
            obs = obstacles[y][x]
            terr = terrain[y][x]

            if obs == OBSTACLE["rock_spiky"]:
                terrain_layer[y][x] = 2  # rochas pontiagudas
            elif terrain[y][x] == TERRAIN["slope"]:
                terrain_layer[y][x] = 3  # encosta/rocha
            elif random.random() < 0.1 and y > 40:
                terrain_layer[y][x] = 1  # areia fofa nas dunas (sul)
            else:
                terrain_layer[y][x] = 0  # regolito firme

    # Marcadores de abrigo
    for y in range(MAP_HEIGHT):
        for x in range(MAP_WIDTH):
            if (x == 48 and y == 50) or (x == 35 and y == 30):
                terrain_layer[y][x] = 4  # abrigo

    layers["mapa"] = mapa
    layers["topografia"] = topo
    layers["minerais"] = minerais
    layers["terreno"] = terrain_layer

    return layers

def build_map() -> Dict:
    """Constrói o mapa completo."""
    random.seed(42)  # Seed fixo para reprodutibilidade

    print("Gerando terreno base...")
    terrain = generate_base_terrain()

    print("Adicionando encostas...")
    add_slopes(terrain)

    print("Adicionando obstáculos...")
    obstacles = add_obstacles(terrain)

    print("Adicionando marcadores...")
    markers = add_markers(terrain)

    print("Gerando camadas de dados...")
    layers = generate_layers(terrain, [])

    # Constrói o JSON final
    map_data = {
        "version": "1.0",
        "seed": 42,
        "width": MAP_WIDTH,
        "height": MAP_HEIGHT,
        "tileSize": TILE_SIZE,
        "terrain": terrain,
        "obstacles": obstacles,
        "markers": markers,
        "layers": layers,
        "pois": POIS,
        "terrainTypes": TERRAIN,
        "obstacleTypes": OBSTACLE,
        "markerTypes": MARKER,
        "layerTypes": LAYER,
    }

    return map_data

if __name__ == "__main__":
    print("=== Gerador de Mapa Ankerona ===")
    map_data = build_map()

    output_path = "data/map.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(map_data, f, separators=(",", ":"))

    print(f"Mapa salvo em {output_path}")
    print(f"Dimensões: {MAP_WIDTH}x{MAP_HEIGHT} tiles")
    print(f"Tamanho do arquivo: ~{len(json.dumps(map_data)) / 1024:.1f} KB")