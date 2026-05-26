# Progreso: Habilitar MSW en modo demo

## Log

| Timestamp | Evento | Detalle |
|-----------|--------|---------|
| 2026-05-26T02:00:00 | Apertura | Iniciativa abierta. El `dist/` servido via Nginx no muestra datos. Causa identificada: MSW guardado por `NODE_ENV !== 'production'` + `mockServiceWorker.js` no copiado a `dist/`. Ambas decisiones son correctas individualmente pero combinadas impiden el modo de demostracion. Esfuerzo estimado: ~85 min en 5 fases. |
| 2026-05-26T02:00:01 | ADR revisada | Inspeccion de `docs/decisiones-de-arquitectura/`. ADR relevante: `dec-mocks-via-msw-service-worker` (Estado: Aceptada). La ADR documenta el trade-off del service worker como conocido y lista 4 mitigaciones. Ninguna cubre el caso de uso de demo sobre dist/. La ADR no se supersede; se extiende con una nota. |
| 2026-05-26T02:00:02 | Decision | Alternativa A elegida: variable `DEMO_MODE=true` que activa MSW sobre el bundle compilado mediante guard extendido en `src/index.jsx` + `copy-webpack-plugin` condicional en webpack. Completamente opt-in; un build sin `DEMO_MODE` no cambia. |
| 2026-05-26T02:05:00 | T-001 hecha | Diagnostico completo. Traza de ejecucion documentada. 3 alternativas evaluadas (DEMO_MODE, copiar siempre, solo npm run dev). DEMO_MODE elegida. 3 riesgos identificados (copy-webpack-plugin, DEMO_MODE en produccion accidental, Node 18 en distro). |
| 2026-05-26T02:15:00 | T-002 hecha | 5 documentos PM creados siguiendo el formato exacto del repo UI (index con campos Slug/Estado/Fechas/Iniciativa origen, alcance con tabla de metadata propia, analisis con diagnostico y alternativas, plan con DAG Mermaid, tareas con estado). |
| 2026-05-26T02:15:01 | F0 cerrada | F0 cerrada. 2 tareas hechas. Esfuerzo real: ~15 min. Siguiente: F1 (webpack.config.js + package.json). |
| 2026-05-26T02:20:00 | F1 iniciada | T-101, T-102, T-103, T-104 — webpack.config.js + package.json. |
| 2026-05-26T02:20:01 | T-101 iniciada | Verificar si `copy-webpack-plugin` esta en devDependencies. |
| 2026-05-26T02:21:00 | Hallazgo | `copy-webpack-plugin` NO esta en devDependencies. Hay que instalarlo. El entorno bash_tool no tiene acceso a npm install real (sin red hacia npmjs.com segun network config). Se verifica la version compatible con webpack 5 (copy-webpack-plugin >= 10). Se agrega la dependencia directamente al package.json sin ejecutar npm install — el operador debe correr `npm install` antes de `npm run build:demo`. |
| 2026-05-26T02:22:00 | T-101 hecha | `copy-webpack-plugin` no estaba en devDependencies. Agregado como `"copy-webpack-plugin": "^12.0.2"`. El operador debe ejecutar `npm install` antes de `npm run build:demo`. |
| 2026-05-26T02:23:00 | Hallazgo | `isDemoMode` debe declararse en el scope del modulo (fuera del callback de webpack), no dentro. `process.env.DEMO_MODE` se lee al cargar el modulo — consistente con como se lee `ANALYZE` en la misma linea del mismo archivo. |
| 2026-05-26T02:24:00 | T-102 hecha | `webpack.config.js` actualizado: `require('copy-webpack-plugin')` agregado, `isDemoMode` declarado en el scope del modulo, `process.env.DEMO_MODE` pasado a `DefinePlugin` via `buildDefinedEnv`. |
| 2026-05-26T02:25:00 | T-103 hecha | `CopyPlugin` condicional agregado al array `plugins`: copia `public/mockServiceWorker.js` -> `dist/mockServiceWorker.js` solo cuando `isDemoMode === true`. El `.filter(Boolean)` existente maneja el `false` cuando no esta activo. |
| 2026-05-26T02:26:00 | T-104 hecha | Script `build:demo` agregado en `package.json`: `DEMO_MODE=true webpack --mode production`. Simetrico con `build:analyze` que usa `ANALYZE=true`. |
| 2026-05-26T02:26:01 | F1 cerrada | webpack.config.js y package.json actualizados. node --check: OK. JSON.parse: OK. Siguiente: F2. |
| 2026-05-26T02:26:02 | F2 iniciada | T-201 — extender guard en src/index.jsx. |
| 2026-05-26T02:28:00 | Hallazgo | `node --check` no funciona con extension `.jsx` (Node reporta ERR_UNKNOWN_FILE_EXTENSION). Verificacion manual por inspeccion del diff — el guard es `if (process.env.NODE_ENV !== 'production' || process.env.DEMO_MODE === 'true')`. Sintaxis correcta. |
| 2026-05-26T02:28:01 | T-201 hecha | Guard extendido en `src/index.jsx`. El comentario anterior (que decia "no hay copy-webpack-plugin") fue reemplazado por documentacion actualizada que explica el doble guard: condicion de codigo + ausencia del archivo en produccion real. |
| 2026-05-26T02:28:02 | F2 cerrada | src/index.jsx actualizado. Siguiente: F3 (documentacion). |
| 2026-05-26T02:28:03 | F3 iniciada | T-301 README.md, T-302 vista-de-despliegue, T-303 ADR nota. |
| 2026-05-26T02:32:00 | T-301 hecha | `README.md` actualizado: `npm run build:demo` agregado al bloque de comandos de build. Seccion "Modo demo" agregada explicando el proposito, el comando y la diferencia con un build de produccion real. |
| 2026-05-26T02:33:00 | T-302 hecha | `docs/vista-de-despliegue/` actualizado: fila "Build demo" agregada en la tabla de configuracion por entorno con comando, variables y descripcion del comportamiento. |
| 2026-05-26T02:34:00 | T-303 hecha | `docs/decisiones-de-arquitectura/` actualizado: nota de extension agregada al campo "Trade-off del Service Worker" de `dec-mocks-via-msw-service-worker`. La ADR no se supersede — se extiende con una nota datada que explica el mecanismo DEMO_MODE y que un build sin DEMO_MODE no cambia. |
| 2026-05-26T02:34:01 | F3 cerrada | README, vista-de-despliegue y ADR actualizados. Siguiente: F4. |
| 2026-05-26T02:34:02 | F4 iniciada | T-401: verificar build:demo, T-402: verificar build sin DEMO_MODE, T-403: cierre. |
| 2026-05-26T02:38:00 | Hallazgo | Verificacion funcional de `npm run build:demo` no ejecutable en entorno bash_tool (sin node_modules). Se realiza verificacion estructural: todos los archivos tienen los cambios correctos. La verificacion funcional queda documentada como pendiente para el operador en la distro WSL2. |
| 2026-05-26T02:38:01 | T-401 hecha | Verificacion estructural: `webpack.config.js` tiene `CopyPlugin` condicional, `isDemoMode` lee `process.env.DEMO_MODE === 'true'`, `package.json` tiene script `build:demo`. `public/mockServiceWorker.js` existe (9120 bytes). |
| 2026-05-26T02:38:02 | T-402 hecha | Verificacion estructural: `CopyPlugin` solo se instancia cuando `isDemoMode === true`. El `.filter(Boolean)` elimina el `false` en builds normales. `npm run build` (sin DEMO_MODE) no activa `CopyPlugin`. |
| 2026-05-26T02:39:00 | T-403 hecha | `decisiones-*.md` creado (3 decisiones, 4 hallazgos, 10 criterios). index: Estado=Cerrada, Fecha de cierre=2026-05-26, decisiones-*.md en indice. tareas: todas Hecha. indice-de-iniciativas: `habilitar-msw-en-modo-demo` Cerrada. |
| 2026-05-26T02:39:01 | F4 cerrada | Verificacion completa (estructural). Iniciativa cerrada. |
| 2026-05-26T02:39:02 | Iniciativa cerrada | **habilitar-msw-en-modo-demo cerrada**. 5 fases, 13 tareas. Archivos producidos: webpack.config.js, src/index.jsx, package.json (copy-webpack-plugin + build:demo), README.md, docs/vista-de-despliegue/, docs/decisiones-de-arquitectura/ (ADR nota). 4 hallazgos documentados. La verificacion funcional en la distro queda pendiente para el operador. |
