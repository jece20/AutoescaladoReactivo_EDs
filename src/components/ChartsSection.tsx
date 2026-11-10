import { FC } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { SimulationStep, SimulationConfig } from '../math/types';
import { Activity, Clock, Layers, Zap } from 'lucide-react';

interface ChartsSectionProps {
  steps: SimulationStep[];
  currentStepIndex: number;
  config: SimulationConfig;
}

export const ChartsSection: FC<ChartsSectionProps> = ({
  steps,
  currentStepIndex,
  config,
}) => {
  // Datos acumulados hasta el instante actual para animación interactiva
  const visibleData = steps.slice(0, Math.max(1, currentStepIndex + 1));
  const currentStep = steps[currentStepIndex] || steps[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      
      {/* GRÁFICA 1: Tráfico Entrante λ(t) vs Capacidad de Procesamiento μ(t) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                1. Tasa de Llegada λ(t) vs Capacidad μ(t)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">solic/s</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
            Cuando la curva <strong className="text-sky-600 dark:text-sky-400">λ(t)</strong> supera la capacidad <strong className="text-indigo-600 dark:text-indigo-400">μ(t)</strong>, la derivada <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">dQ/dt &gt; 0</span> y la cola crece.
          </p>
        </div>

        <div className="h-60 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={visibleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.8} />
              <XAxis
                dataKey="t"
                domain={[0, config.totalDuration]}
                tickFormatter={(t) => `${t}s`}
                stroke="#64748b"
                fontSize={11}
              />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                iconType="plainline"
              />
              
              {/* Marcadores de inicio y fin de pico */}
              <ReferenceLine x={config.peakStartTime} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Apertura', fill: '#d97706', fontSize: 10 }} />
              <ReferenceLine x={config.peakStartTime + config.peakDuration} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Fin Pico', fill: '#d97706', fontSize: 10 }} />

              {/* Área bajo la curva de llegada λ(t) */}
              <Area
                type="monotone"
                dataKey="lambda"
                name="Llegadas λ(t)"
                stroke="#0284c7"
                fill="url(#colorLambdaLight)"
                strokeWidth={2}
                isAnimationActive={false}
              />

              {/* Capacidad Nominal μ(t) */}
              <Line
                type="stepAfter"
                dataKey="muNominal"
                name="Capacidad μ(t)"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />

              {/* Tasa Efectiva Procesada */}
              <Line
                type="monotone"
                dataKey="muEffective"
                name="Procesadas Efectivas"
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />

              <defs>
                <linearGradient id="colorLambdaLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
          <span>En t={currentStep.t.toFixed(1)}s: λ={currentStep.lambda} req/s | μ={currentStep.muNominal} req/s</span>
          <span className={currentStep.lambda > currentStep.muNominal ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-medium'}>
            {currentStep.lambda > currentStep.muNominal ? 'Sobrecarga Activa' : 'Capacidad Normal'}
          </span>
        </div>
      </div>

      {/* GRÁFICA 2: Evolución de Solicitudes Pendientes Q(t) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                2. Solicitudes Pendientes en Cola Q(t) (Euler)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">solicitudes</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
            Integral numérica de <span className="font-mono text-sky-600 dark:text-sky-400">dQ/dt = λ - μ</span> respetando la cota <span className="font-mono text-emerald-600 dark:text-emerald-400">Q(t) ≥ 0</span>.
          </p>
        </div>

        <div className="h-60 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={visibleData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.8} />
              <XAxis
                dataKey="t"
                domain={[0, config.totalDuration]}
                tickFormatter={(t) => `${t}s`}
                stroke="#64748b"
                fontSize={11}
              />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                iconType="plainline"
              />

              {config.autoscalingEnabled && (
                <ReferenceLine
                  y={config.scaleUpThresholdQueue}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{ value: `Umbral (${config.scaleUpThresholdQueue})`, fill: '#ef4444', fontSize: 10 }}
                />
              )}

              <Area
                type="monotone"
                dataKey="Q"
                name="Cola Q(t)"
                stroke="#d97706"
                fill="url(#colorQueueLight)"
                strokeWidth={2}
                isAnimationActive={false}
              />

              <defs>
                <linearGradient id="colorQueueLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
          <span>Cola actual: <strong className="text-amber-600 dark:text-amber-400">{Math.round(currentStep.Q)} solicitudes</strong></span>
          <span className="font-mono text-slate-500">dQ/dt = {currentStep.dQdt.toFixed(1)} req/s</span>
        </div>
      </div>

      {/* GRÁFICA 3: Latencia Estimada en Cola Wq(t) ≈ Q(t) / μ(t) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                3. Latencia Estimada en Cola Wq(t) ≈ Q(t) / μ(t)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">segundos</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
            Tiempo teórico que una nueva solicitud debe aguardar antes de ser atendida según la capacidad instalada.
          </p>
        </div>

        <div className="h-60 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={visibleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.8} />
              <XAxis
                dataKey="t"
                domain={[0, config.totalDuration]}
                tickFormatter={(t) => `${t}s`}
                stroke="#64748b"
                fontSize={11}
              />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                iconType="plainline"
              />

              <Area
                type="monotone"
                dataKey="Wq"
                name="Tiempo de Espera Wq(t)"
                stroke="#9333ea"
                fill="url(#colorLatencyLight)"
                strokeWidth={2}
                isAnimationActive={false}
              />

              <defs>
                <linearGradient id="colorLatencyLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
          <span>Demora estimada: <strong className="text-purple-600 dark:text-purple-400">{currentStep.Wq.toFixed(2)}s</strong></span>
          <span className="text-slate-400 text-[10px]">Aproximación Ley de Little</span>
        </div>
      </div>

      {/* GRÁFICA 4: Recursos Activos N(t) y Escalado */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                4. Dinámica de Servidores N(t) y Retraso
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">nodos</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
            Muestra el retraso de aprovisionamiento <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">τ = {config.provisioningDelay}s</span> entre alarma y arranque.
          </p>
        </div>

        <div className="h-60 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={visibleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.8} />
              <XAxis
                dataKey="t"
                domain={[0, config.totalDuration]}
                tickFormatter={(t) => `${t}s`}
                stroke="#64748b"
                fontSize={11}
              />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, config.maxInstances + 1]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                iconType="plainline"
              />

              <Line
                type="stepAfter"
                dataKey="instances"
                name="Servidores N(t)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
          <span>Servidores activos: <strong className="text-emerald-600 dark:text-emerald-400">{currentStep.instances} instancias</strong></span>
          <span className="text-slate-500 font-mono">μ = {currentStep.instances * config.capacityPerInstance} req/s</span>
        </div>
      </div>

    </div>
  );
};

// Tooltip legible y adaptativo
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as SimulationStep;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg font-mono text-xs space-y-1 text-slate-800 dark:text-slate-200 z-50">
        <div className="text-sky-600 dark:text-sky-400 font-bold border-b border-slate-100 dark:border-slate-800 pb-1 flex justify-between">
          <span>t = {Number(label).toFixed(1)}s</span>
          <span className="text-slate-500 text-[10px] font-normal">{data.state}</span>
        </div>
        <div className="text-sky-700 dark:text-sky-300">λ Llegadas: {data.lambda} req/s</div>
        <div className="text-indigo-700 dark:text-indigo-300">μ Capacidad: {data.muNominal} req/s</div>
        <div className="text-amber-700 dark:text-amber-300">Q Cola: {data.Q} solicitudes</div>
        <div className="text-purple-700 dark:text-purple-300">Wq Espera: {data.Wq} s</div>
        <div className="text-emerald-700 dark:text-emerald-300">Servidores: {data.instances}</div>
        <div className="text-slate-500 text-[10px] pt-1 border-t border-slate-100 dark:border-slate-800">
          dQ/dt = {data.dQdt > 0 ? `+${data.dQdt}` : data.dQdt} req/s
        </div>
      </div>
    );
  }
  return null;
};
