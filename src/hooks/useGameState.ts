import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Role, SystemControl, Scenario, AIMessage, SystemStatus } from '@/types/game';
import { initialSystems, scenarios } from '@/data/gameData';

const initialState: GameState = {
  phase: 'briefing',
  selectedRole: null,
  countdown: 30,
  isCountdownActive: false,
  systems: initialSystems,
  currentScenario: null,
  completedScenarios: [],
  score: {
    safety: 100,
    efficiency: 100,
    teamwork: 100,
    payloadSurvival: 100,
  },
  missionSuccess: null,
  failureReason: null,
  aiMessages: [],
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);

  const addAIMessage = useCallback((type: AIMessage['type'], message: string) => {
    const newMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      type,
      message,
      timestamp: Date.now(),
    };
    setState(prev => ({
      ...prev,
      aiMessages: [...prev.aiMessages.slice(-9), newMessage],
    }));
  }, []);

  const selectRole = useCallback((role: Role) => {
    setState(prev => ({ ...prev, selectedRole: role }));
    addAIMessage('info', `Welcome, ${role.charAt(0).toUpperCase() + role.slice(1)} Officer. Your station is now active.`);
  }, [addAIMessage]);

  const setPhase = useCallback((phase: GameState['phase']) => {
    setState(prev => ({ ...prev, phase }));
  }, []);

  const toggleSystem = useCallback((systemId: string) => {
    setState(prev => {
      const system = prev.systems.find(s => s.id === systemId);
      if (!system) return prev;

      // Check dependencies
      if (system.dependsOn) {
        const dependenciesMet = system.dependsOn.every(depId => {
          const dep = prev.systems.find(s => s.id === depId);
          return dep && (dep.status === 'on' || dep.status === 'stable' || dep.status === 'armed' || dep.status === 'go');
        });
        if (!dependenciesMet) {
          addAIMessage('warning', `Cannot activate ${system.name}. Dependencies not met.`);
          return prev;
        }
      }

      let newStatus: SystemStatus;
      switch (system.status) {
        case 'off':
          newStatus = system.id === 'fuel' ? 'loading' : 
                      system.id === 'guidance' ? 'calibrating' : 'on';
          break;
        case 'loading':
          newStatus = 'stable';
          break;
        case 'calibrating':
          newStatus = 'go';
          break;
        case 'on':
        case 'stable':
        case 'go':
          newStatus = system.id === 'range_safety' ? 'armed' : 'go';
          break;
        default:
          newStatus = 'on';
      }

      addAIMessage('info', `${system.name}: ${newStatus.toUpperCase()}`);

      return {
        ...prev,
        systems: prev.systems.map(s =>
          s.id === systemId ? { ...s, status: newStatus } : s
        ),
      };
    });
  }, [addAIMessage]);

  const startCountdown = useCallback(() => {
    setState(prev => ({ ...prev, isCountdownActive: true }));
    addAIMessage('info', 'T-30 countdown initiated. All stations report status.');
  }, [addAIMessage]);

  const triggerScenario = useCallback(() => {
    const availableScenarios = scenarios.filter(
      s => !state.completedScenarios.includes(s.id)
    );
    if (availableScenarios.length > 0) {
      const randomScenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
      setState(prev => ({ ...prev, currentScenario: randomScenario }));
      addAIMessage(randomScenario.severity === 'critical' ? 'critical' : 'warning', randomScenario.description);
    }
  }, [state.completedScenarios, addAIMessage]);

  // Set a custom scenario (for in-flight scenarios)
  const setScenario = useCallback((scenario: Scenario) => {
    if (state.completedScenarios.includes(scenario.id)) return;
    setState(prev => ({ ...prev, currentScenario: scenario }));
    addAIMessage(scenario.severity === 'critical' ? 'critical' : 'warning', scenario.description);
  }, [state.completedScenarios, addAIMessage]);

  const handleScenarioChoice = useCallback((choiceId: string) => {
    if (!state.currentScenario) return;

    const choice = state.currentScenario.choices.find(c => c.id === choiceId);
    if (!choice) return;

    addAIMessage(choice.isCorrect ? 'success' : 'warning', choice.consequence);

    setState(prev => ({
      ...prev,
      currentScenario: null,
      completedScenarios: [...prev.completedScenarios, prev.currentScenario!.id],
      score: {
        ...prev.score,
        safety: Math.max(0, prev.score.safety + choice.scoreImpact),
        efficiency: choice.isCorrect ? prev.score.efficiency : prev.score.efficiency - 5,
      },
    }));
  }, [state.currentScenario, addAIMessage]);

  const completeMission = useCallback((success: boolean, reason?: string) => {
    setState(prev => ({
      ...prev,
      phase: 'debrief',
      missionSuccess: success,
      failureReason: reason || null,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setState(initialState);
  }, []);

  // Use ref to track AI activation without causing re-renders
  const aiActivationRef = useRef<string | null>(null);
  const aiActivationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Transition guard: avoid double-transition to launch when countdown hits zero
  const launchTransitionRef = useRef(false);
  const launchTransitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-progress intermediate states (loading -> stable, calibrating -> go)
  useEffect(() => {
    const systemInProgress = state.systems.find(s => 
      s.status === 'loading' || s.status === 'calibrating'
    );
    
    if (!systemInProgress) return;

    const timer = setTimeout(() => {
      setState(prev => {
        const system = prev.systems.find(s => s.id === systemInProgress.id);
        if (!system) return prev;

        let newStatus: SystemStatus;
        if (system.status === 'loading') {
          newStatus = 'stable';
        } else if (system.status === 'calibrating') {
          newStatus = 'go';
        } else {
          return prev;
        }

        addAIMessage('success', `${system.name}: ${newStatus.toUpperCase()} ✓`);

        return {
          ...prev,
          systems: prev.systems.map(s =>
            s.id === system.id ? { ...s, status: newStatus } : s
          ),
        };
      });
    }, 2000); // 2 second delay for intermediate states

    return () => clearTimeout(timer);
  }, [state.systems, addAIMessage]);
  // AI activation effect - activates systems for other roles
  useEffect(() => {
    if (state.phase !== 'prelaunch' || !state.selectedRole) return;

    // If we already have a pending AI activation timer, don't schedule another.
    // (Prevents multiple timers and avoids racey updates.)
    if (aiActivationTimerRef.current) return;

    // Find systems that belong to OTHER roles and are still off
    const otherRoleSystems = state.systems.filter(s => 
      s.role !== state.selectedRole && s.status === 'off'
    );

    if (otherRoleSystems.length === 0) return;

    // Find a system that can be activated (dependencies met)
    const systemToActivate = otherRoleSystems.find(system => {
      if (!system.dependsOn) return true;
      return system.dependsOn.every(depId => {
        const dep = state.systems.find(s => s.id === depId);
        return dep && (dep.status === 'on' || dep.status === 'stable' || dep.status === 'armed' || dep.status === 'go');
      });
    });

    if (!systemToActivate) return;

    // If the effect re-runs after we scheduled a timer (e.g., user toggles more systems),
    // we may have cleared the timer in cleanup. Ensure we never “deadlock” by blocking
    // rescheduling forever.
    if (aiActivationRef.current === systemToActivate.id) {
      if (import.meta.env.DEV) {
        console.debug('[AI] activation suppressed (same system)', systemToActivate.id);
      }
      return;
    }

    aiActivationRef.current = systemToActivate.id;

    // AI activates after a delay (simulating AI work)
    const timer = setTimeout(() => {
      setState(prev => {
        const system = prev.systems.find(s => s.id === systemToActivate.id);
        if (!system || system.status !== 'off') {
          aiActivationRef.current = null;
          aiActivationTimerRef.current = null;
          return prev;
        }

        let newStatus: SystemStatus;
        switch (system.id) {
          case 'fuel':
            newStatus = 'stable';
            break;
          case 'guidance':
            newStatus = 'go';
            break;
          case 'range_safety':
            newStatus = 'armed';
            break;
          case 'chilldown':
            newStatus = 'go';
            break;
          case 'weather':
            newStatus = 'go';
            break;
          case 'comms':
            newStatus = 'go';
            break;
          case 'power':
            newStatus = 'go';
            break;
          default:
            newStatus = 'go';
        }

        addAIMessage('info', `AI: Activating ${system.name}... ${newStatus.toUpperCase()}`);

        // Reset ref to allow next activation
        aiActivationRef.current = null;
        aiActivationTimerRef.current = null;

        return {
          ...prev,
          systems: prev.systems.map(s =>
            s.id === systemToActivate.id ? { ...s, status: newStatus } : s
          ),
        };
      });
    }, 1500 + Math.random() * 1000); // 1.5-2.5 second delay

    aiActivationTimerRef.current = timer;
    if (import.meta.env.DEV) {
      console.debug('[AI] scheduled activation', systemToActivate.id);
    }

    return () => {
      clearTimeout(timer);

      // Critical: if user actions trigger a re-run before the timer fires,
      // we must clear *both* refs; otherwise we can end up permanently
      // blocking re-scheduling for the same system.
      if (aiActivationTimerRef.current === timer) {
        aiActivationTimerRef.current = null;
      }
      if (aiActivationRef.current === systemToActivate.id) {
        aiActivationRef.current = null;
      }

      if (import.meta.env.DEV) {
        console.debug('[AI] cleared pending activation', systemToActivate.id);
      }
    };
  }, [state.phase, state.selectedRole, state.systems, addAIMessage]);

  // Countdown effect
  useEffect(() => {
    if (!state.isCountdownActive || state.countdown <= 0) return;

    const timer = setInterval(() => {
      setState(prev => {
        if (prev.countdown <= 1) {
          return { ...prev, countdown: 0, isCountdownActive: false };
        }
        
        // Trigger scenarios at specific times
        if (prev.countdown === 20 || prev.countdown === 10) {
          triggerScenario();
        }

        // AI callouts at specific times
        if (prev.countdown === 25) {
          addAIMessage('info', 'T-25: Power systems nominal');
        } else if (prev.countdown === 20) {
          addAIMessage('info', 'T-20: Fuel loading complete');
        } else if (prev.countdown === 15) {
          addAIMessage('info', 'T-15: Go for terminal count');
        } else if (prev.countdown === 10) {
          addAIMessage('info', 'T-10: All systems GO');
        } else if (prev.countdown === 5) {
          addAIMessage('critical', 'T-5: Engine ignition sequence start');
        }

        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isCountdownActive, state.countdown, triggerScenario, addAIMessage]);

  // Auto-transition to Launch when countdown ends (kept inside the state hook to avoid UI-level hook churn)
  useEffect(() => {
    // Reset guard when returning to briefing
    if (state.phase === 'briefing') {
      launchTransitionRef.current = false;
      if (launchTransitionTimerRef.current) {
        clearTimeout(launchTransitionTimerRef.current);
        launchTransitionTimerRef.current = null;
      }
      return;
    }

    if (state.phase !== 'prelaunch') return;
    if (state.isCountdownActive) return;
    if (state.countdown !== 0) return;
    if (launchTransitionRef.current) return;

    launchTransitionRef.current = true;
    const timer = setTimeout(() => {
      setState(prev => {
        // Only transition if we're still in the expected state
        if (prev.phase !== 'prelaunch' || prev.countdown !== 0) return prev;
        return { ...prev, phase: 'launch' };
      });
      launchTransitionTimerRef.current = null;
    }, 2000);

    launchTransitionTimerRef.current = timer;
    return () => {
      clearTimeout(timer);
      if (launchTransitionTimerRef.current === timer) {
        launchTransitionTimerRef.current = null;
      }
      // If prelaunch re-renders rapidly, allow rescheduling
      launchTransitionRef.current = false;
    };
  }, [state.phase, state.countdown, state.isCountdownActive]);

  const allSystemsGo = state.systems.every(s => 
    s.status === 'on' || s.status === 'stable' || s.status === 'armed' || s.status === 'go'
  );

  return {
    state,
    selectRole,
    setPhase,
    toggleSystem,
    startCountdown,
    handleScenarioChoice,
    completeMission,
    resetGame,
    addAIMessage,
    setScenario,
    allSystemsGo,
  };
}
