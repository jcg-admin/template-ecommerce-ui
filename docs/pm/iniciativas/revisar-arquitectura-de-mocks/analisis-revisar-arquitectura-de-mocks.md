# Analisis: Revisar arquitectura de mocks

| Campo | Valor |
|-------|-------|
| Iniciativa | revisar-arquitectura-de-mocks |
| Estado | En analisis |
| Version | 0.1.0 |
| Fecha de creacion | 2026-05-21 |

Este documento evalua las **9 alternativas** declaradas en
`alcance-revisar-arquitectura-de-mocks.md` contra los **7 criterios**
del template. Cada alternativa lleva: descripcion tecnica precisa,
estado de madurez (con datos web 2026), aplicacion al caso del
template, evaluacion contra cada criterio, y veredicto.

Al final: tabla comparativa resumen y recomendacion.

---

## Estado actual de partida (referencia para todas las alternativas)

Esta seccion describe el terreno real, no una alternativa. Sirve como
base de comparacion.

**Codigo del mock**:
- `src/mocks/mockInterceptor.js` (319 lineas): orquestador principal,
  contiene la logica de seleccion de respuesta por URL+metodo+body.
- `src/mocks/registry.js` (155 lineas): registro de datos fake
  (productos, ordenes, usuarios) hardcoded.
- `src/mocks/interceptors/inventory.js` + `returns.js` (364 lineas
  con tests embebidos): sub-interceptores para dominios especificos.

**Activacion**:
- `webpack.config.js` define defaults `CATALOG_SOURCE=mock`,
  `AUTH_SOURCE=mock`, `CART_SOURCE=mock`, `PAYMENTS_SOURCE=mock`.
- `apiService._request` (linea 76) llama `mockInterceptor.intercept`
  antes de cualquier fetch real. Si el interceptor devuelve algo,
  retorna eso; si devuelve null, continua con el fetch real.

**Total del aparato**: ~1054 lineas de codigo + datos + tests, todo
en `src/mocks/`. Funciona y los 184 tests del template lo prueban.

---

## alt-mantener-interceptor-actual

### Descripcion

Status quo. No tocar `src/mocks/`. Documentar mejor el contrato
(opcionalmente anadir validacion contra `src/types/domain.ts` ya
producido), pero conservar el interceptor dentro de `apiService.js`.

### Madurez

No aplica: es el codigo del propio template. Activo, probado, sin
deuda conocida mas alla de "acopla codigo de produccion".

### Aplicacion al template

Cambio cero. La iniciativa cerrada con T-015 dejo
`src/types/domain.ts` como contrato canonico; este enfoque anadiria
solo una pasada de tipado sobre los archivos del registry y los
interceptores (renombrar `.js` a `.ts`, tipar `Product`, `Order`,
etc.). Ningun cambio arquitectonico.

### Evaluacion por criterio

| Criterio | Resultado |
|----------|-----------|
| Adoptable por terceros | **Cumple**. `npm install && npm run dev` ya funciona hoy. Cero pasos extra. |
| No acopla codigo de produccion | **Falla**. `apiService._request` llama explicitamente `mockInterceptor.intercept`; el codigo cliente sabe que existe el modo mock. |
| Trazabilidad con el dominio | **Cumple**. JavaScript plano, modificable manualmente, sin generadores opacos. |
| Compatible con Jest | **Cumple**. Los 184 tests existentes lo prueban. |
| Compatible con migracion progresiva a TS | **Cumple**. Renombrar a `.ts` y tipar contra `domain.ts` es trivial. |
| Sin dependencias pesadas | **Cumple**. Cero dependencias adicionales. |
| Posibilidad de validar contra contrato | **Parcial**. Validar contra `domain.ts` se puede hacer; validar contra el contrato del backend real (DRF) requiere trabajo manual entrada por entrada. |

### Veredicto

