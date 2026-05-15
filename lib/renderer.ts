import { COLS, ROWS, TERRAIN_CONFIG, TERRAIN_ID_MAP, EDGE_COLORS_BY_TERRAIN } from './constants';
import { getEdgeMidpointTerrain, sampleWeight } from './graph';
import type { Node, Edge, TerrainType } from '@/types';

export function drawTerrain(
  ctx: CanvasRenderingContext2D,
  grid: Uint8Array,
  cellW: number,
  cellH: number
) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r * COLS + c];
      ctx.fillStyle = TERRAIN_CONFIG[TERRAIN_ID_MAP[t]].color;
      ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);
    }
  }
}

export function drawGrid(ctx: CanvasRenderingContext2D, cellW: number, cellH: number, w: number, h: number) {
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 0.3;
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath(); ctx.moveTo(c * cellW, 0); ctx.lineTo(c * cellW, h); ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * cellH); ctx.lineTo(w, r * cellH); ctx.stroke();
  }
}

export function drawMSTEdge(
  ctx: CanvasRenderingContext2D,
  edge: Edge,
  nodes: Node[],
  grid: Uint8Array,
  cellW: number,
  cellH: number,
  alpha = 1
) {
  const a = nodes[edge.u];
  const b = nodes[edge.v];
  if (!a || !b) return;
  const terrain = getEdgeMidpointTerrain(grid, a, b, cellW, cellH) as TerrainType;
  const color = EDGE_COLORS_BY_TERRAIN[terrain];

  ctx.save();
  ctx.globalAlpha = alpha * 0.85;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.restore();

  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  ctx.font = 'bold 9px "Share Tech Mono", monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(mx - 14, my - 8, 28, 12);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(edge.weight.toFixed(0), mx, my);
}

export function drawPlayerEdge(
  ctx: CanvasRenderingContext2D,
  edge: Edge,
  nodes: Node[],
  grid: Uint8Array,
  cellW: number,
  cellH: number,
  highlight = false
) {
  const a = nodes[edge.u];
  const b = nodes[edge.v];
  if (!a || !b) return;
  const terrain = getEdgeMidpointTerrain(grid, a, b, cellW, cellH) as TerrainType;
  const color = highlight ? '#ffffff' : EDGE_COLORS_BY_TERRAIN[terrain];

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = highlight ? 3 : 2.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = highlight ? 14 : 8;
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.restore();

  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  ctx.font = 'bold 9px "Share Tech Mono", monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(mx - 14, my - 8, 28, 12);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(edge.weight.toFixed(0), mx, my);
}

export function drawGhostEdge(
  ctx: CanvasRenderingContext2D,
  edge: Edge,
  nodes: Node[],
  ghostNode: Node,
  grid: Uint8Array,
  cellW: number,
  cellH: number
) {
  const extNodes = [...nodes, ghostNode];
  const a = extNodes[edge.u];
  const b = extNodes[edge.v];
  if (!a || !b) return;

  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur = 5;
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  const w = sampleWeight(grid, a.x, a.y, b.x, b.y, cellW, cellH);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  ctx.font = 'bold 9px "Share Tech Mono", monospace';
  ctx.fillStyle = 'rgba(0,30,50,0.85)';
  ctx.fillRect(mx - 14, my - 8, 28, 12);
  ctx.fillStyle = '#00d4ff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(w.toFixed(0), mx, my);
}

export function drawNode(
  ctx: CanvasRenderingContext2D,
  node: Node,
  selected = false,
  highlighted = false
) {
  const color = highlighted ? '#ffee44' : selected ? '#ffffff' : '#ff6b35';
  const glowColor = highlighted ? '#ffee44' : selected ? '#aaddff' : '#ff6b35';

  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = selected ? 18 : 12;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(node.x, node.y, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = highlighted ? '#fff8aa' : '#ffcc99';
  ctx.beginPath(); ctx.arc(node.x, node.y, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.font = 'bold 10px "Share Tech Mono", monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(node.x + 8, node.y - 10, 16, 13);
  ctx.fillStyle = highlighted ? '#ffee44' : '#ffcc99';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(node.id), node.x + 16, node.y - 4);
}

export function drawGhostNode(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.shadowColor = '#ff6b35';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#ff6b35';
  ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffcc99';
  ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawBrushPreview(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  brushSize: number,
  cellW: number,
  cellH: number
) {
  const bs = brushSize - 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.strokeRect(
    (col - bs) * cellW, (row - bs) * cellH,
    (bs * 2 + 1) * cellW, (bs * 2 + 1) * cellH
  );
  ctx.setLineDash([]);
}

export function drawAnimEdge(
  ctx: CanvasRenderingContext2D,
  edge: Edge,
  nodes: Node[],
  accepted: boolean
) {
  const a = nodes[edge.u];
  const b = nodes[edge.v];
  if (!a || !b) return;
  ctx.save();
  ctx.strokeStyle = accepted ? '#7fff6b' : '#ff4444';
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.85;
  ctx.shadowColor = accepted ? '#7fff6b' : '#ff4444';
  ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.restore();
}
