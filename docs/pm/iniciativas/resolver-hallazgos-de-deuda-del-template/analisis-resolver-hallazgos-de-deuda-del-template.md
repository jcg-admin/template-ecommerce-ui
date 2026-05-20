# Analisis: Resolver hallazgos de deuda del template

| Campo | Valor |
|-------|-------|
| Iniciativa | resolver-hallazgos-de-deuda-del-template |
| Tipo | Analisis previo a tareas |
| Estado | Pendiente de aprobacion |
| Fecha de creacion | 2026-05-20T21:09:03 |

> **Como leer este documento.** Cada hallazgo tiene cinco apartados:
> estado actual, por que no resolver crea deuda, opciones (al menos
> dos constructivas, ninguna "dejar como esta"), recomendacion con
> costo estimado, y la pregunta abierta para aprobacion. Al final del
> documento esta la tabla de aprobacion donde anotar la decision por
> hallazgo.

---

## H-01: deuda-decorators-experimental

### Estado actual

`src/decorators/` contiene tres higher-order functions bien escritas
(no son React HOCs, son envoltorios funcionales) que ningun modulo
de `src/` importa. El barrel `src/decorators/index.js` los expone, el
alias `@decorators` esta registrado en webpack, jest y jsconfig.

| Decorator | Que hace | Tamano |
|-----------|----------|--------|
| `withCaching` | Envuelve una funcion async con un cache TTL configurable. Variante `withCachingAdvanced` anade `invalidateCache()` y `getCacheSize()`. Presets `CACHE_TTL.SHORT/MEDIUM/LONG/VERY_LONG`. | 4163 bytes |
| `withLogging` | Envuelve una funcion con logging estructurado. Sanitiza campos sensibles (`password`, `token`, `apiKey`). Trackea duracion con `performance.now()`. Variante `withLoggingLevels` con TRACE/DEBUG/INFO/WARN/ERROR. | 5113 bytes |
| `withValidation` | Valida los argumentos antes de ejecutar. Lanza `ValidationError` o devuelve `null` segun configuracion. Trae `CommonValidators` con `validateId`, `validateEmail`, `validateRange`, `validateArray`, `validateWith`. | 5700 bytes |

### Por que no resolver crea deuda

Codigo muerto importable es peor que no tenerlo: un nuevo desarrollador
puede consumirlos pensando que son parte de la API del template, pero
ningun otro modulo los usa como referencia. Mas grave, si el codigo
muerto se rompe (cambio de Babel, de Node) nadie se entera hasta que
alguien intenta usarlo y descubre que llevaba meses sin pasar tests.

### Opcion A: integrar en la capa de servicios

Aplicar los tres decorators sobre funciones del cliente HTTP y los
thunks de Redux que se benefician de su contrato.

| Donde | Que decorator | Justificacion |
|-------|--------------|---------------|
| `services/apiService.fetch` | `withLogging` con `logArgs: true, logResult: false, logTime: true` | Trazabilidad de cada peticion con duracion y errores tipados. React Query ya cubre cache; logging es ortogonal. |
| `redux/slices/authSlice` thunks (`login`, `register`, `deactivateAccount`) | `withLogging` con sanitizacion de `password` activada | Operaciones criticas que conviene loguear sin filtrar credenciales. |
| `redux/slices/paymentsSlice` thunks (`initiateMercadoPago`, `retryPayment`) | `withLogging` + `withValidation` con `CommonValidators.validateId('orderId')` | Pagos requieren auditoria de quien llamo que y cuando, mas validacion de entrada para no llegar al backend con basura. |
| `redux/slices/cartSlice.applyVoucher` | `withValidation` con `CommonValidators.validateNonEmpty('voucherCode')` | Validacion temprana evita ida al backend con codigo vacio. |
| `redux/slices/catalogSlice.searchProducts` | `withCaching` con TTL `SHORT` y key por query string | Reduce hits al backend para terminos repetidos. React Query no cachea porque la busqueda es typeahead con debounce, no useQuery. |

