# Alcance: validar-perfiles-de-usuario

| Campo | Valor |
|-------|-------|
| Iniciativa | validar-perfiles-de-usuario |
| Estado | En analisis |
| Version | 1.0.0 |
| Fecha de creacion | 2026-05-27T21:35:00 |
| Iniciativa origen | raiz |

## Premisa verificada

| Campo | Valor |
|-------|-------|
| Nivel de gate ejecutado | 0a (lectura de codigo; sin red flags activos) |
| Evidencia A-01 | `grep "is_admin" src/types/domain.ts` -> sin resultados |
| Evidencia A-02 | `find src/mocks/handlers/auth.ts \| grep "is_admin"` -> sin resultados |
| Evidencia A-03 | `find src/components/shared/ProtectedRoute -name "*.test.*"` -> sin resultados |
| Evidencia A-04 | `grep "is_staff\|redirect\|/admin\|/account" tests/unit/pages/LoginPage.test.jsx` -> sin resultados |
| Evidencia A-05 | `grep "selectIsAdmin" src/redux/selectors/index.js` -> evalua is_staff, no is_admin |

## Por que existe esta iniciativa

El template expone perfiles de usuario parcialmente definidos: el
contrato de datos (`domain.ts`) dice que hay dos perfiles
(`is_staff: true/false`), pero el UI ya construyo tres
(`Admin`, `Staff`, `Comprador`). Ningun guard de ruta tiene tests.
Un proyecto que adopte el template encontrara este bug el primer dia.

Esta iniciativa sincroniza el contrato, completa el mock de demo y
agrega los tests de los guards que faltan.

## Que esta dentro del alcance

### F1 — Alinear el contrato del modelo User

Agregar `is_admin?: boolean` al tipo `User` en `domain.ts`.
Agregar la credencial de demo para Staff en `auth.ts` (MSW).
Documentar la decision de diseno sobre `selectIsAdmin` (A-05):
si el template usa `is_staff` como proxy de admin o si debe
distinguir `is_staff` de `is_admin`, y actualizar el selector
y el guard en consecuencia.

### F2 — Tests para los guards de ruta

Crear `ProtectedRoute.test.jsx` con los casos:
- usuario no autenticado accede a ruta protegida -> redirige a `/auth/login`
- usuario autenticado accede a ruta protegida -> renderiza el contenido

Crear `AdminRoute.test.jsx` con los casos:
- usuario no autenticado accede a `/admin/*` -> redirige a `/auth/login`
- usuario autenticado sin is_staff accede a `/admin/*` -> redirige a `/`
- usuario autenticado con is_staff accede a `/admin/*` -> renderiza el contenido

### F3 — Tests de flujo post-login por perfil

Ampliar `LoginPage.test.jsx` con los casos:
- login exitoso de comprador -> redirige a `/account`
- login exitoso de admin (`is_staff: true`) -> redirige a `/admin`
- login exitoso con `state.from` en el router -> redirige a la ruta original

### F4 — Verificacion y cierre

`npm test -- --watchAll=false`: todos los tests nuevos pasan.
`npm run build`: EXIT=0 sin nuevos errores.
Crear `decisiones-validar-perfiles-de-usuario.md`.

## Criterio de completitud

1. `domain.ts` tiene el campo `is_admin?: boolean` en la interfaz `User`.
2. `auth.ts` tiene una tercera credencial para el perfil Staff.
3. `ProtectedRoute.test.jsx` existe con minimo 2 tests pasando.
4. `AdminRoute.test.jsx` existe con minimo 3 tests pasando.
5. `LoginPage.test.jsx` cubre el redirect post-login para comprador y admin.
6. `npm test -- --watchAll=false` no introduce nuevas suites fallidas.
7. `npm run build` EXIT=0.

## Fuera de alcance

| Item | Razon |
|------|-------|
| Implementar el cuarto perfil (proveedor, moderador, etc.) | No existe demanda ni evidencia en el codigo actual |
| Cambiar la logica de acceso del panel admin en el backend | Esta iniciativa es 100% frontend |
| Cubrir las 11 suites preexistentes que fallan | Ya documentado en decisiones de corregir-deuda-diseno-yoruba |
| Tests de integracion E2E con Playwright o Cypress | Fuera del stack actual del template |

## Estimacion de esfuerzo

| Fase | Archivos | Esfuerzo estimado |
|------|----------|-------------------|
| F1 — Contrato User | 2 archivos | 20 min |
| F2 — Tests guards | 2 archivos nuevos | 45 min |
| F3 — Tests post-login | 1 archivo existente ampliado | 30 min |
| F4 — Verificacion y cierre | verificacion + docs | 20 min |
| **Total** | **~5 archivos** | **~2 horas** |
