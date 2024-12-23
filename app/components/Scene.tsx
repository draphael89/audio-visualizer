import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree, extend, ThreeElements } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControlsProps } from '@react-three/drei';
import * as THREE from 'three';

extend({ 
  OrbitControls,
  mesh: THREE.Mesh,
  sphereGeometry: THREE.SphereGeometry,
  meshStandardMaterial: THREE.MeshStandardMaterial,
  ambientLight: THREE.AmbientLight,
  pointLight: THREE.PointLight,
  group: THREE.Group
});

type TouchEventHandler = (event: TouchEvent) => void;

// Touch feedback constants
const MIN_TOUCH_TARGET = 44; // minimum touch target size in pixels

extend({ 
  OrbitControls,
  mesh: THREE.Mesh,
  sphereGeometry: THREE.SphereGeometry,
  meshStandardMaterial: THREE.MeshStandardMaterial,
  ambientLight: THREE.AmbientLight,
  pointLight: THREE.PointLight,
  group: THREE.Group
});

import { OrbitControls as OrbitControlsImpl } from '@react-three/drei';
type OrbitControlsRef = React.ComponentRef<typeof OrbitControlsImpl>;

export const Scene: React.FC = () => {
  const { gl } = useThree();
  const [isTouching, setIsTouching] = useState(false);
  const orbitControlsRef = useRef<OrbitControlsRef>(null);

  useFrame(() => {
    // Animation logic here
  });

  useEffect(() => {
    const controls = orbitControlsRef.current;
    if (!controls) return;

    const handleTouchStart: TouchEventHandler = (event: TouchEvent): void => {
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

    const handleTouchEnd = (): void => {
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

    const element = gl.domElement;
    if (element) {
      element.style.touchAction = 'none';
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [gl]);

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