**Costo**: tocar 4 a 5 archivos de `redux/slices/` y `services/`,
mas un test de integracion por cada decoracion. Estimado: medio dia.

**Ventaja**: los decorators dejan de ser huerfanos sin reescribirse.

**Desventaja**: introduce dependencia de los decorators en la capa de
servicios. Si en el futuro se quieren reemplazar (por ejemplo, mover
el logging a Sentry), hay que tocar los puntos de integracion.

### Opcion B: convertirlos en hooks React

Reescribirlos como `useCachedQuery`, `useLogger`, `useValidator`. Los
componentes los usan directamente sin envolver funciones externas.

**Costo**: reescritura completa de los tres archivos (~15k bytes) +
adaptacion de su API. Las pruebas existentes (si las hubiera) habria
que rehacerlas.

**Ventaja**: ergonomia React-nativa, integracion con el ciclo de vida.

**Desventaja**: pierde el uso fuera de componentes (servicios,
slices). Es duplicar lo que React Query ya hace mejor (`useCache`
seria pobre comparado con `useQuery`).

### Opcion C: mantener como API publica del template + documentar

Conservar tal cual, documentarlos en `docs/conceptos-transversales/`
como utilidades opcionales del template para casos en que el
adoptante necesite envolver funciones async sin pasar por la capa de
servicios.

**Costo**: anadir una seccion a `conceptos-transversales/` (~50
lineas) + un ejemplo de uso en cada decorator JSDoc actualizado.

**Ventaja**: minimo trabajo, conserva el valor potencial.

**Desventaja**: no resuelve el origen del problema. Siguen huerfanos
en el codigo del template; "documentar" no es "usar".

### Recomendacion

**Opcion A**. Razon: integrar en servicios y slices da valor inmediato
(logging estructurado en operaciones criticas, validacion temprana en
mutaciones) y deja el codigo del template como ejemplo de uso real.
Opcion C es honesta pero pasiva. Opcion B mezcla decorators con
hooks y pierde el caso de uso fuera de componentes.

---

## H-02: deuda-tipos-en-src-types

### Estado actual

`src/types/PropShapes.js` define 8 shapes de prop-types compartidos
(`UserShape`, `CategoryShape`, `ProductShape`, `CartItemShape`,
`VoucherShape`, `OrderShape`, `AddressShape`, `ToastShape`). Ningun
componente los importa. El alias `@types` esta registrado en webpack,
jest y jsconfig.

### Por que no resolver crea deuda

Mismo argumento que con decorators: API publica sin consumidores
internos pasa de "util" a "trampa". Ademas, sin uso en codigo de
produccion, los shapes se desincronizan del modelo real: si
`productsSlice` anade un campo nuevo al producto, `ProductShape` se
queda atras sin que nadie lo note.

### Opcion A: aplicar PropShapes a los componentes que consumen estos objetos

Cada componente o pagina que recibe `product`, `user`, `cartItem`,
`order`, etc. como prop sustituye sus prop-types inline por imports
desde `@types/PropShapes`.

| Componente | Shape aplicable |
|-----------|----------------|
| `components/catalog/ProductCard.jsx` | `ProductShape` |
| `components/catalog/VariantSelector/VariantSelector.jsx` | `ProductShape` |
| `pages/catalog/ProductPage.jsx` | `ProductShape` |
| `pages/cart/CartPage.jsx` (item) | `CartItemShape` |
| `pages/account/OrderDetailPage.jsx` | `OrderShape` |
| `pages/account/OrdersPage.jsx` | `OrderShape` |
| `pages/account/AddressesPage.jsx` | `AddressShape` |
| `pages/admin/AdminUserDetailPage.jsx` | `UserShape` |
| `pages/admin/AdminVouchersPage.jsx` | `VoucherShape` |
| `components/common/Toast/ToastContainer.jsx` | `ToastShape` |

**Costo**: tocar ~10 archivos para anadir el import y la declaracion
`Componente.propTypes = { foo: ProductShape }`. Trabajo mecanico,
estimado: una a dos horas.

