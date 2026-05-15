'use client';
import { useEffect, useState, useCallback } from 'react';
import { COLS, ROWS } from '@/lib/constants';

export interface CanvasSize {
  width: number;
  height: number;
  cellW: number;
  cellH: number;
}

export function useCanvasSize(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0, cellW: 0, cellH: 0 });

  const update = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth: w, clientHeight: h } = containerRef.current;
    setSize({ width: w, height: h, cellW: w / COLS, cellH: h / ROWS });
  }, [containerRef]);

  useEffect(() => {
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [update, containerRef]);

  return size;
}
