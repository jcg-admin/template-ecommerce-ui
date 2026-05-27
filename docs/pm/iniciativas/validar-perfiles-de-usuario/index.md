# Iniciativa: validar-perfiles-de-usuario

| Campo | Valor |
|-------|-------|
| Slug | `validar-perfiles-de-usuario` |
| Estado | Cerrada |
| Orden de backlog | (abierta directamente a analisis) |
| Fecha de creacion (directorio) | 2026-05-27T21:35:00 |
| Fecha de apertura formal | 2026-05-27T21:35:00 |
| Fecha de paso a ejecucion | 2026-05-27T21:40:00 |
| Fecha de cierre | 2026-05-27T22:00:00 |
| Iniciativa origen | (raiz — hallazgo post-cierre de corregir-deuda-diseno-yoruba) |

## Motivo de existencia

El analisis del sistema de usuarios realizado tras el cierre de
`corregir-deuda-diseno-yoruba` expuso dos problemas independientes que
comparten la misma causa raiz: el contrato de datos del modelo `User`
y los tests de los guards de ruta no estan sincronizados con lo que
el UI ya construyo.

**Problema 1 — Discrepancia de contrato en el modelo User.**
`domain.ts` define `User` con `is_staff?: boolean` como unico
discriminador de rol. Sin embargo, `AdminUserDetailPage.jsx` ya
renderiza tres etiquetas (`Admin`, `Staff`, `Comprador`) usando
`user.is_admin` y `user.is_staff`, y `AdminUsersPage.jsx` ya expone
cuatro filtros de rol (`Todos`, `Compradores`, `Administradores`,
`Staff`). El campo `is_admin` no existe en el tipo `User` ni en el
handler MSW de `auth.ts`. Esto significa que la etiqueta `Admin`
nunca puede aparecer con datos reales del mock y que cualquier proyecto
que adopte el template encontrara este bug el primer dia.

**Problema 2 — Guards de ruta sin tests.**
`ProtectedRoute/index.jsx` y `AdminRoute.jsx` no tienen ni un test
propio. Nadie verifica que un usuario no autenticado sea redirigido a
`/auth/login`, ni que un comprador (`is_staff: false`) que intenta
acceder a `/admin` sea redirigido a `/`. Tampoco existe un test del
flujo completo de login que valide a que ruta va cada perfil despues
de autenticarse.

## Estado actual

Iniciativa cerrada. Ver decisiones-validar-perfiles-de-usuario.md.

## Indice de documentos

| Documento | Proposito |
|-----------|-----------|
| [decisiones-validar-perfiles-de-usuario.md](decisiones-validar-perfiles-de-usuario.md) | Decisiones, 4 bugs corregidos, resultado final. |
| [alcance-validar-perfiles-de-usuario.md](alcance-validar-perfiles-de-usuario.md) | Que cubre, criterio de completitud, fuera de alcance. |
| [analisis-validar-perfiles-de-usuario.md](analisis-validar-perfiles-de-usuario.md) | Hallazgos con evidencia de codigo. |
| [plan-validar-perfiles-de-usuario.md](plan-validar-perfiles-de-usuario.md) | Fases y descripcion de entregables. |
| [tareas-validar-perfiles-de-usuario.md](tareas-validar-perfiles-de-usuario.md) | Lista plana de tareas con estado y DAG. |
| [progreso-validar-perfiles-de-usuario.md](progreso-validar-perfiles-de-usuario.md) | Log del avance con timestamps reales. |
