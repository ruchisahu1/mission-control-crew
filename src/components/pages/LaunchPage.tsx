import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, TelemetryData, Scenario } from '@/types/game';
import { ConsolePanel } from '../game/ConsolePanel';
import { TelemetryPanel } from '../game/TelemetryPanel';
import { AIAssistant } from '../game/AIAssistant';
import { ScenarioModal } from '../game/ScenarioModal';
import { LaunchVisualization } from '../game/LaunchVisualization';
import { LaunchAudioMonitor } from '../game/LaunchAudioMonitor';
import { AudioControls } from '../game/AudioControls';
import { cn } from '@/lib/utils';
import { roleDescriptions } from '@/data/gameData';

interface LaunchPageProps {
  state: GameState;
  onScenarioChoice: (choiceId: string) => void;
  onMissionComplete: (success: boolean, reason?: string) => void;
  onAddMessage: (type: 'info' | 'warning' | 'critical' | 'success', message: string) => void;
  onSetScenario: (scenario: Scenario) => void;
}

export function LaunchPage({ state, onScenarioChoice, onMissionComplete, onAddMessage, onSetScenario }: LaunchPageProps) {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    altitude: 0,
    velocity: 0,
    fuelLevel: 100,
    thrust: 0,
    temperature: 200,
    vibration: 0,
  });
  const [flightPhase, setFlightPhase] = useState<'ignition' | 'liftoff' | 'maxq' | 'meco' | 'stage2' | 'orbit'>('ignition');
  const [missionTime, setMissionTime] = useState(0);
  const [isLaunched, setIsLaunched] = useState(false);
  
  // Track which scenario times have been triggered to prevent duplicates
  const triggeredTimesRef = useRef<Set<number>>(new Set());

  const roleInfo = state.selectedRole ? roleDescriptions[state.selectedRole] : null;

  // Flight scenarios
  const flightScenarios: Scenario[] = [
    {
      id: 'wind_shear_flight',
      title: 'Upper-Atmosphere Winds',
      description: 'ALERT: Upper wind shear detected. Trajectory deviation increasing.',
      type: 'wind' as const,
      severity: 'warning' as const,
      timeLimit: 15,
      choices: [
        { id: 'adjust_pitch', text: 'Adjust pitch profile to compensate', isCorrect: true, consequence: 'Pitch profile adjusted. Trajectory nominal.', scoreImpact: 10 },
        { id: 'ignore_wind', text: 'Continue with current profile', isCorrect: false, consequence: 'Vehicle experiencing structural stress.', scoreImpact: -20 },
      ],
    },
    {
      id: 'engine_underperform_flight',
      title: 'Engine Under-Performance',
      description: 'CRITICAL: Engine 2 showing thrust deficit. Fuel consumption elevated.',
      type: 'engine' as const,
      severity: 'critical' as const,
      timeLimit: 10,
      choices: [
        { id: 'throttle_down', text: 'Throttle down and continue', isCorrect: true, consequence: 'Compensating with other engines.', scoreImpact: 5 },
        { id: 'engine_shutdown', text: 'Shutdown engine 2', isCorrect: true, consequence: 'Proceeding with reduced thrust.', scoreImpact: 0 },
      ],
    },
    {
      id: 'thermal_flight',
      title: 'Thermal Stress',
      description: 'WARNING: Heat shield temperature exceeding nominal range.',
      type: 'thermal' as const,
      severity: 'warning' as const,
      timeLimit: 12,
      choices: [
        { id: 'change_profile', text: 'Adjust ascent profile', isCorrect: true, consequence: 'Temperature stabilizing.', scoreImpact: 10 },
        { id: 'throttle_reduction', text: 'Reduce throttle', isCorrect: true, consequence: 'Thermal levels returning to nominal.', scoreImpact: 5 },
      ],
    },
    {
      id: 'comm_issue_flight',
      title: 'Telemetry Dropout',
      description: 'ALERT: Intermittent telemetry. Signal strength degrading.',
      type: 'comms' as const,
      severity: 'warning' as const,
      timeLimit: 15,
      choices: [
        { id: 'switch_antenna', text: 'Switch to backup antenna', isCorrect: true, consequence: 'Signal restored.', scoreImpact: 10 },
        { id: 'autonomous_mode', text: 'Enable autonomous mode', isCorrect: true, consequence: 'Vehicle self-navigating.', scoreImpact: 5 },
      ],
    },
  ];

  // Trigger a random flight scenario
  const triggerFlightScenario = useCallback(() => {
    // Don't trigger if there's already an active scenario
    if (state.currentScenario) return;
    
    // Filter out already completed scenarios
    const availableScenarios = flightScenarios.filter(
      s => !state.completedScenarios.includes(s.id)
    );
    
    if (availableScenarios.length === 0) return;
    
    // Pick a random scenario
    const randomScenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
    onSetScenario(randomScenario);
  }, [state.currentScenario, state.completedScenarios, onSetScenario]);

  // Simulate flight telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setMissionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Separate effect to handle telemetry updates and scenario triggers based on missionTime
  useEffect(() => {
    setTelemetry(prev => {
      let newTelemetry = { ...prev };
      
      if (missionTime < 3) {
        // Ignition
        setFlightPhase('ignition');
        newTelemetry.thrust = Math.min(100, prev.thrust + 30);
        newTelemetry.vibration = 2 + Math.random();
        newTelemetry.temperature = 200 + missionTime * 50;
      } else if (missionTime < 10) {
        // Liftoff
        if (missionTime === 3 && !isLaunched) {
          setIsLaunched(true);
          onAddMessage('success', 'LIFTOFF! We have liftoff!');
        }
        setFlightPhase('liftoff');
        newTelemetry.altitude = (missionTime - 3) * 2;
        newTelemetry.velocity = (missionTime - 3) * 300;
        newTelemetry.fuelLevel = 100 - (missionTime - 3) * 2;
        newTelemetry.thrust = 100;
        newTelemetry.vibration = 3 + Math.random() * 2;
        newTelemetry.temperature = 350 + Math.random() * 50;
      } else if (missionTime < 20) {
        // Max Q
        if (missionTime === 10) {
          onAddMessage('warning', 'Approaching Max-Q. Maximum dynamic pressure.');
        }
        setFlightPhase('maxq');
        newTelemetry.altitude = 14 + (missionTime - 10) * 5;
        newTelemetry.velocity = 2100 + (missionTime - 10) * 400;
        newTelemetry.fuelLevel = 86 - (missionTime - 10) * 3;
        newTelemetry.thrust = 80;
        newTelemetry.vibration = 5 + Math.random() * 2;
        newTelemetry.temperature = 600 + Math.random() * 100;
      } else if (missionTime < 30) {
        // MECO
        if (missionTime === 20) {
          onAddMessage('info', 'Through Max-Q. Throttling up.');
        }
        if (missionTime === 25) {
          onAddMessage('info', 'MECO confirmed. Stage separation.');
        }
        setFlightPhase('meco');
        newTelemetry.altitude = 64 + (missionTime - 20) * 8;
        newTelemetry.velocity = 6100 + (missionTime - 20) * 200;
        newTelemetry.fuelLevel = missionTime < 25 ? 56 - (missionTime - 20) * 5 : 100;
        newTelemetry.thrust = missionTime < 25 ? 100 : 90;
        newTelemetry.vibration = 1 + Math.random();
        newTelemetry.temperature = 400 + Math.random() * 50;
      } else if (missionTime < 40) {
        // Second stage
        if (missionTime === 30) {
          onAddMessage('info', 'Second stage ignition confirmed.');
        }
        setFlightPhase('stage2');
        newTelemetry.altitude = 144 + (missionTime - 30) * 20;
        newTelemetry.velocity = 8100 + (missionTime - 30) * 300;
        newTelemetry.fuelLevel = 100 - (missionTime - 30) * 4;
        newTelemetry.thrust = 95;
        newTelemetry.vibration = 0.5 + Math.random() * 0.5;
        newTelemetry.temperature = 300 + Math.random() * 30;
      } else {
        // Orbit achieved
        setFlightPhase('orbit');
        newTelemetry.altitude = 344 + (missionTime - 40) * 50;
        newTelemetry.velocity = 11100;
        newTelemetry.fuelLevel = Math.max(20, 60 - (missionTime - 40) * 2);
        newTelemetry.thrust = 0;
        newTelemetry.vibration = 0.1;
        newTelemetry.temperature = 150;
        
        if (missionTime === 45) {
          onAddMessage('success', 'Orbital insertion confirmed! Mission success!');
          setTimeout(() => {
            onMissionComplete(true);
          }, 3000);
        }
      }

      return newTelemetry;
    });

    // Trigger scenarios at specific times (only once per time)
    const scenarioTimes = [5, 15, 25, 35];
    if (scenarioTimes.includes(missionTime) && !triggeredTimesRef.current.has(missionTime)) {
      triggeredTimesRef.current.add(missionTime);
      triggerFlightScenario();
    }

    // Check for mission failure conditions
    if (state.score.safety < 50) {
      onMissionComplete(false, 'Safety margins exceeded. Mission terminated.');
    }
  }, [missionTime, isLaunched, state.score.safety, onMissionComplete, onAddMessage, triggerFlightScenario]);

  const phaseLabels = {
    ignition: { label: 'ENGINE IGNITION', color: 'text-warning' },
    liftoff: { label: 'LIFTOFF', color: 'text-success' },
    maxq: { label: 'MAX-Q', color: 'text-danger' },
    meco: { label: 'MECO / STAGE SEP', color: 'text-primary' },
    stage2: { label: 'SECOND STAGE', color: 'text-info' },
    orbit: { label: 'ORBIT ACHIEVED', color: 'text-success' },
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Scenario Modal */}
      {state.currentScenario && (
        <ScenarioModal 
          scenario={state.currentScenario} 
          onChoice={onScenarioChoice} 
        />
      )}

      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            'px-4 py-2 rounded-lg font-orbitron font-bold',
            phaseLabels[flightPhase].color,
            'bg-secondary border border-border'
          )}>
            {phaseLabels[flightPhase].label}
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="font-orbitron text-xl md:text-2xl font-bold">
            LAUNCH & ASCENT
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Level 2: In-Flight Operations
          </p>
        </div>

        <div className="flex items-center gap-4">
          <AudioControls />
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-mono">MISSION TIME</p>
            <p className="font-mono text-xl font-bold text-foreground">
              T+{Math.floor(missionTime / 60)}:{(missionTime % 60).toString().padStart(2, '0')}
            </p>
          </div>
          {roleInfo && (
            <span className="px-3 py-1 rounded-lg bg-primary/20 border border-primary/50 text-primary text-sm font-mono">
              {roleInfo.emoji} {roleInfo.title}
            </span>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-4">
        {/* Left Column - Launch Visualization & Audio */}
        <div className="lg:col-span-1 space-y-4">
          <ConsolePanel title="LAUNCH VIEW">
            <LaunchVisualization 
              missionTime={missionTime}
              isLaunched={isLaunched}
              flightPhase={flightPhase}
            />
          </ConsolePanel>
          
          <LaunchAudioMonitor
            missionTime={missionTime}
            isLaunched={isLaunched}
            flightPhase={flightPhase}
          />
        </div>

        {/* Center Column - Telemetry */}
        <div className="lg:col-span-2 space-y-4">
          <TelemetryPanel data={telemetry} isLaunched={isLaunched} />
          
          {/* Flight Path Visualization */}
          <ConsolePanel title="TRAJECTORY">
            <div className="h-48 relative overflow-hidden rounded-lg bg-console-bg border border-border">
              {/* Simple trajectory visualization */}
              <div className="absolute inset-0 flex items-end justify-center p-4">
                <svg viewBox="0 0 300 150" className="w-full h-full">
                  {/* Earth curve */}
                  <path 
                    d="M0 150 Q150 150 300 150" 
                    fill="none" 
                    stroke="hsl(var(--primary) / 0.3)" 
                    strokeWidth="2"
                  />
                  {/* Trajectory arc */}
                  <path 
                    d="M50 140 Q100 100 150 60 Q200 20 280 10" 
                    fill="none" 
                    stroke="hsl(var(--success))" 
                    strokeWidth="2"
                    strokeDasharray={isLaunched ? "0" : "5,5"}
                    className={isLaunched ? "animate-pulse" : ""}
                  />
                  {/* Current position marker */}
                  {isLaunched && (
                    <circle 
                      cx={50 + Math.min(missionTime * 5, 230)} 
                      cy={140 - Math.min(missionTime * 3, 130)}
                      r="5" 
                      fill="hsl(var(--warning))" 
                      className="animate-pulse"
                    />
                  )}
                  {/* Launch site */}
                  <circle cx="50" cy="140" r="4" fill="hsl(var(--primary))" />
                  <text x="50" y="155" textAnchor="middle" className="fill-muted-foreground text-[8px]">LAUNCH</text>
                  {/* Target orbit */}
                  <circle cx="280" cy="10" r="4" fill="hsl(var(--success))" />
                  <text x="280" y="25" textAnchor="middle" className="fill-muted-foreground text-[8px]">ORBIT</text>
                </svg>
              </div>
            </div>
          </ConsolePanel>

          {/* Score Panel */}
          <ConsolePanel title="MISSION METRICS">
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Safety', value: state.score.safety, color: state.score.safety > 70 ? 'success' : 'danger' },
                { label: 'Efficiency', value: state.score.efficiency, color: 'primary' },
                { label: 'Teamwork', value: state.score.teamwork, color: 'info' },
                { label: 'Payload', value: state.score.payloadSurvival, color: state.score.payloadSurvival > 80 ? 'success' : 'warning' },
              ].map((metric) => (
                <div key={metric.label} className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground font-mono mb-1">{metric.label}</p>
                  <p className={cn('font-mono text-2xl font-bold', `text-${metric.color}`)}>
                    {metric.value}%
                  </p>
                </div>
              ))}
            </div>
          </ConsolePanel>
        </div>

        {/* Right Column - AI */}
        <div className="lg:col-span-1">
          <AIAssistant messages={state.aiMessages} />
        </div>
      </div>
    </div>
  );
}
