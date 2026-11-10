import { FC } from 'react';
import { X, Server, AlertCircle, Clock, Zap, ShieldCheck } from 'lucide-react';

interface EnrollmentScenarioExplainerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnrollmentScenarioExplainer: FC<EnrollmentScenarioExplainerProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Caso Real de Estudio: Inscripciones Universitarias</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Problemática práctica de Ingeniería de Sistemas modelada mediante Ecuaciones Diferenciales
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong>Contexto del problema:</strong> Al inicio de cada semestre, las universidades abren el portal de matrícula a las 8:00 AM en punto. Miles de estudiantes hacen clic simultáneamente para asegurar sus materias preferidas, generando un incremento explosivo del tráfico web.
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              ¿Qué ocurre en la infraestructura tecnológica?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl space-y-1">
                <div className="text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  1. Avalancha (λ &gt; μ)
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  La tasa de peticiones duplica o triplica la capacidad de despacho del servidor inicial.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl space-y-1">
                <div className="text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  2. Cola y Latencia
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Las solicitudes se acumulan en el buffer. El tiempo de espera <span className="font-mono font-semibold">Wq ≈ Q/μ</span> se dispara a decenas de segundos.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl space-y-1">
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  3. Autoescalado Reactivo
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tras un retardo de arranque de 15 a 30s, nuevas máquinas virtuales entran a operar y desahogan la cola.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              ¿Por qué es necesario el periodo de enfriamiento (Cooldown)?
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              Cuando el pico de solicitudes termina, la demanda baja inmediatamente. Si el sistema apagase de golpe los servidores extras, una nueva ráfaga secundaria volvería a colapsar el sistema (problema conocido como <em>flapping</em> u oscilación de recursos). El cooldown mantiene la capacidad activa durante una ventana prudencial antes de desescalar.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
            <strong>Nota metodológica:</strong> Esta simulación no utiliza servidores reales de una universidad específica ni credenciales comerciales de AWS. Se trata de un modelo matemático continuo calibrado para la enseñanza de las ecuaciones diferenciales en la carrera de Ingeniería de Sistemas.
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition-all"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
