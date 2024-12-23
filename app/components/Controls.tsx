"use client";
import { useState } from 'react';

interface ControlsProps {
  onPresetChange: (preset: string) => void;
  onParticleCountChange: (count: number) => void;
  onBloomStrengthChange: (strength: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  selectedTrack: string;
  onTrackChange: (track: string) => void;
  audioFiles: string[];
}

export function Controls({
  onPresetChange,
  onParticleCountChange,
  onBloomStrengthChange,
  isPlaying,
  onPlayPause,
  selectedTrack,
  onTrackChange,
  audioFiles
}: ControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        padding: '15px',
        background: 'rgba(0,0,0,0.7)',
        borderRadius: '8px',
        color: 'white'
      }}
    >
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select
          value={selectedTrack}
          onChange={(e) => onTrackChange(e.target.value)}
          style={{
            padding: '8px',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          {audioFiles.map((src) => (
            <option key={src} value={src}>
              {src.split('/').pop()?.replace('.mp3', '')}
            </option>
          ))}
        </select>
        <button
          onClick={onPlayPause}
          style={{
            padding: '8px 16px',
            background: isPlaying ? 'rgba(255,50,50,0.6)' : 'rgba(50,255,50,0.6)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            padding: '8px',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Visual Preset</label>
            <select
              onChange={(e) => onPresetChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '4px'
              }}
            >
              <option value="default">Default</option>
              <option value="cosmic">Cosmic</option>
              <option value="vortex">Vortex</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Particle Count</label>
            <input
              type="range"
              min="5000"
              max="50000"
              step="1000"
              defaultValue="24000"
              onChange={(e) => onParticleCountChange(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Bloom Strength</label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              defaultValue="1.5"
              onChange={(e) => onBloomStrengthChange(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 