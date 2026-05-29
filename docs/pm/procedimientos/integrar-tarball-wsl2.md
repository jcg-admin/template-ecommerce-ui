# Procedimiento: Integrar tarball en WSL2

| Campo | Valor |
|-------|-------|
| ID | PROC-TARBALL-WSL2-001 |
| Version | 1.1.0 |
| Fecha | 2026-05-29 |
| Repo | template-ecommerce-ui |
| Tipo | Procedimiento operativo |
| Estado | Activo |
| Relacionado | PROC-TARBALL-UI-001 |

---

## Proposito

Integrar en WSL2 un tarball generado por el asistente (PROC-TARBALL-UI-001),
sincronizando el repo local con los commits nuevos y haciendo rebuild del bundle demo.

---

## Variables del procedimiento

Sustituir en todos los comandos:

| Variable | Ejemplo | Descripcion |
|----------|---------|-------------|
| `<TIMESTAMP>` | `20260529-041412` | Timestamp del tarball (`YYYYMMDD-HHMMSS`) |
| `<BASE>` | `template-ecommerce-ui-FULL-20260529-041412` | Nombre base sin extension |
| `<MD5_ESPERADO>` | `ef72203ebc33f3a9dd4e4209500e33f3` | MD5 que reporto el asistente |

---

## Prerequisitos

- Tarball copiado a `E:\Proyectos\template-e-comerce-ui\_backup\<TIMESTAMP>\`
- Acceso a WSL2 con usuarios `deploy` (sudo) y `develop` (git)
- Remote `backup-<TIMESTAMP>` NO debe existir ya en el repo local

Verificar que el remote no existe:
```bash
git -C /srv/repos/tui/template-ecommerce-ui remote -v | grep backup
```
Si aparece un remote viejo de un intento fallido, eliminarlo primero:
```bash
git -C /srv/repos/tui/template-ecommerce-ui remote remove backup-<TIMESTAMP>
```

---

## Paso 1 — Verificar MD5 del tarball

Como cualquier usuario desde WSL2:

```bash
md5sum /mnt/e/Proyectos/template-e-comerce-ui/_backup/<TIMESTAMP>/<BASE>-source.tar.gz
```

Resultado esperado: el MD5 debe coincidir exactamente con `<MD5_ESPERADO>`.

**Errores comunes:**
- Si el md5sum se corre sobre el `.md5` en lugar del `.tar.gz`, devuelve el MD5
  del archivo de texto, no del tarball. Siempre apuntar al `.tar.gz`.

---

## Paso 2 — Copiar y extraer en Clase B (como deploy)

```bash
sudo -u svc-backups mkdir -p \
  /srv/backups/project/template-ecommerce-ui/<TIMESTAMP>

sudo -u svc-backups cp \
  /mnt/e/Proyectos/template-e-comerce-ui/_backup/<TIMESTAMP>/<BASE>-source.tar.gz \
  /srv/backups/project/template-ecommerce-ui/<TIMESTAMP>/

sudo -u svc-backups tar -xzf \
  /srv/backups/project/template-ecommerce-ui/<TIMESTAMP>/<BASE>-source.tar.gz \
  -C /srv/backups/project/template-ecommerce-ui/<TIMESTAMP>/
```

El tar extrae el directorio `template-ecommerce-ui/` completo con su `.git/`
dentro de `/srv/backups/project/template-ecommerce-ui/<TIMESTAMP>/`.

---

## Paso 3 — Agregar safe.directory, conectar remote y verificar commits (como develop)

```bash
git config --global --add safe.directory \
  /srv/backups/project/template-ecommerce-ui/<TIMESTAMP>/template-ecommerce-ui

git config --global --add safe.directory \
  /srv/backups/project/template-ecommerce-ui/<TIMESTAMP>/template-ecommerce-ui/.git

