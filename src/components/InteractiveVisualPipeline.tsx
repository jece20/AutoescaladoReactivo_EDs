import { FC } from 'react';
import { 
  Users, 
  Layers, 
  Server, 
  Clock, 
  Zap, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { SimulationStep, SimulationConfig } from '../math/types';

interface InteractiveVisualPipelineProps {
  currentStep: SimulationStep;
  config: SimulationConfig;
  maxInstances: number;
}

export const InteractiveVisualPipeline: FC<InteractiveVisualPipelineProps> = ({
  currentStep,
  config,
  maxInstances,
}) => {
  const {
    t,
    lambda,
    muNominal,
    muEffective,
    dQdt,
    Q,
    Wq,
    instances,
    state,
    provisioningRemaining,
    cooldownRemaining,
  } = currentStep;

  // Cálculo del porcentaje del tanque de cola (escala visual de 0 a 300 solicitudes para ver el llenado cómodamente)
  const tankCapacity = Math.max(150, config.scaleUpThresholdQueue * 3);
  const queuePercent = Math.min(100, Math.round((Q / tankCapacity) * 100));

  // Derivada
  const isFilling = dQdt > 0.05 && Q >= 0;
  const isDraining = dQdt < -0.05 && Q > 0;
  const isNeutral = !isFilling && !isDraining;

  // Generador de explicación narrativa para exposición en clase
  const getPresentationNarrative = () => {
    if (!config.autoscalingEnabled) {
      if (t >= config.peakStartTime && t <= config.peakStartTime + config.peakDuration) {
        return {
          badge: '⚠️ Pico SIN Autoescalado',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300',
          title: `¡Avalancha de ${Math.round(lambda)} req/s con capacidad fija en ${Math.round(muNominal)} req/s!`,
          explanation: `Como la capacidad no escala, la derivada se mantiene en dQ/dt = +${dQdt.toFixed(0)} req/s. Cada segundo que pasa se acumulan ${dQdt.toFixed(0)} nuevas solicitudes en cola. Los estudiantes experimentan tiempos de espera de hasta ${Wq.toFixed(1)} segundos.`,
          hint: 'Observa a tus compañeros: Este es el colapso típico cuando una universidad no cuenta con autoescalado.'
        };
      } else if (t > config.peakStartTime + config.peakDuration && Q > 1) {
        return {
          badge: '⏳ Desahogo Lento Post-Pico',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
          title: `El pico terminó, pero la cola sigue acumulada (${Math.round(Q)} solicitudes)`,
          explanation: `La demanda bajó a ${Math.round(lambda)} req/s y la capacidad sigue en ${Math.round(muNominal)} req/s. La cola desciende lentamente (dQ/dt = ${dQdt.toFixed(0)} req/s). Se requerirán decenas de segundos adicionales solo para normalizarse.`,
          hint: 'La falta de autoescalado prolonga la mala experiencia del usuario incluso después del pico.'
        };
      }
      return {
        badge: 'Operación Estática',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
        title: 'Demanda dentro de los límites de capacidad fija',
        explanation: `Llegan ${Math.round(lambda)} req/s y el servidor despacha ${Math.round(muNominal)} req/s. No hay acumulación de cola.`,
        hint: 'Todo el sistema opera sin demoras en reposo.'
      };
    }

    // Autoescalado habilitado
    if (state === 'NORMAL') {
      return {
        badge: '🟢 Estado Normal',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
        title: 'Tráfico fluido dentro de capacidad instalada',
        explanation: `Llegan ${Math.round(lambda)} solicitudes/s y los ${instances} servidores activos despachan hasta ${Math.round(muNominal)} solicitudes/s. La derivada dQ/dt es ≤ 0, por lo que la cola permanece en 0.`,
        hint: 'Los estudiantes ingresan y son atendidos de inmediato sin hacer fila virtual.'
      };
    }

    if (state === 'DETECTING' || state === 'PROVISIONING') {
      return {
        badge: '🚨 Retraso de Aprovisionamiento',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
        title: `¡Sobrecarga detectada! Arrancando nuevos servidores (${provisioningRemaining}s restantes)`,
        explanation: `La cola superó el umbral (${config.scaleUpThresholdQueue} solic.) y se ordenó escalar. ¡Punto clave para la clase!: Las máquinas tardan ${config.provisioningDelay} segundos en encender. Durante esta ventana, la capacidad sigue en ${Math.round(muNominal)} req/s y la cola sigue creciendo por la EDO.`,
        hint: 'Este retraso es el motivo por el cual la cola alcanza un pico temporal antes de recuperarse.'
      };
    }

    if (state === 'STABILIZED') {
      if (Q > 2) {
        return {
          badge: '⚡ Autoescalado Activo: Drenando Cola',
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300',
          title: `¡Capacidad aumentada a ${Math.round(muNominal)} req/s con ${instances} servidores!`,
          explanation: `Al entrar en servicio los nuevos nodos, ahora la capacidad supera la demanda (μ > λ). La derivada invierte su signo a NEGATIVO (dQ/dt = ${dQdt.toFixed(0)} req/s) y la cola se vacía con rapidez.`,
          hint: 'Observa cómo el líquido del tanque de cola baja a gran velocidad.'
        };
      }
      return {
        badge: '✅ Sistema Estabilizado',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
        title: 'Cola completamente evacuada y servidores adaptados',
        explanation: `El cluster cuenta con la capacidad óptima para responder a la demanda sin generar retrasos ni saturación en el servicio.`,
        hint: 'La latencia se redujo nuevamente a valores mínimos.'
      };
    }

    if (state === 'COOLING_DOWN') {
      return {
        badge: '🛡️ Periodo de Enfriamiento (Cooldown)',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300',
        title: `Tráfico normalizado: Esperando ${cooldownRemaining}s antes de apagar servidores`,
        explanation: `La demanda ha caído de nuevo. Para evitar encender y apagar servidores continuamente ante fluctuaciones breves (efecto flapping), el sistema espera una ventana prudencial antes de reducir capacidad.`,
        hint: 'Buenas prácticas de arquitectura en la nube para estabilidad y control de costos.'
      };
    }

    return {
      badge: 'Monitoreo Activo',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
      title: 'Sistema en ejecución',
      explanation: currentStep.stateDescription,
      hint: ''
    };
  };

  const narrative = getPresentationNarrative();

  return (
    <div className="space-y-4">
      
      {/* 1. CAJA DE NARRATIVA DINÁMICA DE PRESENTACIÓN */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${narrative.badgeColor} flex items-center gap-1.5`}>
              <Sparkles className="w-3.5 h-3.5" />
              {narrative.badge}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Segundo {t.toFixed(1)}s / {config.totalDuration}s
            </span>
          </div>

          {/* Derivada instantánea visual */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs">
            <span className="text-slate-500">Derivada dQ/dt:</span>
            <span className={`font-bold flex items-center gap-1 ${
              isFilling ? 'text-rose-600 dark:text-rose-400' : isDraining ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
            }`}>
              {isFilling && <TrendingUp className="w-4 h-4 text-rose-500 animate-bounce" />}
              {isDraining && <TrendingDown className="w-4 h-4 text-emerald-500" />}
              {isNeutral && <Minus className="w-4 h-4" />}
              {dQdt > 0 ? `+${dQdt.toFixed(0)}` : dQdt.toFixed(0)} req/s
            </span>
            <span className="text-[10px] text-slate-400">
              ({isFilling ? 'Llenando cola' : isDraining ? 'Vaciando cola' : 'En equilibrio'})
            </span>
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {narrative.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {narrative.explanation}
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-3 py-1.5 rounded-lg border border-sky-200 dark:border-sky-900">
            <span className="font-semibold">💡 Para tu exposición:</span>
            <span>{narrative.hint}</span>
          </div>
        </div>
      </div>

      {/* 2. PIPELINE ARQUITECTÓNICO VISUAL (4 ESTACIONES) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* ESTACIÓN 1: ESTUDIANTES Y TRÁFICO ENTRANTE λ(t) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">1. Estudiantes</h4>
                <span className="text-[10px] text-slate-400">Peticiones de Matrícula</span>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded-md">
              λ(t)
            </span>
          </div>

          {/* Visual animation of incoming flow */}
          <div className="my-4 text-center">
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {Math.round(lambda)}
              <span className="text-xs font-normal text-slate-500 ml-1">solic/s</span>
            </div>
            
            {/* Animated flow dots */}
            <div className="flex items-center justify-center gap-1.5 mt-2 h-6">
              {Array.from({ length: Math.min(8, Math.max(3, Math.round(lambda / 30))) }).map((_, i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${
                    lambda > config.baseArrivalRate * 1.5
                      ? 'bg-rose-500 animate-ping'
                      : 'bg-sky-500 animate-pulse'
                  }`}
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>

            <div className="mt-2 text-[11px] font-medium text-slate-500">
              {lambda > config.baseArrivalRate * 1.5 ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold">¡Avalancha activa!</span>
              ) : (
                <span>Tráfico habitual continuo</span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>Base: {config.baseArrivalRate} req/s</span>
            <span>Pico: {config.peakArrivalRate} req/s</span>
          </div>
        </div>

        {/* ESTACIÓN 2: EL BUFFER DE COLA Q(t) (EL TANQUE VISUAL DE ESPERA) */}
        <div className="bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">2. Buffer de Cola</h4>
                <span className="text-[10px] text-slate-400">Solución EDO: Q(t) ≥ 0</span>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md">
              Q(t)
            </span>
          </div>

          {/* Visual Tank Gauge */}
          <div className="my-3">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-slate-500">Solicitudes en cola:</span>
              <span className={`text-2xl font-black font-mono ${
                Q > 100 ? 'text-rose-600 dark:text-rose-400' : Q > 20 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'
              }`}>
                {Math.round(Q)}
              </span>
            </div>

            {/* Simulated Liquid Tank */}
            <div className="w-full h-14 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative p-1 flex flex-col justify-end">
              {/* Umbral line */}
              <div
                className="absolute left-0 right-0 border-b border-dashed border-rose-500 z-10"
                style={{ bottom: `${Math.min(95, Math.round((config.scaleUpThresholdQueue / tankCapacity) * 100))}%` }}
                title={`Umbral de autoescalado: ${config.scaleUpThresholdQueue} solicitudes`}
              >
                <span className="absolute right-1 -top-3.5 text-[9px] font-mono text-rose-500 font-bold bg-white/80 dark:bg-slate-900/80 px-1 rounded">
                  Alarma ({config.scaleUpThresholdQueue})
                </span>
              </div>

              {/* Liquid fill */}
              <div
                className={`w-full rounded-lg transition-all duration-300 ${
                  Q > 150
                    ? 'bg-rose-500 shadow-lg shadow-rose-500/30'
                    : Q > config.scaleUpThresholdQueue
                    ? 'bg-amber-500 shadow-md shadow-amber-500/30'
                    : Q > 0
                    ? 'bg-yellow-400'
                    : 'bg-emerald-400/40 h-1'
                }`}
                style={{ height: `${Math.max(4, queuePercent)}%` }}
              />
            </div>

            {/* Waiting time badge */}
            <div className="mt-2 flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                Espera estimada Wq:
              </span>
              <span className={`font-mono font-bold ${
                Wq > 15 ? 'text-rose-600 dark:text-rose-400' : Wq > 2 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {Wq.toFixed(1)} segundos
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>Frontera: Q(t) ≥ 0</span>
            <span className={isFilling ? 'text-rose-600 font-semibold' : isDraining ? 'text-emerald-600 font-semibold' : ''}>
              {isFilling ? '▲ Llenándose' : isDraining ? '▼ Desahogando' : 'Vaciada'}
            </span>
          </div>
        </div>

        {/* ESTACIÓN 3: EL CONTROLADOR DE AUTOESCALADO Y RETRASO */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-xl">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">3. Autoescalado</h4>
                <span className="text-[10px] text-slate-400">Retraso de Aprovisionamiento</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              config.autoscalingEnabled ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' : 'bg-slate-100 text-slate-500'
            }`}>
              {config.autoscalingEnabled ? 'ACTIVO' : 'APAGADO'}
            </span>
          </div>

          <div className="my-3 text-center">
            {state === 'PROVISIONING' ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 animate-pulse">
                <div className="flex items-center justify-center gap-1.5 text-amber-700 dark:text-amber-300 text-xs font-bold">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Encendiendo Servidores...
                </div>
                <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                  {provisioningRemaining}s
                </div>
                <div className="text-[10px] text-amber-600/80 mt-0.5">
                  Retraso de arranque de nube
                </div>
              </div>
            ) : state === 'STABILIZED' ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Escalado Efectivo
                </div>
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  +{instances - config.initialInstances} Nodos
                </div>
                <div className="text-[10px] text-emerald-600/80 mt-0.5">
                  Capacidad incrementada
                </div>
              </div>
            ) : state === 'COOLING_DOWN' ? (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-center gap-1.5 text-purple-700 dark:text-purple-300 text-xs font-bold">
                  <Clock className="w-4 h-4" />
                  Periodo Cooldown
                </div>
                <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400 mt-1">
                  {cooldownRemaining}s
                </div>
                <div className="text-[10px] text-purple-600/80 mt-0.5">
                  Evitando oscilación
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {config.autoscalingEnabled ? 'Sin sobrecarga' : 'Sin autoescalado'}
                </div>
                <div className="text-lg font-mono font-bold text-slate-700 dark:text-slate-300 mt-1">
                  {config.autoscalingEnabled ? 'En Espera' : 'Capacidad Fija'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {config.autoscalingEnabled ? `Dispara si Q ≥ ${config.scaleUpThresholdQueue}` : 'Escenario estático B'}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>Retraso: {config.provisioningDelay}s</span>
            <span>+ΔN: {config.instancesPerScale} nodos</span>
          </div>
        </div>

        {/* ESTACIÓN 4: CLUSTER DE SERVIDORES Y DESPACHO μ(t) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">4. Servidores</h4>
                <span className="text-[10px] text-slate-400">Capacidad Total μ(t)</span>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
              μ(t)
            </span>
          </div>

          <div className="my-3 text-center">
            <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              {Math.round(muNominal)}
              <span className="text-xs font-normal text-slate-500 ml-1">solic/s</span>
            </div>

            {/* Visual server rack pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
              {Array.from({ length: maxInstances }).map((_, idx) => {
                const isActive = idx < instances;
                return (
                  <span
                    key={idx}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-all duration-300 ${
                      isActive
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    S{idx + 1}
                  </span>
                );
              })}
            </div>

            <div className="mt-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {instances} de {maxInstances} servidores ({config.capacityPerInstance} req/s c/u)
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>Efectivas: {Math.round(muEffective)} req/s</span>
            <span className="text-emerald-600 font-semibold">Despacho OK</span>
          </div>
        </div>

      </div>

    </div>
  );
};
