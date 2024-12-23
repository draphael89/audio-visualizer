import { Object3DNode } from '@react-three/fiber';
import { EffectComposerProps } from '@react-three/postprocessing';
import { BloomProps } from '@react-three/postprocessing/dist/declarations/src/effects/Bloom';
import * as THREE from 'three';

declare module '@react-three/fiber' {
  interface ThreeElements {
    group: Object3DNode<THREE.Group, typeof THREE.Group>;
    mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
    sphereGeometry: Object3DNode<THREE.SphereGeometry, typeof THREE.SphereGeometry>;
    meshStandardMaterial: Object3DNode<THREE.MeshStandardMaterial, typeof THREE.MeshStandardMaterial>;
    ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
    pointLight: Object3DNode<THREE.PointLight, typeof THREE.PointLight>;
    effectComposer: React.PropsWithChildren<EffectComposerProps>;
    bloom: React.PropsWithChildren<BloomProps>;
  }
}

export {};
