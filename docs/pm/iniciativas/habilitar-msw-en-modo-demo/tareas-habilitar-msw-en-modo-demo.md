# Tareas: Habilitar MSW en modo demo

## F0 - Analisis + PM docs (20 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-001 | Diagnosticar por que el dist/ no carga datos; evaluar alternativas; decidir DEMO_MODE | Hecha |
| T-002 | Crear 5 documentos PM siguiendo el formato del repo UI | Hecha |

## F1 - webpack.config.js + package.json (20 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-101 | Verificar `copy-webpack-plugin` en devDependencies; instalar si no | Hecha |
| T-102 | Leer `DEMO_MODE` en `webpack.config.js` y pasar a `DefinePlugin` | Hecha |
| T-103 | `copy-webpack-plugin` condicional: copiar `mockServiceWorker.js` solo con `DEMO_MODE=true` | Hecha |
| T-104 | Script `build:demo` en `package.json` | Hecha |

## F2 - src/index.jsx guard DEMO_MODE (10 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-201 | Guard extendido: MSW arranca si `NODE_ENV !== production` O `DEMO_MODE === true` | Hecha |

## F3 - Documentacion (20 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-301 | `README.md`: seccion modo demo con `npm run build:demo` | Hecha |
| T-302 | `docs/vista-de-despliegue/`: fila "Build demo" en tabla de entornos | Hecha |
| T-303 | `docs/decisiones-de-arquitectura/`: nota de extension en ADR `dec-mocks-via-msw-service-worker` | Hecha |

## F4 - Verificacion y cierre (15 min)

| ID | Descripcion | Estado |
|----|-------------|--------|
| T-401 | `npm run build:demo` produce `dist/mockServiceWorker.js` | Hecha (verificacion estructural; funcional pendiente en distro) |
| T-402 | `npm run build` sin `DEMO_MODE` NO copia `mockServiceWorker.js` | Hecha (verificacion estructural) |
| T-403 | `decisiones-*.md`; cerrar index e indice; commit de cierre | Hecha |
