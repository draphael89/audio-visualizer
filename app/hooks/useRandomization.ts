'use client';

import { useCallback, useRef } from 'react';
import { RandomizationSettings } from '../types';

// Mulberry32 is a simple but high-quality 32-bit generator
const mulberry32 = (seed: number) => {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

export const useRandomization = (settings: RandomizationSettings) => {
  const rngRef = useRef(mulberry32(settings.randomSeed));

  const getRandomValue = useCallback((min: number, max: number) => {
    return min + (rngRef.current() * (max - min));
  }, []);

  const getRandomColor = useCallback((baseColor: number) => {
    if (!settings.enableColorRandomization) return baseColor;
    
    // Convert to RGB
    const r = (baseColor >> 16) & 255;
    const g = (baseColor >> 8) & 255;
    const b = baseColor & 255;
    
    // Apply controlled variation
    const variation = settings.intensityFactor * 30;
    const newR = Math.max(0, Math.min(255, r + getRandomValue(-variation, variation)));
    const newG = Math.max(0, Math.min(255, g + getRandomValue(-variation, variation)));
    const newB = Math.max(0, Math.min(255, b + getRandomValue(-variation, variation)));
    
    return (newR << 16) | (newG << 8) | newB;
  }, [settings.enableColorRandomization, settings.intensityFactor, getRandomValue]);

  const getRandomPosition = useCallback((basePosition: [number, number, number], maxOffset: number) => {
    if (!settings.enableParticleRandomization) return basePosition;
    
    const offset = maxOffset * settings.intensityFactor;
    return basePosition.map(coord => 
      coord + getRandomValue(-offset, offset)
    ) as [number, number, number];
  }, [settings.enableParticleRandomization, settings.intensityFactor, getRandomValue]);

  const getRandomGeometry = useCallback((baseScale: number) => {
    if (!settings.enableGeometryRandomization) return baseScale;
    
    const variation = 0.2 * settings.intensityFactor;
    return baseScale * (1 + getRandomValue(-variation, variation));
  }, [settings.enableGeometryRandomization, settings.intensityFactor, getRandomValue]);

  return {
    getRandomValue,
    getRandomColor,
    getRandomPosition,
    getRandomGeometry
  };
};
