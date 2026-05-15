import type { TerrainConfig, TerrainType } from '@/types';

export const COLS = 80;
export const ROWS = 45;
export const SAMPLE_COUNT = 20;

export const TERRAIN_CONFIG: Record<TerrainType, TerrainConfig> = {
  plains: {
    type: 'plains',
    multiplier: 1.0,
    color: '#4a7a2c',
    colorBright: '#5a8a3c',
    label: 'Plains',
  },
  forest: {
    type: 'forest',
    multiplier: 2.5,
    color: '#2d5a1e',
    colorBright: '#3d6a2e',
    label: 'Forest',
  },
  mud: {
    type: 'mud',
    multiplier: 4.0,
    color: '#5a3c18',
    colorBright: '#7a5c3a',
    label: 'Mud',
  },
  lake: {
    type: 'lake',
    multiplier: 10.0,
    color: '#0f4f8f',
    colorBright: '#1a5fa0',
    label: 'Lake',
  },
};

export const TERRAIN_ORDER: TerrainType[] = ['plains', 'forest', 'mud', 'lake'];

export const TERRAIN_ID_MAP: TerrainType[] = ['plains', 'forest', 'mud', 'lake'];

export const EDGE_COLORS_BY_TERRAIN: Record<TerrainType, string> = {
  plains: '#6aff6a',
  forest: '#a0ff60',
  mud: '#ffcc44',
  lake: '#ff4488',
};

export const SCORE_THRESHOLDS = {
  perfect: 1.0,
  great: 1.05,
  good: 1.15,
  ok: 1.3,
  bad: 1.5,
};

export const MAX_SCORE = 1000;
