"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Pass } from 'three/examples/jsm/postprocessing/Pass.js';
import { Controls } from './components/Controls';
import { FPSStats } from './components/FPSStats';
import { PRESETS, type VisualPreset } from './types';

const audioFiles = [
  "/audio/ambient.mp3",
  "/audio/drums.mp3",
  "/audio/synth.mp3"
];

interface ParticleSystem {
  points: THREE.Points;
  initialPositions: Float32Array;
  velocities: Float32Array;
}

export default function Page() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedTrack, setSelectedTrack] = useState(audioFiles[0]);
  const [currentPreset, setCurrentPreset] = useState<string>("default");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const composerRef = useRef<EffectComposer | undefined>(undefined);
  const sceneRef = useRef<THREE.Scene | undefined>(undefined);
  const cameraRef = useRef<THREE.PerspectiveCamera | undefined>(undefined);
  const rendererRef = useRef<THREE.WebGLRenderer | undefined>(undefined);
  const particleSystemsRef = useRef<ParticleSystem[]>([]);
  const timeRef = useRef<number>(0);
  const freqData = useRef<Uint8Array | undefined>(undefined);
  const bassData = useRef<number>(0);
  const midData = useRef<number>(0);
  const trebleData = useRef<number>(0);

  const setupAudio = async () => {
    if (!audioRef.current) return;
    const context = new AudioContext();
    const source = context.createMediaElementSource(audioRef.current);
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser).connect(context.destination);
    freqData.current = new Uint8Array(analyser.frequencyBinCount);
    setAnalyser(analyser);
  };

  const createParticleSystems = useCallback((scene: THREE.Scene, preset: VisualPreset) => {
    const systems: ParticleSystem[] = [];
    const particlesPerSystem = Math.floor(preset.particleCount / 3);

    preset.colorPalette.forEach((color, index) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particlesPerSystem * 3);
      const velocities = new Float32Array(particlesPerSystem * 3);
      
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
        velocities
      });
    });

    return systems;
  }, []);

  const updateVisualPreset = useCallback((preset: string) => {
    if (!sceneRef.current || !composerRef.current) return;
    
    particleSystemsRef.current.forEach(system => {
      sceneRef.current?.remove(system.points);
      system.points.geometry.dispose();
      (system.points.material as THREE.PointsMaterial).dispose();
    });

    const presetConfig = PRESETS[preset];
    particleSystemsRef.current = createParticleSystems(sceneRef.current, presetConfig);

    const bloomPass = composerRef.current.passes.find(
      (pass: Pass) => pass instanceof UnrealBloomPass
    ) as UnrealBloomPass;
    
    if (bloomPass) {
      bloomPass.strength = presetConfig.bloomStrength;
    }
  }, [createParticleSystems]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      PRESETS[currentPreset].bloomStrength,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);

    const systems = createParticleSystems(scene, PRESETS[currentPreset]);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    composerRef.current = composer;
    particleSystemsRef.current = systems;

    const handleResize = () => {
      if (!camera || !renderer || !composer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      switch(event.key) {
        case ' ':
          togglePlay();
          break;
        case 'f':
          document.documentElement.requestFullscreen();
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyPress);
      renderer.dispose();
      scene.clear();
    };
  }, [createParticleSystems, currentPreset]);

  useEffect(() => {
    const animate = () => {
      if (!analyser || !freqData.current || !particleSystemsRef.current.length) return;
      
      analyser.getByteFrequencyData(freqData.current);
      
      bassData.current = average(freqData.current.slice(0, 10)) / 255;
      midData.current = average(freqData.current.slice(10, 100)) / 255;
      trebleData.current = average(freqData.current.slice(100, 200)) / 255;

      timeRef.current += 0.01;

      particleSystemsRef.current.forEach((system, index) => {
        const positions = (system.points.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
        const preset = PRESETS[currentPreset];
        
        for (let i = 0; i < positions.length; i += 3) {
          const frequencyResponse = index === 0 ? bassData.current : 
                                  index === 1 ? midData.current : 
                                  trebleData.current;

          positions[i] += system.velocities[i] * frequencyResponse * 2;
          positions[i + 1] += system.velocities[i + 1] * frequencyResponse * 2;
          positions[i + 2] += system.velocities[i + 2] * frequencyResponse * 2;

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

      if (composerRef.current) {
        composerRef.current.render();
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [analyser, currentPreset]);

  useEffect(() => {
    const audio = new Audio(selectedTrack);
    audioRef.current = audio;
    audio.addEventListener('ended', () => setIsPlaying(false));
    setupAudio();

    return () => {
      audio.pause();
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [selectedTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

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
          background: 'black'
        }}
      />
      <Controls
        onPresetChange={(preset) => {
          setCurrentPreset(preset);
          updateVisualPreset(preset);
        }}
        onParticleCountChange={(count) => {
          const newPreset = {
            ...PRESETS[currentPreset],
            particleCount: count
          };
          updateVisualPreset(currentPreset);
        }}
        onBloomStrengthChange={(strength) => {
          if (composerRef.current) {
            const bloomPass = composerRef.current.passes.find(
              (pass: Pass) => pass instanceof UnrealBloomPass
            ) as UnrealBloomPass;
            if (bloomPass) {
              bloomPass.strength = strength;
            }
          }
        }}
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

function average(arr: Uint8Array): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
