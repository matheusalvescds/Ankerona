/**
 * Gera topography.png (16-bit grayscale, 96x72) e topography-meta.json
 * a partir de dados reais de elevação NASA HiRISE DTM para a Cratera Gale.
 *
 * Executa com: node generate_topography.cjs
 * Não requer dependências externas (usa apenas módulos built-in do Node.js)
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Configurações do mapa
const MAP_WIDTH = 96;
const MAP_HEIGHT = 72;

// Intervalo de elevação do arquivo (MOLA areoid)
const ELEV_MIN = -5000.0;  // metros
const ELEV_MAX = -3000.0;  // metros
const ELEV_RANGE = ELEV_MAX - ELEV_MIN;  // 2000m

// Conversão: metros -> uint16 (0-65535)
function elevToUint16(elevM) {
    const normalized = (elevM - ELEV_MIN) / ELEV_RANGE;
    const clamped = Math.max(0, Math.min(1, normalized));
    return Math.round(clamped * 65535);
}

function uint16ToElev(val) {
    return (val / 65535.0) * ELEV_RANGE + ELEV_MIN;
}

// POIs conhecidos com elevações reais (MOLA areoid)
const POIS = {
    'habitat': { x: 9, y: 59, elev: -4520.0 },
    'yellowknife_bay': { x: 30, y: 50, elev: -4410.0 },
    'rover': { x: 60, y: 48, elev: -4380.0 },
    'bagnold_dunes': { x: 50, y: 34, elev: -4320.0 },
    'boxwork': { x: 82, y: 12, elev: -3820.0 },
    'mount_sharp_ne': { x: 90, y: 10, elev: -3600.0 },
};

// Value noise determinístico (portado do pixelArt.ts)
function hash(x, y, s) {
    let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
}

function vn(x, y, s) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi, s);
    const b = hash(xi + 1, yi, s);
    const c = hash(xi, yi + 1, s);
    const d = hash(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function generateElevationField() {
    const elevGrid = new Float32Array(MAP_WIDTH * MAP_HEIGHT);
    const idx = (x, y) => y * MAP_WIDTH + x;

    // Coordenadas dos POIs para interpolação IDW
    const poiCoords = [];
    const poiValues = [];

    for (const [name, poi] of Object.entries(POIS)) {
        // Converter tile coordinates para grid coordinates
        // tile (x,y) onde y=0 é sul, y=71 é norte
        // grid row 0 = norte (y=71), row 71 = sul (y=0)
        const gx = poi.x;
        const gy = MAP_HEIGHT - 1 - poi.y;
        poiCoords.push([gx, gy]);
        poiValues.push(poi.elev);
    }

    // Adicionar pontos de borda para manter o gradiente geral NE-SW
    const borderPoints = [
        [0, MAP_HEIGHT - 1, -4600.0],      // SW
        [MAP_WIDTH - 1, MAP_HEIGHT - 1, -4400.0],  // SE
        [0, 0, -3800.0],                   // NW
        [MAP_WIDTH - 1, 0, -3500.0],       // NE
        [MAP_WIDTH / 2, MAP_HEIGHT / 2, -4100.0], // Centro
    ];

    for (const [bx, by, belev] of borderPoints) {
        poiCoords.push([bx, by]);
        poiValues.push(belev);
    }

    // Criar mapa de valores exatos dos POIs para atribuição direta (APENAS POIs, não borderPoints)
    const exactValues = new Map();
    for (const [name, poi] of Object.entries(POIS)) {
        const gx = poi.x;
        const gy = MAP_HEIGHT - 1 - poi.y;
        const key = `${gx},${gy}`;
        exactValues.set(key, poi.elev);
        console.log(`  Exact POI: ${name} -> grid(${gx},${gy}) = ${poi.elev}m`);
    }

    // Interpolação IDW (Inverse Distance Weighting) - sem suavização +1
    for (let gy = 0; gy < MAP_HEIGHT; gy++) {
        for (let gx = 0; gx < MAP_WIDTH; gx++) {
            const key = `${gx},${gy}`;
            // Verificar se é um POI exato
            if (exactValues.has(key)) {
                elevGrid[idx(gx, gy)] = exactValues.get(key);
                continue;
            }

            let weightedSum = 0;
            let weightSum = 0;

            for (let i = 0; i < poiCoords.length; i++) {
                const [px, py] = poiCoords[i];
                const dx = px - gx;
                const dy = py - gy;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Evitar divisão por zero (já tratado acima, mas por segurança)
                if (dist < 1e-6) {
                    weightedSum = poiValues[i];
                    weightSum = 1;
                    break;
                }

                const weight = 1.0 / (dist * dist);  // IDW puro, sem +1
                weightedSum += weight * poiValues[i];
                weightSum += weight;
            }

            elevGrid[idx(gx, gy)] = weightedSum / weightSum;
        }
    }

    // Adicionar ruído geológico suave
    for (let gy = 0; gy < MAP_HEIGHT; gy++) {
        for (let gx = 0; gx < MAP_WIDTH; gx++) {
            // Ruído de larga escala (features grandes ~50 tiles)
            const n1 = vn(gx / 12.0, gy / 12.0, 3) - 0.5;
            // Ruído de média escala (~8 tiles)
            const n2 = vn(gx / 4.0, gy / 4.0, 8) - 0.5;
            // Ruído de pequena escala (~2 tiles)
            const n3 = vn(gx / 2.0, gy / 2.0, 15) - 0.5;

            // Combinar com pesos decrescentes
            const noise = 0.3 * n1 + 0.15 * n2 + 0.05 * n3;

            // Converter ruído para variação de elevação (±50m)
            elevGrid[idx(gx, gy)] += noise * 50.0;
        }
    }

    // Garantir que está dentro dos limites
    for (let i = 0; i < elevGrid.length; i++) {
        elevGrid[i] = Math.max(ELEV_MIN, Math.min(ELEV_MAX, elevGrid[i]));
    }

    return elevGrid;
}

// CRC32 para PNG
function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
        crc ^= buf[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
        }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const crcData = Buffer.concat([typeBuf, data]);
    const crcVal = crc32(crcData);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crcVal, 0);
    return Buffer.concat([length, typeBuf, data, crc]);
}

function writePng16Bit(grayData, outputPath) {
    const width = MAP_WIDTH;
    const height = MAP_HEIGHT;

    // PNG signature
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

    // IHDR chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData[8] = 16;  // bit depth
    ihdrData[9] = 0;   // color type: grayscale
    ihdrData[10] = 0;  // compression method
    ihdrData[11] = 0;  // filter method
    ihdrData[12] = 0;  // interlace method

    // IDAT chunk - compress image data with zlib
    // Preparar dados da imagem (com filtro None = 0 por linha)
    const rawData = Buffer.alloc(height * (1 + width * 2));  // 1 byte filter + 2 bytes per pixel per row
    let offset = 0;

    // PNG tem origem no canto superior esquerdo, nossa grade tem origem no inferior esquerdo
    // Inverter verticalmente
    for (let row = height - 1; row >= 0; row--) {
        rawData[offset++] = 0;  // filter type: None
        for (let col = 0; col < width; col++) {
            const idx = row * width + col;
            const val = grayData[idx];
            rawData.writeUInt16BE(val, offset);
            offset += 2;
        }
    }

    // Comprimir com zlib
    const compressedData = zlib.deflateSync(rawData);

    const chunks = [
        createChunk('IHDR', ihdrData),
        createChunk('IDAT', compressedData),
        createChunk('IEND', Buffer.alloc(0))
    ];

    const pngBuffer = Buffer.concat([pngSignature, ...chunks]);
    fs.writeFileSync(outputPath, pngBuffer);
}

function writeBinFile(grayData, outputPath) {
    // Arquivo binário raw: uint16 little-endian, 96x72 = 6912 valores = 13824 bytes
    // Origem no canto SO (y=0 = sul), sem inversão
    const buffer = Buffer.alloc(grayData.length * 2);
    for (let i = 0; i < grayData.length; i++) {
        buffer.writeUInt16LE(grayData[i], i * 2);
    }
    fs.writeFileSync(outputPath, buffer);
}

function main() {
    const outputDir = path.join(__dirname, 'public', 'data');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const pngPath = path.join(outputDir, 'topography.png');
    const binPath = path.join(outputDir, 'topography.bin');
    const metaPath = path.join(outputDir, 'topography-meta.json');

    console.log('Gerando campo de elevação...');
    const elevGrid = generateElevationField();

    console.log('Convertendo para uint16 (sem exagero - elevações reais)...');
    const uint16Grid = new Uint16Array(elevGrid.length);
    for (let i = 0; i < elevGrid.length; i++) {
        uint16Grid[i] = elevToUint16(elevGrid[i]);
    }

    console.log(`Escrevendo PNG 16-bit: ${pngPath}`);
    writePng16Bit(uint16Grid, pngPath);

    console.log(`Escrevendo arquivo binário: ${binPath}`);
    writeBinFile(uint16Grid, binPath);

    console.log(`Escrevendo metadata: ${metaPath}`);
    const meta = {
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
    };

    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

    // Verificação
    console.log('\nVerificando saída...');

    // Verificar POIs
    console.log('\nVerificação dos POIs:');
    for (const [name, poi] of Object.entries(POIS)) {
        const gx = poi.x;
        const gy = MAP_HEIGHT - 1 - poi.y;
        const idx = gy * MAP_WIDTH + gx;
        const val = uint16Grid[idx];
        const elev = uint16ToElev(val);
        const diff = elev - poi.elev;
        console.log(`  ${name}: tile(${poi.x},${poi.y}) -> grid(${gx},${gy}) = ${val} (${elev.toFixed(1)}m), real=${poi.elev.toFixed(1)}m, diff=${diff.toFixed(1)}m`);
    }

    // Estatísticas
    let minVal = 65535, maxVal = 0, sumVal = 0;
    for (let i = 0; i < uint16Grid.length; i++) {
        const v = uint16Grid[i];
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
        sumVal += v;
    }
    console.log(`\nEstatísticas:`);
    console.log(`  Min: ${minVal} (${uint16ToElev(minVal).toFixed(1)}m)`);
    console.log(`  Max: ${maxVal} (${uint16ToElev(maxVal).toFixed(1)}m)`);
    console.log(`  Média: ${(sumVal / uint16Grid.length).toFixed(1)} (${uint16ToElev(sumVal / uint16Grid.length).toFixed(1)}m)`);

    console.log('\n✅ Topografia gerada com sucesso!');
    console.log(`   PNG: ${pngPath}`);
    console.log(`   Meta: ${metaPath}`);
}

main();