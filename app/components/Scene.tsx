import React, { useRef, useEffect, useState } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ReactNode } from 'react';

type TouchEventHandler = (event: TouchEvent) => void;
type DomElement = HTMLElement & { style: CSSStyleDeclaration };

extend({
  mesh: THREE.Mesh,
  sphereGeometry: THREE.SphereGeometry,
  meshStandardMaterial: THREE.MeshStandardMaterial,
  ambientLight: THREE.AmbientLight,
  pointLight: THREE.PointLight,
  group: THREE.Group
});

// Add touch feedback state
const MIN_TOUCH_TARGET = 44; // minimum touch target size in pixels

interface ThreeElements {
  group: { ref?: React.Ref<THREE.Group>; children?: ReactNode };
  mesh: { ref?: React.Ref<THREE.Mesh>; scale?: number | [x: number, y: number, z: number]; children?: ReactNode };
  sphereGeometry: { args?: [radius?: number, widthSegments?: number, heightSegments?: number] };
  meshStandardMaterial: { color?: THREE.ColorRepresentation };
  ambientLight: { intensity?: number };
  pointLight: { position?: [x: number, y: number, z: number]; intensity?: number };
}

extend({ OrbitControls });

declare module '@react-three/fiber' {
  interface ThreeElements extends ThreeElements {}
}

export function Scene() {
  useFrame(() => {
    // Animation logic here
  });

  const [isTouching, setIsTouching] = useState(false);
  const orbitControlsRef = useRef<THREE.OrbitControls>(null);

  useEffect(() => {
    const controls = orbitControlsRef.current;
    if (!controls) return;

    const handleTouchStart: TouchEventHandler = (event) => {
      setIsTouching(true);
      performance.mark('touch-start');

      // Ensure touch targets are large enough
      const touch = event.touches[0];
      if (touch) {
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.width < MIN_TOUCH_TARGET || rect.height < MIN_TOUCH_TARGET) {
            console.warn('Touch target size is smaller than recommended 44px');
          }
        }
      }
    };

    const handleTouchEnd = () => {
      setIsTouching(false);
      performance.mark('touch-end');
      performance.measure('touch-interaction', 'touch-start', 'touch-end');
      
      // Log performance metrics
      const measurements = performance.getEntriesByName('touch-interaction');
      const lastMeasurement = measurements[measurements.length - 1];
      if (lastMeasurement && lastMeasurement.duration > 100) {
        console.warn('Touch interaction took longer than 100ms:', lastMeasurement.duration);
      }
    };

    const element = controls.domElement as DomElement;
    if (element) {
      element.style.touchAction = 'none';
      element.addEventListener('touchstart', handleTouchStart as EventListener);
      element.addEventListener('touchend', handleTouchEnd as EventListener);
    }

    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart as EventListener);
        element.removeEventListener('touchend', handleTouchEnd as EventListener);
      }
    };
  }, []);

  return (
    <>
      <OrbitControls
        ref={orbitControlsRef}
        minDistance={2}
        maxDistance={20}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN
        }}
        makeDefault
      />
      <group>
        <mesh scale={isTouching ? 1.1 : 1}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color={isTouching ? "#ff4444" : "white"} />
        </mesh>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
      </group>
      <EffectComposer>
        <Bloom
          intensity={isTouching ? 2 : 1.5}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.85}
        />
      </EffectComposer>
    </>
  );
}
