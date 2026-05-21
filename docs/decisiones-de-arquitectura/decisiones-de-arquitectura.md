# Decisiones de arquitectura

Registro de decisiones tecnicas (ADR) **observables en el codigo o en
commits**. No es un listado exhaustivo: solo decisiones cuyo
razonamiento vale la pena conservar porque su reversion costaria
trabajo significativo.

Las decisiones se nombran `dec-<slug-autoexplicativo>`. No usan
numeros — el nombre es el indice.

---

## dec-jwt-solo-en-cookies-httponly

| Campo | Valor |
|-------|-------|
| Estado | Aceptada |
| Decision | El JWT del backend nunca se expone a JS. Se transporta como cookie httpOnly. |
| Contexto | Riesgo de XSS exfiltrando tokens de localStorage o memoria de Redux. |
| Alternativas consideradas | (a) Token en localStorage con XSS protections. (b) Token en memoria de Redux + refresh proactivo. |
| Razon | (a) y (b) requieren un modelo de amenazas mucho mas estricto sobre dependencias JS. La cookie httpOnly elimina la clase entera de bug. |
| Consecuencias | Sin acceso al token, no hay timer de sesion ni refresh proactivo. Refresh es reactivo: el backend devuelve 401 y `UnauthorizedListener` redirige al login. |
| Evidencia | `src/services/apiService.js` usa `credentials: 'include'`; ningun slice de Redux contiene el JWT; ningun acceso a `document.cookie` en `src/`. |

---

## dec-mock-first-via-feature-flags-por-dominio

| Campo | Valor |
|-------|-------|
| Estado | Superseded por `dec-mocks-via-msw-service-worker` (2026-05-21, iniciativa `revisar-arquitectura-de-mocks`) |
| Decision | Cada dominio tiene un flag `PY_<DOMINIO>_SOURCE=mock|real` que enruta a un interceptor local o al backend. |
| Contexto | El UI necesita desarrollarse en paralelo al backend; algunas tareas son puramente de cliente y no deberian bloquearse esperando endpoints. |
| Alternativas | (a) MSW (Mock Service Worker). (b) Servidor json-server local. |
| Razon | El interceptor in-process es trivial de mantener y no requiere proceso adicional. MSW agrega un service worker que complica el setup de Jest. |
| Consecuencias | Mocks pueden divergir del contrato real sin que ningun test lo detecte. Esta deuda esta declarada en `riesgos-y-deuda-tecnica/`. |
| Evidencia | `.env.example`, `src/mocks/mockInterceptor.js`, `webpack.config.js` (defaults en `defaultFlags`). |
| Nota del supersede | La razon registrada en esta ADR sobre Jest **es tecnicamente incorrecta en 2026**. MSW v2 soporta Jest via `msw/node`, que intercepta el modulo `http` de Node sin usar Service Worker en tests; el setup es `setupServer(...handlers)`, trivial. La parte de "trivial de mantener y no requiere proceso adicional" sigue siendo cierta del interceptor, pero el acoplamiento del codigo de produccion con `src/mocks/` (la rama `mockInterceptor.intercept` en `apiService._request`) es un trade-off que la ADR original no enuncio. Ver iniciativa `revisar-arquitectura-de-mocks` y especialmente `reconsideracion-bajo-rup-adaptado.md` para el analisis completo. La conservacion de los flags `*_SOURCE` por dominio se mantiene en la nueva decision como conditional handler registration. |

---

## dec-mocks-via-msw-service-worker

