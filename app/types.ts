export interface VisualPreset {
  particleCount: number;
  bloomStrength: number;
  particleSize: number;
  rotationSpeed: number;
  colorPalette: number[];
}

export const PRESETS: Record<string, VisualPreset> = {
  default: {
    particleCount: 24000,
    bloomStrength: 1.5,
    particleSize: 0.03,
    rotationSpeed: 0.001,
    colorPalette: [0x4444ff, 0xff4444, 0x44ff44]
  },
  cosmic: {
    particleCount: 40000,
    bloomStrength: 2.0,
    particleSize: 0.02,
    rotationSpeed: 0.002,
    colorPalette: [0xff00ff, 0x00ffff, 0xffff00]
  },
  vortex: {
    particleCount: 30000,
    bloomStrength: 1.8,
    particleSize: 0.025,
    rotationSpeed: 0.003,
    colorPalette: [0xff8800, 0x0088ff, 0xff0088]
  }
}; 