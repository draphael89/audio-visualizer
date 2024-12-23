"use client";
import { useState } from 'react';
import { VisualPreset, PRESETS } from '../types';

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
  const [customSettings, setCustomSettings] = useState<Partial<VisualPreset>>(PRESETS[currentPreset]);

  return (
    <div
      className="fixed right-0 top-0 h-full w-80 bg-black/80 text-white p-4 overflow-y-auto"
    >
      <div className="flex items-center gap-2 mb-4">
        {audioFiles && onTrackChange && (
          <select
            value={selectedTrack}
            onChange={(e) => onTrackChange(e.target.value)}
            className="flex-1 p-2 bg-black/50 text-white border border-white/20 rounded text-sm"
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
            </select>

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
            <label className="block mb-2">Bloom Strength</label>
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
              className="w-full"
            />
          </div>

          {/* Accessibility Settings */}
          <div>
            <label className="block mb-2">Accessibility</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reduced-motion"
                  checked={customSettings.reducedMotion}
                  onChange={(e) => {
                    const newSettings = { ...customSettings, reducedMotion: e.target.checked };
                    setCustomSettings(newSettings);
                    onPresetChange(currentPreset, newSettings);
                  }}
                  className="w-4 h-4"
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
                  id="performance-mode"
                  checked={customSettings.performanceMode}
                  onChange={(e) => {
                    const newSettings = { ...customSettings, performanceMode: e.target.checked };
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
  );
}                