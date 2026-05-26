# Plan: Habilitar MSW en modo demo

## DAG de fases

```mermaid
%%{init: {'theme':'base', 'themeVariables': {
  'background': '#0f172a',
  'primaryColor': '#1e293b',
  'primaryTextColor': '#f1f5f9',
  'primaryBorderColor': '#94a3b8',
  'lineColor': '#cbd5e1',
  'fontSize': '13px'
}}}%%
flowchart LR
    f0["<b>F0</b><br/>Analisis<br/>+ PM docs<br/><i>20 min</i>"]
    f1["<b>F1</b><br/>webpack.config.js<br/>+ package.json<br/><i>20 min</i>"]
    f2["<b>F2</b><br/>src/index.jsx<br/>guard DEMO_MODE<br/><i>10 min</i>"]
    f3["<b>F3</b><br/>Documentacion<br/><i>20 min</i>"]
    f4["<b>F4</b><br/>Verificacion<br/>y cierre<br/><i>15 min</i>"]

    f0 --> f1
    f1 --> f2
    f2 --> f3
    f3 --> f4

    classDef doneNode fill:#14532d,stroke:#4ade80,stroke-width:2px,color:#f0fdf4
    classDef stepNode fill:#1e293b,stroke:#60a5fa,stroke-width:2px,color:#f1f5f9

    class f0 doneNode
    class f1,f2,f3,f4 stepNode
```

## F0 - Analisis + PM docs (20 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-001 | Diagnosticar por que el dist/ no carga datos; evaluar alternativas; decidir DEMO_MODE | 10 min |
| T-002 | Crear 5 documentos PM siguiendo el formato del repo UI | 10 min |

**Entregables**: 5 archivos PM en `habilitar-msw-en-modo-demo/`.

## F1 - webpack.config.js + package.json (20 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-101 | Verificar si `copy-webpack-plugin` esta en devDependencies; instalar si no | 3 min |
| T-102 | Leer `DEMO_MODE` del entorno en `webpack.config.js` y pasarlo a `DefinePlugin` | 5 min |
| T-103 | Agregar `copy-webpack-plugin` condicional en webpack: copia `mockServiceWorker.js` a `dist/` solo cuando `DEMO_MODE=true` | 7 min |
| T-104 | Agregar script `build:demo` en `package.json` | 5 min |

**Entregables**: `webpack.config.js` y `package.json` actualizados.

## F2 - src/index.jsx guard DEMO_MODE (10 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-201 | Extender el guard en `src/index.jsx`: MSW arranca si `NODE_ENV !== 'production'` O si `DEMO_MODE === 'true'` | 10 min |

**Entregables**: `src/index.jsx` con guard extendido.

## F3 - Documentacion (20 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-301 | Actualizar `README.md`: agregar seccion de modo demo con `npm run build:demo` | 10 min |
| T-302 | Actualizar `docs/vista-de-despliegue/`: agregar fila "Build demo" en tabla de entornos | 5 min |
| T-303 | Agregar nota de extension en `docs/decisiones-de-arquitectura/` en la ADR `dec-mocks-via-msw-service-worker` | 5 min |

**Entregables**: README, vista-de-despliegue y ADR actualizados.

## F4 - Verificacion y cierre (15 min)

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| T-401 | Verificar que `npm run build:demo` produce `dist/` con `mockServiceWorker.js` | 5 min |
| T-402 | Verificar que `npm run build` sin `DEMO_MODE` NO copia `mockServiceWorker.js` | 3 min |
| T-403 | Crear `decisiones-habilitar-msw-en-modo-demo.md`; actualizar index e indice de iniciativas; commit de cierre | 7 min |

**Entregables**: `decisiones-*.md`; iniciativa cerrada.
