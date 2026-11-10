import { FC } from 'react';
import { Activity, BookOpen, GitCompare, Info, Server, Sun, Moon, LayoutDashboard, Presentation } from 'lucide-react';

interface HeaderProps {
  currentScenarioId: 'A' | 'B' | 'C' | 'COMPARE';
  onSelectScenario: (id: 'A' | 'B' | 'C' | 'COMPARE') => void;
  onOpenMathDocs: () => void;
  onOpenAcademicContext: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  presentationMode: boolean;
  onTogglePresentationMode: () => void;
}

export const Header: FC<HeaderProps> = ({
  currentScenarioId,
  onSelectScenario,
  onOpenMathDocs,
  onOpenAcademicContext,
  isDarkMode,
  onToggleTheme,
  presentationMode,
  onTogglePresentationMode,
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Logo & Academic Information */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 rounded-xl text-sky-600 dark:text-sky-400 shadow-sm">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  Simulador de Tráfico y Autoescalado
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    EDO dQ/dt = λ - μ
                  </span>
                </h1>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Método de Euler
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Asignatura:</span> Ecuaciones Diferenciales
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Programa:</span> Ingeniería de Sistemas
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                  <Server className="w-3 h-3 inline" /> Caso: Inscripciones Universitarias
                </span>
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            
            {/* View Mode Toggle Button (Presentation vs Technical) */}
            <button
              type="button"
              onClick={onTogglePresentationMode}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 shadow-sm ${
                presentationMode
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
              title="Alternar entre vista visual para exponer y vista técnica detallada"
            >
              {presentationMode ? (
                <>
                  <Presentation className="w-3.5 h-3.5" />
                  <span>Modo Exposición</span>
                </>
              ) : (
                <>
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Modo Técnico</span>
                </>
              )}
            </button>

            {/* Scenario Quick Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onSelectScenario('A')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                  currentScenarioId === 'A'
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Demanda normal: λ < μ siempre"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Escenario A
              </button>

              <button
                type="button"
                onClick={() => onSelectScenario('B')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                  currentScenarioId === 'B'
                    ? 'bg-rose-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Pico de tráfico sin autoescalado (sobrecarga)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                Escenario B
              </button>

              <button
                type="button"
                onClick={() => onSelectScenario('C')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                  currentScenarioId === 'C'
                    ? 'bg-sky-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Pico con autoescalado reactivo"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                Escenario C
              </button>

              <button
                type="button"
                onClick={() => onSelectScenario('COMPARE')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  currentScenarioId === 'COMPARE'
                    ? 'bg-purple-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Comparación directa B vs C"
              >
                <GitCompare className="w-3.5 h-3.5" />
                Comparar B vs C
              </button>
            </div>

            {/* Modal Buttons */}
            <button
              type="button"
              onClick={onOpenMathDocs}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-sm"
              title="Ver fórmulas matemáticas y ejemplo numérico"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Ecuación dQ/dt</span>
            </button>

            <button
              type="button"
              onClick={onOpenAcademicContext}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-all"
              title="Detalles sobre el caso de estudio de inscripciones"
            >
              <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Caso Universitario</span>
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
              title={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
