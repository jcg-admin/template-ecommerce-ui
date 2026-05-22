# Tareas: Analizar ramas pendientes de integracion

| Campo | Valor |
|-------|-------|
| Iniciativa | analizar-ramas-pendientes-de-integracion |
| Estado | Tareas completas |
| Version | 1.0.0 |
| Fecha de creacion | 2026-05-20T19:12:38 |
| Fecha de actualizacion | 2026-05-20T19:12:38 |

## Convencion

Cada tarea **T-NNN** toca exactamente un archivo del repo. Tiene
criterio de aceptacion binario (cumplido o no). El DAG indica orden
de ejecucion: una tarea arranca cuando todas sus predecesoras estan
completadas.

Por ser una iniciativa **de documentacion pura**, las tareas se mapean
uno a uno con archivos a crear bajo `docs/`. No hay ejecucion de
codigo, builds ni migraciones.

## Catalogo de tareas

### Fase A — Lectura del estado del repositorio

| ID | Tarea | Archivo / accion | Predecesoras |
|----|-------|------------------|---------------|
| T-001 | Inventariar las ramas remotas con `git for-each-ref` | (sin archivo) | - |
| T-002 | Para cada rama: contar commits ahead / behind respecto a develop, listar commits propios, hacer numstat | (sin archivo) | T-001 |
| T-003 | Identificar conflictos previsibles con `git merge-tree` para la rama pendiente | (sin archivo) | T-002 |
| T-004 | Inspeccionar archivos clave de la rama pendiente (provisioner, listener, check-no-lazy) | (sin archivo) | T-002 |
| T-005 | Mapear estructura de `src/`, slices, hooks, paginas | (sin archivo) | T-001 |

Las tareas de Fase A no producen archivo; producen el conocimiento que
permite escribir los archivos de Fase B y C. Son verificables por
ejecucion del comando git correspondiente.

### Fase B — Crear los cajones arc42

| ID | Tarea | Archivo a crear | Predecesoras |
|----|-------|-----------------|---------------|
| T-010 | Crear el indice raiz de docs | `docs/README.md` | T-005 |
| T-011 | Documentar introduccion y objetivos | `docs/introduccion-y-objetivos/introduccion-y-objetivos.md` | T-005 |
| T-012 | Documentar restricciones de arquitectura | `docs/restricciones-de-arquitectura/restricciones-de-arquitectura.md` | T-005 |
| T-013 | Documentar contexto y alcance del sistema | `docs/contexto-y-alcance-del-sistema/contexto-y-alcance-del-sistema.md` | T-005 |
| T-014 | Documentar estrategia de solucion | `docs/estrategia-de-solucion/estrategia-de-solucion.md` | T-005, T-013 |
| T-015 | Documentar vista de bloques de construccion | `docs/vista-de-bloques-de-construccion/vista-de-bloques-de-construccion.md` | T-005, T-014 |
| T-016 | Documentar vista de despliegue | `docs/vista-de-despliegue/vista-de-despliegue.md` | T-005, T-014 |
| T-017 | Documentar conceptos transversales | `docs/conceptos-transversales/conceptos-transversales.md` | T-015, T-016 |
| T-018 | Documentar decisiones de arquitectura | `docs/decisiones-de-arquitectura/decisiones-de-arquitectura.md` | T-002, T-017 |
| T-019 | Documentar riesgos y deuda tecnica | `docs/riesgos-y-deuda-tecnica/riesgos-y-deuda-tecnica.md` | T-002, T-017 |
| T-020 | Crear glosario | `docs/glosario/glosario.md` | T-017 |

### Fase C — Crear el modulo pm/

| ID | Tarea | Archivo a crear | Predecesoras |
|----|-------|-----------------|---------------|
| T-030 | Crear README de pm/ | `docs/pm/README.md` | T-010 |
| T-031 | Crear README de iniciativas/ | `docs/pm/iniciativas/README.md` | T-030 |
| T-032 | Crear index de la iniciativa | `docs/pm/iniciativas/analizar-ramas-pendientes-de-integracion/index.md` | T-031 |
| T-033 | Crear alcance de la iniciativa | `docs/pm/iniciativas/analizar-ramas-pendientes-de-integracion/alcance-analizar-ramas-pendientes-de-integracion.md` | T-032 |

### Fase D — Producir los analisis de ramas

| ID | Tarea | Archivo a crear | Predecesoras |
|----|-------|-----------------|---------------|
| T-040 | Producir el resumen ejecutivo y matriz comparativa | `docs/pm/iniciativas/analizar-ramas-pendientes-de-integracion/analisis-ramas-pendientes-de-integracion.md` | T-033 |
| T-041 | Producir el analisis detallado de la rama pendiente | `analisis-rama-claude-resume-ecommerce-project.md` | T-003, T-004, T-040 |
| T-042 | Producir el analisis de la rama PR #2 integrada | `analisis-rama-claude-fix-proxy-scope.md` | T-040 |
| T-043 | Producir el analisis de la rama PR #3 integrada | `analisis-rama-release-integrate-ui-css-fix.md` | T-040 |
| T-044 | Producir el analisis de la rama PR #4 integrada | `analisis-rama-claude-fix-npm-build-css.md` | T-040 |
| T-045 | Producir el analisis del delta develop a main | `analisis-delta-develop-a-main.md` | T-040 |

