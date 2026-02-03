import { cn } from '@/lib/utils';

interface GroundSupportEquipmentProps {
  countdown: number;
  isCountdownActive: boolean;
}

export function GroundSupportEquipment({ countdown, isCountdownActive }: GroundSupportEquipmentProps) {
  // Timeline: T-60 to T-0
  // Fuel lines disconnect at T-40
  // Umbilicals release at T-20
  // Tower retracts at T-10
  const fuelLinesConnected = !isCountdownActive || countdown > 40;
  const umbilicalsConnected = !isCountdownActive || countdown > 20;
  const towerRetracted = isCountdownActive && countdown <= 10;
  
  // Animation progress for smooth transitions
  const fuelLineProgress = isCountdownActive && countdown <= 45 && countdown > 40 
    ? (45 - countdown) / 5 : (countdown <= 40 ? 1 : 0);
  const umbilicalProgress = isCountdownActive && countdown <= 25 && countdown > 20 
    ? (25 - countdown) / 5 : (countdown <= 20 ? 1 : 0);
  const towerProgress = isCountdownActive && countdown <= 15 && countdown > 10 
    ? (15 - countdown) / 5 : (countdown <= 10 ? 1 : 0);
  
  // Countdown-based animation states
  const countdownProgress = isCountdownActive ? Math.max(0, 1 - countdown / 30) : 0;
  const isEngineTest = isCountdownActive && countdown <= 20 && countdown > 3;
  const isIgnitionSequence = isCountdownActive && countdown <= 3;

  return (
    <svg viewBox="0 0 200 280" className="w-full h-auto">
      <defs>
        {/* Gradients */}
        <linearGradient id="towerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(220, 15%, 25%)" />
          <stop offset="50%" stopColor="hsl(220, 15%, 35%)" />
          <stop offset="100%" stopColor="hsl(220, 15%, 25%)" />
        </linearGradient>
        <linearGradient id="fuelLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(200, 60%, 40%)" />
          <stop offset="100%" stopColor="hsl(200, 60%, 30%)" />
        </linearGradient>
        <linearGradient id="umbilicalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(45, 70%, 45%)" />
          <stop offset="100%" stopColor="hsl(45, 70%, 35%)" />
        </linearGradient>
        <linearGradient id="rocketBodyGSE" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(220, 20%, 25%)" />
          <stop offset="50%" stopColor="hsl(220, 20%, 35%)" />
          <stop offset="100%" stopColor="hsl(220, 20%, 25%)" />
        </linearGradient>
        <linearGradient id="flameGSE" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="hsl(35, 90%, 60%)" />
          <stop offset="50%" stopColor="hsl(20, 90%, 55%)" />
          <stop offset="100%" stopColor="hsl(0, 80%, 50%)" />
        </linearGradient>
        <linearGradient id="flameTestGSE" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="hsl(200, 80%, 70%)" />
          <stop offset="40%" stopColor="hsl(35, 90%, 60%)" />
          <stop offset="100%" stopColor="hsl(0, 70%, 40%)" />
        </linearGradient>
        <linearGradient id="smokeGSE" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="hsl(220, 10%, 40%)" stopOpacity="0.8" />
          <stop offset="50%" stopColor="hsl(220, 10%, 60%)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="hsl(220, 10%, 80%)" stopOpacity="0" />
        </linearGradient>
        <filter id="equipmentGlow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="flameGlow">
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

      {/* Launch Pad Base */}
      <rect x="60" y="240" width="80" height="10" fill="hsl(220, 15%, 20%)" stroke="hsl(220, 15%, 30%)" strokeWidth="1" rx="1" />
      <rect x="50" y="248" width="100" height="8" fill="hsl(220, 15%, 15%)" stroke="hsl(220, 15%, 25%)" strokeWidth="1" rx="2" />

      {/* Launch Tower - Rotates away during countdown */}
      <g 
        className="transition-transform duration-[3000ms] ease-in-out origin-bottom-left"
        style={{ 
          transform: towerRetracted 
            ? 'rotate(-45deg) translateX(-20px)' 
            : `rotate(${-towerProgress * 45}deg) translateX(${-towerProgress * 20}px)` 
        }}
      >
        {/* Tower structure */}
        <rect x="25" y="60" width="12" height="185" fill="url(#towerGradient)" stroke="hsl(220, 15%, 40%)" strokeWidth="1" />
        
        {/* Tower cross-beams */}
        {[80, 110, 140, 170, 200].map((y) => (
          <line key={y} x1="25" y1={y} x2="37" y2={y - 15} stroke="hsl(220, 15%, 35%)" strokeWidth="1" />
        ))}
        
        {/* Tower access arm */}
        <rect x="37" y="100" width="35" height="6" fill="url(#towerGradient)" stroke="hsl(220, 15%, 40%)" strokeWidth="1" rx="1" />
        
        {/* Tower warning lights */}
        <circle cx="31" cy="65" r="2" fill={isCountdownActive ? "hsl(0, 70%, 50%)" : "hsl(0, 30%, 25%)"} className={isCountdownActive ? "animate-pulse" : ""} />
        <circle cx="31" cy="75" r="2" fill={isCountdownActive ? "hsl(45, 70%, 50%)" : "hsl(45, 30%, 25%)"} className={isCountdownActive && countdown % 2 === 0 ? "animate-pulse" : ""} />
      </g>

      {/* Fuel Lines - Disconnect at T-40 */}
      <g className={cn("transition-all duration-1000", !fuelLinesConnected && "opacity-0")}>
        {/* Main fuel line */}
        <path
          d={fuelLinesConnected 
            ? "M 160 180 Q 140 180 130 170 Q 120 160 110 160" 
            : "M 160 180 Q 145 175 140 165 Q 135 155 130 145"
          }
          fill="none"
          stroke="url(#fuelLineGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
        {/* Fuel line connector */}
        <circle 
          cx={fuelLinesConnected ? 110 : 130} 
          cy={fuelLinesConnected ? 160 : 145} 
          r="4" 
          fill="hsl(200, 60%, 45%)" 
          stroke="hsl(200, 60%, 55%)" 
          strokeWidth="1"
          className="transition-all duration-1000"
        />
        {/* Fuel source tank indicator */}
        <rect x="155" y="165" width="15" height="30" fill="hsl(200, 50%, 30%)" stroke="hsl(200, 50%, 40%)" strokeWidth="1" rx="2" />
        <text x="162.5" y="183" textAnchor="middle" fill="hsl(200, 60%, 60%)" className="text-[5px] font-mono">LOX</text>
        
        {/* Disconnect flash effect */}
        {isCountdownActive && countdown === 40 && (
          <circle cx="85" cy="160" r="8" fill="hsl(200, 80%, 60%)" opacity="0.7" filter="url(#equipmentGlow)">
            <animate attributeName="r" values="8;15;8" dur="0.5s" repeatCount="1" />
            <animate attributeName="opacity" values="0.7;0;0" dur="0.5s" repeatCount="1" />
          </circle>
        )}
      </g>

      {/* Umbilicals - Release at T-20 */}
      <g className={cn("transition-all duration-1000", !umbilicalsConnected && "opacity-0")}>
        {/* Upper umbilical */}
        <path
          d={umbilicalsConnected 
            ? "M 155 120 Q 135 120 125 115 Q 115 110 105 110"
            : "M 155 120 Q 145 115 140 100 Q 135 85 130 70"
          }
          fill="none"
          stroke="url(#umbilicalGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
        {/* Lower umbilical */}
        <path
          d={umbilicalsConnected 
            ? "M 155 145 Q 135 145 125 140 Q 115 135 105 135"
            : "M 155 145 Q 145 140 140 125 Q 135 110 130 95"
          }
          fill="none"
          stroke="url(#umbilicalGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
        
        {/* Umbilical connectors */}
        <circle 
          cx={umbilicalsConnected ? 105 : 130} 
          cy={umbilicalsConnected ? 110 : 70} 
          r="3" 
          fill="hsl(45, 70%, 50%)" 
          className="transition-all duration-1000"
        />
        <circle 
          cx={umbilicalsConnected ? 105 : 130} 
          cy={umbilicalsConnected ? 135 : 95} 
          r="3" 
          fill="hsl(45, 70%, 50%)" 
          className="transition-all duration-1000"
        />
        
        {/* Ground support unit */}
        <rect x="150" y="110" width="18" height="45" fill="hsl(45, 40%, 25%)" stroke="hsl(45, 40%, 35%)" strokeWidth="1" rx="2" />
        <text x="159" y="136" textAnchor="middle" fill="hsl(45, 50%, 60%)" className="text-[5px] font-mono">GSE</text>
        
        {/* Disconnect flash effect */}
        {isCountdownActive && countdown === 20 && (
          <>
            <circle cx="105" cy="110" r="6" fill="hsl(45, 80%, 60%)" opacity="0.7" filter="url(#equipmentGlow)">
              <animate attributeName="r" values="6;12;6" dur="0.5s" repeatCount="1" />
              <animate attributeName="opacity" values="0.7;0;0" dur="0.5s" repeatCount="1" />
            </circle>
            <circle cx="105" cy="135" r="6" fill="hsl(45, 80%, 60%)" opacity="0.7" filter="url(#equipmentGlow)">
              <animate attributeName="r" values="6;12;6" dur="0.5s" repeatCount="1" />
              <animate attributeName="opacity" values="0.7;0;0" dur="0.5s" repeatCount="1" />
            </circle>
          </>
        )}
      </g>

      {/* ========== ROCKET ========== */}
      <g>
        {/* Nose cone */}
        <path
          d="M100 40 L115 80 L85 80 Z"
          fill="url(#rocketBodyGSE)"
          stroke="hsl(220, 20%, 45%)"
          strokeWidth="1.5"
        />
        
        {/* Upper stage */}
        <rect
          x="85" y="80" width="30" height="40"
          fill="url(#rocketBodyGSE)"
          stroke="hsl(220, 20%, 45%)"
          strokeWidth="1.5"
          rx="2"
        />

        {/* Payload window */}
        <rect
          x="88" y="85" width="24" height="12"
          fill="hsl(200, 60%, 25%)"
          stroke="hsl(200, 60%, 40%)"
          strokeWidth="1"
          rx="1"
        />
        <text x="100" y="94" textAnchor="middle" fill="hsl(200, 60%, 60%)" className="text-[5px] font-mono">
          PAYLOAD
        </text>

        {/* Middle stage */}
        <rect
          x="82" y="120" width="36" height="50"
          fill="url(#rocketBodyGSE)"
          stroke="hsl(220, 20%, 45%)"
          strokeWidth="1.5"
          rx="2"
        />

        {/* Fuel tank markings */}
        <rect
          x="85" y="125" width="30" height="40"
          fill="hsl(200, 40%, 20%)"
          stroke="hsl(200, 40%, 30%)"
          strokeWidth="1"
          rx="1"
        />

        {/* Lower stage */}
        <rect
          x="78" y="170" width="44" height="50"
          fill="url(#rocketBodyGSE)"
          stroke="hsl(220, 20%, 45%)"
          strokeWidth="1.5"
          rx="2"
        />

        {/* Engines */}
        <rect x="82" y="205" width="10" height="12" fill="url(#rocketBodyGSE)" stroke="hsl(220, 20%, 40%)" strokeWidth="1" rx="1" />
        <rect x="95" y="202" width="10" height="15" fill="url(#rocketBodyGSE)" stroke="hsl(220, 20%, 40%)" strokeWidth="1" rx="1" />
        <rect x="108" y="205" width="10" height="12" fill="url(#rocketBodyGSE)" stroke="hsl(220, 20%, 40%)" strokeWidth="1" rx="1" />

        {/* Engine bells */}
        <path d="M84 217 L82 230 L90 230 L88 217" fill="url(#rocketBodyGSE)" stroke="hsl(220, 20%, 40%)" strokeWidth="1" />
        <path d="M97 217 L94 235 L106 235 L103 217" fill="url(#rocketBodyGSE)" stroke="hsl(220, 20%, 40%)" strokeWidth="1" />
        <path d="M110 217 L108 230 L116 230 L114 217" fill="url(#rocketBodyGSE)" stroke="hsl(220, 20%, 40%)" strokeWidth="1" />

        {/* Fins */}
        <path d="M78 195 L65 220 L78 215" fill="hsl(220, 20%, 30%)" stroke="hsl(220, 20%, 40%)" strokeWidth="1" />
        <path d="M122 195 L135 220 L122 215" fill="hsl(220, 20%, 30%)" stroke="hsl(220, 20%, 40%)" strokeWidth="1" />
      </g>

      {/* Engine test flames during countdown */}
      {isEngineTest && (
        <g className="animate-engine-test" filter="url(#flameGlow)">
          {/* Small test flames */}
          <ellipse 
            cx="86" cy="233" 
            rx={2 + countdownProgress * 2} 
            ry={4 + countdownProgress * 6} 
            fill="url(#flameTestGSE)" 
            opacity={0.5 + countdownProgress * 0.3}
          >
            <animate attributeName="ry" values={`${4 + countdownProgress * 6};${6 + countdownProgress * 8};${4 + countdownProgress * 6}`} dur="0.3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse 
            cx="100" cy="238" 
            rx={3 + countdownProgress * 2} 
            ry={6 + countdownProgress * 8} 
            fill="url(#flameTestGSE)" 
            opacity={0.6 + countdownProgress * 0.3}
          >
            <animate attributeName="ry" values={`${6 + countdownProgress * 8};${8 + countdownProgress * 10};${6 + countdownProgress * 8}`} dur="0.25s" repeatCount="indefinite" />
          </ellipse>
          <ellipse 
            cx="112" cy="233" 
            rx={2 + countdownProgress * 2} 
            ry={4 + countdownProgress * 6} 
            fill="url(#flameTestGSE)" 
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
          <ellipse cx="70" cy="235" rx="8" ry="12" fill="url(#smokeGSE)">
            <animate attributeName="cy" values="235;215;195" dur="2s" repeatCount="indefinite" />
            <animate attributeName="rx" values="8;15;20" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.3;0" dur="2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="75" cy="240" rx="6" ry="10" fill="url(#smokeGSE)">
            <animate attributeName="cy" values="240;225;210" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="rx" values="6;12;18" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.25;0" dur="1.5s" repeatCount="indefinite" />
          </ellipse>
          {/* Right smoke plume */}
          <ellipse cx="130" cy="235" rx="8" ry="12" fill="url(#smokeGSE)">
            <animate attributeName="cy" values="235;215;195" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="rx" values="8;15;20" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.3;0" dur="2.2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="125" cy="240" rx="6" ry="10" fill="url(#smokeGSE)">
            <animate attributeName="cy" values="240;225;210" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="rx" values="6;12;18" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.25;0" dur="1.8s" repeatCount="indefinite" />
          </ellipse>
          {/* Center smoke */}
          <ellipse cx="100" cy="250" rx="10" ry="8" fill="url(#smokeGSE)">
            <animate attributeName="cy" values="250;230;210" dur="1.7s" repeatCount="indefinite" />
            <animate attributeName="rx" values="10;20;30" dur="1.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.35;0" dur="1.7s" repeatCount="indefinite" />
          </ellipse>
        </g>
      )}

      {/* Ignition sequence - more intense */}
      {isIgnitionSequence && (
        <g filter="url(#flameGlow)">
          <ellipse cx="86" cy="237" rx="4" ry="10" fill="url(#flameGSE)" opacity="0.9">
            <animate attributeName="ry" values="10;14;10" dur="0.15s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="100" cy="245" rx="5" ry="14" fill="url(#flameGSE)" opacity="0.95">
            <animate attributeName="ry" values="14;18;14" dur="0.12s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="112" cy="237" rx="4" ry="10" fill="url(#flameGSE)" opacity="0.9">
            <animate attributeName="ry" values="10;14;10" dur="0.18s" repeatCount="indefinite" />
          </ellipse>
        </g>
      )}

      {/* Steam/Vapor from pad during countdown */}
      {isCountdownActive && countdown <= 30 && (
        <g opacity={0.4 + (30 - countdown) * 0.02}>
          <ellipse cx="80" cy="255" rx="15" ry="4" fill="hsl(200, 20%, 70%)">
            <animate attributeName="ry" values="4;8;4" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.2;0.4" dur="2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="120" cy="255" rx="15" ry="4" fill="hsl(200, 20%, 70%)">
            <animate attributeName="ry" values="4;8;4" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.2;0.4" dur="2.5s" repeatCount="indefinite" />
          </ellipse>
        </g>
      )}

      {/* Status indicators */}
      <g className="text-[6px] font-mono">
        <text x="170" y="20" fill={fuelLinesConnected ? "hsl(200, 60%, 60%)" : "hsl(0, 60%, 50%)"}>
          FUEL: {fuelLinesConnected ? "FLOW" : "DISC"}
        </text>
        <text x="170" y="32" fill={umbilicalsConnected ? "hsl(45, 60%, 60%)" : "hsl(0, 60%, 50%)"}>
          UMBL: {umbilicalsConnected ? "CONN" : "FREE"}
        </text>
        <text x="170" y="44" fill={!towerRetracted ? "hsl(120, 40%, 50%)" : "hsl(120, 60%, 60%)"}>
          TOWR: {towerRetracted ? "CLEAR" : "HOLD"}
        </text>
      </g>
    </svg>
  );
}
