# Simulador Interactivo de Tráfico, Latencia y Autoescalado Reactivo en Servicios Web Mediante Ecuaciones Diferenciales

**Trabajo Académico para la Asignatura:** Ecuaciones Diferenciales  
**Programa:** Ingeniería de Sistemas  
**Tema:** *Análisis de la latencia en API y servicios web ante picos de tráfico y la respuesta del autoescalado reactivo.*

---

## 1. Contexto Académico y Problemática Modelada

Este proyecto demuestra la aplicación práctica de las **Ecuaciones Diferenciales Ordinarias (EDO)** a un problema central de la Ingeniería de Sistemas: la saturación y degradación de rendimiento en servicios web ante incrementos repentinos de tráfico.

### Escenario de Aplicación: Plataforma Universitaria de Inscripciones
Al inicio de cada semestre, las instituciones de educación superior habilitan las inscripciones o matrículas de materias en un horario predeterminado (por ejemplo, 8:00 AM). En ese instante, miles de estudiantes intentan conectarse en simultáneo:
1. La tasa de solicitudes entrantes ($\lambda(t)$) supera drásticamente la capacidad de procesamiento instalada ($\mu(t)$).
2. Se acumulan peticiones en los buffers y colas del balanceador de carga ($Q(t)$).
3. Los tiempos de espera (latencia $W_q(t)$) crecen exponencialmente, provocando caídas de servicio o *timeouts*.
4. El mecanismo de **autoescalado reactivo** detecta la sobrecarga, pero presenta un **retraso de aprovisionamiento** (tiempo de arranque de nuevas máquinas virtuales o contenedores) antes de incrementar la capacidad.

> **Aclaración Metodológica:** Los parámetros y métricas utilizados son de carácter hipotético y pedagógico, diseñados para ilustrar el comportamiento matemático del sistema continuo. No representan mediciones de servidores reales ni telemetría confidencial de infraestructura comercial.

---

## 2. Modelo Matemático

### 2.1 Ecuación Diferencial Principal
El balance de solicitudes en el buffer del servidor se rige por la ecuación diferencial:

$$\frac{dQ(t)}{dt} = \lambda(t) - \mu(t)$$

Sujeta a la condición de frontera física de no-negatividad:

$$Q(t) \ge 0 \quad \forall t \ge 0$$

### 2.2 Variables del Sistema
- **$Q(t)$**: Cantidad de solicitudes pendientes de procesamiento en el tiempo $t$ (*solicitudes acumuladas*).
- **$\lambda(t)$**: Tasa de llegada de solicitudes por segundo impuesta por la demanda de los usuarios (*solicitudes / segundo*).
- **$\mu(t)$**: Capacidad de procesamiento efectiva total del cluster de servidores (*solicitudes / segundo*).
- **$\frac{dQ(t)}{dt}$**: Tasa instantánea de variación del tamaño de la cola (*solicitudes / segundo*).

### 2.3 Interpretación Física de la Derivada
* **Si $\lambda(t) > \mu(t) \implies \frac{dQ}{dt} > 0$:** Las solicitudes llegan más rápido de lo que los servidores pueden despacharlas. La cola $Q(t)$ crece y el sistema se sobrecarga.
* **Si $\lambda(t) < \mu(t) \implies \frac{dQ}{dt} < 0$:** La capacidad supera a la demanda. Si existe cola acumulada, ésta se desahoga a una velocidad $|\lambda - \mu|$. Cuando $Q(t) = 0$, la cola permanece en cero (los servidores quedan con capacidad ociosa).
* **Si $\lambda(t) = \mu(t) \implies \frac{dQ}{dt} = 0$:** Estado estacionario o de equilibrio dinámico; la cola no cambia de tamaño.

### 2.4 Ejemplo Numérico Paso a Paso (Requisito Académico)
Supóngase que una plataforma web en reposo recibe repentinamente:
* $\lambda = 150 \text{ req/s}$
* $\mu = 100 \text{ req/s}$
* Cola inicial: $Q(0) = 0$

**Paso 1: Cálculo de la derivada instantánea:**
$$\frac{dQ}{dt} = 150 - 100 = 50 \text{ solicitudes/segundo}$$

**Paso 2: Integración durante un lapso de 10 segundos:**
$$Q(10) = Q(0) + \int_{0}^{10} 50 \, dt = 0 + 50 \times 10 = 500 \text{ solicitudes}$$

