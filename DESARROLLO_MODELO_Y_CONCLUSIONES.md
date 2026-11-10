# Desarrollo del modelo, aplicación y conclusiones

## 1. Propósito

Este simulador muestra, con un ejemplo académico de un servicio web, qué ocurre cuando la tasa de solicitudes entrantes supera la capacidad de procesamiento. Se comparan una operación normal, un pico sin autoescalado y el mismo pico con autoescalado reactivo.

Los valores son parámetros hipotéticos para explicar el comportamiento del sistema. No son resultados de pruebas de carga ni mediciones de una API o infraestructura real.

## 2. Modelo matemático

Se representa la cola de solicitudes pendientes mediante:

\[
\frac{dQ(t)}{dt} = \lambda(t) - \mu(t), \qquad Q(t) \geq 0
\]

Donde:

- \(Q(t)\): solicitudes pendientes en el instante \(t\).
- \(\lambda(t)\): tasa de llegada, en solicitudes por segundo.
- \(\mu(t)\): capacidad nominal de procesamiento, en solicitudes por segundo.
- \(\frac{dQ}{dt}\): cambio instantáneo de la cola, también en solicitudes por segundo.

Si \(\lambda > \mu\), la cola tiende a crecer; si \(\lambda < \mu\) y hay solicitudes pendientes, tiende a reducirse. Cuando la cola está vacía, el sistema no procesa solicitudes que aún no han llegado, por lo que \(Q\) se mantiene en cero en vez de hacerse negativa.

La capacidad depende de las instancias activas:

\[
\mu(t) = N(t)\,\mu_{\text{instancia}}
\]

En los escenarios incluidos, cada instancia procesa nominalmente 50 solicitudes por segundo y se parte de dos instancias: \(\mu(0)=100\) solicitudes por segundo.

## 3. Implementación numérica

El motor actualiza el sistema mediante el método de Euler explícito, con un paso temporal \(\Delta t=0.5\) segundos. En cada paso calcula las solicitudes que llegan, el máximo que los servidores pueden procesar y la nueva cola:

\[
A_n = \lambda_n \Delta t
\]
\[
P_n = \min\left(\mu_n\Delta t,\ Q_n + A_n\right)
\]
\[
Q_{n+1} = \max(0,\ Q_n + A_n - P_n)
\]

Aquí \(A_n\) son las solicitudes que llegan durante el intervalo y \(P_n\) las que se atienden. Esta limitación evita procesar más solicitudes de las disponibles y mantiene \(Q\geq0\). El simulador también registra la tendencia teórica \(dQ/dt=\lambda-\mu\), la cantidad atendida y la estimación de espera:

\[
W_q \approx \frac{Q}{\mu}
\]

\(W_q\) es una aproximación pedagógica del tiempo para evacuar la cola a la capacidad actual; no es una medición completa de latencia de extremo a extremo.

### Ejemplo numérico

Supóngase que llegan \(\lambda=150\) solicitudes/s y la capacidad es \(\mu=100\) solicitudes/s, con \(Q_0=0\). Mientras estas tasas se mantienen:

\[
\frac{dQ}{dt}=150-100=50\text{ solicitudes/s}
\]

En un intervalo de \(\Delta t=0.5\) s llegan 75 solicitudes y se pueden atender 50. Por tanto, quedan \(Q_1=25\) solicitudes. Si el mismo desbalance continúa durante 10 s:

\[
Q(10)\approx(150-100)\cdot10=500\text{ solicitudes}
\]
\[
W_q\approx\frac{500}{100}=5\text{ s}
\]

El ejemplo muestra cómo un exceso sostenido de demanda se convierte en cola y en mayor espera estimada.

## 4. Política de autoescalado y escenarios

Los escenarios B y C usan el mismo patrón de demanda: una base de 60 solicitudes/s y un pico máximo de 240 solicitudes/s, que comienza en \(t=20\) s y dura 40 s, con rampas de subida y bajada de 3 s. Esto permite comparar el efecto del escalado sin cambiar la demanda.

En el escenario C, la política reactiva inicia el escalado cuando la cola alcanza 35 solicitudes o cuando la utilización llega al 85 % mientras la demanda supera la capacidad. El aprovisionamiento tarda 15 s; al finalizar se agregan dos instancias, hasta un máximo de ocho. Cada aumento modifica \(\mu\) por tramos. Al normalizarse el tráfico, se aplica un periodo de enfriamiento de 20 s antes de reducir instancias.

Durante el retraso de aprovisionamiento, la capacidad existente no aumenta y la cola puede seguir creciendo. Cuando la capacidad agregada supera la demanda, el balance cambia de signo y la cola comienza a drenarse. El escenario A representa demanda controlada: base de 60 solicitudes/s, variación máxima de 75 solicitudes/s y capacidad nominal inicial de 100 solicitudes/s.

## 5. Conclusiones

1. **El equilibrio entre demanda y capacidad determina la cola.** Cuando las solicitudes llegan más rápido de lo que se atienden, la diferencia se acumula; cuanto más tiempo se mantiene, mayor puede ser la espera.
2. **El autoescalado reactivo ayuda a mitigar la saturación, pero no la elimina instantáneamente.** El sistema primero detecta el problema y espera el aprovisionamiento; por eso puede existir acumulación y latencia antes de que aumente la capacidad.
3. **Añadir capacidad permite recuperar el sistema si supera la demanda.** Una vez que \(\mu>\lambda\), los servidores pueden atender las nuevas solicitudes y reducir gradualmente las pendientes.
4. **Escalar implica un balance de recursos y rendimiento.** Más instancias pueden reducir la cola, pero también consumen más recursos. El enfriamiento ayuda a evitar cambios demasiado frecuentes cuando el tráfico fluctúa.
5. **El modelo es una herramienta de comprensión, no una predicción de producción.** Representa solicitudes como un flujo continuo y no incluye variabilidad individual, tiempos de red, fallos ni límites de bases de datos. Para dimensionar un servicio real se necesitarían mediciones y pruebas de carga.

En conjunto, la simulación permite explicar visual y cuantitativamente por qué anticipar picos, reducir el tiempo de aprovisionamiento y elegir umbrales adecuados puede mejorar la respuesta de un servicio web, sin afirmar que el autoescalado por sí solo garantice disponibilidad o latencia baja.
