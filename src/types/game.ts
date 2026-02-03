export type Role = 'guidance' | 'propulsion' | 'systems';

export type GamePhase = 'briefing' | 'prelaunch' | 'launch' | 'debrief';

export type SystemStatus = 'off' | 'on' | 'loading' | 'calibrating' | 'stable' | 'armed' | 'go' | 'no-go' | 'warning' | 'critical';

export interface SystemControl {
  id: string;
  name: string;
  status: SystemStatus;
  role: Role;
  description: string;
  isRequired: boolean;
  dependsOn?: string[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  type: 'wind' | 'engine' | 'power' | 'comms' | 'thermal';
  severity: 'warning' | 'critical';
  choices: ScenarioChoice[];
  timeLimit: number;
}

export interface ScenarioChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  consequence: string;
  scoreImpact: number;
}

export interface GameState {
  phase: GamePhase;
  selectedRole: Role | null;
  countdown: number;
  isCountdownActive: boolean;
  systems: SystemControl[];
  currentScenario: Scenario | null;
  completedScenarios: string[];
  score: {
    safety: number;
    efficiency: number;
    teamwork: number;
    payloadSurvival: number;
  };
  missionSuccess: boolean | null;
  failureReason: string | null;
  aiMessages: AIMessage[];
}

export interface AIMessage {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  message: string;
  timestamp: number;
}

export interface TelemetryData {
  altitude: number;
  velocity: number;
  fuelLevel: number;
  thrust: number;
  temperature: number;
  vibration: number;
}
