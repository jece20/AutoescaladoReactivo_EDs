import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Cog,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Server,
  SlidersHorizontal,
  Users,
  Waves,
  Zap,
} from 'lucide-react';
import { DEFAULT_SCENARIOS } from '../math/scenarios';
import { runSimulation } from '../math/eulerEngine';
import { SimulationConfig, SimulationStep } from '../math/types';

type ScenarioId = 'A' | 'B' | 'C';

const scenarioCopy: Record<ScenarioId, { title: string; description: string; accent: string }> = {
  A: {
    title: 'Tráfico normal',
    description: 'La capacidad alcanza para atender las solicitudes.',
    accent: 'mint',
  },
  B: {
    title: 'Pico sin escalado',
    description: 'La demanda sube, pero los servidores no cambian.',
    accent: 'coral',
  },
  C: {
    title: 'Pico con autoescalado',
    description: 'Se agregan servidores y la cola empieza a bajar.',
    accent: 'blue',
  },
};

const formatRate = (value: number) => Math.round(value).toLocaleString('es');
const formatRequests = (value: number) => {
  const rounded = Math.round(value);
  return Math.abs(value - rounded) < 0.05 ? rounded.toLocaleString('es') : value.toFixed(1);
};

interface QueueLedger {
  arrived: number;
  served: number;
  before: number;
  after: number;
  duration: number;
}

