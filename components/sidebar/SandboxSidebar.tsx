'use client';
import { useState } from 'react';
import Panel from '@/components/ui/Panel';
import Button from '@/components/ui/Button';
import TerrainSelector from '@/components/ui/TerrainSelector';
import Slider from '@/components/ui/Slider';
import MetricCard from '@/components/ui/MetricCard';
import type { TerrainType, Algorithm, AnimationStep } from '@/types';

interface SandboxSidebarProps {
  selectedTerrain: TerrainType;
  brushSize: number;
  algorithm: Algorithm;
  nodeCount: number;
  edgeCount: number;
  primCost: number | null;
  kruskalCost: number | null;
  mstCost: number;
  animSteps: AnimationStep[];
  animIdx: number;
  isAnimating: boolean;
  onTerrainChange: (t: TerrainType) => void;
  onBrushSizeChange: (v: number) => void;
  onAlgorithmChange: (a: Algorithm) => void;
  onClearNodes: () => void;
  onClearTerrain: () => void;
  onStartAnimation: (speed: number) => void;
  onStopAnimation: () => void;
}

export default function SandboxSidebar({
  selectedTerrain, brushSize, algorithm,
  nodeCount, edgeCount, primCost, kruskalCost, mstCost,
  animSteps, animIdx, isAnimating,
  onTerrainChange, onBrushSizeChange, onAlgorithmChange,
  onClearNodes, onClearTerrain,
  onStartAnimation, onStopAnimation,
}: SandboxSidebarProps) {
  const [animSpeed, setAnimSpeed] = useState(5);

  const currentStep = animSteps[Math.min(animIdx, animSteps.length - 1)];
  const progress = animSteps.length > 0 ? ((animIdx) / animSteps.length) * 100 : 0;

  return (
    <div className="w-52.5 flex flex-col overflow-y-auto shrink-0 no-scrollbar .no-scrollbar::-webkit-scrollbar">

      <Panel title="Terrain">
        <TerrainSelector selected={selectedTerrain} onChange={onTerrainChange} />
        <div className="mt-2">
          <Slider label="Brush Size" min={1} max={8} value={brushSize} onChange={onBrushSizeChange} />
        </div>
      </Panel>

      <Panel title="Actions">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] mb-0.5">Right-click to place vertices</p>
          <Button variant="danger" fullWidth onClick={onClearNodes}>🗑 Clear Vertices</Button>
          <Button variant="danger" fullWidth onClick={onClearTerrain}>🗑 Clear Terrain</Button>
        </div>
      </Panel>

      <Panel title="Algorithm">
        <div className="flex flex-col gap-1">
          <Button active={algorithm === 'prim'} fullWidth onClick={() => onAlgorithmChange('prim')}>
            <span>▶ Prim-Jarník</span>
            <span className="ml-auto text-[9px]">O(E·logV)</span>
          </Button>
          <Button active={algorithm === 'kruskal'} fullWidth onClick={() => onAlgorithmChange('kruskal')}>
            <span>▶ Kruskal DSU</span>
            <span className="ml-auto text-[9px]">O(E·logE)</span>
          </Button>
        </div>
      </Panel>

      <Panel title="Results">
        <div className="flex gap-1 mb-2">
          <div className={`flex-1 border border-gray-700 rounded-lg p-1.5 text-center ${algorithm === 'prim' ? 'border-accent' : 'border-border'}`}>
            <p className="text-[9px] uppercase">Prim</p>
            <p className={`text-sm font-bold ${algorithm === 'prim' ? 'text-accent' : 'text-bright'}`}>
              {primCost !== null ? primCost.toFixed(1) : '-'}
            </p>
          </div>
          <div className={`flex-1 border border-gray-700 rounded-lg p-1.5 text-center ${algorithm === 'kruskal' ? 'border-accent' : 'border-border'}`}>
            <p className="text-[9px] uppercase">Kruskal</p>
            <p className={`text-sm font-bold ${algorithm === 'kruskal' ? 'text-accent' : 'text-bright'}`}>
              {kruskalCost !== null ? kruskalCost.toFixed(1) : '-'}
            </p>
          </div>
        </div>
        <MetricCard label="Vertices" value={nodeCount} color="orange" />
        <MetricCard label="MST Edges" value={edgeCount} color="green" />
        <MetricCard label="MST Cost" value={nodeCount >= 2 ? mstCost.toFixed(1) : '-'} color="accent" />
        {primCost !== null && kruskalCost !== null && (
          <p className={`text-[10px] mt-1 ${Math.abs(primCost - kruskalCost) < 0.5 ? 'text-green-400' : 'text-yellow-400'}`}>
            {Math.abs(primCost - kruskalCost) < 0.5 ? 'Both match' : 'Mismatch'}
          </p>
        )}
      </Panel>

      <Panel title="Animate">
        <div className="flex flex-col gap-1.5">
          {!isAnimating ? (
            <Button fullWidth onClick={() => onStartAnimation(animSpeed)} disabled={nodeCount < 2}>
              ▶ Run Step-by-Step
            </Button>
          ) : (
            <Button fullWidth variant="danger" onClick={onStopAnimation}>⏹ Stop</Button>
          )}
          <div className="h-1 bg-surface3 rounded overflow-hidden">
            <div className="h-full bg-accent rounded transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] min-h-8 leading-[1.4]">
            {currentStep ? `[${animIdx}/${animSteps.length}] ${currentStep.desc}` : 'Place 2+ vertices to animate'}
          </p>
          <Slider label="Speed" min={1} max={10} value={animSpeed} onChange={setAnimSpeed} />
        </div>
      </Panel>

      <Panel title="Help">
        <div className="text-[10px] leading-relaxed">
          <p><span className="text-text font-semibold">Left Drag</span> - paint terrain</p>
          <p><span className="text-text font-semibold">Right Click</span> - place vertex</p>
          <p><span className="text-text font-semibold">Hover</span> (node mode) - ghost MST</p>
          <p className="mt-1 text-[9px]">N=20 linear samples per edge</p>
        </div>
      </Panel>
    </div>
  );
}
