# Analisis y propuesta de servidor para `template-ecommerce-ui`

| Campo | Valor |
|-------|-------|
| Documento | Analisis del repo de referencia `jcg-admin/e-comerce-server` y propuesta de servidor para el template |
| Fecha | 2026-05-21 |
| Estado | Exploratorio. **No es iniciativa formal todavia**. Documento producido para decidir si abrir iniciativa de creacion. |
| Repo de referencia | `/tmp/references/e-comerce-server/` (clonado, 572 KB, 22 archivos) |
| Origen interno del referente | "PracticaYoruba-server" (nombre original en su README, fork/renombrado a `e-comerce-server`) |
| Petición del usuario | "vamos a inspirarnos en proyecto mio. Interpretación B — Replicar la arquitectura completa. NOSOTROS NO VEMOS BACKEND. Adaptar la arquitectura de 3 partes (server + api + ui). Modelo de cuentas, almacenamiento, SSL, fail2ban, etc. SI" |

## Resumen ejecutivo

El repo de referencia es un **proyecto de aprovisionamiento de
servidor Linux** (devops/infraestructura), no una aplicacion. Su
funcion: dejar un Ubuntu listo para servir una arquitectura
**3-tier**: server (Apache) + api (Django) + ui (React).

Nuestro template `ecommerce-ui` es **solo el UI** (parte 3). La
propuesta es **crear un proyecto hermano** (`template-ecommerce-server`)
inspirado en el referente pero adaptado a:

- **No incluir API en su scope**: el server diseñamos NO asume
  que la API sea Django ni Node ni nada en particular. Define
  un **contrato de upstream** que la API debe cumplir cuando
  exista.
- **Misma arquitectura 3-tier**: server + (api) + ui. El (api)
  queda como **placeholder configurable** — el server sabe que
  hay que reverse-proxy-ar hacia algo, pero no implementa ese
  algo.
- **Mismo modelo de cuentas, almacenamiento, SSL, fail2ban**:
  estos son agnostic al backend y aplicables tal cual.

Decision arquitectonica grande propuesta: **Nginx en lugar de
Apache + mod_wsgi**. Justificacion en seccion "Apache vs Nginx".

## Anatomia del referente

### Estructura

```
e-comerce-server/                 22 archivos, 572 KB
├── README.md                     instalacion + arquitectura
├── .env.example                  ~150 lineas, variables del setup
├── backups/                      placeholder bind-mount svc-backups
├── config/
│   └── apache/
│       ├── practicayoruba-http.conf      vhost :80 redirect HTTPS + ACME
│       └── practicayoruba-https.conf     vhost :443 SSL + WSGI + UI assets
├── provisioners/                 ejecutados con sudo, idempotentes
│   ├── apache/
│   │   ├── install.sh             (301 líneas) apt apache2 + mod_wsgi
│   │   └── setup_vhost.sh         (319 líneas) reemplaza %%VAR%% en confs
│   ├── firewall/
│   │   └── setup_firewall.sh      (215 líneas) UFW: 80, 443, SSH_PORT
│   ├── security/
│   │   ├── setup_fail2ban.sh      (356 líneas) jails sshd + apache-auth
│   │   └── setup_ssh_hardening.sh (417 líneas) sin password, sin root
│   └── ssl/
│       └── setup_ssl.sh           (510 líneas) acme.sh + self-signed fallback
├── scripts/
│   ├── renew_ssl.sh               (186 líneas) cron renueva certificados
│   └── verify.sh                  (599 líneas) 13 checks de salud
├── tests/                        5 archivos de tests bash
└── utils/                        helpers reusables
    ├── core.sh                    log + sudo + exit codes (226 líneas)
    ├── logging.sh                 (115 líneas)
    ├── network.sh                 (51 líneas)
    └── validation.sh              (245 líneas)
```

### Arquitectura 3-tier del referente