function FlowIllustration({
  step,
  config,
  isPlaying,
  ledger,
}: {
  step: SimulationStep;
  config: SimulationConfig;
  isPlaying: boolean;
  ledger: QueueLedger;
}) {
  const queuePercent = Math.min(92, (step.Q / 320) * 92);
  const isOverloaded = step.lambda > step.muNominal;
  const isDraining = step.dQdt < 0 && step.Q > 0;
  const isProvisioning = step.state === 'PROVISIONING';
  const visibleRequests = Math.min(24, Math.ceil(step.Q / 110));
  const incomingPackets = Math.min(9, Math.max(2, Math.ceil(step.lambda / 35)));
  const servicePackets = Math.min(8, Math.max(2, Math.ceil(step.muEffective / 55)));

  return (
    <div className={`flow-scene ${isPlaying ? 'flow-scene-playing' : ''}`} aria-label="Visualización del flujo de solicitudes">
      <svg viewBox="0 0 1000 360" role="img" aria-labelledby="flow-title flow-description">
        <title id="flow-title">De las solicitudes a los servidores</title>
        <desc id="flow-description">
          El flujo representa las solicitudes entrantes, la cola de espera y la capacidad de los servidores.
          La cola crece cuando llegan más solicitudes de las que se pueden atender.
        </desc>
        <defs>
          <linearGradient id="scene-background" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#102038" />
            <stop offset="100%" stopColor="#142b43" />
          </linearGradient>
          <linearGradient id="water-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={isOverloaded ? '#fb7185' : isDraining ? '#5eead4' : '#38bdf8'} />
            <stop offset="100%" stopColor={isOverloaded ? '#e11d48' : isDraining ? '#0f9f93' : '#2563eb'} />
          </linearGradient>
          <linearGradient id="server-front" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#294765" />
            <stop offset="100%" stopColor="#18324d" />
          </linearGradient>
          <linearGradient id="tank-front" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#34536f" stopOpacity=".96" />
            <stop offset="46%" stopColor="#142d47" stopOpacity=".74" />
            <stop offset="100%" stopColor="#426581" stopOpacity=".9" />
          </linearGradient>
          <linearGradient id="pipe-highlight" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#c6edf5" stopOpacity=".6" />
            <stop offset="50%" stopColor="#a1d9e8" stopOpacity=".13" />
            <stop offset="100%" stopColor="#091c30" stopOpacity=".45" />
          </linearGradient>
          <pattern id="scene-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#a9c5e0" strokeOpacity=".07" strokeWidth="1" />
          </pattern>
          <clipPath id="tank-clip">
            <path d="M337 145 L485 145 L485 264 L337 264 Z" />
          </clipPath>
        </defs>

        <rect width="1000" height="360" rx="22" fill="url(#scene-background)" />
        <rect width="1000" height="360" rx="22" fill="url(#scene-grid)" />
        <ellipse cx="506" cy="310" rx="420" ry="25" fill="#061321" opacity=".34" />

        <g className="scene-label">
          <text x="76" y="61">USUARIOS</text>
          <text x="340" y="61">COLA DE ESPERA</text>
          <text x="699" y="61">SERVIDORES</text>
        </g>

        <g transform="translate(82 133)" fill="none" stroke="#b6cee4" strokeWidth="3">
          <circle cx="23" cy="18" r="13" fill="#294763" />
          <path d="M3 73c2-20 11-30 20-30s18 10 20 30" fill="#294763" />
          <circle cx="66" cy="22" r="10" fill="#203d59" />
          <path d="M51 71c1-16 7-25 15-25s14 9 15 25" fill="#203d59" strokeWidth="2.5" />
          <circle cx="100" cy="26" r="8" fill="#203d59" />
          <path d="M88 70c1-13 5-20 12-20s11 7 12 20" fill="#203d59" strokeWidth="2" />
        </g>

        <g aria-hidden="true">
          <path d="M133 226 H214 V178 H270 V205 H337" fill="none" stroke="#476781" strokeWidth="24" strokeLinejoin="round" />
          <path d="M133 226 H214 V178 H270 V205 H337" fill="none" stroke="url(#pipe-highlight)" strokeWidth="18" strokeLinejoin="round" />
          <path d="M133 226 H214 V178 H270 V205 H337" fill="none" stroke="#55c8ec" strokeOpacity=".9" strokeWidth="8" strokeLinejoin="round" />
          <path d="M133 226 H214 V178 H270 V205 H337" fill="none" stroke="#e1fbff" strokeOpacity=".48" strokeWidth="2" strokeLinejoin="round" />
          <path d="M223 167v22m-10-11h20" stroke="#c3d6e7" strokeWidth="5" strokeLinecap="round" />
          <circle cx="222" cy="156" r="9" fill="#213d59" stroke="#b8cede" strokeWidth="3" />
          <path d="M337 205h14" stroke="#6ad9f0" strokeWidth="7" strokeLinecap="round" />
          {isPlaying && Array.from({ length: incomingPackets }, (_, index) => (
            <circle
              key={index}
              className="scene-packet"
              cx="0"
              cy="0"
              r={index % 3 === 0 ? 5 : 3.5}
              fill={isOverloaded ? '#fb7185' : '#b9f1ff'}
            >
              <animateMotion
                dur={`${Math.max(1.1, 3.8 - step.lambda / 125)}s`}
                begin={`${-(index * 0.36)}s`}
                path="M133 226 H214 V178 H270 V205 H337"
                repeatCount="indefinite"
              />
            </circle>
          ))}
          <path d="M309 197l12 8-12 8z" fill="#b9f1ff" />
        </g>

        <g aria-label={`Cola actual: ${Math.round(step.Q)} solicitudes`}>
          <path d="M337 145 366 128h148l-29 17z" fill="#36536e" stroke="#81a6c4" strokeWidth="2" />
          <path d="M485 145 514 128v119l-29 17z" fill="#1d3a56" stroke="#81a6c4" strokeWidth="2" />
          <path d="M337 145h148v119H337z" fill="url(#tank-front)" stroke="#a2c2da" strokeWidth="2" />
          <path d="M343 151h136v107H343z" fill="#122941" fillOpacity=".42" />
          <rect className="tank-water" x="340" y={264 - queuePercent * 1.2} width="142" height={Math.max(queuePercent * 1.2, 2)} fill="url(#water-fill)" clipPath="url(#tank-clip)" opacity=".92" />
          {Array.from({ length: visibleRequests }, (_, index) => {
            const column = index % 6;
            const row = Math.floor(index / 6);
            return (
              <g key={index} className="queue-request" style={{ animationDelay: `${(index % 5) * 90}ms` }}>
                <rect
                  x={350 + column * 21}
                  y={250 - row * 13}
                  width="14"
                  height="8"
                  rx="2"
                  fill={isOverloaded ? '#ffd0d5' : '#baf5e9'}
                  fillOpacity=".9"
                  stroke={isOverloaded ? '#ff8b9b' : '#77dcc9'}
                  strokeWidth=".8"
                />
                <path d={`M${353 + column * 21} ${253 - row * 13}h7`} stroke="#fff" strokeOpacity=".65" strokeWidth="1" />
              </g>
            );
          })}
          {queuePercent > 2 && (
            <path
              d={`M342 ${263 - queuePercent * 1.2} Q410 ${256 - queuePercent * 1.2} 480 ${263 - queuePercent * 1.2}`}
              fill="none"
              stroke="#d8fbff"
              strokeOpacity=".7"
              strokeWidth="2"
            />
          )}
          <path d="M337 145h148v119H337z" fill="none" stroke="#c9e2f0" strokeOpacity=".72" strokeWidth="2" />
          <path d="M355 156v-6m25 6v-6m25 6v-6m25 6v-6m25 6v-6m25 6v-6" stroke="#d4e7f2" strokeOpacity=".55" strokeWidth="2" />
          <path d="M350 164h122" stroke="#9ebad0" strokeOpacity=".22" strokeDasharray="4 7" />
          <text x="411" y="186" textAnchor="middle" className="scene-value">{formatRate(step.Q)}</text>
          <text x="411" y="205" textAnchor="middle" className="scene-subvalue">solicitudes esperando</text>
          <path d="M355 276h111l-15 12H370z" fill="#355b76" stroke="#7895aa" strokeWidth="1" />
          <path d="M370 288h82v5h-82z" fill="#102c43" />
        </g>

        <g aria-hidden="true">
          <path d="M514 213h118" fill="none" stroke="#476781" strokeWidth="22" strokeLinecap="round" />
          <path d="M514 213h118" fill="none" stroke="url(#pipe-highlight)" strokeWidth="16" strokeLinecap="round" />
          <path d="M514 213h118" fill="none" stroke={isDraining ? '#5eead4' : '#55c8ec'} strokeWidth="7" strokeLinecap="round" />
          <path d="M514 208h99" fill="none" stroke="#e1fbff" strokeOpacity=".48" strokeWidth="2" strokeLinecap="round" />
          <path d="M617 205l13 8-13 8z" fill="#c1f5ff" />
          {isPlaying && Array.from({ length: servicePackets }, (_, index) => (
            <circle
              key={index}
              className="scene-packet scene-packet-out"
              cx="0"
              cy="0"
              r={index % 3 === 0 ? 4.5 : 3}
              fill={isDraining ? '#99f6e4' : '#b9f1ff'}
            >
              <animateMotion
                dur={`${Math.max(1.2, 3.7 - step.muEffective / 150)}s`}
                begin={`${-(index * 0.42)}s`}
                path="M514 213 H637"
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>

        <g transform="translate(675 94)">
          <path d="M-16 122h278l-13 20h-278z" fill="#112a40" stroke="#44627c" strokeWidth="1.5" />
          <path d="M-7 123h254l-9 12H-15z" fill="#31516c" opacity=".8" />
          {Array.from({ length: config.maxInstances }, (_, index) => {
            const x = (index % 4) * 70;
            const y = Math.floor(index / 4) * 73;
            const active = index < step.instances;
            const starting = isProvisioning && index >= step.instances && index < step.instances + config.instancesPerScale;

            return (
              <g key={index} transform={`translate(${x} ${y})`} className={`${starting ? 'scene-server-starting' : ''} ${active ? 'scene-server-active' : ''}`}>
                <path d="M2 7 15 0h47L49 7z" fill={active ? '#5b7f9d' : '#293f54'} />
                <path d="M49 7 62 0v42L49 50z" fill={active ? '#183c57' : '#182d41'} />
                <rect x="2" y="7" width="47" height="43" rx="5" fill={active ? 'url(#server-front)' : '#1c3043'} stroke={active ? '#60d4ed' : starting ? '#fbbf24' : '#456079'} strokeWidth={active || starting ? 2 : 1} />
                <path d="M8 16h34m-34 10h34m-34 10h34" stroke={active ? '#9dbbd1' : '#53687b'} strokeWidth="2" strokeLinecap="round" />
                <circle cx="40" cy="42" r="2.5" fill={active ? '#54e0bd' : starting ? '#fbbf24' : '#5a6c7d'} />
                {active && <path d="M9 46h24" stroke="#53d8c3" strokeOpacity=".75" strokeWidth="1.5" strokeLinecap="round" />}
              </g>
            );
          })}
          <text x="112" y="177" textAnchor="middle" className="scene-subvalue">
            {step.instances} activos · máx. {config.maxInstances}
          </text>
        </g>

        <g transform="translate(75 298)">
          <circle r="5" cx="4" cy="0" fill="#55c8ec" />
          <text x="16" y="4" className="scene-caption">LLEGAN {formatRequests(ledger.arrived)} · {formatRate(step.lambda)} req/s</text>
        </g>
        <g transform="translate(342 298)">
          <circle r="5" cx="4" cy="0" fill="#a78bfa" />
          <text x="16" y="4" className="scene-caption">ATIENDEN {formatRequests(ledger.served)} · {formatRate(step.muNominal)} req/s CAP.</text>
        </g>
        <g transform="translate(701 298)">
          <circle r="5" cx="4" cy="0" fill={isOverloaded ? '#fb7185' : '#5eead4'} />
          <text x="16" y="4" className="scene-caption">{isOverloaded ? 'DEMANDA MAYOR A CAPACIDAD' : 'CAPACIDAD DISPONIBLE'}</text>
        </g>
        <text x="500" y="337" textAnchor="middle" className="scene-footnote">
          El grifo representa las llegadas; escalar no cierra el grifo: aumenta la capacidad de atención.
        </text>
      </svg>
      <div className="scene-mobile-caption">
        <span><i className="dot dot-in" /> Llegan {formatRequests(ledger.arrived)} en {ledger.duration.toFixed(1)} s</span>
        <ArrowDown size={16} />
        <span><i className="dot dot-queue" /> Quedan {formatRequests(ledger.after)} en espera</span>
        <ArrowDown size={16} />
        <span><i className="dot dot-out" /> Se atienden {formatRequests(ledger.served)}</span>
      </div>
    </div>
  );
}

function RateChart({
  steps,
  currentStep,
  totalDuration,
  peakArrivalRate,
  maxCapacity,
}: {
  steps: SimulationStep[];
  currentStep: SimulationStep;
  totalDuration: number;
  peakArrivalRate: number;
  maxCapacity: number;
}) {
  const maxRate = Math.max(100, peakArrivalRate, maxCapacity) * 1.12;
  const points = steps.filter((_, index) => index % 4 === 0 || index === steps.length - 1);
  const x = (time: number) => 38 + (time / totalDuration) * 722;
  const y = (rate: number) => 166 - (rate / maxRate) * 128;
  const arrivalPath = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(point.t).toFixed(1)},${y(point.lambda).toFixed(1)}`).join(' ');
  const capacityPath = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(point.t).toFixed(1)},${y(point.muNominal).toFixed(1)}`).join(' ');
  const currentX = x(currentStep.t);

  return (
    <div className="rate-chart">
      <svg viewBox="0 0 800 206" role="img" aria-label="Gráfica de demanda y capacidad a lo largo de la simulación">
        {[0, 0.5, 1].map((fraction) => {
          const gridY = 166 - fraction * 128;
          return (
            <g key={fraction}>
              <line x1="38" x2="760" y1={gridY} y2={gridY} stroke="#d7e1ea" strokeDasharray="3 6" />
              <text x="30" y={gridY + 4} textAnchor="end" className="chart-axis">{Math.round(maxRate * fraction)}</text>
            </g>
          );
        })}
        <path d={arrivalPath} fill="none" stroke="#0891b2" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
        <path d={capacityPath} fill="none" stroke="#7c3aed" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
        <line x1={currentX} x2={currentX} y1="22" y2="168" stroke="#0f172a" strokeOpacity=".55" strokeDasharray="4 5" />
        <circle cx={currentX} cy={y(currentStep.lambda)} r="5" fill="#0891b2" stroke="white" strokeWidth="2" />
        <circle cx={currentX} cy={y(currentStep.muNominal)} r="5" fill="#7c3aed" stroke="white" strokeWidth="2" />
        <text x="38" y="190" className="chart-axis">0 s</text>
        <text x="760" y="190" textAnchor="end" className="chart-axis">{totalDuration} s</text>
        <text x={Math.min(currentX + 8, 692)} y="19" className="chart-cursor-label">{currentStep.t.toFixed(1)} s</text>
      </svg>
      <div className="chart-legend">
        <span><i className="legend-line legend-demand" /> Demanda λ(t)</span>
        <span><i className="legend-line legend-capacity" /> Capacidad μ(t)</span>
      </div>
    </div>
  );
}

export function ExpositorySimulator() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('C');
  const [config, setConfig] = useState<SimulationConfig>({ ...DEFAULT_SCENARIOS.C.config });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const { steps, summary } = useMemo(() => runSimulation(config), [config]);
  const currentStep = steps[Math.min(currentStepIndex, steps.length - 1)];
  const comparisonB = useMemo(
    () => runSimulation({ ...config, autoscalingEnabled: false }).summary,
    [config],
  );
  const comparisonC = useMemo(
    () => runSimulation({ ...config, autoscalingEnabled: true }).summary,
    [config],
  );
  const queueReduction = comparisonB.peakQueue > 0
    ? Math.round((1 - comparisonC.peakQueue / comparisonB.peakQueue) * 100)
    : 0;
  const latencyReduction = comparisonB.peakLatency > 0
    ? Math.round((1 - comparisonC.peakLatency / comparisonB.peakLatency) * 100)
    : 0;
  const intervalCount = Math.min(Math.round(1 / config.dt), currentStepIndex);
  const intervalStartIndex = currentStepIndex - intervalCount;
  const intervalSteps = steps.slice(intervalStartIndex, currentStepIndex);
  const ledger: QueueLedger = {
    arrived: intervalSteps.reduce((total, step) => total + step.arrivalsInStep, 0),
    served: intervalSteps.reduce((total, step) => total + step.processedInStep, 0),
    before: steps[intervalStartIndex]?.Q ?? currentStep.Q,
    after: currentStep.Q,
    duration: intervalCount * config.dt,
  };

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setCurrentStepIndex((index) => {
        if (index >= steps.length - 1) {
          setIsPlaying(false);
          return index;
        }
        return index + 1;
      });
    }, Math.max(25, (config.dt * 1000) / playbackSpeed));
    return () => window.clearInterval(timer);
  }, [config.dt, isPlaying, playbackSpeed, steps.length]);

  const chooseScenario = (id: ScenarioId) => {
    setScenarioId(id);
    setConfig({ ...DEFAULT_SCENARIOS[id].config });
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const updateConfig = (field: keyof SimulationConfig, value: number) => {
    setConfig((current) => ({ ...current, [field]: value }));
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (currentStepIndex >= steps.length - 1) setCurrentStepIndex(0);
    setIsPlaying((playing) => !playing);
  };

  const stepForward = () => {
    setIsPlaying(false);
    setCurrentStepIndex((index) => Math.min(steps.length - 1, index + Math.round(1 / config.dt)));
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const scenario = scenarioCopy[scenarioId];
  const displayedQueue = Math.round(currentStep.Q).toLocaleString('es');
  const waitingTime = currentStep.Wq.toFixed(1);
  const queueTrend = currentStep.Q < 1 ? 'Sin solicitudes en espera' : currentStep.dQdt > 0 ? 'La fila está creciendo' : currentStep.dQdt < 0 ? 'La fila se está vaciando' : 'La fila se mantiene';
  const capacityAtQueueBoundary = ledger.duration > 0 && ledger.before < 0.05 && ledger.after < 0.05 && currentStep.lambda < currentStep.muNominal;

  return (
    <div className="expository-app">
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Inicio del simulador">
          <span className="brand-mark" aria-hidden="true"><Cog className="brand-gear" size={25} strokeWidth={1.8} /><span className="brand-core" /></span>
        </a>
        <nav className="site-nav" aria-label="Navegación principal">
          <a href="#modelo">La fórmula</a>
          <a href="#simulador">Simulador</a>
          <a href="#idea">La idea</a>
        </nav>
        <a className="header-cta" href="#formula-principal">Ver la ecuación <ArrowRight size={15} /></a>
      </header>

      <main>
        <section className="intro-section" id="inicio">
          <div className="intro-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> LATENCIA EN API · ECUACIONES DIFERENCIALES</div>
            <div className="intro-equation" id="formula-principal" aria-label="La variación de la cola es igual a la demanda menos la capacidad">
              <span className="intro-equation-label">EL MODELO QUE EXPLICAMOS</span>
              <div className="intro-equation-main">
                <span className="formula-derivative">dQ/dt</span>
                <b>=</b>
                <span className="formula-lambda">λ(t)</span>
                <i>−</i>
                <span className="formula-mu">μ(t)</span>
              </div>
              <span className="intro-equation-caption">La cola cambia según lo que llega y lo que se atiende.</span>
            </div>
            <h1>¿Qué pasa cuando llegan más solicitudes <span>de las que un servidor puede atender?</span></h1>
            <p className="intro-lede">
              Análisis de la latencia en API y servicios web ante picos de tráfico y la respuesta del autoescalado reactivo.
            </p>
            <a className="primary-link" href="#simulador">
              Ver cómo evoluciona <ArrowDown size={17} />
            </a>
            <div className="intro-note"><span className="note-icon"><Clock3 size={16} /></span><span>Modelo didáctico con parámetros hipotéticos; no representa servidores reales.</span></div>
          </div>

          <div className="intro-art" aria-hidden="true">
            <div className="art-glow" />
            <div className="art-window">
              <div className="art-window-top"><i /><i /><i /><span>flujo de solicitudes</span></div>
              <svg className="hero-flow-svg" viewBox="0 0 760 510" role="img" aria-labelledby="hero-flow-title">
                <title id="hero-flow-title">Flujo de solicitudes desde el grifo hasta la cola y los servidores</title>
                <defs>
                  <linearGradient id="hero-pipe-metal" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#e0f0e9" />
                    <stop offset=".18" stopColor="#87a9ac" />
                    <stop offset=".48" stopColor="#486e7c" />
                    <stop offset=".72" stopColor="#9cbab8" />
                    <stop offset="1" stopColor="#355b6b" />
                  </linearGradient>
                  <linearGradient id="hero-water" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#a1fff0" />
                    <stop offset=".38" stopColor="#38e4d1" />
                    <stop offset="1" stopColor="#159aba" />
                  </linearGradient>
                  <linearGradient id="hero-glass" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="#d7fffa" stopOpacity=".33" />
                    <stop offset=".12" stopColor="#b6fff2" stopOpacity=".08" />
                    <stop offset=".72" stopColor="#c5fff2" stopOpacity=".12" />
                    <stop offset="1" stopColor="#8ed9e8" stopOpacity=".34" />
                  </linearGradient>
                  <linearGradient id="hero-server-metal" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#a9c5c6" />
                    <stop offset=".22" stopColor="#4d7282" />
                    <stop offset="1" stopColor="#19394f" />
                  </linearGradient>
                  <linearGradient id="hero-server-face" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#34596b" />
                    <stop offset="1" stopColor="#132d43" />
                  </linearGradient>
                  <radialGradient id="hero-background-light">
                    <stop offset="0" stopColor="#49d7d0" stopOpacity=".2" />
                    <stop offset="1" stopColor="#49d7d0" stopOpacity="0" />
                  </radialGradient>
                  <filter id="hero-shadow" x="-.3" y="-.3" width="1.7" height="1.8">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="8" />
                    <feOffset dy="9" />
                    <feComponentTransfer><feFuncA type="linear" slope=".45" /></feComponentTransfer>
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="hero-glow" x="-.6" y="-.6" width="2.2" height="2.2">
                    <feGaussianBlur stdDeviation="7" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <clipPath id="hero-tank-clip">
                    <path d="M398 181 C398 168 438 157 490 157s92 11 92 24v190c0 14-41 25-92 25s-92-11-92-25z" />
                  </clipPath>
                </defs>

                <ellipse cx="392" cy="287" rx="340" ry="178" fill="url(#hero-background-light)" />
                <ellipse cx="490" cy="411" rx="88" ry="7" fill="#061522" opacity=".3" />

                <g className="hero-arrival-label">
                  <rect x="50" y="189" width="130" height="38" rx="19" />
                  <text x="66" y="214">Llegadas</text>
                  <text className="hero-lambda" x="143" y="214">λ</text>
                </g>

                <g className="hero-capacity-label">
                  <rect x="601" y="119" width="126" height="38" rx="19" />
                  <text x="617" y="144">Capacidad</text>
                  <text className="hero-mu" x="697" y="144">μ</text>
                </g>

                <g className="hero-inlet">
                  <path d="M55 268H397" className="hero-pipe-shadow" />
                  <path d="M55 268H397" className="hero-pipe-shell" />
                  <path d="M55 268H397" className="hero-pipe-inner" />
                  <path d="M55 263H392" className="hero-pipe-glint" />
                  <path d="M55 268H397" className="hero-water-stream" filter="url(#hero-glow)" />
                  {[0, 1, 2, 3].map((index) => (
                    <circle key={index} className="hero-flow-particle" r={index % 2 === 0 ? 5 : 3.5} fill="#bafff3">
                      <animateMotion
                        dur={`${3.6 + index * 0.3}s`}
                        begin={`${-(index * 0.9)}s`}
                        path="M55 268H397"
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}
                </g>

                <g className="hero-faucet" transform="translate(-45 0)" filter="url(#hero-shadow)">
                  <path d="M273 231V215" stroke="#223f53" strokeWidth="17" strokeLinecap="round" />
                  <path d="M273 231V215" stroke="url(#hero-pipe-metal)" strokeWidth="11" strokeLinecap="round" />
                  <rect x="247" y="200" width="52" height="11" rx="5.5" fill="#274b5b" />
                  <rect x="250" y="197" width="46" height="8" rx="4" fill="url(#hero-pipe-metal)" />
                  <path d="M273 201V177" stroke="#294d5c" strokeWidth="11" />
                  <path d="M273 201V177" stroke="url(#hero-pipe-metal)" strokeWidth="7" />
                  <rect x="232" y="170" width="82" height="13" rx="6.5" fill="url(#hero-pipe-metal)" stroke="#d7e9dd" strokeWidth="1.5" />
                  <ellipse cx="273" cy="176.5" rx="9" ry="9" fill="#c6d9d3" stroke="#738e94" strokeWidth="2" />
                  <path d="M273 183V244" stroke="url(#hero-pipe-metal)" strokeWidth="22" strokeLinecap="round" />
                  <path d="M273 183V244" stroke="#d3e2d9" strokeOpacity=".64" strokeWidth="3" strokeLinecap="round" />
                  <rect x="246" y="221" width="54" height="13" rx="5" fill="url(#hero-pipe-metal)" stroke="#c5d8d1" strokeWidth="1.5" />
                  <path d="M259 234h28v29c0 9-6 15-14 15s-14-6-14-15z" fill="#31596a" stroke="#a9c3c4" strokeWidth="3" />
                  <path d="M264 238h18v25c0 5-4 9-9 9s-9-4-9-9z" fill="url(#hero-water)" opacity=".86" />
                  <rect x="258" y="251" width="30" height="10" rx="4" fill="url(#hero-pipe-metal)" stroke="#d1e4dc" strokeWidth="1.5" />
                </g>

                <g className="hero-tank" filter="url(#hero-shadow)">
                  <ellipse cx="490" cy="184" rx="95" ry="22" fill="#31596a" stroke="#c6e4da" strokeWidth="3" />
                  <path d="M395 184v189c0 14 43 26 95 26s95-12 95-26V184" fill="url(#hero-glass)" stroke="#bce2db" strokeWidth="3" />
                  <g clipPath="url(#hero-tank-clip)">
                    <rect className="hero-reservoir-water" x="399" y="283" width="182" height="122" fill="url(#hero-water)" />
                    <ellipse className="hero-water-surface" cx="490" cy="283" rx="91" ry="15" fill="#75f4e1" fillOpacity=".75" />
                    <path d="M411 297v65c0 10 35 19 79 19" fill="none" stroke="#e1fff6" strokeOpacity=".26" strokeWidth="5" />
                  </g>
                  <path d="M395 184c0-12 43-22 95-22s95 10 95 22" fill="none" stroke="#effff2" strokeOpacity=".86" strokeWidth="3" />
                  <path d="M405 191v170" stroke="#edfff3" strokeOpacity=".72" strokeWidth="5" strokeLinecap="round" />
                  <path d="M574 191v169" stroke="#a4ebf0" strokeOpacity=".62" strokeWidth="7" strokeLinecap="round" />
                  <path d="M405 373c0 11 38 20 85 20s85-9 85-20" fill="none" stroke="#c9e8dc" strokeWidth="5" />
                  <ellipse cx="490" cy="391" rx="105" ry="13" fill="#547d86" fillOpacity=".55" stroke="#9bbeb8" strokeWidth="3" />
                  <ellipse cx="490" cy="391" rx="88" ry="6" fill="#193d4e" opacity=".65" />
                  <text x="490" y="267" textAnchor="middle" className="hero-queue-value">Q(t)</text>
                </g>

                <g className="hero-inlet-port">
                  <path d="M386 268H401Q418 268 418 285V322" className="hero-port-shell" />
                  <path d="M386 268H401Q418 268 418 285V322" className="hero-port-water" />
                  <path d="M397 249v38" className="hero-port-rim" />
                  <path d="M402 252v32" className="hero-port-highlight" />
                  {[0, 1, 2].map((index) => (
                    <circle key={index} className="hero-tank-particle" r={index === 1 ? 4.5 : 3.5} fill="#c6fff4">
                      <animateMotion
                        dur={`${1.25 + index * 0.18}s`}
                        begin={`${-(index * 0.42)}s`}
                        path="M382 268H401Q418 268 418 285V322"
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}
                </g>

                <g className="hero-server-panel">
                  <rect x="617" y="170" width="116" height="194" rx="15" />
                  <path d="M617 190v154" />
                  <path d="M733 190v154" />
                </g>

                <g className="hero-output">
                  <path d="M582 284H602V222H628M602 284V317H628" className="hero-output-shell" />
                  <path d="M582 284H602V222H628M602 284V317H628" className="hero-output-water" />
                  {[0, 1, 2].map((index) => (
                    <circle key={index} className="hero-output-particle" r="4" fill="#bdfff3">
                      <animateMotion
                        dur={`${2.1 + index * 0.25}s`}
                        begin={`${-(index * 0.75)}s`}
                        path={index % 2 === 0 ? 'M582 284H602V222H628' : 'M582 284H602V317H628'}
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}
                </g>

                <g className="hero-servers" filter="url(#hero-shadow)">
                  <path d="M628 190 644 181h78l-13 9z" fill="#a2c2bf" />
                  <path d="M709 190 722 181v67l-13 8z" fill="#19394e" />
                  <rect x="628" y="190" width="81" height="65" rx="7" fill="url(#hero-server-metal)" stroke="#acd0c9" strokeWidth="2" />
                  <rect x="638" y="199" width="61" height="47" rx="5" fill="url(#hero-server-face)" stroke="#638c94" />
                  <path d="M647 208h39m-39 8h39m-39 8h39m-39 8h27" stroke="#819fa6" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="689" cy="232" r="3" fill="#7effd3" className="hero-server-led" />

                  <path d="M628 284 644 275h78l-13 9z" fill="#8eafb1" />
                  <path d="M709 284 722 275v67l-13 8z" fill="#19394e" />
                  <rect x="628" y="284" width="81" height="65" rx="7" fill="url(#hero-server-metal)" stroke="#9bc5c3" strokeWidth="2" />
                  <rect x="638" y="293" width="61" height="47" rx="5" fill="url(#hero-server-face)" stroke="#638c94" />
                  <path d="M647 302h39m-39 8h39m-39 8h39m-39 8h27" stroke="#819fa6" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="689" cy="326" r="3" fill="#7effd3" className="hero-server-led hero-server-led-late" />
                </g>

                <g className="hero-queue-label">
                  <rect x="426" y="421" width="131" height="36" rx="18" />
                  <text x="444" y="444">Cola</text>
                  <text className="hero-q" x="483" y="444">Q(t)</text>
                </g>
              </svg>
            </div>
            <div className="art-caption"><span className="caption-pulse" /> Modelo visual · no son servidores reales</div>
          </div>
        </section>

        <section className="idea-strip" id="idea" aria-label="Idea principal">
          <div className="idea-step">
            <span className="idea-number">01</span>
            <span className="idea-symbol idea-symbol-in"><Users size={20} /></span>
            <div><strong>Entran solicitudes</strong><span>La demanda abre el grifo.</span></div>
          </div>
          <ArrowRight className="idea-arrow" size={18} />
          <div className="idea-step">
            <span className="idea-number">02</span>
            <span className="idea-symbol idea-symbol-queue"><Gauge size={20} /></span>
            <div><strong>Se forma una fila</strong><span>Si llega más de lo que se atiende.</span></div>
          </div>
          <ArrowRight className="idea-arrow" size={18} />
          <div className="idea-step">
            <span className="idea-number">03</span>
            <span className="idea-symbol idea-symbol-scale"><Server size={20} /></span>
            <div><strong>Se adapta la capacidad</strong><span>Más servidores ayudan a vaciarla.</span></div>
          </div>
        </section>

        <section className="simulator-section" id="simulador">
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> Laboratorio</div>
              <h2>Ahora, ponlo en marcha.</h2>
              <p>Elige una situación y observa qué ocurre con la fila cuando avanza el tiempo.</p>
            </div>
            <div className="scenario-tag"><span /> SIMULACIÓN TEÓRICA</div>
          </div>

          <div className="scenario-picker" role="group" aria-label="Selecciona un escenario">
            {(Object.keys(scenarioCopy) as ScenarioId[]).map((id) => (
              <button
                type="button"
                key={id}
                onClick={() => chooseScenario(id)}
                className={`scenario-option ${scenarioId === id ? 'scenario-selected' : ''} scenario-${scenarioCopy[id].accent}`}
                aria-pressed={scenarioId === id}
              >
                <span className="scenario-letter">{id}</span>
                <span className="scenario-text"><strong>{scenarioCopy[id].title}</strong><small>{scenarioCopy[id].description}</small></span>
                {scenarioId === id && <Check className="scenario-check" size={17} />}
              </button>
            ))}
          </div>

          <div className="simulation-card">
            <div className="simulation-toolbar">
              <div className="live-status"><span className={isPlaying ? 'live-dot live-dot-on' : 'live-dot'} /> {isPlaying ? 'En ejecución' : 'Lista para explorar'}</div>
              <div className="toolbar-time"><Clock3 size={15} /><strong>{currentStep.t.toFixed(1)} s</strong><span>/ {config.totalDuration} s</span></div>
            </div>

            <FlowIllustration step={currentStep} config={config} isPlaying={isPlaying} ledger={ledger} />

            <div className="simulation-controls">
              <div className="transport-controls">
                <button type="button" className={`play-button ${isPlaying ? 'is-paused' : ''}`} onClick={togglePlayback}>
                  {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
                  {isPlaying ? 'Pausar' : 'Reproducir'}
                </button>
                <button type="button" className="secondary-button" onClick={stepForward} disabled={isPlaying} aria-label="Avanzar un segundo">
                  <ArrowRight size={16} /><span>+1 s</span>
                </button>
                <button type="button" className="icon-button" onClick={reset} aria-label="Reiniciar simulación" title="Reiniciar">
                  <RotateCcw size={16} />
                </button>
              </div>
              <div className="speed-controls" aria-label="Velocidad de reproducción">
                <span>Velocidad</span>
                {[1, 2, 4].map((speed) => (
                  <button
                    type="button"
                    key={speed}
                    className={playbackSpeed === speed ? 'speed-selected' : ''}
                    aria-pressed={playbackSpeed === speed}
                    onClick={() => setPlaybackSpeed(speed)}
                  >{speed}×</button>
                ))}
              </div>
            </div>

            <label className="timeline-control">
              <span className="sr-only">Tiempo de simulación</span>
              <input
                type="range"
                min="0"
                max={steps.length - 1}
                value={currentStepIndex}
                onChange={(event) => {
                  setIsPlaying(false);
                  setCurrentStepIndex(Number(event.target.value));
                }}
                style={{ '--range-progress': `${steps.length > 1 ? (currentStepIndex / (steps.length - 1)) * 100 : 0}%` } as React.CSSProperties}
              />
              <span className="timeline-labels"><span>Inicio</span><span>Pico de demanda</span><span>Fin</span></span>
            </label>
          </div>

          <div className="live-reading">
            <div className="reading-intro">
              <span className={`reading-icon ${scenario.accent}`}><Zap size={18} /></span>
              <div><strong>Lo que pasa ahora</strong><span>{queueTrend}</span></div>
            </div>
            <div className="reading-metric reading-demand"><span>Demanda <b>λ</b></span><strong>{formatRate(currentStep.lambda)}<small> req/s</small></strong></div>
            <div className="reading-metric reading-capacity"><span>Capacidad <b>μ</b></span><strong>{formatRate(currentStep.muNominal)}<small> req/s</small></strong></div>
            <div className={`reading-metric ${currentStep.Q > 100 ? 'reading-queue-high' : 'reading-queue'}`}><span>En espera <b>Q</b></span><strong>{displayedQueue}<small> solic.</small></strong></div>
            <div className="reading-metric reading-latency"><span>Espera aprox. <b>Wq</b></span><strong>{waitingTime}<small> s</small></strong></div>
          </div>

          <div className="queue-ledger">
            <div className="ledger-heading">
              <span className="ledger-icon"><Waves size={17} /></span>
              <div><strong>El recorrido de las solicitudes</strong><span>Balance real del último {ledger.duration.toFixed(1)} s simulado</span></div>
            </div>
            <div className="ledger-flow">
              <div className="ledger-cell ledger-incoming">
                <span>Entraron</span>
                <strong>+{formatRequests(ledger.arrived)}</strong>
                <small>nuevas solicitudes</small>
              </div>
              <span className="ledger-operator">+</span>
              <div className="ledger-cell ledger-previous">
                <span>Ya esperaban</span>
                <strong>{formatRequests(ledger.before)}</strong>
                <small>cola al comenzar</small>
              </div>
              <span className="ledger-operator">−</span>
              <div className="ledger-cell ledger-served">
                <span>Se atendieron</span>
                <strong>−{formatRequests(ledger.served)}</strong>
                <small>por los servidores</small>
              </div>
              <span className="ledger-operator ledger-equals">=</span>
              <div className="ledger-cell ledger-pending">
                <span>Quedan en cola</span>
                <strong>{formatRequests(ledger.after)}</strong>
                <small>pendientes ahora</small>
              </div>
            </div>
            <div className="ledger-equation">
              <span>Q nueva</span>
              <b>=</b>
              <span>Q anterior</span>
              <b>+</b>
              <span>llegadas</span>
              <b>−</b>
              <span>atendidas</span>
              <i>·</i>
              <strong>{ledger.duration > 0
                ? `${formatRequests(ledger.before)} + ${formatRequests(ledger.arrived)} − ${formatRequests(ledger.served)} = ${formatRequests(ledger.after)}`
                : 'La simulación aún no ha avanzado'}</strong>
            </div>
            <p className="ledger-note">
              {ledger.duration > 0
                ? capacityAtQueueBoundary
                  ? `Llegan ${formatRate(currentStep.lambda)} req/s y hay capacidad para ${formatRate(currentStep.muNominal)} req/s. Como no hay más solicitudes esperando, se atienden las ${formatRequests(ledger.arrived)} que llegaron; quedan ${formatRate(currentStep.muNominal - currentStep.lambda)} req/s de capacidad libre.`
                  : `La capacidad disponible es ${formatRate(currentStep.muNominal)} req/s, pero solo se atienden solicitudes que existen: las nuevas y las que ya estaban en cola.`
                : 'Pulsa «Reproducir» o «+1 s» para ver cuántas solicitudes entran y cuántas pueden atenderse.'}
            </p>
          </div>

          <div className="explanation-row">
            <div className="equation-card">
              <div className="equation-label">La regla en este instante</div>
              <div className="equation-line">
                <span className="formula-derivative">dQ/dt</span><b>=</b>
                <span className="formula-lambda">λ</span><b>−</b><span className="formula-mu">μ</span>
              </div>
              <div className={`equation-result ${currentStep.dQdt > 0 ? 'result-growing' : currentStep.dQdt < 0 ? 'result-draining' : ''}`}>
                <span className="formula-lambda">{formatRate(currentStep.lambda)}</span>
                <b> − </b>
                <span className="formula-mu">{formatRate(currentStep.muNominal)}</span>
                <b> = </b>
                <strong>{currentStep.dQdt > 0 ? '+' : ''}{formatRate(currentStep.dQdt)} req/s</strong>
              </div>
              <p>{capacityAtQueueBoundary
                ? `La diferencia de tasas es ${formatRate(currentStep.lambda)} − ${formatRate(currentStep.muNominal)} = ${formatRate(currentStep.dQdt)} req/s. Pero la cola no puede ser negativa: se atienden las ${formatRequests(ledger.arrived)} solicitudes que llegan y Q permanece en 0.`
                : currentStep.dQdt > 0
                ? 'La demanda supera la atención: la fila aumenta.'
                : currentStep.Q > 0 && currentStep.dQdt < 0
                  ? 'La atención supera la demanda: la fila disminuye.'
                  : currentStep.Q < 1
                    ? 'No hay fila pendiente; la cola se mantiene en cero.'
                    : 'La demanda y la atención están equilibradas.'}</p>
            </div>
            <div className="scenario-insight">
              <span className="insight-icon"><Zap size={16} /></span>
              <div>
                <strong>{scenario.title}: {scenarioId === 'C' ? 'los servidores se ajustan a la demanda' : scenarioId === 'B' ? 'la capacidad se queda fija' : 'el servicio mantiene el ritmo'}</strong>
                <p>{scenarioId === 'C'
                  ? `Tras el tiempo de arranque, la capacidad sube a ${formatRate(currentStep.muNominal)} solicitudes/s. El pico de cola de este modelo es ${Math.round(summary.peakQueue).toLocaleString('es')} solicitudes.`
                  : scenarioId === 'B'
                    ? `Con capacidad fija, la fila puede llegar a ${Math.round(summary.peakQueue).toLocaleString('es')} solicitudes en este escenario.`
                    : 'La capacidad instalada puede atender la demanda normal sin dejar solicitudes en espera.'}</p>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-heading">
              <div><strong>Demanda frente a capacidad</strong><span>La línea vertical marca el instante de la simulación.</span></div>
              <span className="chart-unit">solicitudes / segundo</span>
            </div>
            <RateChart
              steps={steps}
              currentStep={currentStep}
              totalDuration={config.totalDuration}
              peakArrivalRate={config.peakArrivalRate}
              maxCapacity={config.maxInstances * config.capacityPerInstance}
            />
          </div>

          <details className="advanced-settings" open={advancedOpen} onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}>
            <summary><SlidersHorizontal size={17} /><span>¿Quieres modificar los valores?</span><ChevronDown size={17} className="advanced-chevron" /></summary>
            <div className="settings-grid">
              <label>
                <span>Demanda pico <b>{config.peakArrivalRate} req/s</b></span>
                <input type="range" min="75" max="400" step="5" value={config.peakArrivalRate} onChange={(event) => updateConfig('peakArrivalRate', Number(event.target.value))} />
                <small>Solicitudes que llegan cada segundo en el pico.</small>
              </label>
              <label>
                <span>Capacidad por servidor <b>{config.capacityPerInstance} req/s</b></span>
                <input type="range" min="20" max="100" step="5" value={config.capacityPerInstance} onChange={(event) => updateConfig('capacityPerInstance', Number(event.target.value))} />
                <small>Cuántas solicitudes puede atender cada instancia.</small>
              </label>
              <label>
                <span>Demora de arranque <b>{config.provisioningDelay} s</b></span>
                <input type="range" min="0" max="30" step="1" value={config.provisioningDelay} onChange={(event) => updateConfig('provisioningDelay', Number(event.target.value))} disabled={!config.autoscalingEnabled} />
                <small>Solo afecta al escenario con autoescalado.</small>
              </label>
            </div>
            {scenarioId !== 'A' && (
              <div className="comparison-note">
                <Zap size={16} />
                <span>Con estos mismos parámetros, el autoescalado reduce la cola máxima un <b>{queueReduction}%</b> y la espera máxima un <b>{latencyReduction}%</b> frente a capacidad fija.</span>
              </div>
            )}
          </details>
        </section>

        <section className="model-section" id="modelo">
          <div className="model-heading">
            <div className="eyebrow"><span className="eyebrow-dot" /> La matemática, sin rodeos</div>
            <h2>Una fórmula. Cuatro ideas.</h2>
            <p>No necesitas memorizar muchas variables: observa cómo se equilibran las llegadas y la capacidad.</p>
          </div>
          <div className="model-equation">
            <span className="model-derivative">dQ(t)</span><span className="model-slash">/</span><span className="model-derivative">dt</span>
            <span className="model-equals">=</span>
            <span className="model-lambda">λ(t)</span>
            <span className="model-minus">−</span>
            <span className="model-mu">μ(t)</span>
          </div>
          <div className="model-definitions">
            <div><span className="definition-symbol symbol-lambda">λ</span><p><strong>Lo que llega</strong><br />Solicitudes por segundo.</p></div>
            <div><span className="definition-symbol symbol-mu">μ</span><p><strong>Lo que se atiende</strong><br />Capacidad total por segundo.</p></div>
            <div><span className="definition-symbol symbol-q">Q</span><p><strong>Lo que espera</strong><br />Solicitudes acumuladas en la fila.</p></div>
            <div><span className="definition-symbol symbol-derivative"><ArrowDown size={18} /></span><p><strong>Lo que cambia</strong><br />Ritmo al que crece o baja la fila.</p></div>
          </div>
          <div className="model-takeaway"><span>Importante</span><p>El autoescalado <strong>no reduce el tráfico que llega</strong>: aumenta la capacidad de atención para que la fila baje y la espera se reduzca.</p></div>
          <div className="model-footnote">Ejemplo académico con datos hipotéticos. Representa un modelo continuo simplificado, no infraestructura real.</div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#inicio" aria-label="Volver al inicio"><span className="brand-mark" aria-hidden="true"><Cog className="brand-gear" size={22} strokeWidth={1.8} /><span className="brand-core" /></span></a>
        <span>Un modelo visual de ecuaciones diferenciales y autoescalado.</span>
        <a href="#inicio">Volver arriba ↑</a>
      </footer>
    </div>
  );
}
