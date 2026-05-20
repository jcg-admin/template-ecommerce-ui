# Decisiones: Analizar ramas pendientes de integracion

| Campo | Valor |
|-------|-------|
| Iniciativa | analizar-ramas-pendientes-de-integracion |
| Tipo de documento | Decisiones, hallazgos y verificacion post-ejecucion |
| Obligatoriedad | Obligatorio al cierre segun PROC-GESTION-001 v4.0.0 |
| Fecha de creacion | 2026-05-20T19:12:38 |

> **Por que este documento existe.** Las tareas dicen *que* se hizo. El
> progreso dice *cuanto*. Este documento registra el *por que*, los
> *hallazgos* y la *verificacion final*. Sin el, la iniciativa no esta
> cerrada aunque todas las tareas marquen completadas.

---

## Seccion 1 — Decisiones de diseno

Decisiones no obvias tomadas durante la ejecucion, con justificacion y
alternativa descartada. Una entrada por cada decision.

### dec-formato-markdown-en-vez-de-rst

| Campo | Valor |
|-------|-------|
| Decision | Toda la documentacion se escribe en Markdown. |
| Alternativas | (a) RST como en el procedimiento original. (b) Markdown para arc42 y RST solo para pm/. |
| Razon | El repo ya tiene tres documentos `.md` en `docs/` (`scss-*.md`). No tiene Sphinx instalado ni build de RST. Mantener un solo formato evita inconsistencias y aprovecha el render nativo de GitHub. La opcion mixta agrega complejidad sin beneficio. |
| Trade-off aceptado | El procedimiento PROC-GESTION-001 esta escrito para RST; las directivas `.. note::`, `.. admonition::`, `:doc:` y los meta no traducen literalmente. Se documentaron las equivalencias en `docs/pm/README.md`. |
| Cuando reevaluar | Si se introduce Sphinx en el repo (improbable) o si la documentacion crece a >50 archivos y la falta de toctree empieza a doler. |

### dec-mermaid-en-vez-de-plantuml

| Campo | Valor |
|-------|-------|
| Decision | Diagramas UML expresados en mermaid embebido. |
| Alternativas | (a) PlantUML (`.puml` files) como menciona el procedimiento. (b) SVG inline. (c) Ambos (mermaid + .puml gemelos). |
| Razon | GitHub renderiza mermaid nativamente sin build. PlantUML requiere build externo (jar de Java o servidor). El repo no tiene CI ni servidor de docs, asi que .puml seria texto que nadie ve. SVG inline es pesado y no editable. La opcion gemela duplica esfuerzo. |
| Trade-off aceptado | Mermaid no cubre todos los tipos UML (lacks formal class diagrams con cardinalidades complejas). Para los nueve diagramas necesarios (contexto, bloques, despliegue, sequence, gitGraph, flowchart), mermaid es suficiente. |

### dec-omitir-cajon-requisitos-de-calidad

| Campo | Valor |
|-------|-------|
| Decision | No incluir el cajon arc42 "Requisitos de calidad" (NFRs). |
| Alternativas | (a) Incluirlo vacio. (b) Inventar NFRs razonables. (c) Omitirlo. |
| Razon | El repo no tiene SLOs, ANS, metricas de performance ni objetivos cuantitativos declarados. Inventar NFRs es peor que omitir el cajon: induce a creer que existe un compromiso medible que en realidad no existe. Incluirlo vacio invita a "rellenar luego" sin contenido honesto. |
| Trade-off aceptado | La documentacion se desvia del template arc42 estandar. Se documenta la omision en `docs/README.md` con la razon. |
| Cuando reevaluar | Cuando el equipo declare objetivos cuantitativos reales (p. ej. "First Contentful Paint < 2s en P75"). |

### dec-omitir-cajon-vista-de-tiempo-de-ejecucion