```
                Internet
                    |
                    |  HTTPS :443 (Let's Encrypt acme.sh)
                    v
            +-------------------+
            |   Apache 2.4      |  ← este repo lo provisiona
            |   + mod_wsgi      |
            +-------------------+
              |       |       |
   /static    |       | /     | /api, /admin (Django enruta)
   /media     |       |       |
   /(assets)  |       |       |
      |      WSGI daemon       |
      v       v                v
   filesystem  Django App      Django catch-all -> serve_spa -> UI_DIST/index.html
   directo    (ecommerce-api)
              .venv + wsgi.py
```

**Punto clave**: Django sirve el `index.html` del UI mediante una
vista `serve_spa` con `re_path` catch-all (lineas 32-48 del
vhost HTTPS). **Apache NO conoce React Router**; siempre
delega a Django para rutas sin extension. **Apache SI sirve los
assets del bundle** (`AliasMatch` por extension de archivo).

Esto crea un **acoplamiento entre Apache + Django** que NO
queremos heredar (porque nuestro server NO ve backend).

### Modelo de cuentas (5 cuentas, separación de privilegios)

| Cuenta | UID | Función | Sudo |
|--------|-----|---------|------|
| `deploy` | 1000 | Operador admin, ejecuta provisioners | Si |
| `infra` | 1001 | Provisionador, sudo granular NOPASSWD por binario | Si granular |
| `develop` | 1002 | Owner del codigo en `/srv/repos/ecom/<repo>` | NO |
| `svc-backups` | 999 | Genera/gestiona backups del proyecto | NO + nologin |
| `svc-dbdata` | 997 | Custodia dumps de BD | NO + nologin |

Los repos son `develop:develop` con perms 755/644, asi "other"
(= `www-data` que es el usuario WSGI) puede leer. La key SSL
queda `0600 root:root` y Apache master (root) la lee antes de
drop-privileges a `www-data`.

### Tres clases de almacenamiento

| Clase | Path | Owner | Contenido |
|-------|------|-------|-----------|
| A | `/srv/repos/ecom/<repo>` | `develop:develop` 755/644 | Código de los submódulos |
| B | `/srv/backups/project` | `svc-backups:svc-backups` 755 | Backups del proyecto |
| C | `/srv/backups/database` | `svc-dbdata:svc-dbdata` 755 | Dumps de BD |

**Procedimiento externo**:
`Procedimiento-Implementacion-Almacenamiento-WSL2-ecomerce-p001 v1.0.0`.
WSL2 simula produccion VPS Ubuntu.

### Seguridad

- **SSL**: Let's Encrypt via `acme.sh` (no certbot). Fallback
  self-signed para desarrollo (DOMAIN=localhost).
- **fail2ban**: 2 jails — sshd (5 intentos en 600s → ban 3600s),
  apache-auth (10 intentos en 600s → ban 1800s).
- **SSH**: puerto no estándar (2222), sin password, sin root.
- **UFW**: deny incoming, allow outgoing, abre solo SSH_PORT +
  80 + 443.
- **TLS**: solo TLS 1.2+, ciphers ECDHE/CHACHA20.
- **Headers HTTP**: HSTS (1 año + preload), X-Frame-Options
  DENY, X-Content-Type-Options nosniff, Referrer-Policy
  strict-origin-when-cross-origin, X-XSS-Protection.

### Operacion continua

- `scripts/verify.sh` — **13 checks de salud** (presumiblemente:
  Apache running, certs validos, fail2ban activo, espacio disco,
  perms, etc).
- `scripts/renew_ssl.sh` — cron quincenal renueva certs.
- 5 tests bash (provisioner syntax, install idempotency, ssl
  self-signed, apache+ssl integration, systemd detection
  WSL2-vs-VPS).

## Decisión arquitectónica: Apache vs Nginx

El referente usa **Apache + mod_wsgi**. Para nuestro caso
**(server + UI únicamente, sin backend WSGI propio)**, evalúo:

### Tabla comparativa

