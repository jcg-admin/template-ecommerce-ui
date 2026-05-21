# Reconsideracion bajo RUP adaptado

| Campo | Valor |
|-------|-------|
| Iniciativa | revisar-arquitectura-de-mocks |
| Documento anexo a | `analisis-revisar-arquitectura-de-mocks.md` y `analisis-trade-off-service-worker.md` |
| Fecha | 2026-05-21 |

Este documento existe porque el usuario pidio reconsiderar la
recomendacion (MSW + Faker) **a la luz de RUP como metodologia
adaptada al proyecto**. Durante esta reconsideracion se descubrio
informacion del repositorio que el analisis general **no habia
incorporado**: una ADR previa que descarto MSW. Esto obliga a
reformular el problema completo.

## Que significa RUP adaptado en este proyecto

RUP completo seria desproporcionado para una iniciativa tecnica de
limpieza. Los **principios RUP que SI aplican** y como se aterrizan
en lo que el proyecto ya tiene:

| Principio RUP | Como se aterriza aqui |
|---------------|------------------------|
| Architecture-centric | Decisiones tecnicas viven en `docs/decisiones-de-arquitectura/` como ADRs. El proyecto ya tiene 10 ADRs. |
| Risk-driven | Iniciativas atacan riesgos declarados en `docs/riesgos-y-deuda-tecnica/`. |
| Driven by use cases | El proyecto trabaja con 86 UCs distintos (UC-AUTH-NN, etc.) referenciados en commits y en analisis de ramas. |
| Iterative & incremental | Cada iniciativa es una iteracion; las tareas atomicas T-NNN con DAG son los incrementos. |
| Software Architecture Document (SAD) | arc42 cubre el rol del SAD: 10 carpetas en `docs/` mapean a vistas y disciplinas. |

Tres consecuencias operativas que el analisis general **omitio**:

1. Cualquier decision que toque arquitectura debe pasar por el
   **registro de ADRs** existente, leerlo primero y, si propone
   cambio, **superseder explicitamente** la ADR previa.
2. La decision debe atacar un **riesgo declarado** en el inventario.
3. La decision debe verificarse contra **casos de uso reales** del
   proyecto, no contra benchmarks genericos.

## Hallazgo critico del descubrimiento

`docs/decisiones-de-arquitectura/decisiones-de-arquitectura.md`
contiene la ADR vigente `dec-mock-first-via-feature-flags-por-dominio`.
Texto literal de su seccion "Alternativas" y "Razon":

> Alternativas: (a) MSW (Mock Service Worker). (b) Servidor
> json-server local.
>
> Razon: El interceptor in-process es trivial de mantener y no
> requiere proceso adicional. MSW agrega un service worker que
> complica el setup de Jest.

**Esta ADR ya considero MSW y json-server, y los descarto explicita-
mente.** El analisis general nuestro recomendaba revertir esa
decision **sin haber leido la ADR**. Esto es un fallo de proceso por
mi parte: bajo cualquier metodologia disciplinada (RUP incluida),
proponer cambiar una decision arquitectonica registrada requiere
empezar por leer la decision previa, no por benchmark genericos del
ecosistema.

Tambien expone una debilidad de la ADR vigente: su afirmacion
*"MSW agrega un service worker que complica el setup de Jest"* es
**incorrecta tecnicamente** en 2026. MSW v2 funciona en Jest via
`msw/node` (no Service Worker; intercepta el modulo `http` de Node).
El setup en Jest es trivial: `setupServer(...handlers)`. Esta
contradiccion debe documentarse aunque la decision final sea
mantener el interceptor.

## Reformulacion del problema bajo RUP

La pregunta correcta cambia. Ya no es "¿que arquitectura de mocks
es mejor?" en abstracto. Es:

> *Dada la ADR `dec-mock-first-via-feature-flags-por-dominio` que
> declara el interceptor como decision aceptada, y dado que esa ADR
> contiene una premisa tecnica incorrecta sobre MSW en Jest, ¿existe
> razon de riesgo declarado, caso de uso o consecuencia observada que
> justifique superseder la ADR?*

Para responder hay que mapear contra los tres criterios RUP
adaptados.

### Mapeo 1 — Riesgos declarados que la ADR vigente induce

Inventario `docs/riesgos-y-deuda-tecnica/riesgos-y-deuda-tecnica.md`,
seccion **Consecuencias** de la ADR:

> *"Mocks pueden divergir del contrato real sin que ningun test lo
> detecte. Esta deuda esta declarada en `riesgos-y-deuda-tecnica/`."*

