import { useEffect, useRef, useCallback } from 'react';
import { initGlobalAudioContext } from './useLaunchAudio';

interface AudioNodes {
  context: AudioContext;
  masterGain: GainNode;
  beepOscillator: OscillatorNode | null;
  beepGain: GainNode;
  ambientOscillator: OscillatorNode | null;
  ambientGain: GainNode;
  rumbleOscillator: OscillatorNode | null;
  rumbleGain: GainNode;
}

export function useCountdownAudio(countdown: number, isActive: boolean) {
  const audioRef = useRef<AudioNodes | null>(null);
  const isInitializedRef = useRef(false);
  const lastBeepTimeRef = useRef<number>(0);

  // Initialize audio nodes
  const initAudio = useCallback(() => {
    const context = initGlobalAudioContext();
    if (!context || isInitializedRef.current) return;

    // Master gain (respect global volume setting)
    const volumeMultiplier = (window as any).__globalVolume ?? 1;
    const masterGain = context.createGain();
    masterGain.gain.value = 0.3 * volumeMultiplier;
    masterGain.connect(context.destination);

    // Beep gain
    const beepGain = context.createGain();
    beepGain.gain.value = 0;
    beepGain.connect(masterGain);

    // Ambient gain
    const ambientGain = context.createGain();
    ambientGain.gain.value = 0;
    ambientGain.connect(masterGain);

    // Rumble gain
    const rumbleGain = context.createGain();
    rumbleGain.gain.value = 0;
    rumbleGain.connect(masterGain);

    audioRef.current = {
      context,
      masterGain,
      beepOscillator: null,
      beepGain,
      ambientOscillator: null,
      ambientGain,
      rumbleOscillator: null,
      rumbleGain,
    };

    isInitializedRef.current = true;
  }, []);

  // Play countdown beep
  const playBeep = useCallback((frequency: number = 880, duration: number = 0.1) => {
    if (!audioRef.current) return;
    
    const { context, beepGain } = audioRef.current;
    const now = context.currentTime;

    // Create a new oscillator for each beep
    const beepOsc = context.createOscillator();
    beepOsc.type = 'sine';
    beepOsc.frequency.value = frequency;
    beepOsc.connect(beepGain);

    // Quick envelope
    beepGain.gain.cancelScheduledValues(now);
    beepGain.gain.setValueAtTime(0, now);
    beepGain.gain.linearRampToValueAtTime(0.6, now + 0.01);
    beepGain.gain.linearRampToValueAtTime(0, now + duration);

    beepOsc.start(now);
    beepOsc.stop(now + duration + 0.05);
  }, []);

  // Start ambient tension sounds
  const startAmbientSounds = useCallback(() => {
    if (!audioRef.current) return;
    
    const { context, ambientGain, rumbleGain } = audioRef.current;

    // Low ambient drone
    const ambientOsc = context.createOscillator();
    ambientOsc.type = 'sine';
    ambientOsc.frequency.value = 60;
    ambientOsc.connect(ambientGain);
    ambientOsc.start();
    audioRef.current.ambientOscillator = ambientOsc;

    // Sub-bass rumble
    const rumbleOsc = context.createOscillator();
    rumbleOsc.type = 'triangle';
    rumbleOsc.frequency.value = 30;
    rumbleOsc.connect(rumbleGain);
    rumbleOsc.start();
    audioRef.current.rumbleOscillator = rumbleOsc;

    // Fade in ambient
    const now = context.currentTime;
    ambientGain.gain.linearRampToValueAtTime(0.15, now + 1);
    rumbleGain.gain.linearRampToValueAtTime(0.1, now + 1);
  }, []);

  // Update audio intensity based on countdown
  useEffect(() => {
    if (!audioRef.current || !isActive) return;

    const { context, ambientGain, rumbleGain, ambientOscillator } = audioRef.current;
    const now = context.currentTime;

    // Increase intensity as countdown progresses
    const intensity = Math.min(1, (60 - countdown) / 60);
    const ambientVol = 0.1 + intensity * 0.2;
    const rumbleVol = 0.05 + intensity * 0.25;

    ambientGain.gain.linearRampToValueAtTime(ambientVol, now + 0.3);
    rumbleGain.gain.linearRampToValueAtTime(rumbleVol, now + 0.3);

    // Increase pitch slightly as we get closer
    if (ambientOscillator) {
      const freq = 60 + intensity * 40;
      ambientOscillator.frequency.linearRampToValueAtTime(freq, now + 0.3);
    }
  }, [countdown, isActive]);

  // Play beeps at specific countdown moments
  useEffect(() => {
    if (!isActive || !audioRef.current) return;

    // Prevent duplicate beeps
    if (lastBeepTimeRef.current === countdown) return;
    lastBeepTimeRef.current = countdown;

    // Beep patterns based on countdown
    if (countdown <= 10 && countdown > 0) {
      // Final 10 seconds - beep every second, higher pitch as we approach 0
      const freq = 880 + (10 - countdown) * 50;
      playBeep(freq, 0.15);
    } else if (countdown === 20 || countdown === 30 || countdown === 40 || countdown === 50) {
      // Milestone beeps
      playBeep(660, 0.2);
    } else if (countdown === 0) {
      // Liftoff beep - triumphant double beep
      playBeep(1200, 0.2);
      setTimeout(() => playBeep(1400, 0.3), 200);
    }
  }, [countdown, isActive, playBeep]);

  // Stop all ambient sounds
  const stopAmbientSounds = useCallback(() => {
    if (!audioRef.current) return;
    
    const { context, ambientGain, rumbleGain, ambientOscillator, rumbleOscillator } = audioRef.current;
    const now = context.currentTime;

    // Fade out
    ambientGain.gain.linearRampToValueAtTime(0, now + 0.3);
    rumbleGain.gain.linearRampToValueAtTime(0, now + 0.3);

    setTimeout(() => {
      try {
        ambientOscillator?.stop();
        rumbleOscillator?.stop();
      } catch (e) {
        // Already stopped
      }
      if (audioRef.current) {
        audioRef.current.ambientOscillator = null;
        audioRef.current.rumbleOscillator = null;
      }
    }, 400);
  }, []);

  // Start/stop based on active state
  useEffect(() => {
    if (isActive) {
      initAudio();
      // Small delay to ensure context is ready
      setTimeout(() => {
        startAmbientSounds();
      }, 100);
    } else {
      // Stop sounds when not active
      stopAmbientSounds();
    }

    // Always cleanup on unmount
    return () => {
      stopAmbientSounds();
    };
  }, [isActive, initAudio, startAmbientSounds, stopAmbientSounds]);

  return { playBeep };
}
