import type { Edge, Node, Algorithm, AnimationStep } from '@/types';
import { sampleWeight, buildEdgeList } from './graph';

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

export function solveKruskal(
  nodes: Node[],
  grid: Uint8Array,
  cellW: number,
  cellH: number
): Edge[] {
  if (nodes.length < 2) return [];
  const edges = buildEdgeList(nodes, grid, cellW, cellH).sort((a, b) => a.weight - b.weight);
  const par = Array.from({ length: nodes.length }, (_, i) => i);
  const rank = new Int32Array(nodes.length);

  function find(x: number): number {
    while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; }
    return x;
  }
  function union(a: number, b: number): boolean {
    a = find(a); b = find(b);
    if (a === b) return false;
    if (rank[a] < rank[b]) [a, b] = [b, a];
    par[b] = a;
    if (rank[a] === rank[b]) rank[a]++;
    return true;
  }

  return edges.filter(e => union(e.u, e.v));
}

export function solveMST(
  algorithm: Algorithm,
  nodes: Node[],
  grid: Uint8Array,
  cellW: number,
  cellH: number
): Edge[] {
  return algorithm === 'prim'
    ? solvePrim(nodes, grid, cellW, cellH)
    : solveKruskal(nodes, grid, cellW, cellH);
}

export function calcMSTCost(edges: Edge[]): number {
  return edges.reduce((sum, e) => sum + e.weight, 0);
}

export function buildPrimSteps(
  nodes: Node[],
  grid: Uint8Array,
  cellW: number,
  cellH: number
): AnimationStep[] {
  if (nodes.length < 2) return [];
  const n = nodes.length;
  const inMST = new Uint8Array(n);
  const key = new Float32Array(n).fill(Infinity);
  const parent = new Int32Array(n).fill(-1);
  key[0] = 0;
  const steps: AnimationStep[] = [];
  const accepted: Edge[] = [];

  steps.push({ type: 'prim-start', edges: [], activeNode: 0, desc: `Starting Prim from vertex #0` });

  for (let iter = 0; iter < n; iter++) {
    let u = -1, minK = Infinity;
    for (let i = 0; i < n; i++) if (!inMST[i] && key[i] < minK) { minK = key[i]; u = i; }
    if (u === -1) break;
    inMST[u] = 1;

    if (parent[u] !== -1) {
      const edge = { u: parent[u], v: u, weight: key[u] };
      accepted.push(edge);
      steps.push({
        type: 'prim-add-edge', edges: [...accepted], activeNode: u, tried: edge, accepted: true,
        desc: `Add vertex #${u} to MST via edge ${parent[u]}↔${u} (cost ${key[u].toFixed(1)})`,
      });
    }

    for (let v = 0; v < n; v++) {
      if (inMST[v]) continue;
      const w = sampleWeight(grid, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, cellW, cellH);
      if (w < key[v]) { key[v] = w; parent[v] = u; }
    }
  }
  return steps;
}

export function buildKruskalSteps(
  nodes: Node[],
  grid: Uint8Array,
  cellW: number,
  cellH: number
): AnimationStep[] {
  if (nodes.length < 2) return [];
  const edges = buildEdgeList(nodes, grid, cellW, cellH).sort((a, b) => a.weight - b.weight);
  const par = Array.from({ length: nodes.length }, (_, i) => i);
  const rank = new Int32Array(nodes.length);
  function find(x: number): number { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; }
  function union(a: number, b: number): boolean {
    a = find(a); b = find(b); if (a === b) return false;
    if (rank[a] < rank[b]) [a, b] = [b, a]; par[b] = a; if (rank[a] === rank[b]) rank[a]++; return true;
  }

  const steps: AnimationStep[] = [];
  const accepted: Edge[] = [];

  for (const e of edges) {
    const ok = union(e.u, e.v);
    if (ok) accepted.push(e);
    steps.push({
      type: ok ? 'kruskal-accept' : 'kruskal-reject',
      edges: [...accepted], tried: e, accepted: ok,
      desc: ok
        ? `Accept edge ${e.u}↔${e.v} (w=${e.weight.toFixed(1)})`
        : `Reject edge ${e.u}↔${e.v} — would form cycle`,
    });
  }
  return steps;
}
