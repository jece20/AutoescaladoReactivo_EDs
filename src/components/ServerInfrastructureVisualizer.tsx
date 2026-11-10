import { FC } from 'react';
import { Server, Activity, HardDrive, AlertCircle } from 'lucide-react';
import { SimulationStep } from '../math/types';

interface ServerInfrastructureVisualizerProps {
  currentStep: SimulationStep;
  maxInstances: number;
  capacityPerInstance: number;
}

export const ServerInfrastructureVisualizer: FC<ServerInfrastructureVisualizerProps> = ({
  currentStep,
  maxInstances,
  capacityPerInstance,
}) => {
  const activeCount = currentStep.instances;
  const isProvisioning = currentStep.state === 'PROVISIONING';
  const nodes = Array.from({ length: maxInstances }, (_, idx) => idx + 1);

  // Utilización de cada servidor
  const clusterLoadPercent = currentStep.muNominal > 0
    ? Math.min(100, (currentStep.lambda / currentStep.muNominal) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
            Topología del Cluster de Servidores (Simulación de Infraestructura)
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Activo ({activeCount})</span>
          </div>
          {isProvisioning && (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-cyan-400 animate-pulse font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-cyan-400 animate-ping"></span>
              <span>Arrancando Nodos...</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-600">
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span>Apagado ({maxInstances - activeCount})</span>
          </div>
        </div>
      </div>

      {/* Cluster Nodes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 mt-3.5">
        {nodes.map((nodeId) => {
          const isActive = nodeId <= activeCount;
          const isBeingProvisioned = isProvisioning && nodeId > activeCount && nodeId <= activeCount + 2;

          return (
            <div
              key={nodeId}
              className={`relative rounded-xl p-2.5 border transition-all duration-300 flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-50 dark:bg-slate-950/90 border-sky-300 dark:border-cyan-500/40 shadow-sm'
                  : isBeingProvisioned
                  ? 'bg-amber-50 dark:bg-cyan-950/20 border-amber-400 dark:border-cyan-500/60 border-dashed animate-pulse'
                  : 'bg-slate-100/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800/50 opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">SRV-0{nodeId}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isActive
                      ? 'bg-emerald-500 shadow-sm'
                      : isBeingProvisioned
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                />
              </div>

              <div className="my-1.5 flex items-center justify-center">
                <HardDrive
                  className={`w-5 h-5 ${
                    isActive
                      ? 'text-sky-600 dark:text-cyan-400'
                      : isBeingProvisioned
                      ? 'text-amber-500 animate-bounce'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              </div>

              <div className="text-[10px] text-center font-mono">
                {isActive ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">+{capacityPerInstance} req/s</span>
                ) : isBeingProvisioned ? (
                  <span className="text-amber-600 dark:text-cyan-400 font-bold">Booting...</span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-600">Inactivo</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Queue Buffer and Load Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        
        {/* Carga del Cluster */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Utilización de Capacidad:
            </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {clusterLoadPercent.toFixed(0)}%
              <span className="text-slate-400 text-[10px] ml-1">
                ({currentStep.lambda.toFixed(0)} / {currentStep.muNominal.toFixed(0)} req/s)
              </span>
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                clusterLoadPercent > 100
                  ? 'bg-rose-500 shadow-md shadow-rose-500/50'
                  : clusterLoadPercent > 80
                  ? 'bg-amber-400 shadow-md shadow-amber-400/50'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600'
              }`}
              style={{ width: `${Math.min(100, clusterLoadPercent)}%` }}
            />
          </div>
        </div>

        {/* Acumulación de Cola */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Buffer de Cola Q(t):
            </span>
            <span className={`font-mono font-bold ${currentStep.Q > 50 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
              {Math.round(currentStep.Q)} solicitudes en espera
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                currentStep.Q > 200
                  ? 'bg-rose-600'
                  : currentStep.Q > 50
                  ? 'bg-amber-500'
                  : currentStep.Q > 0
                  ? 'bg-yellow-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (currentStep.Q / 300) * 100)}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
