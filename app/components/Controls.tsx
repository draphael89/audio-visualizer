"use client";
import { useState } from 'react';
import { VisualPreset, PRESETS, RandomizationSettings } from '../types';

// Backdrop overlay component
interface BackdropProps {
  isExpanded: boolean;
  onClick: () => void;
}

const Backdrop: React.FC<BackdropProps> = ({ isExpanded, onClick }) => {
  return (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity z-40 ${
        isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClick}
      aria-hidden="true"
    />
  );
};

interface ControlsProps {
  currentPreset: string;
  onPresetChange: (preset: string, customPreset?: Partial<VisualPreset>) => void;
  fluidDistortionIntensity: number;
  onFluidDistortionChange: (intensity: number) => void;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  selectedTrack?: string;
  onTrackChange?: (track: string) => void;
  audioFiles?: string[];
}

type CustomSettings = Omit<VisualPreset, 'randomization'> & {
  randomization?: Partial<RandomizationSettings>;
};

export function Controls({
  currentPreset,
  onPresetChange,
  fluidDistortionIntensity,
  onFluidDistortionChange,
  isPlaying,
  onPlayPause,
  selectedTrack,
  onTrackChange,
  audioFiles
}: ControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customSettings, setCustomSettings] = useState<CustomSettings>(PRESETS[currentPreset]);

  return (
    <>
      <Backdrop isExpanded={isExpanded} onClick={() => setIsExpanded(false)} />
      <div
      className={`fixed right-0 top-0 h-full max-w-[320px] w-[85vw] p-4 overflow-y-auto transform transition-all duration-300 ease-in-out shadow-lg backdrop-blur-sm ${
        customSettings.highContrast 
          ? 'bg-[var(--control-bg)] border-l border-[var(--control-border)]' 
          : 'bg-black/80 border-l border-white/10'
      } text-[var(--text-primary)] ${
        isExpanded ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`fixed right-4 top-4 z-50 p-3 min-h-[44px] min-w-[44px] rounded-full shadow-lg transition-all duration-200 ease-in-out hover:scale-105 ${
            customSettings.highContrast 
              ? 'bg-[var(--control-bg)] border border-[var(--control-border)]' 
              : 'bg-black/80 hover:bg-black/90 border border-white/10'
          }`}
          aria-label={isExpanded ? 'Close controls' : 'Open controls'}
        >
          {isExpanded ? '×' : '⚙️'}
        </button>
        {audioFiles && onTrackChange && (
          <select
            value={selectedTrack}
            onChange={(e) => onTrackChange(e.target.value)}
            className={`flex-1 p-3 rounded text-sm min-h-[44px] border ${
              customSettings.highContrast 
                ? 'bg-[var(--control-bg)] text-[var(--text-primary)] border-[var(--control-border)]' 
                : 'bg-black/50 text-white border-white/20'
            }`}
          >
            {audioFiles.map((src) => (
              <option key={src} value={src}>
                {src.split('/').pop()?.replace('.mp3', '')}
              </option>
            ))}
          </select>
        )}
        {onPlayPause && (
          <button
            onClick={onPlayPause}
            className={`px-4 py-2 rounded text-sm ${
              isPlaying ? 'bg-red-500/60' : 'bg-green-500/60'
            }`}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 bg-white/10 rounded"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Visual Preset */}
          <div>
            <label className="block mb-2">Visual Preset</label>
            <select
              value={currentPreset}
              onChange={(e) => onPresetChange(e.target.value)}
              className="w-full p-2 bg-black/50 text-white border border-white/20 rounded"
            >
              {Object.keys(PRESETS).map((preset) => (
                <option key={preset} value={preset}>
                  {preset.charAt(0).toUpperCase() + preset.slice(1)}
                </option>
              ))}
            </select>
          </div>


          {/* Fluid Distortion */}
          <div>
            <label className="block mb-2">Fluid Distortion</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={fluidDistortionIntensity}
              onChange={(e) => onFluidDistortionChange(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Randomization Controls */}
          <div className="space-y-4 p-4 bg-black/50 rounded-lg backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-2">Randomization</h3>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="particleRandomization"
                checked={customSettings.randomization?.enableParticleRandomization ?? false}
                onChange={(e) => {
                  const newSettings: CustomSettings = {
                    ...customSettings,
                    randomization: {
                      ...customSettings.randomization,
                      enableParticleRandomization: e.target.checked,
                      randomSeed: customSettings.randomization?.randomSeed ?? Math.floor(Math.random() * 2147483647),
                      intensityFactor: customSettings.randomization?.intensityFactor ?? 0.5
                    }
                  };
                  setCustomSettings(newSettings);
                  onPresetChange(currentPreset, newSettings);
                }}
                className="w-4 h-4"
              />
              <label htmlFor="particleRandomization">Particle Movement</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="colorRandomization"
                checked={customSettings.randomization?.enableColorRandomization ?? false}
                onChange={(e) => {
                  const newSettings: CustomSettings = {
                    ...customSettings,
                    randomization: {
                      ...customSettings.randomization,
                      enableColorRandomization: e.target.checked,
                      randomSeed: customSettings.randomization?.randomSeed ?? Math.floor(Math.random() * 2147483647),
                      intensityFactor: customSettings.randomization?.intensityFactor ?? 0.5
                    }
                  };
                  setCustomSettings(newSettings);
                  onPresetChange(currentPreset, newSettings);
                }}
                className="w-4 h-4"
              />
              <label htmlFor="colorRandomization">Color Variations</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="geometryRandomization"
                checked={customSettings.randomization?.enableGeometryRandomization ?? false}
                onChange={(e) => {
                  const newSettings: CustomSettings = {
                    ...customSettings,
                    randomization: {
                      ...customSettings.randomization,
                      enableGeometryRandomization: e.target.checked,
                      randomSeed: customSettings.randomization?.randomSeed ?? Math.floor(Math.random() * 2147483647),
                      intensityFactor: customSettings.randomization?.intensityFactor ?? 0.5
                    }
                  };
                  setCustomSettings(newSettings);
                  onPresetChange(currentPreset, newSettings);
                }}
                className="w-4 h-4"
              />
              <label htmlFor="geometryRandomization">Geometric Patterns</label>
            </div>

            <div className="space-y-2">
              <label htmlFor="intensitySlider" className="block">Randomization Intensity</label>
              <input
                type="range"
                id="intensitySlider"
                min="0"
                max="1"
                step="0.1"
                value={customSettings.randomization?.intensityFactor ?? 0.5}
                onChange={(e) => {
                  const newSettings: CustomSettings = {
                    ...customSettings,
                    randomization: {
                      ...customSettings.randomization,
                      intensityFactor: parseFloat(e.target.value)
                    }
                  };
                  setCustomSettings(newSettings);
                  onPresetChange(currentPreset, newSettings);
                }}
                className="w-full"
              />
            </div>

            <button
              onClick={() => {
                const newSettings: CustomSettings = {
                  ...customSettings,
                  randomization: {
                    ...customSettings.randomization,
                    randomSeed: Math.floor(Math.random() * 2147483647)
                  }
                };
                setCustomSettings(newSettings);
                onPresetChange(currentPreset, newSettings);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              New Random Seed
            </button>
          </div>

          {/* Sacred Geometry */}
          <div>
            <label className="block mb-2">Sacred Geometry</label>
            <select
              value={customSettings.geometryType || 'default'}
              onChange={(e) => {
                const geometryType = e.target.value as VisualPreset['geometryType'];
                const newSettings = { ...customSettings, geometryType };
                setCustomSettings(newSettings);
                onPresetChange(currentPreset, newSettings);
              }}
              className="w-full p-2 bg-black/50 text-white border border-white/20 rounded"
            >
              <option value="default">Default</option>
              <option value="flower">Flower of Life</option>
              <option value="metatron">Metatron&apos;s Cube</option>
              <option value="spiral">Golden Spiral</option>
              <option value="fractal">Fractal</option>
              <option value="mergedSacred">Merged Sacred</option>
              <option value="hyperbolic">Hyperbolic</option>
            </select>

            {/* Fractal Options */}
            {customSettings.geometryType === 'fractal' && (
              <div className="mt-4 space-y-2">
                <select
                  value={customSettings.fractalOptions?.type || 'dragon'}
                  onChange={(e) => {
                    const newSettings = {
                      ...customSettings,
                      fractalOptions: {
                        ...customSettings.fractalOptions,
                        type: e.target.value as 'dragon' | 'koch' | 'sierpinski' | 'tree'
                      }
                    };
                    setCustomSettings(newSettings);
                    onPresetChange(currentPreset, newSettings);
                  }}
                  className="w-full p-2 bg-black/50 text-white border border-white/20 rounded"
                >
                  <option value="dragon">Dragon Curve</option>
                  <option value="koch">Koch Snowflake</option>
                  <option value="sierpinski">Sierpinski Triangle</option>
                  <option value="tree">Fractal Tree</option>
                </select>

                <div>
                  <label className="block text-sm mb-1">Iterations</label>
                  <input
                    type="range"
                    min="1"
                    max={customSettings.performanceMode ? 8 : 12}
                    step="1"
                    value={customSettings.fractalOptions?.iterations || 8}
                    onChange={(e) => {
                      const newSettings = {
                        ...customSettings,
                        fractalOptions: {
                          ...customSettings.fractalOptions,
                          iterations: Number(e.target.value)
                        }
                      };
                      setCustomSettings(newSettings);
                      onPresetChange(currentPreset, newSettings);
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Scale</label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={customSettings.fractalOptions?.scale || 0.5}
                    onChange={(e) => {
                      const newSettings = {
                        ...customSettings,
                        fractalOptions: {
                          ...customSettings.fractalOptions,
                          scale: Number(e.target.value)
                        }
                      };
                      setCustomSettings(newSettings);
                      onPresetChange(currentPreset, newSettings);
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Angle</label>
                  <input
                    type="range"
                    min="0"
                    max={Math.PI * 2}
                    step={Math.PI / 12}
                    value={customSettings.fractalOptions?.angle || Math.PI / 2}
                    onChange={(e) => {
                      const newSettings = {
                        ...customSettings,
                        fractalOptions: {
                          ...customSettings.fractalOptions,
                          angle: Number(e.target.value)
                        }
                      };
                      setCustomSettings(newSettings);
                      onPresetChange(currentPreset, newSettings);
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Merged Sacred Geometry Options */}
            {customSettings.geometryType === 'mergedSacred' && (
              <div className="mt-4 space-y-2">
                <div>
                  <label className="block text-sm mb-1">Primary Geometry</label>
                  <select
                    value={customSettings.mergedGeometryConfig?.primary || 'metatron'}
                    onChange={(e) => {
                      const newSettings = {
                        ...customSettings,
                        mergedGeometryConfig: {
                          ...customSettings.mergedGeometryConfig,
                          primary: e.target.value as 'flower' | 'metatron' | 'spiral'
                        }
                      };
                      setCustomSettings(newSettings);
                      onPresetChange(currentPreset, newSettings);
                    }}
                    className="w-full p-2 bg-black/50 text-white border border-white/20 rounded"
                  >
                    <option value="flower">Flower of Life</option>
                    <option value="metatron">Metatron&apos;s Cube</option>
                    <option value="spiral">Golden Spiral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Secondary Geometry</label>
                  <select
                    value={customSettings.mergedGeometryConfig?.secondary || 'flower'}
                    onChange={(e) => {
                      const newSettings = {
                        ...customSettings,
                        mergedGeometryConfig: {
                          ...customSettings.mergedGeometryConfig,
                          secondary: e.target.value as 'flower' | 'metatron' | 'spiral'
                        }
                      };
                      setCustomSettings(newSettings);
                      onPresetChange(currentPreset, newSettings);
                    }}
                    className="w-full p-2 bg-black/50 text-white border border-white/20 rounded"
                  >
                    <option value="flower">Flower of Life</option>
                    <option value="metatron">Metatron&apos;s Cube</option>
                    <option value="spiral">Golden Spiral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Blend Factor</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={customSettings.mergedGeometryConfig?.blendFactor || 0.5}
                    onChange={(e) => {
                      const newSettings = {
                        ...customSettings,
                        mergedGeometryConfig: {
                          ...customSettings.mergedGeometryConfig,
                          blendFactor: Number(e.target.value)
                        }
                      };
                      setCustomSettings(newSettings);
                      onPresetChange(currentPreset, newSettings);
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Layer Offset</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={customSettings.mergedGeometryConfig?.layerOffset || 0.5}
                    onChange={(e) => {
                      const newSettings = {
                        ...customSettings,
                        mergedGeometryConfig: {
                          ...customSettings.mergedGeometryConfig,
                          layerOffset: Number(e.target.value)
                        }
                      };
                      setCustomSettings(newSettings);
                      onPresetChange(currentPreset, newSettings);
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            <div className="mt-2">
              <label className="block mb-2">Geometry Scale</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={customSettings.geometryScale || 1}
                onChange={(e) => {
                  const newSettings = { ...customSettings, geometryScale: Number(e.target.value) };
                  setCustomSettings(newSettings);
                  onPresetChange(currentPreset, newSettings);
                }}
                className="w-full"
              />
            </div>

            <div className="mt-2">
              <label className="block mb-2">Pulse Intensity</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={customSettings.pulseIntensity || 0}
                onChange={(e) => {
                  const newSettings = { ...customSettings, pulseIntensity: Number(e.target.value) };
                  setCustomSettings(newSettings);
                  onPresetChange(currentPreset, newSettings);
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* Particle Settings */}
          <div>
            <label className="block mb-2">Particle Count</label>
            <input
              type="range"
              min="5000"
              max="100000"
              step="1000"
              value={customSettings.particleCount}
              onChange={(e) => {
                const newSettings = { ...customSettings, particleCount: Number(e.target.value) };
                setCustomSettings(newSettings);
                onPresetChange(currentPreset, newSettings);
              }}
              className="w-full"
            />
          </div>

          {/* Visual Effects */}
          <div>
            <label className="block mb-2">Visual Effects</label>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Bloom Strength</label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={customSettings.bloomStrength}
                  onChange={(e) => {
                    const newSettings = { ...customSettings, bloomStrength: Number(e.target.value) };
                    setCustomSettings(newSettings);
                    onPresetChange(currentPreset, newSettings);
                  }}
                  className="w-full appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Camera Speed</label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={customSettings.cameraSpeed || 1}
                  onChange={(e) => {
                    const newSettings = { ...customSettings, cameraSpeed: Number(e.target.value) };
                    setCustomSettings(newSettings);
                    onPresetChange(currentPreset, newSettings);
                  }}
                  className="w-full appearance-none cursor-pointer"
                  title="Adjust camera movement speed"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Chromatic Aberration</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={customSettings.chromaticAberration || 0.3}
                  onChange={(e) => {
                    const newSettings = { ...customSettings, chromaticAberration: Number(e.target.value) };
                    setCustomSettings(newSettings);
                    onPresetChange(currentPreset, newSettings);
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Volumetric Light</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={customSettings.volumetricIntensity || 0.5}
                  onChange={(e) => {
                    const newSettings = { ...customSettings, volumetricIntensity: Number(e.target.value) };
                    setCustomSettings(newSettings);
                    onPresetChange(currentPreset, newSettings);
                  }}
                  className="w-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Accessibility Settings */}
          <div>
            <label className="block mb-2">Accessibility</label>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="reduced-motion"
                  checked={customSettings.reducedMotion}
                  onChange={(e) => {
                    const newSettings = { ...customSettings, reducedMotion: e.target.checked };
                    setCustomSettings(newSettings);
                    onPresetChange(currentPreset, newSettings);
                  }}
                  className="w-4 h-4 transition-transform hover:scale-110 focus:ring-2 focus:ring-white/50 focus:ring-offset-1"
                  aria-label="Enable reduced motion for animations"
                  title="Reduces animation intensity for better accessibility"
                />
                <label htmlFor="reduced-motion" className="cursor-pointer" title="Reduces animation intensity for better accessibility">
                  Reduced Motion
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="high-contrast"
                  checked={customSettings.highContrast}
                  onChange={(e) => {
                    const newSettings = { ...customSettings, highContrast: e.target.checked };
                    setCustomSettings(newSettings);
                    onPresetChange(currentPreset, newSettings);
                    document.documentElement.setAttribute('data-high-contrast', e.target.checked.toString());
                  }}
                  className="w-4 h-4 transition-transform hover:scale-110 focus:ring-2 focus:ring-white/50 focus:ring-offset-1"
                  aria-label="Enable high contrast mode"
                  title="Increases contrast for better visibility"
                />
                <label htmlFor="high-contrast" className="cursor-pointer" title="Increases contrast for better visibility">
                  High Contrast
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="performance-mode"
                  checked={customSettings.performanceMode}
                  onChange={(e) => {
                    const newSettings = {
                      ...customSettings,
                      performanceMode: e.target.checked,
                      // Automatically adjust settings for better performance
                      particleCount: e.target.checked ? Math.min(customSettings.particleCount || 24000, 30000) : customSettings.particleCount,
                      bloomStrength: e.target.checked ? Math.min(customSettings.bloomStrength || 1.5, 1.5) : customSettings.bloomStrength,
                      ...(customSettings.fractalOptions && {
                        fractalOptions: {
                          ...customSettings.fractalOptions,
                          iterations: e.target.checked ? Math.min(customSettings.fractalOptions?.iterations || 8, 8) : customSettings.fractalOptions?.iterations
                        }
                      })
                    };
                    setCustomSettings(newSettings);
                    onPresetChange(currentPreset, newSettings);
                  }}
                  className="w-4 h-4"
                  aria-label="Enable performance mode"
                  title="Reduces visual effects for better performance"
                />
                <label htmlFor="performance-mode" className="cursor-pointer" title="Reduces visual effects for better performance">
                  Performance Mode
                </label>
              </div>
            </div>
          </div>

          {/* Color Settings */}
          <div>
            <label className="block mb-2">Colors</label>
            <div className="space-y-2">
              {customSettings.colorPalette?.map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={'#' + color.toString(16).padStart(6, '0')}
                    onChange={(e) => {
                      const newColors = [...(customSettings.colorPalette || [])];
                      newColors[index] = parseInt(e.target.value.slice(1), 16);
                      const newSettings = { ...customSettings, colorPalette: newColors };
                      setCustomSettings(newSettings);
                      onPresetChange(currentPreset, newSettings);
                    }}
                    className="w-8 h-8"
                  />
                  <span>Color {index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
                                            