---
artefacto: PROC-GESTION-TUI-001
tipo: Procedimiento
dominio: normativa
subdominio: metodologia/iniciativas
estado: Aprobado
version: 1.0.0
fecha_creacion: 2026-05-27T15:45:00
fecha_actualizacion: 2026-05-27T15:45:00
autor: NestorMonroy
clasificacion: Interno
repos: template-ecommerce-ui, template-ecommerce-server
---

# Procedimiento: Crear una Nueva Iniciativa en docs/pm/iniciativas/

> **Procedimiento obligatorio** que describe cómo crear y gestionar una iniciativa
> de trabajo bajo `docs/pm/iniciativas/<slug>/` en los repositorios
> `template-ecommerce-ui` y `template-ecommerce-server`.
>
> Aplica cada vez que se identifica un conjunto de trabajo nuevo que requiere
> análisis, planificación y seguimiento.
>
> **Repositorios válidos:** `template-ecommerce-ui`, `template-ecommerce-server`.
> Toda iniciativa pertenece a exactamente uno.

---

## Principio Rector

Antes de crear cualquier archivo en `docs/pm/iniciativas/`, se lee el
estado real del código fuente del repositorio. El análisis determina qué
documentos necesita la iniciativa — no una plantilla fija.

---

> **Verificación de cambios declarados**
>
> Cualquier ejecutor — persona o herramienta — puede declarar un cambio en
> texto y aplicarlo solo parcialmente o no aplicarlo. En sesiones largas esto
> se acumula sin que nadie lo detecte.
>
> **Regla del ejecutor:** Antes de declarar "listo" o presentar un archivo,
> verificar que cada cambio declarado en esa respuesta está efectivamente en
> el archivo. Si son varios puntos, revisarlos uno por uno y mostrar la
> evidencia concreta.
>
> **Regla del revisor:** Cuando alguien declare "lo agregué", "lo incluí",
> "lo documenté", pedir el fragmento exacto del archivo donde quedó antes de
> continuar. Si no puede mostrarlo, el cambio no fue aplicado.
>
> **Frase de verificación:** "muéstrame el fragmento exacto donde quedó"

---

## Fase 1 — Leer antes de crear (con Premise Gate)

Antes de abrir ningún archivo nuevo, se ejecuta el **Stage 0 Premise Gate**
definido en `.claude/rules/auto-audit-before-writing.md` sección
"Stage 0 — Premise Gate". Este gate es obligatorio y no se sustituye por
lectura informal.

El gate tiene tres niveles con promoción automática ante red flags:

**Nivel 0a** (~2 min, siempre)
Localizar el `file:line` citado en el audit o stub que motiva la iniciativa.
Confirmar que el código en esa línea coincide con la descripción del hallazgo.
Ejecutar `git log --grep` y `ls docs/pm/iniciativas/` en el repositorio afectado
para detectar iniciativas previas que pudieron cerrar hallazgos sin actualizar
el audit fuente (red flag 7).

**Nivel 0b** (~5 min, cuando severidad ≥ MEDIA)
Leer el análisis o audit completo, no solo la cita. Identificar patrones
sistémicos, drift sin fix, dependencias entre módulos.

**Nivel 0c** (~15-30 min, obligatorio si hay red flags activas)
Trazar el flujo end-to-end. Grep en los dos repositorios. Verificar
suposiciones del análisis contra el código real. Budget máximo 30 min.
Si no hay claridad, abrir iniciativa de investigación separada antes del
scaffold.

Las siguientes señales **obligan** escalar a nivel 0c sin excepción:

1. Drift documentado sin fix en el análisis o UC fuente.
2. Palabras-clave en el hallazgo: `state`, `storage`, `schema`, `migration`,
   `interceptor`, `middleware`, `signal`, `transaction`, `concurrent`,
   `cache`, `webhook`, `scheduler`, `lifecycle`.
3. Fix cross-repositorio (toca tanto `template-ecommerce-ui` como
   `template-ecommerce-server`).
4. Análisis anterior a un refactor relevante en el área.
5. Comentarios del código contradicen el comportamiento observado.
6. El análisis fue producido con alcance focal pero el fix toca
   infraestructura compartida (webpack config, SCSS globals, mocks base).
7. Iniciativas previas pudieron cerrar ítems del análisis sin actualizar
   su metadata.

