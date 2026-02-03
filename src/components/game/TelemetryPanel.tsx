import { TelemetryData } from '@/types/game';
import { ConsolePanel } from './ConsolePanel';
import { cn } from '@/lib/utils';

interface TelemetryPanelProps {
  data: TelemetryData;
  isLaunched: boolean;
}

export function TelemetryPanel({ data, isLaunched }: TelemetryPanelProps) {
  const formatNumber = (num: number, decimals: number = 0) => {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    });
  };

  const metrics = [
    { label: 'ALTITUDE', value: formatNumber(data.altitude), unit: 'km', warning: false },
    { label: 'VELOCITY', value: formatNumber(data.velocity), unit: 'm/s', warning: false },
    { label: 'FUEL', value: formatNumber(data.fuelLevel, 1), unit: '%', warning: data.fuelLevel < 30 },
    { label: 'THRUST', value: formatNumber(data.thrust, 1), unit: '%', warning: data.thrust < 80 },
    { label: 'TEMP', value: formatNumber(data.temperature), unit: '°C', warning: data.temperature > 800 },
    { label: 'VIBRATION', value: formatNumber(data.vibration, 2), unit: 'g', warning: data.vibration > 5 },
  ];

  return (
    <ConsolePanel title="LIVE TELEMETRY">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {metrics.map((metric) => (
          <div 
            key={metric.label}
            className={cn(
              'p-3 rounded-lg border transition-all duration-300',
              metric.warning 
                ? 'bg-warning/10 border-warning/50' 
                : 'bg-console-bg border-border'
            )}
          >
            <p className="text-xs font-mono text-muted-foreground mb-1">
              {metric.label}
            </p>
            <div className="flex items-baseline gap-1">
              <span className={cn(
                'font-mono text-xl font-bold',
                metric.warning ? 'text-warning' : 'text-telemetry',
                isLaunched && 'text-glow'
              )}>
                {isLaunched ? metric.value : '--'}
              </span>
              <span className="text-xs text-muted-foreground">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </ConsolePanel>
  );
}
