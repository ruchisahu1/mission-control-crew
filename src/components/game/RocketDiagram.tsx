import { cn } from '@/lib/utils';
import { SystemControl } from '@/types/game';

interface RocketDiagramProps {
  systems: SystemControl[];
  isLaunched: boolean;
  isCountdownActive?: boolean;
  countdown?: number;
}

export function RocketDiagram({ systems, isLaunched, isCountdownActive = false, countdown = 30 }: RocketDiagramProps) {
  // Calculate animation intensity based on countdown
  const countdownProgress = isCountdownActive ? Math.max(0, 1 - countdown / 30) : 0;
  const isEngineTest = isCountdownActive && countdown <= 20 && countdown > 3;
  const isIgnitionSequence = isCountdownActive && countdown <= 3;
  const getSystemStatus = (systemId: string) => {
    const system = systems.find(s => s.id === systemId);
    if (!system) return 'off';
    return system.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'off':
        return 'fill-muted stroke-border';
      case 'loading':
      case 'calibrating':
        return 'fill-warning/30 stroke-warning animate-pulse';
      case 'warning':
        return 'fill-warning/30 stroke-warning';
      case 'critical':
        return 'fill-danger/30 stroke-danger animate-warning-flash';
      default:
        return 'fill-success/20 stroke-success';
    }
  };

  return (
    <div className="relative w-full max-w-[200px] mx-auto">
      <svg
        viewBox="0 0 100 250"
        className={cn(
          'w-full h-auto transition-all duration-1000',
          isLaunched && 'animate-rocket-launch'
        )}
      >
        {/* Rocket body */}
        <defs>
          <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(220, 20%, 25%)" />
            <stop offset="50%" stopColor="hsl(220, 20%, 35%)" />
            <stop offset="100%" stopColor="hsl(220, 20%, 25%)" />
          </linearGradient>
          <linearGradient id="flame" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="hsl(35, 90%, 60%)" />
            <stop offset="50%" stopColor="hsl(20, 90%, 55%)" />
            <stop offset="100%" stopColor="hsl(0, 80%, 50%)" />
          </linearGradient>
          <linearGradient id="flameTest" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="hsl(200, 80%, 70%)" />
            <stop offset="40%" stopColor="hsl(35, 90%, 60%)" />
            <stop offset="100%" stopColor="hsl(0, 70%, 40%)" />
          </linearGradient>
          <linearGradient id="smoke" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="hsl(220, 10%, 40%)" stopOpacity="0.8" />
            <stop offset="50%" stopColor="hsl(220, 10%, 60%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(220, 10%, 80%)" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="smokeBlur">
            <feGaussianBlur stdDeviation="3"/>
          </filter>
        </defs>

        {/* Nose cone - Guidance */}
        <path
          d="M50 10 L65 50 L35 50 Z"
          className={cn('transition-all duration-300', getStatusColor(getSystemStatus('guidance')))}
          strokeWidth="1.5"
        />
        
        {/* Upper stage - Comms */}
        <rect
          x="35" y="50" width="30" height="40"
          className={cn('transition-all duration-300', getStatusColor(getSystemStatus('comms')))}
          strokeWidth="1.5"
          rx="2"
        />

        {/* Payload section */}
        <rect
          x="38" y="55" width="24" height="15"
          className="fill-primary/20 stroke-primary/50"
          strokeWidth="1"
          rx="1"
        />
        <text x="50" y="65" textAnchor="middle" className="fill-primary text-[6px] font-mono">
          PAYLOAD
        </text>

        {/* Middle stage - Power */}
        <rect
          x="32" y="90" width="36" height="50"
          className={cn('transition-all duration-300', getStatusColor(getSystemStatus('power')))}
          strokeWidth="1.5"
          rx="2"
        />

        {/* Fuel tank - Fuel Loading */}
        <rect
          x="35" y="95" width="30" height="40"
          className={cn('transition-all duration-300', getStatusColor(getSystemStatus('fuel')))}
          strokeWidth="1"
          rx="1"
        />

        {/* Lower stage - Propulsion/Chilldown */}
        <rect
          x="28" y="140" width="44" height="60"
          className={cn('transition-all duration-300', getStatusColor(getSystemStatus('chilldown')))}
          strokeWidth="1.5"
          rx="2"
        />

        {/* Engines */}
        <rect x="32" y="185" width="12" height="15" fill="url(#rocketBody)" stroke="hsl(220, 20%, 40%)" strokeWidth="1" rx="1" />
        <rect x="44" y="182" width="12" height="18" fill="url(#rocketBody)" stroke="hsl(220, 20%, 40%)" strokeWidth="1" rx="1" />
        <rect x="56" y="185" width="12" height="15" fill="url(#rocketBody)" stroke="hsl(220, 20%, 40%)" strokeWidth="1" rx="1" />

        {/* Engine bells */}
        <path d="M34 200 L32 215 L42 215 L40 200" fill="url(#rocketBody)" stroke="hsl(220, 20%, 40%)" strokeWidth="1" />
        <path d="M46 200 L43 220 L57 220 L54 200" fill="url(#rocketBody)" stroke="hsl(220, 20%, 40%)" strokeWidth="1" />
        <path d="M58 200 L56 215 L66 215 L64 200" fill="url(#rocketBody)" stroke="hsl(220, 20%, 40%)" strokeWidth="1" />

        {/* Engine test flames during countdown */}
        {isEngineTest && (
          <g className="animate-engine-test" filter="url(#glow)">
            {/* Small test flames */}
            <ellipse 
              cx="37" cy="218" 
              rx={2 + countdownProgress * 2} 
              ry={4 + countdownProgress * 6} 
              fill="url(#flameTest)" 
              opacity={0.5 + countdownProgress * 0.3}
            >
              <animate attributeName="ry" values={`${4 + countdownProgress * 6};${6 + countdownProgress * 8};${4 + countdownProgress * 6}`} dur="0.3s" repeatCount="indefinite" />
            </ellipse>
            <ellipse 
              cx="50" cy="222" 
              rx={3 + countdownProgress * 2} 
              ry={6 + countdownProgress * 8} 
              fill="url(#flameTest)" 
              opacity={0.6 + countdownProgress * 0.3}
            >
              <animate attributeName="ry" values={`${6 + countdownProgress * 8};${8 + countdownProgress * 10};${6 + countdownProgress * 8}`} dur="0.25s" repeatCount="indefinite" />
            </ellipse>
            <ellipse 
              cx="63" cy="218" 
              rx={2 + countdownProgress * 2} 
              ry={4 + countdownProgress * 6} 
              fill="url(#flameTest)" 
              opacity={0.5 + countdownProgress * 0.3}
            >
              <animate attributeName="ry" values={`${4 + countdownProgress * 6};${6 + countdownProgress * 8};${4 + countdownProgress * 6}`} dur="0.35s" repeatCount="indefinite" />
            </ellipse>
          </g>
        )}

        {/* Smoke during engine test */}
        {isEngineTest && (
          <g filter="url(#smokeBlur)">
            {/* Left smoke plume */}
            <ellipse cx="25" cy="220" rx="8" ry="12" fill="url(#smoke)">
              <animate attributeName="cy" values="220;200;180" dur="2s" repeatCount="indefinite" />
              <animate attributeName="rx" values="8;15;20" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.3;0" dur="2s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="30" cy="225" rx="6" ry="10" fill="url(#smoke)">
              <animate attributeName="cy" values="225;210;195" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="rx" values="6;12;18" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.25;0" dur="1.5s" repeatCount="indefinite" />
            </ellipse>
            {/* Right smoke plume */}
            <ellipse cx="75" cy="220" rx="8" ry="12" fill="url(#smoke)">
              <animate attributeName="cy" values="220;200;180" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="rx" values="8;15;20" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.3;0" dur="2.2s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="70" cy="225" rx="6" ry="10" fill="url(#smoke)">
              <animate attributeName="cy" values="225;210;195" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="rx" values="6;12;18" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.25;0" dur="1.8s" repeatCount="indefinite" />
            </ellipse>
            {/* Center smoke */}
            <ellipse cx="50" cy="235" rx="10" ry="8" fill="url(#smoke)">
              <animate attributeName="cy" values="235;215;195" dur="1.7s" repeatCount="indefinite" />
              <animate attributeName="rx" values="10;20;30" dur="1.7s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.35;0" dur="1.7s" repeatCount="indefinite" />
            </ellipse>
          </g>
        )}

        {/* Ignition sequence - more intense */}
        {isIgnitionSequence && (
          <g filter="url(#glow)">
            <ellipse cx="37" cy="222" rx="4" ry="10" fill="url(#flame)" opacity="0.9">
              <animate attributeName="ry" values="10;14;10" dur="0.15s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="50" cy="228" rx="5" ry="14" fill="url(#flame)" opacity="0.95">
              <animate attributeName="ry" values="14;18;14" dur="0.12s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="63" cy="222" rx="4" ry="10" fill="url(#flame)" opacity="0.9">
              <animate attributeName="ry" values="10;14;10" dur="0.18s" repeatCount="indefinite" />
            </ellipse>
          </g>
        )}

        {/* Full flames when launched */}
        {isLaunched && (
          <g filter="url(#glow)">
            <ellipse cx="37" cy="225" rx="4" ry="15" fill="url(#flame)" opacity="0.9">
              <animate attributeName="ry" values="15;20;15" dur="0.1s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="50" cy="235" rx="6" ry="20" fill="url(#flame)" opacity="0.9">
              <animate attributeName="ry" values="20;26;20" dur="0.08s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="63" cy="225" rx="4" ry="15" fill="url(#flame)" opacity="0.9">
              <animate attributeName="ry" values="15;20;15" dur="0.12s" repeatCount="indefinite" />
            </ellipse>
          </g>
        )}

        {/* Fins */}
        <path d="M28 170 L15 200 L28 195" className="fill-secondary stroke-border" strokeWidth="1" />
        <path d="M72 170 L85 200 L72 195" className="fill-secondary stroke-border" strokeWidth="1" />

        {/* Vibration indicator during countdown */}
        {isCountdownActive && (
          <g className="animate-pulse" opacity={0.3 + countdownProgress * 0.4}>
            <line x1="15" y1="210" x2="25" y2="210" stroke="hsl(var(--warning))" strokeWidth="1" strokeDasharray="2,2">
              <animate attributeName="x1" values="15;12;15" dur="0.2s" repeatCount="indefinite" />
            </line>
            <line x1="75" y1="210" x2="85" y2="210" stroke="hsl(var(--warning))" strokeWidth="1" strokeDasharray="2,2">
              <animate attributeName="x2" values="85;88;85" dur="0.2s" repeatCount="indefinite" />
            </line>
          </g>
        )}
      </svg>

      {/* Status legend */}
      <div className="mt-4 space-y-1 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-success/20 border border-success" />
          <span className="text-muted-foreground">System Ready</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-warning/30 border border-warning" />
          <span className="text-muted-foreground">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-muted border border-border" />
          <span className="text-muted-foreground">Offline</span>
        </div>
      </div>
    </div>
  );
}
