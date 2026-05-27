# Analisis: validar-perfiles-de-usuario

| Campo | Valor |
|-------|-------|
| Iniciativa | validar-perfiles-de-usuario |
| Estado | En analisis |
| Fecha de creacion | 2026-05-27T21:35:00 |
| Iniciativa origen | raiz — hallazgo post-cierre de corregir-deuda-diseno-yoruba |

## Metodologia

Lectura directa de codigo fuente en cuatro zonas:
`src/types/domain.ts`, `src/mocks/handlers/auth.ts`,
`src/components/shared/ProtectedRoute/`, y los tests de layouts
(`AccountLayout.test.jsx`, `AdminLayout.navigation.test.jsx`).
Busqueda exhaustiva de tests que mencionen `AdminRoute`, `ProtectedRoute`,
`is_staff`, `is_admin`, redirect post-login.

## Hallazgo A-01 — El campo `is_admin` no existe en el tipo User

**Evidencia:**

```
// src/types/domain.ts  linea 1-13
export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  is_staff?: boolean;        // unico discriminador de rol
  profile_completeness?: number;
  pending_fields?: string[];
}
```

```
// src/pages/admin/AdminUserDetailPage.jsx  lineas 48-49
user.is_admin ? 'Admin' : user.is_staff ? 'Staff' : 'Comprador'
```

El componente usa `user.is_admin` pero ese campo no existe en el tipo
`User`. TypeScript no lo detecta como error porque el campo se accede
sobre el objeto de respuesta del API (tipado como `User`), que en
runtime puede tener campos extra, pero el contrato declarado en
`domain.ts` lo omite. Cualquier test que construya un mock `User`
sin `is_admin` vera la etiqueta `Staff` o `Comprador` aunque el
usuario deberia ser `Admin`.

**Impacto:** La etiqueta `Admin` en `AdminUserDetailPage` nunca
aparece en el entorno de tests ni en el modo demo, porque el mock
MSW `auth.ts` no incluye `is_admin` en los objetos que devuelve.

## Hallazgo A-02 — El handler MSW solo tiene dos credenciales de perfil

**Evidencia:**

```
// src/mocks/handlers/auth.ts  comentario de cabecera
// Credenciales validas (contrato de tests):
//   comprador@test.mx / Test1234!           -> id 1, is_staff false
//   admin@e-comerce.example.com / Admin1234! -> id 2, is_staff true
```

El filtro de `AdminUsersPage` tiene cuatro opciones: Compradores,
Administradores, Staff, Todos. No hay credencial de demo para el
perfil `Staff` (`is_staff: true`, `is_admin: false`), que es el
tercer perfil que el UI ya distingue.

## Hallazgo A-03 — ProtectedRoute y AdminRoute no tienen tests propios

**Evidencia:**

```
$ find src/components/shared/ProtectedRoute -name "*.test.*"
(sin resultados)
```

Los dos guards de ruta del template no tienen ni un test unitario.
Lo que existe es el test de `AdminLayout.navigation.test.jsx`, que
renderiza el `AdminLayout` con un usuario `is_staff: true` en el
store y verifica que la navegacion funciona. Pero no verifica el
camino negativo: que un comprador que llega a `/admin` sea redirigido
a `/`.

El unico test que verifica comportamiento de redireccion es
`AddToWishlistButton.test.jsx`, que comprueba que sin sesion activa
se llama a `navigate('/auth/login')`. Ese test cubre el componente,
no el guard.

## Hallazgo A-04 — LoginPage.test no cubre el redirect post-login por perfil

**Evidencia:**

```
// tests/unit/pages/LoginPage.test.jsx  describes
it('renderiza el formulario de inicio de sesion', ...)
it('muestra error de validacion cuando el username esta vacio', ...)
it('muestra error de validacion cuando la contrasena esta vacia', ...)
it('limpia el error de campo al escribir', ...)
it('tiene link para recuperar contrasena', ...)
it('tiene link para crear cuenta', ...)
it('muestra estado de carga cuando isLoading es true', ...)
```

Siete tests, todos sobre el formulario. Ninguno verifica que tras
un login exitoso de comprador el router lleve a `/account`, ni que
tras un login de admin lleve a `/admin`. Este comportamiento depende
de `authSlice` y del router, pero no hay test de integracion que
lo cubra.

## Hallazgo A-05 — selectIsAdmin es solo `is_staff`, no `is_admin`

**Evidencia:**

```
// src/redux/selectors/index.js  linea 12
export const selectIsAdmin = (state) => state.auth.user?.is_staff ?? false;
```

El selector que usa `AdminRoute` para decidir si dejar pasar al usuario
se llama `selectIsAdmin` pero evalua `is_staff`, no `is_admin`. Esto
significa que un usuario `Staff` (`is_staff: true`) tiene acceso al
panel de administracion completo, identico al de un Admin
(`is_admin: true`). Si el proyecto requiere que Staff tenga acceso
restringido al panel, el guard actual no lo implementa.

Esta es una decision de diseno que debe ser explicita, no implicita.

## Resumen de hallazgos

| ID | Zona | Descripcion | Severidad |
|----|------|-------------|-----------|
| A-01 | `domain.ts` | Campo `is_admin` ausente en el tipo `User` | Media |
| A-02 | `auth.ts` (MSW) | Tercera credencial Staff ausente en demo | Baja |
| A-03 | `ProtectedRoute/` | Cero tests para los dos guards de ruta | Alta |
| A-04 | `LoginPage.test.jsx` | Redirect post-login sin cobertura de tests | Media |
| A-05 | `selectors/index.js` | `selectIsAdmin` evalua `is_staff`, no `is_admin` | Media |
