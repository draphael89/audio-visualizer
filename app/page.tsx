"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Scene } from './components/Scene';
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { EffectComposer as ThreeEffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
import { HalftonePass } from 'three/examples/jsm/postprocessing/HalftonePass';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';
import { Controls } from './components/Controls';
import { FPSStats } from './components/FPSStats';
import { 
  PRESETS, 
  type PsychedelicShaderPass,
  type VisualPreset,
  type FrequencyBands,
  type ExtendedEffectComposer 
} from './types';
import { FractalRayMarchShader } from './shaders/FractalRayMarch';
import { useAudioAnalysis } from './hooks/useAudioAnalysis';
import { createHyperbolicTiling, mergeGeometries } from './components/HyperbolicTiling';

// Audio file list
const audioFiles = [
  '/audio/ambient1.mp3',
  '/audio/electronic1.mp3',
  '/audio/psychedelic1.mp3'
];

// Psychedelic transition shader
const PsychedelicTransitionShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    amplitude: { value: 0 },
    colorCycle: { value: 0 },
    distortion: { value: 0.5 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float amplitude;
    uniform float colorCycle;
    uniform float distortion;
    varying vec2 vUv;

    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void main() {
      vec2 uv = vUv;
      
      // Apply wave distortion based on amplitude
      float wave = sin(uv.y * 10.0 + time) * cos(uv.x * 8.0 - time * 0.5);
      uv.x += wave * amplitude * distortion * 0.02;
      uv.y += wave * amplitude * distortion * 0.015;
      
      // Color cycling
      vec4 texel = texture2D(tDiffuse, uv);
      float hue = fract(colorCycle + length(uv - 0.5) * 0.2);
      vec3 psychColor = hsv2rgb(vec3(hue, 0.7, texel.r));
      
      // Mix original and psychedelic colors based on amplitude
      gl_FragColor = vec4(mix(texel.rgb, psychColor, amplitude * 0.7), 1.0);
    }
  `
};

import { ChromaticAberrationShader } from './shaders/ChromaticAberration';
import { VolumetricLightShader } from './shaders/VolumetricLight';

// Custom fluid distortion shader
const FluidDistortionShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'time': { value: 0 },
    'distortionAmount': { value: 0.5 },
    'frequency': { value: 0.5 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float distortionAmount;
    uniform float frequency;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      float distortion = sin(uv.y * frequency + time) * distortionAmount;
      uv.x += distortion;
      gl_FragColor = texture2D(tDiffuse, uv);
    }
  `
};
// Sacred geometry generators
const createFlowerOfLife = (radius: number, layers: number = 6) => {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];
  let vertexIndex = 0;

  // Center circle
  const segments = 32;
  const centerX = 0, centerY = 0;
  
  for (let layer = 0; layer < layers; layer++) {
    const layerRadius = radius * (layer + 1) / layers;
    const circleCount = layer === 0 ? 1 : 6 * layer;
    const angleStep = (Math.PI * 2) / circleCount;
    
    for (let i = 0; i < circleCount; i++) {
      const angle = i * angleStep;
      const x = centerX + layerRadius * Math.cos(angle);
      const y = centerY + layerRadius * Math.sin(angle);
      
      // Create circle at (x,y)
      for (let s = 0; s <= segments; s++) {
        const segmentAngle = (s / segments) * Math.PI * 2;
        const circleX = x + (radius/layers) * Math.cos(segmentAngle);
        const circleY = y + (radius/layers) * Math.sin(segmentAngle);
        positions.push(circleX, circleY, 0);
        
        if (s < segments) {
          indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2);
        }
        vertexIndex++;
      }
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  return geometry;
};

const createMetatronsCube = (size: number) => {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];
  
  // Create platonic solids vertices
  // Initialize geometry
  
  // Cube vertices
  const cubeVertices = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
  ].map(([x, y, z]) => [x * size/2, y * size/2, z * size/2]);
  
  // Octahedron vertices
  const octaVertices = [
    [0, 0, -1], [0, 0, 1], [-1, 0, 0],
    [1, 0, 0], [0, -1, 0], [0, 1, 0]
  ].map(([x, y, z]) => [x * size, y * size, z * size]);
  
  // Add all vertices
  [...cubeVertices, ...octaVertices].forEach(([x, y, z]) => {
    positions.push(x, y, z);
  });
  
  // Add lines between vertices
  const addLine = (a: number, b: number) => {
    indices.push(a, b);
  };
  
  // Connect cube vertices
  for (let i = 0; i < 4; i++) {
    addLine(i, (i + 1) % 4);
    addLine(i + 4, ((i + 1) % 4) + 4);
    addLine(i, i + 4);
  }
  
  // Connect octahedron vertices
  for (let i = 8; i < 14; i++) {
    for (let j = i + 1; j < 14; j++) {
      addLine(i, j);
    }
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  return geometry;
};

