# ecommerce-ui UI

Frontend del e-commerce de productos del e-commerce. Construido con React 19 + Redux Toolkit + Webpack 5.

## Stack

| Capa | Tecnología |
|------|------------|
| UI | React 19 + JSX |
| Estado global | Redux Toolkit 2 + React Query 5 |
| Routing | React Router 6 |
| Estilos | SCSS Modules + sistema de design tokens |
| Tests | Jest 29 + React Testing Library 16 |
| Build | Webpack 5 (code splitting, contenthash, tree shaking) |

## Estructura

```
src/
├── app/              Componente raíz y providers
├── components/       Componentes UI reutilizables
│   ├── common/       Button, Card, Form, Toast, Badge, Skeleton...
│   ├── layout/       Header, Footer, Sidebar
│   └── shared/       ProtectedRoute, ErrorBoundary, LazyLoad
├── constants/        Constantes del dominio (estados, rutas, moneda)
├── context/          ToastContext
├── hooks/            Hooks de dominio (useAuth, useCart)
├── layouts/          StorefrontLayout, AccountLayout, AdminLayout
├── lib/              queryClient (React Query)
├── mocks/            Handlers MSW + factories Faker (ver "Feature flags")
├── pages/            Páginas por ruta (lazy-loaded)
├── redux/
│   ├── slices/       auth, ui, catalog, cart, checkout, orders, wishlist
│   └── selectors/    Selectores memoizados (reselect)
├── router/           AppRouter con rutas públicas, protegidas y admin
├── services/         apiService (fetch con retry y timeout)
├── styles/
│   ├── abstracts/    _variables.scss, _mixins.scss (paleta principal)
│   ├── base/         _reset.scss, _typography.scss
│   ├── components/   _buttons.scss, _cards.scss, _forms.scss...
│   ├── layouts/      _header.scss, _sidebar.scss
│   └── utils/        _utilities.scss
└── utils/            formatters.js (precios, fechas, SKU)
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
# Editar API_URL=http://localhost:8000

# Iniciar servidor de desarrollo (puerto 3001)
npm run dev

# Tests
npm test
npm run test:coverage

# Build de producción
npm run build
npm run build:analyze   # con reporte de bundle
```

## Feature flags

Cada dominio del backend puede consumirse en modo `mock` (handlers
[MSW](https://mswjs.io/) interceptan a nivel de red, no requiere
backend) o `real` (la request sale al backend definido por `API_URL`).
Edita `.env.local`:

```
CATALOG_SOURCE=mock
AUTH_SOURCE=mock
CART_SOURCE=mock
PAYMENTS_SOURCE=mock
PROFILE_SOURCE=mock
```

Default: todo en `mock`. Detalles del flujo de adopcion en
`docs/como-adaptar-este-template.md`.

## Paleta de colores del template

| Token | Valor | Uso |
|-------|-------|-----|
| `$primary-color` | `#B8860B` | CTA, botones, highlights |
| `$secondary-color` | `#3D1F0D` | Headers, texto oscuro |
| `$accent-color` | `#CC4A1B` | Badges, urgencia, descuentos |
| `$bg-page` | `#FAFAF7` | Fondo de página |

## Documentación

La documentación del template está organizada en tres planos:
arquitectura (arc42 adaptado), project management (`pm/`) y guías
operativas (pipeline SCSS, adopción).

### Punto de entrada para adoptantes

| Documento | Cuándo leerlo |
|-----------|---------------|
| [docs/como-adaptar-este-template.md](docs/como-adaptar-este-template.md) | **Primero al hacer fork.** Qué cambiar al adoptar, extensiones que el template está preparado para acomodar (B2B, marketplace, suscripciones, etc.), qué dejar como está, qué el template no resuelve, checklist de verificación. |

### Arquitectura

| Documento | Tema |
|-----------|------|
| [docs/README.md](docs/README.md) | Índice arc42 completo (introducción, restricciones, contexto, estrategia, vistas, conceptos, decisiones, riesgos, glosario). |
| [docs/decisiones-de-arquitectura/](docs/decisiones-de-arquitectura/) | Registro de decisiones técnicas (ADR) con su justificación. |
| [docs/riesgos-y-deuda-tecnica/](docs/riesgos-y-deuda-tecnica/) | Inventario vivo de riesgos y deuda con estado y mitigación. |

### Project management

| Documento | Tema |
|-----------|------|
| [docs/pm/](docs/pm/) | Iniciativas con alcance, análisis, tareas atómicas, progreso y decisiones según PROC-GESTION-001. |
| [docs/pm/iniciativas/](docs/pm/iniciativas/) | Índice de iniciativas registradas y previstas. |

### Pipeline de estilos

| Documento | Tema |
|-----------|------|
| [docs/scss-pipeline.md](docs/scss-pipeline.md) | Arquitectura de estilos, stylelint, sass-check y pre-push hook. |
| [docs/scss-audit.md](docs/scss-audit.md) | Auditoría de uso real de SCSS: tokens, duplicación, imports. |
| [docs/scss-remediation-plan.md](docs/scss-remediation-plan.md) | Plan de remediación SCSS por fases y tareas atómicas. |

## Relación con el backend

Este proyecto consume la API REST de `ecommerce-api` (Django 5 + DRF).
Ver la documentación completa de UCs y endpoints en `ecommerce-doc`.

Los tokens JWT los maneja el backend en **httpOnly cookies** — nunca
se almacenan en Redux ni en localStorage.

## Servidor de despliegue

El bundle producido por `npm run build` (en `dist/`) se sirve en
producción mediante el repo hermano
[`template-ecomerce-ui-server`](https://github.com/jcg-admin/template-ecomerce-ui-server)
— un servidor Nginx + SSL (Let's Encrypt) + hardening (UFW + fail2ban
+ SSH) aprovisionado con scripts bash idempotentes sobre Ubuntu 24.04.

| Aspecto del UI | Cómo lo consume el server |
|----------------|----------------------------|
| `dist/index.html` | Servido como SPA catch-all (`try_files $uri $uri/ /index.html`) |
| `dist/*.[contenthash].chunk.js` | Cache de larga duración (1 año) gracias al hash en el nombre |
| `dist/*.[contenthash].css` | Idem |
| Webpack `publicPath: '/'` | Compatible con Nginx serviendo desde root |
| Asume backend en `/api/*` | El server lo proxy-pasa a `$API_UPSTREAM` definido en `.env` del server |

Variable clave en el `.env` del server: `UI_DIST` apunta al `dist/`
producido en este repo. Despliegue habitual:

```bash
npm install && npm run build
rsync -avz --delete dist/ deploy@servidor:/srv/repos/ecom/template-ecommerce-ui/dist/
```

No es necesario reiniciar Nginx — sirve los archivos en tiempo real
y el cache busting de Webpack (`contenthash`) hace que los navegadores
descarguen los chunks nuevos automáticamente.

Para detalles operativos completos del servidor (provisionar, mantener,
recuperar), ver
[`docs/operaciones.md` del repo server](https://github.com/jcg-admin/template-ecomerce-ui-server/blob/main/docs/operaciones.md).
