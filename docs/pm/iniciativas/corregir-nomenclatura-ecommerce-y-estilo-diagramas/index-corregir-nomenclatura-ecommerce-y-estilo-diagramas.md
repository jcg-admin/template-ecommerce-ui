# Iniciativa: Corregir nomenclatura `ecommerce` y estilo de diagramas

| Campo | Valor |
|-------|-------|
| Artefacto | INI-UI-009 |
| Tipo | Iniciativa de project management |
| Submodulo | ui (template) + server (template-ecommerce-server) |
| Estado | **En ejecucion** |
| Version | 1.0.0 |
| Fecha de creacion | 2026-05-22 |
| Fecha de cierre | (en curso) |
| Autor | NestorMonroy |
| Clasificacion | Interno |
| Procedimiento de gestion | PROC-GESTION-001 v4.0.0 + arc42 |

## Filosofia rectora

**La nomenclatura del proyecto debe ser ortograficamente correcta y
consistente en todos los repos hermanos.** El typo historico
`e-comerce` (una `m`, con guion) se corrige a `ecommerce` (doble
`m`, sin guion) en TODOS los strings que apuntan a este proyecto y
sus repos hermanos.

Excepciones explicitas que NO se tocan:

1. **Repo referente externo** `jcg-admin/e-comerce-server` -- es un
   repo real en GitHub con ese nombre exacto; tocarlo rompe la
   URL.
2. **Procedimiento externo**
   `Procedimiento-Implementacion-Almacenamiento-WSL2-ecomerce-p001`
   -- nombre exacto de procedimiento de gestion externo.
3. **Mensajes de commit historicos** (129 en UI + 30 en server) --
   reescribir historia con `filter-branch` es destructivo y rompe
   los hashes; los textos viejos se preservan como historia.

Adicionalmente, esta iniciativa **estandariza el estilo de
diagramas Mermaid** segun la convencion adoptada en el repo
hermano server: tema dark con `themeVariables` canonico,
identificadores `snake_case` descriptivos (no alias cortos), y
`classDef`/`class` para flowchart cuando aplica.

## Que produce esta iniciativa

| Entregable | Estado al cierre |
|-----------|------------------|
| Inventario de las 12 variantes `comerce` detectadas y su clasificacion | A producir en F0 |
| Decisiones aprobadas (D-NOMBRE-UI, D-NOMBRE-SERVER, D-NOMBRE-HERMANOS, D-REFERENTE-EXTERNO, D-PROCEDIMIENTO-EXTERNO, D-MERMAID-CONVENCION, D-COMMITS-HISTORIA) | A aprobar en F0 |
| Plan de ejecucion en 7 fases con tareas atomicas | A producir en F0 |
| Backup defensivo de ambos repos | A producir en F1 |
| Repo server renombrado: directorio + remote + contenido interno | A producir en F2 |
| Repo UI con refs a si mismo corregidas (package.json, README, docs, comentarios) | A producir en F3 |
| Repo UI con refs cross-repo corregidas (server, api, db, doc) | A producir en F4 |
| 19 diagramas Mermaid con estilo dark canonico | A producir en F5 |
| Verificacion: lint, tests, build, tests del server | A producir en F6 |
| Cierre formal: backup post-cambios + indice de iniciativas actualizado | A producir en F7 |

## Indice de documentos

| Documento | Proposito |
|-----------|-----------|
| [alcance-corregir-nomenclatura-ecommerce-y-estilo-diagramas.md](alcance-corregir-nomenclatura-ecommerce-y-estilo-diagramas.md) | Que cubre la iniciativa, criterio de completitud, fuera de alcance. |
| [analisis-corregir-nomenclatura-ecommerce-y-estilo-diagramas.md](analisis-corregir-nomenclatura-ecommerce-y-estilo-diagramas.md) | Inventario detallado de las 12 variantes detectadas con clasificacion + analisis de Mermaid actual. |
| [plan-corregir-nomenclatura-ecommerce-y-estilo-diagramas.md](plan-corregir-nomenclatura-ecommerce-y-estilo-diagramas.md) | Plan de 7 fases con tareas atomicas y DAG de dependencias. |
| [tareas-corregir-nomenclatura-ecommerce-y-estilo-diagramas.md](tareas-corregir-nomenclatura-ecommerce-y-estilo-diagramas.md) | Lista plana de las tareas con estado actual. |
| [progreso-corregir-nomenclatura-ecommerce-y-estilo-diagramas.md](progreso-corregir-nomenclatura-ecommerce-y-estilo-diagramas.md) | Log de eventos atomizados. |

