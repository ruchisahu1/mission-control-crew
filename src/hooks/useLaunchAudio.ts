import { useEffect, useRef, useCallback } from 'react';

type FlightPhase = 'ignition' | 'liftoff' | 'maxq' | 'meco' | 'stage2' | 'orbit';

interface AudioNodes {
  context: AudioContext;
  masterGain: GainNode;
  engineOscillator: OscillatorNode | null;
  engineGain: GainNode;
  midOscillator: OscillatorNode | null;
  midGain: GainNode | null;
  noiseNode: AudioBufferSourceNode | null;
  noiseGain: GainNode;
  rumbleOscillator: OscillatorNode | null;
  rumbleGain: GainNode;
  filter: BiquadFilterNode;
}

// Singleton audio context to persist across component lifecycle
let globalAudioContext: AudioContext | null = null;
let audioInitialized = false;
let globalMasterGain: GainNode | null = null;

// Get the global audio context (for volume control)
export function getGlobalAudioContext(): AudioContext | null {
  return globalAudioContext;
}

// Get the global master gain (for volume control)
export function getGlobalMasterGain(): GainNode | null {
  return globalMasterGain;
}

// Create white noise buffer
function createNoiseBuffer(context: AudioContext) {
  const bufferSize = context.sampleRate * 2;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  return buffer;
}

// Initialize audio context on user interaction - call this from a click handler
export function initGlobalAudioContext(): AudioContext | null {
  if (!globalAudioContext) {
    try {
      globalAudioContext = new AudioContext();
      console.log('Global AudioContext created');
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      return null;
    }
  }
  
  // Resume if suspended (browser autoplay policy)
  if (globalAudioContext.state === 'suspended') {
    globalAudioContext.resume().then(() => {
      console.log('AudioContext resumed');
    });
  }
  
  audioInitialized = true;
  return globalAudioContext;
}

