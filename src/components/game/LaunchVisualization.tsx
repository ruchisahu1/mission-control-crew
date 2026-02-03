import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useLaunchAudio } from '@/hooks/useLaunchAudio';

interface LaunchVisualizationProps {
  missionTime: number;
  isLaunched: boolean;
  flightPhase: 'ignition' | 'liftoff' | 'maxq' | 'meco' | 'stage2' | 'orbit';
}

export function LaunchVisualization({ missionTime, isLaunched, flightPhase }: LaunchVisualizationProps) {
  const [rocketY, setRocketY] = useState(0);
  
  // Initialize Web Audio API sounds
  useLaunchAudio(isLaunched, flightPhase, missionTime);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Rocket rises and camera follows
  useEffect(() => {
    if (isLaunched) {
      // Accelerating upward motion
      const speed = Math.min(missionTime * 2, 50);
      setRocketY(prev => prev + speed);
    }
  }, [missionTime, isLaunched]);

  // Calculate camera offset to follow rocket - used to scroll the GROUND DOWN
  const cameraOffset = Math.max(0, rocketY);
  
  // Steam intensity increases during ignition/liftoff
  const steamIntensity = flightPhase === 'ignition' ? 1 : flightPhase === 'liftoff' ? 0.7 : 0.3;
  
  // Calculate if ground should still be visible (rocket hasn't gone too high)
  const showGround = cameraOffset < 400;
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-64 overflow-hidden rounded-lg bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700"
    >
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.7,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Ground/Pad with Steam - ANCHORED TO BOTTOM, scrolls DOWN as rocket rises */}
      {showGround && (
        <div 
          className="absolute w-full left-0 transition-transform duration-300"
          style={{ 
            bottom: `${-cameraOffset}px`,
          }}
        >
          {/* Launch pad */}
          <svg viewBox="0 0 200 120" className="w-full h-auto">
            <defs>
              <linearGradient id="launchSteam" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="hsl(0, 0%, 90%)" stopOpacity="0.9" />
                <stop offset="50%" stopColor="hsl(0, 0%, 95%)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="hsl(0, 0%, 100%)" stopOpacity="0" />
              </linearGradient>
              <filter id="steamBlur">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>

            {/* Launch Tower (stays on pad) */}
            <g opacity={isLaunched ? 0.6 : 1}>
              <rect x="30" y="20" width="10" height="80" fill="hsl(220, 15%, 30%)" stroke="hsl(220, 15%, 40%)" strokeWidth="1" />
              {[35, 50, 65, 80].map((y) => (
                <line key={y} x1="30" y1={y} x2="40" y2={y - 10} stroke="hsl(220, 15%, 35%)" strokeWidth="1" />
              ))}
            </g>

            {/* Ground/Pad */}
            <rect x="50" y="95" width="100" height="10" fill="hsl(220, 15%, 20%)" rx="2" />
            <rect x="40" y="103" width="120" height="8" fill="hsl(220, 15%, 15%)" rx="2" />
            
            {/* Steam/Smoke clouds - ANCHORED TO PAD */}
            {isLaunched && (
              <g>
                {/* Multiple steam clouds expanding outward from pad */}
                {Array.from({ length: 8 }).map((_, i) => {
                  const baseX = 100 + (i - 4) * 15;
                  const delay = i * 0.2;
                  return (
                    <ellipse
                      key={i}
                      cx={baseX}
                      cy={90}
                      rx={12}
                      ry={15}
                      fill="url(#launchSteam)"
                      filter="url(#steamBlur)"
                      opacity={steamIntensity * 0.7}
                    >
                      <animate 
                        attributeName="cx" 
                        values={`${baseX};${baseX + (i - 4) * 30};${baseX + (i - 4) * 50}`} 
                        dur="3s" 
                        begin={`${delay}s`}
                        repeatCount="indefinite" 
                      />
                      <animate 
                        attributeName="cy" 
                        values="90;60;30" 
                        dur="4s" 
                        begin={`${delay}s`}
                        repeatCount="indefinite" 
                      />
                      <animate 
                        attributeName="rx" 
                        values="12;25;40" 
                        dur="3.5s" 
                        begin={`${delay}s`}
                        repeatCount="indefinite" 
                      />
                      <animate 
                        attributeName="ry" 
                        values="15;25;35" 
                        dur="3.5s" 
                        begin={`${delay}s`}
                        repeatCount="indefinite" 
                      />
                      <animate 
                        attributeName="opacity" 
                        values={`${steamIntensity * 0.7};${steamIntensity * 0.4};0`} 
                        dur="4s" 
                        begin={`${delay}s`}
                        repeatCount="indefinite" 
                      />
                    </ellipse>
                  );
                })}
                
                {/* Central dense steam column */}
                <ellipse cx="100" cy="85" rx="25" ry="20" fill="url(#launchSteam)" filter="url(#steamBlur)" opacity={steamIntensity}>
                  <animate attributeName="ry" values="20;35;50" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="rx" values="25;45;65" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="85;65;45" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values={`${steamIntensity};${steamIntensity * 0.5};${steamIntensity * 0.1}`} dur="3s" repeatCount="indefinite" />
                </ellipse>
              </g>
            )}
          </svg>
        </div>
      )}

      {/* Rocket - STAYS CENTERED, only subtle vertical adjustment */}
      <div 
        className={cn(
          "absolute left-1/2 -translate-x-1/2 transition-all",
          isLaunched && "duration-300"
        )}
        style={{ 
          // Rocket stays roughly centered, subtle upward motion for effect
          bottom: `calc(35% + ${Math.min(rocketY * 0.05, 20)}px)`,
        }}
      >
        <svg viewBox="0 0 60 120" className={cn(
          "w-16 h-auto",
          isLaunched && flightPhase === 'liftoff' && "animate-pulse"
        )}>
          <defs>
            <linearGradient id="rocketBodyLaunch" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(220, 20%, 25%)" />
              <stop offset="50%" stopColor="hsl(220, 20%, 40%)" />
              <stop offset="100%" stopColor="hsl(220, 20%, 25%)" />
            </linearGradient>
          </defs>
          
          {/* Nose cone */}
          <path d="M30 5 L40 30 L20 30 Z" fill="url(#rocketBodyLaunch)" stroke="hsl(220, 20%, 50%)" strokeWidth="1" />
          
          {/* Upper stage */}
          <rect x="20" y="30" width="20" height="25" fill="url(#rocketBodyLaunch)" stroke="hsl(220, 20%, 50%)" strokeWidth="1" rx="1" />
          
          {/* Middle stage */}
          <rect x="18" y="55" width="24" height="30" fill="url(#rocketBodyLaunch)" stroke="hsl(220, 20%, 50%)" strokeWidth="1" rx="1" />
          
          {/* Lower stage */}
          <rect x="15" y="85" width="30" height="25" fill="url(#rocketBodyLaunch)" stroke="hsl(220, 20%, 50%)" strokeWidth="1" rx="1" />
          
          {/* Engines */}
          <rect x="18" y="107" width="8" height="8" fill="hsl(220, 20%, 30%)" rx="1" />
          <rect x="26" y="105" width="8" height="10" fill="hsl(220, 20%, 30%)" rx="1" />
          <rect x="34" y="107" width="8" height="8" fill="hsl(220, 20%, 30%)" rx="1" />
          
          {/* Fins */}
          <path d="M15 95 L5 115 L15 110" fill="hsl(220, 25%, 35%)" stroke="hsl(220, 20%, 45%)" strokeWidth="1" />
          <path d="M45 95 L55 115 L45 110" fill="hsl(220, 25%, 35%)" stroke="hsl(220, 20%, 45%)" strokeWidth="1" />
        </svg>

        {/* Engine flames - intense during launch */}
        {(isLaunched || flightPhase === 'ignition') && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-2">
            <svg viewBox="0 0 60 80" className="w-16 h-auto">
              <defs>
                <linearGradient id="engineFlame" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="hsl(45, 100%, 95%)" />
                  <stop offset="15%" stopColor="hsl(40, 100%, 75%)" />
                  <stop offset="40%" stopColor="hsl(25, 100%, 55%)" />
                  <stop offset="70%" stopColor="hsl(10, 100%, 45%)" />
                  <stop offset="100%" stopColor="hsl(0, 80%, 30%)" stopOpacity="0" />
                </linearGradient>
                <filter id="flameGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              {/* Main engine plume */}
              <ellipse cx="30" cy="25" rx={isLaunched ? 12 : 6} ry={isLaunched ? 35 : 15} fill="url(#engineFlame)" filter="url(#flameGlow)" opacity="0.95">
                <animate attributeName="ry" values={isLaunched ? "35;45;35" : "15;20;15"} dur="0.1s" repeatCount="indefinite" />
                <animate attributeName="rx" values={isLaunched ? "12;15;12" : "6;8;6"} dur="0.15s" repeatCount="indefinite" />
              </ellipse>
              
              {/* Side engine plumes */}
              <ellipse cx="18" cy="20" rx={isLaunched ? 6 : 3} ry={isLaunched ? 25 : 10} fill="url(#engineFlame)" filter="url(#flameGlow)" opacity="0.85">
                <animate attributeName="ry" values={isLaunched ? "25;30;25" : "10;13;10"} dur="0.12s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="42" cy="20" rx={isLaunched ? 6 : 3} ry={isLaunched ? 25 : 10} fill="url(#engineFlame)" filter="url(#flameGlow)" opacity="0.85">
                <animate attributeName="ry" values={isLaunched ? "25;30;25" : "10;13;10"} dur="0.14s" repeatCount="indefinite" />
              </ellipse>
            </svg>
          </div>
        )}
      </div>

      {/* Phase indicator */}
      <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/50 backdrop-blur-sm">
        <span className={cn(
          "text-xs font-mono font-bold uppercase",
          flightPhase === 'ignition' && "text-warning",
          flightPhase === 'liftoff' && "text-success",
          flightPhase === 'maxq' && "text-danger",
          (flightPhase === 'meco' || flightPhase === 'stage2') && "text-primary",
          flightPhase === 'orbit' && "text-success"
        )}>
          {flightPhase.replace('maxq', 'MAX-Q').replace('meco', 'MECO').toUpperCase()}
        </span>
      </div>

      {/* Altitude indicator */}
      <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/50 backdrop-blur-sm">
        <span className="text-xs font-mono text-muted-foreground">ALT: </span>
        <span className="text-xs font-mono text-foreground font-bold">
          {Math.round(rocketY * 0.5)} km
        </span>
      </div>
    </div>
  );
}
