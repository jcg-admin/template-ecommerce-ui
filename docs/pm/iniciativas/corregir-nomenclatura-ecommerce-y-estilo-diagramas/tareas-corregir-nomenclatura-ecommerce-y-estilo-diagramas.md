# Tareas: Corregir nomenclatura `ecommerce` y estilo de diagramas

## F0 - Apertura + analisis + decisiones (30 min)

| ID | Descripcion | Esfuerzo | Estado | Entregable |
|----|-------------|----------|--------|------------|
| T-001 | Crear directorio iniciativa + 5 docs PM (index, alcance, analisis, plan, tareas, progreso) | 25 min | **En curso** | 5 archivos .md |
| T-002 | Aprobar 7 decisiones D-* en index | 5 min | Pendiente | Decisiones registradas |

## F1 - Backup defensivo (15 min)

| ID | Descripcion | Esfuerzo | Estado | Entregable |
|----|-------------|----------|--------|------------|
| T-101 | Backup del UI con `.git/` completo + manifest + MD5 en `/tmp/backups/` | 7 min | Pendiente | tarball + manifest + .md5 |
| T-102 | Backup del server con `.git/` completo + manifest + MD5 en `/tmp/backups/` | 7 min | Pendiente | tarball + manifest + .md5 |

## F2 - Renombre repo server (45 min)

| ID | Descripcion | Esfuerzo | Estado | Entregable |
|----|-------------|----------|--------|------------|
| T-201 | `mv` directorio: `template-ecomerce-ui-server` -> `template-ecommerce-server` | 2 min | Pendiente | Directorio renombrado |
| T-202 | Configurar remote: `git remote add origin https://github.com/jcg-admin/template-ecommerce-server.git` | 2 min | Pendiente | Remote configurado |
| T-203 | Actualizar refs internas del server (configs, scripts, docs vivos, README) a su propio nombre nuevo. NO tocar bitacora `progreso-*.md` de la iniciativa cerrada. | 25 min | Pendiente | Refs internas actualizadas |
| T-204 | Actualizar refs del server al UI: `template-e-comerce-ui` -> `template-ecommerce-ui` | 10 min | Pendiente | Refs cross-repo actualizadas |
| T-205 | Commit unitario en server con subject <=50 chars | 5 min | Pendiente | 1 commit |

## F3 - Refs del UI a si mismo (60 min)

| ID | Descripcion | Esfuerzo | Estado | Entregable |
|----|-------------|----------|--------|------------|
| T-301 | Actualizar `package.json` y `package-lock.json` (`name: ecommerce-ui`, `description`) | 5 min | Pendiente | 2 archivos modificados |
| T-302 | sed batch: `e-comerce-ui` -> `ecommerce-ui` en 249 archivos. Excluir: `node_modules/`, `.git/`, `.cache/`, `dist/`, `package-lock.json`, bitacoras `progreso-*.md` de iniciativas previas | 20 min | Pendiente | ~249 archivos modificados |
| T-303 | sed batch: `template-e-comerce-ui` -> `template-ecommerce-ui` | 10 min | Pendiente | ~11 archivos modificados |
| T-304 | Verificar manualmente 11 lineas de variante larga `template-e-comerce-ui-server` | 10 min | Pendiente | Inspeccion documentada |
| T-305 | Verificar cero `e-comerce-ui` huerfanos en docs editables | 5 min | Pendiente | Verificacion documentada |
| T-306 | Commit unitario en UI con subject <=50 chars | 10 min | Pendiente | 1 commit |

## F4 - Refs cross-repo en el UI (30 min)

| ID | Descripcion | Esfuerzo | Estado | Entregable |
|----|-------------|----------|--------|------------|
| T-401 | sed: `e-comerce-api` -> `ecommerce-api` | 3 min | Pendiente | ~7 archivos modificados |
| T-402 | sed: `e-comerce-db` -> `ecommerce-db` | 3 min | Pendiente | ~2 archivos modificados |
| T-403 | sed: `e-comerce-doc` -> `ecommerce-doc` | 3 min | Pendiente | ~6 archivos modificados |
| T-404 | CASO POR CASO `e-comerce-server`: distinguir referente externo (NO tocar) vs hermano (cambiar a `ecommerce-server`) | 15 min | Pendiente | Inspeccion linea a linea + cambios selectivos |
| T-405 | sed: `e-comerce` huerfano -> `ecommerce`, excluyendo referente y procedimiento p001 | 3 min | Pendiente | Pocos archivos modificados |
| T-406 | Commit unitario en UI con subject <=50 chars | 3 min | Pendiente | 1 commit |

## F5 - Mermaid tema dark canonico (60 min)

| ID | Descripcion | Esfuerzo | Estado | Entregable |
|----|-------------|----------|--------|------------|
| T-501 | Aplicar plantilla completa (init theme + 5 classDef + class + identificadores snake_case) a los 13 flowchart/graph | 35 min | Pendiente | 13 diagramas actualizados |
| T-502 | Aplicar solo bloque init a 6 no-flowchart (3 sequenceDiagram + 1 gantt + 1 pie + 1 gitGraph). Expandir alias cortos en sequenceDiagram. | 20 min | Pendiente | 6 diagramas actualizados |
| T-503 | Commit unitario en UI con subject <=50 chars | 5 min | Pendiente | 1 commit |

## F6 - Verificacion (30 min)

| ID | Descripcion | Esfuerzo | Estado | Entregable |
|----|-------------|----------|--------|------------|
| T-601 | UI: `npm run lint` (espera 0 errores) | 5 min | Pendiente | Salida documentada |
| T-602 | UI: `npm test` (espera baseline 2 failed / 813 passed) | 10 min | Pendiente | Salida documentada |
| T-603 | UI: `npm run build` (regenera `dist/`) | 10 min | Pendiente | `dist/` regenerado |
| T-604 | Server: `bash tests/run_all.sh` (espera 5 suites OK, 72/0/1) | 3 min | Pendiente | Salida documentada |
| T-605 | Commit del `dist/` regenerado o confirmar `.gitignore` lo excluye | 2 min | Pendiente | 1 commit opcional |

## F7 - Cierre (15 min)

| ID | Descripcion | Esfuerzo | Estado | Entregable |
|----|-------------|----------|--------|------------|
| T-701 | Backup post-cambios de UI + server en `/tmp/backups/` con prefijo `POST-NOMENCLATURA-` | 7 min | Pendiente | 2 tarballs + manifests + .md5 |
| T-702 | Actualizar `docs/pm/iniciativas/indice-de-iniciativas.md` con esta iniciativa marcada como cerrada | 5 min | Pendiente | Indice actualizado |
| T-703 | Commit final de cierre con subject <=50 chars | 3 min | Pendiente | 1 commit |

## Resumen

| Fase | Total | Cerradas | Pendientes |
|------|-------|----------|------------|
| F0 | 2 | 0 | 2 |
| F1 | 2 | 0 | 2 |
| F2 | 5 | 0 | 5 |
| F3 | 6 | 0 | 6 |
| F4 | 6 | 0 | 6 |
| F5 | 3 | 0 | 3 |
| F6 | 5 | 0 | 5 |
| F7 | 3 | 0 | 3 |
| **TOTAL** | **32** | **0** | **32** |
