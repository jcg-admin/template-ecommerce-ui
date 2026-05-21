# Decisiones: Resolver hallazgos de deuda del template

| Campo | Valor |
|-------|-------|
| Iniciativa | resolver-hallazgos-de-deuda-del-template |
| Tipo de documento | Decisiones, hallazgos y verificacion post-ejecucion |
| Obligatoriedad | Obligatorio al cierre segun PROC-GESTION-001 v4.0.0 |
| Fecha de creacion | 2026-05-21 |

> **Por que este documento existe.** Las tareas dicen *que* se hizo. El
> progreso dice *cuanto*. Este documento registra el *por que*, los
> *hallazgos* y la *verificacion final*. Sin el, la iniciativa no esta
> cerrada aunque todas las tareas marquen completadas.

---

## Seccion 1 — Decisiones de diseno

Decisiones no obvias tomadas durante la ejecucion, con justificacion y
alternativa descartada. Una entrada por cada decision.

### dec-tetradica-de-hallazgos-vivos-vs-retirados-vs-delegados

| Campo | Valor |
|-------|-------|
| Decision | El inventario heredado de 20 hallazgos (H-01 a H-20) se reparte en cuatro destinos disjuntos: 5 resueltos en esta iniciativa, 2 delegados a iniciativas propias con backlog, 13 retirados (historicos del repo fuente, duplicados o fuera de scope) y 0 vivos remanentes. |
| Alternativas | (a) Resolver los 20 en esta iniciativa. (b) Retirar todos los del repo fuente sin discriminar y dejar solo los del template. (c) Abrir una iniciativa hija por cada hallazgo. |
| Razon | (a) Mezclaba limpieza con extension de dominio y CI/CD, las dos cosas declaradas fuera de scope. (b) Pierde trazabilidad: hay deuda real heredada que el template arrastra (H-05 allowlist hex) y merece quedar registrada. (c) Granularidad excesiva, la mayor parte de hallazgos no justifica una iniciativa propia. La particion en cuatro destinos preserva trazabilidad sin sobreingenierizar. |
| Trade-off aceptado | El inventario final tiene menos entradas que el original, lo que puede leerse como "se hizo menos trabajo". El log de progreso explica los retiros. |
| Cuando reevaluar | Si alguna iniciativa delegada queda sin abrir en 6 meses, conviene reconsiderar si era deuda real o reflejo de un momento. |

### dec-typescript-progresivo-no-big-bang

| Campo | Valor |
|-------|-------|
| Decision | El stack TypeScript se introduce con `allowJs: true` y `checkJs: false`. Solo dos modulos compartidos se migran efectivamente (`PropShapes.ts` -> luego `domain.ts`, y `serializeApiError.ts`). El resto del codigo sigue siendo `.js` o `.jsx` sin chequeo. |
| Alternativas | (a) Migracion big-bang de `src/` a `.ts`/`.tsx`. (b) Eliminar el stack TypeScript de `devDependencies` y declarar que el template es JavaScript puro. (c) Status quo (stack instalado pero sin consumidores). |
| Razon | (a) Riesgo alto, costo no atomizable en commits de 5-30 min, exigia revisar 100+ archivos. (b) Cierra la puerta a futuras migraciones progresivas y deja al adoptante con menos herramientas. (c) Es exactamente la deuda que H-03 declaraba. La opcion progresiva permite al adoptante migrar incrementalmente y al template demostrar que la cadena funciona. |
| Trade-off aceptado | El template queda con codigo mixto. Adoptantes que prefieran JS puro tienen tres archivos `.ts` que deberian renombrar. |
| Cuando reevaluar | Cuando se abra una iniciativa que migre un subarbol grande (paginas, slices), revisar si conviene activar `checkJs` o subir a `strict` un subconjunto via `include`/`exclude`. |

### dec-tipos-canonicos-en-lugar-de-prop-types

