import { COLS, ROWS, TERRAIN_ID_MAP } from './constants';
import type { TerrainType } from '@/types';


export function gridIndex(col: number, row: number): number {
  return row * COLS + col;
}

export function getCell(grid: Uint8Array, col: number, row: number): number {
  if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return 0;
  return grid[gridIndex(col, row)];
}

export function getCellTerrain(grid: Uint8Array, col: number, row: number): TerrainType {
  return TERRAIN_ID_MAP[getCell(grid, col, row)];
}

export function pixelToCell(px: number, py: number, cellW: number, cellH: number) {
  return { col: Math.floor(px / cellW), row: Math.floor(py / cellH) };
}

export function cellCenter(col: number, row: number, cellW: number, cellH: number) {
  return { x: (col + 0.5) * cellW, y: (row + 0.5) * cellH };
}

export function paintBrush(
  grid: Uint8Array,
  col: number, row: number,
  brushSize: number,
  terrainId: number,
): Uint8Array {
  const next = new Uint8Array(grid);
  for (let dr = -(brushSize - 1); dr < brushSize; dr++) {
    for (let dc = -(brushSize - 1); dc < brushSize; dc++) {
      const c = col + dc;
      const r = row + dr;
      if (c >= 0 && r >= 0 && c < COLS && r < ROWS) {
        next[gridIndex(c, r)] = terrainId;
      }
    }
  }
  return next;
}

export function createEmptyGrid(): Uint8Array {
  return new Uint8Array(COLS * ROWS);
}

export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223;
    return (s >>> 0) / 0x100000000;
  };
}

function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function randFloat(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}


const T = {
  PLAINS: 0,
  FOREST: 1,
  MUD:    2,
  LAKE:   3,
} as const;


interface Ellipse {
  cx: number; cy: number;
  rw: number; rh: number;
  angle?: number;
}

function paintEllipse(
  grid: Uint8Array,
  e: Ellipse,
  terrainId: number,
  skip: number[] = [],
): void {
  const cos = Math.cos(e.angle ?? 0);
  const sin = Math.sin(e.angle ?? 0);
  const pad = Math.max(e.rw, e.rh) + 1;
  const cMin = Math.max(0, Math.floor(e.cx - pad));
  const cMax = Math.min(COLS - 1, Math.ceil(e.cx + pad));
  const rMin = Math.max(0, Math.floor(e.cy - pad));
  const rMax = Math.min(ROWS - 1, Math.ceil(e.cy + pad));

  for (let r = rMin; r <= rMax; r++) {
    for (let c = cMin; c <= cMax; c++) {
      const dx = c - e.cx;
      const dy = r - e.cy;
      const lx = (cos * dx + sin * dy) / e.rw;
      const ly = (-sin * dx + cos * dy) / e.rh;
      if (lx * lx + ly * ly >= 1) continue;
      const idx = gridIndex(c, r);
      if (skip.includes(grid[idx])) continue;
      grid[idx] = terrainId;
    }
  }
}

function paintRiver(
  grid: Uint8Array,
  rng: () => number,
  terrainId: number,
  skip: number[] = [],
): void {
  const horiz = rng() > 0.5;
  const thick = randInt(rng, 1, 3);
  const steps = horiz ? COLS : ROWS;
  const maxOffset = horiz ? ROWS : COLS;
  let pos = randFloat(rng, maxOffset * 0.2, maxOffset * 0.8);

  for (let i = 0; i < steps; i++) {
    pos += randFloat(rng, -1.2, 1.2);
    pos = Math.max(thick, Math.min(maxOffset - thick - 1, pos));
    for (let t = -thick; t <= thick; t++) {
      const c = horiz ? i : Math.round(pos) + t;
      const r = horiz ? Math.round(pos) + t : i;
      if (c < 0 || r < 0 || c >= COLS || r >= ROWS) continue;
      const idx = gridIndex(c, r);
      if (skip.includes(grid[idx])) continue;
      grid[idx] = terrainId;
    }
  }
}

export function generateRandomNodes(
  seed: number,
  count: number,
  canvasWidth: number,
  canvasHeight: number,
  margin = 48,
): { id: number; x: number; y: number }[] {

  const rng = seededRandom(seed ^ 0xdeadbeef);

  const usableW = canvasWidth  - margin * 2;
  const usableH = canvasHeight - margin * 2;

  const cols = Math.ceil(Math.sqrt(count * (usableW / usableH)));
  const rows = Math.ceil(count / cols);
  const cellW = usableW / cols;
  const cellH = usableH / rows;

  const cellIndices = Array.from({ length: cols * rows }, (_, i) => i);
  for (let i = cellIndices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cellIndices[i], cellIndices[j]] = [cellIndices[j], cellIndices[i]];
  }

  return Array.from({ length: count }, (_, id) => {
    const ci = cellIndices[id];
    const col = ci % cols;
    const row = Math.floor(ci / cols);
    const innerMargin = 0.15;
    const x = margin + (col + innerMargin + rng() * (1 - innerMargin * 2)) * cellW;
    const y = margin + (row + innerMargin + rng() * (1 - innerMargin * 2)) * cellH;
    return { id, x: Math.round(x), y: Math.round(y) };
  });
}

export function generateRandomMap(seed: number): Uint8Array {
  const grid = new Uint8Array(COLS * ROWS);
  const rng = seededRandom(seed);

  const numLakes = randInt(rng, 1, 4);
  for (let l = 0; l < numLakes; l++) {
    paintEllipse(grid, {
      cx:    randFloat(rng, COLS * 0.1, COLS * 0.9),
      cy:    randFloat(rng, ROWS * 0.1, ROWS * 0.9),
      rw:    randFloat(rng, 3, 12),
      rh:    randFloat(rng, 2, 8),
      angle: randFloat(rng, 0, Math.PI),
    }, T.LAKE);
  }

  const numForests = randInt(rng, 2, 5);
  for (let f = 0; f < numForests; f++) {
    paintEllipse(grid, {
      cx:    randFloat(rng, COLS * 0.05, COLS * 0.95),
      cy:    randFloat(rng, ROWS * 0.05, ROWS * 0.95),
      rw:    randFloat(rng, 5, 18),
      rh:    randFloat(rng, 4, 12),
      angle: randFloat(rng, 0, Math.PI),
    }, T.FOREST, [T.LAKE]);
  }

  const numFeatures = randInt(rng, 1, 3);
  for (let m = 0; m < numFeatures; m++) {
    if (rng() > 0.5) {
      paintRiver(grid, rng, T.MUD, [T.LAKE]);
    } else {
      paintEllipse(grid, {
        cx:    randFloat(rng, COLS * 0.1, COLS * 0.9),
        cy:    randFloat(rng, ROWS * 0.1, ROWS * 0.9),
        rw:    randFloat(rng, 2, 8),
        rh:    randFloat(rng, 1, 4),
        angle: randFloat(rng, 0, Math.PI),
      }, T.MUD, [T.LAKE]);
    }
  }

  return grid;
}