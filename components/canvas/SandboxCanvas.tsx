'use client';
import { useRef, useEffect, useCallback, useState } from 'react';
import { useCanvasSize } from '@/hooks/useCanvasSize';
import { useSandbox } from '@/hooks/useSandbox';
import SandboxSidebar from '@/components/sidebar/SandboxSidebar';
import {
  drawTerrain, drawGrid, drawMSTEdge, drawGhostEdge,
  drawNode, drawGhostNode, drawBrushPreview, drawAnimEdge,
} from '@/lib/renderer';
import { pixelToCell, getCell } from '@/lib/terrain';
import { TERRAIN_ID_MAP, TERRAIN_CONFIG } from '@/lib/constants';
import type { Node } from '@/types';
import Button from '../ui/Button';

type InteractionMode = 'terrain' | 'node';

export default function SandboxCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height, cellW, cellH } = useCanvasSize(containerRef);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('terrain');
  const [mousePos, setMousePos] = useState({ x: -1, y: -1 });
  const [mouseCell, setMouseCell] = useState({ col: -1, row: -1 });
  const [isPainting, setIsPainting] = useState(false);
  const [statusInfo, setStatusInfo] = useState({ terrain: '-', ghostCost: '-' });

  const sb = useSandbox(cellW, cellH);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);

    drawTerrain(ctx, sb.grid, cellW, cellH);
    drawGrid(ctx, cellW, cellH, width, height);

    if (sb.isAnimating) {
      const step = sb.animSteps[Math.min(sb.animIdx, sb.animSteps.length - 1)];
      if (step) {
        for (const e of step.edges) drawMSTEdge(ctx, e, sb.nodes, sb.grid, cellW, cellH);
        if (step.tried) drawAnimEdge(ctx, step.tried, sb.nodes, step.accepted ?? false);
      }
    } else {
      for (const e of sb.mstEdges) drawMSTEdge(ctx, e, sb.nodes, sb.grid, cellW, cellH);
      if (interactionMode === 'node' && mousePos.x >= 0) {
        const ghost = sb.getGhostEdges(mousePos.x, mousePos.y);
        const ghostNode: Node = { id: sb.nodes.length, x: mousePos.x, y: mousePos.y };
        for (const e of ghost) drawGhostEdge(ctx, e, sb.nodes, ghostNode, sb.grid, cellW, cellH);
      }
    }

    for (const n of sb.nodes) drawNode(ctx, n);

    if (interactionMode === 'node' && mousePos.x >= 0) {
      drawGhostNode(ctx, mousePos.x, mousePos.y);
    }
    if (interactionMode === 'terrain' && mouseCell.col >= 0) {
      drawBrushPreview(ctx, mouseCell.col, mouseCell.row, sb.brushSize, cellW, cellH);
    }
  }, [
    width, height, cellW, cellH, sb, mousePos, mouseCell,
    interactionMode, sb.isAnimating, sb.animIdx,
  ]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
    if (cellW > 0) {
      const cell = pixelToCell(x, y, cellW, cellH);
      setMouseCell(cell);
      const t = getCell(sb.grid, cell.col, cell.row);
      const terrain = TERRAIN_ID_MAP[t];
      setStatusInfo(prev => ({
        ...prev,
        terrain: `${TERRAIN_CONFIG[terrain].label} (x${TERRAIN_CONFIG[terrain].multiplier})`,
      }));
    }
    if (isPainting && interactionMode === 'terrain') sb.paintTerrain(x, y);
  }, [cellW, cellH, sb, isPainting, interactionMode]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0 && interactionMode === 'terrain') {
      setIsPainting(true);
      const rect = canvasRef.current!.getBoundingClientRect();
      sb.paintTerrain(e.clientX - rect.left, e.clientY - rect.top);
    }
  }, [interactionMode, sb]);

  const handleMouseUp = useCallback(() => setIsPainting(false), []);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (interactionMode === 'node') {
      const rect = canvasRef.current!.getBoundingClientRect();
      sb.addNode(e.clientX - rect.left, e.clientY - rect.top);
    }
  }, [interactionMode, sb]);

  const handleMouseLeave = useCallback(() => {
    setIsPainting(false);
    setMousePos({ x: -1, y: -1 });
    setMouseCell({ col: -1, row: -1 });
  }, []);

  const mstCost = sb.mstEdges.reduce((s, e) => s + e.weight, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-1.5 flex items-center gap-2 shrink-0  pb-4">
        <Button
          onClick={() => setInteractionMode('terrain')}
          active={interactionMode === 'terrain'}
        >
          Paint Terrain
        </Button>
        <Button
          onClick={() => setInteractionMode('node')}
          active={interactionMode === 'node'}
        >
          Place Vertex
        </Button>
        <div className="ml-auto flex items-center gap-3 text-[11px] font-mono text-text-dim">
          <span>Grid: {mouseCell.col >= 0 ? `${mouseCell.col},${mouseCell.row}` : '—'}</span>
          <span>Terrain: {statusInfo.terrain}</span>
          {interactionMode === 'node' && sb.nodes.length > 0 && mousePos.x >= 0 && (
            <span className="text-accent">Ghost hover active</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <SandboxSidebar
          selectedTerrain={sb.selectedTerrain}
          brushSize={sb.brushSize}
          algorithm={sb.algorithm}
          nodeCount={sb.nodes.length}
          edgeCount={sb.mstEdges.length}
          primCost={sb.primCost}
          kruskalCost={sb.kruskalCost}
          mstCost={mstCost}
          animSteps={sb.animSteps}
          animIdx={sb.animIdx}
          isAnimating={sb.isAnimating}
          onTerrainChange={sb.setSelectedTerrain}
          onBrushSizeChange={sb.setBrushSize}
          onAlgorithmChange={sb.setAlgorithm}
          onClearNodes={sb.clearNodes}
          onClearTerrain={sb.clearTerrain}
          onStartAnimation={sb.startAnimation}
          onStopAnimation={sb.stopAnimation}
        />
        <div ref={containerRef} className="flex-1 relative overflow-hidden cursor-crosshair">
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onContextMenu={handleContextMenu}
            className="absolute inset-0"
          />
        </div>
      </div>
    </div>
  );
}