**Ventaja**: PropShapes deja de ser huerfano. Los componentes ganan
documentacion de sus props. Si el modelo cambia, hay un solo lugar
donde sincronizar.

**Desventaja**: prop-types en React 19 son advisory only (warnings en
console). Para enforcement real se necesitaria TypeScript.

### Opcion B: extender PropShapes con shapes que faltan + integrar

PropShapes hoy cubre 8 dominios. Hay slices y modelos que no estan
representados: `ReturnShape`, `SupportTicketShape`, `ReviewShape`,
`QuestionShape`, `PaymentShape`, `NotificationShape`, `ShipmentShape`,
`AuditEventShape`. Anadirlos y luego integrarlos como Opcion A.

**Costo**: anadir ~8 shapes mas a `PropShapes.js` (~80 lineas) + el
trabajo de Opcion A pero sobre ~20 archivos en lugar de 10.

**Ventaja**: cobertura completa del modelo. PropShapes pasa a ser el
unico lugar canonico para tipos de dominio.

**Desventaja**: dobla el costo. Si la opcion final es migrar a
TypeScript, este trabajo se duplica.

### Opcion C: dejarlos como librería opcional del template

Documentarlos en `docs/conceptos-transversales/` como utilidades del
template que el adoptante activa al importarlas. Sin integracion en
el codigo del template.

**Costo**: una seccion en `conceptos-transversales/` (~30 lineas).

**Ventaja**: trabajo minimo.

**Desventaja**: no resuelve el problema. Permanecen huerfanos.

### Recomendacion

**Opcion A** primero, considerar Opcion B despues. Razon: Opcion A
elimina la deuda con un costo acotado y deja PropShapes vivo en el
codigo. Extender despues a mas shapes (Opcion B) es trabajo
incremental que se justifica cuando un componente nuevo lo necesite.

---

## H-03: deuda-sin-typescript-en-src

### Estado actual

El `package.json` declara como devDependencies:

```
"@babel/preset-typescript": "^7.28.5"
"@typescript-eslint/eslint-plugin": "^8.59.2"
"@typescript-eslint/parser": "^8.59.2"
```

No existe `tsconfig.json`. `jest.config.cjs` declara `'ts', 'tsx'` en
`moduleFileExtensions` y `testMatch`. No hay archivos `.ts` ni `.tsx`
en `src/` ni en `tests/`.

### Por que no resolver crea deuda

Stack instalado sin uso es coste de mantenimiento que no compra
nada. `npm install` baja 50 a 80 MB de dependencias TypeScript que el
build no usa. Cualquier auditoria de dependencias (`npm audit`,
revisiones de seguridad) tiene que procesar paquetes que no estan
activos. Y crea confusion en lectores nuevos: "el repo tiene
TypeScript instalado pero no lo usa, ¿hay una migracion en curso?".

### Opcion A: migrar todo `src/` a TypeScript

Anadir `tsconfig.json` con `strict: true`, renombrar `.js` a `.ts` y
`.jsx` a `.tsx`, anadir tipos a slices, hooks, paginas, componentes,
fixtures.

**Costo**: trabajo grande. Estimado: 2 a 4 semanas para un equipo.
Es un proyecto completo, no una tarea.

**Ventaja**: enforcement de tipos en compilacion, refactoring
seguro, eliminacion de toda una clase de bugs.

**Desventaja**: el costo es alto y el template hoy funciona. Migrar
sin un commit explicito a TypeScript como estrategia es prematuro.

### Opcion B: migrar progresivamente partiendo de los modulos compartidos

Anadir `tsconfig.json` con `allowJs: true, checkJs: false`, migrar
solo `src/types/PropShapes.js` y `src/utils/serializeApiError.js` a
TypeScript como primera etapa. Los archivos `.js` y `.jsx` siguen
funcionando.

**Costo**: 2 a 3 horas para la primera etapa. Etapas siguientes
incrementales a discrecion.

