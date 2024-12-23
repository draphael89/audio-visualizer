"use client";

import { useRef, useCallback, useEffect } from 'react';
import { FrequencyBands } from '../types';

interface UseAudioAnalysisProps {
  onFrequencyBandUpdate?: (bands: FrequencyBands) => void;
}

export function useAudioAnalysis({ onFrequencyBandUpdate }: UseAudioAnalysisProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const setupAudioContext = useCallback((audioElement: HTMLAudioElement) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.85;

    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }

    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    sourceRef.current = source;
    analyserRef.current = analyser;
    audioElementRef.current = audioElement;

    return analyser;
  }, []);

  const analyzeFrequencyBands = useCallback(() => {
    if (!analyserRef.current) return null;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Define frequency ranges (in Hz)
    const ranges = {
      subBass: [20, 60],
      bass: [60, 250],
      lowerMid: [250, 500],
      mid: [500, 2000],
      upperMid: [2000, 4000],
      presence: [4000, 6000],
      brilliance: [6000, 20000]
    };

    const nyquist = audioContextRef.current?.sampleRate ?? 44100;
    const getBinForFrequency = (freq: number) => Math.floor((freq * bufferLength) / nyquist);

    const bands: FrequencyBands = {
      subBass: 0,
      bass: 0,
      lowerMid: 0,
      mid: 0,
      upperMid: 0,
      presence: 0,
      brilliance: 0
    };

    // Calculate average amplitude for each frequency band
    Object.entries(ranges).forEach(([band, [low, high]]) => {
      const lowBin = getBinForFrequency(low);
      const highBin = getBinForFrequency(high);
      let sum = 0;
      let count = 0;

      for (let i = lowBin; i <= highBin && i < bufferLength; i++) {
        sum += dataArray[i];
        count++;
      }

      bands[band as keyof FrequencyBands] = count > 0 ? (sum / count) / 255 : 0;
    });

    return bands;
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const updateFrequencyBands = () => {
      const bands = analyzeFrequencyBands();
      if (bands && onFrequencyBandUpdate) {
        onFrequencyBandUpdate(bands);
      }
      animationFrameId = requestAnimationFrame(updateFrequencyBands);
    };

    if (analyserRef.current) {
      updateFrequencyBands();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [analyzeFrequencyBands, onFrequencyBandUpdate]);

  return {
    setupAudioContext,
    audioElement: audioElementRef.current
  };
}
