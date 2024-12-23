"use client";
import { useEffect, useRef } from 'react';

export function FPSStats() {
  const fpsRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    const updateFPS = () => {
      const now = performance.now();
      framesRef.current++;

      if (now >= lastTimeRef.current + 1000) {
        if (fpsRef.current) {
          fpsRef.current.textContent = `FPS: ${framesRef.current}`;
        }
        framesRef.current = 0;
        lastTimeRef.current = now;
      }
      requestAnimationFrame(updateFPS);
    };

    requestAnimationFrame(updateFPS);
  }, []);

  return (
    <div
      ref={fpsRef}
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '14px'
      }}
    >
      FPS: --
    </div>
  );
} 