const createNeuralWeb = (nodeCount: number, radius: number, threshold: number) => {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];
  const nodes: THREE.Vector3[] = [];

  // Create nodes in a spherical distribution
  for (let i = 0; i < nodeCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / nodeCount);
    const theta = Math.sqrt(nodeCount * Math.PI) * phi;
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    nodes.push(new THREE.Vector3(x, y, z));
    positions.push(x, y, z);
  }

  // Connect nodes that are within threshold distance
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const distance = nodes[i].distanceTo(nodes[j]);
      if (distance < threshold) {
        indices.push(i, j);
      }
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  return geometry;
};

const createSpiralGeometry = (turns: number, pointsPerTurn: number, radius: number) => {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const totalPoints = turns * pointsPerTurn;
  
  for (let i = 0; i < totalPoints; i++) {
    const t = i / pointsPerTurn;
    const angle = t * Math.PI * 2;
    const r = (t / turns) * radius;
    
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    const z = (t / turns) * radius * 0.5;
    
    positions.push(x, y, z);
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
};

interface ParticleSystem {
  points: THREE.Points;
  initialPositions: Float32Array;
  velocities: Float32Array;
  sacredGeometry?: THREE.LineSegments | THREE.Line | THREE.Mesh;
  orbitRadius?: Float32Array;
  orbitSpeed?: Float32Array;
  orbitPhase?: Float32Array;
  trail?: {
    geometry: THREE.BufferGeometry;
    positions: Float32Array;
    line: THREE.Line;
    head: number;
    maxPoints?: number;
  };
  dispose?: () => void;
}

export default function Page(): JSX.Element {
  // Audio analysis state
  // Audio analysis state is now handled by useAudioAnalysis hook
  const [currentPreset] = useState<keyof typeof PRESETS>("default");
  const [fluidDistortionIntensity, setFluidDistortionIntensity] = useState<number>(0.5);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedTrack, setSelectedTrack] = useState<string>(audioFiles[0]);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'firstPerson'>('orbit');

  // Refs for Three.js objects
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const particleSystemsRef = useRef<ParticleSystem[]>([]);
  const composerRef = useRef<ThreeEffectComposer | undefined>(undefined);
  const timeRef = useRef<number>(0);
  const frequencyBandsRef = useRef<FrequencyBands>({
    subBass: 0,
    bass: 0,
    lowerMid: 0,
    mid: 0,
    upperMid: 0,
    presence: 0,
    brilliance: 0
  });
  
  // Camera control refs
  const orbitControlsRef = useRef<OrbitControlsImpl | null>(null);
  const firstPersonControlsRef = useRef<FirstPersonControls | null>(null);
  // Active camera target position
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  
  // Update camera target based on audio
  useEffect(() => {
    if (!cameraTargetRef.current) return;
    const target = cameraTargetRef.current;
    if (frequencyBandsRef.current?.bass > 0.7) {
      target.z = Math.sin(timeRef.current * 0.001) * 5;
    }
  }, []);
  // State declarations moved to top


  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const { setupAudioContext } = useAudioAnalysis({
    onFrequencyBandUpdate: (bands: FrequencyBands) => {
      frequencyBandsRef.current = bands;
      // Frequency data is now accessed directly from frequencyBandsRef.current
    }
  });

  const createParticleSystems = useCallback((scene: THREE.Scene, preset: VisualPreset) => {
    const systems: ParticleSystem[] = [];
    // Adjust particle count based on performance mode
    const performanceMultiplier = preset.performanceMode ? 0.5 : 1.0;
    const particlesPerSystem = Math.floor(preset.particleCount * performanceMultiplier / 3);

    // Create sacred geometry if specified
    let sacredGeometry: THREE.LineSegments | THREE.Line | THREE.Mesh | undefined;
    
    // Clean up previous sacred geometry if it exists
    particleSystemsRef.current.forEach(system => {
      if (system.sacredGeometry) {
        scene.remove(system.sacredGeometry);
        system.sacredGeometry.geometry.dispose();
        (system.sacredGeometry.material as THREE.Material).dispose();
      }
    });

    if (preset.geometryType) {
      const lineMaterial = new THREE.LineBasicMaterial({
        color: preset.colorPalette[0],
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });

      switch (preset.geometryType) {
        case 'flower':
          const flowerGeometry = createFlowerOfLife(10, 6);
          sacredGeometry = new THREE.LineSegments(flowerGeometry, lineMaterial);
          break;
        case 'metatron':
          const metatronGeometry = createMetatronsCube(8);
          sacredGeometry = new THREE.LineSegments(metatronGeometry, lineMaterial);
          break;
        case 'spiral':
          const spiralGeometry = createSpiralGeometry(5, 100, 10);
          sacredGeometry = new THREE.Line(spiralGeometry, lineMaterial);
          break;
        case 'hyperbolic':
          const hyperbolicGeometry = createHyperbolicTiling(6, preset.geometryScale || 10);
          sacredGeometry = new THREE.LineSegments(hyperbolicGeometry, lineMaterial);
          break;
        case 'mergedSacred':
          if (preset.mergedGeometryConfig) {
            const { primary, secondary, layerOffset = 0.5 } = preset.mergedGeometryConfig;
            let primaryGeometry: THREE.BufferGeometry;
            let secondaryGeometry: THREE.BufferGeometry;

            // Create primary geometry
            switch (primary) {
              case 'flower':
                primaryGeometry = createFlowerOfLife(10, 6);
                break;
              case 'metatron':
                primaryGeometry = createMetatronsCube(8);
                break;
              case 'spiral':
                primaryGeometry = createSpiralGeometry(5, 100, 10);
                break;
              default:
                primaryGeometry = createFlowerOfLife(10, 6);
            }

            // Create secondary geometry
            switch (secondary) {
              case 'flower':
                secondaryGeometry = createFlowerOfLife(10, 6);
                break;
              case 'metatron':
                secondaryGeometry = createMetatronsCube(8);
                break;
              case 'spiral':
                secondaryGeometry = createSpiralGeometry(5, 100, 10);
                break;
              default:
                secondaryGeometry = createMetatronsCube(8);
            }

            // Merge geometries with offset
            const mergedGeometry = mergeGeometries(
              [primaryGeometry, secondaryGeometry],
              [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, layerOffset)]
            );
            sacredGeometry = new THREE.LineSegments(mergedGeometry, lineMaterial);
          } else {
            const webGeometry = createNeuralWeb(100, 12, 4);
            sacredGeometry = new THREE.LineSegments(webGeometry, lineMaterial);
          }
          break;
        case 'fractal':
          // Fractal geometry is handled by the shader pass
          break;
        default:
          // Create neural web as default sacred geometry
          const webGeometry = createNeuralWeb(100, 12, 4);
          sacredGeometry = new THREE.LineSegments(webGeometry, lineMaterial);
          break;
      }

      if (sacredGeometry) {
        scene.add(sacredGeometry);
      }
    }

    preset.colorPalette.forEach((color: number) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particlesPerSystem * 3);
      const velocities = new Float32Array(particlesPerSystem * 3);
      const orbitRadius = new Float32Array(particlesPerSystem);
      const orbitSpeed = new Float32Array(particlesPerSystem);
      const orbitPhase = new Float32Array(particlesPerSystem);

      // Trail setup
      const TRAIL_LENGTH = 20;
      const trailPositions = new Float32Array(particlesPerSystem * TRAIL_LENGTH * 3);
      const trailGeometry = new THREE.BufferGeometry();
      trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3));
      const trailMaterial = new THREE.LineBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      const trailLine = new THREE.Line(trailGeometry, trailMaterial);
      scene.add(trailLine);
      
      for (let i = 0; i < particlesPerSystem; i++) {
        const i3 = i * 3;
        const radius = Math.random() * 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
        
        velocities[i3] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

        // Initialize orbit parameters
        orbitRadius[i] = 1 + Math.random() * 2;
        orbitSpeed[i] = 0.5 + Math.random() * 1.5;
        orbitPhase[i] = Math.random() * Math.PI * 2;

        // Initialize trail positions
        const trailStart = i * TRAIL_LENGTH * 3;
        for (let t = 0; t < TRAIL_LENGTH; t++) {
          trailPositions[trailStart + t * 3] = positions[i3];
          trailPositions[trailStart + t * 3 + 1] = positions[i3 + 1];
          trailPositions[trailStart + t * 3 + 2] = positions[i3 + 2];
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const material = new THREE.PointsMaterial({
        color,
        size: preset.particleSize,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      systems.push({
        points,
        initialPositions: positions.slice(),
        velocities,
        orbitRadius,
        orbitSpeed,
        orbitPhase,
        trail: {
          geometry: trailGeometry,
          positions: trailPositions,
          line: trailLine,
          head: 0
        }
      });
    });

    return systems;
  }, []);

  const updateVisualPreset = useCallback((preset: keyof typeof PRESETS) => {
    if (!sceneRef.current || !composerRef.current) return;
    
    particleSystemsRef.current.forEach(system => {
      sceneRef.current?.remove(system.points);
      system.points.geometry.dispose();
      (system.points.material as THREE.PointsMaterial).dispose();
    });

    const presetConfig = PRESETS[preset];
    particleSystemsRef.current = createParticleSystems(sceneRef.current, presetConfig);

    if (composerRef.current) {
      // Update bloom pass
      const bloomPass = composerRef.current?.passes.find(
        (pass): pass is UnrealBloomPass => pass instanceof UnrealBloomPass
      );
      
      if (bloomPass) {
        bloomPass.strength = presetConfig.performanceMode ? 
          Math.min(presetConfig.bloomStrength, 1.5) : 
          presetConfig.bloomStrength;
      }

      interface FractalShaderPass extends ShaderPass {
        uniforms: {
          maxIterations: { value: number };
          u_resolution: { value: [number, number] };
          u_frequencyData: { value: Float32Array };
          u_complexity: { value: number };
        };
      }

      // Update fractal pass
      const fractalPass = composerRef.current?.passes.find(
        (pass): pass is FractalShaderPass => 
          pass instanceof ShaderPass && 
          'uniforms' in pass && 
          'maxIterations' in pass.uniforms &&
          'u_resolution' in pass.uniforms &&
          'u_frequencyData' in pass.uniforms &&
          'u_complexity' in pass.uniforms
      );

      if (fractalPass && presetConfig.performanceMode) {
        fractalPass.uniforms.maxIterations.value = Math.min(fractalPass.uniforms.maxIterations.value, 8);
      }
    }
  }, [createParticleSystems]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    // Initialize camera controls
    const orbitControls = new OrbitControlsImpl(camera, mountRef.current);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.rotateSpeed = 0.5;
    orbitControls.zoomSpeed = 0.5;
    orbitControlsRef.current = orbitControls;

    const firstPersonControls = new FirstPersonControls(camera, mountRef.current);
    firstPersonControls.lookSpeed = 0.1;
    firstPersonControls.movementSpeed = 5;
    firstPersonControls.enabled = false;
    firstPersonControlsRef.current = firstPersonControls;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const composer = new ThreeEffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Add psychedelic transition pass
    const psychedelicPass = new ShaderPass(PsychedelicTransitionShader);
    psychedelicPass.uniforms.distortion.value = 0.5;
    composer.addPass(psychedelicPass);

    const currentPresetConfig = PRESETS[currentPreset];
    const isPerformanceMode = currentPresetConfig.performanceMode;

    // Essential passes - always enabled
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      isPerformanceMode ? Math.min(PRESETS[currentPreset].bloomStrength, 1.5) : PRESETS[currentPreset].bloomStrength,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);

    // Basic effects - enabled in both modes but with reduced quality in performance mode
    const fluidPass = new ShaderPass(FluidDistortionShader);
    if (isPerformanceMode) {
      fluidPass.uniforms.distortionAmount.value *= 0.5;
      fluidPass.uniforms.frequency.value *= 0.5;
    }
    composer.addPass(fluidPass);

    // Fractal visualization - reduced complexity in performance mode
    const fractalPass = new ShaderPass(FractalRayMarchShader);
    fractalPass.uniforms.u_resolution.value = [window.innerWidth, window.innerHeight];
    if (isPerformanceMode) {
      fractalPass.uniforms.maxIterations.value = Math.min(fractalPass.uniforms.maxIterations.value, 8);
    }
    composer.addPass(fractalPass);

    // Advanced effects - only enabled in high quality mode
    if (!isPerformanceMode) {
      // Add chromatic aberration pass
      const chromaticAberrationPass = new ShaderPass(ChromaticAberrationShader);
      chromaticAberrationPass.uniforms.distortion.value = 0.5;
      composer.addPass(chromaticAberrationPass);

      // Add glitch pass with reduced frequency
      const glitchPass = new GlitchPass();
      glitchPass.goWild = false;
      composer.addPass(glitchPass);

      // Add film grain and scanlines
      const filmPass = new FilmPass(0.35, false);
      composer.addPass(filmPass);


      // Add halftone effect
      const params = {
        shape: 1,
        radius: 4,
        rotateR: Math.PI / 12,
        rotateB: Math.PI / 12 * 2,
        rotateG: Math.PI / 12 * 3,
        scatter: 0,
        blending: 1,
        blendingMode: 1,
        greyscale: false,
        disable: false
      };
      const halftonePass = new HalftonePass(window.innerWidth, window.innerHeight, params);
      composer.addPass(halftonePass);

      // Add volumetric light pass
      const volumetricLightPass = new ShaderPass(VolumetricLightShader);
      volumetricLightPass.uniforms.exposure.value = 0.3;
      volumetricLightPass.uniforms.decay.value = 0.95;
      volumetricLightPass.uniforms.density.value = 0.5;
      volumetricLightPass.uniforms.weight.value = 0.4;
      volumetricLightPass.uniforms.lightPosition.value.set(0.5, 0.5);
      composer.addPass(volumetricLightPass);
    }

    const systems = createParticleSystems(scene, PRESETS[currentPreset]);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    composerRef.current = composer;
    particleSystemsRef.current = systems;

    const handleResize = (): void => {
      if (!camera || !renderer || !composer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleKeyPress = (event: KeyboardEvent): void => {
      switch(event.key) {
        case ' ':
          togglePlay();
          break;
        case 'ArrowRight':
          const nextTrack = audioFiles[(audioFiles.indexOf(selectedTrack) + 1) % audioFiles.length];
          setSelectedTrack(nextTrack);
          break;
        case 'ArrowLeft':
          const prevTrack = audioFiles[(audioFiles.indexOf(selectedTrack) - 1 + audioFiles.length) % audioFiles.length];
          setSelectedTrack(prevTrack);
          break;
        case 'g':
          // Cycle through geometry types
          const geometryTypes = ['flower', 'metatron', 'spiral', 'default', 'hyperbolic', 'mergedSacred', 'fractal'] as const;
          const currentType = PRESETS[currentPreset].geometryType || 'default';
          const nextTypeIndex = (geometryTypes.indexOf(currentType) + 1) % geometryTypes.length;
          updateVisualPreset(geometryTypes[nextTypeIndex]);
          break;
        case 'f':
          if (event.ctrlKey) {
            document.documentElement.requestFullscreen();
          } else {
            // Adjust fluid distortion intensity
            interface FluidShaderPass extends ShaderPass {
              uniforms: {
                distortionAmount: { value: number };
                frequency: { value: number };
              };
            }

            const fluidPass = composerRef.current?.passes.find(
              (pass): pass is FluidShaderPass => 
                pass instanceof ShaderPass && 
                'uniforms' in pass && 
                'distortionAmount' in pass.uniforms &&
                'frequency' in pass.uniforms
            );
            if (fluidPass) {
              const currentAmount = fluidPass.uniforms.distortionAmount.value;
              fluidPass.uniforms.distortionAmount.value = ((currentAmount * 10 + 1) % 10) / 10;
            }
          }
          break;
        case 'v':
          // Toggle between orbit and first person controls
          const newMode = cameraMode === 'orbit' ? 'firstPerson' : 'orbit';
          setCameraMode(newMode);
          
          if (orbitControlsRef.current && firstPersonControlsRef.current) {
            orbitControlsRef.current.enabled = newMode === 'orbit';
            firstPersonControlsRef.current.enabled = newMode === 'firstPerson';
            
            if (newMode === 'orbit') {
              // Smoothly transition back to orbit position
              const targetPosition = new THREE.Vector3(0, 0, 20);
              cameraRef.current?.position.lerp(targetPosition, 0.1);
              cameraRef.current?.lookAt(0, 0, 0);
            } else {
              // Set up first person view
              firstPersonControlsRef.current.lookAt(0, 0, 0);
            }
          }
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
      }
    };

    const handleMouseDown = (event: MouseEvent): void => {
      if (event.button === 1) { // Middle click
        // Cycle through geometry types
        const geometryTypes = ['flower', 'metatron', 'spiral', 'default', 'hyperbolic', 'mergedSacred', 'fractal'] as const;
        const currentType = PRESETS[currentPreset].geometryType || 'default';
        const nextTypeIndex = (geometryTypes.indexOf(currentType) + 1) % geometryTypes.length;
        updateVisualPreset(geometryTypes[nextTypeIndex]);
        event.preventDefault(); // Prevent default middle-click behavior
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('mousedown', handleMouseDown);
      
      // Clean up controls
      orbitControlsRef.current?.dispose();
      firstPersonControlsRef.current?.dispose();
      
      renderer.dispose();
      scene.clear();
    };
  }, [createParticleSystems, currentPreset, updateVisualPreset, selectedTrack, togglePlay, cameraMode]);

  // Utility function for calculating frequency band averages
  // Removed unused average function

  const animate = useCallback((): void => {
    if (!particleSystemsRef.current.length || !frequencyBandsRef.current) return;
      
      // Use frequency bands from useAudioAnalysis hook
      // Frequency bands are accessed directly from frequencyBandsRef.current when needed
      
      const deltaTime = 1/60; // Fixed time step for consistent animation
      timeRef.current += deltaTime;

      particleSystemsRef.current.forEach((system: ParticleSystem, index: number) => {
        const positions = (system.points.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
        const preset = PRESETS[currentPreset];
        
        for (let i = 0; i < positions.length; i += 3) {
          const { subBass, bass, mid } = frequencyBandsRef.current;
          const frequencyResponse = index === 0 ? subBass : 
                                  index === 1 ? bass : 
                                  mid;

          // Calculate orbit contribution
          const particleIndex = Math.floor(i / 3);
          const orbitAngle = timeRef.current * system.orbitSpeed![particleIndex] + system.orbitPhase![particleIndex];
          const orbitRadius = system.orbitRadius![particleIndex];
          const orbitX = Math.cos(orbitAngle) * orbitRadius * frequencyResponse;
          const orbitY = Math.sin(orbitAngle) * orbitRadius * frequencyResponse;

          // Combine velocity and orbit motion
          positions[i] += system.velocities[i] * frequencyResponse * 2 + orbitX;
          positions[i + 1] += system.velocities[i + 1] * frequencyResponse * 2 + orbitY;
          positions[i + 2] += system.velocities[i + 2] * frequencyResponse * 2;

          // Update trail if present
          if (system.trail) {
            const trailStart = particleIndex * 20 * 3; // TRAIL_LENGTH = 20
            // Shift existing trail positions
            for (let t = 19; t > 0; t--) {
              const currentIndex = trailStart + t * 3;
              const prevIndex = trailStart + (t - 1) * 3;
              system.trail.positions[currentIndex] = system.trail.positions[prevIndex];
              system.trail.positions[currentIndex + 1] = system.trail.positions[prevIndex + 1];
              system.trail.positions[currentIndex + 2] = system.trail.positions[prevIndex + 2];
            }
            // Add current position to trail
            system.trail.positions[trailStart] = positions[i];
            system.trail.positions[trailStart + 1] = positions[i + 1];
            system.trail.positions[trailStart + 2] = positions[i + 2];
            system.trail.geometry.attributes.position.needsUpdate = true;
          }

          const distance = Math.sqrt(
            positions[i] * positions[i] +
            positions[i + 1] * positions[i + 1] +
            positions[i + 2] * positions[i + 2]
          );

          if (distance > 15) {
            positions[i] = system.initialPositions[i];
            positions[i + 1] = system.initialPositions[i + 1];
            positions[i + 2] = system.initialPositions[i + 2];
          }
        }

        system.points.geometry.attributes.position.needsUpdate = true;
        system.points.rotation.y += preset.rotationSpeed * (index + 1);
        system.points.rotation.x += preset.rotationSpeed * 0.5 * (index + 1);
      });

      // Update camera controls
      if (cameraRef.current) {
        if (cameraMode === 'orbit' && orbitControlsRef.current) {
          orbitControlsRef.current.update();
        } else if (cameraMode === 'firstPerson' && firstPersonControlsRef.current) {
          firstPersonControlsRef.current.update(deltaTime);
          
          // Add some gentle camera movement based on audio
          if (frequencyBandsRef.current.subBass > 0.5) {
            const intensity = frequencyBandsRef.current.subBass * 0.02;
            cameraRef.current.position.y += Math.sin(timeRef.current) * intensity;
          }
        }
      }

      if (composerRef.current) {
        const currentPresetConfig = PRESETS[currentPreset];
        const isReducedMotion = currentPresetConfig.reducedMotion;
        const isPerformanceMode = currentPresetConfig.performanceMode;

        // Update fractal shader uniforms
        const fractalPass = composerRef.current.passes.find(
          (pass: Pass): pass is ShaderPass => pass instanceof ShaderPass && 'uniforms' in pass && 'u_frequencyData' in pass.uniforms
        ) as ShaderPass | undefined;

        if (fractalPass) {
          fractalPass.uniforms.u_time.value += 0.01;
          const { subBass, bass, mid, upperMid, presence, brilliance } = frequencyBandsRef.current;
          fractalPass.uniforms.u_frequencyData.value = [subBass, bass, mid, upperMid, presence, brilliance];
          
          // Use detailed frequency bands for fractal parameters
          fractalPass.uniforms.u_amplitude.value = 0.5 + ((frequencyBandsRef.current?.subBass ?? 0) * 0.7);
          fractalPass.uniforms.u_scale.value = 1.0 + ((frequencyBandsRef.current?.bass ?? 0) * 0.5);
          fractalPass.uniforms.u_morphFactor.value = (frequencyBandsRef.current?.lowerMid ?? 0) + (frequencyBandsRef.current?.mid ?? 0);
          fractalPass.uniforms.u_colorShift.value = ((frequencyBandsRef.current?.presence ?? 0) + (frequencyBandsRef.current?.brilliance ?? 0)) * 0.5;
          fractalPass.uniforms.u_complexity.value = 1.0 + ((frequencyBandsRef.current?.upperMid ?? 0) * 2.0);

        // Update shader uniforms for all effect passes
        const fluidPass = (composerRef.current as ExtendedEffectComposer)?.passes.find(
          (pass: Pass): pass is ShaderPass => pass instanceof ShaderPass && 'uniforms' in pass && 'distortionAmount' in pass.uniforms
        ) as ShaderPass;
        
        interface ChromaticShaderPass extends ShaderPass {
          uniforms: {
            distortion: { value: number };
            time: { value: number };
          };
        }

        const chromaticPass = composerRef.current?.passes.find(
          (pass): pass is ChromaticShaderPass => 
            pass instanceof ShaderPass && 
            'uniforms' in pass && 
            'distortion' in pass.uniforms
        );

        interface VolumetricShaderPass extends ShaderPass {
          uniforms: {
            exposure: { value: number };
            decay: { value: number };
            density: { value: number };
            weight: { value: number };
            lightPosition: { value: THREE.Vector2 };
          };
        }

        const volumetricPass = composerRef.current?.passes.find(
          (pass): pass is VolumetricShaderPass => 
            pass instanceof ShaderPass && 
            'uniforms' in pass && 
            'exposure' in pass.uniforms &&
            'decay' in pass.uniforms &&
            'density' in pass.uniforms &&
            'weight' in pass.uniforms &&
            'lightPosition' in pass.uniforms
        );

        if (fluidPass) {
          fluidPass.uniforms.time.value = timeRef.current;
          // Reduce or disable effects based on accessibility settings
          const motionScale = isReducedMotion ? 0.3 : 1.0;
          const performanceScale = isPerformanceMode ? 0.5 : 1.0;
          fluidPass.uniforms.distortionAmount.value = ((frequencyBandsRef.current?.subBass ?? 0) + (frequencyBandsRef.current?.bass ?? 0)) * 0.15 * motionScale * performanceScale;
          fluidPass.uniforms.frequency.value = ((frequencyBandsRef.current?.presence ?? 0) + (frequencyBandsRef.current?.brilliance ?? 0)) * 12 * motionScale * performanceScale;
        }

        if (chromaticPass) {
          chromaticPass.uniforms.time.value = timeRef.current;
          chromaticPass.uniforms.distortion.value = 0.3 + ((frequencyBandsRef.current?.subBass ?? 0) * 0.4 + (frequencyBandsRef.current?.bass ?? 0) * 0.3);
        }

        if (volumetricPass) {
          const lightX = 0.5 + Math.cos(timeRef.current * 0.5) * 0.3;
          const lightY = 0.5 + Math.sin(timeRef.current * 0.3) * 0.2;
          volumetricPass.uniforms.lightPosition.value.set(lightX, lightY);
          volumetricPass.uniforms.exposure.value = 0.3 + ((frequencyBandsRef.current?.lowerMid ?? 0) * 0.15 + (frequencyBandsRef.current?.mid ?? 0) * 0.15);
          volumetricPass.uniforms.density.value = 0.4 + ((frequencyBandsRef.current?.upperMid ?? 0) * 0.2 + (frequencyBandsRef.current?.presence ?? 0) * 0.2);
        }

        // Update psychedelic transition shader
        const psychedelicPass = composerRef.current?.passes.find(
          (pass): pass is PsychedelicShaderPass => 
            pass instanceof ShaderPass && 
            'uniforms' in pass && 
            'time' in pass.uniforms &&
            'amplitude' in pass.uniforms &&
            'colorCycle' in pass.uniforms
        );

        if (psychedelicPass) {
          psychedelicPass.uniforms.time.value = timeRef.current;
          psychedelicPass.uniforms.amplitude.value = (
            frequencyBandsRef.current?.subBass ?? 0 +
            frequencyBandsRef.current?.bass ?? 0
          ) * 0.5;
          psychedelicPass.uniforms.colorCycle.value = timeRef.current * 0.1;
          psychedelicPass.uniforms.distortion.value = currentPresetConfig.psychedelicIntensity ?? 0.5;
        }

        // Update sacred geometry colors and transformations
        particleSystemsRef.current.forEach((system: ParticleSystem, index: number) => {
          if (system.sacredGeometry) {
            const material = system.sacredGeometry.material as THREE.LineBasicMaterial;
            const hue = (timeRef.current * 0.1 + index * 0.2) % 1;
            material.color.setHSL(hue, 0.8, 0.5);
            
            system.sacredGeometry.rotation.y += PRESETS[currentPreset].rotationSpeed * 0.5;
            system.sacredGeometry.rotation.z += PRESETS[currentPreset].rotationSpeed * 0.3;
            
            const { subBass, bass, mid } = frequencyBandsRef.current;
            const frequencyResponse = index === 0 ? subBass : 
                                    index === 1 ? bass : 
                                    mid;
            
            const currentPresetConfig = PRESETS[currentPreset];
            // Apply accessibility and performance settings to animations
            const motionScale = currentPresetConfig.reducedMotion ? 0.3 : 1.0;
            const performanceScale = currentPresetConfig.performanceMode ? 0.5 : 1.0;
            const rotationSpeed = currentPresetConfig.rotationSpeed * motionScale;

            // Update rotation speed based on reduced motion setting
            system.sacredGeometry.rotation.y += rotationSpeed;

            // Neural web specific animations
            if (currentPresetConfig.geometryType === 'default' && frequencyResponse > 0.8) {
              // Trigger neural web expansion on high frequency with reduced motion
              // Use sub-bass for scale and bass for rotation
              const scale = 1 + ((frequencyBandsRef.current?.subBass ?? 0) * 0.6 + (frequencyBandsRef.current?.bass ?? 0) * 0.4) * motionScale * performanceScale;
              system.sacredGeometry.scale.setScalar(scale);
              
              // Add subtle twisting based on mid frequencies
              system.sacredGeometry.rotation.z += ((frequencyBandsRef.current?.lowerMid ?? 0) + (frequencyBandsRef.current?.mid ?? 0)) * 0.02 * motionScale;
              
              // Pulse the opacity based on frequency with reduced motion
              const opacityBase = currentPresetConfig.reducedMotion ? 0.5 : 0.3;
              const opacityRange = currentPresetConfig.reducedMotion ? 0.3 : 0.7;
              (material as THREE.LineBasicMaterial).opacity = opacityBase + (frequencyResponse * opacityRange * performanceScale);
            } else {
              // Normal sacred geometry animations with reduced motion
              const scale = 1 + (frequencyResponse * 0.3 * motionScale * performanceScale);
              system.sacredGeometry.scale.setScalar(scale);
            }
          }
        });

        composerRef.current.render();
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [
    currentPreset,
    particleSystemsRef,
    timeRef,
    cameraMode,
    orbitControlsRef,
    firstPersonControlsRef,
    cameraRef,
    composerRef
  ]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [animate]);

  useEffect(() => {
    const audio = new Audio(selectedTrack);
    audioRef.current = audio;
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    setupAudioContext(audio);

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
      audioRef.current = null;
    };
  }, [selectedTrack, setIsPlaying, setupAudioContext]);



  return (
    <>
      <div
        ref={mountRef}
        style={{
          width: "100vw",
          height: "100vh",
          position: "absolute",
          top: 0,
          left: 0,
          background: 'black',
          touchAction: 'none' // Prevent default touch behaviors
        }}
      >
        <Canvas
          camera={{
            fov: 75,
            near: 0.1,
            far: 1000,
            position: [0, 0, 10]
          }}
          dpr={[1, 2]} // Optimize for mobile by limiting pixel ratio
          performance={{ min: 0.5 }} // Allow frame rate to drop for better performance
          style={{ touchAction: 'none' }}
        >
          <Scene />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            touches={{
              ONE: THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN
            }}
            minDistance={2}
            maxDistance={20}
            dampingFactor={0.05}
            enableDamping={true}
            rotateSpeed={0.5}
            zoomSpeed={0.5}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI * 3 / 4}
          />
        </Canvas>
      </div>
      <Controls
        currentPreset={currentPreset}
        onPresetChange={updateVisualPreset}
        fluidDistortionIntensity={fluidDistortionIntensity}
        onFluidDistortionChange={setFluidDistortionIntensity}
        isPlaying={isPlaying}
        onPlayPause={togglePlay}
        selectedTrack={selectedTrack}
        onTrackChange={setSelectedTrack}
        audioFiles={audioFiles}
      />
      <FPSStats />
    </>
  );
}
