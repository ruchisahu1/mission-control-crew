import { useCallback } from 'react';
import { GameState, Role } from '@/types/game';
import { ConsolePanel } from '../game/ConsolePanel';
import { SystemControl } from '../game/SystemControl';
import { CountdownDisplay } from '../game/CountdownDisplay';
import { AIAssistant } from '../game/AIAssistant';
import { GroundSupportEquipment } from '../game/GroundSupportEquipment';
import { AudioVisualizer } from '../game/AudioVisualizer';
import { AudioControls } from '../game/AudioControls';
import { ScenarioModal } from '../game/ScenarioModal';
import { Play, ArrowLeft, CheckCircle2, Zap, Flame, Compass, Info, MousePointerClick, Volume2 } from 'lucide-react';
import { roleDescriptions } from '@/data/gameData';
import { initGlobalAudioContext } from '@/hooks/useLaunchAudio';
import { useVoiceCountdown } from '@/hooks/useVoiceCountdown';
import { useCountdownAudio } from '@/hooks/useCountdownAudio';
import { useSystemClickSound } from '@/hooks/useSystemClickSound';

interface PreLaunchPageProps {
  state: GameState;
  onToggleSystem: (systemId: string) => void;
  onStartCountdown: () => void;
  onScenarioChoice: (choiceId: string) => void;
  onBack: () => void;
  allSystemsGo: boolean;
}