### Fase E — Cierre de la iniciativa

| ID | Tarea | Archivo a crear | Predecesoras |
|----|-------|-----------------|---------------|
| T-050 | Documentar las tareas atomicas con DAG | `tareas-analizar-ramas-pendientes-de-integracion.md` (este archivo) | T-041..T-045 |
| T-051 | Documentar el progreso con estado por tarea | `progreso-analizar-ramas-pendientes-de-integracion.md` | T-050 |
| T-052 | Documentar las decisiones de la iniciativa (obligatorio al cierre) | `decisiones-analizar-ramas-pendientes-de-integracion.md` | T-051 |

## DAG de dependencias

```mermaid
%%{init: {'theme':'base', 'themeVariables': {
  'background': '#0f172a',
  'primaryColor': '#1e293b',
  'primaryTextColor': '#f1f5f9',
  'primaryBorderColor': '#94a3b8',
  'lineColor': '#cbd5e1',
  'secondaryColor': '#334155',
  'tertiaryColor': '#1e3a8a',
  'fontSize': '12px'
}}}%%
flowchart TB
    tarea_t001_inventariar_ramas["T-001<br/>Inventariar ramas"]
    tarea_t002_contar_commits_numstats["T-002<br/>Contar commits<br/>y numstats"]
    tarea_t003_detectar_conflictos["T-003<br/>Detectar conflictos"]
    tarea_t004_inspeccionar_archivos_rama["T-004<br/>Inspeccionar archivos<br/>de la rama pendiente"]
    tarea_t005_mapear_src["T-005<br/>Mapear src/"]

    tarea_t010_docs_readme["T-010<br/>docs/README"]
    tarea_t011_introduccion["T-011<br/>introduccion"]
    tarea_t012_restricciones["T-012<br/>restricciones"]
    tarea_t013_contexto["T-013<br/>contexto"]
    tarea_t014_estrategia["T-014<br/>estrategia"]
    tarea_t015_bloques["T-015<br/>bloques"]
    tarea_t016_despliegue["T-016<br/>despliegue"]
    tarea_t017_transversales["T-017<br/>transversales"]
    tarea_t018_decisiones_arq["T-018<br/>decisiones arq"]
    tarea_t019_riesgos["T-019<br/>riesgos"]
    tarea_t020_glosario["T-020<br/>glosario"]

    tarea_t030_pm_readme["T-030<br/>pm README"]
    tarea_t031_iniciativas_readme["T-031<br/>iniciativas README"]
    tarea_t032_index_iniciativa["T-032<br/>index iniciativa"]
    tarea_t033_alcance["T-033<br/>alcance"]

    tarea_t040_resumen_ramas["T-040<br/>resumen ramas"]
    tarea_t041_rama_pendiente["T-041<br/>rama pendiente"]
    tarea_t042_rama_pr_dos["T-042<br/>rama PR #2"]
    tarea_t043_rama_pr_tres["T-043<br/>rama PR #3"]
    tarea_t044_rama_pr_cuatro["T-044<br/>rama PR #4"]
    tarea_t045_delta_dev_a_main["T-045<br/>delta dev a main"]

    tarea_t050_tareas_este["T-050<br/>tareas (este)"]
    tarea_t051_progreso["T-051<br/>progreso"]
    tarea_t052_decisiones["T-052<br/>decisiones"]

    tarea_t001_inventariar_ramas --> tarea_t002_contar_commits_numstats
    tarea_t002_contar_commits_numstats --> tarea_t003_detectar_conflictos
    tarea_t002_contar_commits_numstats --> tarea_t004_inspeccionar_archivos_rama
    tarea_t001_inventariar_ramas --> tarea_t005_mapear_src

    tarea_t005_mapear_src --> tarea_t010_docs_readme
    tarea_t005_mapear_src --> tarea_t011_introduccion
    tarea_t005_mapear_src --> tarea_t012_restricciones
    tarea_t005_mapear_src --> tarea_t013_contexto
    tarea_t005_mapear_src --> tarea_t014_estrategia
    tarea_t013_contexto --> tarea_t014_estrategia
    tarea_t005_mapear_src --> tarea_t015_bloques
    tarea_t014_estrategia --> tarea_t015_bloques
    tarea_t005_mapear_src --> tarea_t016_despliegue
    tarea_t014_estrategia --> tarea_t016_despliegue
    tarea_t015_bloques --> tarea_t017_transversales
    tarea_t016_despliegue --> tarea_t017_transversales
    tarea_t002_contar_commits_numstats --> tarea_t018_decisiones_arq
    tarea_t017_transversales --> tarea_t018_decisiones_arq
    tarea_t002_contar_commits_numstats --> tarea_t019_riesgos
    tarea_t017_transversales --> tarea_t019_riesgos
    tarea_t017_transversales --> tarea_t020_glosario

    tarea_t010_docs_readme --> tarea_t030_pm_readme
    tarea_t030_pm_readme --> tarea_t031_iniciativas_readme
    tarea_t031_iniciativas_readme --> tarea_t032_index_iniciativa
    tarea_t032_index_iniciativa --> tarea_t033_alcance

    tarea_t033_alcance --> tarea_t040_resumen_ramas
    tarea_t003_detectar_conflictos --> tarea_t041_rama_pendiente
    tarea_t004_inspeccionar_archivos_rama --> tarea_t041_rama_pendiente
    tarea_t040_resumen_ramas --> tarea_t041_rama_pendiente
    tarea_t040_resumen_ramas --> tarea_t042_rama_pr_dos
    tarea_t040_resumen_ramas --> tarea_t043_rama_pr_tres
    tarea_t040_resumen_ramas --> tarea_t044_rama_pr_cuatro
    tarea_t040_resumen_ramas --> tarea_t045_delta_dev_a_main

    tarea_t041_rama_pendiente --> tarea_t050_tareas_este
    tarea_t042_rama_pr_dos --> tarea_t050_tareas_este
    tarea_t043_rama_pr_tres --> tarea_t050_tareas_este
    tarea_t044_rama_pr_cuatro --> tarea_t050_tareas_este
    tarea_t045_delta_dev_a_main --> tarea_t050_tareas_este
    tarea_t050_tareas_este --> tarea_t051_progreso
    tarea_t051_progreso --> tarea_t052_decisiones

    classDef primaryNode fill:#1e293b,stroke:#60a5fa,stroke-width:2px,color:#f1f5f9
    classDef secondaryNode fill:#334155,stroke:#94a3b8,stroke-width:1px,color:#f1f5f9
    classDef doneNode fill:#14532d,stroke:#4ade80,stroke-width:2px,color:#f0fdf4

    class tarea_t001_inventariar_ramas,tarea_t002_contar_commits_numstats,tarea_t003_detectar_conflictos,tarea_t004_inspeccionar_archivos_rama,tarea_t005_mapear_src primaryNode
    class tarea_t010_docs_readme,tarea_t011_introduccion,tarea_t012_restricciones,tarea_t013_contexto,tarea_t014_estrategia,tarea_t015_bloques,tarea_t016_despliegue,tarea_t017_transversales,tarea_t018_decisiones_arq,tarea_t019_riesgos,tarea_t020_glosario secondaryNode
    class tarea_t030_pm_readme,tarea_t031_iniciativas_readme,tarea_t032_index_iniciativa,tarea_t033_alcance secondaryNode
    class tarea_t040_resumen_ramas,tarea_t041_rama_pendiente,tarea_t042_rama_pr_dos,tarea_t043_rama_pr_tres,tarea_t044_rama_pr_cuatro,tarea_t045_delta_dev_a_main primaryNode
    class tarea_t050_tareas_este,tarea_t051_progreso doneNode
    class tarea_t052_decisiones doneNode
```