El riesgo correspondiente esta registrado como
`riesgo-divergencia-mocks-vs-contrato-real`. **Pero este riesgo es
independiente de la arquitectura del mock**: existe igual con
interceptor, con MSW, con json-server. Lo resuelve la iniciativa
siguiente (`validar-contrato-de-mocks-vs-backend-real`).

La ADR vigente no induce riesgos especificos del interceptor.

### Mapeo 2 — Casos de uso reales que se ven afectados

El proyecto tiene 86 UCs catalogados. ¿Cuales se ven afectados por
la eleccion de arquitectura de mocks?

- **UCs que tocan el cliente HTTP** directamente: practicamente
  ninguno. Los UCs estan al nivel funcional (`UC-AUTH-16 Dar de
  baja`, etc.), no al nivel de transporte.
- **UCs que tocan tests**: todos, indirectamente. 184 tests pasan
  hoy con el interceptor; cualquier cambio de arquitectura debe
  preservarlos.
- **UCs que se desbloquean por el cambio**: ninguno identificado. El
  template no esta bloqueado funcionalmente por la arquitectura
  actual de mocks.

Bajo "driven by use cases", **no hay UC concreto que reclame el
cambio**.

### Mapeo 3 — Consecuencias observadas de la ADR vigente

Tras dos iniciativas cerradas (analizar-ramas, resolver-deuda) y un
inventario actualizado, las consecuencias **observadas** del
interceptor actual son:

| Consecuencia | Severidad |
|--------------|-----------|
| `apiService._request` tiene rama `mockInterceptor.intercept` antes del fetch | Estetica; no impide nada |
| `src/mocks/` tiene 1054 lineas (orquestador 319 + registry 155 + sub-interceptores 580 con tests embebidos) | Manejable, modificable |
| `_SOURCE` por dominio en webpack defaults | Funciona, documentado |
| Tests Jest verdes (184/184) con el interceptor | Aceptado |
| Adoptante puede `npm install && npm run dev` sin pasos extra | Cumple criterio fundamental |

**Ninguna consecuencia observada es bloqueante.** El template
funciona. Adoptable. Verificable. La unica queja real seria estetica
("el codigo de produccion sabe que existe el mock").

### Mapeo bajo SAD vistas 4+1

| Vista | Impacto del cambio interceptor -> MSW |
|-------|----------------------------------------|
| Logica | Casi nulo. Los slices/thunks no cambian. |
| Procesos | Cambia el "donde se intercepta": en proceso (actual) vs Service Worker (MSW). No hay procesos adicionales. |
| Implementacion | Reescritura de ~1054 lineas de mocks a handlers MSW. Trabajo real. |
| Despliegue | Anade `mockServiceWorker.js` en `public/` (cubierto en `analisis-trade-off-service-worker.md`). |
| +1 Casos de uso | Ninguno se desbloquea ni se bloquea. |

El cambio toca **implementacion** y **despliegue** materialmente;
toca **procesos** simbolicamente; **no toca** logica ni casos de
uso.

## Reconsideracion de la recomendacion

A la luz de RUP adaptado, el peso de la recomendacion cambia. El
analisis general comparaba MSW vs interceptor **como si no hubiera
historia**. La historia es:

1. El interceptor fue **decision deliberada** registrada en ADR.
2. Esa ADR considero MSW y lo descarto.
3. La razon registrada del descarte es **tecnicamente incorrecta hoy**
   (Jest setup no se complica con MSW v2).
4. La decision sigue funcionando en la practica.

Tres caminos posibles, ordenados por respeto a la disciplina
arquitectonica:

### Camino A — Mantener la ADR vigente, corregir su justificacion

Mantener el interceptor actual. Modificar la ADR para corregir su
premisa tecnica:

> Antes: *"MSW agrega un service worker que complica el setup de
> Jest"*
>
> Despues: *"MSW v2 soporta Jest correctamente via msw/node. Razon
> real del descarte: la complejidad de migracion supera el beneficio
> arquitectonico observado; el interceptor actual cubre 184 tests
> sin friccion; no hay UC bloqueado por la arquitectura."*

Tareas resultantes:

1. Corregir la ADR vigente con su justificacion real.
2. Anadir esta iniciativa al inventario como "evaluada, decision:
   no migrar".
3. Cerrar la iniciativa con `decisiones-*.md` que documente la
   reconsideracion y conclusion.
4. **Opcional**: anadir Faker + factories tipadas contra `domain.ts`
   al interceptor existente para resolver el problema real
   (datos hardcoded poco realistas). Es deuda menor y aportaria
   valor sin tocar la arquitectura.

