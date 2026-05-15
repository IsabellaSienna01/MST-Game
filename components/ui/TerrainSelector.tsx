'use client';
import { TERRAIN_CONFIG, TERRAIN_ORDER } from '@/lib/constants';
import type { TerrainType } from '@/types';
import Button from './Button';

interface TerrainSelectorProps {
  selected: TerrainType;
  onChange: (t: TerrainType) => void;
}

export default function TerrainSelector({ selected, onChange }: TerrainSelectorProps) {
  return (
    <div className="flex flex-col gap-1">
      {TERRAIN_ORDER.map(t => {
        const cfg = TERRAIN_CONFIG[t];
        return (
          <Button
            key={t}
            onClick={() => onChange(t)}
            active={selected === t}
          >
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ background: cfg.colorBright }}
            />
            <span>{cfg.label}</span>
            <span className="ml-auto text-[10px]">x{cfg.multiplier.toFixed(1)}</span>
          </Button>
        );
      })}
    </div>
  );
}
