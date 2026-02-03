import { useEffect, useRef, useCallback } from 'react';

interface VoiceCountdownOptions {
  countdown: number;
  isActive: boolean;
  onLiftoff?: () => void;
}

const COUNTDOWN_ANNOUNCEMENTS: Record<number, string> = {
  60: 'T minus 60 seconds and counting',
  50: 'T minus 50 seconds',
  40: 'T minus 40 seconds. Fuel transfer complete',
  30: 'T minus 30 seconds. All systems nominal',
  20: 'T minus 20 seconds. Engine chill sequence',
  15: 'T minus 15 seconds',
  10: 'Ten',
  9: 'Nine',
  8: 'Eight',
  7: 'Seven',
  6: 'Six',
  5: 'Five',
  4: 'Four',
  3: 'Three',
  2: 'Two',
  1: 'One',
  0: 'Liftoff! We have liftoff!',
};

export function useVoiceCountdown({ countdown, isActive, onLiftoff }: VoiceCountdownOptions) {
  const lastAnnouncedRef = useRef<number | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = useCallback((text: string, rate: number = 1.0, pitch: number = 0.9) => {
    if (!synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 0.9;
    
    // Try to find a suitable voice (prefer US English)
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('David'))
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    synthRef.current.speak(utterance);
  }, []);

  // Handle countdown announcements
  useEffect(() => {
    if (!isActive || !synthRef.current) return;
    
    const announcement = COUNTDOWN_ANNOUNCEMENTS[countdown];
    
    // Only announce if we haven't already announced this number
    if (announcement && lastAnnouncedRef.current !== countdown) {
      lastAnnouncedRef.current = countdown;
      
      // Faster speech for final countdown (10-1)
      const rate = countdown <= 10 && countdown > 0 ? 1.2 : 1.0;
      const pitch = countdown <= 10 && countdown > 0 ? 1.0 : 0.9;
      
      speak(announcement, rate, pitch);
      
      // Trigger liftoff callback
      if (countdown === 0 && onLiftoff) {
        onLiftoff();
      }
    }
  }, [countdown, isActive, speak, onLiftoff]);

  // Reset when countdown is not active
  useEffect(() => {
    if (!isActive) {
      lastAnnouncedRef.current = null;
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    }
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  return { speak };
}
