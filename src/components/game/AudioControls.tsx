import { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { getGlobalAudioContext, getGlobalMasterGain } from '@/hooks/useLaunchAudio';

interface AudioControlsProps {
  className?: string;
}

export function AudioControls({ className = '' }: AudioControlsProps) {
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(70);

  // Apply volume to global audio context
  const applyVolume = useCallback((newVolume: number) => {
    const masterGain = getGlobalMasterGain();
    const context = getGlobalAudioContext();
    if (masterGain && context) {
      masterGain.gain.setTargetAtTime(newVolume / 100 * 0.4, context.currentTime, 0.1);
    }
    // Store volume globally for other hooks to use
    (window as any).__globalVolume = newVolume / 100;
    // Also apply to speech synthesis
    (window as any).__speechVolume = newVolume / 100;
  }, []);

  // Handle volume change
  const handleVolumeChange = useCallback((values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    applyVolume(newVolume);
  }, [applyVolume]);

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
      applyVolume(previousVolume);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
      applyVolume(0);
    }
  }, [isMuted, previousVolume, volume, applyVolume]);

  // Initialize volume on mount
  useEffect(() => {
    applyVolume(volume);
  }, []);

  const VolumeIcon = isMuted || volume === 0 
    ? VolumeX 
    : volume < 50 
      ? Volume1 
      : Volume2;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleMuteToggle}
        className="p-1.5 rounded hover:bg-secondary/50 transition-colors"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon className={`w-4 h-4 ${isMuted ? 'text-muted-foreground' : 'text-primary'}`} />
      </button>
      <Slider
        value={[volume]}
        onValueChange={handleVolumeChange}
        max={100}
        step={1}
        className="w-20"
        aria-label="Volume"
      />
      <span className="text-xs font-mono text-muted-foreground w-8">
        {volume}%
      </span>
    </div>
  );
}
