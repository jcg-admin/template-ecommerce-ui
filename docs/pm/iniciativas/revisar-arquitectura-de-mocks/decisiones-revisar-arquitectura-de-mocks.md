# Decisiones — `revisar-arquitectura-de-mocks`

| Campo | Valor |
|-------|-------|
| Iniciativa | `revisar-arquitectura-de-mocks` |
| Documento | Decisiones de diseno, hallazgos durante la ejecucion, verificacion post-ejecucion y entrega |
| Estado de la iniciativa al producir este documento | Cerrandose (T-023 de la propia iniciativa) |
| Fecha de cierre | 2026-05-21 |

Este documento es obligatorio segun PROC-GESTION-001 para iniciativas
que cierran su ciclo. Cumple cuatro secciones:

1. **Decisiones de diseno** tomadas y formalizadas durante la
   iniciativa, mas alla del alcance de implementacion.
2. **Hallazgos durante la ejecucion** que no estaban previstos en el
   plan y se resolvieron sin pausar.
3. **Verificacion post-ejecucion**: estado del codigo, tests, build,
   ADR y documentacion al cierre.
4. **Que entrega esta iniciativa**: artefactos concretos.

## Seccion 1 — Decisiones de diseno

### dec-mocks-via-msw-service-worker (decision arquitectonica)

Sustituir el patron de mocks heredado (`mockInterceptor.js` con rama
`if (USE_MOCK)` en `apiService._request`) por handlers MSW que
interceptan a nivel de red. El codigo de produccion queda agnostico
del modo mock. Formalizada como ADR en
`docs/decisiones-de-arquitectura/decisiones-de-arquitectura.md`:

- Nueva ADR: `dec-mocks-via-msw-service-worker` (Aceptada). Incluye
  los 11 campos canonicos: contexto, decision, alternativas
  consideradas, criterios de evaluacion, decision, consecuencias
  positivas y negativas, trade-off del Service Worker, origen,
  supersede.