**Ventaja**: empieza la migracion sin congelar el resto del codigo.
Permite probar TypeScript en partes pequenas antes de comprometerse.

**Desventaja**: deja el codebase mixto por tiempo indefinido.
Riesgo de quedarse en "50% migrado para siempre".

### Opcion C: eliminar el stack TypeScript del proyecto

Quitar `@babel/preset-typescript`, `@typescript-eslint/*` de
`devDependencies`. Quitar `'ts', 'tsx'` de `jest.config.cjs`. Si
mas adelante se decide adoptar TypeScript, se reinstala.

**Costo**: 15 minutos. Tocar `package.json`, `jest.config.cjs`,
correr `npm install` para regenerar el lockfile.

**Ventaja**: estado coherente. Menos dependencias.

**Desventaja**: si manana se decide adoptar TypeScript, hay que
reinstalar y reconfigurar.

### Recomendacion

**Opcion B**. Razon: el stack TypeScript instalado sin uso es deuda
que no aceptamos por defecto, y la forma de resolverla coherente con
el principio rector de esta iniciativa es **implementarlo** (usar el
stack que ya esta instalado), no eliminarlo. La Opcion C queda
descartada por contradecir ese principio: eliminar el stack convierte
una deuda viva en una decision de "no hacemos TypeScript", que
despues hay que revertir si manana se decide adoptarlo.

La Opcion B se justifica ademas por sinergia con otros hallazgos de
esta misma iniciativa:

- `deuda-tipos-en-src-types` ya toca `PropShapes.js`. Migrarlo a
  `PropShapes.ts` con interfaces reales en lugar de prop-types
  resuelve los dos hallazgos en un solo paso.
- `deuda-decorators-experimental` ya toca los archivos de
  `src/decorators/`. Migrarlos a `.ts` con firmas tipadas refuerza
  el valor de los decorators (autocompletado en consumidores) sin
  trabajo adicional significativo.

**Interdependencia con `deuda-tipos-en-src-types`**: si se aprueba la
Opcion B aqui, la Opcion A de PropShapes debe ejecutarse migrando
**primero** `PropShapes.js` a `PropShapes.ts` con interfaces TS, y
luego aplicandolas a los componentes consumidores como tipos TS, no
como prop-types. Si en su lugar se aprobara Opcion A de TypeScript
(migracion masiva) o Opcion C (eliminar el stack, descartada), el
plan de PropShapes cambia. Estas dos decisiones deben tomarse juntas.

**Plan concreto de la primera etapa de migracion progresiva**:

1. Anadir `tsconfig.json` con `allowJs: true, checkJs: false,
   strict: true, jsx: "preserve"`.
2. Renombrar `src/types/PropShapes.js` a `src/types/PropShapes.ts`,
   sustituyendo prop-types por `interface` y `type` reales.
3. Renombrar `src/utils/serializeApiError.js` a `.ts` con tipos para
   el error normalizado.
4. Aplicar `PropShapes.ts` a los ~10 componentes consumidores
   (parte de `deuda-tipos-en-src-types`). Esos componentes pasan de
   `.jsx` a `.tsx` solo si su autor decide migrarlos; si no, los
   tipos se consumen como prop-types externos via
   `PropTypes.shape({...})` exportado tambien desde `PropShapes.ts`.
5. Etapas siguientes (slices, hooks, paginas) quedan como iniciativas
   propias cuando se requieran. Esta iniciativa cubre solo la primera
   etapa.

**Costo** de la primera etapa: 4 a 6 horas. Crear `tsconfig.json`,
migrar dos archivos, ajustar imports.

---

## H-04: deuda-readme-sin-actualizar-tras-cambios

### Estado actual

El `README.md` raiz menciona `docs/scss-*.md` pero NO menciona:

- La documentacion arc42 en `docs/<cajones>/`.
- El modulo `docs/pm/` con sus iniciativas.
- El documento `docs/como-adaptar-este-template.md` que es el punto
  de entrada para adoptantes.

