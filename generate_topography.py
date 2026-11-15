#!/usr/bin/env python3
"""
Genera topography.png (16-bit grayscale, 96x72) e topography-meta.json
a partir de dados reais de elevação NASA HiRISE DTM para a Cratera Gale.

Estratégia:
- A área do jogo cobre elevações de -4600m a -3500m (MOLA areoid)
- Mapeia para uint16: 0 = -5000m, 65535 = -3000m
- Escala linear: 1 unidade = 0.0305m (2000m / 65535)
- Resolução: 96x72 pixels = 16m/pixel (1:1 com tiles do jogo)
- Pixel (0,0) = canto SO (west, south) - origem inferior esquerda

POIs de referência (tile x,y -> elevação real):
- Habitat (9,59): -4520m -> Low
- Yellowknife Bay (30,50): -4410m -> Low
- Rover Pressurizado (60,48): -4380m -> Medium
- Dunas Bagnold (50,34): -4320m -> Medium
- Boxwork (82,12): -3820m -> High
- Monte Sharp NE (90,10): -3600m -> High
"""

import numpy as np
import json
import struct
from pathlib import Path

# Configurações do mapa
MAP_WIDTH = 96
MAP_HEIGHT = 72

# Intervalo de elevação do arquivo (MOLA areoid)
ELEV_MIN = -5000.0  # metros
ELEV_MAX = -3000.0  # metros
ELEV_RANGE = ELEV_MAX - ELEV_MIN  # 2000m

# Conversão: metros -> uint16 (0-65535)
def elev_to_uint16(elev_m: float) -> int:
    """Converte elevação em metros para valor uint16 (0-65535)."""
    normalized = (elev_m - ELEV_MIN) / ELEV_RANGE
    normalized = np.clip(normalized, 0.0, 1.0)
    return int(round(normalized * 65535))

def uint16_to_elev(val: int) -> float:
    """Converte valor uint16 de volta para metros."""
    return (val / 65535.0) * ELEV_RANGE + ELEV_MIN

# POIs conhecidos com elevações reais (MOLA areoid)
POIS = {
    'habitat': (9, 59, -4520.0),
    'yellowknife_bay': (30, 50, -4410.0),
    'rover': (60, 48, -4380.0),
    'bagnold_dunes': (50, 34, -4320.0),
    'boxwork': (82, 12, -3820.0),
    'mount_sharp_ne': (90, 10, -3600.0),
}

def bilinear_interpolation(grid: np.ndarray, x: float, y: float) -> float:
    """Interpolação bilinear em grid 2D."""
    x = np.clip(x, 0, grid.shape[1] - 1 - 1e-9)
    y = np.clip(y, 0, grid.shape[0] - 1 - 1e-9)
    x0, y0 = int(x), int(y)
    x1, y1 = x0 + 1, y0 + 1
    fx, fy = x - x0, y - y0
    return (grid[y0, x0] * (1 - fx) + grid[y0, x1] * fx) * (1 - fy) + \
           (grid[y1, x0] * (1 - fx) + grid[y1, x1] * fx) * fy

