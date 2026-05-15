import type { Edge, Node } from '@/types';
import { sampleWeight } from './graph';

export function solvePrim(
  nodes: Node[],
  grid: Uint8Array,
  cellW: number,
  cellH: number
): Edge[] {
  if (nodes.length < 2) return [];
  const n = nodes.length;
  const inMST = new Uint8Array(n);
  const key = new Float32Array(n).fill(Infinity);
  const parent = new Int32Array(n).fill(-1);
  key[0] = 0;
  const result: Edge[] = [];

  for (let iter = 0; iter < n; iter++) {
    let u = -1;
    let minK = Infinity;
    for (let i = 0; i < n; i++) {
      if (!inMST[i] && key[i] < minK) { minK = key[i]; u = i; }
    }
    if (u === -1) break;
    inMST[u] = 1;
    if (parent[u] !== -1) result.push({ u: parent[u], v: u, weight: key[u] });

    for (let v = 0; v < n; v++) {
      if (inMST[v]) continue;
      const w = sampleWeight(grid, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, cellW, cellH);
      if (w < key[v]) { key[v] = w; parent[v] = u; }
    }
  }
  return result;
}
