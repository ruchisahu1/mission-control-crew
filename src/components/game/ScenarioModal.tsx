import { Scenario } from '@/types/game';
import { ConsolePanel } from './ConsolePanel';
import { AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ScenarioModalProps {
  scenario: Scenario;
  onChoice: (choiceId: string) => void;
}

export function ScenarioModal({ scenario, onChoice }: ScenarioModalProps) {
  const [timeLeft, setTimeLeft] = useState(scenario.timeLimit);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      // Auto-select wrong answer on timeout
      const wrongChoice = scenario.choices.find(c => !c.isCorrect);
      if (wrongChoice) {
        onChoice(wrongChoice.id);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, scenario, onChoice]);

  const handleChoice = (choiceId: string) => {
    setSelectedChoice(choiceId);
    setTimeout(() => onChoice(choiceId), 500);
  };

  const Icon = scenario.severity === 'critical' ? AlertCircle : AlertTriangle;
  const isCriticalTime = timeLeft <= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl">
        <ConsolePanel 
          title="ANOMALY DETECTED" 
          variant={scenario.severity}
          glow
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center',
              scenario.severity === 'critical' 
                ? 'bg-danger/20 border border-danger/50' 
                : 'bg-warning/20 border border-warning/50'
            )}>
              <Icon className={cn(
                'w-6 h-6',
                scenario.severity === 'critical' ? 'text-danger animate-pulse' : 'text-warning'
              )} />
            </div>
            
            <div className="flex-1">
              <h2 className="font-orbitron text-xl font-bold text-foreground mb-1">
                {scenario.title}
              </h2>
              <p className="text-sm text-muted-foreground font-mono">
                {scenario.description}
              </p>
            </div>

            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg',
              isCriticalTime ? 'bg-danger/20 text-danger' : 'bg-secondary text-foreground'
            )}>
              <Clock className={cn('w-4 h-4', isCriticalTime && 'animate-pulse')} />
              <span className="font-mono font-bold">{timeLeft}s</span>
            </div>
          </div>

          {/* Choices */}
          <div className="space-y-3">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
              Select Response Action:
            </p>
            
            {scenario.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                disabled={selectedChoice !== null}
                className={cn(
                  'w-full p-4 rounded-lg border text-left transition-all duration-200',
                  'bg-secondary/50 border-border hover:border-primary/50 hover:bg-secondary',
                  selectedChoice === choice.id && 'border-primary bg-primary/10',
                  selectedChoice !== null && selectedChoice !== choice.id && 'opacity-50'
                )}
              >
                <span className="font-mono text-sm">{choice.text}</span>
              </button>
            ))}
          </div>

          {/* AI Hint */}
          <div className="mt-6 p-3 rounded-lg bg-info/10 border border-info/30">
            <p className="text-xs font-mono text-info">
              💡 ATLAS AI: Consider the trade-offs. Safety should always be prioritized over mission success.
            </p>
          </div>
        </ConsolePanel>
      </div>
    </div>
  );
}
