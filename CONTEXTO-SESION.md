# CONTEXTO-SESION.md

Documento de arranque para nuevas conversaciones con Claude.
Leer este archivo **primero** antes de cualquier otra accion.
Generado: 2026-05-27T14:55:00 — actualizar al inicio de cada sesion.

---

## 1. Entorno WSL2

| Campo | Valor |
|-------|-------|
| Distro | `ubuntu-template-ui-e-commerce` |
| Host | `yollotl` |
| Prompt distro | `develop@yollotl:` |

### Cuentas

| Cuenta | UID | Sudo | Uso |
|--------|-----|------|-----|
| `deploy` | 1000 | Si (pleno) | Operaciones con sudo, provisioners |
| `infra` | 1001 | Si (granular) | Operaciones de infraestructura |
| `develop` | 1002 | No | Todo el trabajo de codigo y git |
| `svc-backups` | 999 | No (nologin) | Escritura en Clase B exclusivamente |

### Volumenes (VHDXs)

| Clase | Ruta | Uso |
|-------|------|-----|
| Clase A | `/srv/repos/tui/` | Repos de trabajo activo |
| Clase B | `/srv/backups/project/` | Tarballs de respaldo |

### Rutas clave en la distro

```
/srv/repos/tui/template-ecommerce-ui/     <- repo UI activo
/srv/repos/tui/template-ecommerce-server/ <- repo server activo
/srv/backups/project/                     <- tarballs Clase B
/mnt/e/Proyectos/template-e-comerce-ui/_backup/  <- backup Windows (E:)
```

---

## 2. Repositorios

### template-ecommerce-ui

| Campo | Valor |
|-------|-------|
| GitHub | `https://github.com/jcg-admin/template-ecommerce-ui` |
| Rama principal | `main` |
| HEAD actual | `767b9dc` — Add F0 PM docs for adaptar-sistema-diseno-yoruba |
| Commits totales | 171 |
| Node en distro | v18.19.1 (requiere `--no-verify` en push por stylelint Node 20+) |
| Puerto dev server | 3001 |
| Puerto backend proxy | 8000 (Django local, fallback intencional) |
| Scripts clave | `npm run dev`, `npm run build`, `npm run build:demo`, `npm test` |

**Aliases webpack** (todos en `src/`):
`@app`, `@modules`, `@components`, `@hooks`, `@state`, `@redux`,
`@services`, `@mocks`, `@styles`, `@utils`, `@types`, `@constants`,
`@pages`, `@router`, `@config`, `@layouts`, `@context`, `@lib`,
`@facades`, `@decorators`

**DEMO_MODE**: `npm run build:demo` = `DEMO_MODE=true webpack --mode production`.
Copia `mockServiceWorker.js` y `dist/catalog/images/` al `dist/`.
Sin DEMO_MODE el build de produccion no cambia.

### template-ecommerce-server

| Campo | Valor |
|-------|-------|
| GitHub | `https://github.com/jcg-admin/template-ecommerce-server` |
| Rama principal | `main` |
| HEAD actual | `f49d537` — Add test_logging.sh for init_log coverage |
| Commits totales | 72 |
| Scripts | `bash scripts/setup.sh`, `bash scripts/start.sh`, `bash scripts/verify.sh` |

---

## 3. Bash_tool

La sesion de Claude tiene acceso a bash_tool. El codigo se clona/aplica en:
```
/tmp/project/template-ecommerce-ui/
/tmp/project/template-ecommerce-server/
```

Estos directorios **no persisten entre conversaciones**. Al iniciar una nueva
sesion hay que restaurar desde el tarball mas reciente o hacer `git clone`.

**Node en bash_tool**: v22.22.2 (sin restricciones de EBADENGINE).

**Red disponible**: npmjs.com, github.com, pypi.org (lista completa en network_config).
No hay acceso a localhost del host.

---

## 4. Tarballs de respaldo

Usar siempre el tarball **mas reciente** de cada repo para restaurar.

### template-ecommerce-ui (activos)

| Timestamp | Ruta Windows | MD5 | Commits | Notas |
|-----------|-------------|-----|---------|-------|
| 20260525-204130 | `_backup\20260525-204130` | fc0440fd... | 142 | Baseline inicial |
| 20260526-004954 | `_backup\20260526-004954` | f61624d9... | 150 | Pre-sesion 3 |
| 20260527-061931 | `_backup\20260527-061931` | 083e6f33... | 167 | Sin fix build |
| **20260527-065458** | **`_backup\20260527-065458`** | **433fec11...** | **168** | **USAR ESTE** |

### template-ecommerce-server (activos)

| Timestamp | MD5 | Commits |
|-----------|-----|---------|
| 20260526-000827 | d2b466d8... | 72 |

### Procedimiento de integracion de tarball en distro

