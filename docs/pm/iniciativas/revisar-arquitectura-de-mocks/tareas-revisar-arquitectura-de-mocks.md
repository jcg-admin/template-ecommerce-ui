# Tareas: Revisar arquitectura de mocks

| Campo | Valor |
|-------|-------|
| Iniciativa | revisar-arquitectura-de-mocks |
| Tipo | Lista plana de tareas con estado |
| Fecha de creacion | 2026-05-21 |
| Total de tareas | 24 |

> **Como leer este documento.** Este es el panel operativo de la
> iniciativa. Cada fila es una tarea atomica T-NNN derivada del
> plan. La columna **Estado** se actualiza al iniciar y al cerrar
> cada tarea. La columna **Commit** se rellena con el hash corto
> tras el commit Tim Pope que la cierra.

## Tabla

| ID | Descripcion | Fase | Estado | Commit |
|----|-------------|------|--------|--------|
| T-001 | Superseder ADR previa con dec-mocks-via-msw-service-worker | 0 | hecha | (siguiente commit) |
| T-002 | Anadir verificacion de ADRs al procedimiento | 0 | hecha | (siguiente commit) |
| T-003 | Instalar msw y configurar workerDirectory | 1 | hecha | (siguiente commit) |
| T-004 | Crear src/mocks/handlers/index.ts vacio y types base | 1 | hecha | (siguiente commit) |
| T-005 | Crear src/mocks/browser.ts y src/mocks/node.ts | 1 | hecha | (siguiente commit) |
| T-006 | Integrar worker en src/index.jsx con guard NODE_ENV | 1 | hecha | (siguiente commit) |
| T-007 | Integrar server MSW en setup de Jest | 1 | hecha | (siguiente commit) |
| T-008 | Handlers de catalog (productos, categorias, busqueda) | 2 | hecha | (siguiente commit) |
| T-009 | Handlers de auth (login, register, profile, password) | 2 | hecha | (siguiente commit) |
| T-010 | Handlers de cart (cart, applyVoucher) | 2 | hecha | (siguiente commit) |
| T-011 | Handlers de payments (initiate, retry) | 2 | hecha | (siguiente commit) |
| T-012 | Handlers de inventory y returns | 2 | pendiente | |
| T-013 | Implementar conditional handler registration via *_SOURCE | 3 | pendiente | |
| T-014 | Instalar faker-js y crear factories base | 4 | pendiente | |
| T-015 | Anadir variabilidad realista a handlers de catalog y auth | 4 | pendiente | |
| T-016 | Eliminar mockInterceptor de apiService._request | 5 | pendiente | |
| T-017 | Eliminar src/mocks/mockInterceptor.js y registry.js | 5 | pendiente | |
| T-018 | Eliminar src/mocks/interceptors/ con verificacion de cobertura | 5 | pendiente | |
| T-019 | Reevaluar variables *_SOURCE en webpack DefinePlugin | 5 | pendiente | |
| T-020 | Actualizar vista-de-bloques-de-construccion | 6 | pendiente | |
| T-021 | Documentar arranque conditional via *_SOURCE en como-adaptar | 6 | pendiente | |
| T-022 | Actualizar README de la raiz si menciona el interceptor | 6 | pendiente | |
| T-023 | Producir decisiones-revisar-arquitectura-de-mocks.md | 7 | pendiente | |
| T-024 | Cerrar iniciativa formalmente | 7 | pendiente | |

## Resumen de estado

| Estado | Conteo |
|--------|--------|
| pendiente | 13 |
| en curso | 0 |
| hecha | 11 |

## Notas operativas

- **DAG**: ver diagrama mermaid en `plan-*.md`. Cada commit valida que
  las dependencias declaradas estan cerradas antes de iniciar.
- **Tests**: cada tarea que toque codigo verifica `npx tsc --noEmit`
  y `npx jest tests/unit src/redux/slices src/utils` antes de
  cerrar.
- **Build**: las tareas de Fase 1 que tocan `webpack.config.js` o
  `src/index.jsx` verifican `npm run build` exit 0.
- **Commits**: Tim Pope (subject <=50, wrap <=72). Autor:
  Nestor Monroy <46802445+NestorMonroy@users.noreply.github.com>.
- **Atomicidad**: una tarea = un commit. Si una tarea descubre
  trabajo adicional, se registra como `Hallazgo durante la
  ejecucion` en `progreso-*.md` y se evalua si replanificar.