### Por que no resolver crea deuda

Un adoptante que clona el template y abre el `README.md` no descubre
que existe una documentacion completa. Termina reinventando lo que
ya esta documentado.

### Opcion A: anadir seccion de "Documentacion" extendida en el README

Sustituir la seccion "Documentacion" actual (que solo enlaza scss-*)
por una con la estructura completa: documento de adopcion primero,
indice arc42 en `docs/README.md`, modulo pm.

**Costo**: 20 minutos. Editar un archivo.

**Ventaja**: punto unico de entrada.

**Desventaja**: ninguna conocida.

### Opcion B: minimo cambio

Anadir una sola linea al README apuntando a `docs/README.md`.

**Costo**: 2 minutos.

**Ventaja**: minimo.

**Desventaja**: el adoptante tiene que dar un salto mas para descubrir
`como-adaptar-este-template.md`.

### Recomendacion

**Opcion A**. El costo es trivial y resuelve la deuda completamente.

---

## H-08: riesgo-bundle-construido-con-API-URL-equivocada

### Estado actual

`API_URL` se inyecta en build time via `DefinePlugin`. Si el
`.env.production` esta mal configurado, el bundle se construye con
una URL incorrecta y solo se descubre al desplegar.

CI/CD esta declarado fuera del scope del template, asi que las
opciones tradicionales de "smoke test en pipeline" no aplican aqui.

### Por que no resolver crea deuda

Es el unico tipo de bug que rompe produccion sin que ningun test lo
detecte. La probabilidad es media (operadores humanos olvidan
cambiar el `.env`), el impacto es alto (sitio caido).

### Opcion A: script de verificacion post-build

Anadir `scripts/verify-build.mjs` que despues de `npm run build`
inspeccione `dist/main.*.js` con `grep` y reporte la `API_URL` que
quedo grabada. El comando se incluye como `npm run verify-build` y se
documenta como paso manual obligatorio antes de desplegar.

**Costo**: 1 hora. Crear el script (~50 lineas), documentarlo en
`docs/vista-de-despliegue/` y en `como-adaptar-este-template.md`.

**Ventaja**: detecta el problema antes del despliegue. No requiere
CI/CD.

**Desventaja**: depende de que alguien lo corra. Si no se hace, el
bug pasa.

### Opcion B: validacion runtime al cargar la SPA

`src/app/App.jsx` al montar valida que `process.env.API_URL` apunta a
un dominio esperado (lista blanca) y, si no, muestra un banner rojo
de "configuracion incorrecta" en lugar de la app.

**Costo**: 2 horas. Crear un wrapper de validacion, decidir como se
declara la lista blanca (variable por entorno).

**Ventaja**: el bug es visible inmediatamente, incluso si nadie corre
la verificacion previa.

**Desventaja**: la lista blanca tiene que mantenerse al dia. Si el
adoptante cambia el dominio, hay que actualizar la whitelist.

### Opcion C: incluir el valor inyectado en el bundle como variable
inspeccionable

Definir `window.__APP_CONFIG__ = { apiUrl: ..., version: ... }` desde
el bundle. Cualquier inspeccion manual del sitio en navegador la
descubre.

**Costo**: 30 minutos. Una linea en `webpack.config.js` y un README.

**Ventaja**: inspeccion trivial post-deploy.

**Desventaja**: no es deteccion automatica. Sigue dependiendo de que
alguien mire.

### Recomendacion

**Opcion A + Opcion C** combinadas. Opcion A da la verificacion
explicita antes del deploy, Opcion C da inspeccion rapida tras el
deploy. Ambas tienen costo bajo y se complementan. Opcion B introduce
una whitelist que es deuda adicional (a mantener al dia).

---

## H-07: riesgo-divergencia-mocks-vs-contrato-real

### Estado actual

`src/mocks/mockInterceptor.js` y `src/mocks/interceptors/*.js` definen
las respuestas que sustituyen al backend cuando `*_SOURCE=mock`.
Cambios en el contrato del backend (anadir campo, cambiar tipo de un
enum, renombrar) dejan los mocks desactualizados sin que ningun test
lo detecte. El backend de este template no esta en este repositorio,
por lo que no hay forma de validar contratos automaticamente.

