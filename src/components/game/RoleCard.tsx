import { Role } from '@/types/game';
import { roleDescriptions } from '@/data/gameData';
import { cn } from '@/lib/utils';
import { Compass, Flame, Zap } from 'lucide-react';

interface RoleCardProps {
  role: Role;
  isSelected: boolean;
  onSelect: (role: Role) => void;
}

const roleIcons = {
  guidance: Compass,
  propulsion: Flame,
  systems: Zap,
};

export function RoleCard({ role, isSelected, onSelect }: RoleCardProps) {
  const info = roleDescriptions[role];
  const Icon = roleIcons[role];

  return (
    <button
      onClick={() => onSelect(role)}
      className={cn(
        'role-card text-left w-full group',
        isSelected && 'selected'
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-14 h-14 rounded-lg flex items-center justify-center transition-all duration-300',
          'bg-primary/10 border border-primary/30',
          isSelected && 'bg-primary/20 border-primary',
          'group-hover:bg-primary/15'
        )}>
          <Icon className={cn(
            'w-7 h-7 transition-colors',
            isSelected ? 'text-primary' : 'text-primary/70'
          )} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{info.emoji}</span>
            <h3 className="font-orbitron font-semibold text-foreground">
              {info.title}
            </h3>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {info.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {info.responsibilities.map((resp, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground font-mono"
              >
                {resp}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {isSelected && (
        <div className="mt-4 pt-3 border-t border-primary/30">
          <span className="status-go">STATION ACTIVE</span>
        </div>
      )}
    </button>
  );
}
