import { GameState } from '@/types/game';
import { ConsolePanel } from '../game/ConsolePanel';
import { 
  Trophy, 
  AlertTriangle, 
  RotateCcw, 
  BookOpen, 
  Rocket,
  CheckCircle,
  XCircle,
  TrendingUp,
  Shield,
  Users,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DebriefPageProps {
  state: GameState;
  onRetry: () => void;
}

export function DebriefPage({ state, onRetry }: DebriefPageProps) {
  const isSuccess = state.missionSuccess === true;
  const totalScore = Math.round(
    (state.score.safety + state.score.efficiency + state.score.teamwork + state.score.payloadSurvival) / 4
  );

  const getGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const skills = [
    { name: 'Systems Engineering', icon: TrendingUp, learned: true },
    { name: 'Decision Hierarchy', icon: Shield, learned: isSuccess },
    { name: 'Risk Mitigation', icon: AlertTriangle, learned: state.score.safety > 70 },
    { name: 'Team Coordination', icon: Users, learned: state.score.teamwork > 70 },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Main Result Card */}
        <div className={cn(
          'text-center p-8 rounded-2xl mb-8 animate-scale-in',
          isSuccess 
            ? 'bg-gradient-to-br from-success/20 to-success/5 border-2 border-success/50' 
            : 'bg-gradient-to-br from-danger/20 to-danger/5 border-2 border-danger/50'
        )}>
          <div className={cn(
            'w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6',
            isSuccess ? 'bg-success/20' : 'bg-danger/20'
          )}>
            {isSuccess ? (
              <Trophy className="w-12 h-12 text-success" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-danger" />
            )}
          </div>

          <h1 className={cn(
            'font-orbitron text-4xl md:text-5xl font-bold mb-4',
            isSuccess ? 'text-success' : 'text-danger'
          )}>
            {isSuccess ? 'MISSION COMPLETE' : 'MISSION FAILED'}
          </h1>

          <p className="text-xl text-muted-foreground mb-6">
            {isSuccess 
              ? 'Payload deployed successfully into orbit.' 
              : state.failureReason || 'Mission objectives not achieved.'}
          </p>

          {/* Overall Score */}
          <div className="inline-block px-8 py-4 rounded-xl bg-card border border-border">
            <p className="text-sm text-muted-foreground font-mono mb-1">MISSION GRADE</p>
            <p className={cn(
              'font-orbitron text-6xl font-bold',
              totalScore >= 70 ? 'text-success' : totalScore >= 50 ? 'text-warning' : 'text-danger'
            )}>
              {getGrade(totalScore)}
            </p>
            <p className="text-lg text-muted-foreground font-mono mt-1">{totalScore}%</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Performance Breakdown */}
          <ConsolePanel title="PERFORMANCE ANALYSIS">
            <div className="space-y-4">
              {[
                { label: 'Safety', value: state.score.safety, icon: Shield, desc: 'Margin preservation' },
                { label: 'Efficiency', value: state.score.efficiency, icon: TrendingUp, desc: 'Resource optimization' },
                { label: 'Teamwork', value: state.score.teamwork, icon: Users, desc: 'Station coordination' },
                { label: 'Payload', value: state.score.payloadSurvival, icon: Package, desc: 'Mission objective' },
              ].map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <stat.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{stat.label}</span>
                    </div>
                    <span className={cn(
                      'font-mono font-bold',
                      stat.value >= 70 ? 'text-success' : stat.value >= 50 ? 'text-warning' : 'text-danger'
                    )}>
                      {stat.value}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div 
                      className={cn(
                        'h-full rounded-full transition-all duration-1000',
                        stat.value >= 70 ? 'bg-success' : stat.value >= 50 ? 'bg-warning' : 'bg-danger'
                      )}
                      style={{ width: `${stat.value}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.desc}</p>
                </div>
              ))}
            </div>
          </ConsolePanel>

          {/* Skills Learned */}
          <ConsolePanel title={isSuccess ? "SKILLS ACQUIRED" : "LEARNING INSIGHTS"}>
            <div className="space-y-4">
              {skills.map((skill) => (
                <div 
                  key={skill.name}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border',
                    skill.learned 
                      ? 'bg-success/10 border-success/30' 
                      : 'bg-secondary/50 border-border'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    skill.learned ? 'bg-success/20' : 'bg-muted'
                  )}>
                    {skill.learned ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className={cn(
                    'font-mono text-sm',
                    skill.learned ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {skill.name}
                  </span>
                </div>
              ))}

              {!isSuccess && (
                <div className="p-4 rounded-lg bg-info/10 border border-info/30 mt-4">
                  <p className="text-sm text-info font-mono">
                    💡 "In spaceflight, small mistakes compound fast. Review your decisions and try again!"
                  </p>
                </div>
              )}
            </div>
          </ConsolePanel>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onRetry}
            className="btn-control flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            RETRY MISSION
          </button>
          
          <button className="btn-control btn-warning flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5" />
            REVIEW HANDBOOK
          </button>
          
          <button className="btn-control flex items-center justify-center gap-2 bg-gradient-to-r from-info to-info/80 border-info/80">
            <Rocket className="w-5 h-5" />
            ADVANCED MISSION
          </button>
        </div>
      </div>
    </div>
  );
}
