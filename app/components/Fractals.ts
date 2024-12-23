import * as THREE from 'three';

interface LSystemState {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  up: THREE.Vector3;
}

interface FractalOptions {
  scale?: number;
  angle?: number;
  iterations?: number;
  audioReactivity?: {
    scaleMultiplier?: number;
    rotationMultiplier?: number;
  };
}

/**
 * Creates a fractal geometry using Lindenmayer System (L-System)
 * @param axiom Initial state of the L-System
 * @param rules Production rules for symbol replacement
 * @param iterations Number of iterations to apply rules
 * @param options Configuration options for the fractal
 * @returns THREE.BufferGeometry
 */
export function createLSystemFractal(
  axiom: string,
  rules: Record<string, string>,
  iterations: number = 4,
  options: FractalOptions = {}
): THREE.BufferGeometry {
  const {
    scale = 1,
    angle = Math.PI / 6,
    audioReactivity = {
      scaleMultiplier: 1,
      rotationMultiplier: 1
    }
  } = options;

  // Generate L-System string
  let current = axiom;
  for (let i = 0; i < iterations; i++) {
    let next = '';
    for (const char of current) {
      next += rules[char] || char;
    }
    current = next;
  }

  // Create geometry
  const points: THREE.Vector3[] = [];
  const stack: LSystemState[] = [];
  let state: LSystemState = {
    position: new THREE.Vector3(),
    direction: new THREE.Vector3(0, 1, 0),
    up: new THREE.Vector3(0, 0, 1)
  };

  // Process L-System string to create geometry
  for (const char of current) {
    switch (char) {
      case 'F': // Move forward and draw
        points.push(state.position.clone());
        state.position.add(
          state.direction.clone().multiplyScalar(scale * (audioReactivity?.scaleMultiplier ?? 1))
        );
        points.push(state.position.clone());
        break;
      case '+': // Rotate right
        state.direction.applyAxisAngle(
          state.up,
          -angle * (audioReactivity?.rotationMultiplier ?? 1)
        );
        break;
      case '-': // Rotate left
        state.direction.applyAxisAngle(
          state.up,
          angle * (audioReactivity?.rotationMultiplier ?? 1)
        );
        break;
      case '[': // Push state
        stack.push({
          position: state.position.clone(),
          direction: state.direction.clone(),
          up: state.up.clone()
        });
        break;
      case ']': // Pop state
        const prevState = stack.pop();
        if (prevState) {
          state = prevState;
        }
        break;
    }
  }

  // Create buffer geometry
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(points.length * 3);

  points.forEach((point, i) => {
    positions[i * 3] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;
  });

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geometry;
}

/**
 * Creates predefined fractal patterns
 */
export const FractalPresets = {
  DragonCurve: {
    axiom: 'FX',
    rules: {
      X: 'X+YF+',
      Y: '-FX-Y'
    },
    options: {
      angle: Math.PI / 2,
      scale: 0.5
    }
  },
  KochCurve: {
    axiom: 'F',
    rules: {
      F: 'F+F-F-F+F'
    },
    options: {
      angle: Math.PI / 2,
      scale: 0.3
    }
  },
  SierpinskiTriangle: {
    axiom: 'F-G-G',
    rules: {
      F: 'F-G+F+G-F',
      G: 'GG'
    },
    options: {
      angle: (2 * Math.PI) / 3,
      scale: 0.5
    }
  },
  TreeFractal: {
    axiom: 'F',
    rules: {
      F: 'FF+[+F-F-F]-[-F+F+F]'
    },
    options: {
      angle: Math.PI / 8,
      scale: 0.4
    }
  }
};
