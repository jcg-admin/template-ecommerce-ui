# Tareas: validar-perfiles-de-usuario

| Campo | Valor |
|-------|-------|
| Iniciativa | validar-perfiles-de-usuario |
| Fecha de creacion | 2026-05-27T21:35:00 |

## F1 — Alinear el contrato del modelo User

| ID | Descripcion | Archivo | Depende de | Estado |
|----|-------------|---------|------------|--------|
| T-101 | Agregar `is_admin?: boolean` a la interfaz `User` | `src/types/domain.ts` | — | Hecha |
| T-102 | Agregar credencial Staff al handler MSW (`staff@test.mx / Staff1234!`, id 3, is_staff true, is_admin false) | `src/mocks/handlers/auth.ts` | T-101 | Hecha |
| T-103 | Documentar y aplicar la decision sobre `selectIsAdmin`: si evalua `is_staff` o `is_admin`; actualizar `src/redux/selectors/index.js` y `AdminRoute.jsx` si la decision cambia el comportamiento actual | `src/redux/selectors/index.js`, `src/components/shared/ProtectedRoute/AdminRoute.jsx` | T-101 | Hecha |

## F2 — Tests para los guards de ruta

| ID | Descripcion | Archivo | Depende de | Estado |
|----|-------------|---------|------------|--------|
| T-201 | Crear `ProtectedRoute.test.jsx` con casos: (a) no autenticado redirige a `/auth/login`, (b) autenticado renderiza Outlet | `src/components/shared/ProtectedRoute/ProtectedRoute.test.jsx` | T-103 | Hecha |
| T-202 | Crear `AdminRoute.test.jsx` con casos: (a) no autenticado redirige a `/auth/login`, (b) comprador redirige a `/`, (c) admin (segun decision T-103) renderiza Outlet | `src/components/shared/ProtectedRoute/AdminRoute.test.jsx` | T-103 | Hecha |

## F3 — Tests de flujo post-login por perfil

| ID | Descripcion | Archivo | Depende de | Estado |
|----|-------------|---------|------------|--------|
| T-301 | Ampliar `LoginPage.test.jsx`: login comprador exitoso redirige a `/account` | `tests/unit/pages/LoginPage.test.jsx` | T-101 | Hecha |
| T-302 | Ampliar `LoginPage.test.jsx`: login admin exitoso (`is_staff: true`) redirige a `/admin` | `tests/unit/pages/LoginPage.test.jsx` | T-103 | Hecha |
| T-303 | Ampliar `LoginPage.test.jsx`: login exitoso con `state.from` preserva la ruta original | `tests/unit/pages/LoginPage.test.jsx` | T-301 | Hecha |

## F4 — Verificacion y cierre

| ID | Descripcion | Archivo | Depende de | Estado |
|----|-------------|---------|------------|--------|
| T-401 | `npm test -- --watchAll=false`: 0 nuevas suites fallidas respecto a la baseline | (verificacion) | T-201, T-202, T-303 | Hecha |
| T-402 | `npm run build`: EXIT=0 sin nuevos errores | (verificacion) | T-401 | Hecha |
| T-403 | Crear `decisiones-validar-perfiles-de-usuario.md` con las cuatro secciones canonicas | `docs/pm/iniciativas/validar-perfiles-de-usuario/decisiones-*.md` | T-402 | Hecha |
| T-404 | Cerrar `index.md`, actualizar `indice-de-iniciativas.md` a Cerrada; ejecutar I-015; commit de cierre | (cierre) | T-403 | Hecha |

## Totales

| Fase | Tareas | Estado |
|------|--------|--------|
| F1 | 3 | 3 Hechas / 0 Pendientes |
| F2 | 2 | 2 Hechas / 0 Pendientes |
| F3 | 3 | 3 Hechas / 0 Pendientes |
| F4 | 4 | 4 Hechas / 0 Pendientes |
| **Total** | **12** | **12 Hechas / 0 Pendientes** |
