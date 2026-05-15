'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { AppMode } from '@/types';
import MobileBlocker from '@/components/MobileBlocker';
import Button from '@/components/ui/Button';

const SandboxCanvas = dynamic(
  () => import('@/components/canvas/SandboxCanvas'),
  { ssr: false }
);

const GameCanvas = dynamic(
  () => import('@/components/canvas/GameCanvas'),
  { ssr: false }
);

export default function Home() {
  const [mode, setMode] = useState<AppMode>('game');

  return (
    <MobileBlocker>

      <div className="flex h-screen flex-col bg-background">
        <header className="flex shrink-0 items-center gap-4 px-4 py-1.5">
          <h1 className="m-0 font-mono text-[15px] font-bold uppercase tracking-[2px]">
            Terranet
          </h1>

          <span className="font-light text-[11px]">
            MST Simulator
          </span>

          <div className="ml-auto flex gap-1">
            {(['game', 'sandbox'] as AppMode[]).map((m) => {
              const isActive = mode === m;

              return (
                <Button
                  key={m}
                  onClick={() => setMode(m)}
                  active={isActive}
                >
                  {m === 'game' ? 'Game Mode' : 'Sandbox Mode'}
                </Button>
              );
            })}
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {mode === 'sandbox' ? <SandboxCanvas /> : <GameCanvas />}
        </main>
      </div>
    </MobileBlocker>
  );
}