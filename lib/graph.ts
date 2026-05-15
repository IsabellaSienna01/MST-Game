import { SAMPLE_COUNT, TERRAIN_CONFIG, TERRAIN_ID_MAP } from './constants';
import { getCell } from './terrain';
import type { Edge, Node } from '@/types';

export function sampleWeight(
  grid: Uint8Array,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cellW: number,
  cellH: number,
  n: number = SAMPLE_COUNT
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const segDist = dist / n;
  let total = 0;

  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const px = (x1 + dx * t) / cellW;
    const py = (y1 + dy * t) / cellH;
    const col = Math.floor(px);
    const row = Math.floor(py);
    const terrainId = getCell(grid, col, row);
    const terrain = TERRAIN_ID_MAP[terrainId];
    total += segDist * TERRAIN_CONFIG[terrain].multiplier;
  }

  return total;
}

export function buildEdgeList(
  nodes: Node[],
  grid: Uint8Array,
  cellW: number,
  cellH: number
): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      edges.push({
        u: i,
        v: j,
        weight: sampleWeight(
          grid,
          nodes[i].x, nodes[i].y,
          nodes[j].x, nodes[j].y,
          cellW, cellH
        ),
      });
    }
  }
  return edges;
}

export function getEdgeMidpointTerrain(
  grid: Uint8Array,
  a: Node,
  b: Node,
  cellW: number,
  cellH: number
): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const col = Math.floor(mx / cellW);
  const row = Math.floor(my / cellH);
  const terrainId = getCell(grid, col, row);
  return TERRAIN_ID_MAP[terrainId];
}
export function isSpanningTree(edges: Edge[], nodeCount: number): boolean {
  if (edges.length !== nodeCount - 1) return false;
  const par = Array.from({ length: nodeCount }, (_, i) => i);
  function find(x: number): number {
    while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; }
    return x;
  }
  function union(a: number, b: number): boolean {
    a = find(a); b = find(b);
    if (a === b) return false;
    par[b] = a;
    return true;
  }
  for (const e of edges) {
    if (!union(e.u, e.v)) return false;
  }
  const root = find(0);
  return Array.from({ length: nodeCount }, (_, i) => i).every(i => find(i) === root);
}

export function validatePlayerTree(
  playerEdges: Edge[],
  nodeCount: number
): { valid: boolean; hasCycle: boolean; disconnected: boolean } {
  const par = Array.from({ length: nodeCount }, (_, i) => i);
  function find(x: number): number {
    while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; }
    return x;
  }
  let hasCycle = false;
  for (const e of playerEdges) {
    const fa = find(e.u);
    const fb = find(e.v);
    if (fa === fb) { hasCycle = true; break; }
    par[fb] = fa;
  }
  const root = find(0);
  const disconnected = !Array.from({ length: nodeCount }, (_, i) => i).every(i => find(i) === root);
  return { valid: !hasCycle && !disconnected, hasCycle, disconnected };
}