**Paso 3: Estimación de la latencia de cola:**
$$W_q(10) \approx \frac{Q(10)}{\mu} = \frac{500 \text{ solicitudes}}{100 \text{ solicitudes/s}} = 5.0 \text{ segundos}$$

**Conclusión del ejemplo:** En tan solo 10 segundos de desbalance, se han acumulado 500 solicitudes en el buffer y cualquier estudiante nuevo deberá esperar al menos 5 segundos antes de que su petición comience a ser atendida.

---

## 3. Resolución Numérica: Método de Euler

El simulador implementa el **Método de Euler hacia adelante (Forward Euler)** para integrar numéricamente la ecuación en pasos discretos $\Delta t$:

$$Q_{n+1} = \max\left(0, \; Q_n + (\lambda_n - \mu_{\text{efectiva}, n}) \cdot \Delta t\right)$$

Donde la tasa de servicio efectiva es:

$$\mu_{\text{efectiva}, n} = \min\left(\mu_n, \; \lambda_n + \frac{Q_n}{\Delta t}\right)$$

Esta formulación garantiza dos propiedades fundamentales:
1. **Conservación estricta de solicitudes:** $\text{Procesadas} + Q_{\text{final}} = \text{Recibidas}$.
2. **Frontera física:** Imposibilidad de colas negativas cuando los servidores están desocupados.

---

## 4. Política de Autoescalado Reactivo y Retrasos

El cluster opera con $N(t)$ instancias de procesamiento, donde cada instancia aporta una capacidad $\mu_{\text{instancia}}$. Por lo tanto:

$$\mu(t) = N(t) \cdot \mu_{\text{instancia}}$$

### Ciclo de Estados de Autoescalado:
1. **NORMAL:** Sistema operando con instancias base ($N_0$). La demanda $\lambda(t)$ no supera la capacidad.
2. **DETECTING:** La cola supera el umbral configurado ($Q(t) \ge Q_{\text{th}}$) o la utilización alcanza niveles críticos. Se dispara la alarma de escalado.
3. **PROVISIONING:** Representa el **retraso de arranque** ($\tau_{\text{delay}}$ entre 15 y 30 segundos) necesario para que el proveedor en la nube inicialice los recursos, instale el entorno y conecte las instancias al balanceador. Durante este tiempo, la capacidad **no** aumenta y la cola sigue creciendo según la EDO.
4. **STABILIZED:** Finalizado el retraso, se incorporan $+\Delta N$ servidores. La capacidad $\mu(t)$ aumenta por escalones. Si $\mu(t) > \lambda(t)$, la derivada se vuelve negativa ($\frac{dQ}{dt} < 0$) y la cola se evacua.
5. **COOLING_DOWN (Enfriamiento):** Cuando la demanda regresa a niveles normales, el sistema aguarda una ventana de enfriamiento (ej. 20 segundos) antes de apagar instancias redundantes, evitando el fenómeno de oscilación (*flapping*).

---

## 5. Estimación de Latencia y Limitaciones del Modelo

Para conectar la cola con la experiencia del usuario, se incorpora la aproximación de tiempo de espera en cola basada en la Ley de Little:

$$W_q(t) \approx \frac{Q(t)}{\mu(t)}$$

### Limitaciones Académicas Explícitas:
* **Modelo Continuo vs. Estocástico:** El modelo trata las solicitudes como un fluido continuo. En la realidad, las peticiones son eventos discretos y probabilísticos con distribuciones de Poisson y tiempos de servicio exponenciales ($M/M/k$).
* **Exclusión de Factores de Red:** No se incluyen tiempos de ida y vuelta (RTT), retransmisiones TCP ni negociación TLS.
* **Cuello de Botella en Base de Datos:** Se asume escalabilidad lineal de los servidores web; en arquitecturas reales, la base de datos relacional suele convertirse en el cuello de botella persistente independientemente del número de servidores web.

---

## 6. Resultados de los Escenarios Simulados

