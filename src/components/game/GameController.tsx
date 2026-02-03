import { useCallback } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { StarField } from './StarField';
import { BriefingPage } from '../pages/BriefingPage';
import { PreLaunchPage } from '../pages/PreLaunchPage';
import { LaunchPage } from '../pages/LaunchPage';
import { DebriefPage } from '../pages/DebriefPage';

export function GameController() {
  const {
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
  } = useGameState();

  const handleStartMission = useCallback(() => {
    if (!state.selectedRole) return;
    setPhase('prelaunch');
    addAIMessage('info', 'Entering Pre-Launch phase. Begin system checks.');
  }, [state.selectedRole, setPhase, addAIMessage]);

  return (
    <div className="relative min-h-screen bg-background">
      <StarField />
      
      <div className="relative z-10">
        {state.phase === 'briefing' && (
          <BriefingPage
            selectedRole={state.selectedRole}
            onSelectRole={selectRole}
            onStartMission={handleStartMission}
            aiMessages={state.aiMessages}
          />
        )}

        {state.phase === 'prelaunch' && (
          <PreLaunchPage
            state={state}
            onToggleSystem={toggleSystem}
            onStartCountdown={startCountdown}
            onScenarioChoice={handleScenarioChoice}
            onBack={() => setPhase('briefing')}
            allSystemsGo={allSystemsGo}
          />
        )}

        {state.phase === 'launch' && (
          <LaunchPage
            state={state}
            onScenarioChoice={handleScenarioChoice}
            onMissionComplete={completeMission}
            onAddMessage={addAIMessage}
            onSetScenario={setScenario}
          />
        )}

        {state.phase === 'debrief' && (
          <DebriefPage
            state={state}
            onRetry={resetGame}
          />
        )}
      </div>
    </div>
  );
}
