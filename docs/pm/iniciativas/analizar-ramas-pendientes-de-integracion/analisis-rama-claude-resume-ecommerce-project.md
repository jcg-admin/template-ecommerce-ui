# Analisis de rama: claude/resume-ecommerce-project-Dm3ab

| Campo | Valor |
|-------|-------|
| Rama remota | `origin/claude/resume-ecommerce-project-Dm3ab` |
| Estado | **PENDIENTE DE INTEGRAR** |
| Commits propios | 7 |
| Base de merge con `develop` | `8d04a61` (PR #2) |
| Commits ahead de develop | 7 |
| Commits behind de develop | 36 |
| Archivos tocados | 15 |
| Lineas | +1138 / -25 |
| Conflicto previsto al merge | Si — `package.json` |

## Por que es la rama mas importante de documentar

Es la **unica rama de feature realmente pendiente**. Las otras tres
ramas de feature ya estan integradas. Sus siete commits introducen
una mezcla deliberada de:

- Un caso de uso nuevo (UC-AUTH-16 Dar de baja).
- Un listener critico de seguridad (`UnauthorizedListener`).
- Un guardrail nuevo (`check-no-lazy-imports.mjs` + pre-commit hook).
- Infraestructura de desarrollo (provisioner de Node, fix de webpack).

Tener esto en `develop` mejora el sistema en cuatro dimensiones a la
vez. Mantenerlo fuera es mantener una sesion abierta del comprador
incluso despues de que su JWT expira.

## Inventario de commits

Listados del mas reciente al mas antiguo. Cada uno con su numstat.

### Commit `09fa1bd` — Extend check-no-lazy-imports scope + add npm script

Fecha: 2026-05-20T18:30:58Z

```
2  1  package.json
15 3  scripts/check-no-lazy-imports.mjs
```

Anade el script `check:lazy` a `package.json` y extiende el alcance
del checker para cubrir mas patrones (`FU-LAZY-UI-1/3` segun el
mensaje). El cambio en `package.json` es la primera linea de
conflicto al integrar (sustituye/anade a una linea que `develop`
modifico para otro proposito).

### Commit `46acc7d` — Eliminate lazy imports in src/ + add JS check + hook

Fecha: 2026-05-20T17:10:49Z

```
55  0   .githooks/pre-commit
2   1   package.json
218 0   scripts/check-no-lazy-imports.mjs
29  0   scripts/install-hooks.sh
4   8   src/pages/catalog/ProductPage.test.jsx
```

Commit central de la rama. Introduce:

- **`scripts/check-no-lazy-imports.mjs`** (218 lineas). Detecta dos
  patrones prohibidos:
  - `require('...')` dentro de funciones, metodos o callbacks.
  - `import('...')` dinamico fuera del patron canonico de
    `const X = lazy(() => import('./Y'));`.
  Exit codes: `0` limpio, `1` violaciones, `2` error de parseo.
  Usa `@babel/parser` (devDependency ya presente).
- **`.githooks/pre-commit`** (55 lineas). Hook bash que invoca el
  checker con la lista de archivos staged `.js/.jsx/.ts/.tsx`.
- **`scripts/install-hooks.sh`** (29 lineas). Configura
  `core.hooksPath = .githooks` en el clone local.
- Cambios en `src/pages/catalog/ProductPage.test.jsx` para alinear el
  test con el codigo donde se elimino algun lazy import.

### Commit `7129b8d` — Close FU-3: listen to app:unauthorized and redirect

Fecha: 2026-05-20T16:21:54Z

```
60 0  src/app/UnauthorizedListener.jsx
5  0  src/router/AppRouter.jsx
```

Crea el componente `UnauthorizedListener` (60 lineas) que escucha el
evento global `app:unauthorized` y, cuando lo recibe:

1. Limpia el estado de auth en Redux (`isAuthenticated: false`,
   `user: null`) sin llamar a `/logout/` (el JWT ya esta invalido;
   llamar al backend solo agregaria otro 401).
2. Redirige a `/auth/login` dejando `state.from` con la ubicacion
   actual para que `LoginPage` pueda re-redirigir tras login exitoso.

Tiene una whitelist de rutas publicas (`/auth/*`, `/`) para evitar
loops `/auth/login -> /auth/login`. El componente se monta en
`AppRouter.jsx` arriba de las rutas.

### Commit `ea161f5` — Add 'Dar de baja' row to AccountLayout test it.each

Fecha: 2026-05-20T16:10:00Z

```
1 0  src/layouts/AccountLayout.test.jsx
```

Agrega una fila al test parametrizado del sidebar de cuenta para
cubrir el nuevo enlace de "Dar de baja". Cambio minimo.

### Commit `c244ef9` — Add Dar de baja flow (UC-AUTH-16)

Fecha: 2026-05-20T15:53:17Z

```
4   0  src/layouts/AccountLayout.jsx
135 0  src/pages/account/DeactivateAccountPage.jsx
133 0  src/pages/account/DeactivateAccountPage.module.scss
39  0  src/redux/slices/authSlice.js
3   0  src/router/AppRouter.jsx
```

Implementa el **UC-AUTH-16: Dar de Baja la Propia Cuenta**. Flujo:

1. Muestra advertencia explicita: baja logica + posibilidad de
   reactivar via UC-AUTH-01 Alt-A.2 (re-registro).
2. Pide password actual y confirmacion explicita (checkbox).
3. `POST /api/v1/auth/me/deactivate/` via thunk nuevo
   `authSlice.deactivateAccount`.
4. En exito: limpia estado de auth, redirige al home, muestra toast.
5. En error de password: muestra error inline sin limpiar el campo.

Toca:

- `src/pages/account/DeactivateAccountPage.jsx` (135 lineas).
- `src/pages/account/DeactivateAccountPage.module.scss` (133 lineas).
- `src/redux/slices/authSlice.js` (+39 lineas): thunk `deactivateAccount`.
- `src/layouts/AccountLayout.jsx` (+4 lineas): enlace en sidebar.
- `src/router/AppRouter.jsx` (+3 lineas): ruta `/account/deactivate`.

### Commit `c9c3465` — Resolve .env files inside webpack mode callback

Fecha: 2026-05-20T14:46:20Z

```
20 15  webpack.config.js
```

Bug fix de configuracion. La causa raiz: la lectura de `.env*` files
y la construccion del objeto inyectable estaban en el **modulo
principal** del config, no dentro del callback `(env, argv) => { ... }`
que webpack invoca al determinar el modo. Resultado: cuando webpack
arrancaba con `--mode production`, los valores ya estaban capturados
con `NODE_ENV=undefined`, asi que se leia `.env.undefined` (no
existe) en lugar de `.env.production`.

La correccion mueve `resolvedEnv` y `buildDefinedEnv` **dentro** del
callback, ejecutandose una vez que `argv.mode` ya esta definido.

Tambien anade prioridad explicita en la resolucion de `API_URL`:

```
shell env > .env.{NODE_ENV} > fallback 'http://localhost:8000'
```

con un comentario explicando por que: `API_URL` en `.env.production`
era ignorado porque `process.env.API_URL` (vacio en CI/servidor) caia
directo al fallback.

### Commit `04e526b` — Add Node.js provisioner for develop account on WSL2

Fecha: 2026-05-20T06:45:59Z

```
4   0  package.json
242 0  scripts/install.sh
170 0  tests/test_provisioner_setup.sh
```

Anade el **provisioner de Node** (`scripts/install.sh`, 242 lineas) y
sus tests (`tests/test_provisioner_setup.sh`, 170 lineas). Documenta
explicitamente el modelo de usuarios en WSL2:

- **Invocador canonico**: `deploy` (cuenta con sudo general).
- **No corre como `develop`**: `develop` no tiene sudo; `apt-get` y
  `curl | bash` fallarian.
- **No corre como `infra`**: `bash` no esta en su whitelist NOPASSWD.

Y la razon de usar NodeSource apt en vez de nvm: nvm instala bajo
`$HOME/.nvm/`, lo cual no es accesible cross-user. NodeSource via apt
instala en `/usr/bin/` world-readable.

Tambien anade al `package.json` la seccion `engines`:

```
"engines": {
  "node": ">=20.0.0",
  "npm": ">=10.0.0"
}
```

## Conflicto previsto al hacer merge

El conflicto es **mecanico y limitado** a `package.json`. Reproducido
con `git merge-tree`:

```
<<<<<<< develop
    "prepare": "husky"
=======
    "check:lazy": "node scripts/check-no-lazy-imports.mjs"
>>>>>>> claude/resume-ecommerce-project-Dm3ab
```

La rama anade el script `check:lazy` en la posicion donde `develop`
tiene `prepare`. La resolucion correcta es conservar ambos.
Adicionalmente, la rama anade `@babel/parser` a `devDependencies` y
agrega la seccion `engines` al final del archivo.

Estimacion del esfuerzo de resolucion: **dos minutos**. Editar
`package.json`, mantener ambos scripts en orden alfabetico, conservar
las adiciones de `engines` y `@babel/parser`, ejecutar `npm install`
para regenerar el lock.

## Que aporta esta rama a develop

| Beneficio | Magnitud |
|-----------|----------|
| Cierra UC-AUTH-16 (Dar de baja) | 1 caso de uso completo + thunk + ruta + sidebar + tests |
| Resuelve sesiones zombi tras 401 | Listener critico de seguridad UX que antes no existia |
| Endurece el sistema contra lazy imports prohibidos | Guard nuevo activo en pre-commit |
| Corrige bug silencioso de webpack/env | Resoluciones de `API_URL` con `.env.production` ahora funcionan |
| Aprovisiona Node 22 LTS de forma reproducible para WSL2 | Onboarding nuevo desarrollador con un solo comando con sudo |

## Diagrama de secuencia: comportamiento del listener `app:unauthorized`

Este es el flujo que la rama habilita y que justifica integrarla.

```mermaid
sequenceDiagram
    autonumber
    participant User as Comprador
    participant Tab as Pestana abierta
    participant Hook as useReturns (ejemplo)
    participant API as apiService
    participant Backend as Backend Django
    participant L as UnauthorizedListener
    participant Router as React Router

    Note over User,Tab: Usuario dejo la pestana abierta;<br/>su JWT (cookie) ya expiro
    User->>Tab: click en "Mis devoluciones"
    Tab->>Hook: fetchReturns()
    Hook->>API: GET /api/v1/returns/
    API->>Backend: fetch + cookie expirada
    Backend-->>API: 401 Unauthorized
    API->>API: dispatchEvent(<br/>new CustomEvent('app:unauthorized'))
    API-->>Hook: throw UnauthorizedError
    L->>L: window.addEventListener escucha
    L->>L: dispatch(clearError())
    L->>L: location actual = '/account/returns'
    L->>Router: navigate('/auth/login',<br/>{state:{from:'/account/returns'}})
    Router->>User: muestra LoginPage
    Note over User: Usuario hace login<br/>(otra pestana o aqui mismo)
    Router->>User: redirige de vuelta<br/>a '/account/returns'
```

Antes de esta rama: el paso 8 (`dispatchEvent`) no existia y los
pasos 11-14 tampoco. La pestana abandonada quedaba en una pantalla
"logueada" mostrando un estado obsoleto y cada interaccion fallaba
con un toast generico.

## Decision recomendada (no obligatoria)

Integrar la rama cuando el equipo este disponible para resolver el
conflicto trivial y validar el listener manualmente. Los siete
commits son cohesivos, todos aportan valor, y ninguno introduce
deuda nueva.

La decision exacta queda fuera del alcance de esta iniciativa.
