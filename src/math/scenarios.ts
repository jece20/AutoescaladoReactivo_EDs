/**
 * Definición de los escenarios obligatorios para el análisis académico.
 * Escenario A: Demanda normal (λ < μ)
 * Escenario B: Pico de tráfico sin autoescalado (sobrecarga severa)
 * Escenario C: Pico de tráfico con autoescalado reactivo (mitigación y recuperación)
 */

import { ScenarioDefinition } from './types';

export const SCENARIO_A: ScenarioDefinition = {
  id: 'A',
  name: 'Escenario A: Demanda Normal',
  shortDescription: 'Operación regular donde la tasa de llegada es inferior a la capacidad instalada.',
  badge: 'Demanda Controlada',
  badgeColor: 'emerald',
  academicObjective: 'Demostrar que cuando λ(t) < μ(t) de forma continua, dQ/dt <= 0 y la condición de frontera Q(t) >= 0 mantiene la cola en cero sin necesidad de autoescalado.',
  config: {
    totalDuration: 120,
    dt: 0.5,
    baseArrivalRate: 60,
    peakArrivalRate: 75, // Pequeña fluctuación normal que no supera la capacidad
    peakStartTime: 20,
    peakDuration: 30,
    peakRampTime: 5,
    initialInstances: 2,
    capacityPerInstance: 50, // Capacidad total inicial = 100 req/s
    minInstances: 2,
    maxInstances: 8,
    autoscalingEnabled: false,
    scaleUpThresholdQueue: 35,
    scaleUpThresholdUtil: 0.85,
    provisioningDelay: 15,
    instancesPerScale: 2,
    cooldownPeriod: 20,
  },
};

export const SCENARIO_B: ScenarioDefinition = {
  id: 'B',
  name: 'Escenario B: Pico SIN Autoescalado',
  shortDescription: 'Avalancha repentina de solicitudes con capacidad fija. Sobrecarga y colapso de tiempos de espera.',
  badge: 'Sobrecarga Severa',
  badgeColor: 'rose',
  academicObjective: 'Demostrar que con capacidad estática μ constante y λ(t) >> μ, la derivada dQ/dt es positiva y constante durante el pico, acumulando un volumen masivo de cola Q(t) y disparando la latencia.',
  config: {
    totalDuration: 140,
    dt: 0.5,
    baseArrivalRate: 60,
    peakArrivalRate: 240, // Gran pico: supera por 140 req/s la capacidad de 100 req/s
    peakStartTime: 20,
    peakDuration: 40,
    peakRampTime: 3,
    initialInstances: 2,
    capacityPerInstance: 50, // Capacidad fija de 100 req/s
    minInstances: 2,
    maxInstances: 8,
    autoscalingEnabled: false, // Autoescalado apagado
    scaleUpThresholdQueue: 35,
    scaleUpThresholdUtil: 0.85,
    provisioningDelay: 15,
    instancesPerScale: 2,
    cooldownPeriod: 20,
  },
};

export const SCENARIO_C: ScenarioDefinition = {
  id: 'C',
  name: 'Escenario C: Pico CON Autoescalado Reactivo',
  shortDescription: 'Mismo pico que en B, pero el sistema detecta la acumulación, aprovisiona instancias y desahoga la cola.',
  badge: 'Autoescalado Reactivo',
  badgeColor: 'cyan',
  academicObjective: 'Observar el retraso de reacción (provisioning delay), el incremento por tramos de μ(t) y cómo al alcanzar μ(t) > λ(t) la derivada dQ/dt se torna negativa, drenando la cola drásticamente.',
  config: {
    totalDuration: 140,
    dt: 0.5,
    baseArrivalRate: 60,
    peakArrivalRate: 240, // Mismo pico idéntico a B para validez científica
    peakStartTime: 20,
    peakDuration: 40,
    peakRampTime: 3,
    initialInstances: 2,
    capacityPerInstance: 50,
    minInstances: 2,
    maxInstances: 8,
    autoscalingEnabled: true, // Autoescalado habilitado
    scaleUpThresholdQueue: 35,
    scaleUpThresholdUtil: 0.85,
    provisioningDelay: 15, // 15 segundos para iniciar nuevas instancias
    instancesPerScale: 2,  // Añadir +2 instancias (+100 req/s)
    cooldownPeriod: 20,
  },
};

export const DEFAULT_SCENARIOS = {
  A: SCENARIO_A,
  B: SCENARIO_B,
  C: SCENARIO_C,
};

