/**
 * Motor de resolución numérica mediante el Método de Euler y
 * simulación de política de autoescalado reactivo.
 * 
 * Modelo Matemático:
 * dQ(t)/dt = λ(t) - μ(t)
 * Condición de frontera: Q(t) >= 0 para todo t.
 */

import { AutoscalingState, SimulationConfig, SimulationStep, SimulationSummary } from './types';

/**
 * Calcula la tasa de llegada instantánea λ(t) en solicitudes por segundo.
 * Admite tanto salto abrupto (escalón) como rampa gradual (apertura realista de inscripciones).
 */
export function calculateArrivalRate(t: number, config: SimulationConfig): number {
  const { baseArrivalRate, peakArrivalRate, peakStartTime, peakDuration, peakRampTime } = config;
  const peakEndTime = peakStartTime + peakDuration;

  // Antes del pico de tráfico
  if (t < peakStartTime) {
    return baseArrivalRate;
  }

  // Rampa de subida (estudiantes ingresando al abrir la plataforma)
  if (peakRampTime > 0 && t < peakStartTime + peakRampTime) {
    const progress = (t - peakStartTime) / peakRampTime;
    return baseArrivalRate + progress * (peakArrivalRate - baseArrivalRate);
  }

  // Meseta del pico de tráfico sostenido
  if (t <= peakEndTime - peakRampTime) {
    return peakArrivalRate;
  }

  // Rampa de bajada (estudiantes completando su registro o desistiendo)
  if (peakRampTime > 0 && t <= peakEndTime) {
    const progress = (peakEndTime - t) / peakRampTime;
    return baseArrivalRate + progress * (peakArrivalRate - baseArrivalRate);
  }

  // Después del pico de tráfico (retorno a operación habitual)
  return baseArrivalRate;
}

/**
 * Ejecuta la simulación completa resolviendo la EDO paso a paso mediante el Método de Euler.
 */
