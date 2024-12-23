import * as THREE from 'three';

interface HyperbolicPoint {
  x: number;
  y: number;
  z: number;
}

// Convert Poincaré disk coordinates to 3D coordinates
const poincareToEuclidean = (x: number, y: number): HyperbolicPoint => {
  const denom = 1 + x * x + y * y;
  return {
    x: (2 * x) / denom,
    y: (2 * y) / denom,
    z: (-1 + x * x + y * y) / denom
  };
};

// Generate hyperbolic tessellation points
const generateHyperbolicPoints = (depth: number, scale: number = 1): HyperbolicPoint[] => {
  const points: HyperbolicPoint[] = [];
  const q = 7; // Number of edges in the fundamental polygon
  // Each vertex connects 3 polygons in hyperbolic space
  for (let d = 0; d < depth; d++) {
    const r = Math.tanh(d * 0.5) * scale;
    const numPoints = Math.floor(2 * Math.PI * r * q);
    
    for (let i = 0; i < numPoints; i++) {
      const theta = (2 * Math.PI * i) / numPoints;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      const point = poincareToEuclidean(x, y);
      points.push(point);
    }
  }

  return points;
};

// Create hyperbolic tiling geometry
export const createHyperbolicTiling = (depth: number = 6, scale: number = 10): THREE.BufferGeometry => {
  const geometry = new THREE.BufferGeometry();
  const points = generateHyperbolicPoints(depth, scale);
  const positions: number[] = [];
  const indices: number[] = [];

  // Convert points to positions array
  points.forEach(point => {
    positions.push(point.x * scale, point.y * scale, point.z * scale);
  });

  // Create connections between points
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const p1 = points[i];
      const p2 = points[j];
      const dist = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + 
        Math.pow(p2.y - p1.y, 2) + 
        Math.pow(p2.z - p1.z, 2)
      );

      // Connect points that are close enough
      if (dist < 0.5) {
        indices.push(i, j);
      }
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  return geometry;
};

// Merge multiple geometries with offset
export const mergeGeometries = (
  geometries: THREE.BufferGeometry[],
  offsets: THREE.Vector3[]
): THREE.BufferGeometry => {
  const mergedGeometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];
  let vertexOffset = 0;

  geometries.forEach((geometry, index) => {
    const offset = offsets[index];
    const positionAttribute = geometry.getAttribute('position');
    const indexAttribute = geometry.getIndex();

    // Add positions with offset
    for (let i = 0; i < positionAttribute.count; i++) {
      positions.push(
        positionAttribute.getX(i) + offset.x,
        positionAttribute.getY(i) + offset.y,
        positionAttribute.getZ(i) + offset.z
      );
    }

    // Add indices with offset
    if (indexAttribute) {
      for (let i = 0; i < indexAttribute.count; i++) {
        indices.push(indexAttribute.getX(i) + vertexOffset);
      }
    }

    vertexOffset += positionAttribute.count;
  });

  mergedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  mergedGeometry.setIndex(indices);
  return mergedGeometry;
};