El resultado del gate determina si se procede con el scaffold
(CONFIRMAR / EXPANDIR / COLAPSAR) o se detiene (REORDENAR / INVESTIGAR).
Ver la sección "Premisa verificada" del `alcance-<slug>.md` para el formato
obligatorio.

Además del gate, antes de abrir ningún archivo nuevo se responde con
precisión: *¿qué produce esta iniciativa y cuál es su criterio de
completitud?*

Esta lectura se hace con `cat` o `view`, no con comandos que modifiquen el
estado del repo. `bash_tool` se reserva para búsquedas de patrones, conteos
y compilación del build.

---

> **Auditoría cruzada con hallazgos previos**
>
> Antes de crear una iniciativa que corrija un hallazgo, verificar que no
> existe ya una iniciativa abierta o cerrada que cubra el mismo área:
>
> ```bash
> # Buscar iniciativas previas sobre el mismo tema
> ls <ruta-repo>/docs/pm/iniciativas/ | grep -i "<keyword>"
>
> # Buscar commits previos en el área afectada
> git -C <ruta-repo> log --oneline --grep="<keyword>" | head -10
> ```
>
> Si existe cobertura previa, verificar el progreso de esa iniciativa y
> actualizar el análisis fuente con `[CERRADO repo@hash]` antes de crear
> una nueva.

---

## Fase 2 — Decidir la estructura de la iniciativa

Con el análisis hecho, se decide qué documentos necesita la iniciativa.
El formato estándar de siete archivos Markdown es:

**`index.md`** (siempre presente)
Tres secciones: **Motivo** (por qué existe la iniciativa), **Estado actual**
(Pendiente / En ejecución / Completada / Cancelada), e **Índice** (lista de
los demás documentos con descripción de una línea cada uno). La **primera
sección** del alcance (`alcance-<slug>.md`) es siempre `Premisa verificada`
con el resultado del Premise Gate. Sin ella el alcance se considera incompleto
y el resto de artefactos no debe generarse.

**`alcance-<slug>.md`** (siempre presente)
Por qué existe la iniciativa, qué cubre, criterio de completitud verificable,
qué queda explícitamente fuera de alcance y estimación de esfuerzo. La primera
sección es `Premisa verificada`. Si durante la lectura se tomaron decisiones
de contenido no obvias, se registran aquí.

**`analisis-<slug>.md`** (siempre presente)
El diagnóstico concreto: qué falta, por qué falta, qué impacto tiene. Incluye
priorización MoSCoW y cualquier caso especial descubierto durante la lectura.
Cada hallazgo se clasifica como `PROVEN` (observable directo de herramienta
ejecutada), `INFERRED` (derivado de observables con razonamiento explícito) o
`SPECULATIVE` (sin fuente). Los claims `SPECULATIVE` no avanzan gates.
Ver `evidence-classification.md` en `.claude/skills/`.
El nombre del archivo describe qué se analizó, no el tipo de documento.

**`plan-<slug>.md`** (siempre presente)
DAG Mermaid de dependencias entre tareas y descripción de fases. **Sin tablas
de tareas** — esas van en `tareas-<slug>.md`. El plan responde a: ¿en qué
orden y por qué?

**`tareas-<slug>.md`** (siempre presente)
Lista plana con columnas `ID | Descripción | Estado` (Pendiente / Hecha).
Cada tarea toca exactamente un archivo en el repositorio. Las tareas se
referencian desde el progreso y los commits.

**`progreso-<slug>.md`** (siempre presente)
Log con columnas `Timestamp | Evento | Detalle`. Los timestamps son reales y
distintos entre sí — nunca el mismo segundo para dos entradas. Se actualiza
después de cada tarea ejecutada, antes del commit. Los timestamps se obtienen
con `date -u +"%Y-%m-%dT%H:%M:%S"` y se capturan línea por línea con `echo`,
nunca con `cat >> heredoc` que genera el mismo segundo para todas las entradas.

**`decisiones-<slug>.md`** (obligatorio al cerrar)
Registro de decisiones de diseño tomadas durante la ejecución, hallazgos que
surgieron al trabajar, y verificación post-ejecución con evidencia. Se crea al
cerrar la iniciativa. Ver sección siguiente.

**Documentos adicionales** (si el análisis lo justifica)
Si la iniciativa es compleja y necesita registrar comparativas o contexto que
no cabe en los documentos anteriores, se añaden con nombres autoexplicativos.
No hay un número fijo.

---

### Por qué el documento de Decisiones es el más importante