git -C /srv/repos/tui/template-ecommerce-ui remote add backup-<TIMESTAMP> \
  /srv/backups/project/template-ecommerce-ui/<TIMESTAMP>/template-ecommerce-ui

git -C /srv/repos/tui/template-ecommerce-ui fetch backup-<TIMESTAMP>

git -C /srv/repos/tui/template-ecommerce-ui log HEAD..backup-<TIMESTAMP>/main --oneline
```

El ultimo comando muestra los commits nuevos que llegan del tarball.
**Antes de continuar**, confirmar que el HEAD del backup es el esperado:

```bash
git -C /srv/backups/project/template-ecommerce-ui/<TIMESTAMP>/template-ecommerce-ui \
  log --oneline -3
```

---

## Paso 4 — Aplicar commits al repo local (como develop)

```bash
git -C /srv/repos/tui/template-ecommerce-ui reset --hard backup-<TIMESTAMP>/main
```

Verificar que HEAD quedo correcto:
```bash
git -C /srv/repos/tui/template-ecommerce-ui log --oneline -5
```

---

## Paso 5 — Limpiar remote y safe.directory (como develop)

```bash
git -C /srv/repos/tui/template-ecommerce-ui remote remove backup-<TIMESTAMP>
git config --global --unset-all safe.directory
```

---

## Paso 6 — Push a GitHub (como develop)

El hook de pre-push de husky falla con Node 18 por un bug de sintaxis ESM
en stylelint. Usar `--no-verify`:

```bash
git -C /srv/repos/tui/template-ecommerce-ui push origin main --no-verify
```

---

## Paso 7 — Rebuild del bundle demo (como develop)

```bash
cd /srv/repos/tui/template-ecommerce-ui && \
DEMO_MODE=true API_URL='' npm run build:demo 2>&1 | grep -E "ERROR|compiled" | tail -3
```

Resultado esperado: `webpack compiled with N warnings` — 0 errores.

---

## Paso 8 — Verificar en browser

Acceder a `https://localhost/` en Chrome.

Si MSW no carga (error de SSL con Service Worker):
1. Abrir `chrome://flags/#allow-insecure-localhost`
2. Activar "Allow invalid certificates for resources loaded from localhost"
3. Recargar `https://localhost/` con `Ctrl+Shift+R`

Credenciales demo:
- Comprador: `comprador@test.mx` / `Test1234!`
- Admin: `admin@e-comerce.example.com` / `Admin1234!`

---

## Historial de ejecuciones

| Fecha | Timestamp | BASE (abreviado) | MD5 tarball | HEAD | Commits | Resultado |
|-------|-----------|-----------------|-------------|------|---------|-----------|
| 2026-05-28 | 20260528-231855 | ...-20260528-231855 | (sesion anterior) | 9fd6abd | 243 | OK — push + build exitosos |
| 2026-05-29 | 20260529-041412 | ...-20260529-041412 | ef72203ebc33f3a9dd4e4209500e33f3 | fd40ba4 | 256 | PENDIENTE |

---

## Errores conocidos y soluciones

| Error | Causa | Solucion |
|-------|-------|---------|
| `does not appear to be a git repository` | Remote agregado antes de extraer el tarball | Eliminar el remote, extraer primero, luego agregar el remote |
| `fatal: ambiguous argument 'backup-.../main'` | Consecuencia del error anterior (fetch nunca se ejecuto) | Mismo procedimiento: eliminar remote, extraer, volver a empezar |
| `md5sum` devuelve MD5 incorrecto | Se paso el `.md5` como argumento en lugar del `.tar.gz` | Pasar el `.tar.gz` — el `.md5` es el archivo de verificacion, no lo que se verifica |
| `husky - pre-push script failed` | Bug de Node 18 con import assertions de stylelint | `git push --no-verify` |
| MSW: `Failed to register ServiceWorker — SSL certificate error` | Chrome rechaza SW en HTTPS con cert self-signed | Activar `chrome://flags/#allow-insecure-localhost` |