```bash
# Como deploy:
sudo -u svc-backups mkdir -p /srv/backups/project/<TIMESTAMP>
sudo -u svc-backups cp <ruta-windows>/<archivo>.tar.gz /srv/backups/project/<TIMESTAMP>/
sudo -u svc-backups tar -xzf /srv/backups/project/<TIMESTAMP>/<archivo>.tar.gz \
    -C /srv/backups/project/<TIMESTAMP>/

# Como develop:
git config --global --add safe.directory /srv/backups/project/<TIMESTAMP>/template-ecommerce-ui
git config --global --add safe.directory /srv/backups/project/<TIMESTAMP>/template-ecommerce-ui/.git
cd /srv/repos/tui/template-ecommerce-ui
git remote add backup-<TIMESTAMP> /srv/backups/project/<TIMESTAMP>/template-ecommerce-ui
git fetch backup-<TIMESTAMP>
git reset --hard backup-<TIMESTAMP>/main
git remote remove backup-<TIMESTAMP>
git config --global --remove-section safe

# Push a GitHub (siempre con --no-verify en la distro por Node 18):
git push --no-verify origin main
```

---

## 5. Datos externos (no en el repo)

### Catalogo Oja Yoruba

- **Fuente**: scraper de `ojayoruba.com`
- **Archivo**: `_catalogo_completo.json` — 256 productos, 8 categorias principales,
  14 categorias totales, 320 PNGs (24 MB)
- **Ubicacion en bash_tool**: `/tmp/oja_data/` (no persiste)
- **Regenerar en bash_tool**:
  ```bash
  mkdir -p /tmp/oja_data
  # El usuario debe subir el archivo oja_tar.gz de nuevo
  tar -xzf /mnt/user-data/uploads/oja_tar.gz -C /tmp/oja_data
  ```
- **Datos ya integrados en el repo**: `src/mocks/data/catalog.ts` (generado)
  y `public/catalog/images/` (320 PNGs versionados)
- **Script de transformacion**: `scripts/transform-catalog.mjs`
  ```bash
  node scripts/transform-catalog.mjs <ruta-al-json>
  ```

### Paquete de referencia dist-yoruba-ui

- **Archivo**: `template-ecommerce.zip` (subido en sesion 2026-05-27)
- **Ubicacion en bash_tool**: `/tmp/yoruba-ref/` (no persiste)
- **Regenerar en bash_tool**:
  ```bash
  mkdir -p /tmp/yoruba-ref
  # El usuario debe subir el archivo template-ecommerce.zip de nuevo
  unzip /mnt/user-data/uploads/template-ecommerce.zip -d /tmp/yoruba-ref
  ```
- **Contenido**: 8 versiones de migracion (v1..v8), 102 archivos.
  Paleta del brazalete, tema oscuro, Fraunces + IBM Plex.
- **Analisis completo**: ver iniciativa `adaptar-sistema-diseno-yoruba`
  en `docs/pm/iniciativas/adaptar-sistema-diseno-yoruba/`

---

## 6. Iniciativas template-ecommerce-ui

| Slug | Estado |
|------|--------|
| analizar-ramas-pendientes-de-integracion | Cerrada |
| resolver-hallazgos-de-deuda-del-template | Cerrada |
| revisar-arquitectura-de-mocks | Cerrada |
| validar-contrato-de-mocks-vs-backend-real | Backlog |
| completar-dominio-de-ecommerce | En ejecucion (pausada) |
| ampliar-ucs-de-ecommerce | En analisis (pausada) |
| monitorear-y-reducir-allowlist-hex | Cancelada |
| mapear-y-corregir-scss-completo | En ejecucion (pausada) |
| corregir-nomenclatura-ecommerce-y-estilo-diagramas | Cerrada |
| habilitar-msw-en-modo-demo | Cerrada |
| auditar-y-corregir-inconsistencias | Cerrada |
| integrar-catalogo-oja-en-mocks | Cerrada |
| auditar-integracion-catalogo | Cerrada |
| **adaptar-sistema-diseno-yoruba** | **En ejecucion — F0 cerrada, F1 pendiente** |

## 7. Iniciativas template-ecommerce-server

| Slug | Estado |
|------|--------|
| crear-template-ecomerce-ui-server | Cerrada |
| corregir-links-navegacion-historica | Cerrada |
| corregir-paths-ecom-a-tui-server | Cerrada |
| crear-setup-sh | Cerrada |
| crear-start-sh | Cerrada |
| auditar-gaps-server-y-ui | Cerrada |
| actualizar-readme-y-crear-docs-indice | Cerrada |
| agregar-logging-a-archivo | Cerrada |

---

## 8. Convenciones del proyecto

### Commits (Tim Pope)

```
Subject: imperativo, <=50 chars, sin punto final
Body: separado por linea en blanco, explicacion del por que
```

### PROC-GESTION-001 v4.0.0