| Aspecto | Apache 2.4 + mod_wsgi | Nginx |
|---------|----------------------|-------|
| Servir static files | Bueno | **Mejor** (event-driven, menor footprint) |
| Reverse proxy a backend HTTP | Bueno (mod_proxy) | **Diseño nativo** (`proxy_pass`) |
| Embeber Python WSGI directo | **Único punto fuerte** (mod_wsgi) | Necesita gunicorn/uWSGI separado |
| Caché de assets | mod_cache | **Mejor** (cache nativo + sendfile) |
| Configuración SPA catch-all | Complicado (necesita `serve_spa` en Django) | **Trivial** (`try_files $uri /index.html`) |
| Footprint de memoria | ~25 MB por worker | ~10 MB por worker |
| Connections concurrentes | ~150 (pre-fork) | **10000+** (event-driven) |
| Curva de aprendizaje | Familiar | Familiar (más reciente, más docs SPA) |
| HTTP/2 | Si (mod_http2) | **Si nativo, mejor performance** |
| Documentación de referente | **Si (tenemos ejemplo Apache funcional)** | Tendríamos que escribir desde cero |

### Análisis al caso concreto

**El referente usa Apache porque Django requiere mod_wsgi
fácilmente embebible**. Sin Django, la razón se vacía.

**Para un server que sólo sirve UI + reverse-proxy-a-api**:

| Razón | Decisión |
|-------|----------|
| **Catch-all del SPA** | Nginx lo hace en 1 línea (`try_files $uri $uri/ /index.html`). Apache requiere acoplamiento con backend (caso del referente). **Nginx gana fuerte aquí.** |
| **Reverse proxy a /api** | Nginx tiene `proxy_pass http://api-upstream/` nativo. Apache también puede (mod_proxy_http). Empate. |
| **No backend WSGI propio** | mod_wsgi pierde valor. Apache deja de tener su único diferenciador. |
| **Performance de static files** | Nginx serializa assets más rápido (especialmente con webpack chunks pequeños y muchos). **Nginx gana.** |
| **Familiaridad / docs del usuario** | El referente nos da ejemplo Apache. Migrar a Nginx significa reescribir la mayoría. **Apache gana en velocidad de adopción inicial.** |

### Recomendación: **Nginx**

Razones:

1. **Eliminamos el acoplamiento con Django** (`serve_spa` view).
   La SPA catch-all en Nginx es 1 línea y no requiere código del
   backend. Esto es **enorme** para un server que diseñamos
   sin asumir tecnología backend.

2. **Reverse proxy nativo** es la operación principal del server
   (todo lo que no sea asset estático va al upstream API). Nginx
   está diseñado exactamente para esto.

3. **Menor footprint** para hosting económico.

4. **Catch-all SPA portable**: si mañana cambias el backend
   (Django → Node → Go → lo que sea), Nginx no cambia. Apache
   con `serve_spa` te ata a Python.

5. **Lo que se pierde** (mod_wsgi) **no lo necesitamos**.

### Lo que conservamos del referente (agnostic a Apache/Nginx)

- **Estructura del proyecto**: `provisioners/`, `scripts/`,
  `tests/`, `utils/`, `config/`, `docs/`, `.env.example`.
- **Modelo de 5 cuentas** (deploy, infra, develop, svc-backups,
  svc-dbdata).
- **3 clases de almacenamiento** (A, B, C) — pero **simplificado
  a 2** (B y C son backups, podemos consolidar o conservar la
  separación según el caso).
- **SSL via acme.sh** + self-signed fallback.
- **fail2ban** con jails sshd + nginx-* (en vez de apache-auth).
- **SSH hardening**.
- **UFW**.
- **Headers HTTP de seguridad**.
- **verify.sh** con checks adaptados.
- **renew_ssl.sh** sin cambios estructurales.

## Arquitectura propuesta

### Diagrama 3-tier con server-only + ui

```
                Internet
                    |
                    |  HTTPS :443 (Let's Encrypt acme.sh)
                    v
            +-------------------+
            |     Nginx         |  ← template-ecommerce-server
            +-------------------+
                    |
            +-------+-------+
            |               |
      Static UI         Reverse proxy
      (filesystem)      /api/* → upstream
      /                 (contrato externo, no
      *.js, *.css       implementado por nosotros)
      *.png, *.svg
            ^               ^
            |               |
       ui/dist/         (la API es otro repo,
       (npm run build)   otra iniciativa, otro
                         equipo. NO en scope).
```

