'use client';
import { useState, useCallback, useRef } from 'react';
import { generateRandomMap, generateRandomNodes } from '@/lib/terrain';
import { solvePrim } from '@/lib/algorithms';
import { sampleWeight, validatePlayerTree, isSpanningTree } from '@/lib/graph';
import { calculateScore } from '@/lib/scoring';
import type { Node, Edge, GamePhase, GameResult } from '@/types';

const NODE_COUNT = 15;

export function useGame(cellW: number, cellH: number, canvasW: number, canvasH: number) {
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 99999));
  const [grid, setGrid] = useState<Uint8Array>(() => new Uint8Array(80 * 45) as Uint8Array);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [phase, setPhase] = useState<GamePhase>('building');
  const [playerEdges, setPlayerEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [mstEdges, setMstEdges] = useState<Edge[]>([]);
  const [showMST, setShowMST] = useState(false);
  const selectedNodeRef = useRef<number | null>(null);
  const gridRef = useRef(grid);
  const nodesRef = useRef(nodes);
  const cellWRef = useRef(cellW);
  const cellHRef = useRef(cellH);
  gridRef.current = grid;
  nodesRef.current = nodes;
  cellWRef.current = cellW;
  cellHRef.current = cellH;
  const canvasWRef = useRef(canvasW);
  const canvasHRef = useRef(canvasH);
  canvasWRef.current = canvasW;
  canvasHRef.current = canvasH;

const newGame = useCallback((newSeed?: number) => {
  if (canvasWRef.current === 0 || canvasHRef.current === 0) return;
  
  const s = newSeed ?? Math.floor(Math.random() * 99999);
  setSeed(s);
  const g = generateRandomMap(s);
  const ns = generateRandomNodes(s, NODE_COUNT, canvasWRef.current, canvasHRef.current);
  setGrid(g);
  setNodes(ns);
  setPlayerEdges([]);
  selectedNodeRef.current = null;
  setSelectedNode(null);
  setResult(null);
  setShowMST(false);
  setPhase('building');
  const mst = solvePrim(ns, g, cellWRef.current, cellHRef.current);
  setMstEdges(mst);
}, []);

  const handleNodeClick = useCallback((nodeId: number) => {
    if (phase !== 'building') return;

    const prev = selectedNodeRef.current;

    if (prev === null) {
      selectedNodeRef.current = nodeId;
      setSelectedNode(nodeId);
      return;
    }

    if (prev === nodeId) {
      selectedNodeRef.current = null;
      setSelectedNode(null);
      return;
    }

    setPlayerEdges(pe => {
      const exists = pe.some(
        e => (e.u === prev && e.v === nodeId) || (e.u === nodeId && e.v === prev)
      );
      if (exists) {
        return pe.filter(
          e => !((e.u === prev && e.v === nodeId) || (e.u === nodeId && e.v === prev))
        );
      }
      const weight = sampleWeight(
        gridRef.current,
        nodesRef.current[prev].x, nodesRef.current[prev].y,
        nodesRef.current[nodeId].x, nodesRef.current[nodeId].y,
        cellWRef.current, cellHRef.current
      );
      return [...pe, { u: prev, v: nodeId, weight }];
    });

    selectedNodeRef.current = null;
    setSelectedNode(null);
  }, [phase]);

  const handleCanvasClick = useCallback((px: number, py: number) => {
    if (phase !== 'building') return;
    const threshold = 18;
    const clicked = nodesRef.current.find(n => {
      const dx = n.x - px;
      const dy = n.y - py;
      return dx * dx + dy * dy < threshold * threshold;
    });
    if (clicked) {
      handleNodeClick(clicked.id);
    } else {
      selectedNodeRef.current = null;
      setSelectedNode(null);
    }
  }, [phase, handleNodeClick]);

  const removeEdge = useCallback((u: number, v: number) => {
    setPlayerEdges(pe => pe.filter(e => !((e.u === u && e.v === v) || (e.u === v && e.v === u))));
  }, []);

  const submitTree = useCallback(() => {
    if (phase !== 'building') return;
    setPlayerEdges(pe => {
      const validation = validatePlayerTree(pe, nodesRef.current.length);
      if (!validation.valid) return pe;
      const playerCost = pe.reduce((s, e) => s + e.weight, 0);
      setMstEdges(mst => {
        const mstCost = mst.reduce((s, e) => s + e.weight, 0);
        const res = calculateScore(playerCost, mstCost, nodesRef.current.length);
        setResult(res);
        return mst;
      });
      setPhase('submitted');
      return pe;
    });
  }, [phase]);

  const validation = validatePlayerTree(playerEdges, nodes.length);
  const canSubmit = phase === 'building' && nodes.length > 1 && isSpanningTree(playerEdges, nodes.length);

  return {
    seed, grid, nodes, phase, playerEdges, selectedNode,
    result, mstEdges, showMST,
    validation, canSubmit,
    newGame, handleCanvasClick, removeEdge, submitTree,
    setShowMST,
    setSelectedNode,
  };
}