| Campo | Valor |
|-------|-------|
| Estado | Aceptada (2026-05-21, iniciativa `revisar-arquitectura-de-mocks`) |
| Supersede | `dec-mock-first-via-feature-flags-por-dominio` |
| Decision | Los mocks del UI se implementan con [Mock Service Worker](https://mswjs.io/) (MSW v2). Los handlers viven en `src/mocks/handlers/` tipados contra `src/types/domain.ts`. La activacion por dominio se mantiene via las variables `CATALOG_SOURCE`, `AUTH_SOURCE`, `CART_SOURCE`, `PAYMENTS_SOURCE`, pero ahora actuan como *conditional handler registration*: al arrancar, el worker (en dev) o el server (en Jest) componen el array de handlers seleccionando solo los dominios marcados como `mock`. Los datos se generan con `@faker-js/faker` mediante factories tipadas en `src/mocks/factories/`. |
| Contexto | El UI sigue necesitando desarrollarse en paralelo al backend; el problema fundamental que la ADR previa atacaba no ha cambiado. Lo que cambio es: (1) la conviccion de que el acoplamiento del codigo de produccion con `src/mocks/` es deuda real, no estetica, identificada al cerrar la iniciativa `resolver-hallazgos-de-deuda-del-template`; (2) la verificacion de que la justificacion tecnica de la ADR previa para descartar MSW (*"complica el setup de Jest"*) es incorrecta en MSW v2 (2026); (3) la disponibilidad de `src/types/domain.ts` (producido en T-015 de la iniciativa anterior) como contrato canonico al que los handlers pueden tipar. |
| Alternativas | Nueve evaluadas en `pm/iniciativas/revisar-arquitectura-de-mocks/analisis-revisar-arquitectura-de-mocks.md`: (1) mantener interceptor actual, (2) MSW, (3) json-server, (4) Prism desde OpenAPI, (5) MirageJS, (6) Mockoon, (7) WireMock, (8) Hoverfly, (9) Faker + factory sobre interceptor. MSW cumple los 7 criterios del template sin concesiones; ningun competidor lo iguala. Detalle: Prism es inviable hoy porque exige OpenAPI inexistente; MirageJS esta en declive frente a MSW segun npm trends 2026; json-server requiere proceso separado y no funciona en Jest; WireMock requiere JVM; Mockoon es GUI desktop; Hoverfly resuelve otro problema (chaos engineering). |
| Razon | MSW intercepta a nivel red (Service Worker en navegador, modulo `http` en Node para Jest), no monkey-patchea fetch ni axios. El codigo de produccion (`apiService.js`) queda **agnostico del mock**, eliminando la rama `if (mockInterceptor.intercept...)` actual. Los mismos handlers funcionan en dev y en tests Jest, con cero duplicacion. Tipan directamente contra `src/types/domain.ts`. La premisa tecnicamente incorrecta de la ADR previa queda corregida. La iniciativa siguiente (`validar-contrato-de-mocks-vs-backend-real`) puede construir sobre handlers tipados con menor friccion que sobre el interceptor opaco. |
| Trade-off del Service Worker | MSW deposita `public/mockServiceWorker.js` (~10KB) que en proyectos tipo Create React App o Vite suele copiarse a `dist/`. **En este template no se copia**: la configuracion actual de Webpack solo procesa `public/index.html` via `HtmlWebpackPlugin`, sin `copy-webpack-plugin`. Mitigaciones aplicadas como parte de la iniciativa: (a) configuracion `msw.workerDirectory` en `package.json` para regeneracion automatica; (b) guard `NODE_ENV === 'development'` antes de `worker.start()` en `src/index.jsx`; (c) comentario explicito en `webpack.config.js` para futuros mantenedores; (d) nota en `docs/vista-de-despliegue/`. Analisis completo del trade-off en `pm/iniciativas/revisar-arquitectura-de-mocks/analisis-trade-off-service-worker.md`. |
| Consecuencias | (1) El codigo de produccion deja de saber que existe un modo mock. (2) `src/mocks/` se reescribe completo: 1054 lineas (interceptor + registry + sub-interceptores con tests embebidos) pasan a handlers MSW + factories Faker. (3) Los tests embebidos de los sub-interceptores se eliminan verificando caso por caso que su cobertura queda preservada en tests de slice/servicio ejercitados con los nuevos handlers (decision **3b-iii** del plan). (4) `mockServiceWorker.js` queda commiteado en `public/`. (5) Los flags `*_SOURCE` cambian de "switch en `apiService`" a "switch en arranque del worker". (6) Adoptantes del template instalan MSW transparentemente via `npm install`. |
| Evidencia | (a llenar conforme avancen las tareas) `src/mocks/handlers/`, `src/mocks/factories/`, `src/mocks/browser.ts`, `src/mocks/node.ts`, `public/mockServiceWorker.js`, `webpack.config.js`, `src/index.jsx`, `src/services/apiService.js` (sin la rama del interceptor), `package.json#msw.workerDirectory`. |
| Origen | Iniciativa `revisar-arquitectura-de-mocks` (Camino B aprobado), tarea T-001 de la Fase 0. |

---

## dec-redux-toolkit-para-estado-y-react-query-para-cache

| Campo | Valor |
|-------|-------|
| Estado | Aceptada |
| Decision | Redux Toolkit administra estado de UI y escrituras; React Query administra cache de reads remotos. |
| Contexto | Estado "lo que el usuario edita localmente" vs estado "lo que tiene el servidor" son problemas distintos. |
| Alternativas | (a) Solo Redux con thunks y normalizacion. (b) Solo React Query con Zustand para UI. |
| Razon | Redux Toolkit es solido para estado complejo de cliente (carrito multi-paso, formularios admin). React Query resuelve invalidacion, refetch, retries, dedup — cosas que en Redux son codigo a mano. Cada herramienta hace lo que mejor sabe. |
| Consecuencias | Dos sistemas que entender. Convencion: hooks de dominio (en `src/hooks/domain/`) usan React Query para reads y disparan thunks para writes. |
| Evidencia | 32 hooks en `src/hooks/domain/`; 31 slices en `src/redux/slices/`; `src/lib/queryClient.js`. |

---

## dec-spa-cliente-sin-ssr

| Campo | Valor |
|-------|-------|
| Estado | Aceptada |
| Decision | Renderizado 100% client-side, sin SSR ni SSG. Code splitting por ruta con `React.lazy`. |
| Contexto | Tienda con catalogo medio; no compite por SEO contra Amazon ni Mercado Libre. |
| Alternativas | (a) Next.js con SSR. (b) Remix. |
| Razon | El costo operativo del SSR (servidor Node de produccion, hidratacion, doble renderizado) no se justifica para el trafico esperado. El bundle splitting por ruta cubre el problema de carga inicial. |
| Consecuencias | El SEO publico depende de meta tags y de un futuro prerender, no resuelto en este repo. Crawlers que no ejecutan JS no ven el catalogo. |
| Evidencia | `src/router/AppRouter.jsx` usa `React.lazy` para cada pagina; no hay carpeta `server/` ni configuracion de SSR. |

---

## dec-api-url-resuelta-en-build-time

| Campo | Valor |
|-------|-------|
| Estado | Aceptada |
| Decision | `API_URL` se inyecta en el bundle con `DefinePlugin` durante `npm run build`. No es runtime-configurable. |
| Contexto | No hay runtime Node en produccion. Las variables de entorno tipo `window.__ENV__` o `/config.json` agregan piezas moviles. |
| Alternativas | (a) `window.__ENV__` desde un script previo. (b) Endpoint `/config.json` consultado al boot. |
| Razon | Ambas alternativas mueven la fuente de la verdad del codigo (build time) al servidor de despliegue (runtime), complicando la operacion sin beneficio claro. Un bundle por entorno es honesto. |
| Consecuencias | Cambiar `API_URL` requiere rebuild + redeploy. Un bug donde el bundle se construyo con `API_URL` equivocada es invisible hasta que el cliente lo carga. |
| Evidencia | `webpack.config.js#buildDefinedEnv`; `.env.production.example`. |
| Hallazgo asociado | El commit `c9c3465` de la rama pendiente corrige un bug donde `process.env.API_URL` se leia fuera del callback de webpack y se ignoraba `.env.production`. Ver `pm/iniciativas/analizar-ramas-pendientes-de-integracion/`. |

---

## dec-lazy-loading-solo-con-React-lazy

| Campo | Valor |
|-------|-------|
| Estado | Aceptada (introducida en rama pendiente `claude/resume-ecommerce-project-Dm3ab`) |
| Decision | El unico patron de import dinamico permitido es `const X = lazy(() => import('./Y'));`. Toda otra forma (`require()` dentro de funcion, `import()` no envuelto en `lazy`) esta prohibida por el script `check-no-lazy-imports.mjs`. |
| Contexto | Los `require()` dinamicos en runtime rompen el tree shaking de Webpack y causan bugs sutiles cuando el modulo evalua side effects al cargarse. Tambien rompen Jest cuando esta en modo ESM. |
| Alternativas | (a) Permitir `import()` en cualquier lugar. (b) Mover toda decision de carga a `React.lazy` con HOCs. |
| Razon | El patron canonico cubre el unico caso de uso legitimo (code splitting por componente). Cualquier otra forma de carga dinamica es deuda o bug. Mejor prevenir que permitir. |
| Consecuencias | Pre-commit hook puede bloquear commits validos si el autor no conoce el patron. Mensaje de error del script lo guia. |
| Evidencia | `scripts/check-no-lazy-imports.mjs`, `.githooks/pre-commit`, `package.json#scripts.check:lazy`. |

---

## dec-nodesource-apt-en-vez-de-nvm-para-provisioning

| Campo | Valor |
|-------|-------|
| Estado | Aceptada (introducida en rama pendiente `claude/resume-ecommerce-project-Dm3ab`) |
| Decision | El provisioner `scripts/install.sh` instala Node 22 LTS via repositorio apt oficial de NodeSource, no via nvm. |
| Contexto | El proyecto se desarrolla en WSL2 con dos cuentas: `deploy` (con sudo) y `develop` (sin sudo). Necesitan Node accesible para ambas. |
| Alternativas | (a) nvm bajo `/home/develop/.nvm/`. (b) Symlinks de `/usr/local/bin/` a una instalacion en `$HOME` de otra cuenta. |
| Razon | nvm instala bajo `$HOME` del usuario invocador; otro usuario no puede leerlo. Symlinks cross-user fallan por permisos de la carpeta destino. NodeSource via apt instala en `/usr/bin/` con permisos `world-readable executable`, accesible por cualquier usuario. |
| Consecuencias | El script requiere sudo (lo invoca `deploy`). `develop` lo consume sin permisos especiales. Cambiar de version mayor requiere reinstalar (no se puede `nvm use`). |
| Evidencia | `scripts/install.sh`, `tests/test_provisioner_setup.sh`. |

---

## dec-stylelint-y-checkscss-en-pre-push

| Campo | Valor |
|-------|-------|
| Estado | Aceptada |
| Decision | Husky pre-push corre `stylelint` + `scripts/check-scss.mjs` para bloquear codigo que rompe el build de estilos. |
| Contexto | Jest **no compila SCSS**. Un cambio en `_variables.scss` puede romper el build de webpack y no salir en ningun test. Esto causo regresiones reales (commits `c986320`, `b180133`). |
| Alternativas | (a) Solo correr stylelint en CI. (b) Compilar SCSS dentro de los tests de Jest. |
| Razon | (a) deja entrar codigo roto al repo. (b) hace los tests mas lentos y mezcla responsabilidades. Un check explicito en pre-push es focal y rapido. |
| Consecuencias | `git push --no-verify` lo evade. La proteccion no es absoluta — es una red, no una pared. |
| Evidencia | `.husky/pre-push`, `scripts/check-scss.mjs`, PR #3 introduce el pipeline, PR #4 lo endurece. |

---

## dec-color-no-hex-con-allowlist-documentada

| Campo | Valor |
|-------|-------|
| Estado | Aceptada (TASK-6.1 del PR #4) |
| Decision | `stylelint` regla `color-no-hex` activa para todos los SCSS. Una allowlist documentada permite excepciones con justificacion en el codigo. |
| Contexto | Antes de PR #4 habia 525 hex literales dispersos en `src/`. Cualquier cambio de paleta requeria un find-and-replace global propenso a error. |
| Alternativas | (a) Convertir todo a tokens sin allowlist. (b) Dejar la regla off pero documentar la paleta. |
| Razon | (a) deja casos legitimos imposibles (degradados puntuales, colores de marca de terceros). (b) no impide la regresion. Allowlist documentada es el equilibrio. |
| Consecuencias | Cada nuevo `#hex` necesita justificacion explicita en `.stylelintrc.json` o ser sustituido por un token. |
| Evidencia | `.stylelintrc.json`, commits TASK-3.x, TASK-4.x, TASK-6.1 del PR #4. |

---

## dec-rename-de-rutas-espanol-a-ingles

| Campo | Valor |
|-------|-------|
| Estado | Aceptada (commit `c28f171` del PR #2) |
| Decision | Las rutas de la SPA (paths URL) se nombran en ingles. Etiqueta de la decision en el commit original: `DEC-DOC-005, H-03`. |
| Contexto | El proyecto venia con rutas mezcladas (`/categorias`, `/carrito`). |
| Razon | Estandar de la industria, facilita integracion con herramientas externas (analytics, tag managers) que asumen paths en ingles. |
| Consecuencias | Necesidad de redirects para mantener compatibilidad con enlaces viejos (no se sabe si se implementaron en este repo, requiere revision). |
| Evidencia | `src/router/AppRouter.jsx`. |

---

## Como agregar una nueva decision

1. Identificar la decision: algo que **otro desarrollador podria
   revertir sin entender por que esta asi**.
2. Crear seccion nueva con encabezado `## dec-<slug-autoexplicativo>`.
3. Llenar los nueve campos: Estado, Decision, Contexto,
   Alternativas, Razon, Consecuencias, Evidencia. Si la decision se
   tomo dentro de una iniciativa, anadir el campo "Origen" apuntando
   a la iniciativa en `pm/`.
4. No usar numeracion. El slug es el indice.

Las decisiones operacionales puntuales que surgen durante la
ejecucion de una iniciativa se documentan en el archivo
`decisiones-<nombre-iniciativa>.md` de esa iniciativa, segun
PROC-GESTION-001. Solo las decisiones de **arquitectura** (que
trascienden la iniciativa que las origino) se promueven a este
documento.
