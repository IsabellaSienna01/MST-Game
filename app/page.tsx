'use client';

import dynamic from 'next/dynamic';
import MobileBlocker from '@/components/MobileBlocker';

const GameCanvas = dynamic(
  () => import('@/components/canvas/GameCanvas'),
  { ssr: false }
);

export default function Home() {
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
        </header>

        <main className="flex-1 overflow-hidden">
          <GameCanvas />
        </main>
      </div>
    </MobileBlocker>
  );
}