| Campo | Valor |
|-------|-------|
| Decision | El modulo `src/types/` adopta TypeScript como unica fuente del contrato del dominio. El paquete `prop-types` y `@types/prop-types` se retiran. La validacion runtime se considera redundante con la validacion compile-time de TypeScript en archivos `.ts`/`.tsx`. |
| Alternativas | (a) Mantener dual export (PropTypes.shape + interface) como en la migracion T-008 original. (b) Quedarse solo con prop-types y no usar TypeScript. (c) Esquema runtime con zod o ajv. |
| Razon | (a) PropShapes tenia cero consumidores en `src/` y `tests/` cuando se inspecciono al iniciar Fase 5; mantener el dual export sin usuarios era ruido. (b) Cierra la puerta al stack TS ya verificado. (c) Sobredimensionado para un cleanup; si en el futuro hace falta validacion runtime, va a una iniciativa propia. |
| Trade-off aceptado | Componentes `.jsx` que reciban entidades por prop pierden validacion runtime. Mitigacion: tales componentes son raros en el template (Redux + selectors es lo dominante); cuando aparezcan, se migran a `.tsx`. |
| Cuando reevaluar | Si la iniciativa `completar-dominio-de-ecommerce` introduce esquemas de validacion de input (formularios largos, payloads de API contra contrato), conviene evaluar zod o yup como capa unica de schema + tipo. |

### dec-decoradores-aplicados-selectivamente-no-en-toda-funcion

| Campo | Valor |
|-------|-------|
| Decision | Los tres decoradores (`withLogging`, `withValidation`, `withCaching`) se aplican solo en puntos clave: `apiService._request` (todos los HTTP), tres thunks de credenciales (`loginUser`, `registerUser`, `changePassword`), dos thunks de pago, `applyVoucher`, `searchProducts`. No se aplica a todos los thunks indiscriminadamente. |
| Alternativas | (a) Aplicar `withLogging` a todos los thunks. (b) Wrappers genericos via middleware Redux. (c) Solo decoradores en `apiService`, ningun thunk. |
| Razon | (a) Genera ruido masivo en consola sin valor proporcional; muchos thunks son `fetch + setear estado` sin riesgo de leak de credenciales ni necesidad de validacion. (b) Mas elegante pero menos explicito; el adoptante ve donde se aplica cada decorator leyendo el slice. (c) Pierde el caso de uso principal de `withValidation` (rechazar payload invalido antes de la red). La aplicacion selectiva con criterios claros (toca credenciales, dispara pago, necesita cache) es el equilibrio. |
| Trade-off aceptado | El adoptante que quiera logging universal debe replicar el patron por su cuenta. Mitigacion: los tests muestran el patron y los commits T-010 a T-014 sirven de plantilla. |
| Cuando reevaluar | Si aparece un thunk que tocaria credenciales sin estar protegido (auditoria periodica), o si el TTL del cache resulta inapropiado en produccion. |

### dec-validacion-build-via-script-no-via-ci-cd

| Campo | Valor |
|-------|-------|
| Decision | La proteccion contra desplegar un bundle con `API_URL` equivocada se implementa con (a) `scripts/verify-build.mjs` ejecutable a mano, y (b) `window.__APP_CONFIG__` para diagnostico runtime. No se introduce CI/CD. |
| Alternativas | (a) GitHub Actions workflow que corra `verify-build` en cada PR. (b) Pre-push hook que valide el build antes de empujar. (c) Solo documentacion sin script. |
| Razon | El usuario declaro CI/CD fuera de scope explicitamente. (b) Es lento (build entero antes de cada push) y no detecta el caso real (build del servidor con `.env` diferente al del dev). (c) Sin script no hay reproducibilidad de la verificacion. El script local invocable manualmente respeta la restriccion del usuario y deja la puerta abierta para que una iniciativa futura lo integre en un pipeline si CI/CD se introduce. |
| Trade-off aceptado | La verificacion depende de que el operador la ejecute disciplinadamente antes del deploy. Mitigacion: `como-adaptar-este-template.md` y `vista-de-despliegue.md` la incluyen en checklists explicitas. |
| Cuando reevaluar | Cuando se introduzca CI/CD en el template (no en esta iniciativa). El script ya es compatible con cualquier runner: Node ESM zero-deps, exit codes claros. |

### dec-cambio-de-alcance-fase-5-replan

