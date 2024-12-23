"use client";
import { useEffect, useRef } from 'react';

export function FPSStats() {
  const fpsRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let lowFPSCount = 0;
    const FPS_THRESHOLD = 50;
    const LOW_FPS_THRESHOLD_COUNT = 10;
    
    const updateFPS = () => {
      const now = performance.now();
      framesRef.current++;

      if (now >= lastTimeRef.current + 1000) {
        const currentFPS = framesRef.current;
        if (fpsRef.current) {
          fpsRef.current.textContent = `FPS: ${currentFPS}`;
        }
        
        // Track low FPS occurrences
        if (currentFPS < FPS_THRESHOLD) {
          lowFPSCount++;
          if (lowFPSCount >= LOW_FPS_THRESHOLD_COUNT) {
            window.dispatchEvent(new CustomEvent('performance-degradation', {
              detail: { fps: currentFPS }
            }));
            lowFPSCount = 0;
          }
        } else {
          lowFPSCount = Math.max(0, lowFPSCount - 1);
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