# Alcance: Analizar ramas pendientes de integracion

| Campo | Valor |
|-------|-------|
| Iniciativa | analizar-ramas-pendientes-de-integracion |
| Estado | COMPLETADA |
| Version | 1.0.0 |
| Fecha de creacion | 2026-05-20T19:12:38 |

## Por que existe esta iniciativa

El repositorio `jcg-admin/e-comerce-ui` tiene seis ramas remotas con
historiales muy distintos:

- Una rama estable (`main`) que esta 149 commits atras de `develop`.
- Una rama de integracion (`develop`) con un release candidate
  acumulado.
- Tres ramas de feature **ya integradas** via PRs cerrados pero no
  borradas del remoto.
- Una rama de feature **pendiente** con siete commits propios y un
  conflicto previsible en `package.json`.

Sin un analisis explicito, esta heterogeneidad es invisible para
cualquiera que llegue al repo por primera vez. El analisis tambien es
prerequisito para tomar decisiones sobre:

- Cuando promover `develop` a `main`.
- Como integrar la rama pendiente sin perder los guardrails que
  introduce (`UnauthorizedListener`, `check-no-lazy-imports.mjs`,
  provisioner de Node).
- Si borrar las ramas integradas del remoto.

## Que produce la iniciativa

| Entregable | Localizacion |
|-----------|--------------|
| Documentacion arquitectonica del proyecto siguiendo arc42 adaptado | `docs/<cajon>/` |
| Modulo de project management | `docs/pm/` |
| Analisis exhaustivo de las seis ramas remotas | `docs/pm/iniciativas/analizar-ramas-pendientes-de-integracion/` |
| Matriz comparativa de estado de integracion | `analisis-ramas-pendientes-de-integracion.md` |
| Documento por rama con commits, archivos y conflictos | un `analisis-rama-*.md` por rama |
| Analisis del release candidate develop -> main | `analisis-delta-develop-a-main.md` |
| Documento de decisiones al cierre | `decisiones-analizar-ramas-pendientes-de-integracion.md` |

## Criterio de completitud verificable

La iniciativa esta completa cuando **todas** las siguientes
afirmaciones son verdaderas. Cada una es comprobable mecanicamente.

1. Existe el directorio `docs/` con la estructura arc42 adaptada (sin
   numeros, nombres autodescriptivos): `introduccion-y-objetivos/`,
   `restricciones-de-arquitectura/`, `contexto-y-alcance-del-sistema/`,
   `estrategia-de-solucion/`, `vista-de-bloques-de-construccion/`,
   `vista-de-despliegue/`, `conceptos-transversales/`,
   `decisiones-de-arquitectura/`, `riesgos-y-deuda-tecnica/`,
   `glosario/`.
2. Existe `docs/pm/README.md` que explica el modulo de project
   management.
3. Existe `docs/pm/iniciativas/analizar-ramas-pendientes-de-integracion/`
   con los seis documentos minimos: `index.md`, `alcance-*.md`,
   un `analisis-*.md` por rama mas el de resumen, `tareas-*.md`,
   `progreso-*.md`, `decisiones-*.md`.
4. Para cada rama remota (`main`, `develop`,
   `claude/resume-ecommerce-project-Dm3ab`,
   `claude/fix-proxy-scope-f1blE`,
   `release/integrate-ui-css-fix-20260519`,
   `claude/fix-npm-build-css-DBSPS`) hay al menos un parrafo en algun
   documento de la iniciativa que describe su estado, sus commits
   propios y su relacion con `develop`.
5. La rama pendiente `claude/resume-ecommerce-project-Dm3ab` tiene
   un documento dedicado que enumera sus siete commits, sus archivos
   afectados y la naturaleza del conflicto previsto al hacer merge.
6. El analisis incluye un diagrama mermaid del topology de ramas y
   un diagrama mermaid de secuencia para al menos un flujo del codigo
   afectado por la rama pendiente (el listener `app:unauthorized`).
7. La documentacion no contiene emojis ni iconos en ningun archivo de
   la iniciativa.
8. Todos los nombres de archivos en la iniciativa contienen el slug
   `analizar-ramas-pendientes-de-integracion` o `<rama>` autoexplicativo
   (no hay `tareas.md`, `analisis.md` ni similares sueltos).
9. El documento de decisiones al cierre contiene las tres secciones
   obligatorias por PROC-GESTION-001: decisiones de diseno, hallazgos
   durante la ejecucion, verificacion post-ejecucion con evidencia.

## Fuera de alcance

| Item | Por que esta fuera |
|------|--------------------|
| Integrar la rama pendiente | La iniciativa **analiza**; la integracion la decide el equipo con el material producido aqui. |
| Promover `develop` a `main` | Misma razon: el analisis es insumo, la decision es politica de release. |
| Borrar ramas integradas del remoto | Decision operativa que requiere acuerdo del equipo, no de un analisis. |
| Documentar el backend (`PracticaYoruba-api`), la base (`PracticaYoruba-db`) ni el servidor (`PracticaYoruba-server`) | Cada uno tiene su propio repositorio y su propio modulo de gestion. |
| Implementar CI/CD automatico | Listado como riesgo en `docs/riesgos-y-deuda-tecnica/`; requiere su propia iniciativa. |
| Migrar `src/` a TypeScript | Listado como deuda en `docs/riesgos-y-deuda-tecnica/`. |

## Decisiones de contenido no obvias tomadas durante la lectura

Estas decisiones se tomaron al leer el estado real del repo antes de
crear archivos. Se registran aqui como aviso para futuras iniciativas.

| Decision | Por que |
|----------|---------|
| Documentar tambien las ramas ya integradas | El usuario lo pidio explicitamente en la respuesta del widget de elicitacion ("Todo: pendiente + release candidate + retrospectiva de las 3 ramas ya integradas"). Cada rama integrada introdujo un cambio relevante (UCs masivos, pipeline SCSS, allowlist de hex) cuya razon vale la pena conservar. |
| Omitir cajon "Requisitos de calidad" de arc42 | El repo no tiene SLOs ni metricas medibles. Documentar requisitos inventados es peor que omitir el cajon. |
| Omitir cajon "Vista de tiempo de ejecucion" de arc42 | Los flujos en runtime ya estan cubiertos por los UCs del repo backend. Aqui solo se documentan flujos cross-cutting (auth, mocks, errores) en `conceptos-transversales/`. |
| Mermaid en lugar de PlantUML | Decidido en el widget de elicitacion. GitHub renderiza mermaid nativamente; PlantUML requiere build externo que el repo no tiene. |
| Markdown en lugar de RST | Decidido en el widget. El repo ya tiene `.md` existentes en `docs/`, no tiene Sphinx instalado. |
| Un documento separado por rama en lugar de un solo gran archivo | Cada rama tiene contexto y commits propios; un solo archivo se vuelve inmanejable. Permite linkar a cada rama desde otras partes de la documentacion. |
