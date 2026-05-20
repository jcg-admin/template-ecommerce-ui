# Vista de despliegue

Este documento describe **donde corre el sistema en produccion** y
**como se produce el artefacto de despliegue**.

## Topologia de despliegue

```mermaid
flowchart LR
    Dev["Estacion de desarrollo<br/>(WSL2 / Linux)<br/>scripts/install.sh"]
    CI["Build host<br/>(npm run build)"]
    Apache["Apache HTTP Server<br/>(PracticaYoruba-server)"]
    UI["dist/<br/>(bundle estatico)"]
    Django["PracticaYoruba API<br/>(Django + gunicorn)"]
    DB[("MariaDB")]

    Dev -->|"genera"| CI
    CI -->|"npm run build<br/>dist/"| UI
    UI -->|"desplegado a"| Apache
    Apache -->|"sirve"| Cliente["Navegador del comprador"]
    Cliente -->|"REST + cookies"| Apache
    Apache -->|"reverse proxy<br/>/api/*"| Django
    Django --> DB
```

## Nodos de despliegue

### Nodo: estacion de desarrollo

Se aprovisiona con `scripts/install.sh` (introducido en la rama
pendiente `claude/resume-ecommerce-project-Dm3ab`).

| Aspecto | Detalle |
|---------|---------|
| Sistema operativo | Linux nativo o WSL2 (Ubuntu) |
| Node.js | 22 LTS via repositorio oficial de NodeSource (apt) |
| npm | >= 10 (incluido con Node 22) |
| Usuarios involucrados | `deploy` (invocador de sudo) ejecuta install; `develop` lo consume sin sudo |
| Localizacion del runtime | `/usr/bin/node`, `/usr/bin/npm` — accesibles cross-user |
| Por que NodeSource y no nvm | nvm instala bajo `$HOME/.nvm/`; en WSL2 con usuarios separados eso obliga a reinstalar por cada usuario. NodeSource via apt es global y world-readable. |

El script es **idempotente**: si la version objetivo ya esta
instalada, no hace nada. La cobertura del provisioner esta validada
por `tests/test_provisioner_setup.sh`.

### Nodo: build host

Cualquier maquina con Node 22 LTS puede producir el bundle:

| Comando | Resultado |
|---------|-----------|
| `npm install` | Instala dependencias en `node_modules/` |
| `npm run build` | Produce `dist/` con `mode=production` |
| `npm run build:analyze` | Igual mas reporte de bundle (`ANALYZE=true`) |
| `npm test` | Suite Jest completa |
| `npm run lint` | ESLint sobre `src/` |
| `npm run lint:style` | Stylelint sobre SCSS |
| `npm run lint:scss-compile` | `scripts/check-scss.mjs` verifica que el SCSS compila |
| `npm run check:lazy` | `scripts/check-no-lazy-imports.mjs` (rama pendiente) |

La configuracion sensible se inyecta en build time via `DefinePlugin`:

| Variable | Origen | Inyectada como |
|----------|--------|----------------|
| `API_URL` | shell env > `.env.production` > fallback `http://localhost:8000` | `process.env.API_URL` (string literal) |
| `APP_VERSION` | `package.json#version` | `process.env.APP_VERSION` |
| `PY_*_SOURCE` | `.env*` files o defaults | `process.env.PY_*_SOURCE` |
| `NODE_ENV` | argumento `--mode` | `process.env.NODE_ENV` |

> Hallazgo de la rama pendiente: el commit `c9c3465` mueve la
> resolucion de `.env` files **dentro** del callback de webpack para
> que `API_URL` de `.env.production` se respete cuando el shell no la
> exporta. Antes, la resolucion ocurria al cargar el modulo y se
> cacheaba con un valor incorrecto.

### Nodo: servidor de produccion

El bundle `dist/` se sirve estatico desde Apache, en un nodo separado
provisionado por `PracticaYoruba-server` (Ubuntu + Apache + acme.sh +
fail2ban). Detalles relevantes para el UI:

| Aspecto | Detalle |
|---------|---------|
| Servidor web | Apache 2 |
| HTTPS | Certificado emitido y renovado por `acme.sh` |
| `/api/*` | Reverse proxy hacia Django (gunicorn) en el mismo host |
| Cookies | Politicas `Secure`, `HttpOnly`, `SameSite=Strict` aplicadas por Django; el UI las consume tal cual |
| Headers de seguridad | CSP, HSTS, X-Frame-Options, Referrer-Policy — emitidos por Apache segun `src/config/security.js` |
| Fail2ban | Bloquea brute force sobre `/api/v1/auth/login/` por ventana movil |
| Logs | Apache `access.log` + `error.log` |

El UI **no requiere Node en produccion**. El servidor solo sirve
estaticos para `/` y `/static/*`, y proxy-pasa `/api/*` a Django.

## Configuracion por entorno

| Entorno | Comando | Variables de entorno |
|---------|---------|----------------------|
| Desarrollo local | `npm run dev` (webpack-dev-server, puerto 3001) | `.env.local` (gitignored) + `.env.example` como plantilla. `PY_*_SOURCE=mock` por defecto. |
| Build de produccion | `npm run build` con `NODE_ENV=production` | `.env.production` (gitignored) + `.env.production.example` como plantilla. `API_URL` apunta al dominio real. |
| Staging | Mismo build que produccion pero con `API_URL` apuntando al backend de staging | Plantilla propia (no en repo). |

## Artefactos producidos por el build

| Artefacto | Localizacion | Naturaleza |
|-----------|--------------|------------|
| Bundle JS principal | `dist/main.<contenthash>.js` | Codigo de la app |
| Chunks por ruta | `dist/<page>.<contenthash>.chunk.js` | Cada lazy import produce un chunk |
| CSS extraido | `dist/main.<contenthash>.css` | Generado por `mini-css-extract-plugin` |
| HTML de entrada | `dist/index.html` | Generado por `html-webpack-plugin` con referencias a los hashes actuales |
| Cache de webpack | `.webpack_cache/` | No se despliega; acelera rebuilds locales |
| Reporte de bundle | `dist/bundle-report.html` | Solo con `build:analyze` |

## Pipeline de despliegue (estado actual)

```mermaid
sequenceDiagram
    participant Dev as Desarrollador
    participant Repo as Repositorio Git
    participant Build as Build host
    participant Apache as Servidor Apache
    participant Cliente as Navegador

    Dev->>Repo: git push (rama feature)
    Dev->>Repo: PR -> develop
    Note over Repo: husky pre-commit:<br/>check-scss, check-lazy<br/>(local del dev)
    Repo->>Repo: merge a develop
    Note over Repo: develop != main:<br/>149 commits pendientes<br/>de promover (release candidate)
    Repo->>Build: clone develop
    Build->>Build: npm install
    Build->>Build: npm run build<br/>(con .env.production)
    Build->>Apache: scp dist/ al servidor
    Apache->>Cliente: GET / -> index.html + bundle
    Cliente->>Apache: GET /api/v1/* (cookies)
    Apache->>Django: reverse proxy
```

Este pipeline es **manual**. No hay CI/CD configurado en el repo. Esto
esta listado en `riesgos-y-deuda-tecnica/`.
