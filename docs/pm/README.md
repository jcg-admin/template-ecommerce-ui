# Project Management (pm)

Este modulo gestiona el **trabajo del proyecto** mediante iniciativas
que siguen el procedimiento normativo interno
**PROC-GESTION-001 v4.0.0** ("Procedimiento: Crear una Nueva
Iniciativa en source/gestion/pm/").

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
2. Decidir si la iniciativa cabe en `ui` (este repo) o en otro
   submodulo. Si el trabajo es 100% sobre codigo React/Webpack/SCSS,
   es `ui`. Si es sobre la propia documentacion, es `docs` (otro repo).
3. Elegir un slug en verbo + objeto.
4. Crear el directorio `pm/iniciativas/<slug>/`.
5. Crear los cinco archivos minimos.
6. Definir un criterio de completitud verificable en el alcance.
7. Definir tareas T-NNN atomicas y su DAG.
8. Ejecutar. Actualizar progreso despues de cada tarea.
9. Cerrar con el documento de decisiones obligatorio.

## Iniciativas existentes

| Iniciativa | Estado | Resumen |
|-----------|--------|---------|
| [analizar-ramas-pendientes-de-integracion](iniciativas/analizar-ramas-pendientes-de-integracion/) | COMPLETADA | Inventariar las seis ramas remotas del repo, clasificarlas por estado de integracion y documentar tanto las pendientes como las ya integradas para futuro referencia. |
