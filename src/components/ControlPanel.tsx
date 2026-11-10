import { FC } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Sliders, 
  Zap, 
  Clock, 
  Server, 
  AlertCircle,
  SkipForward
} from 'lucide-react';
import { SimulationConfig } from '../math/types';

interface ControlPanelProps {
  config: SimulationConfig;
  onUpdateConfig: (newConfig: SimulationConfig) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onJumpToEnd: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  currentTime: number;
}

export const ControlPanel: FC<ControlPanelProps> = ({
  config,
  onUpdateConfig,
  isPlaying,
  onTogglePlay,
  onReset,
  onStepForward,
  onJumpToEnd,
  playbackSpeed,
  onChangeSpeed,
  currentTime,
}) => {
  const handleChange = (field: keyof SimulationConfig, value: number | boolean) => {
    onUpdateConfig({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      
      {/* Simulation Playback & Speed Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        
        {/* Main Transport Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Iniciar Simulación</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onStepForward}
            disabled={isPlaying}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Avanzar 1 segundo (paso a paso)"
          >
            <SkipForward className="w-4 h-4" />
            <span>+1s</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Reiniciar simulación a t = 0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar</span>
          </button>

          <button
            type="button"
            onClick={onJumpToEnd}
            className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-slate-700 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
            title="Calcular simulación completa instantáneamente"
          >
            <FastForward className="w-4 h-4" />
            <span>Calcular Todo</span>
          </button>
        </div>

        {/* Speed Controls & Timer Display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs">
            <span className="text-slate-500 px-2 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              Velocidad:
            </span>
            {[0.5, 1, 2, 5].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => onChangeSpeed(speed)}
                className={`px-2 py-1 rounded-lg font-mono font-bold transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl font-mono text-xs shadow-inner">
            <span className="text-slate-500">t = </span>
            <span className="text-sky-700 dark:text-sky-400 font-black text-sm">{currentTime.toFixed(1)}s</span>
            <span className="text-slate-400"> / {config.totalDuration}s</span>
          </div>
        </div>

      </div>

      {/* Sliders & Numeric Configs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        
        {/* SECCIÓN 1: Tráfico Entrante λ(t) */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-sky-800 dark:text-sky-300 pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              1. Tráfico Entrante λ(t)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">solicitudes/seg</span>
          </div>

          {/* Tasa Base */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-400">Tasa Base (λ_base):</span>
              <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{config.baseArrivalRate} req/s</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={config.baseArrivalRate}
              onChange={(e) => handleChange('baseArrivalRate', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          {/* Tasa Pico */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-400">Tasa Pico (λ_pico):</span>
              <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{config.peakArrivalRate} req/s</span>
            </div>
            <input
              type="range"
              min="100"
              max="500"
              step="10"
              value={config.peakArrivalRate}
              onChange={(e) => handleChange('peakArrivalRate', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* Inicio del Pico & Duración */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Inicio Pico (s)</label>
              <input
                type="number"
                min="5"
                max={config.totalDuration - 20}
                value={config.peakStartTime}
                onChange={(e) => handleChange('peakStartTime', Math.max(0, Number(e.target.value)))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Duración Pico (s)</label>
              <input
                type="number"
                min="10"
                max="80"
                value={config.peakDuration}
                onChange={(e) => handleChange('peakDuration', Math.max(5, Number(e.target.value)))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Capacidad Base e Infraestructura μ(t) */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-blue-800 dark:text-blue-300 pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              2. Capacidad Base μ₀
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Total: {config.initialInstances * config.capacityPerInstance} req/s
            </span>
          </div>

          {/* Servidores Iniciales */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-400">Instancias Base (N₀):</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{config.initialInstances} servidores</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={config.initialInstances}
              onChange={(e) => handleChange('initialInstances', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Capacidad por Servidor */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-400">Capacidad por Nodo (μ_nodo):</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{config.capacityPerInstance} req/s</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={config.capacityPerInstance}
              onChange={(e) => handleChange('capacityPerInstance', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Límite Máximo de Nodos */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-400">Tope Máximo Instancias (N_max):</span>
              <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{config.maxInstances} nodos</span>
            </div>
            <input
              type="range"
              min="4"
              max="12"
              step="1"
              value={config.maxInstances}
              onChange={(e) => handleChange('maxInstances', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>
        </div>

        {/* SECCIÓN 3: Política de Autoescalado Reactivo */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              3. Autoescalado Reactivo
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <span className="text-[10px] text-slate-500 font-semibold">Activo:</span>
              <input
                type="checkbox"
                checked={config.autoscalingEnabled}
                onChange={(e) => handleChange('autoscalingEnabled', e.target.checked)}
                className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Retraso de Aprovisionamiento */}
          <div className={!config.autoscalingEnabled ? 'opacity-40 pointer-events-none' : ''}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-400">Retraso Arranque (τ_delay):</span>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{config.provisioningDelay} seg</span>
            </div>
            <input
              type="range"
              min="5"
              max="35"
              step="1"
              value={config.provisioningDelay}
              onChange={(e) => handleChange('provisioningDelay', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Umbral de Cola de Activación */}
          <div className={!config.autoscalingEnabled ? 'opacity-40 pointer-events-none' : ''}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-400">Umbral Alarma Cola (Q_th):</span>
              <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{config.scaleUpThresholdQueue} solic.</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={config.scaleUpThresholdQueue}
              onChange={(e) => handleChange('scaleUpThresholdQueue', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          {/* Instancias agregadas por escala & Cooldown */}
          <div className={`grid grid-cols-2 gap-2 pt-1 ${!config.autoscalingEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Nodos/Escala (+ΔN)</label>
              <input
                type="number"
                min="1"
                max="4"
                value={config.instancesPerScale}
                onChange={(e) => handleChange('instancesPerScale', Math.max(1, Number(e.target.value)))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Cooldown (s)</label>
              <input
                type="number"
                min="5"
                max="40"
                value={config.cooldownPeriod}
                onChange={(e) => handleChange('cooldownPeriod', Math.max(5, Number(e.target.value)))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Discretization parameters info */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-600 dark:text-slate-400 font-semibold">Integración de Euler:</span>
          <span className="font-mono text-sky-700 dark:text-sky-400 font-bold">Δt = {config.dt}s</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-mono text-slate-600 dark:text-slate-400">Total Pasos:</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">{Math.floor(config.totalDuration / config.dt)} iteraciones</span>
        </div>
        <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1 sm:mt-0 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Parámetros pedagógicos configurables para modelar el fenómeno</span>
        </div>
      </div>

    </div>
  );
};
