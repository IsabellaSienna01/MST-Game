'use client';
import { useState, useCallback, useRef } from 'react';
import { createEmptyGrid, paintBrush, pixelToCell } from '@/lib/terrain';
import { solveMST, calcMSTCost, solvePrim, solveKruskal, buildPrimSteps, buildKruskalSteps } from '@/lib/algorithms';
import type { Node, Edge, TerrainType, Algorithm, AnimationStep } from '@/types';
import { TERRAIN_ORDER } from '@/lib/constants';

export function useSandbox(cellW: number, cellH: number) {
  const [grid, setGrid] = useState<Uint8Array>(() => createEmptyGrid());
  const [nodes, setNodes] = useState<Node[]>([]);
  const [mstEdges, setMstEdges] = useState<Edge[]>([]);
  const [algorithm, setAlgorithmState] = useState<Algorithm>('prim');
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainType>('plains');
  const [brushSize, setBrushSize] = useState(2);
  const [primCost, setPrimCost] = useState<number | null>(null);
  const [kruskalCost, setKruskalCost] = useState<number | null>(null);
  const [animSteps, setAnimSteps] = useState<AnimationStep[]>([]);
  const [animIdx, setAnimIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recalcMST = useCallback((ns: Node[], g: Uint8Array, cw: number, ch: number, algo: Algorithm) => {
    if (ns.length < 2 || cw === 0) { setMstEdges([]); setPrimCost(null); setKruskalCost(null); return; }
    const pe = solvePrim(ns, g, cw, ch);
    const ke = solveKruskal(ns, g, cw, ch);
    setPrimCost(calcMSTCost(pe));
    setKruskalCost(calcMSTCost(ke));
    const edges = algo === 'prim' ? pe : ke;
    setMstEdges(edges);
  }, []);

  const paintTerrain = useCallback((px: number, py: number) => {
    if (cellW === 0) return;
    const { col, row } = pixelToCell(px, py, cellW, cellH);
    const terrainId = TERRAIN_ORDER.indexOf(selectedTerrain);
    setGrid(prev => {
      const next = paintBrush(prev, col, row, brushSize, terrainId);
      setNodes(nds => { recalcMST(nds, next, cellW, cellH, algorithm); return nds; });
      return next;
    });
  }, [cellW, cellH, selectedTerrain, brushSize, algorithm, recalcMST]);

  const addNode = useCallback((px: number, py: number) => {
    if (cellW === 0) return;
    setNodes(prev => {
      const newNode: Node = { id: prev.length, x: px, y: py };
      const next = [...prev, newNode];
      setGrid(g => { recalcMST(next, g, cellW, cellH, algorithm); return g; });
      return next;
    });
  }, [cellW, cellH, algorithm, recalcMST]);

  const clearNodes = useCallback(() => {
    setNodes([]); setMstEdges([]); setPrimCost(null); setKruskalCost(null);
  }, []);

  const clearTerrain = useCallback(() => {
    const g = createEmptyGrid();
    setGrid(g);
    setNodes(ns => { recalcMST(ns, g, cellW, cellH, algorithm); return ns; });
  }, [cellW, cellH, algorithm, recalcMST]);

  const setAlgorithm = useCallback((algo: Algorithm) => {
    setAlgorithmState(algo);
    setGrid(g => { setNodes(ns => { recalcMST(ns, g, cellW, cellH, algo); return ns; }); return g; });
  }, [cellW, cellH, recalcMST]);

  const stopAnimation = useCallback(() => {
    if (animTimerRef.current) clearInterval(animTimerRef.current);
    animTimerRef.current = null;
    setIsAnimating(false);
    setAnimIdx(0);
  }, []);

  const startAnimation = useCallback((speedLevel: number) => {
    if (nodes.length < 2 || cellW === 0) return;
    stopAnimation();
    const steps = algorithm === 'prim'
      ? buildPrimSteps(nodes, grid, cellW, cellH)
      : buildKruskalSteps(nodes, grid, cellW, cellH);
    setAnimSteps(steps);
    setAnimIdx(0);
    setIsAnimating(true);

    const delay = Math.max(60, 600 - speedLevel * 55);
    let idx = 0;
    animTimerRef.current = setInterval(() => {
      idx++;
      setAnimIdx(idx);
      if (idx >= steps.length) {
        stopAnimation();
        setGrid(g => { setNodes(ns => { recalcMST(ns, g, cellW, cellH, algorithm); return ns; }); return g; });
      }
    }, delay);
  }, [nodes, grid, cellW, cellH, algorithm, stopAnimation, recalcMST]);

  const getGhostEdges = useCallback((mx: number, my: number): Edge[] => {
    if (nodes.length === 0 || cellW === 0) return [];
    const ghost = { id: nodes.length, x: mx, y: my };
    const temp = [...nodes, ghost];
    const edges = solveMST(algorithm, temp, grid, cellW, cellH);
    return edges.filter(e => e.u === temp.length - 1 || e.v === temp.length - 1);
  }, [nodes, grid, cellW, cellH, algorithm]);

  return {
    grid, nodes, mstEdges, algorithm, selectedTerrain, brushSize,
    primCost, kruskalCost,
    animSteps, animIdx, isAnimating,
    setSelectedTerrain, setBrushSize,
    setAlgorithm,
    paintTerrain, addNode, clearNodes, clearTerrain,
    startAnimation, stopAnimation,
    getGhostEdges,
  };
}