**Viable como linea base.** Es la opcion mas barata. Su debilidad
unica es el acoplamiento con el codigo de produccion: el `if`
implicito en `apiService._request` permanece. Si el template
prioriza estabilidad sobre limpieza arquitectonica, esta es la
opcion.

---

## alt-msw-service-worker

### Descripcion

[Mock Service Worker](https://mswjs.io/) (MSW) intercepta HTTP/fetch
y XHR al **nivel de red**: en el navegador via Service Worker, en
Node.js via interceptor del modulo `http`. El codigo cliente
(`apiService.js`) hace requests reales; MSW los captura antes de
salir y devuelve respuestas mock segun handlers declarativos. El
mismo handler funciona en dev y en tests Jest.

### Madurez (datos web 2026)

- **Version actual**: v2.14.6 (publicada 9 dias antes de esta busqueda).
- **GitHub stars**: 17,925.
- **npm weekly downloads**: 4.88M-6.92M segun la fuente.
- **Recomendada explicitamente** por React Testing Library, Storybook,
  Playwright, Stripe, Spotify, GitHub.
- Apidog 2026 la describe como "industry standard 2026".
- Drupal migro de MirageJS a MSW citando como razon "downloads 280k
  vs 2.8M weekly".

### Aplicacion al template

1. Anadir `msw` a `devDependencies`.
2. `npx msw init public/ --save` genera `public/mockServiceWorker.js`.
3. Convertir `src/mocks/registry.js` + interceptores en **handlers
   MSW** tipados contra `src/types/domain.ts`:
   ```ts
   import { http, HttpResponse } from 'msw';
   import type { Product } from '@types/domain';
   export const handlers = [
     http.get('/api/v1/catalog/products/', () =>
       HttpResponse.json<{ results: Product[] }>({ results: [...] })
     ),
   ];
   ```
4. En `src/index.jsx`, arrancar el worker solo en dev:
   ```ts
   if (process.env.NODE_ENV === 'development') {
     const { worker } = await import('./mocks/browser');
     await worker.start();
   }
   ```
5. En setup de Jest, `setupServer(...handlers)` para tests.
6. **Eliminar** `mockInterceptor.intercept` de `apiService._request`.
   El cliente vuelve a ser un cliente HTTP plano.

### Evaluacion por criterio

| Criterio | Resultado |
|----------|-----------|
| Adoptable por terceros | **Cumple**. `npm install` instala MSW; el Service Worker se inicia desde el codigo, sin pasos manuales para el adoptante. |
| No acopla codigo de produccion | **Cumple plenamente**. `apiService.js` no sabe que existe el mock. La logica de mock vive en `src/mocks/handlers.ts`. |
| Trazabilidad con el dominio | **Cumple**. Cada handler es codigo TS plano contra `domain.ts`; modificable manualmente. |
| Compatible con Jest | **Cumple**. `msw/node` esta disenado exactamente para esto; los 184 tests funcionarian con minimal refactor. |
| Compatible con migracion progresiva a TS | **Excelente**. MSW v2 es TS-nativo. Los handlers tipan contra `domain.ts` directamente. |
| Sin dependencias pesadas | **Cumple**. Una dep npm (~3.5MB instalado), cero runtime Java/Docker. |
| Posibilidad de validar contra contrato | **Excelente**. La proxima iniciativa puede comparar handlers MSW vs OpenAPI con tooling estandar. |

### Veredicto

**Mejor opcion arquitectonica.** Cumple los 7 criterios, varios con
nota excelente. Es la opcion estandar del ecosistema en 2026. El
cambio sobre el codigo del template es contenido (eliminar el
acoplamiento de `apiService` con `mocks/`, mover registry a
handlers) y produce un resultado significativamente mas limpio.

---

## alt-json-server

### Descripcion

[json-server](https://github.com/typicode/json-server) levanta un
servidor HTTP separado (por defecto en `localhost:3000`) que sirve
respuestas REST CRUD a partir de un archivo `db.json`. Soporta filtros,
paginacion y rutas custom en `routes.json`.

### Madurez (datos web 2026)

- **Version actual**: v1.0.0-beta.3.
- **GitHub stars**: 73,896.
- **npm weekly downloads**: 315k.
- Muy popular en prototipado rapido; mantenido pero menos activo que
  MSW (un orden de magnitud menos en downloads).
- Documentacion oficial de MSW lo critica explicitamente:
  *"downsides: spawn designated server, route traffic to it, use
  abstract API to define routes, etc."*

### Aplicacion al template

1. Anadir `json-server` a `devDependencies`.
2. Volcar `registry.js` a `db.json`.
3. Anadir `npm script` que arranque el servidor:
   `"mock-api": "json-server --watch db.json --port 3001"`.
4. Cambiar `API_URL` a `http://localhost:3001` en modo dev.
5. **Eliminar** `mockInterceptor.intercept` de `apiService._request`.
6. El adoptante necesita **dos procesos** en desarrollo:
   `npm run dev` (Webpack) y `npm run mock-api` (json-server).

### Evaluacion por criterio

| Criterio | Resultado |
|----------|-----------|
| Adoptable por terceros | **Falla parcialmente**. Requiere dos procesos. Se puede mitigar con `concurrently` pero anade complejidad. |
| No acopla codigo de produccion | **Cumple**. El UI hace requests HTTP normales a `localhost:3001`. |
| Trazabilidad con el dominio | **Parcial**. `db.json` es declarativo y legible; rutas complejas (filtros custom, payloads validados) requieren `routes.json` o middleware. |
| Compatible con Jest | **Falla**. Tests Jest no pueden depender de un servidor externo en cada `npm test`. Habria que duplicar mocks en Jest. |
| Compatible con migracion progresiva a TS | **Indiferente**. El servidor es opaco al lenguaje. |
| Sin dependencias pesadas | **Cumple**. Una dep npm. |
| Posibilidad de validar contra contrato | **Pobre**. json-server tiene contrato implicito (que sea legal). Comparar contra OpenAPI requeriria tooling externo. |

### Veredicto

**Inferior a MSW para este caso.** Cualquier ventaja conceptual
(servidor real, payloads validables externamente) se pierde frente a
las desventajas (dos procesos, no funciona en Jest). Si en algun
momento se necesita un servidor mock que terceros consuman desde
fuera del navegador, json-server tiene sentido. Para el template
web puro, no.

---

## alt-prism-desde-openapi

### Descripcion

[@stoplight/prism-cli](https://github.com/stoplightio/prism) levanta
un servidor HTTP mock **generado automaticamente desde una
especificacion OpenAPI** v2/v3. La especificacion es la fuente de
verdad; Prism produce respuestas validas, valida requests entrantes
y puede actuar como proxy validador contra un backend real.

### Madurez (datos web 2026)

- Estable, ampliamente usado en API-first companies.
- Docker pulls: 10M+ del image `stoplight/prism`.
- Apidog 2026 advierte: *"command-line tool... if you're still using
  command-line mock servers like Stoplight Prism Mock, it's time to
  upgrade your workflow"*. Hay friccion en el desarrollo cotidiano.
- Soporta x-faker extension OpenAPI para datos dinamicos.

### Aplicacion al template

**Prerrequisito**: existir una especificacion OpenAPI del backend
Django. Hoy **no existe** en el repo `e-comerce-ui`. Tres opciones:

(a) Producir una OpenAPI sintetica del template, mantenida en este
repo. Riesgo: divergira del backend real cuando llegue.

(b) Esperar a que el equipo backend produzca la OpenAPI antes de
adoptar Prism. Bloquea esta iniciativa indefinidamente.

(c) Producir una OpenAPI minima cubriendo solo los endpoints actuales
del mock. Es trabajo significativo (varias decenas de endpoints).

Cualquiera de (a)-(c) tambien implica levantar Prism via Docker
(`docker run stoplight/prism mock -h 0.0.0.0 openapi.yaml`) o instalar
el CLI globalmente. El adoptante necesita Docker o npm global.

### Evaluacion por criterio

| Criterio | Resultado |
|----------|-----------|
| Adoptable por terceros | **Falla**. Docker obligatorio en la version recomendada; npm global como alternativa imperfecta. |
| No acopla codigo de produccion | **Cumple**. El UI llama a `localhost:4010`. |
| Trazabilidad con el dominio | **Parcial**. La OpenAPI es trazable, pero editarla manualmente para anadir un endpoint es mas costoso que un archivo TS plano. |
| Compatible con Jest | **Falla**. Mismo problema que json-server: servidor externo. |
| Compatible con migracion progresiva a TS | **Indiferente**. |
| Sin dependencias pesadas | **Falla**. Docker o instalacion global de Node CLI. |
| Posibilidad de validar contra contrato | **Excelente**. Aqui Prism brilla: la OpenAPI ES el contrato. La proxima iniciativa lo usaria directamente. |

### Veredicto

**Inviable hoy.** Sin OpenAPI existente, esta alternativa exige
producir y mantener una especificacion sin backend. Excelente desde
el punto de vista de "validar contra contrato", pero el costo de
entrada es desproporcionado para el template. Recordable para
`validar-contrato-de-mocks-vs-backend-real` si el equipo backend
produce la OpenAPI.

---

## alt-mirage-js

### Descripcion

[MirageJS](https://miragejs.com/) es un mock server **embebido en el
cliente** con ORM interno: modela entidades con relaciones
(`hasMany`, `belongsTo`), factories y serializers. Intercepta
fetch/XHR via Pretender.js (monkey-patching).

### Madurez (datos web 2026)

- **Version actual**: v0.1.48 (todavia 0.x).
- **GitHub stars**: 5,512.
- **npm weekly downloads**: 261k (en declive frente a MSW).
- **Comparativa oficial de Mirage** admite: *"MSW is a great library
  and the service worker concept might even make it into Mirage at
  some point"* — el propio proyecto reconoce que MSW tiene ventaja
  tecnica.
- Drupal migro **de Mirage a MSW** en 2024 citando la diferencia en
  downloads como signo de tendencia.

### Aplicacion al template

1. Anadir `miragejs` a `devDependencies`.
2. Definir modelos en `src/mocks/server.js`:
   ```js
   createServer({
     models: {
       product: Model.extend({ category: belongsTo() }),
       order: Model.extend({ items: hasMany('cartItem') }),
     },
     factories: { product: Factory.extend({ ... }) },
     routes() { this.get('/api/v1/catalog/products/'); },
   });
   ```
3. Arrancar en `src/index.jsx` en modo dev.
4. **Eliminar** `mockInterceptor.intercept` de `apiService._request`.

### Evaluacion por criterio

| Criterio | Resultado |
|----------|-----------|
| Adoptable por terceros | **Cumple**. Una dep npm, sin pasos extra. |
| No acopla codigo de produccion | **Cumple**. Pretender.js intercepta a nivel global. |
| Trazabilidad con el dominio | **Parcial**. El ORM interno es expresivo pero opinionated; modificar manualmente requiere conocer Mirage. |
| Compatible con Jest | **Cumple**. Mirage soporta tests; se pasa una instancia de servidor por test. |
| Compatible con migracion progresiva a TS | **Limitado**. Mirage tiene tipos de comunidad, no oficiales TS-first. |
| Sin dependencias pesadas | **Cumple**. |
| Posibilidad de validar contra contrato | **Pobre**. Mirage tiene su propio modelo de datos; comparar contra OpenAPI requiere mapping manual. |

### Veredicto

**Dominado por MSW.** Sus ventajas (ORM, relaciones, factories) son
deseables, pero MSW + `@mswjs/data` ofrece lo mismo con mejor estado
del ecosistema. Adoptar Mirage en 2026 es elegir la tecnologia que
otros proyectos estan abandonando. No recomendado.

---

## alt-mockoon

### Descripcion

[Mockoon](https://mockoon.com/) es una **aplicacion desktop GUI**
para configurar mocks HTTP visualmente (sin escribir codigo).
Tambien tiene CLI. Bueno para personas no tecnicas.

### Madurez (datos web 2026)

- Desktop GUI free + open source + offline-first.
- Apidog 2026: *"Mockoon is great for solo developers, but less so
  for teams"*. Sin cloud collab, sin sync entre repos.

### Aplicacion al template

El adoptante del template clonaria el repo, instalaria Mockoon en su
maquina, abriria un archivo `mockoon.json` desde el repo, y arrancaria
el mock desde la GUI o CLI.

Problema fundamental: **el template no es una aplicacion sino una
plantilla de codigo**. Pedirle al adoptante que instale una GUI
externa para usar el template viola el criterio de "adoptable con
`npm install`".

### Evaluacion por criterio

| Criterio | Resultado |
|----------|-----------|
| Adoptable por terceros | **Falla**. Requiere instalar app desktop o CLI separada. |
| No acopla codigo de produccion | **Cumple** (servidor externo). |
| Trazabilidad con el dominio | **Falla**. La configuracion vive en JSON manejado por la GUI; no es codigo TS contra `domain.ts`. |
| Compatible con Jest | **Falla**. Servidor externo. |
| Compatible con migracion progresiva a TS | **Indiferente**. |
| Sin dependencias pesadas | **Falla**. Desktop app + Electron. |
| Posibilidad de validar contra contrato | **Pobre**. |

### Veredicto

**No aplicable al template.** Mockoon es excelente para casos
distintos: prototipado individual, demos no tecnicas, mocks para
APIs de terceros consumidas desde apps moviles. No para una
plantilla de codigo React open source.

---

## alt-wiremock

### Descripcion

[WireMock](https://wiremock.org/) es un servidor mock **basado en JVM**
(Java) con foco en record-replay de trafico real, stateful workflows
y testing del lado servidor. Hay tambien WireMock Cloud (paid).

### Madurez (datos web 2026)

- Maduro y popular en mundo Java/JVM enterprise.
- Apidog 2026 lo critica: *"WireMock requires manual stub
  configuration and doesn't auto-generate mocks from OpenAPI specs.
  It's ideal for Java teams"*.
- **No es el ecosistema natural** del template (React + Node).

### Aplicacion al template

El adoptante necesita **Java JDK instalada**. Wiremock corre via
`java -jar wiremock.jar`. Stubs en JSON, modificables manualmente.

Para el template, la mejor cualidad de WireMock (grabar trafico real
y replicarlo) **no es accesible**: no hay backend real al que grabar.

### Evaluacion por criterio

| Criterio | Resultado |
|----------|-----------|
| Adoptable por terceros | **Falla rotundo**. JDK instalada como prerrequisito. |
| No acopla codigo de produccion | **Cumple**. |
| Trazabilidad con el dominio | **Pobre**. Stubs JSON sin tipado contra `domain.ts`. |
| Compatible con Jest | **Falla**. |
| Compatible con migracion progresiva a TS | **Falla**. |
| Sin dependencias pesadas | **Falla rotundo**. JDK + jar. |
| Posibilidad de validar contra contrato | **Parcial**. WireMock tiene soporte OpenAPI parcial. |

### Veredicto

**No aplicable.** WireMock es excelente en su nicho (testing
enterprise JVM, record-replay). El template no esta en ese nicho.

---

## alt-hoverfly

### Descripcion

[Hoverfly](https://github.com/SpectoLabs/hoverfly) es un servidor de
**simulacion de fallos** y proxy HTTP, escrito en Go. Foco: latencia
artificial, errores aleatorios, rate limits, chaos engineering.
Tambien hace capture/replay.

### Madurez (datos web 2026)

- Mantenido por iOCO (antes SpectoLabs).
- Hay Hoverfly Cloud (SaaS pago).
- Usado mas para testing de resiliencia que para mocks de catalogo
  cotidiano.

### Aplicacion al template

Hoverfly responde a una pregunta distinta a la del template: "¿como
se comporta mi UI cuando el backend tiene latencia o errores
intermitentes?". Esa es una pregunta valida pero **otra iniciativa**;
no es "como vivir sin backend mientras se construye".

### Evaluacion por criterio

| Criterio | Resultado |
|----------|-----------|
| Adoptable por terceros | **Falla**. Binario Go o Docker. |
| No acopla codigo de produccion | **Cumple**. |
| Trazabilidad con el dominio | **Pobre**. |
| Compatible con Jest | **Falla**. |
| Compatible con migracion progresiva a TS | **Indiferente**. |
| Sin dependencias pesadas | **Falla**. |
| Posibilidad de validar contra contrato | **Indiferente**. |

### Veredicto

**Fuera del problema.** Hoverfly resuelve un problema que el template
no tiene hoy. Recordable como herramienta complementaria si en el
futuro se quiere testear resiliencia del UI.

---

## alt-faker-mas-factory-sobre-interceptor

### Descripcion

No es una arquitectura: es una **capa de datos** que se aplica encima
de cualquier opcion anterior. `@faker-js/faker` genera datos
realistas mediante un patron factory:
```ts
import { faker } from '@faker-js/faker';
export const createProduct = (overrides = {}): Product => ({
  id: faker.number.int({ min: 1, max: 99999 }),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  name: faker.commerce.productName(),
  base_price: parseFloat(faker.commerce.price()),
  ...overrides,
});
```

### Madurez (datos web 2026)

- `@faker-js/faker`: estandar de facto en JS testing.
- Combinable con cualquier opcion: MSW + Faker, MirageJS + Faker,
  interceptor actual + Faker.
- Lista oficial `awesome-faker` documenta 50+ libs relacionadas:
  `interface-forge`, `json-schema-faker`, `graphql-faker`.

### Aplicacion al template

Anadir `@faker-js/faker` y crear `src/mocks/factories.ts` con una
factory por entidad de `domain.ts`. El interceptor (o handlers MSW,
o servidor json-server) usa estas factories para producir datos
variables en cada request.

### Evaluacion por criterio

No evaluable independientemente porque **no es una arquitectura**.
Aporta:

- **Realismo de datos** (criterio implicito que el template hoy no
  cumple: tiene 3 productos hardcoded).
- Cero impacto negativo en los demas criterios.
- Costo bajo: una dep npm pequena, factories de ~20 lineas cada una.

### Veredicto

**Aplicable como complemento.** Sea cual sea la arquitectura elegida
(interceptor actual, MSW, json-server), Faker + factories tipadas
contra `domain.ts` produce datos significativamente mas realistas
que el registry hardcoded actual. Recomendable como capa adicional.

---

## Tabla comparativa resumen

Leyenda: ✓ cumple, △ parcial, ✗ falla.

| Criterio | actual | MSW | json-server | Prism | Mirage | Mockoon | WireMock | Hoverfly |
|----------|--------|-----|-------------|-------|--------|---------|----------|----------|
| Adoptable por terceros | ✓ | ✓ | △ | ✗ | ✓ | ✗ | ✗ | ✗ |
| No acopla produccion | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Trazabilidad dominio | ✓ | ✓ | △ | △ | △ | ✗ | △ | △ |
| Compatible Jest | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Compatible TS progresivo | ✓ | ✓ | – | – | △ | – | ✗ | – |
| Sin dependencias pesadas | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Validar vs contrato | △ | ✓ | △ | ✓ | △ | △ | △ | – |
| **Veredicto** | viable base | **superior** | inferior | inviable hoy | dominado | no aplica | no aplica | otro problema |

(Faker se omite porque es capa complementaria, no arquitectura.)

---

## Recomendacion final

**Adoptar MSW como arquitectura de mocks del template, complementada
con Faker + factory para datos realistas.**

### Justificacion en una linea

MSW es la unica alternativa que cumple los 7 criterios sin
concesiones; es el estandar 2026 del ecosistema React/Node; elimina
el acoplamiento entre `apiService.js` y `src/mocks/`; y deja la
puerta abierta a la siguiente iniciativa (`validar-contrato-de-mocks-
vs-backend-real`) en condiciones optimas.

### Que produciria la fase de ejecucion (alto nivel)

Lo siguiente se concretaria en `plan-*.md` y `tareas-*.md` tras
aprobacion. Esbozo:

1. Anadir `msw` y `@faker-js/faker` a devDependencies.
2. `npx msw init public/` para generar `public/mockServiceWorker.js`.
3. Crear `src/mocks/handlers.ts` con handlers MSW tipados contra
   `src/types/domain.ts`, **migrando** la logica de
   `mockInterceptor.js`, `registry.js`, `interceptors/inventory.js` y
   `interceptors/returns.js`.
4. Crear `src/mocks/factories.ts` con factories Faker para `Product`,
   `User`, `CartItem`, `Order`, `Voucher`.
5. Crear `src/mocks/browser.ts` (worker para dev) y `src/mocks/node.ts`
   (server para Jest).
6. Modificar `src/index.jsx` para arrancar el worker en
   `NODE_ENV=development`.
7. Modificar `jest.config.cjs` o `tests/setup.ts` para arrancar el
   server MSW en setup, resetear handlers en `afterEach`, cerrar en
   `afterAll`.
8. **Eliminar** la llamada a `mockInterceptor.intercept` en
   `apiService._request`. `apiService` vuelve a ser un cliente HTTP
   plano.
9. Retirar las variables `*_SOURCE` del webpack DefinePlugin si dejan
   de tener uso, o redefinirlas si MSW necesita activacion por
   dominio.
10. Actualizar `docs/vista-de-bloques-de-construccion/` y
    `docs/decisiones-de-arquitectura/` para reflejar la nueva
    arquitectura. Anadir entrada nueva
    `dec-mocks-via-msw-service-worker.md`.
11. Verificar que los 184 tests pasan tras la migracion.
12. Cerrar la iniciativa con `decisiones-revisar-arquitectura-de-mocks.md`.

### Trade-off aceptado

MSW anade dos archivos en `public/` (`mockServiceWorker.js`) que el
adoptante debe **excluir del build de produccion** o aceptar que
quede en el bundle estatico sin uso. Esto se documenta en la guia de
despliegue y en `como-adaptar-este-template.md`.

### Cuando reevaluar esta decision

- Si MSW se descontinua (riesgo bajo: 17,925 stars, 6.92M weekly).
- Si el backend Django produce una OpenAPI bien mantenida; en ese
  momento conviene re-evaluar Prism, que pasaria de "inviable" a
  "muy bueno" porque elimina el costo de entrada.
- Si el template adopta un meta-framework con soporte mock nativo
  (Next.js API Routes, etc.); cambia la base de comparacion.

---

## Decision pendiente

Esta recomendacion requiere aprobacion expresa del usuario antes de
pasar a `plan-*.md`. Las opciones son:

- **Aprobar MSW + Faker** segun esta recomendacion.
- **Aprobar otra alternativa** justificada (por ejemplo "mantener
  el interceptor actual" si la prioridad es estabilidad sobre
  arquitectura).
- **Posponer** la decision pidiendo mas analisis sobre algun punto
  concreto.

Tras la decision se produce `plan-*.md` con las 12 tareas atomicas
T-NNN esbozadas arriba (numero estimado; puede subir o bajar tras
inspeccion fina de codigo).
