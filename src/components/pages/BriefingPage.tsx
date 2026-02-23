import { Role } from '@/types/game';
import { RoleCard } from '../game/RoleCard';
import { AIAssistant } from '../game/AIAssistant';
import { ConsolePanel } from '../game/ConsolePanel';
import { Rocket, BookOpen, Bot, Play, Target, Clock, Gauge, CloudLightning } from 'lucide-react';
import { AIMessage } from '@/types/game';

interface BriefingPageProps {
  selectedRole: Role | null;
  onSelectRole: (role: Role) => void;
  onStartMission: () => void;
  aiMessages: AIMessage[];
}

export function BriefingPage({ selectedRole, onSelectRole, onStartMission, aiMessages }: BriefingPageProps) {
  return (
    <div className="min-h-screen p-3 md:p-6 lg:p-8">
      {/* Hero Header */}
      <header className="text-center mb-4 md:mb-6 animate-fade-in">
        <div className="inline-flex items-center gap-3 md:gap-4 mb-2">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 flex items-center justify-center">
            <Rocket className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          </div>
          <div className="text-left">
            <h1 className="font-orbitron text-xl md:text-2xl lg:text-4xl font-bold text-foreground">
              AI ROCKET PROPULSION ENGINEER
            </h1>
            <p className="font-orbitron text-xs md:text-sm lg:text-base text-primary tracking-[0.2em] md:tracking-[0.3em]">
              LAUNCH AUTHORITY
            </p>
          </div>
        </div>
      </header>

      {/* Mission Stats Bar */}
      <div className="max-w-5xl mx-auto mb-4 md:mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {[
            { icon: Target, label: 'Target Altitude', value: '35,786 km', color: 'text-primary' },
            { icon: Gauge, label: 'Payload Mass', value: '4,200 kg', color: 'text-info' },
            { icon: Clock, label: 'Launch Window', value: '2 hours', color: 'text-warning' },
            { icon: CloudLightning, label: 'Weather', value: 'MARGINAL', color: 'text-warning' },
          ].map((item) => (
            <div key={item.label} className="console-panel !p-2 md:!p-3 flex items-center gap-2 md:gap-3">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-secondary/80 flex items-center justify-center ${item.color}`}>
                <item.icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] md:text-[10px] text-muted-foreground font-mono uppercase tracking-wider truncate">{item.label}</p>
                <p className="font-mono font-bold text-foreground text-xs md:text-sm">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Main Content - Asymmetric Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-3 md:gap-4 lg:gap-6">
          
          {/* Left Column - Mission Brief & AI */}
          <div className="md:col-span-1 lg:col-span-4 space-y-3 order-2 lg:order-1">
            <ConsolePanel title="MISSION BRIEF" className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Rocket className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-orbitron font-semibold text-sm md:text-base mb-0.5">
                    ATLAS-7 Orbital Insertion
                  </h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed">
                    Launch a communications satellite into geostationary orbit.
                  </p>
                </div>
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground border-t border-border/50 pt-2 font-mono">
                You are a Flight Controller. Your decisions determine mission success.
              </div>
            </ConsolePanel>

            <AIAssistant messages={aiMessages} />
          </div>

          {/* Center Column - Role Selection */}
          <div className="md:col-span-1 lg:col-span-5 order-1 lg:order-2">
            <ConsolePanel 
              title="SELECT YOUR STATION" 
              className="animate-fade-in h-full" 
              style={{ animationDelay: '0.15s' }}
            >
              <p className="text-xs md:text-sm text-muted-foreground mb-3">
                Choose your role. AI will assist with other stations.
              </p>
              <div className="space-y-2 md:space-y-3">
                {(['guidance', 'propulsion', 'systems'] as Role[]).map((role, i) => (
                  <div key={role} className="animate-fade-in" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                    <RoleCard
                      role={role}
                      isSelected={selectedRole === role}
                      onSelect={onSelectRole}
                    />
                  </div>
                ))}
              </div>
            </ConsolePanel>
          </div>

          {/* Right Column - How to Play & Actions */}
          <div className="md:col-span-2 lg:col-span-3 space-y-3 order-3">
            <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
              <ConsolePanel title="PROTOCOL" className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
                <ul className="space-y-1.5 text-[10px] md:text-xs">
                  {[
                    'Follow pre-launch checklists',
                    'Monitor AI alerts',
                    'Toggle systems at your station',
                    'Coordinate with AI team',
                    'Safety > Speed > Success',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-primary font-mono font-bold">{(i + 1).toString().padStart(2, '0')}</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </ConsolePanel>

              {/* Action Buttons */}
              <div className="space-y-2 animate-fade-in flex flex-col justify-end" style={{ animationDelay: '0.3s' }}>
                <button
                  onClick={onStartMission}
                  disabled={!selectedRole}
                  className="btn-control w-full flex items-center justify-center gap-2 py-3 md:py-4"
                >
                  <Play className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">BEGIN MISSION</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button className="btn-control btn-warning flex items-center justify-center gap-1.5 py-2 text-[10px] md:text-xs opacity-80">
                    <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    HANDBOOK
                  </button>

                  <button className="btn-control flex items-center justify-center gap-1.5 py-2 text-[10px] md:text-xs opacity-80 bg-gradient-to-r from-info to-info/80 border-info/80">
                    <Bot className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    MEET AI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
