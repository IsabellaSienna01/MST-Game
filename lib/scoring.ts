import { MAX_SCORE, SCORE_THRESHOLDS } from './constants';
import type { GameResult } from '@/types';

export function calculateScore(playerCost: number, mstCost: number, nodeCount: number): GameResult {
  const ratio = playerCost / mstCost;

  let score: number;
  let grade: string;

  if (ratio <= SCORE_THRESHOLDS.perfect) {
    score = MAX_SCORE;
    grade = 'S';
  } else if (ratio <= SCORE_THRESHOLDS.great) {
    score = Math.round(MAX_SCORE * 0.9 + (MAX_SCORE * 0.1) * (1 - (ratio - 1) / (SCORE_THRESHOLDS.great - 1)));
    grade = 'A';
  } else if (ratio <= SCORE_THRESHOLDS.good) {
    score = Math.round(MAX_SCORE * 0.7 + (MAX_SCORE * 0.2) * (1 - (ratio - SCORE_THRESHOLDS.great) / (SCORE_THRESHOLDS.good - SCORE_THRESHOLDS.great)));
    grade = 'B';
  } else if (ratio <= SCORE_THRESHOLDS.ok) {
    score = Math.round(MAX_SCORE * 0.4 + (MAX_SCORE * 0.3) * (1 - (ratio - SCORE_THRESHOLDS.good) / (SCORE_THRESHOLDS.ok - SCORE_THRESHOLDS.good)));
    grade = 'C';
  } else if (ratio <= SCORE_THRESHOLDS.bad) {
    score = Math.round(MAX_SCORE * 0.1 + (MAX_SCORE * 0.3) * (1 - (ratio - SCORE_THRESHOLDS.ok) / (SCORE_THRESHOLDS.bad - SCORE_THRESHOLDS.ok)));
    grade = 'D';
  } else {
    score = Math.max(0, Math.round(MAX_SCORE * 0.1 * (1 - (ratio - SCORE_THRESHOLDS.bad) / 2)));
    grade = 'F';
  }

  return {
    playerCost,
    mstCost,
    score: Math.max(0, score),
    maxScore: MAX_SCORE,
    grade,
    isSpanningTree: true,
    missingConnections: false,
  };
}

export function gradeColor(grade: string): string {
  switch (grade) {
    case 'S': return '#ffd700';
    case 'A': return '#00ff88';
    case 'B': return '#00d4ff';
    case 'C': return '#ff9f43';
    case 'D': return '#ff6b6b';
    case 'F': return '#888888';
    default: return '#ffffff';
  }
}

export function gradeMessage(grade: string): string {
  switch (grade) {
    case 'S': return 'Perfect! You found the MST!';
    case 'A': return 'Excellent work! Near-optimal solution.';
    case 'B': return 'Good job! A solid spanning tree.';
    case 'C': return 'Not bad, but there\'s room to improve.';
    case 'D': return 'You can do better — try again!';
    case 'F': return 'Far from optimal. Study the MST!';
    default: return '';
  }
}
