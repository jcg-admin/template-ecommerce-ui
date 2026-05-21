# Como gestionar iniciativas

Este documento describe **como se gestiona el trabajo del proyecto**
mediante iniciativas en el modulo `pm/`. Sigue el procedimiento
normativo interno **PROC-GESTION-001 v4.0.0** ("Procedimiento: Crear
una Nueva Iniciativa en source/gestion/pm/") adaptado al stack
markdown local.

> Este repositorio es el submodulo `ui` del monorepo conceptual
> `e-comerce`. Por convencion del procedimiento, las iniciativas de
> trabajo sobre el codigo React + Redux + Webpack viven aqui.

## Estructura

```
pm/
  README.md                                    (este archivo)
  iniciativas/
    <nombre-iniciativa-en-verbo-infinitivo>/
      index.md
      alcance-<nombre-iniciativa>.md
      analisis-<nombre-iniciativa>.md          (uno o varios analisis)
      tareas-<nombre-iniciativa>.md
      progreso-<nombre-iniciativa>.md
      decisiones-<nombre-iniciativa>.md        (obligatorio al cierre)
```

## Reglas observadas

Las reglas vienen de PROC-GESTION-001. Las que esta documentacion
sigue literalmente:

1. **Nombre del directorio en verbo + objeto.** Describe que se hace,
   no una etapa metodologica. Por ejemplo:
   `analizar-ramas-pendientes-de-integracion` (no
   `analisis-de-ramas` ni `etapa-uno`).
2. **Cada archivo incluye el slug de la iniciativa.** Cualquier
   archivo es identificable fuera de su carpeta. `tareas.md` solo no
   sirve; `tareas-analizar-ramas-pendientes-de-integracion.md` si.
3. **Cinco documentos minimos por iniciativa** (alcance, analisis,
   tareas, progreso, decisiones). Documentos adicionales se anaden
   solo si el analisis lo justifica.
4. **Sin numeracion en nombres.** El slug es el indice.
5. **Sin emojis, sin iconos.** Texto plano y tablas markdown.
6. **Tareas atomicas T-NNN.** Cada tarea toca exactamente un archivo
   en el repo (codigo o documentacion) y tiene criterio de aceptacion
   binario.
7. **Documento de decisiones obligatorio al cierre.** Sin el la
   iniciativa no esta cerrada, aunque todas las tareas marquen
   completadas. Registra el razonamiento, no solo el resultado.
8. **DAG de dependencias** declarado en `tareas-*.md`.

## Adaptaciones a este repo

El procedimiento original esta escrito para Sphinx + reStructuredText.
Este repo es Markdown puro porque no hay Sphinx instalado. Las
adaptaciones:

| Aspecto del procedimiento | Adaptacion en este repo |
|--------------------------|--------------------------|
| Extension `.rst` | `.md` |
| Meta `.. meta::` con campos `:artefacto:`, `:version:`, etc. | Bloque tabla al inicio del documento con los mismos campos. |
| Directivas `.. note::`, `.. admonition::` | Citas markdown (`> **Nota:**`) o secciones encabezadas explicitamente. |
| `toctree` glob | `index.md` con tabla de enlaces a los demas documentos. |
| `:doc:` cross-link | Enlaces markdown relativos (`[texto](archivo.md)`). |
| Build de Sphinx con 0 warnings | Render de markdown valido en GitHub + verificacion visual de los mermaid. |
| PlantUML | Mermaid embebido en bloques `mermaid`. |

El **espiritu** del procedimiento se preserva: rigor en el cierre,
documento de decisiones obligatorio, tareas atomicas con DAG,
trazabilidad.

## Como abrir una iniciativa nueva

1. Leer el estado real del repo y del backend antes de decidir nada.
2. **Antes de proponer cualquier cambio arquitectonico, inspeccionar
   `docs/decisiones-de-arquitectura/` por ADRs existentes que
   afecten al tema.** Si existe ADR previa, leer su contexto y
   razon, y planificar superseder formalmente (cambiar `Estado` a
   `Superseded por <slug-nuevo>`, anadir nota explicando que
   informacion cambia respecto a la ADR previa) si la nueva
   decision la contradice. Cambiar una decision arquitectonica
   registrada sin pasar por la ADR previa es ruptura de la
   disciplina del proyecto.
3. Decidir si la iniciativa cabe en `ui` (este repo) o en otro
   submodulo. Si el trabajo es 100% sobre codigo React/Webpack/SCSS,
   es `ui`. Si es sobre la propia documentacion, es `docs` (otro repo).
4. Elegir un slug en verbo + objeto.
5. Crear el directorio `pm/iniciativas/<slug>/`.
6. Crear los cinco archivos minimos.
7. Definir un criterio de completitud verificable en el alcance.
8. Definir tareas T-NNN atomicas y su DAG.
9. Ejecutar. Actualizar progreso despues de cada tarea.
10. Cerrar con el documento de decisiones obligatorio.

> **Por que existe el paso 2.** Esta regla se anadio el 2026-05-21
> tras el fallo de proceso documentado en la iniciativa
> `revisar-arquitectura-de-mocks`: el analisis inicial de
> alternativas de mocks no inspecciono
> `docs/decisiones-de-arquitectura/` y recomendo cambiar una
> decision que ya estaba registrada como ADR. La reconsideracion
> bajo RUP del proyecto exigio descubrir, leer y superseder
> formalmente la ADR previa antes de aprobar el cambio. Para que
> el mismo fallo no se repita, el paso 2 es ahora explicito y
> ocupa el segundo lugar del flujo, no esta enterrado.

## Catalogo de iniciativas

El listado vivo de iniciativas (en backlog, en analisis, en ejecucion
y cerradas) vive en su propio documento para evitar duplicacion:

[indice-de-iniciativas.md](iniciativas/indice-de-iniciativas.md)
