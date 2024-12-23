export interface FrequencyBands {
  subBass: number;    // 20-60Hz
  bass: number;       // 60-250Hz
  lowerMid: number;   // 250-500Hz
  mid: number;        // 500-2kHz
  upperMid: number;   // 2-4kHz
  presence: number;   // 4-6kHz
  brilliance: number; // 6-20kHz
}

export interface VisualPreset {
  // Core settings
  particleCount: number;
  bloomStrength: number;
  particleSize: number;
  rotationSpeed: number;
  colorPalette: number[];
  
  // Geometry settings
  geometryType?: 'flower' | 'metatron' | 'spiral' | 'default' | 'fractal' | 'mergedSacred' | 'hyperbolic';
  geometryScale?: number;
  geometryRotation?: number;
  pulseIntensity?: number;
  
  // Merged geometry configuration
  mergedGeometryConfig?: {
    primary?: 'flower' | 'metatron' | 'spiral';
    secondary?: 'flower' | 'metatron' | 'spiral';
    blendFactor?: number;
    layerOffset?: number;
  };
  
  // Fractal settings
  fractalOptions?: {
    type?: 'dragon' | 'koch' | 'sierpinski' | 'tree';
    iterations?: number;
    scale?: number;
    angle?: number;
  };
  
  // Camera and motion
  cameraSpeed?: number;
  
  // Post-processing effects
  chromaticAberration?: number;
  volumetricIntensity?: number;
  
  // Performance and accessibility
  reducedMotion?: boolean;
  performanceMode?: boolean;
  highContrast?: boolean;
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
  },
  mergedSacred: {
    particleCount: 65000,
    bloomStrength: 2.8,
    particleSize: 0.035,
    rotationSpeed: 0.002,
    colorPalette: [0x9400d3, 0x4b0082, 0x0000ff], // Deep Purple, Indigo, Blue
    geometryType: 'mergedSacred',
    geometryScale: 1.5,
    geometryRotation: 0.0015,
    pulseIntensity: 1.2,
    mergedGeometryConfig: {
      primary: 'metatron',
      secondary: 'flower',
      blendFactor: 0.6,
      layerOffset: 0.5
    }
  },
  hyperbolicWeb: {
    particleCount: 70000,
    bloomStrength: 3.0,
    particleSize: 0.03,
    rotationSpeed: 0.0025,
    colorPalette: [0x00ff00, 0x00ffff, 0xff00ff], // Green, Cyan, Magenta
    geometryType: 'hyperbolic',
    geometryScale: 1.8,
    geometryRotation: 0.002,
    pulseIntensity: 1.4
  }
};                               