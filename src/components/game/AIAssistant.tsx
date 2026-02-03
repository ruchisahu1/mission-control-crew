import { AIMessage } from '@/types/game';
import { ConsolePanel } from './ConsolePanel';
import { Bot, AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface AIAssistantProps {
  messages: AIMessage[];
}

export function AIAssistant({ messages }: AIAssistantProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getIcon = (type: AIMessage['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-danger animate-pulse" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Info className="w-4 h-4 text-info" />;
    }
  };

  const getMessageStyle = (type: AIMessage['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-warning/10 border-warning/30 text-warning';
      case 'critical':
        return 'bg-danger/10 border-danger/30 text-danger';
      case 'success':
        return 'bg-success/10 border-success/30 text-success';
      default:
        return 'bg-info/10 border-info/30 text-info';
    }
  };

  return (
    <ConsolePanel title="Launch AI Assistant" className="flex flex-col">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-success border border-card" />
        </div>
        <div>
          <h3 className="font-orbitron text-xs font-semibold">ATLAS AI</h3>
          <p className="text-[10px] text-muted-foreground">Mission Control</p>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="space-y-1.5 max-h-[120px] md:max-h-[140px] overflow-y-auto pr-1 scrollbar-thin flex-1"
      >
        {messages.length === 0 ? (
          <p className="text-xs text-muted-foreground font-mono">
            Awaiting mission parameters...
          </p>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id}
              className={cn(
                'flex items-start gap-1.5 p-1.5 rounded border text-[10px] font-mono animate-fade-in',
                getMessageStyle(msg.type)
              )}
            >
              {getIcon(msg.type)}
              <span className="leading-tight">{msg.message}</span>
            </div>
          ))
        )}
      </div>
    </ConsolePanel>
  );
}
