export interface VisualPreset {
  particleCount: number;
  bloomStrength: number;
  particleSize: number;
  rotationSpeed: number;
  colorPalette: number[];
  geometryType?: 'flower' | 'metatron' | 'spiral' | 'default' | 'fractal';
  geometryScale?: number;
  geometryRotation?: number;
  pulseIntensity?: number;
  reducedMotion?: boolean;
  performanceMode?: boolean;
  fractalOptions?: {
    type: 'dragon' | 'koch' | 'sierpinski' | 'tree';
    iterations?: number;
    scale?: number;
    angle?: number;
  };
}

export const PRESETS: Record<string, VisualPreset> = {
  default: {
    particleCount: 24000,
    reducedMotion: false,
    performanceMode: false,
    bloomStrength: 1.5,
    particleSize: 0.03,
    rotationSpeed: 0.001,
    colorPalette: [0x4444ff, 0xff4444, 0x44ff44]
  },
  cosmic: {
    particleCount: 40000,
    reducedMotion: false,
    performanceMode: false,
    bloomStrength: 2.0,
    particleSize: 0.02,
    rotationSpeed: 0.002,
    colorPalette: [0xff00ff, 0x00ffff, 0xffff00]
  },
  vortex: {
    particleCount: 30000,
    reducedMotion: false,
    performanceMode: false,
    bloomStrength: 1.8,
    particleSize: 0.025,
    rotationSpeed: 0.003,
    colorPalette: [0xff8800, 0x0088ff, 0xff0088]
  },
  sacredFlower: {
    particleCount: 45000,
    bloomStrength: 2.2,
    particleSize: 0.035,
    rotationSpeed: 0.0018,
    colorPalette: [0xffd700, 0x9932cc, 0x00ffff], // Gold, Purple, Cyan
    geometryType: 'flower',
    geometryScale: 1.618, // Golden ratio
    geometryRotation: 0.001,
    pulseIntensity: 0.8
  },
  metatron: {
    particleCount: 50000,
    bloomStrength: 2.5,
    particleSize: 0.03,
    rotationSpeed: 0.002,
    colorPalette: [0xff1493, 0x4169e1, 0x32cd32], // Deep Pink, Royal Blue, Lime Green
    geometryType: 'metatron',
    geometryScale: 1.2,
    geometryRotation: 0.0015,
    pulseIntensity: 1.0
  },
  psychedelic: {
    particleCount: 60000,
    bloomStrength: 2.8,
    particleSize: 0.04,
    rotationSpeed: 0.003,
    colorPalette: [0xff66cc, 0x66ffcc, 0xcc66ff], // Bright pink, aqua, purple
    geometryType: 'spiral',
    geometryScale: 1.618,
    geometryRotation: 0.002,
    pulseIntensity: 1.2
  },
  fractalDragon: {
    particleCount: 55000,
    bloomStrength: 2.6,
    particleSize: 0.035,
    rotationSpeed: 0.0025,
    colorPalette: [0xff3366, 0x33ff66, 0x6633ff],
    geometryType: 'fractal',
    geometryScale: 1.5,
    geometryRotation: 0.002,
    pulseIntensity: 1.1,
    fractalOptions: {
      type: 'dragon',
      iterations: 12,
      scale: 0.5,
      angle: Math.PI / 2
    }
  }
};             