| Campo | Valor |
|-------|-------|
| Decision | Tras iniciar la Fase 5 original con T-015 a T-019 (aplicar PropShapes a componentes especificos), se descubrio que la mayoria de componentes nombrados en el plan no existen y que el contrato de PropShapes no refleja el dominio real. Se replanifica la fase a una sola tarea T-015 reformada: reemplazar PropShapes por tipos canonicos en TypeScript, retirar `prop-types`, delegar la extension del dominio (Address como entidad, ProductVariant, Review, User extendido) a la iniciativa `completar-dominio-de-ecommerce` registrada en backlog. |
| Alternativas | (a) Forzar las 5 tareas originales contra los componentes que si existen, ajustando el plan paso a paso. (b) Retirar H-02 entero como "no aplicable". (c) Ampliar el scope de esta iniciativa para incluir el dominio extendido. |
| Razon | (a) Generaba 4 tareas-zombie sin valor real. (b) Pierde la oportunidad de dejar tipos canonicos vivos para lo que el template si implementa. (c) Mezcla extension de dominio con cleanup, fallo de scope que esta iniciativa estaba evitando deliberadamente. La opcion elegida produce valor real (tipos canonicos vivos) y registra honestamente el gap como iniciativa propia con su directorio y motivo de existencia. |
| Trade-off aceptado | H-02 queda marcado como "resuelto parcialmente con delegacion" en el inventario, lo que requiere mayor atencion del lector. Mitigacion: cada tipo en `domain.ts` lleva JSDoc indicando completo/parcial con referencia cruzada al slug `completar-dominio-de-ecommerce`. |
| Cuando reevaluar | Esta decision se reevalua cuando se abra `completar-dominio-de-ecommerce` y se cierre. En ese momento los JSDoc de `domain.ts` deben actualizarse para reflejar lo que ya este "completo". |

### dec-procedimiento-formal-de-backlog-introducido-aqui

| Campo | Valor |
|-------|-------|
| Decision | Se introduce un catalogo unico `indice-de-iniciativas.md` y se renombran los `README.md` previos a nombres auto-descriptivos (`como-gestionar-iniciativas.md`, `indice-de-iniciativas.md`). Las iniciativas delegadas (H-05, H-07 y la nueva `completar-dominio-de-ecommerce`) obtienen su directorio reservado con `index.md` minimo declarando estado "Backlog". |
| Alternativas | (a) Mencionar las delegadas solo en `riesgos-y-deuda-tecnica.md` sin directorio. (b) Tabla en `como-gestionar-iniciativas.md` mezclando procedimiento con catalogo. (c) Tres tablas separadas por estado (registradas, previstas, en commits). |
| Razon | (a) Era el estado original; produjo "deuda de iniciativas prometidas sin lugar fisico" en T-003 que esta iniciativa misma tuvo que saldar despues. (b) Mezcla dos conceptos (como gestionar vs que se gestiona) en un archivo, lo que llevo a duplicacion vivente entre los dos README.md preexistentes. (c) Multiplica el numero de tablas y obliga a mover filas cuando cambia el estado; una sola tabla con columna `Estado` es mas robusta. |
| Trade-off aceptado | Los nombres `README.md` ya estaban en el repo y tenian inercia de convencion GitHub. Renombrarlos requiere que los lectores busquen `como-gestionar-iniciativas.md` en vez de README. Mitigacion: GitHub seguira mostrando el README de raiz; los dos renombrados estan dentro de `docs/pm/`, donde el lector ya esta navegando archivos por nombre, no por convencion. |
| Cuando reevaluar | Si el repo adopta otro stack de documentacion (Sphinx, MkDocs) que tenga su propia convencion de indice. |

---

## Seccion 2 — Hallazgos durante la ejecucion

Cosas que no se sabian al planear y que se descubrieron al ejecutar.
Cada hallazgo cambio algo del plan o de las decisiones; queda
registrado para futuras iniciativas similares.

### hallazgo-distribuion-fisica-no-coincide-con-categoria-conceptual

T-001 y T-002 originalmente repartian 9 hallazgos a retirar entre dos
archivos sin verificar primero la distribucion fisica. Cuando se
inspeccionaron los archivos, las entradas estaban repartidas
distinto: 5 en `riesgos-y-deuda-tecnica.md`, 8 en
`decisiones-analizar-ramas-pendientes-*.md` (4 historicas + 4
duplicados). Tareas redistribuidas para que cada tarea toque un solo
archivo (regla de atomicidad).

**Aprendizaje**: al planear tareas de limpieza, verificar la
distribucion fisica antes de definir cuantas tareas habra.