## Cobertura: criterio del alcance -> tareas que lo cubren

Cada criterio de completitud del alcance debe estar cubierto por al
menos una tarea. Esta tabla lo verifica:

| Criterio del alcance | Tareas que lo cubren |
|----------------------|----------------------|
| 1. Directorio `docs/` con cajones arc42 | T-010..T-020 |
| 2. `docs/pm/README.md` que explica el modulo | T-030 |
| 3. Seis documentos minimos de la iniciativa | T-032, T-033, T-040, T-050, T-051, T-052 |
| 4. Cada rama remota tiene parrafo descriptivo | T-040 (tabla comparativa) + T-041..T-045 (uno por rama) |
| 5. Rama pendiente con documento dedicado, commits, conflictos | T-041 |
| 6. Diagrama mermaid de topology + secuencia para listener | T-040 (gitGraph topology) + T-041 (sequenceDiagram listener) |
| 7. Sin emojis ni iconos en ningun archivo | Inspeccion visual por archivo (todas las tareas) |
| 8. Todos los nombres incluyen slug autoexplicativo | Convencion aplicada en T-010..T-052 |
| 9. Documento de decisiones con las tres secciones obligatorias | T-052 |

## Tareas que se desviaron del DAG durante la ejecucion

Ninguna. El DAG se respeto. Si en algun momento se hubiera necesitado
una tarea no prevista, se habria registrado aqui antes de ejecutarla
(regla del procedimiento).
