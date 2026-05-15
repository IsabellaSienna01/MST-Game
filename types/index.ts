export type TerrainType = 'plains' | 'forest' | 'mud' | 'lake';
export type AppMode = 'sandbox' | 'game';
export type Algorithm = 'prim' | 'kruskal';
export type GamePhase = 'building' | 'submitted';

export interface Node {
  id: number;
  x: number;
  y: number;
}

export interface Edge {
  u: number;
  v: number;
  weight: number;
}

export interface TerrainConfig {
  type: TerrainType;
  multiplier: number;
  color: string;
  colorBright: string;
  label: string;
}

export interface GameResult {
  playerCost: number;
  mstCost: number;
  score: number;
  maxScore: number;
  grade: string;
  isSpanningTree: boolean;
  missingConnections: boolean;
}

export interface SandboxState {
  algorithm: Algorithm;
  mstEdges: Edge[];
  primCost: number | null;
  kruskalCost: number | null;
}

export interface GameState {
  phase: GamePhase;
  playerEdges: Edge[];
  selectedNode: number | null;
  result: GameResult | null;
  seed: number;
}

export interface AnimationStep {
  type: string;
  edges: Edge[];
  tried?: Edge;
  accepted?: boolean;
  activeNode?: number;
  desc: string;
}
