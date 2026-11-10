import { FC, useMemo } from 'react';
import { SCENARIO_B, SCENARIO_C } from '../math/scenarios';
import { runSimulation } from '../math/eulerEngine';
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
  ReferenceLine 
} from 'recharts';
import { GitCompare, Clock, Layers, ShieldCheck, Zap, ArrowDown } from 'lucide-react';

export const ComparativeAnalysis: FC = () => {
  // Correr ambas simulaciones bajo idénticas condiciones
  const resultB = useMemo(() => runSimulation(SCENARIO_B.config), []);
  const resultC = useMemo(() => runSimulation(SCENARIO_C.config), []);

  // Fusionar series temporales para Recharts
  const comparativeData = useMemo(() => {
    const len = Math.min(resultB.steps.length, resultC.steps.length);
    const merged = [];
    for (let i = 0; i < len; i++) {
      const stepB = resultB.steps[i];
      const stepC = resultC.steps[i];
      merged.push({
        t: stepB.t,
        lambda: stepB.lambda,
        // Escenario B (Sin autoescalado)
        Q_B: stepB.Q,
        mu_B: stepB.muNominal,
        Wq_B: stepB.Wq,
        // Escenario C (Con autoescalado)
        Q_C: stepC.Q,
        mu_C: stepC.muNominal,
        Wq_C: stepC.Wq,
        instances_C: stepC.instances,
      });
    }
    return merged;
  }, [resultB, resultC]);

  // Cálculos de reducción porcentual
  const queueReduction = resultB.summary.peakQueue > 0
    ? (((resultB.summary.peakQueue - resultC.summary.peakQueue) / resultB.summary.peakQueue) * 100).toFixed(1)
    : '0';

  const latencyReduction = resultB.summary.peakLatency > 0
    ? (((resultB.summary.peakLatency - resultC.summary.peakLatency) / resultB.summary.peakLatency) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-5">
      
      {/* Banner Explicativo */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-xs uppercase tracking-wider mb-1">
              <GitCompare className="w-4 h-4" />
              <span>Experimento Comparativo Riguroso (Condiciones Ceteris Paribus)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Escenario B (Sin Autoescalado) vs Escenario C (Con Autoescalado)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Ambos sistemas reciben el <strong className="text-sky-700 dark:text-sky-400">mismo tráfico idéntico</strong>: 
              tasa base de 60 req/s, pico repentino de 240 req/s durante 40 segundos, e infraestructura base de 2 servidores (100 req/s). 
              Esta equivalencia permite a tus compañeros verificar exactamente el beneficio matemático de contar con autoescalado.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 rounded-xl font-bold">
              B: μ = 100 req/s fijo
            </span>
            <span className="px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800 rounded-xl font-bold">
              C: μ dinámico reactivo
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas de Contraste Numérico Directo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Métrica 1: Máxima Cola Acumulada */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <Layers className="w-4 h-4 text-amber-500" />
              Pico de Cola Acumulada (max Q)
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-0.5">
              <ArrowDown className="w-3 h-3" />
              -{queueReduction}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 my-2 font-mono">
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl p-2.5 text-center">
              <div className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold">Sin Escalar (B)</div>
              <div className="text-lg font-black text-rose-600 dark:text-rose-400">{Math.round(resultB.summary.peakQueue)} solic.</div>
            </div>
            <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 rounded-xl p-2.5 text-center">
              <div className="text-[10px] text-sky-700 dark:text-sky-400 font-semibold">Con Escalar (C)</div>
              <div className="text-lg font-black text-sky-600 dark:text-sky-400">{Math.round(resultC.summary.peakQueue)} solic.</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            El autoescalado frena el crecimiento de la cola tan pronto las instancias adicionales arrancan.
          </p>
        </div>

        {/* Métrica 2: Latencia de Espera Máxima */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <Clock className="w-4 h-4 text-purple-500" />
              Peor Latencia de Espera (max Wq)
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-0.5">
              <ArrowDown className="w-3 h-3" />
              -{latencyReduction}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 my-2 font-mono">
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl p-2.5 text-center">
              <div className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold">Sin Escalar (B)</div>
              <div className="text-lg font-black text-rose-600 dark:text-rose-400">{resultB.summary.peakLatency.toFixed(1)} s</div>
            </div>
            <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 rounded-xl p-2.5 text-center">
              <div className="text-[10px] text-sky-700 dark:text-sky-400 font-semibold">Con Escalar (C)</div>
              <div className="text-lg font-black text-sky-600 dark:text-sky-400">{resultC.summary.peakLatency.toFixed(1)} s</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            En B los alumnos esperan casi 1 minuto; en C la espera se reduce a valores tolerables.
          </p>
        </div>

        {/* Métrica 3: Tiempo de Recuperación de Cola */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Recuperación Post-Pico
            </span>
            <span className="text-sky-700 dark:text-sky-400 font-bold bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800">
              Acelerada
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 my-2 font-mono">
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl p-2.5 text-center">
              <div className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold">Sin Escalar (B)</div>
              <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                {resultB.summary.timeToRecover ? `${resultB.summary.timeToRecover} s` : '> 80 s'}
              </div>
            </div>
            <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 rounded-xl p-2.5 text-center">
              <div className="text-[10px] text-sky-700 dark:text-sky-400 font-semibold">Con Escalar (C)</div>
              <div className="text-lg font-black text-sky-600 dark:text-sky-400">
                {resultC.summary.timeToRecover ? `${resultC.summary.timeToRecover} s` : 'Inmediata'}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            En B la cola tarda minutos en disiparse; en C se recupera a 0 casi al instante.
          </p>
        </div>

      </div>

      {/* Gráfica Comparativa Superpuesta 1: Cola Q_B(t) vs Q_C(t) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              Superposición Directa: Solicitudes Pendientes Q(t)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Curva roja (colapso sin autoescalado) frente a la curva azul (mitigación con autoescalado).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
              <span className="w-3 h-0.5 bg-rose-500"></span> B: Sin Escalar
            </span>
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-semibold">
              <span className="w-3 h-0.5 bg-sky-500"></span> C: Con Autoescalado
            </span>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={comparativeData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.8} />
              <XAxis dataKey="t" tickFormatter={(t) => `${t}s`} stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip content={<ComparativeTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              <ReferenceLine x={SCENARIO_B.config.peakStartTime} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Inicio Pico (20s)', fill: '#d97706', fontSize: 10 }} />
              <ReferenceLine x={SCENARIO_B.config.peakStartTime + SCENARIO_B.config.peakDuration} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Fin Pico (60s)', fill: '#d97706', fontSize: 10 }} />

              {/* Curva Escenario B */}
              <Area
                type="monotone"
                dataKey="Q_B"
                name="Cola B (Sin Autoescalado)"
                stroke="#e11d48"
                fill="#f43f5e"
                fillOpacity={0.2}
                strokeWidth={2.5}
              />

              {/* Curva Escenario C */}
              <Area
                type="monotone"
                dataKey="Q_C"
                name="Cola C (Con Autoescalado)"
                stroke="#0284c7"
                fill="#38bdf8"
                fillOpacity={0.35}
                strokeWidth={2.5}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfica Comparativa Superpuesta 2: Capacidad μ_B(t) vs μ_C(t) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              Adaptación de la Capacidad μ(t) frente a la Demanda λ(t)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              En C la capacidad se adapta escalonadamente tras el retraso de aprovisionamiento hasta superar la demanda.
            </p>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={comparativeData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.8} />
              <XAxis dataKey="t" tickFormatter={(t) => `${t}s`} stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip content={<ComparativeTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              <Line
                type="monotone"
                dataKey="lambda"
                name="Demanda Común λ(t)"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />

              <Line
                type="stepAfter"
                dataKey="mu_B"
                name="Capacidad B (Estática: 100 req/s)"
                stroke="#e11d48"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="stepAfter"
                dataKey="mu_C"
                name="Capacidad C (Autoescalada dinámica)"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

const ComparativeTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg font-mono text-xs space-y-1.5 text-slate-800 dark:text-slate-200 z-50">
        <div className="text-slate-900 dark:text-white font-bold border-b border-slate-100 dark:border-slate-800 pb-1 flex justify-between">
          <span>Tiempo: {Number(label).toFixed(1)}s</span>
          <span className="text-slate-500 text-[10px]">λ = {data.lambda} req/s</span>
        </div>
        <div className="text-rose-600 dark:text-rose-400 font-semibold">
          Escenario B (Sin Escalar):
          <div className="pl-2 text-[11px] text-slate-600 dark:text-slate-300 font-normal">
            Cola: {Math.round(data.Q_B)} solic. | Espera: {data.Wq_B?.toFixed(1)}s | Cap: {data.mu_B} req/s
          </div>
        </div>
        <div className="text-sky-600 dark:text-sky-400 font-semibold">
          Escenario C (Con Autoescalado):
          <div className="pl-2 text-[11px] text-slate-600 dark:text-slate-300 font-normal">
            Cola: {Math.round(data.Q_C)} solic. | Espera: {data.Wq_C?.toFixed(1)}s | Cap: {data.mu_C} req/s
          </div>
        </div>
        <div className="text-emerald-600 dark:text-emerald-400 font-bold pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          Diferencia evitada: {Math.max(0, Math.round(data.Q_B - data.Q_C))} solicitudes
        </div>
      </div>
    );
  }
  return null;
};