### hallazgo-babel-preset-typescript-ya-configurado

T-006 esperaba "verificar y anadir babel-jest si falta". Al
inspeccionar `babel.config.cjs`, el preset ya estaba configurado en
root y en `env.test`. La tarea se redujo a verificacion funcional
con `node -e`. Cero modificaciones al archivo.

**Aprendizaje**: las tareas marcadas como "anadir X si falta" deben
empezar siempre con la verificacion antes de la modificacion.

### hallazgo-baseurl-deprecado-en-typescript-6

T-008 fallo en la primera ejecucion porque TypeScript 6.0.3 trata
`baseUrl` como error deprecado (TS5101). Solucion: anadir
`ignoreDeprecations: "6.0"` al `tsconfig.json`. Migracion a
`paths` sin `baseUrl` queda como follow-up latente cuando se
actualice a TS 7.

### hallazgo-prop-types-sin-declaraciones-typescript

T-008 fallo de nuevo porque `prop-types` no expone tipos. Resuelto
instalando `@types/prop-types` como devDependency. Esta dependencia
se retiro despues en T-015 reformada al eliminar PropShapes entero,
asi que vivio menos de un dia en el lockfile.

### hallazgo-apierror-no-declara-validationerrors

T-009 fallo porque `APIError` (clase base en `apiErrors.js` aun en
JS) no declara `validationErrors`; solo la subclase
`ValidationError` la anade. Solucion: cast tipado con comentario
explicando que el cast desaparece cuando `apiErrors.js` migre a TS.

### hallazgo-apiservice-fetch-no-existe

T-010 esperaba aplicar `withLogging` a `apiService.fetch`. El
metodo no existe: la API es `get/post/put/patch/delete` y todos
llaman a `_request` privado. Solucion: envolver `_request` en el
constructor; cubre todas las requests HTTP via cualquiera de los
cinco verbos publicos.

**Aprendizaje**: nombres concretos en el plan deben verificarse
contra el codigo real antes de aprobar el plan.

### hallazgo-thunks-de-auth-con-otros-nombres

T-011 esperaba "login, register, deactivateAccount". Los thunks
reales son `loginUser`, `logoutUser`, `registerUser`,
`fetchProfile`, `updateProfile`, `changePassword`, `verifyEmail`,
`resendVerificationEmail`. Los candidatos para `withLogging`
(tocan credenciales) son `loginUser`, `registerUser`,
`changePassword`. Sustituidos en consecuencia.

### hallazgo-sanitizer-no-cubre-currentpassword-newpassword

El sanitizer de `withLogging` busca campos literalmente llamados
`password`, `token`, `apiKey`. `changePassword` recibe
`currentPassword`, `newPassword`, `confirmPassword`, que el
sanitizer no detecta. Decision: `changePassword` con
`logArgs: false` (no loguear args; mejor que loguearlos en claro).
Extender el sanitizer queda como follow-up latente.

### hallazgo-validateid-espera-escalar-no-objeto

T-012 esperaba aplicar `CommonValidators.validateId('order_id')` a
los thunks de pago. `validateId` espera un escalar; el thunk
recibe un objeto `{ order_id, installments }`. Solucion: wrapper
`validatePaymentPayload(payload)` que valida que es objeto y
delega en `validateId(payload.order_id)`.

### hallazgo-componentes-de-prop-drilling-no-existen

T-015 a T-019 originales esperaban componentes que reciben
entidades por prop (`UserCard`, `UserBadge`, `ProductList`,
`CartItem`, `OrderSummary`, `OrderList`). El template usa Redux +
selectors; esos componentes mayoritariamente no existen. PropShapes
heredado contenia ademas un contrato teorico distinto al dominio
real (`price` vs `base_price`/`price_with_tax`).

Este hallazgo motivo la decision mas grande de la iniciativa
(`dec-cambio-de-alcance-fase-5-replan`).

**Aprendizaje**: cuando un plan asume una arquitectura (en este
caso prop-drilling), verificar la arquitectura antes de planear las
tareas que dependen de ella.

---

## Seccion 3 — Verificacion post-ejecucion

Comprobaciones finales que confirman que la iniciativa cumple lo
declarado en el alcance.

### Estado del inventario de hallazgos

