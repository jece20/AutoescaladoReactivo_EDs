import { FC } from 'react';
import { MathView } from './MathView';
import { X, BookOpen, Calculator, Clock } from 'lucide-react';

interface MathematicalFoundationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MathematicalFoundation: FC<MathematicalFoundationProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Fundamentación Matemática y Académica</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Modelo de Ecuaciones Diferenciales Ordinarias (EDO) aplicado al Análisis de Carga en Servicios Web
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

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          
          {/* 1. ¿Por qué una Ecuación Diferencial? */}
          <section className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
            <h3 className="text-base font-bold text-sky-700 dark:text-sky-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-950 border border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 text-xs flex items-center justify-center font-mono font-bold">1</span>
              ¿Por qué se utiliza una Ecuación Diferencial en este problema?
            </h3>
            <p>
              En la ingeniería de sistemas, cuando miles de usuarios interactúan con una API o plataforma web simultáneamente, 
              el flujo de peticiones puede aproximarse como un <strong className="text-slate-900 dark:text-white">modelo continuo de fluidos</strong>. 
              En lugar de analizar cada paquete de forma aislada, se analizan las <strong className="text-slate-900 dark:text-white">tasas de flujo por unidad de tiempo</strong>.
            </p>
            <p>
              Una ecuación diferencial ordinaria (EDO) permite describir cómo evoluciona en el tiempo una cantidad acumulada 
              a partir del balance instantáneo entre lo que entra y lo que sale del sistema.
            </p>
          </section>

          {/* 2. La Ecuación Diferencial Principal */}
          <section className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-base font-bold text-sky-700 dark:text-sky-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-950 border border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 text-xs flex items-center justify-center font-mono font-bold">2</span>
              Ecuación Diferencial Principal y Definición de Variables
            </h3>

            <div className="bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 rounded-xl p-4 text-center shadow-sm">
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-1 font-mono font-semibold">Ecuación de Balance de Cola</div>
              <MathView math="\frac{dQ(t)}{dt} = \lambda(t) - \mu(t)" block className="text-xl sm:text-2xl text-sky-700 dark:text-sky-300 font-bold" />
              <div className="text-xs text-slate-500 mt-2 font-mono">
                Sujeta a la condición de frontera física: <MathView math="Q(t) \ge 0 \quad \forall t" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                <div className="font-bold text-amber-600 dark:text-amber-400">
                  <MathView math="Q(t)" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  Cantidad de solicitudes pendientes de procesamiento en el instante <MathView math="t" /> (longitud de la cola en el buffer del servidor). Unidades: <em className="text-slate-700 dark:text-slate-300">solicitudes</em>.
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                <div className="font-bold text-sky-600 dark:text-sky-400">
                  <MathView math="\lambda(t)" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  Tasa de llegada de solicitudes de los usuarios en el tiempo <MathView math="t" />. Unidades: <em className="text-slate-700 dark:text-slate-300">solicitudes / segundo</em>.
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                <div className="font-bold text-indigo-600 dark:text-indigo-400">
                  <MathView math="\mu(t)" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  Capacidad de procesamiento efectiva total de los servidores activos en el instante <MathView math="t" />. Unidades: <em className="text-slate-700 dark:text-slate-300">solicitudes / segundo</em>.
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                <div className="font-bold text-emerald-600 dark:text-emerald-400">
                  <MathView math="\frac{dQ(t)}{dt}" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  Derivada temporal: tasa instantánea de acumulación o desahogo de solicitudes pendientes. Unidades: <em className="text-slate-700 dark:text-slate-300">solicitudes / segundo</em>.
                </span>
              </div>
            </div>
          </section>

          {/* 3. Interpretación de la Derivada */}
          <section className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2.5">
            <h3 className="text-base font-bold text-sky-700 dark:text-sky-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-950 border border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 text-xs flex items-center justify-center font-mono font-bold">3</span>
              Interpretación Física de la Derivada en Sistemas Web
            </h3>

            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                <div className="p-1.5 bg-rose-100 dark:bg-rose-950 rounded-lg text-rose-700 dark:text-rose-400 font-mono text-xs font-bold whitespace-nowrap">
                  λ(t) &gt; μ(t)
                </div>
                <div>
                  <div className="font-bold text-rose-800 dark:text-rose-300 text-xs">
                    <MathView math="\frac{dQ}{dt} > 0" /> — Régimen de Sobrecarga y Acumulación
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Llegan más peticiones de las que el cluster puede procesar. La cola <MathView math="Q(t)" /> crece continuamente, 
                    los buffers se saturan y la latencia se incrementa proporcionalmente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950 rounded-lg text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold whitespace-nowrap">
                  λ(t) &lt; μ(t)
                </div>
                <div>
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                    <MathView math="\frac{dQ}{dt} < 0" /> — Régimen de Desahogo y Recuperación
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    La capacidad instalada excede la llegada de peticiones. Si existe cola acumulada previa, 
                    ésta disminuye a una tasa <MathView math="|\lambda - \mu|" /> hasta alcanzar cero. Al llegar a cero, 
                    se mantiene en cero (no existen colas negativas).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-950 rounded-lg text-blue-700 dark:text-blue-400 font-mono text-xs font-bold whitespace-nowrap">
                  λ(t) = μ(t)
                </div>
                <div>
                  <div className="font-bold text-blue-800 dark:text-blue-300 text-xs">
                    <MathView math="\frac{dQ}{dt} = 0" /> — Estado Estacionario / Equilibrio Dinámico
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    La tasa de llegada es idéntica a la capacidad de procesamiento. La cola permanece constante.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Ejemplo Numérico Desarrollado Paso a Paso */}
          <section className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-base font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Ejemplo Numérico Desarrollado Paso a Paso (Requisito Académico)
            </h3>

            <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 rounded-xl p-4 space-y-2.5 text-xs shadow-sm">
              <p className="text-slate-700 dark:text-slate-200">
                <strong>Enunciado:</strong> Una plataforma web universitaria recibe repentinamente{' '}
                <span className="font-mono text-sky-700 dark:text-sky-400 font-bold">150 solicitudes por segundo</span> durante la matrícula, 
                mientras que su infraestructura instalada solo procesa{' '}
                <span className="font-mono text-indigo-700 dark:text-indigo-400 font-bold">100 solicitudes por segundo</span>. 
                Inicialmente no hay solicitudes acumuladas (<MathView math="Q(0) = 0" />).
              </p>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-2 space-y-2 font-mono">
                <div className="text-slate-500">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Paso 1:</span> Planteamiento de la EDO:
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center text-sm">
                  <MathView math="\frac{dQ(t)}{dt} = \lambda(t) - \mu(t) = 150 - 100 = 50 \text{ solicitudes/segundo}" />
                </div>

                <div className="text-slate-500 pt-1">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Paso 2:</span> Integración temporal durante <MathView math="\Delta t = 10\text{ s}" />:
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center text-sm">
                  <MathView math="Q(10) = Q(0) + \int_{0}^{10} 50 \, dt = 0 + (50) \cdot (10) = 500 \text{ solicitudes}" />
                </div>

                <div className="text-slate-500 pt-1">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Paso 3:</span> Estimación de tiempo de espera en cola:
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center text-sm">
                  <MathView math="W_q(10) \approx \frac{Q(10)}{\mu} = \frac{500 \text{ solicitudes}}{100 \text{ solicitudes/s}} = 5.0 \text{ segundos}" />
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-slate-950/80 border-l-4 border-amber-500 p-3 rounded-r-lg text-slate-700 dark:text-slate-300 text-xs">
                <strong>Significado para la plataforma:</strong> En tan solo 10 segundos de sobrecarga, se forma una cola de 500 solicitudes. 
                Cualquier alumno nuevo esperará al menos 5 segundos antes de que su formulario sea atendido. Sin autoescalado, la cola colapsa el servicio.
              </div>
            </div>
          </section>

          {/* 5. Latencia y Limitaciones */}
          <section className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
            <h3 className="text-base font-bold text-purple-700 dark:text-purple-400 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Relación con la Latencia y Limitaciones del Modelo
            </h3>
            <p>
              La aproximación de Little <MathView math="W_q(t) \approx \frac{Q(t)}{\mu(t)}" /> estima el tiempo de espera en cola.
              No representa una medición de extremo a extremo, ya que en la realidad influyen el viaje de red (RTT), 
              los tiempos de renderizado y los cuellos de botella en la base de datos relacional.
            </p>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Volver al Simulador
          </button>
        </div>

      </div>
    </div>
  );
};