### Por que no resolver crea deuda

Es deuda continua, no un bug puntual. Cada cambio del backend
introduce riesgo de divergencia silenciosa.

### Opcion A: schema validation explicito de cada respuesta

Anadir un schema (ajv o zod) por endpoint, validar tanto las
respuestas reales como las mock. Los tests del slice verifican el
schema.

**Costo**: medio. Crear un schema por endpoint (decenas), integrar
ajv en el interceptor. Estimado: 3 a 5 dias para cubrir el catalogo
completo.

**Ventaja**: deteccion temprana en desarrollo. Schema es
self-documenting.

**Desventaja**: duplica el contrato (uno en el schema, otro en el
mock). Si el backend cambia, hay dos archivos a actualizar.

### Opcion B: contrato OpenAPI compartido + generador de mocks

El backend expone su spec OpenAPI, el template lo descarga y genera
los mocks desde el spec. Requiere coordinacion con el backend.

**Costo**: alto. Tocar el repositorio del backend para que publique
OpenAPI, crear el generador en el template.

**Ventaja**: fuente unica de verdad. Mocks siempre alineados con el
contrato.

**Desventaja**: dependencia entre repos. Fuera del scope del template
solo.

### Opcion C: documentar el riesgo en el README de mocks

Anadir `src/mocks/README.md` que explique:

- Que los mocks pueden divergir del contrato real.
- Cuando se actualizan (cada vez que el backend cambia una respuesta
  relevante).
- Como verificar manualmente (correr con `*_SOURCE=real` contra
  staging).

**Costo**: 1 hora.

**Ventaja**: el riesgo queda visible en el sitio donde alguien edita
los mocks.

**Desventaja**: no automatiza nada. Sigue siendo proceso manual.

### Opcion D: tests de smoke contra backend real

Una suite de tests bajo `tests/integration/` que corre contra
`*_SOURCE=real` apuntando a staging. Verifica forma de respuesta de
cada endpoint critico. Se ejecuta manualmente o como tarea programada
fuera del template.

**Costo**: medio. Configurar entorno de staging accesible, escribir
tests, mantenerlos.

**Ventaja**: deteccion automatica.

**Desventaja**: depende de que staging este disponible. Hay que
ejecutarlo intencionalmente.

### Recomendacion

**Opcion C como minimo viable + Opcion D si hay staging disponible**.
Opcion A y B son sobreingenieria para un template; tienen sentido en
un proyecto productivo donde el backend cambia con frecuencia. C es
deuda documentada explicita (aceptable) en lugar de deuda silenciosa.

### Decision aprobada para H-07

**Diferida a iniciativa propia**. Alcance excede esta iniciativa por
las opciones reales en juego (schema por endpoint, OpenAPI compartido,
smoke tests contra staging) y porque puede requerir coordinacion con
el repositorio del backend.

Slug propuesto: `validar-contrato-de-mocks-vs-backend-real`.
Ubicacion: `docs/pm/iniciativas/validar-contrato-de-mocks-vs-backend-real/`.

Esta iniciativa documenta H-07 en
`docs/riesgos-y-deuda-tecnica/riesgos-y-deuda-tecnica.md` con estado
"delegado a iniciativa propia" y referencia al slug, para que la
trazabilidad quede clara cuando se abra la iniciativa siguiente. La
implementacion concreta es trabajo de esa iniciativa, no de esta.

---

## H-05: deuda-de-allowlist-color-no-hex

### Estado actual

Tras los PRs #3 y #4, el codebase paso de 525 `#hex` literales a 17,
todos en allowlist con justificacion. La deuda es **continua**: cada
nuevo `#hex` agregado debe convertirse en token o justificarse en la
allowlist.

### Por que no resolver crea deuda

