import { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface ConsolePanelProps {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'warning' | 'critical' | 'success';
  glow?: boolean;
  style?: CSSProperties;
}

export function ConsolePanel({ 
  title, 
  children, 
  className,
  variant = 'default',
  glow = false,
  style,
}: ConsolePanelProps) {
  const variantStyles = {
    default: 'border-console-border',
    warning: 'border-warning/50',
    critical: 'border-danger/50 animate-warning-flash',
    success: 'border-success/50',
  };

  const glowStyles = {
    default: 'shadow-[0_0_30px_hsl(var(--primary)/0.3)]',
    warning: 'shadow-[0_0_30px_hsl(var(--warning)/0.3)]',
    critical: 'shadow-[0_0_30px_hsl(var(--danger)/0.3)]',
    success: 'shadow-[0_0_30px_hsl(var(--success)/0.3)]',
  };

  return (
    <div 
      className={cn(
        'console-panel relative overflow-hidden',
        variantStyles[variant],
        glow && glowStyles[variant],
        className
      )}
      style={style}
    >
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-4 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-danger" />
          <div className="w-2 h-2 rounded-full bg-warning" />
          <div className="w-2 h-2 rounded-full bg-success" />
        </div>
        <span className="ml-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="pt-10 relative z-10">
        {children}
      </div>
    </div>
  );
}
