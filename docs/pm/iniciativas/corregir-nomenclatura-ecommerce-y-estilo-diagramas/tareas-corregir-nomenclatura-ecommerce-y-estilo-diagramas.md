# Tareas: Corregir nomenclatura `ecommerce` y estilo de diagramas

## F0 - Apertura + analisis + decisiones (30 min)

| ID | Descripcion | Esfuerzo | Estado | Entregable |
|----|-------------|----------|--------|------------|
| T-001 | Crear directorio iniciativa + 5 docs PM (index, alcance, analisis, plan, tareas, progreso) | 25 min | **En curso** | 5 archivos .md |
| T-002 | Aprobar 7 decisiones D-* en index | 5 min | Pendiente | Decisiones registradas |

## F1 - Backup defensivo (15 min)

| ID | Descripcion | Esfuerzo | Estado | Entregable |
|----|-------------|----------|--------|------------|
| T-101 | Backup del UI con `.git/` completo + manifest + MD5 en `/tmp/backups/` | 7 min | **Cerrada** | tarball + manifest + .md5 |
| T-102 | Backup del server con `.git/` completo + manifest + MD5 en `/tmp/backups/` | 7 min | **Cerrada** | tarball + manifest + .md5 |

## F2 - Renombre repo server (45 min)

| ID | Descripcion | Esfuerzo | Estado | Entregable |
|----|-------------|----------|--------|------------|
| T-201 | `mv` directorio: `template-ecomerce-ui-server` -> `template-ecommerce-server` | 2 min | **Cerrada** | Directorio renombrado |
| T-202 | Configurar remote: `git remote add origin https://github.com/jcg-admin/template-ecommerce-server.git` | 2 min | **Cerrada** | Remote configurado |
| T-203 | Actualizar refs internas del server | 25 min | **Cerrada** | Refs internas actualizadas |
| T-204 | Actualizar refs del server al UI | 10 min | **Cerrada** | Refs cross-repo actualizadas |
| T-205 | Commit unitario en server con subject <=50 chars | 5 min | **Cerrada** | 1 commit |

## F3 - Refs del UI a si mismo (60 min)

| ID | Descripcion | Esfuerzo | Estado | Entregable |
|----|-------------|----------|--------|------------|
| T-301 | (ver progreso) | -- | **Cerrada** | 2 archivos modificados |
| T-302 | (ver progreso) | -- | **Cerrada** | ~249 archivos modificados |
| T-303 | (ver progreso) | -- | **Cerrada** | ~11 archivos modificados |
| T-304 | (ver progreso) | -- | **Cerrada** | Inspeccion documentada |
| T-305 | (ver progreso) | -- | **Cerrada** | Verificacion documentada |
| T-306 | (ver progreso) | -- | **Cerrada** | 1 commit |

## F4 - Refs cross-repo en el UI (30 min)

| ID | Descripcion | Esfuerzo | Estado | Entregable |
|----|-------------|----------|--------|------------|
| T-401 | (ver progreso) | -- | **Cerrada** | ~7 archivos modificados |
| T-402 | (ver progreso) | -- | **Cerrada** | ~2 archivos modificados |
| T-403 | (ver progreso) | -- | **Cerrada** | ~6 archivos modificados |
| T-404 | (ver progreso) | -- | **Cerrada** | Inspeccion linea a linea + cambios selectivos |
| T-405 | (ver progreso) | -- | **Cerrada** | Pocos archivos modificados |
| T-406 | (ver progreso) | -- | **Cerrada** | 1 commit |

## F5 - Mermaid tema dark canonico (60 min)

| ID | Descripcion | Esfuerzo | Estado | Entregable |
|----|-------------|----------|--------|------------|
| T-501 | (ver progreso) | -- | **Cerrada** | 13 diagramas actualizados |
| T-502 | (ver progreso) | -- | **Cerrada** | 6 diagramas actualizados |
| T-503 | (ver progreso) | -- | **Cerrada** | 1 commit |

## F6 - Verificacion (30 min)

| ID | Descripcion | Esfuerzo | Estado | Entregable |
|----|-------------|----------|--------|------------|
| T-601 | (ver progreso) | -- | **Cerrada** | Salida documentada |
| T-602 | (ver progreso) | -- | **Cerrada** | Salida documentada |
| T-603 | (ver progreso) | -- | **Cerrada** | `dist/` regenerado |
| T-604 | (ver progreso) | -- | **Cerrada** | Salida documentada |
| T-605 | (ver progreso) | -- | **Cerrada** | 1 commit opcional |

## F7 - Cierre (15 min)

| ID | Descripcion | Esfuerzo | Estado | Entregable |
|----|-------------|----------|--------|------------|
| T-701 | (ver progreso) | -- | **Cerrada** | 2 tarballs + manifests + .md5 |
| T-702 | (ver progreso) | -- | **Cerrada** | Indice actualizado |
| T-703 | (ver progreso) | -- | **Cerrada** | 1 commit |

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