export function PreLaunchPage({ 
  state, 
  onToggleSystem, 
  onStartCountdown, 
  onScenarioChoice,
  onBack,
  allSystemsGo,
}: PreLaunchPageProps) {
  const roleInfo = state.selectedRole ? roleDescriptions[state.selectedRole] : null;

  // Voice countdown hook
  useVoiceCountdown({
    countdown: state.countdown,
    isActive: state.isCountdownActive,
  });

  // Countdown audio effects (beeps, ambient tension)
  useCountdownAudio(state.countdown, state.isCountdownActive);

  // System click sounds
  const { playActivateSound, playLockedSound } = useSystemClickSound();

  // Wrap onToggleSystem to add sound effects
  const handleToggleSystem = useCallback((systemId: string) => {
    const system = state.systems.find(s => s.id === systemId);
    if (!system) return;

    // Check if user owns this system
    const isUserSystem = state.selectedRole === system.role;
    if (!isUserSystem) return;

    // Check dependencies
    const dependenciesMet = !system.dependsOn || system.dependsOn.every(depId => {
      const dep = state.systems.find(s => s.id === depId);
      return dep && dep.status !== 'off';
    });

    if (!dependenciesMet && system.status === 'off') {
      playLockedSound();
      return;
    }

    // Play activation sound
    initGlobalAudioContext();
    playActivateSound();
    onToggleSystem(systemId);
  }, [state.systems, state.selectedRole, onToggleSystem, playActivateSound, playLockedSound]);

  // Handle countdown start with audio initialization
  const handleStartCountdown = useCallback(() => {
    // Initialize audio context on user interaction (required by browser policy)
    initGlobalAudioContext();
    onStartCountdown();
  }, [onStartCountdown]);

  // Group systems by role for clearer organization
  const systemsByRole = {
    systems: state.systems.filter(s => s.role === 'systems'),
    propulsion: state.systems.filter(s => s.role === 'propulsion'),
    guidance: state.systems.filter(s => s.role === 'guidance'),
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'systems': return Zap;
      case 'propulsion': return Flame;
      case 'guidance': return Compass;
      default: return Zap;
    }
  };

  // Get user's systems and their status
  const userSystems = state.systems.filter(s => s.role === state.selectedRole);
  const userSystemsReady = userSystems.filter(s => s.status !== 'off').length;
  const nextUserSystem = userSystems.find(s => {
    if (s.status !== 'off') return false;
    if (!s.dependsOn) return true;
    return s.dependsOn.every(depId => {
      const dep = state.systems.find(sys => sys.id === depId);
      return dep && dep.status !== 'off';
    });
  });

  const completedSystems = state.systems.filter(s => s.status !== 'off' && s.status !== 'warning' && s.status !== 'critical').length;
  const totalSystems = state.systems.length;

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
      <header className="flex items-center justify-between mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-mono">ABORT</span>
        </button>
        
        <div className="text-center">
          <h1 className="font-orbitron text-lg md:text-xl font-bold">
            PRE-LAUNCH SEQUENCE
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Level 1: System Checks & Countdown
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AudioControls />
          {roleInfo && (
            <span className="px-3 py-1 rounded-lg bg-primary/20 border border-primary/50 text-primary text-xs font-mono">
              {roleInfo.emoji} {roleInfo.title}
            </span>
          )}
        </div>
      </header>

      {/* Main Grid - Redesigned */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-4">
        
        {/* Left Column - Countdown & Vehicle */}
        <div className="lg:col-span-3 space-y-4">
          {/* Countdown - More Prominent */}
          <CountdownDisplay 
            seconds={state.countdown} 
            isActive={state.isCountdownActive} 
          />
          
          {/* Ground Support Equipment */}
          <ConsolePanel title="LAUNCH PAD">
            <GroundSupportEquipment 
              countdown={state.countdown}
              isCountdownActive={state.isCountdownActive}
            />
          </ConsolePanel>

          {/* Audio Visualizer */}
          <AudioVisualizer 
            countdown={state.countdown}
            isCountdownActive={state.isCountdownActive}
          />
          
          {/* Progress Summary */}
          <ConsolePanel title="CHECKLIST PROGRESS">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">Systems Ready</span>
                <span className="font-mono font-bold text-foreground">{completedSystems}/{totalSystems}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
                  style={{ width: `${(completedSystems / totalSystems) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {Object.entries(systemsByRole).map(([role, systems]) => {
                  const ready = systems.filter(s => s.status !== 'off' && s.status !== 'warning' && s.status !== 'critical').length;
                  const Icon = getRoleIcon(role);
                  return (
                    <div key={role} className="p-2 rounded bg-secondary/50">
                      <Icon className={`w-4 h-4 mx-auto mb-1 ${ready === systems.length ? 'text-success' : 'text-muted-foreground'}`} />
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">{role.slice(0, 3)}</p>
                      <p className={`text-xs font-mono font-bold ${ready === systems.length ? 'text-success' : 'text-foreground'}`}>
                        {ready}/{systems.length}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </ConsolePanel>
        </div>


        {/* Center Column - Systems Organized by Role */}
        <div className="lg:col-span-6 space-y-4">
          {/* Interactive Instructions Panel */}
          <div className={`console-panel !p-4 border-2 ${allSystemsGo ? 'border-success/50 bg-success/5' : 'border-primary/50 bg-primary/5'}`}>
            {allSystemsGo ? (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-success" />
                <div>
                  <p className="text-lg font-orbitron font-bold text-success">ALL SYSTEMS GO</p>
                  <p className="text-sm text-muted-foreground">Press the INITIATE COUNTDOWN button below to begin launch sequence.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-base font-orbitron font-bold text-foreground">HOW TO ACTIVATE SYSTEMS</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You are the <span className="text-primary font-bold">{roleInfo?.title}</span>. 
                      Look for systems marked <span className="text-primary font-mono text-xs bg-primary/10 px-1 rounded">YOUR STATION</span> below.
                    </p>
                  </div>
                </div>
                
                {/* Next Action Hint */}
                {nextUserSystem && userSystemsReady < userSystems.length && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
                    <MousePointerClick className="w-5 h-5 text-warning animate-pulse" />
                    <div>
                      <p className="text-sm font-semibold text-warning">NEXT: Activate {nextUserSystem.name}</p>
                      <p className="text-xs text-muted-foreground">Click the power button to turn it ON</p>
                    </div>
                  </div>
                )}
                
                {userSystemsReady === userSystems.length && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <div>
                      <p className="text-sm font-semibold text-success">Your station is complete!</p>
                      <p className="text-xs text-muted-foreground">AI is handling other stations. Wait for all systems GO.</p>
                    </div>
                  </div>
                )}
                
                {/* Step indicators */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-muted-foreground">Your progress:</span>
                  <span className={`px-2 py-0.5 rounded ${userSystemsReady === userSystems.length ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
                    {userSystemsReady}/{userSystems.length} systems activated
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Systems by Role */}
          {Object.entries(systemsByRole).map(([role, systems]) => {
            const Icon = getRoleIcon(role);
            const isUserRole = state.selectedRole === role;
            return (
              <ConsolePanel 
                key={role} 
                title={
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{role.toUpperCase()} OFFICER</span>
                    {isUserRole && <span className="text-primary text-xs">(YOU)</span>}
                  </div>
                }
                className={isUserRole ? 'ring-1 ring-primary/30' : 'opacity-90'}
              >
                <div className="space-y-2">
                  {systems.map((system) => (
                    <SystemControl
                      key={system.id}
                      system={system}
                      userRole={state.selectedRole}
                      onToggle={handleToggleSystem}
                      allSystems={state.systems}
                    />
                  ))}
                </div>
              </ConsolePanel>
            );
          })}

          {/* Launch Button */}
          <button
            onClick={handleStartCountdown}
            disabled={!allSystemsGo || state.isCountdownActive}
            className="btn-control w-full flex items-center justify-center gap-3 py-4 text-lg"
          >
            {state.isCountdownActive ? (
              <>
                <Volume2 className="w-6 h-6 animate-pulse" />
                COUNTDOWN IN PROGRESS...
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                INITIATE COUNTDOWN
              </>
            )}
          </button>
        </div>

        {/* Right Column - AI & GO/NO-GO */}
        <div className="lg:col-span-3 space-y-4">
          <AIAssistant messages={state.aiMessages} />
          
          {/* GO/NO-GO Poll - Clearer */}
          <ConsolePanel title="GO/NO-GO POLL">
            <p className="text-xs text-muted-foreground mb-3 font-mono">
              All stations must report GO for launch
            </p>
            <div className="space-y-2">
              {Object.entries(systemsByRole).map(([role, systems]) => {
                const allReady = systems.every(s => 
                  s.status !== 'off' && s.status !== 'warning' && s.status !== 'critical'
                );
                const Icon = getRoleIcon(role);
                return (
                  <div 
                    key={role} 
                    className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                      allReady ? 'bg-success/10 border border-success/30' : 'bg-secondary/30 border border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${allReady ? 'text-success' : 'text-muted-foreground'}`} />
                      <span className="text-xs font-mono font-medium uppercase">{role}</span>
                    </div>
                    {allReady ? (
                      <span className="status-go">GO</span>
                    ) : (
                      <span className="status-standby">STANDBY</span>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Final Status */}
            <div className={`mt-3 p-3 rounded-lg text-center ${
              allSystemsGo 
                ? 'bg-success/20 border border-success/50' 
                : 'bg-warning/10 border border-warning/30'
            }`}>
              <p className={`font-orbitron font-bold text-sm ${
                allSystemsGo ? 'text-success' : 'text-warning'
              }`}>
                {allSystemsGo ? '✓ LAUNCH AUTHORIZED' : '⏳ AWAITING ALL STATIONS'}
              </p>
            </div>
          </ConsolePanel>
        </div>
      </div>
    </div>
  );
}
