/**
 * Definiciones de tipos para el simulador de ecuaciones diferenciales y autoescalado
 * Proyecto: Análisis de latencia y autoescalado reactivo en servicios web
 * Materia: Ecuaciones Diferenciales - Ingeniería de Sistemas
 */

export type AutoscalingState = 
  | 'NORMAL'         // Sistema operando en régimen normal (sin sobrecarga)
  | 'DETECTING'      // Umbral superado, ventana de evaluación activa
  | 'PROVISIONING'   // Se ordenó escalar; servidores en proceso de encendido/arranque
  | 'STABILIZED'     // Nuevos servidores activos; capacidad aumentada
  | 'COOLING_DOWN';  // Tráfico normalizado; en espera de cooldown antes de desescalar

export interface SimulationConfig {
  // Parámetros temporales
  totalDuration: number;       // Duración total de simulación en segundos (ej. 140s)
  dt: number;                  // Paso de tiempo para el método de Euler (ej. 0.5s o 0.2s)
  
  // Parámetros de tráfico entrante λ(t)
  baseArrivalRate: number;     // Tasa base de solicitudes en reposo (solicitudes/s)
  peakArrivalRate: number;     // Tasa pico durante la apertura de inscripciones (solicitudes/s)
  peakStartTime: number;       // Momento en que inicia el pico (segundos)
  peakDuration: number;        // Duración del pico de solicitudes (segundos)
  peakRampTime: number;        // Tiempo de subida y bajada progresiva (para realismo)
  
  // Parámetros de capacidad y servidores μ(t)
  initialInstances: number;    // Servidores o instancias iniciales activas (N₀)
  capacityPerInstance: number; // Capacidad de procesamiento por instancia (solicitudes/s)
  minInstances: number;        // Mínimo número de instancias
  maxInstances: number;        // Capacidad máxima permitida (límite de escala)
  
  // Parámetros de la política de autoescalado reactivo
  autoscalingEnabled: boolean; // Si el autoescalado está activo (Escenario C) o no (Escenario B)
  scaleUpThresholdQueue: number; // Umbral de cola acumulada Q(t) para activar alarma (solicitudes)
  scaleUpThresholdUtil: number;  // Umbral de utilización λ/μ (ej. 0.90 o 90%)
  provisioningDelay: number;   // Retraso de aprovisionamiento de nuevas instancias (segundos)
  instancesPerScale: number;   // Cuántas instancias se añaden por evento de escalado
  cooldownPeriod: number;      // Tiempo mínimo tras normalización para reducir recursos (segundos)
}

export interface SimulationStep {
  t: number;                  // Tiempo actual (segundos)
  lambda: number;             // Tasa de llegada instantánea λ(t) [solicitudes/s]
  muNominal: number;          // Capacidad nominal total de los servidores activos μ(t) [solicitudes/s]
  muEffective: number;        // Tasa efectiva procesada (no puede superar λ + Q/dt si Q=0)
  dQdt: number;               // Derivada instantánea dQ/dt = λ(t) - μ(t)
  Q: number;                  // Solicitudes acumuladas en cola Q(t) [solicitudes]
  Wq: number;                 // Latencia estimada en cola Wq ≈ Q(t) / μ(t) [segundos]
  instances: number;          // Cantidad de instancias activas N(t)
  utilization: number;        // Utilización del cluster λ(t) / μ(t)
  state: AutoscalingState;    // Estado de la máquina de autoescalado
  stateDescription: string;   // Explicación textual del estado actual
  provisioningRemaining: number; // Segundos restantes para que arranquen las nuevas instancias
  cooldownRemaining: number;     // Segundos restantes de enfriamiento antes de apagar servidores
  totalArrivals: number;      // Total acumulado de solicitudes recibidas hasta t
  totalProcessed: number;     // Total acumulado de solicitudes procesadas hasta t
  arrivalsInStep: number;     // Solicitudes que llegan durante el intervalo Δt
  processedInStep: number;    // Solicitudes atendidas durante el intervalo Δt
}

export interface SimulationSummary {
  peakQueue: number;          // Máximo número de solicitudes en cola alcanzado
  peakQueueTime: number;      // Segundo en el que ocurrió el pico de cola
  peakLatency: number;        // Máximo tiempo estimado de espera en cola (segundos)
  peakArrivalRate: number;    // Máxima tasa de llegada registrada
  maxInstancesReached: number;// Máxima cantidad de servidores instanciados
  timeToRecover: number | null;// Segundos transcurridos desde el fin del pico hasta Q = 0
  totalRequestsReceived: number;
  totalRequestsProcessed: number;
  unprocessedAtEnd: number;
  autoscalingTriggered: boolean;
}

export interface ScenarioDefinition {
  id: 'A' | 'B' | 'C';
  name: string;
  shortDescription: string;
  badge: string;
  badgeColor: string;
  academicObjective: string;
  config: SimulationConfig;
}