| Campo | Valor |
|-------|-------|
| Decision | No incluir el cajon arc42 "Vista de tiempo de ejecucion" como documento separado. |
| Alternativas | (a) Incluirlo con los flujos principales (auth, checkout, returns). (b) Omitirlo. |
| Razon | Los flujos de runtime estan cubiertos por los casos de uso (UC-*) del repo backend `e-comerce-doc`. Duplicar aqui produce ruido y dos fuentes de verdad. Los pocos flujos que son **exclusivamente del UI** (manejo de 401, mock-first) se documentan en `conceptos-transversales/` con sequenceDiagram. |
| Trade-off aceptado | Lectores que esperan el cajon completo segun arc42 tienen que ir a otro repo o al documento de conceptos transversales. Documentado en `docs/README.md`. |

### dec-un-documento-por-rama-en-vez-de-uno-solo

| Campo | Valor |
|-------|-------|
| Decision | Cada rama remota relevante tiene su propio `analisis-rama-*.md`. |
| Alternativas | (a) Un solo archivo `analisis-de-ramas.md` con secciones. (b) Un archivo solo para la rama pendiente y resumen tabulado para las demas. |
| Razon | Las cinco ramas con cambios (PR #2/#3/#4 + pendiente + delta) tienen contextos muy distintos: distinta naturaleza, distinto numero de commits, distinto valor historico. Un solo archivo cresce hasta volverse inmanejable. Documentos separados permiten enlazar a cada rama desde otras partes (decisiones-de-arquitectura, riesgos-y-deuda) sin anclas largas. |
| Trade-off aceptado | Mas archivos para mantener. Pero el slug autoexplicativo en cada uno los hace navegables. |

### dec-documentar-ramas-ya-integradas

| Campo | Valor |
|-------|-------|
| Decision | Documentar tambien las tres ramas ya integradas (PR #2/#3/#4) como "epitafios". |
| Alternativas | (a) Solo documentar la pendiente. (b) Documentar todo. |
| Razon | El usuario lo pidio explicitamente en la respuesta del widget de elicitacion ("Todo: pendiente + release candidate + retrospectiva de las 3 ramas ya integradas"). Cada rama integrada introdujo cambios con razones que vale la pena conservar (D-008, D-010, D-012, decision de allowlist, decision de pre-push vs pre-commit). Si las ramas se borran del remoto, este documento es la unica fuente. |
| Trade-off aceptado | Tres documentos adicionales que mantener. Pero son estables: las ramas ya cerradas no cambian. |

### dec-slug-autoexplicativo-sin-prefijos-numericos

| Campo | Valor |
|-------|-------|
| Decision | Ningun nombre de archivo o carpeta empieza con numero. El slug es el indice. |
| Alternativas | (a) Numerar segun arc42 (`1-introduccion`, `2-restricciones`, ...). (b) Numerar las decisiones (`adr-001`, `adr-002`). |
| Razon | El usuario lo pidio explicitamente en el contexto inicial ("Sin numeros en nombres de carpetas/archivos"). Ademas, los numeros se vuelven inestables cuando se inserta o reordena cajones; los slugs no. |
| Trade-off aceptado | Lectores acostumbrados al orden arc42 numerado pueden no saber por donde empezar. El `docs/README.md` impone un orden de lectura. |

---

## Seccion 2 — Hallazgos durante la ejecucion

Problemas o realidades descubiertas al ejecutar que no estaban en el
plan inicial. Cada hallazgo indica si fue resuelto en esta iniciativa
o si queda pendiente y donde.

### Hallazgos historicos retirados del log

Cuatro hallazgos de esta seccion eran especificos del repositorio
fuente y no aplican al template (rama pendiente, divergencia
develop a main, PR fusionado). Otros cuatro eran duplicados con
distinto wording de las entradas que esta iniciativa ya cubre.
Todos se retiran de este log en la ejecucion de T-002 de la
iniciativa `resolver-hallazgos-de-deuda-del-template`.

| ID | Nombre original | Por que se retira |
|----|-----------------|--------------------|
| H-13 | `hallazgo-pr-uno-no-aparece-como-rama-remota` | Historico del repositorio fuente. La rama fusionada no aplica al template. |
| H-14 | `hallazgo-conflicto-en-package-json-de-la-rama-pendiente` | Historico. No hay rama pendiente en el template. |
| H-15 | `hallazgo-rama-pendiente-tiene-36-commits-de-atraso` | Historico. |
| H-16 | `hallazgo-deuda-en-src-decorators-y-src-types` | Duplicado. Cubierto por H-01 y H-02 en la iniciativa `resolver-hallazgos-de-deuda-del-template`. |
| H-17 | `hallazgo-readme-raiz-no-menciona-arc42-ni-pm` | Duplicado de H-04 en la iniciativa actual. |
| H-18 | `hallazgo-stack-de-typescript-sin-uso-en-src` | Duplicado de H-03 en la iniciativa actual. |
| H-19 | `hallazgo-ausencia-de-ci-cd` | Duplicado de H-09 (que tambien se retiro por estar CI/CD fuera del scope del template). |
| H-20 | `hallazgo-149-commits-en-develop-sin-promover` | Historico. El template tiene historia lineal en main. |

El contenido detallado de cada entrada se preserva en el historial
git de este archivo (commit que ejecuta T-002 de
`resolver-hallazgos-de-deuda-del-template`).

---

## Seccion 3 — Verificacion post-ejecucion

Tabla con cada criterio del alcance, su resultado y la evidencia
concreta. No "PASA" suelto: para cada criterio, el archivo o comando
que lo prueba.

| Criterio del alcance | Resultado | Evidencia |
|---------------------|-----------|-----------|
| 1. Existe `docs/` con los diez cajones arc42 con nombres autodescriptivos sin numeros | PASA | `find docs -maxdepth 2 -type d` muestra `introduccion-y-objetivos/`, `restricciones-de-arquitectura/`, `contexto-y-alcance-del-sistema/`, `estrategia-de-solucion/`, `vista-de-bloques-de-construccion/`, `vista-de-despliegue/`, `conceptos-transversales/`, `decisiones-de-arquitectura/`, `riesgos-y-deuda-tecnica/`, `glosario/`. Ninguno empieza con numero. |
| 2. Existe `docs/pm/README.md` con explicacion del modulo | PASA | `cat docs/pm/README.md` muestra estructura, reglas observadas, adaptaciones rst -> md y tabla de iniciativas. |
| 3. Existe `docs/pm/iniciativas/analizar-ramas-pendientes-de-integracion/` con los seis documentos minimos mas un analisis por rama | PASA | `ls docs/pm/iniciativas/analizar-ramas-pendientes-de-integracion/` muestra `index.md`, `alcance-*.md`, `analisis-ramas-pendientes-de-integracion.md`, `analisis-rama-claude-resume-ecommerce-project.md`, `analisis-rama-claude-fix-proxy-scope.md`, `analisis-rama-release-integrate-ui-css-fix.md`, `analisis-rama-claude-fix-npm-build-css.md`, `analisis-delta-develop-a-main.md`, `tareas-*.md`, `progreso-*.md`, `decisiones-*.md`. Total once archivos. |
| 4. Cada rama remota tiene parrafo descriptivo | PASA | `analisis-ramas-pendientes-de-integracion.md` (tabla "Inventario completo de ramas remotas") cubre las seis ramas; cada rama con cambios tiene ademas su documento dedicado. |
| 5. Rama pendiente con documento dedicado, commits, conflictos | PASA | `analisis-rama-claude-resume-ecommerce-project.md` contiene tabla de meta, inventario de los 7 commits con sus numstats, descripcion del conflicto en `package.json` con el bloque `<<<<<<<` esperado. |
| 6. Diagrama mermaid de topology + sequenceDiagram para listener | PASA | `analisis-ramas-pendientes-de-integracion.md` contiene un `gitGraph`. `analisis-rama-claude-resume-ecommerce-project.md` contiene un `sequenceDiagram` del flujo `app:unauthorized`. |
| 7. Sin emojis ni iconos | PASA | Verificable con `grep -rP "[\x{1F300}-\x{1FAFF}]" docs/`. Sin matches en archivos de la iniciativa. |
| 8. Todos los nombres con slug autoexplicativo | PASA | `find docs -type f -name "*.md"` — todos los archivos en la iniciativa contienen `analizar-ramas-pendientes-de-integracion`, `rama-<nombre>` o son `index.md` (excepcion permitida por convencion). Ningun `tareas.md`, `analisis.md` ni similar suelto. |
| 9. Documento de decisiones con las tres secciones obligatorias | PASA | Este archivo. Seccion 1 "Decisiones de diseno" con siete entradas. Seccion 2 "Hallazgos durante la ejecucion" con ocho entradas. Seccion 3 "Verificacion post-ejecucion" (esta tabla). |

## Verificacion adicional contra PROC-GESTION-001

El procedimiento incluye un checklist de 8 preguntas obligatorias
antes de declarar una iniciativa cerrada. Las respuestas:

| Pregunta | Respuesta | Evidencia |
|----------|-----------|-----------|
| 1. ¿El `index.md` tiene `estado: COMPLETADA`? | Si | Ver tabla de meta de `index.md` — actualizado a "Completada" en commit de cierre. |
| 2. ¿El `progreso-*.md` tiene fechas reales de inicio y cierre y el historial actualizado? | Si | `progreso-*.md` tabla de meta y seccion "Historial de versiones". |
| 3. ¿El `tareas-*.md` tiene historial actualizado? | Si | Documentado en su seccion "Tareas que se desviaron del DAG durante la ejecucion" (vacia, ninguna desviacion). |
| 4. ¿Existe el archivo `decisiones-*.md`? | Si | Este archivo. |
| 5. ¿El documento tiene al menos una decision por artefacto no trivial? | Si | Siete decisiones cubren las elecciones de formato (md), diagramas (mermaid), omisiones de cajones (NFRs, runtime), granularidad (un doc por rama), retrospectiva (docs de ramas integradas), nomenclatura (sin numeros). |
| 6. ¿La seccion de verificacion tiene evidencia concreta (no solo "PASA")? | Si | Tabla en Seccion 3 con comando o archivo de evidencia por cada criterio. |
| 7. ¿Hallazgos registrados con estado de resolucion? | Si | Ocho hallazgos en Seccion 2, cada uno indica si se resolvio en esta iniciativa o donde queda pendiente. |
| 8. ¿Build de Sphinx con 0 warnings? | N/A | El repo no tiene Sphinx (decision documentada en `docs/pm/README.md` y en `dec-formato-markdown-en-vez-de-rst` de esta seccion). Equivalente: los archivos markdown renderizan correctamente en GitHub y los bloques mermaid usan sintaxis valida. |

## Iniciativas futuras sugeridas

Surgidas del trabajo de esta iniciativa. Cada una requiere su propio
ciclo de PROC-GESTION-001.

| Iniciativa propuesta | Prioridad | Justificacion |
|---------------------|-----------|---------------|
| `integrar-rama-resume-ecommerce-project-en-develop` | Must | Los siete commits de la rama pendiente aportan guardrails y un UC. Mantenerlos fuera es perder valor. |
| `definir-proceso-promocion-develop-a-main` | Must | 149 commits es demasiado para un solo evento. Necesita estrategia (semver, tag, changelog, criterios de promocion). |
| `borrar-ramas-integradas-del-remoto` | Should | Operacion trivial pero requiere acuerdo. Las tres ramas integradas ocupan espacio sin aportar nada vivo. |
| `auditar-uso-de-src-decorators-y-src-types` | Should | Decidir si se mantienen o eliminan, resolviendo la deuda registrada. |
| `actualizar-readme-raiz-para-mencionar-arc42-y-pm` | Could | Trabajo de cinco minutos pero hace visible la documentacion creada. |
| `implementar-ci-cd-con-github-actions` | Could | Mitiga el riesgo de build manual. |
| `validacion-automatica-contrato-api-vs-mocks` | Could | Mitiga el riesgo de divergencia de mocks. |

## Cierre

Esta iniciativa esta **completada**. Los nueve criterios de
completitud verificables se cumplen. Las ocho preguntas del checklist
de PROC-GESTION-001 estan respondidas. No hay tareas pendientes en el
DAG. Los hallazgos estan registrados en `docs/riesgos-y-deuda-tecnica/`
o como iniciativas futuras sugeridas arriba.

El material producido habilita las decisiones operativas (cuando
integrar la rama pendiente, cuando promover develop a main, si borrar
ramas integradas) sin tomarlas: esas son responsabilidad del equipo,
no de esta iniciativa.