## Decisiones aprobadas

| ID | Decision | Contenido |
|----|----------|-----------|
| **D-NOMBRE-UI** | Nombre canonico del UI | Directorio: `template-ecommerce-ui`. URL: `https://github.com/jcg-admin/template-ecommerce-ui.git`. Paquete npm: `ecommerce-ui`. |
| **D-NOMBRE-SERVER** | Nombre canonico del server | Directorio: `template-ecommerce-server` (sin `-ui-`, doble `m`). URL: `https://github.com/jcg-admin/template-ecommerce-server.git`. |
| **D-NOMBRE-HERMANOS** | Nombres de repos hermanos | `ecommerce-api`, `ecommerce-db`, `ecommerce-doc` (con doble `m`, sin guion). |
| **D-REFERENTE-EXTERNO** | Referente externo intacto | `jcg-admin/e-comerce-server` NO se renombra en menciones porque es repo externo real con ese nombre exacto en GitHub. |
| **D-PROCEDIMIENTO-EXTERNO** | Procedimiento externo intacto | `Procedimiento-Implementacion-Almacenamiento-WSL2-ecomerce-p001 v1.0.0` NO se toca. |
| **D-MERMAID-CONVENCION** | Convencion canonica de diagramas | Tema `base` dark con `themeVariables`: background `#0f172a`, primary `#1e293b`/`#f1f5f9`, border `#94a3b8`, line `#cbd5e1`, fontSize `13px`. Para `flowchart`: anadir `classDef`+`class` con paleta primaria (`#1e293b`/`#60a5fa`) + secundaria (`#334155`/`#94a3b8`) + acentos (`#14532d`/`#4ade80` para done, `#7c2d12`/`#fb923c` para warn). **Identificadores descriptivos `snake_case`** (`nginx_web_server`, no `n`/`a`/`b`). Para no-flowchart (sequenceDiagram, gantt, pie, gitGraph): solo aplicar el bloque `%%{init}%%` sin classDef. |
| **D-COMMITS-HISTORIA** | No reescribir commits viejos | Los 129 commits del UI + 30 del server anteriores a esta iniciativa se preservan. Los cambios viven en commits nuevos hacia adelante. Mensajes historicos en `progreso-*.md` de iniciativas previas tampoco se editan (son bitacora). |

## Alcance cruzado con otros repos

Esta iniciativa coordina trabajo en **DOS repos**:

- **`template-ecommerce-ui`** (este repo) -- la mayoria del trabajo
- **`template-ecommerce-server`** (repo hermano, renombrado en F2)

El progreso autoritativo (PM) vive en este repo. Cada repo registra
sus propios commits unitarios.

## Iniciativas relacionadas

- [`crear-template-ecomerce-ui-server`](../../../template-ecomerce-ui-server/docs/pm/iniciativas/crear-template-ecomerce-ui-server/) -- iniciativa cerrada del repo server hermano. Esta iniciativa actualiza sus refs.
- [`mapear-y-corregir-scss-completo`](../mapear-y-corregir-scss-completo/) -- iniciativa pausada en este repo, sin dependencias con la actual.

## Norma de hallazgos atomizados

Aprendida en la iniciativa cerrada `crear-template-ecomerce-ui-server`:
cada hallazgo tecnico, decision de diseno tomada durante la
ejecucion, idiosincrasia descubierta o trade-off resuelto se
registra como evento `Hallazgo durante la ejecucion` PROPIO en el
turno que se produce, NO dentro de un Cierre. La iniciativa
anterior demostro el valor de esta disciplina (59 hallazgos
atomizados sirvieron para trazabilidad completa).

## Norma Tim Pope ≤ 50 chars en subjects

La iniciativa anterior tuvo 3 violaciones documentadas. En esta se
vigila desde el principio. Si un subject candidato excede 50, se
acorta antes de commit. Patron generalizable: usar categoria
abstracta (`Docs:`, `Refactor:`, `F<n>:`) cuando hay multiples
deliverables.