Costo: bajo. Una correccion de ADR + una iniciativa que registra
su propio cierre + opcionalmente la capa Faker (1-2 commits).

### Camino B — Superseder la ADR vigente con MSW

Producir una nueva ADR `dec-mocks-via-msw-service-worker` que
explicita:

- Supersede `dec-mock-first-via-feature-flags-por-dominio`.
- Razon: la justificacion previa contenia premisa tecnica
  incorrecta; reevaluando con datos 2026, MSW elimina el
  acoplamiento de produccion sin penalizacion en Jest.
- Trade-off documentado: `mockServiceWorker.js` en `public/` (ya
  analizado).
- Consecuencias: 1054 lineas de `src/mocks/` se reescriben como
  handlers MSW tipados.

Costo: alto. El plan esbozado en el analisis general (12 tareas
atomicas) sigue valido, pero ahora ademas debe incluir:

- Tarea explicita "supersede ADR previa".
- Verificacion de que **ningun UC** se rompe (lo cual exige correr
  los 86 UCs si existen como tests E2E, o al menos los 184 unit
  tests).
- Actualizacion de `docs/vista-de-bloques-de-construccion/` para
  reflejar la nueva pieza.

### Camino C — Mantener la ADR vigente, no tocar nada

Cerrar la iniciativa concluyendo "decision previa correcta a la luz
de los criterios del template, no se modifica nada".

Costo: minimo. Pero deja sin corregir la premisa tecnicamente
incorrecta de la ADR, lo cual contradice la disciplina
arquitectonica del proyecto.

## Que cambia respecto a la recomendacion original

Recomendacion original (`analisis-revisar-arquitectura-de-mocks.md`):

> *"Adoptar MSW como arquitectura de mocks del template, complementada
> con Faker + factory para datos realistas."*

Recomendacion bajo RUP adaptado:

> **Camino A: corregir la ADR vigente, mantener el interceptor,
> anadir Faker + factories como mejora de bajo costo.**

Justificacion del cambio:

1. **Architecture-centric**: existe ADR previa que la recomendacion
   original ignoraba; bajo RUP esa ADR tiene autoridad hasta que se
   supersede formalmente.
2. **Risk-driven**: ningun riesgo declarado del inventario justifica
   el cambio. El unico riesgo real (`riesgo-divergencia-mocks-vs-
   contrato-real`) es independiente de la arquitectura del mock y se
   resuelve en la iniciativa siguiente.
3. **Driven by use cases**: ningun UC se bloquea ni desbloquea por
   este cambio.
4. **Costo/beneficio**: Camino A cuesta poco y produce mejora
   (Faker + factories) sin reescribir 1054 lineas; Camino B cuesta
   mucho y produce mejora estetica.
5. **Honestidad del proceso**: la ADR vigente tenia un argumento
   tecnico debil; corregirlo es mas valioso que sortearlo.

## Lo que mantengo de los analisis previos

- El **inventario de las 9 alternativas** sigue util como
  referencia historica.
- El **analisis del trade-off del Service Worker** sigue siendo
  correcto; solo deja de ser relevante en Camino A.
- Los **datos web 2026** (MSW v2.14.6, 17,925 stars, etc.) siguen
  validos. No cambian la recomendacion bajo RUP; cambian la
  recomendacion bajo "elige la herramienta mas popular del
  ecosistema".

## Decision pendiente — version corregida

Las opciones que te propongo aprobar son:

- **Camino A** (recomendado): mantener interceptor, corregir ADR,
  anadir Faker + factories (opcional pero recomendado).
- **Camino B**: superseder ADR, migrar a MSW + Faker como esbozado
  originalmente.
- **Camino C**: no tocar nada.

Tras la decision se produce `plan-*.md` con las tareas atomicas
correspondientes al camino elegido.

## Reflexion final sobre el proceso

Esta reconsideracion expone un **fallo de metodo** en como produje
el analisis general:

- No inspeccione `docs/decisiones-de-arquitectura/` antes de
  recomendar un cambio arquitectonico.
- Trate el problema como "decision desde cero" cuando era
  "reevaluacion de decision previa".
- Use benchmarks del ecosistema (stars, downloads) como criterio
  primario cuando RUP exige usar **criterios del proyecto**
  (riesgos, UCs, ADRs vigentes).

Esto se corrige incorporando al procedimiento
`como-gestionar-iniciativas.md` un paso explicito **"verificar ADRs
existentes antes de proponer cambios arquitectonicos"**. Es un
ajuste de procedimiento que tambien deberia quedar como aporte de
esta iniciativa, independientemente del camino elegido.
