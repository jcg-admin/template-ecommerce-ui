# Riesgos y deuda tecnica

Inventario de riesgos vivos y deuda conocida. Cada entrada es
observable o trazable a una iniciativa de gestion. Lo que no se puede
demostrar, no se lista.

## Riesgos abiertos

### riesgo-divergencia-mocks-vs-contrato-real

| Campo | Valor |
|-------|-------|
| Estado | **Delegado a iniciativa propia** `validar-contrato-de-mocks-vs-backend-real` (proxima iniciativa tras `resolver-hallazgos-de-deuda-del-template`). |
| Fecha de delegacion | 2026-05-20 |
| Razon | Alcance excede una iniciativa de limpieza unitaria: las opciones reales (schema por endpoint con ajv/zod, generador desde OpenAPI compartido, smoke tests contra staging) requieren cada una su propio diseno y, en algunos casos, coordinacion con el repositorio del backend. |
| Impacto | Alto |
| Probabilidad | Alta |
| Descripcion | Los mocks de `src/mocks/` pueden divergir del contrato real del backend sin que ningun test lo detecte. Un cambio en la API de Django (anadir campo, cambiar tipo de un enum, renombrar) deja el UI roto en `real` pero verde en `mock`. |
| Mitigacion actual | Ninguna automatica. Solo revisiones manuales. |
| Mitigacion propuesta | Definida en la iniciativa delegada. |
| Evidencia | Estructura de mocks en `src/mocks/`, ausencia de tests de contrato en `tests/`. |

### riesgo-bundle-construido-con-API-URL-equivocada

| Campo | Valor |
|-------|-------|
| Impacto | Alto (sitio caido visible al usuario) |
| Probabilidad | Media |
| Descripcion | Como `API_URL` se inyecta en build time, construir con un `.env.production` mal configurado produce un bundle que apunta a un backend incorrecto o inexistente. El error solo aparece al desplegar. |
| Mitigacion actual | El commit `c9c3465` (rama pendiente) corrigio un bug de resolucion silenciosa. No hay validacion adicional. |
| Mitigacion propuesta | Smoke test post-build que verifique que el bundle contiene la `API_URL` esperada. |
| Evidencia | `webpack.config.js`, ver `decisiones-de-arquitectura/` entrada `dec-api-url-resuelta-en-build-time`. |

## Deuda tecnica conocida

### deuda-sin-typescript-en-src

**Estado: resuelto** en la fase 3 de la iniciativa
`resolver-hallazgos-de-deuda-del-template` (T-005, T-006, T-007,
T-008, T-009, cerrada el 2026-05-20). El stack TypeScript instalado
en `devDependencies` deja de ser deuda inerte: el template ahora
soporta `.ts` y `.tsx` end to end (tsconfig.json, babel preset,
jest), y dos modulos compartidos (`PropShapes` y `serializeApiError`)
ya estan migrados como prueba de la cadena. Las migraciones
adicionales de slices, hooks, paginas o componentes se ejecutan a
discrecion en iniciativas propias cuando aporten valor; el toolchain
deja de bloquearlas.

### deuda-decorators-experimental

`src/decorators/` tiene 4 archivos sin documentacion. Su uso real en
el codigo es opaco — requiere busqueda manual para confirmar si se
importan desde produccion o son legado.

- Tarea: auditar uso, decidir mantener o eliminar.

### deuda-tipos-en-src-types

`src/types/` tiene un solo archivo. O bien es legado de una migracion
incompleta a TypeScript, o es algo intencionalmente unico. No hay
documentacion que lo explique.

### deuda-de-allowlist-color-no-hex

**Estado: delegado a iniciativa propia** `monitorear-y-reducir-allowlist-hex`
(segunda iniciativa tras `resolver-hallazgos-de-deuda-del-template`).
Fecha de delegacion: 2026-05-20.

Razon de la delegacion: la combinacion de un bloqueador mecanico en
pre-push con un ritual trimestral documentado constituye una unidad
de trabajo cohesiva propia que merece su propia iniciativa con
alcance, analisis, tareas, progreso y decisiones de cierre.

PR #4 redujo los `#hex` literales de 525 a 17, todos en allowlist.
Cada entrada de allowlist tiene justificacion. Tarea continua:
mantener la allowlist plana o decreciente, no creciente.

- Disparador de revision: cada nuevo `#hex` agregado.

### deuda-readme-sin-actualizar-tras-cambios

**Estado: resuelto** en T-004 de la iniciativa
`resolver-hallazgos-de-deuda-del-template` (2026-05-20). El
`README.md` raiz ahora tiene una seccion "Documentacion" estructurada
en cuatro grupos: punto de entrada para adoptantes
(`como-adaptar-este-template.md`), arquitectura (indice arc42 en
`docs/README.md`, decisiones, riesgos y deuda), project management
(`pm/` y su indice de iniciativas), y pipeline de estilos
(documentos `scss-*`).

## Como agregar una entrada a este documento

Cada entrada se nombra `riesgo-<slug>` o `deuda-<slug>`. Slug
autoexplicativo. Sin numeracion.

Para riesgos: rellenar los siete campos (Impacto, Probabilidad,
Descripcion, Mitigacion actual, Mitigacion propuesta, Evidencia, y
opcionalmente Decision asociada en `decisiones-de-arquitectura/`).

Para deuda: descripcion + decision pendiente + bloqueante o no.

Una entrada se elimina **solo cuando la mitigacion se ejecuta**. Si
el riesgo simplemente "se asume", se reescribe la entrada para
declarar que esta aceptado y por que.
