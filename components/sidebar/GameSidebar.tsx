'use client';
import Panel from '@/components/ui/Panel';
import Button from '@/components/ui/Button';
import MetricCard from '@/components/ui/MetricCard';
import { gradeColor, gradeMessage } from '@/lib/scoring';
import { TERRAIN_CONFIG, TERRAIN_ORDER } from '@/lib/constants';
import type { GamePhase, GameResult, Edge } from '@/types';

interface GameSidebarProps {
  phase: GamePhase;
  playerEdges: Edge[];
  nodeCount: number;
  canSubmit: boolean;
  result: GameResult | null;
  showMST: boolean;
  hasCycle: boolean;
  disconnected: boolean;
  onNewGame: () => void;
  onSubmit: () => void;
  onShowMST: (v: boolean) => void;
  onRemoveEdge: (u: number, v: number) => void;
}

export default function GameSidebar({
  phase, playerEdges, nodeCount, canSubmit, result, showMST,
  hasCycle, disconnected,
  onNewGame, onSubmit, onShowMST, onRemoveEdge,
}: GameSidebarProps) {
  const playerCost = playerEdges.reduce((s, e) => s + e.weight, 0);

  return (
    <div className="w-52.5 bg-surface flex flex-col overflow-y-auto shrink-0 no-scrollbar .no-scrollbar::-webkit-scrollbar">

      <Panel title="Game">
        <div className="flex flex-col gap-1">
          <Button fullWidth onClick={() => onNewGame()}>
            New Map
          </Button>
          {phase === 'building' && (
            <Button
              fullWidth
              active={canSubmit}
              disabled={!canSubmit}
              onClick={onSubmit}
            >
              Submit Tree
            </Button>
          )}
          {phase === 'submitted' && (
            <Button fullWidth onClick={() => onNewGame()}>
              Play Again
            </Button>
          )}
        </div>
      </Panel>

      {phase === 'building' && (
        <Panel title="How to play">
          <div className="text-[10px] text-text-dim leading-relaxed">
            <p className="mb-1">Connect all vertices with a <span className="text-bright">Spanning Tree</span>.</p>
            <p className="mb-1"><span className="text-text">Click a vertex</span> to select it, then <span className="text-text">click another</span> to connect.</p>
            <p className="mb-1">Click the same edge again to <span className="text-text">remove it</span>.</p>
            <p>Score is based on how close your cost is to the <span className="text-accent">optimal MST</span>.</p>
          </div>
        </Panel>
      )}

      <Panel title="Terrain Cost">
        <div className="flex flex-col gap-1">
          {TERRAIN_ORDER.map(t => {
                  const cfg = TERRAIN_CONFIG[t];
                  return (
                    <div key={t} className="flex items-center justify-between border border-gray-700 rounded-lg px-2 py-1 text-[10px]">                      <span className="text-text">{cfg.label}</span>
                      <span className="ml-auto text-[10px]" style={{ color: cfg.colorBright }} >x{cfg.multiplier.toFixed(1)}</span>
                    </div>
                  );
                })}
        </div>
      </Panel>

      {phase === 'building' && (
        <>
          <Panel title="Your Tree">
            <MetricCard label="Edges Placed" value={`${playerEdges.length} / ${Math.max(0, nodeCount - 1)}`} color="orange" />
            <MetricCard label="Current Cost" value={playerEdges.length > 0 ? playerCost.toFixed(1) : '—'} color="accent" />
            {hasCycle && <p className="text-[10px] text-red-400 mt-1">Cycle detected!</p>}
            {disconnected && !hasCycle && playerEdges.length === nodeCount - 1 && (
              <p className="text-[10px] text-yellow-400 mt-1">Not all connected</p>
            )}
            {canSubmit && <p className="text-[10px] text-green-400 mt-1">✓ Valid spanning tree!</p>}
          </Panel>

          <Panel title="Edge List">
            <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
              {playerEdges.length === 0 && (
                <p className="text-[10px] text-text-dim">No edges yet</p>
              )}
              {playerEdges.map((e, i) => (
                <div key={i} className="flex items-center justify-between bg-surface2 border border-border rounded px-1.5 py-0.5 text-[10px]">
                  <span className="text-text">{e.u} ↔ {e.v}</span>
                  <span className="text-text-dim mr-1">{e.weight.toFixed(0)}</span>
                  <button
                    onClick={() => onRemoveEdge(e.u, e.v)}
                    className="text-red-400 hover:text-red-300 leading-none"
                  >✕</button>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}

      {phase === 'submitted' && result && (
        <>
          <Panel title="Result">
            <div className="text-center py-2">
              <p
                className="text-5xl font-bold mb-1"
                style={{ color: gradeColor(result.grade) }}
              >
                {result.grade}
              </p>
              <p className="text-[11px] text-text-dim leading-snug">
                {gradeMessage(result.grade)}
              </p>
            </div>
            <MetricCard label="Score" value={`${result.score} / ${result.maxScore}`} color="yellow" />
            <MetricCard label="Your Cost" value={result.playerCost.toFixed(1)} color="orange" />
            <MetricCard label="Optimal (MST)" value={result.mstCost.toFixed(1)} color="green" />
            <div className="bg-surface2 border border-border rounded p-2 mt-1">
              <p className="text-[10px] text-text-dim uppercase">Efficiency</p>
              <p className="text-sm font-bold text-bright">
                {((result.mstCost / result.playerCost) * 100).toFixed(1)}%
              </p>
            </div>
          </Panel>

          <Panel title="Compare">
            <div className="flex flex-col gap-1">
              <Button fullWidth active={showMST} onClick={() => onShowMST(!showMST)}>
                {showMST ? 'Hide MST' : 'Show Optimal MST'}
              </Button>
              <p className="text-[10px] text-text-dim">
                {showMST ? 'Blue = Optimal MST' : 'Toggle to see the optimal solution'}
              </p>
            </div>
          </Panel>
        </>
      )}

      <Panel title="Help">
        <div className="text-[10px] text-text-dim leading-relaxed">
          <p><span className="text-text">Click vertex</span> - select</p>
          <p><span className="text-text">Click another</span> - connect</p>
          <p><span className="text-text">Click same edge</span> - remove</p>
          <p className="mt-1">Need exactly <span className="text-bright">n-1 edges</span>, no cycles</p>
        </div>
      </Panel>

    </div>
  );
}
