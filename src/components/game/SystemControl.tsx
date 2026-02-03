import { SystemControl as SystemControlType, Role } from '@/types/game';
import { cn } from '@/lib/utils';
import { Power, Loader2, Check, AlertTriangle, Lock, ArrowRight } from 'lucide-react';

interface SystemControlProps {
  system: SystemControlType;
  userRole: Role | null;
  onToggle: (systemId: string) => void;
  allSystems?: SystemControlType[];
}

export function SystemControl({ system, userRole, onToggle, allSystems = [] }: SystemControlProps) {
  const isUserSystem = userRole === system.role;
  const isActive = system.status !== 'off';
  const isLoading = system.status === 'loading' || system.status === 'calibrating';
  const isReady = system.status === 'on' || system.status === 'stable' || system.status === 'armed' || system.status === 'go';

  // Check if dependencies are met
  const dependenciesMet = !system.dependsOn || system.dependsOn.every(depId => {
    const depSystem = allSystems.find(s => s.id === depId);
    return depSystem && depSystem.status !== 'off';
  });

  const getRoleColor = () => {
    switch (system.role) {
      case 'guidance': return 'border-l-info';
      case 'propulsion': return 'border-l-warning';
      case 'systems': return 'border-l-primary';
      default: return 'border-l-muted';
    }
  };

  const getRoleLabel = () => {
    switch (system.role) {
      case 'guidance': return '🧭 GDO';
      case 'propulsion': return '🔥 PRO';
      case 'systems': return '⚡ SYS';
      default: return '';
    }
  };

  const getStatusBadge = () => {
    if (!dependenciesMet && system.status === 'off') {
      return <span className="status-standby flex items-center gap-1"><Lock className="w-3 h-3" /> LOCKED</span>;
    }
    switch (system.status) {
      case 'off':
        return <span className="status-no-go">OFF</span>;
      case 'loading':
        return <span className="status-standby">LOADING</span>;
      case 'calibrating':
        return <span className="status-standby">CALIBRATING</span>;
      case 'stable':
        return <span className="status-go">STABLE</span>;
      case 'armed':
        return <span className="status-go">ARMED</span>;
      case 'go':
        return <span className="status-go">GO</span>;
      case 'warning':
        return <span className="status-standby">WARNING</span>;
      case 'critical':
        return <span className="status-no-go">CRITICAL</span>;
      default:
        return <span className="status-go">ON</span>;
    }
  };

  const getDependencyNames = () => {
    if (!system.dependsOn || system.dependsOn.length === 0) return null;
    const deps = system.dependsOn.map(depId => {
      const dep = allSystems.find(s => s.id === depId);
      return dep?.name || depId;
    });
    return deps.join(', ');
  };

  return (
    <div className={cn(
      'relative p-3 rounded-lg transition-all duration-200 border-l-4',
      getRoleColor(),
      isUserSystem && 'bg-primary/5 ring-1 ring-primary/20',
      !isUserSystem && 'bg-secondary/30 opacity-80',
      !dependenciesMet && system.status === 'off' && 'opacity-50'
    )}>
      <div className="flex items-start gap-3">
        {/* Toggle Button */}
        <button
          onClick={() => onToggle(system.id)}
          disabled={!isUserSystem || isLoading || (!dependenciesMet && system.status === 'off')}
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0',
            'border-2',
            isActive 
              ? 'bg-success/20 border-success' 
              : 'bg-secondary/80 border-border hover:border-primary/50',
            !isUserSystem && 'cursor-not-allowed',
            (!dependenciesMet && system.status === 'off') && 'cursor-not-allowed',
            isUserSystem && !isLoading && dependenciesMet && 'hover:scale-105 hover:shadow-lg'
          )}
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 text-warning animate-spin" />
          ) : isReady ? (
            <Check className="w-6 h-6 text-success" />
          ) : !dependenciesMet ? (
            <Lock className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Power className={cn(
              'w-6 h-6',
              isUserSystem ? 'text-muted-foreground group-hover:text-primary' : 'text-muted-foreground'
            )} />
          )}
        </button>
        
        {/* System Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-bold tracking-wide text-foreground">
              {system.name.toUpperCase()}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary/80 text-muted-foreground">
              {getRoleLabel()}
            </span>
            {isUserSystem && (
              <span className="text-[10px] text-primary font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10">
                YOUR STATION
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
            {system.description}
          </p>
          
          {/* Dependency Info */}
          {system.dependsOn && system.dependsOn.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/70">
              <ArrowRight className="w-3 h-3" />
              <span>Requires: {getDependencyNames()}</span>
              {dependenciesMet && system.status === 'off' && (
                <span className="text-success ml-1">✓ Ready</span>
              )}
            </div>
          )}
        </div>
        
        {/* Status Badge */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          {system.status === 'warning' && (
            <AlertTriangle className="w-4 h-4 text-warning animate-pulse" />
          )}
          {getStatusBadge()}
        </div>
      </div>
    </div>
  );
}