Si la allowlist crece silenciosamente, el trabajo de PR #4 se
desperdicia. En 6 meses puede haber 50 entradas y la disciplina se
pierde.

### Opcion A: monitoreo numerico en pre-push

Anadir a `.husky/pre-push` un comando que cuente las entradas de la
allowlist y falle si supera 20 (margen de 3 entradas sobre el estado
actual). Forzar revision cuando crece.

**Costo**: 1 hora. Editar `.husky/pre-push` y un script auxiliar.

**Ventaja**: presion automatica contra el crecimiento.

**Desventaja**: 20 es arbitrario. Si el adoptante tiene casos
legitimos puede ser fastidioso.

### Opcion B: revision trimestral documentada

Anadir un documento `docs/pm/iniciativas/auditar-allowlist-hex-trimestral/`
preparado como plantilla (sin ejecutar todavia). La revision se
ejecuta cada 3 meses y produce su propio cierre.

**Costo**: 1 hora para crear la plantilla.

**Ventaja**: convierte deuda continua en proceso definido.

**Desventaja**: depende de que alguien recuerde ejecutarlo cada
trimestre.

### Opcion C: anotar cada nuevo hex con comentario obligatorio

Reglas de revision de PR: ningun nuevo `#hex` se acepta sin un
comentario adyacente justificando por que no es token. Stylelint
permite custom messages.

**Costo**: 2 horas para configurar la regla custom.

**Ventaja**: el justifying es parte del codigo, no de un documento
aparte.

**Desventaja**: requiere revision humana en cada PR.

### Recomendacion

**Opcion A** como bloqueador mecanico + **Opcion B** como ritual.
Opcion A evita crecimiento silencioso, Opcion B garantiza que la
lista se examina con periodicidad. Opcion C es buena en repos con
mucha rotacion de colaboradores; aqui es prematuro.

### Decision aprobada para H-05

**Diferida a iniciativa propia**. Aunque la recomendacion tecnica es
solida y el costo agregado es bajo (~60 minutos), agrupar Opcion A
(bloqueador en pre-push) con Opcion B (ritual trimestral
documentado) constituye una unidad de trabajo cohesiva propia: define
una politica continua, un proceso periodico y un punto de
verificacion mecanico. Por mismo principio que H-07, se eleva a
iniciativa propia para mantener el foco de esta iniciativa en los
hallazgos de cambio one-shot.

Slug propuesto: `monitorear-y-reducir-allowlist-hex`.
Ubicacion: `docs/pm/iniciativas/monitorear-y-reducir-allowlist-hex/`.

Esta iniciativa documenta H-05 en
`docs/riesgos-y-deuda-tecnica/riesgos-y-deuda-tecnica.md` con estado
"delegado a iniciativa propia" y referencia al slug. La
implementacion del bloqueador, el script y la plantilla trimestral
queda fuera del scope actual.

---

## Hallazgos a retirar del inventario

Los siguientes hallazgos heredados **no aplican al template** y se
retiran sin analisis adicional. Las acciones de retiro son
mecanicas: eliminar la entrada del archivo correspondiente y
documentar en el documento de decisiones de cierre.

