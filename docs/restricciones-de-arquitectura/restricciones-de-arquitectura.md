# Restricciones de arquitectura

Las restricciones aqui listadas son **observables en el codigo**:
estan declaradas en `package.json`, en el procedimiento PROC-GESTION-001
de gestion, o en otros artefactos del repo. No son aspiraciones.

## Restricciones tecnicas

| Restriccion | Origen | Donde se observa |
|-------------|--------|------------------|
| React 19 + JSX (sin TypeScript en src) | Decision del proyecto | `package.json` dependencias `react@^19`, archivos `.jsx` en `src/` |
| Redux Toolkit 2 como unico store global | Decision del proyecto | `src/redux/store.js` configura `configureStore` con 31 slices |
| React Query 5 para reads remotos | Convencion canonica | Hooks `useAdminProducts`, `useReturns`, etc. usan `useQuery` |
| React Router 6 con `BrowserRouter` | `src/router/AppRouter.jsx` | Lazy import por ruta con `React.lazy` |
| SCSS Modules + sistema de tokens Yoruba | Pipeline SCSS | `src/styles/abstracts/` + 125 `.module.scss` |
| Webpack 5 como bundler unico | `webpack.config.js` | Code splitting por ruta, contenthash, tree shaking |
| Jest 29 + React Testing Library 16 | `jest.config.cjs` | 123 archivos `*.test.*` |
| Node.js >= 20 y npm >= 10 para construir | `package.json#engines` (declarado en la rama pendiente) | `scripts/install.sh` instala Node 22 LTS |
| Solo `lazy(() => import())` para code splitting | Regla `check-no-lazy-imports.mjs` | Bloquea `require()` y `import()` dinamicos fuera del patron canonico |
| Cero `#hex` literales fuera de allowlist en SCSS | Regla `stylelint` color-no-hex | `check-scss.mjs` + `.stylelintrc.json` |
| JWT solo en cookies httpOnly | Decision de seguridad | `apiService.js` usa `credentials: 'include'`; ningun slice lee tokens |
| URL de API resuelta en build time | `webpack.config.js` `DefinePlugin` | `process.env.API_URL` se inyecta como string al bundle |

## Restricciones organizativas

| Restriccion | Origen |
|-------------|--------|
| Identificadores de caso de uso compartidos con backend | Convencion `UC-<dominio>-<numero>` mantenida en mensajes de commit |
| Procedimiento PROC-GESTION-001 para iniciativas | Documento normativo interno; este repositorio aplica el submodulo `ui` |
| Husky pre-commit obligatorio en clones de desarrollo | `package.json` script `prepare: husky`; ver `pm/` para hooks adicionales (pre-push) |
| Mensajes de commit en formato `tipo(scope): descripcion` | Observable en `git log` de develop |

## Convenciones del codigo

- **Alias de import canonicos** (definidos en `webpack.config.js` y
  `jsconfig.json`): `@app`, `@components`, `@constants`, `@context`,
  `@hooks`, `@layouts`, `@lib`, `@mocks`, `@pages`, `@redux`, `@router`,
  `@services`, `@styles`, `@utils`. Codigo de produccion **no** debe
  importar con rutas relativas profundas.
- **Slices Redux** terminan en `Slice.js` y exportan reducer por
  defecto + thunks/actions nombrados.
- **Hooks de dominio** viven en `src/hooks/domain/` y empiezan por `use`.
- **Paginas** terminan en `Page.jsx` y solo son cargadas via
  `React.lazy` desde `AppRouter.jsx`.
- **Tests** estan adjacent al archivo bajo test (`*.test.jsx`,
  `*.test.js`).

## Restricciones de despliegue

| Restriccion | Detalle |
|-------------|---------|
| Bundle servido estatico, sin Node en runtime | `dist/` se sirve via Apache desde `PracticaYoruba-server` |
| `API_URL` fija en el bundle | No es runtime-configurable; cambiarla requiere rebuild |
| Cookies SameSite=Strict, Secure, HttpOnly | `src/config/security.js` declara la politica esperada |
| CSP estricto (default-src 'self') | `src/config/security.js` define el header esperado del servidor |