Las tareas dicen **qué** se hizo. El documento de decisiones registra
**por qué** se hizo así.

Sin ese registro, el proyecto pierde en tres dimensiones:

**Dimensión 1 — Trazabilidad de criterio.**
Cuando un desarrollador futuro vea que un componente usa una solución no
obvia, necesita entender si fue un error o una decisión intencional. Sin el
documento de decisiones no hay forma de saberlo sin reconstruir el
razonamiento desde cero.

**Dimensión 2 — Transferencia de conocimiento tácito.**
Durante la ejecución se acumulan decenas de micro-decisiones que el ejecutor
considera obvias en el momento pero que no lo son para nadie más. En este
proyecto — donde las sesiones son discontinuas — ese contexto se pierde
incluso para el mismo ejecutor en la siguiente sesión.

**Dimensión 3 — Aprendizaje del proceso.**
Los hallazgos de ejecución (bugs descubiertos, patrones que no funcionaron,
workarounds necesarios) son oportunidades de mejorar el procedimiento y los
criterios de las iniciativas futuras. Si no se documentan, se repiten.

---

## Fase 3 — Crear la estructura en la ruta correcta

> **Path obligatorio:**
> `docs/pm/iniciativas/<slug>/`
>
> No crear directamente en `docs/` ni en `docs/pm/` — ambas son rutas
> incompletas que producen artefactos huérfanos fuera del sistema de
> indexado de iniciativas.

El directorio de la iniciativa se nombra con un verbo en infinitivo seguido
del objeto de trabajo. Describe qué se hace, no una etapa metodológica.

El orden de creación es:

1. Crear el directorio `docs/pm/iniciativas/<slug>/`
2. Crear los siete documentos decididos en la Fase 2
3. Enlazar el `index.md` de la iniciativa en `docs/pm/iniciativas/README.md`
   (o el índice raíz que corresponda)
4. Compilar el build y verificar que no hay errores antes de commitear

El commit de estructura es independiente del commit de ejecución.

> **Timestamps ISO 8601 con hora real.** Al completar cualquier campo de
> fecha en los documentos, obtener el valor real con:
>
> ```bash
> date -u +"%Y-%m-%dT%H:%M:%S"
> ```
>
> Nunca escribir `T00:00:00` como placeholder — esa hora no es real y hace
> el timestamp inútil para trazabilidad. Tampoco horas redondas tipo
> `HH:00:00` o `HH:30:00`. El mismo comando aplica al actualizar
> `fecha_actualizacion` en el frontmatter de un documento existente.
>
> Los timestamps del log de progreso se capturan línea por línea:
>
> ```bash
> echo "$(date -u +"%Y-%m-%dT%H:%M:%S") | Tarea T-101 completada | alcance creado"
> ```
>
> Nunca con `cat >> archivo << EOF` que colapsa todas las entradas al mismo
> segundo.

> **Build de webpack — verificación correcta.** Para cambios de código, el
> build de producción puede tardar 1-3 minutos. Según
> `long-running-commands.md` R-2.0, usar el patrón `nohup + until` en lugar
> de Bash foreground:
>
> ```bash
> LOG=/tmp/tui-build-$(date +%s).log
> nohup bash -c "npm run build 2>&1; echo EXIT=\$?" > "$LOG" 2>&1 &
> PID=$!
> disown $PID
> until grep -qE "^EXIT=" "$LOG"; do sleep 3; done && tail -10 "$LOG"
> ```
>
> Para verificación rápida de tests (Jest):
>
> ```bash
> npm test -- --watchAll=false 2>&1 | tail -20
> ```
>
> Nunca ejecutar `npm run build` como comando foreground en sesiones largas —
> el SSE liveness timeout cae antes de que el build termine.

---

## Fase 4 — Ejecutar las tareas

Cada tarea sigue estos pasos en orden. No se salta ninguno.

**Paso 1 — Leer el artefacto fuente**
Antes de modificar cualquier archivo, leer su estado actual con `cat` o
`view`. Aplica incluso si el archivo se acaba de crear — puede haber cambiado
desde la última lectura.

**Paso 2 — Leer el patrón de referencia si existe**
Si la tarea sigue un patrón ya establecido (por ejemplo, añadir un componente
que debe seguir el estilo de otro existente), leer ese patrón antes de
escribir.

**Paso 3 — Decidir el enfoque**
- Si el artefacto tiene estructura real que vale conservar: `str_replace` en
  la sección problemática.