export function useLaunchAudio(
  isLaunched: boolean,
  flightPhase: FlightPhase,
  missionTime: number
) {
  const audioRef = useRef<AudioNodes | null>(null);
  const isPlayingRef = useRef(false);

  // Create audio nodes using the global context
  const createAudioNodes = useCallback(() => {
    if (!globalAudioContext || !audioInitialized) {
      console.warn('Audio context not initialized. Call initGlobalAudioContext() first.');
      return null;
    }
    
    const context = globalAudioContext;
    
    // Resume context if suspended
    if (context.state === 'suspended') {
      context.resume();
    }
    
    // Master gain
    const masterGain = context.createGain();
    const volumeMultiplier = (window as any).__globalVolume ?? 1;
    masterGain.gain.value = 0.4 * volumeMultiplier;
    masterGain.connect(context.destination);
    
    // Set global master gain for volume control
    globalMasterGain = masterGain;
    
    // Low-pass filter for rumble
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 1;
    filter.connect(masterGain);
    
    // Engine gain node
    const engineGain = context.createGain();
    engineGain.gain.value = 0;
    engineGain.connect(filter);
    
    // Noise gain node
    const noiseGain = context.createGain();
    noiseGain.gain.value = 0;
    noiseGain.connect(masterGain);
    
    // Rumble gain node
    const rumbleGain = context.createGain();
    rumbleGain.gain.value = 0;
    rumbleGain.connect(filter);
    
    return {
      context,
      masterGain,
      engineOscillator: null,
      engineGain,
      midOscillator: null,
      midGain: null,
      noiseNode: null,
      noiseGain,
      rumbleOscillator: null,
      rumbleGain,
      filter,
    };
  }, []);

  // Start engine sounds - realistic rocket rumble
  const startEngineSounds = useCallback(() => {
    if (isPlayingRef.current) return;
    
    const nodes = createAudioNodes();
    if (!nodes) return;
    
    audioRef.current = nodes;
    const { context, engineGain, noiseGain, rumbleGain, masterGain } = nodes;
    
    // Create multiple layered oscillators for richer, more realistic rocket sound
    // Primary deep rumble - very low frequency for the chest-thumping bass
    const engineOsc = context.createOscillator();
    engineOsc.type = 'triangle'; // Smoother than sawtooth for deep rumble
    engineOsc.frequency.value = 25; // Lower frequency for deeper rumble
    engineOsc.connect(engineGain);
    engineOsc.start();
    audioRef.current.engineOscillator = engineOsc;
    
    // Secondary sub-bass oscillator for that powerful rocket foundation
    const rumbleOsc = context.createOscillator();
    rumbleOsc.type = 'sine';
    rumbleOsc.frequency.value = 15; // Very low sub-bass
    rumbleOsc.connect(rumbleGain);
    rumbleOsc.start();
    audioRef.current.rumbleOscillator = rumbleOsc;
    
    // Additional mid-range oscillator for body (connected through a separate gain)
    const midOsc = context.createOscillator();
    midOsc.type = 'sawtooth';
    midOsc.frequency.value = 80; // Mid-range crackle
    const midGain = context.createGain();
    // This layer should behave like part of the engine mix, so keep it controllable.
    midGain.gain.value = 0;
    midOsc.connect(midGain);
    midGain.connect(masterGain);
    midOsc.start();

    audioRef.current.midOscillator = midOsc;
    audioRef.current.midGain = midGain;
    
    // Create brown noise (filtered white noise) for the roaring texture
    // This gives the "whoosh" and crackling fire sound
    const noiseBuffer = createNoiseBuffer(context);
    const noiseNode = context.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    
    // Add a bandpass filter to shape the noise into rocket roar
    const noiseFilter = context.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 400; // Center frequency for rocket roar
    noiseFilter.Q.value = 0.5; // Wide bandwidth
    
    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseNode.start();
    audioRef.current.noiseNode = noiseNode;
    
    isPlayingRef.current = true;
    console.log('Engine sounds started');
  }, [createAudioNodes]);

  // Stop all sounds
  const stopAllSounds = useCallback(() => {
    if (!audioRef.current || !isPlayingRef.current) return;
    
    const {
      engineOscillator,
      midOscillator,
      noiseNode,
      rumbleOscillator,
      engineGain,
      midGain,
      noiseGain,
      rumbleGain,
      context,
    } = audioRef.current;
    
    // Fade out
    const now = context.currentTime;
    engineGain.gain.linearRampToValueAtTime(0, now + 0.5);
    midGain?.gain.linearRampToValueAtTime(0, now + 0.5);
    noiseGain.gain.linearRampToValueAtTime(0, now + 0.5);
    rumbleGain.gain.linearRampToValueAtTime(0, now + 0.5);
    
    // Stop oscillators after fade
    setTimeout(() => {
      try {
        engineOscillator?.stop();
        midOscillator?.stop();
        noiseNode?.stop();
        rumbleOscillator?.stop();
      } catch (e) {
        // Already stopped
      }
      if (audioRef.current) {
        audioRef.current.engineOscillator = null;
        audioRef.current.midOscillator = null;
        audioRef.current.midGain = null;
        audioRef.current.noiseNode = null;
        audioRef.current.rumbleOscillator = null;
      }
      isPlayingRef.current = false;
    }, 600);
  }, []);

  // Update sound parameters based on flight phase
  useEffect(() => {
    if (!audioRef.current || !isPlayingRef.current) return;
    
    const { context, engineGain, midGain, noiseGain, rumbleGain, filter, engineOscillator } =
      audioRef.current;
    const now = context.currentTime;
    
    let engineVol = 0;
    let noiseVol = 0;
    let rumbleVol = 0;
    let filterFreq = 200;
    let engineFreq = 40;
    
    // More realistic rocket sound parameters by phase
    switch (flightPhase) {
      case 'ignition':
        // Initial ignition - building rumble with crackling
        engineVol = 0.4;
        noiseVol = 0.35; // More noise for crackling fire
        rumbleVol = 0.5;
        filterFreq = 120;
        engineFreq = 22; // Deep rumble
        break;
      case 'liftoff':
        // Full power - thunderous roar
        engineVol = 0.8;
        noiseVol = 0.7; // Heavy noise for roaring
        rumbleVol = 1.0;
        filterFreq = 250;
        engineFreq = 28; // Slightly higher as engines work harder
        break;
      case 'maxq':
        // Maximum dynamic pressure - intense high-frequency stress
        engineVol = 0.6;
        noiseVol = 0.8; // Peak roar with air turbulence
        rumbleVol = 0.5;
        filterFreq = 380;
        engineFreq = 35;
        break;
      case 'meco':
        // Main engine cutoff - winding down
        engineVol = 0.3;
        noiseVol = 0.2;
        rumbleVol = 0.25;
        filterFreq = 150;
        engineFreq = 30;
        break;
      case 'stage2':
        // Second stage - cleaner, higher-pitched burn
        engineVol = 0.4;
        noiseVol = 0.25;
        rumbleVol = 0.35;
        filterFreq = 220;
        engineFreq = 40; // Higher pitched second stage
        break;
      case 'orbit':
        // Engines off - quiet hum of systems
        engineVol = 0;
        noiseVol = 0.02; // Very quiet ambient
        rumbleVol = 0;
        filterFreq = 80;
        engineFreq = 25;
        break;
    }
    
    // Apply changes smoothly
    engineGain.gain.linearRampToValueAtTime(engineVol, now + 0.3);
    // Mid layer should track engine volume so it doesn't linger into quiet phases.
    midGain?.gain.linearRampToValueAtTime(engineVol * 0.2, now + 0.3);
    noiseGain.gain.linearRampToValueAtTime(noiseVol, now + 0.3);
    rumbleGain.gain.linearRampToValueAtTime(rumbleVol, now + 0.3);
    filter.frequency.linearRampToValueAtTime(filterFreq, now + 0.3);
    
    if (engineOscillator) {
      engineOscillator.frequency.linearRampToValueAtTime(engineFreq, now + 0.3);
    }
  }, [flightPhase]);

  // Start/stop based on launch state - only depend on isLaunched, not missionTime
  useEffect(() => {
    if (isLaunched && audioInitialized) {
      startEngineSounds();
    }
    
    // Always cleanup when isLaunched becomes false or component unmounts
    return () => {
      stopAllSounds();
    };
  }, [isLaunched, startEngineSounds, stopAllSounds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllSounds();
    };
  }, [stopAllSounds]);

  // Add random variations for realism
  useEffect(() => {
    if (!audioRef.current || !isLaunched || !isPlayingRef.current) return;
    
    const { engineOscillator, context } = audioRef.current;
    if (!engineOscillator) return;
    
    // Add slight frequency wobble for realism
    const baseFreq = engineOscillator.frequency.value;
    const wobble = (Math.random() - 0.5) * 8;
    engineOscillator.frequency.linearRampToValueAtTime(
      baseFreq + wobble,
      context.currentTime + 0.1
    );
  }, [missionTime, isLaunched]);

  return {
    startEngineSounds,
    stopAllSounds,
    isPlaying: isPlayingRef.current,
  };
}
