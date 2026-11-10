import { FC } from 'react';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Clock, 
  Cpu, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Server
} from 'lucide-react';
import { SimulationStep, SimulationSummary } from '../math/types';

interface KpiDashboardProps {
  currentStep: SimulationStep;
  summary: SimulationSummary;
  autoscalingEnabled: boolean;
}

export const KpiDashboard: FC<KpiDashboardProps> = ({
  currentStep,
  summary,
  autoscalingEnabled,
}) => {
  // Estado visual del autoescalador
  const getStateBadge = () => {
    if (!autoscalingEnabled) {
      return {
        label: 'Autoescalado Inactivo',
        color: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
        icon: Minus,
      };
    }
    switch (currentStep.state) {
      case 'NORMAL':
        return {
          label: 'Normal / Estable',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-800',
          icon: CheckCircle2,
        };
      case 'DETECTING':
        return {
          label: 'Detectando Sobrecarga',
          color: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-800 animate-pulse',
          icon: AlertTriangle,
        };
      case 'PROVISIONING':
        return {
          label: 'Aprovisionando Recursos',
          color: 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-cyan-950/80 dark:text-cyan-400 dark:border-cyan-700 animate-pulse',
          icon: RefreshCw,
        };
      case 'STABILIZED':
        return {
          label: 'Capacidad Ampliada',
          color: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-400 dark:border-blue-800',
          icon: CheckCircle2,
        };
      case 'COOLING_DOWN':
        return {
          label: 'Enfriamiento (Cooldown)',
          color: 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-400 dark:border-purple-800',
          icon: Clock,
        };
      default:
        return {
          label: 'Inactivo',
          color: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
          icon: Minus,
        };
    }
  };

  const stateInfo = getStateBadge();
  const StateIcon = stateInfo.icon;

  // Indicador de tendencia de la derivada dQ/dt
  const isGrowing = currentStep.dQdt > 0.05 && currentStep.Q >= 0;
  const isDraining = currentStep.dQdt < -0.05 && currentStep.Q > 0;
  const isZeroOrEquilibrium = !isGrowing && !isDraining;

  return (
    <div className="space-y-3">
      {/* Dynamic Status Notification Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${stateInfo.color}`}>
            <StateIcon className="w-4 h-4" />
            <span>{stateInfo.label}</span>
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            <span className="text-slate-400 mr-1.5 font-mono">[{currentStep.t.toFixed(1)}s]</span>
            {currentStep.stateDescription}
          </div>
        </div>

        {/* Instant Mathematical Derivative Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs">
          <span className="text-slate-500">dQ/dt = λ - μ =</span>
          <span
            className={`font-bold flex items-center gap-1 ${
              isGrowing ? 'text-rose-600 dark:text-rose-400' : isDraining ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {isGrowing && <TrendingUp className="w-3.5 h-3.5" />}
            {isDraining && <TrendingDown className="w-3.5 h-3.5" />}
            {isZeroOrEquilibrium && <Minus className="w-3.5 h-3.5" />}
            {currentStep.dQdt > 0 ? `+${currentStep.dQdt.toFixed(1)}` : currentStep.dQdt.toFixed(1)} req/s
          </span>
          <span className="text-slate-400 text-[10px]">
            {isGrowing ? '(Cola Creciendo)' : isDraining ? '(Cola Desahogando)' : '(Estable)'}
          </span>
        </div>
      </div>

      {/* Primary KPI Grid (8 Key Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        
        {/* 1. Solicitudes Entrantes λ(t) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between hover:border-sky-400 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Llegadas λ(t)</span>
            <ArrowDownCircle className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              {currentStep.lambda.toFixed(0)}
              <span className="text-xs font-normal text-slate-500 ml-1">req/s</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Demanda instantánea</div>
          </div>
        </div>

        {/* 2. Capacidad de Procesamiento μ(t) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between hover:border-blue-400 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Capacidad μ(t)</span>
            <Cpu className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              {currentStep.muNominal.toFixed(0)}
              <span className="text-xs font-normal text-slate-500 ml-1">req/s</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Techo de servicio</div>
          </div>
        </div>

        {/* 3. Solicitudes Procesadas Efectivas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between hover:border-emerald-400 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Procesadas</span>
            <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {currentStep.muEffective.toFixed(0)}
              <span className="text-xs font-normal text-slate-500 ml-1">req/s</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Rendimiento real</div>
          </div>
        </div>

        {/* 4. Solicitudes Pendientes Q(t) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between hover:border-amber-400 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Cola Q(t)</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-1">
            <div className={`text-xl sm:text-2xl font-black font-mono ${
              currentStep.Q > 50 ? 'text-rose-600 dark:text-rose-400' : currentStep.Q > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'
            }`}>
              {Math.round(currentStep.Q)}
              <span className="text-xs font-normal text-slate-500 ml-1">solic.</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">En espera en buffer</div>
          </div>
        </div>

        {/* 5. Máxima Cola Alcanzada (Pico) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between hover:border-rose-400 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Pico Máx Q</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
              {Math.round(summary.peakQueue)}
              <span className="text-xs font-normal text-slate-500 ml-1">solic.</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Peor acumulación</div>
          </div>
        </div>

        {/* 6. Latencia Estimada Wq(t) ≈ Q/μ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between hover:border-purple-400 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Espera Wq</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-1">
            <div className={`text-xl sm:text-2xl font-black font-mono ${
              currentStep.Wq > 10 ? 'text-rose-600 dark:text-rose-400' : currentStep.Wq > 1 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {currentStep.Wq.toFixed(1)}
              <span className="text-xs font-normal text-slate-500 ml-1">seg</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Est. tiempo en cola</div>
          </div>
        </div>

        {/* 7. Instancias Activas N(t) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between hover:border-sky-400 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Servidores N</span>
            <Server className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-black font-mono text-sky-600 dark:text-sky-400">
              {currentStep.instances}
              <span className="text-xs font-normal text-slate-500 ml-1">nodos</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Cluster en ejecución</div>
          </div>
        </div>

        {/* 8. Tiempo de Recuperación de Cola */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between hover:border-emerald-400 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Recuperación</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              {summary.timeToRecover !== null ? (
                <span>
                  {summary.timeToRecover}
                  <span className="text-xs font-normal text-slate-500 ml-1">seg</span>
                </span>
              ) : (
                <span className="text-amber-500 text-sm font-sans font-medium">En curso...</span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Post-fin de pico</div>
          </div>
        </div>

      </div>
    </div>
  );
};