- Si el artefacto está tan incompleto que no hay nada que salvar: `create_file`
  o reescritura total con `bash_tool`.
- Si el artefacto tiene secciones buenas y secciones ausentes: `str_replace`
  para lo que está mal, adiciones para lo que falta.

**Paso 4 — Aplicar el cambio**
Un cambio por tarea. Si durante la ejecución se descubre un problema adicional
no previsto en el plan, se registra como tarea nueva en `tareas-<slug>.md`
antes de ejecutarlo — no se resuelve de forma silenciosa.

**Paso 5 — Verificar el resultado**
Leer el archivo modificado con `cat` o `view` para confirmar que el cambio
quedó como se esperaba. Para cambios que afectan la compilación:

```bash
# Verificar que no hay errores de compilación
npm test -- --watchAll=false 2>&1 | tail -10
```

Para cambios que tocan webpack config, aliases o variables SCSS globales,
ejecutar también el build completo (ver patrón R-2.0 en Fase 3).

**Paso 6 — Actualizar el progreso y verificar build**
Marcar la tarea como completada en `tareas-<slug>.md` y agregar entrada en
`progreso-<slug>.md` con timestamp real. Para cambios de código, verificar
que `npm test` pasa sin errores nuevos.

**Paso 7 — Commitear**
Un commit por tarea completada. Formato Tim Pope obligatorio
(ver `.claude/rules/commit-conventions.md`):

- Subject: imperativo, ≤50 chars, capitalizado, sin punto final.
  Incluir la referencia a la tarea: `T-NNN — descripcion corta`.
- Body: obligatorio salvo commits triviales. Explicar QUÉ cambió y POR QUÉ,
  wrapped a 72 chars.

Ejemplo correcto:

```
Add brazalete palette to _variables.scss

_variables.scss usaba hex hardcodeados sin semántica.
La paleta del brazalete define tokens con nombre que
permiten consistencia entre temas. Refs: T-102.
```

Ejemplo incorrecto (prohibido):

```
T-102: actualizo variables
```

Push siempre con `--no-verify` desde la distro (Node 18 / husky bug):

```bash
git push --no-verify origin main
```

---

## Fase 5 — Cerrar la iniciativa

La iniciativa está completa cuando todas las tareas ejecutables están
marcadas como completadas y el criterio de completitud definido en el
alcance es verificablemente verdadero.

El cierre tiene pasos obligatorios en este orden. No se considera una
iniciativa cerrada si falta alguno.

**Paso 1 — Actualizar el progreso**
Marcar todas las tareas como `Hecha` en `tareas-<slug>.md` y actualizar el
historial con la fecha de completitud. Actualizar `progreso-<slug>.md`:

- Agregar entrada de cierre con timestamp real
- Estado final: `COMPLETADA`
- Fecha de inicio y fecha de cierre reales (`date -u +"%Y-%m-%dT%H:%M:%S"`)

**Paso 2 — Actualizar el index de la iniciativa**
Cambiar el `Estado actual` en `index.md` de `En ejecución` a `Completada`.

**Paso 3 — Crear el documento de Decisiones** *(obligatorio)*
Crear `decisiones-<slug>.md` con las secciones:

- **Decisiones de diseño** — cada decisión no obvia tomada durante la
  ejecución, con su justificación y su alternativa descartada. Mínimo una
  por archivo no trivial modificado.
- **Hallazgos durante la ejecución** — problemas encontrados al ejecutar que
  no estaban en el plan. Incluye errores de build, inconsistencias
  descubiertas, deuda técnica identificada. Cada hallazgo indica si fue
  resuelto en esta iniciativa o queda pendiente y en qué iniciativa se
  resuelve.
- **Verificación post-ejecución** — tabla con cada criterio del alcance, el
  resultado (PASA/FALLA) y la evidencia concreta (comando ejecutado y su
  output, no solo «PASA»).

Registrar el archivo en el `index.md` de la iniciativa.

**Paso 4 — Registrar deuda técnica nueva**
Si durante la ejecución se descubrieron problemas fuera del alcance, registrar
como hallazgos en `decisiones-<slug>.md` y evaluar si requieren una nueva
iniciativa.

**Paso 5 — Build limpio**
Ejecutar build completo con el patrón R-2.0 y confirmar 0 errores antes del
commit de cierre:

