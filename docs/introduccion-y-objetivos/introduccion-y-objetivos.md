# Introduccion y objetivos

## Que es ecommerce-ui

ecommerce-ui es el **frontend del e-commerce de productos del catálogo**.
Es una SPA construida con React 19 que consume la API REST de Django
(`e-comerce-api`). El proyecto vive en este repositorio como
codigo independiente y se compone con su backend a nivel de despliegue.

## Vista de stakeholders

| Stakeholder | Que espera del UI |
|-------------|-------------------|
| Comprador (autenticado y guest) | Navegar catalogo, gestionar carrito, hacer checkout, ver ordenes, devoluciones y tickets de soporte. |
| Administrador (rol admin) | Gestionar usuarios, catalogo, ordenes, devoluciones, vouchers, configuracion, auditoria y backups desde `/admin/*`. |
| Equipo de desarrollo | Construir, testear y desplegar el bundle de forma reproducible; agregar UCs sin romper el sistema. |
| Backend (`e-comerce-api`) | Recibir peticiones bien tipadas, con cookies httpOnly de auth, y errores manejados por el UI sin reintentos abusivos. |

## Objetivos esenciales

1. **Cubrir los casos de uso publicados.** A la fecha, el repositorio
   tiene en `develop` 86 UCs distintos implementados en 82 paginas
   distribuidas entre storefront (`/`), cuenta (`/account/*`) y admin
   (`/admin/*`).
2. **Mantener separacion estricta UI - API.** El UI nunca conoce la
   estructura interna de tablas del backend; consume endpoints REST y
   modela el estado con slices Redux + cache React Query.
3. **Permitir desarrollo sin backend.** Cada dominio (`auth`, `catalog`,
   `cart`, `payments`) tiene un flag `PY_<dominio>_SOURCE=mock|real`
   que enruta a un interceptor local. Sirve para iterar en UI sin
   esperar al backend.
4. **Construir reproducible.** El build de produccion se hace con
   `npm run build` y produce un `dist/` servido estaticamente por
   Apache desde `e-comerce-server`.
5. **No romper silenciosamente.** Husky pre-commit ejecuta
   `check-scss.mjs` y `check-no-lazy-imports.mjs` para bloquear dos
   clases de fallo conocidas antes de que entren al repo.

## Que no es este proyecto

- **No es un monorepo.** El backend, la base de datos y el servidor
  viven en repositorios separados. Solo se comparte la convencion de
  IDs de casos de uso (`UC-AUTH-01`, `UC-CART-04`, etc).
- **No tiene SSR.** Es client-side rendering puro con code splitting
  por ruta via `React.lazy`.
- **No persiste sesion en localStorage.** El JWT del backend se entrega
  como cookie httpOnly que el UI nunca lee.
