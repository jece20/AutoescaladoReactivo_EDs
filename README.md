# Simulador de tráfico y autoescalado reactivo

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2-22B5BF)
![KaTeX](https://img.shields.io/badge/KaTeX-0.16-21759B)

Simulador web académico e interactivo para visualizar cómo los picos de solicitudes afectan la cola y la latencia estimada de un servicio, y cómo responde una política de autoescalado reactivo.

La aplicación presenta la ecuación de balance, animación del flujo de solicitudes, métricas y comparación entre tres escenarios. Los valores son hipotéticos y sirven para explicar el modelo; no representan mediciones de servidores reales.

## Escenarios

| Escenario | Demanda | Autoescalado | Qué muestra |
|---|---|---|---|
| A · Demanda normal | 60 req/s, con variación hasta 75 req/s | No | Operación con capacidad suficiente |
| B · Pico sin escalado | Pico de 240 req/s | No | Crecimiento de la cola cuando la demanda supera la capacidad fija |
| C · Pico con escalado | El mismo pico de 240 req/s | Sí | Detección, demora de aprovisionamiento y drenaje posterior de la cola |

## Tecnologías

- **React 18** y **TypeScript** para la interfaz y la lógica.
- **Vite 5** para desarrollo y compilación.
- **Tailwind CSS** y CSS para estilos y diseño adaptable.
- **Recharts** para gráficas.
- **KaTeX** para notación matemática.
- **Lucide React** para iconografía.

## Requisitos

- Node.js 18 o posterior.
- npm.

## Ejecución local

```bash
npm install
npm run dev
```

Vite muestra en la terminal la dirección local para abrir el simulador.

## Verificación

```bash
npm run test:math
npm run build
```

## Documentación del modelo

Consulta [DESARROLLO_MODELO_Y_CONCLUSIONES.md](./DESARROLLO_MODELO_Y_CONCLUSIONES.md) para ver la formulación, su implementación numérica, los escenarios y las conclusiones académicas.