| ID | Nombre del hallazgo | Por que se retira |
|----|---------------------|--------------------|
| H-06 | `deuda-de-tareas-sprint-4-sin-trazar` | Sprints son del repositorio fuente. El template no usa sprints. |
| H-09 | `riesgo-ausencia-de-ci-cd-automatizado` | Declarado fuera del scope del template (decision del usuario). |
| H-10 | `riesgo-sin-cobertura-de-tests-medida` | Ya resuelto: `jest.config.cjs` declara `coverageThreshold: { global: { branches:80, functions:80, lines:80, statements:80 } }`. |
| H-11 | `riesgo-rama-pendiente-no-integrada` | No hay rama pendiente en el template. Era especifico del repositorio fuente. |
| H-12 | `riesgo-release-candidate-acumulado-en-develop` | El template no tiene `develop` ni `main` con divergencia. Su unica rama es `main`. |
| H-13 | `hallazgo-pr-uno-no-aparece-como-rama-remota` | Historico del analisis original sobre el repositorio fuente. |
| H-14 | `hallazgo-conflicto-en-package-json-de-la-rama-pendiente` | Historico. No hay rama pendiente. |
| H-15 | `hallazgo-rama-pendiente-tiene-36-commits-de-atraso` | Historico. |
| H-16 | `hallazgo-deuda-en-src-decorators-y-src-types` | Duplicado de H-01 y H-02 que ya estan en el plan. |
| H-17 | `hallazgo-readme-raiz-no-menciona-arc42-ni-pm` | Duplicado de H-04. |
| H-18 | `hallazgo-stack-de-typescript-sin-uso-en-src` | Duplicado de H-03. |
| H-19 | `hallazgo-ausencia-de-ci-cd` | Duplicado de H-09. |
| H-20 | `hallazgo-149-commits-en-develop-sin-promover` | Historico. |

**Total a retirar**: 13 entradas (9 historicos o fuera de scope, 4
duplicados consolidados).

---

## Tabla de aprobacion

El revisor anota su decision por cada hallazgo y firma al final. Una
vez aprobado, esta iniciativa pasa de "En analisis" a "En ejecucion"
y se crean los archivos `tareas-*.md` y `progreso-*.md`.

| ID | Nombre del hallazgo | Recomendacion del analisis | Decision aprobada | Notas |
|----|--------------------|---------------------------|-------------------|-------|
| H-01 | `deuda-decorators-experimental` | Opcion A: integrar en services + slices | **Opcion A — Aprobada** | Ejecucion en esta iniciativa. |
| H-02 | `deuda-tipos-en-src-types` | Opcion A: aplicar PropShapes a componentes consumidores | **Opcion A — Aprobada** | Forma alineada con H-03 (PropShapes pasa a TS). |
| H-03 | `deuda-sin-typescript-en-src` | Opcion B: migracion progresiva empezando por PropShapes y serializeApiError | **Opcion B — Aprobada** | Primera etapa de migracion progresiva. |
| H-04 | `deuda-readme-sin-actualizar-tras-cambios` | Opcion A: seccion completa de documentacion | **Opcion A — Aprobada** | |
| H-05 | `deuda-de-allowlist-color-no-hex` | Opcion A + B: bloqueador en pre-push mas ritual trimestral documentado | **Diferida a iniciativa propia** | Slug: `monitorear-y-reducir-allowlist-hex`. |
| H-07 | `riesgo-divergencia-mocks-vs-contrato-real` | Opcion C: documentar el riesgo en `src/mocks/README.md` (aceptacion explicita) | **Diferida a iniciativa propia** | Slug: `validar-contrato-de-mocks-vs-backend-real`. Sera la proxima iniciativa. |
| H-08 | `riesgo-bundle-construido-con-API-URL-equivocada` | Opcion A + C: script verify-build mas exposicion via `window.__APP_CONFIG__` | **Opciones A + C — Aprobadas** | |
| H-06, H-09 a H-20 | (varios) | Retirar del inventario (accion mecanica) | **Aprobado** | Retiro mecanico con razon documentada por cada entrada. |

**Aprobado por**: ________________________
**Fecha de aprobacion**: ________________________

---

## Lo que sucede despues de la aprobacion

1. Se actualiza el estado de la iniciativa en `index.md` de "En
   analisis" a "En ejecucion".
2. Se crea `tareas-resolver-hallazgos-de-deuda-del-template.md` con
   una tarea atomica por cada hallazgo aprobado, mas el DAG de
   dependencias.
3. Se crea `progreso-resolver-hallazgos-de-deuda-del-template.md`
   con la lista inicial de tareas en estado "pendiente".
4. Cada tarea se ejecuta como un commit Tim Pope independiente.
5. Tras la ultima tarea, se crea `decisiones-resolver-hallazgos-de-deuda-del-template.md`
   con las tres secciones obligatorias y se cierra la iniciativa.
