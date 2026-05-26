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
