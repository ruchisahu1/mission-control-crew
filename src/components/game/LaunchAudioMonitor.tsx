import { cn } from '@/lib/utils';

interface LaunchAudioMonitorProps {
  missionTime: number;
  isLaunched: boolean;
  flightPhase: 'ignition' | 'liftoff' | 'maxq' | 'meco' | 'stage2' | 'orbit';
}

export function LaunchAudioMonitor({ missionTime, isLaunched, flightPhase }: LaunchAudioMonitorProps) {
  // Audio intensity based on flight phase
  const getIntensity = () => {
    switch (flightPhase) {
      case 'ignition': return 0.5;
      case 'liftoff': return 1.0;
      case 'maxq': return 0.9;
      case 'meco': return 0.6;
      case 'stage2': return 0.7;
      case 'orbit': return 0.2;
      default: return 0.3;
    }
  };
  
  const intensity = getIntensity();
  const activeBars = Math.floor(intensity * 12);

  // Phase labels and colors
  const getPhaseInfo = () => {
    switch (flightPhase) {
      case 'ignition': return { label: 'ENGINE IGNITION', color: 'text-warning' };
      case 'liftoff': return { label: 'LIFTOFF', color: 'text-success' };
      case 'maxq': return { label: 'MAX-Q', color: 'text-danger' };
      case 'meco': return { label: 'STAGE SEPARATION', color: 'text-primary' };
      case 'stage2': return { label: 'SECOND STAGE', color: 'text-info' };
      case 'orbit': return { label: 'ORBITAL INSERTION', color: 'text-success' };
      default: return { label: 'STANDBY', color: 'text-muted-foreground' };
    }
  };
  
  const phaseInfo = getPhaseInfo();

  // Generate bar heights with time-based animation
  const generateBarHeight = (index: number) => {
    const base = Math.sin(index * 0.8 + missionTime * 0.5) * 0.5 + 0.5;
    const phaseBoost = index < activeBars ? intensity : 0.1;
    return 15 + base * 70 * phaseBoost;
  };

  return (
    <div className="console-panel !p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          Audio Monitor
        </span>
        <span className={cn("text-[10px] font-mono font-bold", phaseInfo.color)}>
          {phaseInfo.label}
        </span>
      </div>

      {/* Equalizer bars */}
      <div className="flex items-end justify-center gap-1 h-12 px-2">
        {Array.from({ length: 12 }).map((_, i) => {
          const isActive = i < activeBars;
          const height = generateBarHeight(i);
          
          return (
            <div
              key={i}
              className={cn(
                "w-2 rounded-t transition-all duration-100",
                isActive 
                  ? flightPhase === 'maxq' || flightPhase === 'liftoff'
                    ? "bg-danger" 
                    : flightPhase === 'ignition'
                      ? "bg-warning" 
                      : "bg-primary"
                  : "bg-muted"
              )}
              style={{ 
                height: `${height}%`,
                opacity: isActive ? 0.8 + Math.random() * 0.2 : 0.3,
              }}
            />
          );
        })}
      </div>

      {/* Intensity meter */}
      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between text-[9px] font-mono">
          <span className="text-muted-foreground">ENGINE THRUST</span>
          <span className={cn(
            intensity > 0.8 ? "text-danger" : 
            intensity > 0.5 ? "text-warning" : "text-primary"
          )}>
            {Math.round(intensity * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-300 rounded-full",
              intensity > 0.8 
                ? "bg-gradient-to-r from-warning to-danger" 
                : intensity > 0.5 
                  ? "bg-gradient-to-r from-primary to-warning" 
                  : "bg-primary"
            )}
            style={{ width: `${intensity * 100}%` }}
          />
        </div>
      </div>

      {/* Sound wave visualization */}
      <div className="mt-2 flex items-center justify-center gap-0.5">
        {Array.from({ length: 20 }).map((_, i) => {
          const wave = Math.sin((i + missionTime * 3) * 0.6) * intensity;
          return (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all",
                flightPhase === 'maxq' ? "bg-danger/60" : 
                flightPhase === 'liftoff' ? "bg-success/60" : "bg-primary/50"
              )}
              style={{
                height: `${4 + Math.abs(wave) * 10}px`,
                opacity: 0.4 + Math.abs(wave) * 0.6
              }}
            />
          );
        })}
      </div>

      {/* Status indicators */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-[8px] font-mono">
        <div className="flex items-center gap-1">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            isLaunched ? "bg-success animate-pulse" : "bg-muted"
          )} />
          <span className="text-muted-foreground">S1</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            flightPhase === 'stage2' || flightPhase === 'orbit' ? "bg-success animate-pulse" : "bg-muted"
          )} />
          <span className="text-muted-foreground">S2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            flightPhase === 'maxq' ? "bg-danger animate-pulse" : 
            isLaunched ? "bg-warning" : "bg-muted"
          )} />
          <span className="text-muted-foreground">DYN</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            flightPhase === 'orbit' ? "bg-success animate-pulse" : "bg-muted"
          )} />
          <span className="text-muted-foreground">ORB</span>
        </div>
      </div>
    </div>
  );
}
