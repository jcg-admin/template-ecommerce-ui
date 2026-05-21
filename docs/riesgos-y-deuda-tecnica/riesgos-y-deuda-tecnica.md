# Riesgos y deuda tecnica

Inventario de riesgos vivos y deuda conocida. Cada entrada es
observable o trazable a una iniciativa de gestion. Lo que no se puede
demostrar, no se lista.

## Resumen rapido

| Entrada | Estado |
|---------|--------|
| [riesgo-divergencia-mocks-vs-contrato-real](#riesgo-divergencia-mocks-vs-contrato-real) | Delegado a `validar-contrato-de-mocks-vs-backend-real` |
| [riesgo-bundle-construido-con-API-URL-equivocada](#riesgo-bundle-construido-con-api-url-equivocada) | Resuelto en `resolver-hallazgos-de-deuda-del-template` (Fase 6) |
| [deuda-sin-typescript-en-src](#deuda-sin-typescript-en-src) | Resuelto en `resolver-hallazgos-de-deuda-del-template` (Fase 3) |
| [deuda-decorators-experimental](#deuda-decorators-experimental) | Resuelto en `resolver-hallazgos-de-deuda-del-template` (Fase 4) |
| [deuda-tipos-en-src-types](#deuda-tipos-en-src-types) | Resuelto parcialmente con delegacion a `completar-dominio-de-ecommerce` |
| [deuda-de-allowlist-color-no-hex](#deuda-de-allowlist-color-no-hex) | Delegado a `monitorear-y-reducir-allowlist-hex` |
| [deuda-readme-sin-actualizar-tras-cambios](#deuda-readme-sin-actualizar-tras-cambios) | Resuelto en T-004 de `resolver-hallazgos-de-deuda-del-template` |

Las entradas con estado "resuelto" se conservan en este documento
para que el lector que llega buscando el hallazgo encuentre tanto la
descripcion historica como la mitigacion aplicada. La regla "lo que
no se puede demostrar, no se lista" sigue valiendo: entradas sin
mitigacion verificable se retiran (caso de los 13 historicos del repo
fuente, retirados en T-001 y T-002).

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

**Estado: resuelto** en la fase 6 de la iniciativa
`resolver-hallazgos-de-deuda-del-template` (T-020 a T-023, cerrada el
2026-05-21). Mitigaciones aplicadas:

- `scripts/verify-build.mjs` mas el script npm `verify-build` permiten
  inspeccionar el bundle antes del deploy. La forma estricta es
  `npm run verify-build -- --expected=$API_URL`; falla con exit 1 si
  la URL esperada no aparece, si el bundle no contiene ninguna URL
  significativa o si encuentra `localhost` en un build de produccion.
- `window.__APP_CONFIG__` expone `{ apiUrl, version, builtAt }` en el
  bundle servido, lo que permite confirmar en runtime que el servidor
  esta sirviendo el build correcto.
- Procedimiento documentado en `docs/vista-de-despliegue/` seccion
  "Verificacion antes del deploy" y referenciado desde
  `docs/como-adaptar-este-template.md` en la checklist de adopcion.

| Campo | Valor |
|-------|-------|
| Impacto | Alto (sitio caido visible al usuario) |
| Probabilidad | Media |
| Descripcion | Como `API_URL` se inyecta en build time, construir con un `.env.production` mal configurado produce un bundle que apunta a un backend incorrecto o inexistente. El error solo aparece al desplegar. |
| Mitigacion actual | `verify-build` antes del deploy + `window.__APP_CONFIG__` despues. Documentadas en vista de despliegue y checklist de adopcion. |
| Evidencia | `scripts/verify-build.mjs`, `src/index.jsx`, `webpack.config.js#BUILT_AT`. |

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

**Estado: resuelto** en la fase 4 de la iniciativa
`resolver-hallazgos-de-deuda-del-template` (T-010 a T-014, cerrada
el 2026-05-21). Los tres decoradores (`withCaching`, `withLogging`,
`withValidation`) tienen ahora consumidores reales en el codigo del
template: `withLogging` cubre todas las requests HTTP via
`apiService._request` y los thunks que tocan credenciales en
`authSlice` (`loginUser`, `registerUser`, `changePassword`);
`withLogging + withValidation` componen sobre `initiateMercadoPagoPayment`
y `retryPayment` en `paymentsSlice`; `withValidation` sola guarda
`applyVoucher` en `cartSlice`; `withCaching` aplica TTL corto a
`searchProducts` en `catalogSlice`. Los decoradores dejan de ser
ruido en `src/decorators/` para ser una capa transversal viva.

### deuda-tipos-en-src-types

**Estado: resuelto (parcialmente) con delegacion** en la fase 5 de la
iniciativa `resolver-hallazgos-de-deuda-del-template` (T-015
replanificada, cerrada el 2026-05-21). El modulo `src/types/` ahora
contiene `domain.ts` con tipos canonicos del dominio comun del
e-commerce que el template **ya implementa** (`User`, `Category`,
`Product`, `CartItem`, `Voucher` con `VoucherType`, `Order` con
`OrderStatus`, `Toast` con `ToastKind`, `PaginatedResponse<T>`, mas
re-export del `SerializedApiError`). El modulo previo `PropShapes.ts`
y el paquete `@types/prop-types` se retiraron del repositorio.

Cada tipo lleva JSDoc explicito indicando si es **completo** o
**parcial** respecto al dominio comun. Las entidades parciales o
ausentes (`Address` como entidad reutilizable, `ProductVariant` con
sku y stock por variante, `Review` agregada, `User` extendido con
verificacion y roles granulares) se delegan a la iniciativa
[`completar-dominio-de-ecommerce`](../pm/iniciativas/completar-dominio-de-ecommerce/index.md)
registrada en backlog.

Resultado: el modulo `src/types/` deja de ser deuda inerte (un
archivo unico sin consumidores y con un contrato teorico equivocado)
y pasa a ser la fuente canonica de tipos del dominio para cualquier
consumidor `.ts`/`.tsx` del template.

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
