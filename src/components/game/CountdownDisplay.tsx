import { cn } from '@/lib/utils';

interface CountdownDisplayProps {
  seconds: number;
  isActive: boolean;
}

export function CountdownDisplay({ seconds, isActive }: CountdownDisplayProps) {
  const isCritical = seconds <= 10 && seconds > 0;
  
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `T-${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center py-6">
      <div className="inline-block px-8 py-4 rounded-xl bg-console-bg border border-console-border relative overflow-hidden">
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-data-scroll" />
        </div>
        
        <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-widest">
          Mission Elapsed Time
        </p>
        
        <div className={cn(
          'countdown-display',
          isCritical && 'countdown-critical'
        )}>
          {seconds === 0 ? 'LIFTOFF!' : formatTime(seconds)}
        </div>
        
        {isActive && seconds > 0 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              isCritical ? 'bg-danger animate-pulse' : 'bg-success'
            )} />
            <span className={cn(
              'text-xs font-mono uppercase tracking-wider',
              isCritical ? 'text-danger' : 'text-success'
            )}>
              {isCritical ? 'TERMINAL COUNT' : 'COUNTING'}
            </span>
          </div>
        )}
        
        {seconds === 0 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-warning">
              MAIN ENGINE START
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