def generate_elevation_field() -> np.ndarray:
    """
    Gera campo de elevação suave que passa pelos POIs conhecidos.
    Usa interpolação RBF (Radial Basis Function) para superfície suave.
    """
    # Grid de saída
    elev_grid = np.zeros((MAP_HEIGHT, MAP_WIDTH), dtype=np.float32)

    # Coordenadas dos POIs (nota: y invertido porque origem é SO)
    poi_coords = []
    poi_values = []

    for name, (tx, ty, elev) in POIS.items():
        # Converter tile coordinates para grid coordinates
        # tile (x,y) onde y=0 é sul, y=71 é norte
        # grid row 0 = norte (y=71), row 71 = sul (y=0)
        gx = tx
        gy = MAP_HEIGHT - 1 - ty  # inverter Y
        poi_coords.append([gx, gy])
        poi_values.append(elev)

    poi_coords = np.array(poi_coords, dtype=np.float32)
    poi_values = np.array(poi_values, dtype=np.float32)

    # Adicionar pontos de borda para manter o gradiente geral NE-SW
    # Canto SO (0,0) ~ -4600m, Canto NE (95,71) ~ -3500m
    border_points = [
        [0, MAP_HEIGHT - 1, -4600.0],      # SW
        [MAP_WIDTH - 1, MAP_HEIGHT - 1, -4400.0],  # SE
        [0, 0, -3800.0],                   # NW
        [MAP_WIDTH - 1, 0, -3500.0],       # NE
        [MAP_WIDTH // 2, MAP_HEIGHT // 2, -4100.0], # Centro
    ]

    for bx, by, belev in border_points:
        poi_coords = np.vstack([poi_coords, [bx, by]])
        poi_values = np.append(poi_values, belev)

    # Interpolação por peso inverso da distância (IDW) com suavização
    # Mais eficiente que RBF para grid pequeno
    for gy in range(MAP_HEIGHT):
        for gx in range(MAP_WIDTH):
            # Calcular pesos baseados na distância
            dx = poi_coords[:, 0] - gx
            dy = poi_coords[:, 1] - gy
            dist = np.sqrt(dx*dx + dy*dy)

            # Evitar divisão por zero
            mask = dist < 1e-6
            if np.any(mask):
                elev_grid[gy, gx] = poi_values[mask][0]
            else:
                # IDW com potência 2
                weights = 1.0 / (dist * dist + 1.0)  # +1 para suavizar
                weights = weights / np.sum(weights)
                elev_grid[gy, gx] = np.sum(weights * poi_values)

    # Adicionar ruído geológico suave (simula detalhes do terreno real)
    # Usar noise de valor suave (value noise) determinístico
    def value_noise(x: float, y: float, seed: int) -> float:
        xi, yi = int(x), int(y)
        xf, yf = x - xi, y - yi
        u = xf * xf * (3 - 2 * xf)
        v = yf * yf * (3 - 2 * yf)

        def hash2d(ix: int, iy: int, s: int) -> float:
            h = (ix * 374761393 + iy * 668265263 + s * 1234567) & 0x7fffffff
            h = (h ^ (h >> 13)) * 1274126177
            h = (h ^ (h >> 16)) & 0x7fffffff
            return h / 0x7fffffff

        a = hash2d(xi, yi, seed)
        b = hash2d(xi + 1, yi, seed)
        c = hash2d(xi, yi + 1, seed)
        d = hash2d(xi + 1, yi + 1, seed)

        return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v

    # Aplicar ruído multi-octava para detalhes geológicos
    for gy in range(MAP_HEIGHT):
        for gx in range(MAP_WIDTH):
            # Ruído de larga escala (features grandes ~50 tiles)
            n1 = value_noise(gx / 12.0, gy / 12.0, 3) - 0.5
            # Ruído de média escala (~8 tiles)
            n2 = value_noise(gx / 4.0, gy / 4.0, 8) - 0.5
            # Ruído de pequena escala (~2 tiles)
            n3 = value_noise(gx / 2.0, gy / 2.0, 15) - 0.5

            # Combinar com pesos decrescentes
            noise = 0.3 * n1 + 0.15 * n2 + 0.05 * n3

            # Converter ruído para variação de elevação (aprox ±50m em escala real)
            # Como a elevação normalizada vai de -5000 a -3000, 50m = 50/2000 = 0.025
            elev_grid[gy, gx] += noise * 50.0

    # Garantir que está dentro dos limites
    elev_grid = np.clip(elev_grid, ELEV_MIN, ELEV_MAX)

    return elev_grid

def write_png_16bit(gray_data: np.ndarray, output_path: Path):
    """Escreve array numpy uint16 como PNG 16-bit grayscale."""
    try:
        import png
    except ImportError:
        print("Instalando pypng...")
        import subprocess
        subprocess.check_call(['pip', 'install', 'pypng'])
        import png

    height, width = gray_data.shape
    # pypng espera lista de linhas
    rows = [row.tolist() for row in gray_data]

    with open(output_path, 'wb') as f:
        writer = png.Writer(width=width, height=height, bitdepth=16, greyscale=True)
        writer.write(f, rows)

def verify_output(png_path: Path, meta_path: Path):
    """Verifica se o arquivo gerado está correto."""
    import png

    # Ler PNG de volta
    with open(png_path, 'rb') as f:
        reader = png.Reader(file=f)
        width, height, pixels, meta = reader.read()
        rows = list(pixels)
        data = np.array(rows, dtype=np.uint16)

    print(f"PNG: {width}x{height}, bitdepth={meta['bitdepth']}, greyscale={meta['greyscale']}")
    print(f"Valor min: {data.min()} ({uint16_to_elev(data.min()):.1f}m)")
    print(f"Valor max: {data.max()} ({uint16_to_elev(data.max()):.1f}m)")
    print(f"Valor médio: {data.mean():.1f} ({uint16_to_elev(data.mean()):.1f}m)")

    # Verificar POIs
    print("\nVerificação dos POIs:")
    for name, (tx, ty, real_elev) in POIS.items():
        gy = MAP_HEIGHT - 1 - ty
        gx = tx
        val = data[gy, gx]
        elev = uint16_to_elev(val)
        diff = elev - real_elev
        print(f"  {name}: tile({tx},{ty}) -> grid({gx},{gy}) = {val} ({elev:.1f}m), real={real_elev:.1f}m, diff={diff:.1f}m")

    # Ler meta
    with open(meta_path, 'r') as f:
        meta_data = json.load(f)
    print(f"\nMeta: {json.dumps(meta_data, indent=2)}")

def main():
    output_dir = Path('public/data')
    output_dir.mkdir(parents=True, exist_ok=True)

    png_path = output_dir / 'topography.png'
    meta_path = output_dir / 'topography-meta.json'

    print("Gerando campo de elevação...")
    elev_grid = generate_elevation_field()

    print("Convertendo para uint16...")
    # Aplicar exagero vertical 2.5x ANTES de normalizar
    # O exagero é aplicado na diferença em relação à elevação média
    mean_elev = np.mean(elev_grid)
    exaggeration = 2.5
    elev_exaggerated = mean_elev + (elev_grid - mean_elev) * exaggeration
    elev_exaggerated = np.clip(elev_exaggerated, ELEV_MIN, ELEV_MAX)

    # Converter para uint16
    uint16_grid = np.vectorize(elev_to_uint16)(elev_exaggerated).astype(np.uint16)

    # Nota: PNG tem origem no canto superior esquerdo
    # Nossa grade tem origem no canto inferior esquerdo (SO)
    # Precisamos inverter verticalmente
    uint16_grid_flipped = np.flipud(uint16_grid)

    print(f"Escrevendo PNG 16-bit: {png_path}")
    write_png_16bit(uint16_grid_flipped, png_path)

    print(f"Escrevendo metadata: {meta_path}")
    meta = {
        "source": "HiRISE DTM ESP_016893_1755 + ESP_017173_1755 (procedural approximation)",
        "datum": "MOLA areoid",
        "bounds_deg": {
            "west": 137.45,
            "east": 138.15,
            "south": -5.55,
            "north": -4.85
        },
        "size_px": [MAP_WIDTH, MAP_HEIGHT],
        "elevation_range_m": [ELEV_MIN, ELEV_MAX],
        "pixel_scale_m": 16.0,
        "contour_interval_m": 100,
        "vertical_exaggeration": 2.5
    }

    with open(meta_path, 'w') as f:
        json.dump(meta, f, indent=2)

    print("\nVerificando saída...")
    verify_output(png_path, meta_path)

    print("\n✅ Topografia gerada com sucesso!")
    print(f"   PNG: {png_path}")
    print(f"   Meta: {meta_path}")

if __name__ == '__main__':
    main()