Cinco hallazgos vivos en el inventario al inicio (H-01, H-02, H-03,
H-04, H-08). Resultado final:

| Hallazgo | Slug | Estado final |
|----------|------|--------------|
| H-01 | deuda-decorators-experimental | Resuelto |
| H-02 | deuda-tipos-en-src-types | Resuelto parcialmente con delegacion a `completar-dominio-de-ecommerce` |
| H-03 | deuda-sin-typescript-en-src | Resuelto |
| H-04 | deuda-readme-sin-actualizar-tras-cambios | Resuelto |
| H-08 | riesgo-bundle-construido-con-API-URL-equivocada | Resuelto |

Hallazgos delegados antes de empezar:

| Hallazgo | Slug | Destino |
|----------|------|---------|
| H-05 | deuda-de-allowlist-color-no-hex | `monitorear-y-reducir-allowlist-hex` |
| H-07 | riesgo-divergencia-mocks-vs-contrato-real | `validar-contrato-de-mocks-vs-backend-real` |

Hallazgos retirados (heredados del repo fuente, no aplican al
template): H-06, H-09 a H-20 (13 entradas).

### Tests

Todos los tests pasan al cierre de la iniciativa:

- `npx tsc --noEmit` exit 0.
- `npx jest tests/unit src/redux/slices src/utils` pasa 27 suites
  y 184 tests.
- 21 tests nuevos anadidos en Fase 4 (4 apiService, 4 authSlice
  logging, 7 paymentsSlice, 6 cartSlice.applyVoucher, 4
  catalogSlice.searchProducts).

### Build

`npm run build` cierra en verde. El bundle contiene los tres
campos esperados de `window.__APP_CONFIG__` (`apiUrl`, `version`,
`builtAt`). El script `npm run verify-build` y la variante con
`--expected=$API_URL` se ejercitaron contra builds reales y
detectaron correctamente los tres casos disenados (URL ausente,
localhost, URL no esperada).

### Plan vs ejecucion

Plan original: 25 tareas atomicas, ~545 min agregados.
Plan tras el replan de Fase 5: 21 tareas atomicas, ~520 min.
Ejecucion real: 21 tareas cerradas en 8 sesiones distribuidas.

### Backlog poblado

Las tres iniciativas previstas tienen ahora directorio y `index.md`
minimo registradas en `indice-de-iniciativas.md` con orden de
ejecucion propuesto:

1. `validar-contrato-de-mocks-vs-backend-real` (H-07 delegada)
2. `completar-dominio-de-ecommerce` (replan Fase 5)
3. `monitorear-y-reducir-allowlist-hex` (H-05 delegada)

### Procedimiento mejorado

Esta iniciativa modifico el procedimiento `como-gestionar-iniciativas.md`
para introducir el concepto formal de backlog y el catalogo unico
`indice-de-iniciativas.md`. Cualquier iniciativa futura entra al
catalogo desde el momento en que se propone, no solo cuando se abre.

---

## Seccion 4 — Que entrego esta iniciativa

Resumen para alguien que llegue al repo en seis meses y quiera saber
que aporto este trabajo.

| Categoria | Aportes concretos |
|-----------|-------------------|
| Codigo | `src/types/domain.ts` (tipos canonicos), `src/utils/serializeApiError.ts` (migracion TS), `apiService` con `withLogging`, 5 thunks con decoradores, `scripts/verify-build.mjs`, `window.__APP_CONFIG__`. |
| Infraestructura | `tsconfig.json` con `allowJs`, soporte end-to-end de `.ts`/`.tsx` via babel-jest, BUILT_AT en webpack. |
| Tests | 21 tests nuevos en `tests/unit/`. |
| Documentacion | README de raiz con bloque arc42+pm, `como-adaptar-este-template.md` con checklist de adopcion extendida, `vista-de-despliegue.md` con seccion de verificacion antes del deploy, inventario de riesgos y deuda limpiado y actualizado. |
| Procedimiento | `como-gestionar-iniciativas.md` y `indice-de-iniciativas.md` como pareja auto-descriptiva. Backlog formalizado. |

Lo que NO entrego esta iniciativa (delegado a backlog):

- Validacion del contrato de mocks contra backend real.
- Extension del modelo de dominio (Address, Variant, Review, User+).
- Monitoreo y reduccion automatizada de la allowlist hex.
