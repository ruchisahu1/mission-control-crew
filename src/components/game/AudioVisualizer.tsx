import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  countdown: number;
  isCountdownActive: boolean;
}

export function AudioVisualizer({ countdown, isCountdownActive }: AudioVisualizerProps) {
  // Audio intensity increases as we approach liftoff
  const baseIntensity = isCountdownActive ? 0.3 : 0.1;
  const countdownIntensity = isCountdownActive 
    ? Math.min(1, baseIntensity + (60 - countdown) * 0.015) 
    : baseIntensity;
  
  // More bars active during countdown
  const activeBars = isCountdownActive 
    ? Math.min(12, Math.floor(3 + (60 - countdown) * 0.2)) 
    : 3;

  // Generate random heights for each bar (simulated audio levels)
  const generateBarHeight = (index: number, seed: number) => {
    const base = Math.sin(index * 0.5 + seed) * 0.5 + 0.5;
    const intensity = index < activeBars ? countdownIntensity : 0.1;
    return 10 + base * 40 * intensity;
  };

  // Phase labels
  const getPhaseLabel = () => {
    if (!isCountdownActive) return 'STANDBY';
    if (countdown > 40) return 'SYSTEMS CHECK';
    if (countdown > 20) return 'FUEL FLOW';
    if (countdown > 10) return 'ENGINE CHILL';
    if (countdown > 3) return 'ENGINE START';
    return 'IGNITION';
  };

  const getPhaseColor = () => {
    if (!isCountdownActive) return 'text-muted-foreground';
    if (countdown > 20) return 'text-primary';
    if (countdown > 10) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="console-panel !p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          Audio Monitor
        </span>
        <span className={cn("text-[10px] font-mono font-bold", getPhaseColor())}>
          {getPhaseLabel()}
        </span>
      </div>

      {/* Equalizer bars */}
      <div className="flex items-end justify-center gap-1 h-12 px-2">
        {Array.from({ length: 12 }).map((_, i) => {
          const isActive = i < activeBars;
          const height = generateBarHeight(i, countdown * 0.1);
          
          return (
            <div
              key={i}
              className={cn(
                "w-2 rounded-t transition-all",
                isActive 
                  ? countdown <= 10 
                    ? "bg-danger" 
                    : countdown <= 20 
                      ? "bg-warning" 
                      : "bg-primary"
                  : "bg-muted"
              )}
              style={{ 
                height: `${height}%`,
                opacity: isActive ? 0.8 + Math.random() * 0.2 : 0.3,
                transition: 'height 0.1s ease-out'
              }}
            >
              {/* Animated bar with random flicker */}
              {isActive && isCountdownActive && (
                <div 
                  className="w-full h-full rounded-t animate-pulse"
                  style={{
                    animationDuration: `${0.1 + Math.random() * 0.2}s`
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Intensity meter */}
      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between text-[9px] font-mono">
          <span className="text-muted-foreground">ENGINE RUMBLE</span>
          <span className={cn(
            countdownIntensity > 0.7 ? "text-danger" : 
            countdownIntensity > 0.4 ? "text-warning" : "text-primary"
          )}>
            {Math.round(countdownIntensity * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-300 rounded-full",
              countdownIntensity > 0.7 
                ? "bg-gradient-to-r from-warning to-danger" 
                : countdownIntensity > 0.4 
                  ? "bg-gradient-to-r from-primary to-warning" 
                  : "bg-primary"
            )}
            style={{ width: `${countdownIntensity * 100}%` }}
          />
        </div>
      </div>

      {/* Sound wave visualization */}
      <div className="mt-2 flex items-center justify-center gap-0.5">
        {Array.from({ length: 20 }).map((_, i) => {
          const wave = Math.sin((i + countdown * 2) * 0.5) * countdownIntensity;
          return (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all",
                isCountdownActive && countdown <= 10 ? "bg-danger" : "bg-primary/50"
              )}
              style={{
                height: `${4 + Math.abs(wave) * 8}px`,
                opacity: 0.4 + Math.abs(wave) * 0.6
              }}
            />
          );
        })}
      </div>

      {/* Audio status indicators */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-[8px] font-mono">
        <div className="flex items-center gap-1">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            isCountdownActive ? "bg-success animate-pulse" : "bg-muted"
          )} />
          <span className="text-muted-foreground">PAD</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            isCountdownActive && countdown <= 20 ? "bg-warning animate-pulse" : "bg-muted"
          )} />
          <span className="text-muted-foreground">ENG</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            isCountdownActive && countdown <= 3 ? "bg-danger animate-pulse" : "bg-muted"
          )} />
          <span className="text-muted-foreground">IGN</span>
        </div>
      </div>
    </div>
  );
}
