# Alcance: Revisar arquitectura de mocks

| Campo | Valor |
|-------|-------|
| Iniciativa | revisar-arquitectura-de-mocks |
| Estado | En analisis |
| Version | 0.1.0 |
| Fecha de creacion | 2026-05-21 |
| Iniciativa origen | (raiz) |

## Por que existe esta iniciativa

El template implementa los mocks mediante un **interceptor dentro del
cliente HTTP**: `src/mocks/mockInterceptor.js` se llama desde el
metodo privado `_request` de `apiService.js` antes de hacer la
peticion real. La activacion se controla con variables `*_SOURCE` por
dominio (`AUTH_SOURCE=mock`, `CART_SOURCE=mock`, etc.) leidas en build
time.

Esta arquitectura cumple su funcion pero tiene tres consecuencias
que conviene revisar:

1. **Acopla codigo de produccion al modo mock.** `apiService` tiene
   logica que solo existe para el mock; el codigo del cliente sabe
   que existe un modo simulado.
2. **El contrato de los mocks no es verificable formalmente.** Cada
   archivo de `src/mocks/` es JavaScript que devuelve objetos
   literales; nada garantiza que coincida con lo que el backend Django
   produce.
3. **Los datos son hardcoded.** No hay generacion programatica
   (Faker), no hay seeding, no hay variabilidad realista. Tres
   productos, dos ordenes, un usuario.

Cuando llegue el backend real, la friccion sera tres veces: ajustar
la arquitectura para no necesitar la rama mock en produccion, validar
que los contratos coinciden, y poblar datos realistas. Esta iniciativa
**aborda solo la primera**: decidir como vive el mock en el template.

La validacion del contrato (segunda) es la iniciativa siguiente,
`validar-contrato-de-mocks-vs-backend-real`. La generacion de datos
realistas (tercera) podria caer dentro de esta iniciativa si la
alternativa elegida lo facilita, o quedar como deuda menor.

## Que esta dentro del alcance

1. **Analizar alternativas de arquitectura de mocks** contra los
   criterios del template.
2. **Recomendar una alternativa** con justificacion explicita.
3. **Aplicar la alternativa** si la decision es cambiar; producir
   los archivos, scripts y documentacion necesarios.
4. **Documentar la decision** y la migracion en
   `decisiones-revisar-arquitectura-de-mocks.md`.
5. **Actualizar la documentacion arc42** afectada (al menos
   `vista-de-bloques-de-construccion/`, posiblemente
   `decisiones-de-arquitectura/`).

## Alternativas a evaluar

Una entrada por alternativa. El analisis (siguiente documento) las
comparara contra los criterios del template y producira una
recomendacion.

### alt-mantener-interceptor-actual

Status quo. `src/mocks/mockInterceptor.js` dentro del cliente HTTP
con activacion `*_SOURCE=mock` en `.env`. Documentar el contrato de
forma mas estricta sin cambiar la arquitectura.

### alt-msw-service-worker

Mock Service Worker. Intercepta `fetch` y XHR al nivel de Service
Worker en el navegador y como funcion en Node para Jest. El codigo
cliente no sabe que existe un mock. Mismo handler para dev y para
tests. Es la opcion estandar actual en el ecosistema React.

### alt-json-server

Servidor HTTP separado que sirve respuestas desde un archivo JSON.
Corre en `localhost:3001` aparte del dev server. Bajo mantenimiento
pero requiere que el operador arranque dos procesos en desarrollo.

### alt-prism-desde-openapi

`@stoplight/prism` arranca un servidor mock generado automaticamente
desde una especificacion OpenAPI. Requiere producir y mantener la
especificacion. Da el contrato como subproducto.

### alt-mirage-js

Servidor mock embebido en el cliente, con ORM interno. Permite
declarar factories, relaciones y estado persistente durante la
sesion. Mas opinionated que MSW.

### alt-mockoon

Aplicacion desktop que sirve mocks HTTP configurados visualmente.
Util para personas no tecnicas. Genera un servidor consumible por
cualquier cliente.

### alt-wiremock

Servidor mock con record-replay desde trafico real, foco en
testing JVM pero usable como proxy HTTP independiente. Util si en
algun momento se obtiene acceso temporal al backend real para grabar.

### alt-hoverfly

Similar a WireMock pero orientado a simulacion de fallos (latencia,
errores 5xx, circuit breaker). Util mas para resiliencia que para
desarrollo cotidiano.