- ADR superseded: `dec-mock-first-via-feature-flags-por-dominio`. La
  nota de supersede explica que la premisa original ("MSW complica el
  setup de Jest") era cierta para MSW v1 (2022) pero exagerada en
  2026 con MSW v2: la integracion con Jest se resuelve con cuatro
  ajustes documentados de `jest.config.cjs` y `jest.setup.js`.

T-001 ejecuto el supersede formal antes de cualquier tarea de codigo.

### dec-camino-b-rup-adaptado

Tres caminos se evaluaron antes de empezar:

- **Camino A**: convivencia. Anadir MSW al lado del interceptor sin
  retirarlo. Descartado: deja deuda arquitectonica viva.
- **Camino B**: superseder ADR + migrar a MSW + Faker, retirando el
  interceptor por completo. **Aprobado por el usuario.**
- **Camino C**: solo documentar la decision sin tocar codigo.
  Descartado: la iniciativa nacio precisamente para resolver el
  acoplamiento.

Camino B es la decision rectora de la iniciativa. La materializa la
secuencia T-003 a T-019.

### dec-conditional-handler-registration-via-source-flags (3a-ii)

Conservar las variables `*_SOURCE` (`CATALOG_SOURCE`, `AUTH_SOURCE`,
`CART_SOURCE`, `PAYMENTS_SOURCE`, `PROFILE_SOURCE`) **como switch del
registro de handlers**, no como condicional en codigo de produccion.

- Si la flag es `mock`, el handler del dominio se anade al array
  devuelto por `buildHandlers()` y el worker/server lo registra.
- Si la flag es `real`, el handler no se anade. La request HTTP sale
  al backend definido por `API_URL`.

El codigo de produccion (paginas, slices, `apiService`) no lee estas
flags para alterar su flujo. El badge "Modo mock activo" que algunas
paginas muestran solo lee la flag como senalizacion visual.

Materializada por T-013.

### dec-tests-embebidos-eliminados-verificando-cobertura (3b-iii)

Los cuatro archivos de `src/mocks/interceptors/`
(`inventory.js`, `inventory.test.js`, `returns.js`, `returns.test.js`,
total 580 lineas) se eliminan en T-018. **Antes** de eliminarlos, los
19 casos de tests embebidos se portan a un archivo nuevo
`tests/unit/mocks/handlers.test.js` que ejercita los mismos
escenarios pero **a traves de fetch real interceptado por MSW
server**. La cobertura no se pierde; mejora (los casos ahora prueban
el contrato HTTP, no solo la funcion interna del interceptor).

### dec-opcion-b-paginas-refactorizadas (precedente fuerte)

Durante T-017, al inspeccionar consumidores de `@mocks/registry`
aparecio que tres paginas (`LoginPage`, `ProfilePage`, `AccountPage`)
usaban un anti-patron: `if (USE_MOCK) { loadMock; dispatch fulfilled }`
que saltaba el thunk real completo.

La propuesta inicial (Opcion A) era sustituir `loadMock` por literales
locales en cada pagina. Respetaba el alcance estricto pero
**preservaba el anti-patron**, contradiciendo la ADR
`dec-mocks-via-msw-service-worker`.

**El usuario corrigio** apuntando a Opcion B: refactorizar las
paginas para que despachen siempre el thunk real, dejando que MSW
intercepte cuando aplica. La correccion quedo como **precedente
fuerte de la iniciativa**: cuando el codigo de produccion conoce el
mock, se refactoriza; no se preserva anti-patron heredado bajo
argumento de alcance.

El precedente se respeto consistentemente: en T-019 aparecieron tres
paginas auth mas (`ForgotPasswordPage`, `ResetPasswordPage`,
`RegisterPage`) con el mismo anti-patron. Se refactorizaron sin
pausar, dentro del alcance de "reevaluar las flags `*_SOURCE`",
porque reevaluarlas exigia mapear todos los consumers y dejar tres
con el anti-patron contradeceria la ADR.

### dec-enmienda-procedimiento-verificar-adrs

La iniciativa nacio sin verificar la ADR previa sobre el mismo tema
(`dec-mock-first-via-feature-flags-por-dominio`). Eso obligo a anadir
un paso 2 nuevo al procedimiento de gestion de iniciativas:

> Antes de proponer una iniciativa que cambie un patron
> arquitectonico, verificar si existe una ADR previa sobre el mismo
> tema. Si existe, decidir entre (a) cumplirla, (b) superseder con
> nueva ADR, o (c) reabrir la decision con analisis nuevo.

Formalizada en T-002 sobre `docs/pm/como-gestionar-iniciativas.md`.

## Seccion 2 — Hallazgos durante la ejecucion

Siete hallazgos registrados en `progreso-*.md` durante la ejecucion.
Todos se resolvieron sin pausar la iniciativa.

### hallazgo-dos-prefijos-de-paths-coexisten

El template arrastra dos familias de paths para auth:
`/api/v1/auth/...` (que usa `authSlice.js`) y `/api/auth/...` y
`/api/token/` (que mockeaba el interceptor heredado). Como
`USE_MOCK` saltaba el thunk completo, el desajuste nunca se
manifestaba.

**Resolucion sin pausar**: en T-017 se ampliaron los handlers de auth
para cubrir ambas familias durante la transicion. La consolidacion a
una sola familia queda como deuda registrada para la iniciativa de
backlog `completar-dominio-de-ecommerce`.

### hallazgo-alias-types-colisiona-con-definitely-typed

El alias TypeScript `@types/*` -> `src/types/*` colisiona con la
resolucion automatica de paquetes `@types/...` de DefinitelyTyped.
Aparecio cuando T-004 quiso importar `Product` desde
`src/types/domain.ts`.

**Resolucion sin pausar**: import relativo `../../types/domain` desde
`src/mocks/handlers/types.ts`. Deuda menor, no merece tocar el alias.

### hallazgo-msw-v2-jest-requisitos-mas-de-uno

MSW v2 en Jest requiere cuatro ajustes simultaneos:
`customExportConditions`, polyfills `undici`/`node:*` en
`jest.setup.js`, `transformIgnorePatterns` ampliado a ocho paquetes
de la familia MSW, inclusion de `.mjs` en el patron `transform`, y
`forceExit: true`.

**Resolucion sin pausar**: aplicado en T-007. La premisa original de
la ADR superseded ("MSW complica el setup de Jest") era razonable en
MSW v1 pero **exagerada para MSW v2**: cuatro ajustes documentados de
configuracion no son un coste alto.

### hallazgo-types-node-requiere-tsconfig-types

`buildHandlers()` lee `process.env`, lo que requiere tipos de Node.
El campo `types` no estaba declarado en `tsconfig.json` y el alias
`@types/*` (para `src/types/*`) interfiere con la resolucion
automatica de `@types/node`.

**Resolucion sin pausar**: instalar `@types/node` y anadir
`"types": ["node"]` al `compilerOptions`. La alternativa de cast
`(globalThis as any).process?.env` se descarto por deuda en codigo y
falta de escalabilidad. Esta es la mejor decision: alinea con la
disciplina de tipos del proyecto.

### hallazgo-faker-v10-es-esm-puro

Faker v10 publica ESM puro y `babel-jest` no lo transpila por
defecto. Activacion de factories provoco que los 184 tests fallaran
con `SyntaxError: Cannot use import statement outside a module`.

**Resolucion sin pausar**: anadir `@faker-js` al
`transformIgnorePatterns` de `jest.config.cjs`. Mismo patron ya en
uso para los paquetes MSW.

### hallazgo-markresourcetiming-undici-jsdom

Al eliminar la rama del `mockInterceptor` en `apiService._request`,
los 4 tests de `tests/unit/services/apiService.test.js` que mockean
`@mocks/mockInterceptor` con `jest.mock` quedaron sin efecto y la
request real escapo a jsdom + undici, fallando con
`TypeError: markResourceTiming is not a function`.

**Resolucion sin pausar**: reescribir el test con
`server.use(http.all('https://api.test/*', ...))` en `beforeEach`,
patron canonico de MSW. El test sigue probando la integracion
`withLogging` sin acoplarse al mecanismo interno de mock.

### hallazgo-anti-patron-en-seis-paginas-no-en-tres

El analisis inicial detecto el anti-patron `if (USE_MOCK)` en tres
paginas (`LoginPage`, `ProfilePage`, `AccountPage`). T-019, al mapear
todos los consumers de `*_SOURCE`, expuso tres mas en `auth/`:
`ForgotPasswordPage`, `ResetPasswordPage`, `RegisterPage`. Total: seis
paginas afectadas, no tres.

**Resolucion sin pausar**: aplicar el precedente de Opcion B a las
tres adicionales dentro del alcance de T-019. Justificacion:
reevaluar las flags exige mapear consumers; dejar tres con
anti-patron contradeceria la ADR. Subhallazgo: dos de esas paginas
(`ForgotPasswordPage`, `ResetPasswordPage`) usan `fetch` directo en
vez de `apiService`. MSW intercepta ambas igual, pero la
inconsistencia es deuda registrada para
`completar-dominio-de-ecommerce`.

## Seccion 3 — Verificacion post-ejecucion

### Estado del codigo

- `src/mocks/mockInterceptor.js` ELIMINADO (T-017).
- `src/mocks/registry.js` ELIMINADO (T-017).
- `src/mocks/interceptors/` SUBARBOL ELIMINADO (T-018, 4 archivos,
  580 lineas).
- `src/services/apiService.js` NO conoce mocks (T-016). La rama
  `mockInterceptor.intercept` y su import fueron eliminados.
- `src/pages/auth/*` (6 paginas) refactorizadas para despachar
  siempre el thunk real o hacer `fetch` siempre (T-017 + T-019).
- `src/mocks/handlers/*.ts` con 6 archivos por dominio + index +
  types. Total 33 handlers HTTP.
- `src/mocks/factories/*.ts` con 6 archivos (index + 5 entidades).
- `webpack.config.js#defaultFlags` extendido con `PROFILE_SOURCE`.
- `tsconfig.json` con `"types": ["node"]` y `@types/node` instalado.
- `package.json` con `@faker-js/faker@^10.4.0` y dev deps de MSW
  declarados.

### ADR

- `dec-mock-first-via-feature-flags-por-dominio`: **Superseded** por
  `dec-mocks-via-msw-service-worker`.
- `dec-mocks-via-msw-service-worker`: **Aceptada**. 11 campos
  canonicos.

### Tests

- 28 suites, **203 tests verdes**. Crecimiento neto: 184 -> 203 (+19
  por el port de los tests embebidos del interceptor a
  `tests/unit/mocks/handlers.test.js`).
- `npx tsc --noEmit`: exit 0.

### Build

- `npm run build`: exit 0.
- `npm run verify-build`: exit 0. Solo expone
  `https://api.example.com` en el bundle de produccion. Las URLs
  sandbox de MercadoPago y PayPal que el interceptor heredado
  filtraba al bundle ya no aparecen (viven solo en handlers que
  webpack tree-shake fuera de produccion).
- `grep -lE "mockInterceptor|loadMock|registry\.js|setupWorker"` en
  `dist/main.*.js`: **cero matches**. El bundle de produccion no
  contiene rastro de la capa mock.

### Plan vs ejecucion

- Plan original: 24 tareas en 8 fases, ~645 min estimados.
- Ejecucion: 24 tareas cerradas. Sin tareas anadidas ni eliminadas.
- Hallazgos: 7 documentados, todos resueltos sin pausar.
- Cambios de alcance formales: 0. Lo que parecia un cambio de alcance
  (las tres paginas extra en T-019) se aplico bajo el precedente
  de la decision `dec-opcion-b-paginas-refactorizadas` ya formalizada
  en T-017.

### Documentacion arc42

Tres documentos sincronizados con la nueva arquitectura (T-020,
T-021, T-022):

- `docs/vista-de-bloques-de-construccion/vista-de-bloques-de-construccion.md`
- `docs/como-adaptar-este-template.md`
- `README.md`

### Procedimiento mejorado

`docs/pm/como-gestionar-iniciativas.md` extendido con el paso 2 nuevo
de verificacion de ADRs previas (T-002).

## Seccion 4 — Que entrega esta iniciativa

Cuatro entregables concretos verificables en el repo:

1. **Arquitectura de mocks via MSW** funcionando en dev y test, con
   33 handlers tipados por dominio, 5 factories Faker, conditional
   handler registration via `*_SOURCE`, y produccion limpia de
   cualquier rastro de la capa mock.

2. **Decision arquitectonica formalizada como ADR**
   (`dec-mocks-via-msw-service-worker`) con la ADR previa supersedida
   correctamente. Trazabilidad completa entre la ADR, el alcance de
   la iniciativa y los commits que la materializan.

3. **Documentacion arc42 actualizada** a tres niveles: la vista de
   bloques (detalle), la guia de adopcion (operativa), y el README
   (resumen). Un visitante que entra al repo y un adoptante que
   forka el template ven la misma arquitectura.

4. **Procedimiento de gestion de iniciativas mejorado** con el paso
   de verificacion de ADRs previas. La proxima iniciativa que toque
   un patron arquitectonico no podra empezar sin pasar ese cheque.

Deuda registrada para iniciativas siguientes:

- `completar-dominio-de-ecommerce`: consolidar las dos familias de
  paths auth (`/api/v1/auth/` vs `/api/auth/`); unificar `fetch`
  directo vs `apiService`; resolver la divergencia tipo Product vs
  shapes que los consumers leen (`price`, `original_price`, etc.).
- `validar-contrato-de-mocks-vs-backend-real` (precedida por esta
  iniciativa): verificar que los shapes que los handlers MSW devuelven
  coinciden con los del backend Django cuando este disponible.