export function runSimulation(config: SimulationConfig): {
  steps: SimulationStep[];
  summary: SimulationSummary;
} {
  const steps: SimulationStep[] = [];
  const {
    totalDuration,
    dt,
    initialInstances,
    capacityPerInstance,
    minInstances,
    maxInstances,
    autoscalingEnabled,
    scaleUpThresholdQueue,
    scaleUpThresholdUtil,
    provisioningDelay,
    instancesPerScale,
    cooldownPeriod,
    peakStartTime,
    peakDuration,
  } = config;

  const peakEndTime = peakStartTime + peakDuration;

  // Estado mutable del sistema
  let currentInstances = initialInstances;
  let Q = 0; // Solicitudes acumuladas iniciales Q(0) = 0
  let totalArrivals = 0;
  let totalProcessed = 0;

  // Variables de control de autoescalado reactivo
  let autoscaleState: AutoscalingState = 'NORMAL';
  let stateDescription = 'Sistema en régimen normal de operación.';
  let provisioningTimeRemaining = 0;
  let cooldownTimeRemaining = 0;
  let autoscalingTriggered = false;

  // Métricas agregadas
  let peakQueue = 0;
  let peakQueueTime = 0;
  let peakLatency = 0;
  let peakArrivalRate = 0;
  let maxInstancesReached = initialInstances;
  let timeToRecover: number | null = null;
  let recoveryDetected = false;

  const totalSteps = Math.floor(totalDuration / dt);

  for (let stepIndex = 0; stepIndex <= totalSteps; stepIndex++) {
    const t = Number((stepIndex * dt).toFixed(3));

    // 1. Determinar tasa de llegada instantánea λ(t)
    const lambda = calculateArrivalRate(t, config);
    if (lambda > peakArrivalRate) {
      peakArrivalRate = lambda;
    }

    // 2. Capacidad nominal de procesamiento μ(t) = N(t) * μ_instancia
    const muNominal = currentInstances * capacityPerInstance;
    const utilization = muNominal > 0 ? lambda / muNominal : 0;

    // 3. Lógica del Autoescalado Reactivo (Detección, Aprovisionamiento y Enfriamiento)
    if (autoscalingEnabled) {
      // Condición de sobrecarga: cola mayor al umbral o utilización crítica
      const isOverloaded = Q >= scaleUpThresholdQueue || (utilization >= scaleUpThresholdUtil && lambda > muNominal);

      if (autoscaleState === 'NORMAL') {
        if (isOverloaded && currentInstances < maxInstances) {
          autoscaleState = 'DETECTING';
          stateDescription = `Sobrecarga detectada (Q=${Math.round(Q)}, Util=${(utilization * 100).toFixed(0)}%). Iniciando aprovisionamiento.`;
          provisioningTimeRemaining = provisioningDelay;
          autoscalingTriggered = true;
        } else {
          stateDescription = 'Demanda dentro de capacidad de procesamiento.';
        }
      } else if (autoscaleState === 'DETECTING' || autoscaleState === 'PROVISIONING') {
        autoscaleState = 'PROVISIONING';
        provisioningTimeRemaining -= dt;

        if (provisioningTimeRemaining <= 0) {
          // Servidores listos: aumenta capacidad
          const newInstances = Math.min(maxInstances, currentInstances + instancesPerScale);
          const added = newInstances - currentInstances;
          currentInstances = newInstances;
          if (currentInstances > maxInstancesReached) {
            maxInstancesReached = currentInstances;
          }

          autoscaleState = 'STABILIZED';
          stateDescription = `¡Escalado completado! +${added} instancias activadas. Capacidad aumentada a ${currentInstances * capacityPerInstance} req/s.`;
          cooldownTimeRemaining = cooldownPeriod;
        } else {
          stateDescription = `Aprovisionando ${instancesPerScale} instancias... Espera de arranque: ${provisioningTimeRemaining.toFixed(1)}s restantes.`;
        }
      } else if (autoscaleState === 'STABILIZED') {
        // Si aún con el nuevo escalado sigue sobrecargado y no alcanzamos el tope, volvemos a provisionar
        if (isOverloaded && currentInstances < maxInstances) {
          autoscaleState = 'PROVISIONING';
          provisioningTimeRemaining = provisioningDelay;
          stateDescription = `Sobrecarga persistente. Aprovisionando recursos adicionales (quedan ${provisioningTimeRemaining.toFixed(1)}s).`;
        } else if (!isOverloaded && Q < 5 && t > peakEndTime) {
          // El tráfico ha bajado y la cola está casi vacía: comenzar periodo de enfriamiento
          autoscaleState = 'COOLING_DOWN';
          cooldownTimeRemaining = cooldownPeriod;
          stateDescription = `Tráfico normalizado. Periodo de enfriamiento activo (${cooldownTimeRemaining.toFixed(1)}s) antes de reducir servidores.`;
        } else {
          stateDescription = `Sistema estabilizado con ${currentInstances} instancias activas.`;
        }
      } else if (autoscaleState === 'COOLING_DOWN') {
        if (isOverloaded) {
          // Si vuelve a subir el tráfico durante el cooldown, cancelamos desescalado
          autoscaleState = 'STABILIZED';
          stateDescription = 'Aumento de demanda durante enfriamiento. Desescalado cancelado.';
        } else {
          cooldownTimeRemaining -= dt;
          if (cooldownTimeRemaining <= 0) {
            if (currentInstances > minInstances) {
              const prev = currentInstances;
              currentInstances = Math.max(minInstances, currentInstances - instancesPerScale);
              stateDescription = `Desescalado ejecutado: de ${prev} a ${currentInstances} instancias para optimizar recursos.`;
            } else {
              autoscaleState = 'NORMAL';
              stateDescription = 'Retorno completo a nivel base de instancias.';
            }
          } else {
            stateDescription = `Enfriamiento en curso: ${cooldownTimeRemaining.toFixed(1)}s antes de apagar instancias redundantes.`;
          }
        }
      }
    } else {
      stateDescription = 'Autoescalado DESACTIVADO: Capacidad fija sin respuesta dinámica.';
    }

    // 4. Capacidad de procesamiento tras posible actualización de instancias
    const updatedMu = currentInstances * capacityPerInstance;

    // 5. Método de Euler para resolver dQ/dt = λ(t) - μ(t)
    // Tasa teórica de variación
    const dQdtTheoretical = lambda - updatedMu;

    // Tasa efectiva de servicio en este intervalo:
    // Si la cola está vacía (Q == 0) y λ < μ, el servidor solo procesa lo que entra (λ).
    // No pueden procesarse más solicitudes de las disponibles en el sistema.
    const maxProcessableInDt = updatedMu * dt;
    const availableToProcess = Q + lambda * dt;
    const actualProcessedInDt = Math.min(maxProcessableInDt, availableToProcess);
    const muEffective = actualProcessedInDt / dt;

    // Nueva cantidad de solicitudes acumuladas en el siguiente paso:
    // Q(n+1) = Q(n) + (λ_n - μ_efectiva,n) * dt
    const nextQ = Math.max(0, Q + (lambda - muEffective) * dt);

    // Latencia estimada en cola mediante aproximación de Little: Wq ≈ Q(t) / μ(t)
    // Representa el tiempo que le tomará a la cola actual ser evacuada por los servidores activos.
    const Wq = updatedMu > 0 ? Q / updatedMu : 0;

    // Acumuladores
    totalArrivals += lambda * dt;
    totalProcessed += actualProcessedInDt;

    // Registro de picos
    if (Q > peakQueue) {
      peakQueue = Q;
      peakQueueTime = t;
    }
    if (Wq > peakLatency) {
      peakLatency = Wq;
    }

    // Detección del tiempo de recuperación tras el fin del pico
    if (t > peakEndTime && !recoveryDetected) {
      if (Q < 1.0) { // Prácticamente evacuada
        timeToRecover = Number((t - peakEndTime).toFixed(1));
        recoveryDetected = true;
      }
    }

    // Guardar paso de la simulación
    steps.push({
      t,
      lambda: Number(lambda.toFixed(2)),
      muNominal: Number(updatedMu.toFixed(2)),
      muEffective: Number(muEffective.toFixed(2)),
      dQdt: Number(dQdtTheoretical.toFixed(2)),
      Q: Number(Q.toFixed(2)),
      Wq: Number(Wq.toFixed(2)),
      instances: currentInstances,
      utilization: Number(utilization.toFixed(3)),
      state: autoscaleState,
      stateDescription,
      provisioningRemaining: Math.max(0, Number(provisioningTimeRemaining.toFixed(1))),
      cooldownRemaining: Math.max(0, Number(cooldownTimeRemaining.toFixed(1))),
      totalArrivals: Math.round(totalArrivals),
      totalProcessed: Math.round(totalProcessed),
      arrivalsInStep: Number((lambda * dt).toFixed(3)),
      processedInStep: Number(actualProcessedInDt.toFixed(3)),
    });

    // Actualizar Q para la siguiente iteración
    Q = nextQ;
  }

  const summary: SimulationSummary = {
    peakQueue: Number(peakQueue.toFixed(1)),
    peakQueueTime,
    peakLatency: Number(peakLatency.toFixed(2)),
    peakArrivalRate: Number(peakArrivalRate.toFixed(1)),
    maxInstancesReached,
    timeToRecover,
    totalRequestsReceived: Math.round(totalArrivals),
    totalRequestsProcessed: Math.round(totalProcessed),
    unprocessedAtEnd: Math.round(Q),
    autoscalingTriggered,
  };

  return { steps, summary };
}
