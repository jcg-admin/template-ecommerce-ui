# Plan: validar-perfiles-de-usuario

| Campo | Valor |
|-------|-------|
| Iniciativa | validar-perfiles-de-usuario |
| Estado | En analisis |
| Fecha de creacion | 2026-05-27T21:35:00 |

## Fases

### F1 — Alinear el contrato del modelo User

**Entregable:** el tipo `User` en `domain.ts` incluye `is_admin`, el
handler MSW tiene la tercera credencial y el selector `selectIsAdmin`
tiene documentada su decision de diseno.

Tareas: T-101, T-102, T-103.

La decision central de F1 es T-103: si `selectIsAdmin` debe continuar
evaluando `is_staff` (todos los staff son admin) o debe evaluar
`is_admin` (distinguiendo staff tecnico de administrador del negocio).
Esta decision afecta a `AdminRoute.jsx` y debe estar documentada antes
de escribir los tests de F2.

### F2 — Tests para los guards de ruta

**Entregable:** `ProtectedRoute.test.jsx` y `AdminRoute.test.jsx` con
cobertura de los caminos positivo y negativo de cada guard.

Tareas: T-201, T-202.

Depende de T-103 (decision sobre `selectIsAdmin`) porque los tests
de `AdminRoute` deben reflejar la logica decidida.

### F3 — Tests de flujo post-login por perfil

**Entregable:** `LoginPage.test.jsx` ampliado con tres casos de
redirect post-autenticacion: comprador a `/account`, admin a `/admin`,
y ruta original preservada via `state.from`.

Tareas: T-301, T-302, T-303.

### F4 — Verificacion y cierre

**Entregable:** suite limpia, build verde, documento de decisiones.

Tareas: T-401, T-402, T-403, T-404.

## DAG de dependencias entre fases

```
F1 (T-101, T-102, T-103)
  |
  +-- F2 (T-201, T-202)   <- requiere T-103 decidida
  |
  +-- F3 (T-301, T-302, T-303)  <- puede empezar en paralelo con F2
  |
  +-- F4 (T-401..T-404)   <- requiere F2 y F3 completas
```

F1 desbloquea F2 y F3. F4 solo comienza cuando F2 y F3 estan
completas.