### alt-faker-mas-factory-sobre-interceptor

No es una arquitectura diferente, es una capa adicional sobre la
actual. Anadir `faker-js` a `src/mocks/` para generar datos realistas
manteniendo el interceptor existente. Se evalua como complemento a
cualquiera de las anteriores que mantenga el codigo del mock dentro
del repositorio.

## Criterios de evaluacion del template

Cada alternativa se mide contra estos criterios. Un solo criterio
fallido no descalifica automaticamente, pero condiciona la
recomendacion.

| Criterio | Que mide |
|----------|----------|
| **Adoptable por terceros** | Un adoptante del template debe poder ejecutar `npm install && npm run dev` y tener mocks funcionando sin pasos extra (instalar Java, configurar IDE, levantar otro proceso). |
| **No acopla codigo de produccion** | Idealmente, eliminar la dependencia de `apiService.js` sobre el modulo `mocks/`. Si la arquitectura mantiene el acoplamiento, debe estar justificado. |
| **Trazabilidad con el dominio** | El mock debe ser legible y modificable manualmente; un adoptante con un nuevo endpoint debe poder agregarlo sin generadores opacos. |
| **Compatible con Jest** | El mismo mock debe funcionar para los tests `tests/unit/` ya existentes (27 suites, 184 tests verdes al cierre de la iniciativa previa). |
| **Compatible con la migracion progresiva a TS** | Los mocks deben tipar usando `src/types/domain.ts` ya producido en la iniciativa cerrada `resolver-hallazgos-de-deuda-del-template`. |
| **Sin dependencias pesadas** | No introducir runtime Java, Docker obligatorio, ni binarios fuera de npm. |
| **Posibilidad de validar contra contrato** | La proxima iniciativa (`validar-contrato-de-mocks-vs-backend-real`) debe poder construir sobre lo elegido aqui. Alternativas que ya provean schema (OpenAPI) facilitan esa siguiente iniciativa. |

## Criterio de completitud verificable

La iniciativa esta lista para cerrar cuando todo lo siguiente es
verdad:

1. Existe `analisis-revisar-arquitectura-de-mocks.md` con una entrada
   por cada alternativa listada en este alcance, evaluada contra los
   criterios anteriores.
2. El usuario aprobo explicitamente una alternativa (recomendacion +
   confirmacion).
3. Si la decision fue cambiar de arquitectura: el codigo, scripts y
   tests reflejan la nueva arquitectura, `npm run dev` y `npm test`
   pasan, los 184 tests previos siguen verdes.
4. Si la decision fue mantener: la decision esta documentada con la
   razon explicita y `decisiones-*.md` registra los trade-offs
   conscientemente aceptados.
5. `decisiones-revisar-arquitectura-de-mocks.md` producido segun
   PROC-GESTION-001.
6. `docs/pm/iniciativas/indice-de-iniciativas.md` actualizado:
   estado de `En ejecucion` a `Cerrada`.

## Fuera de alcance

Lo siguiente **NO** se hace en esta iniciativa, aunque pueda
parecer relacionado:

- **Validar que los mocks reflejan el contrato real del backend.**
  Es la siguiente iniciativa, `validar-contrato-de-mocks-vs-backend-real`.
  Esta iniciativa decide *como* viven los mocks; la siguiente verifica
  que su *forma* coincide con el backend.
- **Extender el modelo de dominio.** `Address` como entidad,
  `ProductVariant`, `Review`, `User` extendido. Esto es
  `completar-dominio-de-ecommerce`, en backlog #2 tras esta iniciativa.
- **Implementar el backend real.** Esta iniciativa asume que el
  backend Django existira en su momento; no afecta su desarrollo.
- **Eliminar dependencias del cliente HTTP actual.** Si la
  alternativa elegida cambia el flujo, se ajusta `apiService.js`;
  pero no se reescribe el cliente HTTP completo.

## Decisiones de proceso

- El analisis comparativo se produce **una sola pasada**: una entrada
  por alternativa, todos los criterios, recomendacion al final.
- Si durante la ejecucion aparece una alternativa nueva que no esta
  en este alcance, se registra como `Cambio de alcance` en
  `progreso-*.md` y se evalua antes de proseguir.
- La aplicacion de la alternativa elegida (si aplica) se hace por
  tareas atomicas T-NNN siguiendo el patron de la iniciativa cerrada.
