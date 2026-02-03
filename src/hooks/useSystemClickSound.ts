import { useCallback } from 'react';
import { initGlobalAudioContext } from './useLaunchAudio';

export function useSystemClickSound() {
  const playActivateSound = useCallback(() => {
    const context = initGlobalAudioContext();
    if (!context) return;

    const volumeMultiplier = (window as any).__globalVolume ?? 1;
    if (volumeMultiplier === 0) return;

    const now = context.currentTime;

    // Master gain
    const masterGain = context.createGain();
    masterGain.gain.value = 0.25 * volumeMultiplier;
    masterGain.connect(context.destination);

    // Rising tone - activation feel
    const osc1 = context.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(400, now);
    osc1.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    
    const gain1 = context.createGain();
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.5, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.2);

    // Click transient
    const osc2 = context.createOscillator();
    osc2.type = 'square';
    osc2.frequency.value = 1200;
    
    const gain2 = context.createGain();
    gain2.gain.setValueAtTime(0.3, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
    
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now);
    osc2.stop(now + 0.05);
  }, []);

  const playLockedSound = useCallback(() => {
    const context = initGlobalAudioContext();
    if (!context) return;

    const volumeMultiplier = (window as any).__globalVolume ?? 1;
    if (volumeMultiplier === 0) return;

    const now = context.currentTime;

    const masterGain = context.createGain();
    masterGain.gain.value = 0.2 * volumeMultiplier;
    masterGain.connect(context.destination);

    // Low buzz for locked/error
    const osc = context.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 150;
    
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.15);
    
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }, []);

  const playReadySound = useCallback(() => {
    const context = initGlobalAudioContext();
    if (!context) return;

    const volumeMultiplier = (window as any).__globalVolume ?? 1;
    if (volumeMultiplier === 0) return;

    const now = context.currentTime;

    const masterGain = context.createGain();
    masterGain.gain.value = 0.25 * volumeMultiplier;
    masterGain.connect(context.destination);

    // Success chime - two rising tones
    const osc1 = context.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 600;
    
    const gain1 = context.createGain();
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.4, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Second higher tone
    const osc2 = context.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 900;
    
    const gain2 = context.createGain();
    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0.5, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.3);
  }, []);

  return { playActivateSound, playLockedSound, playReadySound };
}
