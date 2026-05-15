'use client';
import { useRef, useEffect, useCallback, useState } from 'react';
import { useCanvasSize } from '@/hooks/useCanvasSize';
import { useGame } from '@/hooks/useGame';
import GameSidebar from '@/components/sidebar/GameSidebar';
import {
  drawTerrain, drawGrid, drawPlayerEdge, drawNode,
} from '@/lib/renderer';
import { sampleWeight } from '@/lib/graph';

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height, cellW, cellH } = useCanvasSize(containerRef);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const game = useGame(cellW, cellH, width, height);

  const hasStarted = useRef(false);
  useEffect(() => {
    if (cellW > 0 && !hasStarted.current) {
      hasStarted.current = true;
      game.newGame();
    }
  }, [cellW, game]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);

    drawTerrain(ctx, game.grid, cellW, cellH);
    drawGrid(ctx, cellW, cellH, width, height);

    for (const e of game.playerEdges) {
      drawPlayerEdge(ctx, e, game.nodes, game.grid, cellW, cellH);
    }

    if (game.showMST) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      for (const e of game.mstEdges) {
        const a = game.nodes[e.u], b = game.nodes[e.v];
        if (!a || !b) continue;
        ctx.strokeStyle = '#4488ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#4488ff';
        ctx.shadowBlur = 10;
        ctx.setLineDash([8, 4]);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    }

    if (game.phase === 'building' && game.selectedNode !== null && hoveredNode !== null && hoveredNode !== game.selectedNode) {
      const a = game.nodes[game.selectedNode];
      const b = game.nodes[hoveredNode];
      if (a && b && cellW > 0) {
        const w = sampleWeight(game.grid, a.x, a.y, b.x, b.y, cellW, cellH);
        const exists = game.playerEdges.some(
          e => (e.u === game.selectedNode && e.v === hoveredNode) || (e.u === hoveredNode && e.v === game.selectedNode)
        );
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.strokeStyle = exists ? '#ff4444' : '#00d4ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.shadowColor = exists ? '#ff4444' : '#00d4ff';
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        ctx.font = 'bold 9px "Share Tech Mono", monospace';
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(mx - 14, my - 8, 28, 12);
        ctx.fillStyle = exists ? '#ff4444' : '#00d4ff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(w.toFixed(0), mx, my);
      }
    }

    for (const n of game.nodes) {
      drawNode(
        ctx, n,
        n.id === game.selectedNode,
        n.id === hoveredNode
      );
    }
  }, [width, height, cellW, cellH, game, hoveredNode]);

  const getHoveredNodeId = useCallback((px: number, py: number): number | null => {
    const THRESH = 18;
    for (const n of game.nodes) {
      const dx = n.x - px;
      const dy = n.y - py;
      if (dx * dx + dy * dy < THRESH * THRESH) return n.id;
    }
    return null;
  }, [game.nodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHoveredNode(getHoveredNodeId(x, y));
  }, [getHoveredNodeId]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    game.handleCanvasClick(e.clientX - rect.left, e.clientY - rect.top);
  }, [game]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-1.5 flex items-center gap-3 shrink-0">
        <span className="text-[11px] font-mono text-text-dim pb-4">
          {game.phase === 'building' && `Building - click vertices to connect | ${game.playerEdges.length}/${Math.max(0, game.nodes.length - 1)} edges`}
          {game.phase === 'submitted' && 'Submitted!'}
        </span>
        {game.phase === 'building' && game.selectedNode !== null && (
          <span className="text-[11px] font-mono text-accent">
            Selected: Vertex #{game.selectedNode} — click another to connect
          </span>
        )}
        {game.phase === 'building' && game.validation.hasCycle && (
          <span className="text-[11px] font-mono text-red-400">⚠ Cycle detected!</span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <GameSidebar
          phase={game.phase}
          playerEdges={game.playerEdges}
          nodeCount={game.nodes.length}
          canSubmit={game.canSubmit}
          result={game.result}
          showMST={game.showMST}
          hasCycle={game.validation.hasCycle}
          disconnected={game.validation.disconnected}
          onNewGame={game.newGame}
          onSubmit={game.submitTree}
          onShowMST={game.setShowMST}
          onRemoveEdge={game.removeEdge}
        />
        <div ref={containerRef} className="flex-1 relative overflow-hidden cursor-pointer">
          <canvas
            ref={canvasRef}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredNode(null)}
            className="absolute inset-0"
          />
        </div>
      </div>
    </div>
  );
}