```bash
LOG=/tmp/tui-build-$(date +%s).log
nohup bash -c "npm run build 2>&1; echo EXIT=\$?" > "$LOG" 2>&1 &
PID=$!
disown $PID
until grep -qE "^EXIT=" "$LOG"; do sleep 3; done && tail -10 "$LOG"
```

**Paso 6 — Validación I-015** *(obligatorio antes del commit)*
Ejecutar el script de validación de completación de fase:

```bash
bash .claude/scripts/validate-phase-completion.sh
```

El script valida cinco condiciones:

1. Working tree limpio (sin cambios unstaged)
2. Nada staged (nada pendiente de commit)
3. Remote sync (todos los commits pusheados)
4. Build exitoso con exit 0
5. Historial reciente (hay commits)

Exit code 0 = proceder con el commit de cierre.
Exit code 1 = no commitear hasta resolver los problemas que reporte.

**Paso 7 — Commit de cierre**
Un commit que incluya todos los archivos de cierre: progreso, tareas, index y
decisiones. El mensaje indica el estado final (`N/N completadas`) y referencia
el documento de decisiones. Formato Tim Pope obligatorio (ver Paso 7 de
Fase 4).

> **Señal de que una iniciativa NO está cerrada**
>
> Una iniciativa NO está cerrada aunque todas las tareas estén marcadas como
> `Hecha` si:
>
> - El `index.md` dice `Estado actual: En ejecución`
> - El `progreso-<slug>.md` no tiene fecha real de cierre
> - No existe el archivo `decisiones-<slug>.md`
> - El documento de decisiones no tiene sección de verificación
>   post-ejecución con evidencia concreta
> - `validate-phase-completion.sh` retorna exit code 1

---

## Verificación antes de abrir una iniciativa

Antes de crear el directorio de la iniciativa, responder:

1. ¿Se ejecutó el Premise Gate (nivel 0a mínimo) antes de decidir la
   estructura?
2. ¿El resultado del gate es CONFIRMAR, EXPANDIR o COLAPSAR? (Si es
   REORDENAR o INVESTIGAR, no crear el directorio aún.)
3. ¿El path del directorio es `docs/pm/iniciativas/<slug>/` dentro del
   repositorio correcto?
4. ¿El nombre del directorio describe qué se hace (verbo + objeto), no una
   etapa?
5. ¿Cada nombre de archivo es autoexplicativo fuera de su directorio?
6. ¿El criterio de completitud en el alcance es verificable sin ambigüedad?
7. ¿Cada tarea toca exactamente un archivo?
8. ¿La tabla de cobertura del plan cubre todos los gaps del análisis?
9. ¿`alcance-<slug>.md` comienza con la sección `Premisa verificada`?

Si alguna respuesta es no, se resuelve antes de crear el directorio.

---

## Verificación antes de declarar una iniciativa cerrada

Antes de hacer el commit de cierre, responder:

1. ¿El `index.md` tiene `Estado actual: Completada`?
2. ¿El `progreso-<slug>.md` tiene fechas reales de inicio y cierre (con hora,
   obtenidas con `date -u`), y el historial actualizado?
3. ¿El `tareas-<slug>.md` tiene todas las tareas en estado `Hecha`?
4. ¿Existe el archivo `decisiones-<slug>.md`?
5. ¿El documento de decisiones tiene al menos una decisión documentada por
   cada artefacto no trivial modificado?
6. ¿El documento de decisiones tiene la sección de verificación post-ejecución
   con evidencia concreta (comando + output, no solo «PASA»)?
7. ¿Todos los hallazgos de ejecución están registrados, indicando si fueron
   resueltos en esta iniciativa o en cuál se resolverán?
8. ¿El build de webpack produce exit 0 sin errores?
9. ¿`validate-phase-completion.sh` retornó exit code 0?

Si alguna respuesta es no, no se hace el commit de cierre.

---

## Historial

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0.0 | 2026-05-27T15:45:00 | Versión inicial. Derivada de PROC-GESTION-001 v4.0.1 (dominio IACT-docs). Adaptaciones: formato RST → Markdown, path `docs/source/gestion/pm/<submodulo>/iniciativas/<slug>/` → `docs/pm/iniciativas/<slug>/`, build Sphinx → webpack/npm, Template A/B → formato único de 7 archivos, rutas de bash_tool actualizadas a `/tmp/project/template-ecommerce-ui/` y `/tmp/project/template-ecommerce-server/`. |