1. Un commit por tarea completada (no por fase)
2. Timestamps ISO 8601 con hora real: `date -u +"%Y-%m-%dT%H:%M:%S"`
   — capturar por linea con `echo`, nunca con `cat >>` heredoc que
   genera el mismo segundo para todas las entradas
3. Verificar cambios antes de declarar "listo" — mostrar fragmento
   exacto del archivo tras cada modificacion (regla del ejecutor)
4. Leer el archivo antes de modificarlo (siempre `view` o `cat` primero)

### Formato de iniciativas UI

```
index.md          -> 3 secciones: Motivo, Estado actual, Indice
alcance-*.md      -> Por que existe, Que cubre, Criterio, Fuera de alcance, Esfuerzo
analisis-*.md     -> Hallazgos con evidencia de codigo
plan-*.md         -> DAG Mermaid + descripcion de fases (SIN tablas de tareas)
tareas-*.md       -> Lista plana ID | Descripcion | Estado (Pendiente/Hecha)
progreso-*.md     -> Log: Timestamp | Evento | Detalle (timestamps reales distintos)
decisiones-*.md   -> Se crea al CERRAR la iniciativa
```

**Fechas**: siempre con hora completa: `2026-05-27T07:41:35`, nunca solo `2026-05-27`.
Fuente: `git log --format="%ai %s"` o `date -u +"%Y-%m-%dT%H:%M:%S"`.

### Bug conocido: push en distro

La distro tiene Node 18.19.1. El pre-push hook de husky ejecuta
stylelint que requiere Node 20+. Siempre:
```bash
git push --no-verify origin main
```

### Bug conocido: safe.directory en integracion de tarball

Al restaurar desde tarball extraido por `svc-backups`, git reporta
"dubious ownership". Solucion:
```bash
git config --global --add safe.directory <ruta>
git config --global --add safe.directory <ruta>/.git
# ... operaciones git ...
git config --global --remove-section safe
```

### Caracteres en JSDoc de archivos JS

No usar backticks ni caracteres UTF-8 (`→`, tildes en comentarios)
en archivos `.js` procesados por Babel. Babel los interpreta como
inicio de template literal. Usar ASCII puro en comentarios de `.js`.

### process.env en webpack

`DefinePlugin` solo reemplaza accesos **estaticos**: `process.env.FOO`.
No reemplaza accesos dinamicos: `process.env[variable]`. En el bundle
del browser `process` no existe — genera `ReferenceError` en runtime.

---

## 9. Estado pendiente al cerrar esta sesion

### En la distro

```bash
# Verificar que el fix de process.env llego a la distro:
cd /srv/repos/tui/template-ecommerce-ui
git log --oneline -3
# Debe mostrar: 0e8dec1 Fix process.env dynamic access...

# Si no: aplicar el patch (ver sesion 2026-05-27)
# o git pull --no-verify origin main

# Verificaciones funcionales pendientes:
npm run dev          # abrir http://localhost:3001, verificar productos
npm run build:demo   # verificar dist/catalog/images/ (320 archivos)
```

### En bash_tool (proxima sesion)

```bash
# Restaurar repo UI desde tarball:
git clone https://github.com/jcg-admin/template-ecommerce-ui.git \
    /tmp/project/template-ecommerce-ui

# O desde el tarball mas reciente si hay commits sin push.

# Restaurar datos externos si se necesitan:
# - Subir oja_tar.gz y extraer a /tmp/oja_data/
# - Subir template-ecommerce.zip y extraer a /tmp/yoruba-ref/
```

### Proxima tarea

**Iniciativa `adaptar-sistema-diseno-yoruba` — F1: tokens y tipografia**

```
T-101: auditar hex hardcodeados en SCSS
T-102: reemplazar _variables.scss con paleta del brazalete
T-103: agregar _typography.scss
T-104: importar _typography en main.scss
T-105: agregar alias @assets en webpack.config.js
T-106: copiar practica-yoruba-logo.png a src/assets/
T-107: verificar build
```

Los archivos fuente estan en `/tmp/yoruba-ref/dist-yoruba-ui/src/` —
requiere que el usuario suba `template-ecommerce.zip` de nuevo.

---

## 10. Transcripts de sesiones anteriores

| Archivo | Contenido |
|---------|-----------|
| `2026-05-25-19-21-45-wsl2-ecommerce-server-setup.txt` | Sesion 1: setup WSL2, server |
| `2026-05-26-00-27-38-wsl2-ecommerce-server-ui-devops.txt` | Sesion 2: INI-SRV-001..009, inicio UI |
| `2026-05-26-01-10-23-wsl2-ecommerce-devops-ui-catalog.txt` | Sesion 3: iniciativas UI, catalogo Oja |
| *(esta sesion)* | Sesion 4: habilitar-msw, auditorias, catalogo integrado, sistema diseno Yoruba |

Ruta en bash_tool: `/mnt/transcripts/` (solo lectura, disponible entre sesiones).