### Routing en Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL
    ssl_certificate     /etc/ssl/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/ssl/$DOMAIN/key.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    # Static UI bundle (output de `npm run build`)
    root $UI_DIST;
    index index.html;

    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # /api/* → reverse proxy a backend externo
    # API_UPSTREAM es configurable, sin acoplamiento a tecnología
    location /api/ {
        proxy_pass         $API_UPSTREAM;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # Static assets con cache largo (chunks con hash de webpack)
    location ~* \.(js|mjs|css|map|woff2?|svg|ico|png|jpe?g|gif|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA catch-all (React Router)
    # CUALQUIER ruta sin extension cae aqui y sirve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Lo crucial**: el bloque `location /api/` apunta a
`$API_UPSTREAM` que es **una variable de entorno**. La API puede
ser:

- `http://127.0.0.1:8000` (Django runserver, dev)
- `http://127.0.0.1:3000` (Node/Express, dev)
- `unix:/run/gunicorn.sock` (Django producción)
- `http://api.midominio.com` (microservicio externo)

El server **no decide**. La iniciativa que cree la API decide.

### Variables `.env` del server propuesto

```ini
# ─── Dominio ────────────────────────────────────────────────────────────────
DOMAIN=midominio.com

# ─── UI ─────────────────────────────────────────────────────────────────────
# Path al build de produccion del UI (output de 'npm run build' en
# template-ecommerce-ui). Nginx sirve estos archivos directamente.
UI_DIST=/srv/repos/ecom/template-ecommerce-ui/dist

# ─── API upstream ───────────────────────────────────────────────────────────
# URL del backend al que Nginx reverse-proxy-eara /api/*.
# Si esta vacio, /api/* devuelve 502 hasta que se configure.
# Esto es DELIBERADO: el server NO asume tecnología de backend.
#
# Ejemplos validos:
#   API_UPSTREAM=http://127.0.0.1:8000      # Django runserver dev
#   API_UPSTREAM=http://127.0.0.1:3000      # Node/Express dev
#   API_UPSTREAM=unix:/run/gunicorn.sock    # Django produccion
#   API_UPSTREAM=http://api-internal:80     # microservicio (Docker)
API_UPSTREAM=

# ─── SSL / Let's Encrypt ────────────────────────────────────────────────────
SSL_EMAIL=admin@midominio.com
SSL_CERT_DIR=/etc/ssl/midominio
SSL_CERT_DAYS_WARN=30
SSL_CERT_DAYS_ERR=7

# ─── Worker Nginx ───────────────────────────────────────────────────────────
NGINX_WORKER_PROCESSES=auto
NGINX_WORKER_CONNECTIONS=1024

# ─── SSH ────────────────────────────────────────────────────────────────────
SSH_PORT=2222

# ─── fail2ban ───────────────────────────────────────────────────────────────
F2B_SSH_MAXRETRY=5
F2B_SSH_FINDTIME=600
F2B_SSH_BANTIME=3600

# Jail nginx-* (sustituye a apache-auth del referente)
F2B_NGINX_MAXRETRY=10
F2B_NGINX_FINDTIME=600
F2B_NGINX_BANTIME=1800
```

### Modelo de cuentas simplificado

Como **no hay backend en scope**, simplificamos:

| Cuenta | UID | Función | Cambio vs referente |
|--------|-----|---------|---------------------|
| `deploy` | 1000 | Operador, ejecuta provisioners | Igual |
| `infra` | 1001 | Sudo granular | Igual |
| `develop` | 1002 | Owner del codigo UI | Igual |
| `svc-backups` | 999 | Backups del proyecto | Igual |
| ~~`svc-dbdata`~~ | — | — | **ELIMINADO** (no hay BD en scope) |

Nginx corre como `www-data` (default Ubuntu), igual lectura
"other" sobre `/srv/repos/ecom/template-ecommerce-ui/dist`.

### Almacenamiento simplificado

| Clase | Path | Cambio vs referente |
|-------|------|---------------------|
| A | `/srv/repos/ecom/template-ecommerce-ui` | Igual (el repo del UI) |
| B | `/srv/backups/project` | Igual |
| ~~C~~ | — | **ELIMINADO** (no hay dumps BD) |

## Comparación lado a lado: referente vs propuesta

| Aspecto | `e-comerce-server` (referente) | `template-ecommerce-server` (propuesto) |
|---------|--------------------------------|-----------------------------------------|
| Web server | Apache 2.4 | **Nginx 1.24+** |
| WSGI propio | mod_wsgi | **N/A** (no servimos backend) |
| Backend | Django (acoplado via mod_wsgi + serve_spa) | **Externo, agnostic** (reverse proxy a `$API_UPSTREAM`) |
| SPA catch-all | Django `serve_spa` view | **Nginx `try_files $uri /index.html`** (1 línea) |
| SSL provisioner | acme.sh | acme.sh (igual) |
| fail2ban jails | sshd + apache-auth | sshd + **nginx-***  |
| Modelo de cuentas | 5 | **4** (sin svc-dbdata) |
| Clases de almacenamiento | A, B, C | **A, B** (sin C) |
| `verify.sh` checks | 13 (incluye Django) | ~10 (sin checks Django) |
| Provisioners | apache, firewall, security, ssl | **nginx, firewall, security, ssl** |
| Tests bash | 5 | 5 (adaptados) |
| Vhosts | http.conf + https.conf | **upstream.conf + http.conf + https.conf** |
| `.env.example` | ~150 líneas | ~80 líneas (más simple, sin Django) |
| Total archivos | 22 | ~20 estimados |
| LOC bash | ~3500 | ~2800 estimados (sin lógica Django) |

## Plan de creación del proyecto `template-ecommerce-server`

Si decides ejecutar, esta es la propuesta de **iniciativa formal**:

### Nombre tentativo de iniciativa

- En el template UI: registrar como **iniciativa nueva**:
  `crear-template-server` o
  `disenar-infraestructura-template-server`.
- Como **proyecto hermano**: el repo nuevo sería
  `template-ecommerce-server`.

### Estructura por fases (propuesta)

| Fase | Tareas | Esfuerzo estimado |
|------|--------|-------------------|
| **F0 Apertura** | Abrir iniciativa, alcance, plan, tareas | 60 min |
| **F0a Análisis adicional** | Verificar referente, decidir Nginx oficialmente | 30 min |
| **F1 Estructura del repo** | Crear `template-ecommerce-server` con árbol vacío | 30 min |
| **F2 Utils + .env** | Portar `utils/core.sh`, `logging.sh`, `network.sh`, `validation.sh` de e-comerce-server. Diseñar `.env.example` propio. | 90 min |
| **F3 Configuración Nginx** | `config/nginx/template-https.conf`, `template-http.conf` (redirect + ACME), con placeholders `%%VAR%%` | 60 min |
| **F4 Provisioners Nginx** | `provisioners/nginx/install.sh` (apt nginx), `setup_vhost.sh` (reemplaza placeholders) | 120 min |
| **F5 Provisioners SSL** | Portar `provisioners/ssl/setup_ssl.sh` 1:1 (es agnostic) | 30 min |
| **F6 Provisioners seguridad** | Portar `setup_fail2ban.sh` (cambiar apache-auth → nginx-limit-req + nginx-botsearch), `setup_ssh_hardening.sh` 1:1 | 90 min |
| **F7 Provisioners firewall** | Portar `setup_firewall.sh` 1:1 | 30 min |
| **F8 Scripts de operación** | `verify.sh` (~10 checks), `renew_ssl.sh` 1:1 | 90 min |
| **F9 Tests bash** | Adaptar los 5 tests del referente | 90 min |
| **F10 Documentación** | `README.md` + `docs/operaciones.md` adaptados | 60 min |
| **F11 Integración con template-ecommerce-ui** | Documentar en el README del template cómo se relaciona, añadir paso `npm run build` que produce `dist/` esperado por el server | 30 min |
| **Total** | ~14 horas (1.75 días de trabajo) | |

### Decisiones que requeriré antes de arrancar

| Decisión | Mi propuesta por defecto |
|----------|--------------------------|
| Apache vs Nginx | **Nginx** (justificado arriba) |
| Modelo cuentas: 4 o 5 | **4** (sin svc-dbdata) |
| Clases almacenamiento: 2 o 3 | **2** (sin clase C) |
| Procedimiento WSL2 simulando prod | **Igual al referente** (reusable) |
| Dónde vive el repo | Sugerencia: GitHub `jcg-admin/template-ecommerce-server` |
| Modo de creación | **Sub-iniciativa con su propio repo y procedimiento PROC-GESTION-001** |
| Pausa de iniciativa SCSS | **Sí**, registrarla formalmente |

## Riesgos identificados

| Riesgo | Mitigación |
|--------|------------|
| El template UI HOY no compila a `dist/` testeado en server | Verificar `npm run build` en el template antes de F11 |
| Sin backend, no hay nada que reverse-proxy-ar; el server queda demostrable solo con `/` (UI) | Documentar este escenario "server-only-UI" como válido; `/api/*` devuelve 502 hasta que la API esté |
| `webpack.config.js` actual puede producir `dist/` con assumptions de Django (`API_URL`, etc) | Auditar `webpack.config.js` antes de F11 — ya hay hallazgo previo (en mi memoria) de "fix `webpack.config.js`" en commit `53b46e0` del referente |
| La iniciativa SCSS queda pausada significativamente | Trade-off explícito: server desbloquea despliegue real; SCSS sigue sin estar en producción de todos modos |
| Modelo de cuentas Linux + WSL2 + VPS es complejo de testear | Heredar tests bash del referente; añadir tests específicos de Nginx |

## Lo que NO está en este análisis

Para que la propuesta sea honesta sobre su alcance:

- **No examiné el código real de los 8 scripts bash del referente** linea por linea. Solo conteos y READMEs. Esa profundidad llegaría en la iniciativa formal F2/F4/F5/F6/F7.
- **No verifiqué que `npm run build` del template produce un `dist/` consumible por Nginx tal como propongo**. Hay que validarlo antes de F11.
- **No diseñé los 10 checks específicos de `verify.sh`** (lista exhaustiva). Eso llegaría en F8.
- **No diseñé los tests bash adaptados** (5 archivos del referente). Eso llegaría en F9.
- **No verifiqué disponibilidad del nombre de repo** `template-ecommerce-server` en GitHub.

## Que sigue

**Si confirmas que quieres ejecutar la creación**:

1. **Decisión Apache vs Nginx**: confirmar mi recomendación o
   pedir Apache (entonces revisamos).
2. **Pausa formal** de la iniciativa SCSS en
   `progreso-mapear-y-corregir-scss-completo.md`.
3. **Abrir iniciativa formal** `disenar-infraestructura-template-server`
   en el template UI (o donde decidas).
4. **Decidir donde vive el repo del server**:
   `/tmp/project/template-ecommerce-server/` local + crear repo
   GitHub `jcg-admin/template-ecommerce-server`.
5. **Ejecutar F0..F11** según el plan.

**Si solo quieres tenerlo documentado por ahora**:

1. Commitear este documento como referencia.
2. Continuar con la iniciativa SCSS activa (T-202).
3. Reanudar este trabajo cuando convenga.

## Referencias

- Repo de referencia local: `/tmp/references/e-comerce-server/`
- README original del referente: `e-comerce-server/README.md`
- Vhost HTTPS del referente: `e-comerce-server/config/apache/practicayoruba-https.conf`
- Procedimiento externo citado: `Procedimiento-Implementacion-Almacenamiento-WSL2-ecomerce-p001 v1.0.0`
- Cuentas y storage: ver `e-comerce-server/.env.example` líneas 12-37