| Métrica / Comportamiento | Escenario A (Demanda Normal) | Escenario B (Pico Sin Autoescalado) | Escenario C (Pico Con Autoescalado) | Impacto del Autoescalado (B vs C) |
| :--- | :---: | :---: | :---: | :---: |
| **Tasa Máxima $\lambda_{\text{peak}}$** | 75 req/s | 240 req/s | 240 req/s | Idéntica demanda |
| **Capacidad Máxima $\mu_{\text{max}}$** | 100 req/s | 100 req/s (Fija) | 400 req/s (8 nodos) | +300% capacidad adaptada |
| **Pico Máximo de Cola $Q_{\text{max}}$** | **0 solic.** | **5,090 solic.** | **2,570 solic.** | **-49.5% de acumulación** |
| **Peor Latencia de Espera $W_{q, \text{max}}$** | **0.00 s** | **50.90 s** | **18.80 s** | **-63.1% de latencia** |
| **Tiempo de Recuperación Post-Pico** | Inmediata | &gt; 80 s (No recupera en ventana) | **7.5 s** | **Recuperación casi inmediata** |
| **Comportamiento de la EDO** | $\lambda < \mu \implies \frac{dQ}{dt} \le 0$ | $\lambda > \mu \implies \frac{dQ}{dt} = +140$ req/s | $\frac{dQ}{dt}$ se invierte a negativa al aprovisionar | Cambio de signo en la derivada |

---

## 7. Estructura del Proyecto

```
ProyectoEcuaciones_Escalado/
├── index.html                   # Entrada HTML con fuentes y estilos KaTeX
├── package.json                 # Dependencias y scripts de ejecución
├── tsconfig.json                # Configuración estricta de TypeScript
├── tailwind.config.js           # Paleta de colores tech y temas oscuros
├── verify_math.mjs              # Test suite numérico de validación matemática
├── src/
│   ├── main.tsx                 # Punto de montaje React
│   ├── App.tsx                  # Componente principal y máquina de estados
│   ├── index.css                # Directivas Tailwind y estilos de animaciones
│   ├── math/
│   │   ├── types.ts             # Definición de interfaces TypeScript
│   │   ├── eulerEngine.ts       # Motor numérico de Euler y lógica de autoescalado
│   │   └── scenarios.ts         # Parámetros oficiales de Escenarios A, B y C
│   └── components/
│       ├── Header.tsx           # Barra superior académica y selector de escenarios
│       ├── ControlPanel.tsx     # Reproductor (Play/Pause), sliders y configuración
│       ├── KpiDashboard.tsx     # 8 tarjetas de telemetría y estado del autoescalador
│       ├── ChartsSection.tsx    # 4 gráficas interactivas con Recharts
│       ├── ServerInfrastructureVisualizer.tsx # Visualizador de servidores y buffer
│       ├── ComparativeAnalysis.tsx # Módulo de análisis directo superpuesto B vs C
│       ├── MathematicalFoundation.tsx # Modal de fórmulas LaTeX y ejemplo numérico
│       ├── EnrollmentScenarioExplainer.tsx # Modal del caso universitario
│       └── MathView.tsx         # Renderizador de fórmulas matemáticas con KaTeX
```

---

## 8. Requisitos e Instrucciones de Ejecución

### Prerrequisitos:
* **Node.js**: Versión 18.0 o superior (verificado con Node v24).
* **NPM**: Gestor de paquetes incluido con Node.

### Pasos para Ejecutar Localmente:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   *La consola indicará la URL local (usualmente `http://localhost:5173/`). Abre esta dirección en tu navegador.*

3. **Verificación matemática de los cálculos:**
   ```bash
   npm run test:math
   ```
   *Ejecuta un script que corrobora la consistencia analítica de la EDO, la no-negatividad de colas y los resultados de los 3 escenarios.*

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 9. Justificación Tecnológica

* **React 18 + Vite:** Permite renderizado reactivo a 60 FPS durante la simulación temporal y recarga instantánea en desarrollo.
* **TypeScript:** Asegura tipado estricto para todas las variables físicas ($\lambda$, $\mu$, $Q$, $\frac{dQ}{dt}$, $\Delta t$), previniendo errores de dimensionalidad o inconsistencia en unidades.
* **Recharts:** Biblioteca basada en SVG para trazar series temporales con interpolación exacta de puntos de Euler y tooltips contextuales.
* **KaTeX:** Motor matemático de alto rendimiento para renderizar fórmulas en notación LaTeX directamente en la interfaz.
* **Tailwind CSS:** Diseño profesional estilo consola de monitoreo de operaciones de infraestructura tecnológica (Datadog / Grafana).

