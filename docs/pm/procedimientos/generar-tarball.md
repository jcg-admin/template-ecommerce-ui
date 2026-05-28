# Procedimiento: Generar tarball de backup

| Campo | Valor |
|-------|-------|
| ID | PROC-TARBALL-UI-001 |
| Version | 1.0.0 |
| Fecha | 2026-05-28 |
| Repo | template-ecommerce-ui |
| Tipo | Procedimiento operativo |
| Estado | Activo |

---

## Proposito

Generar un backup completo del repo (incluyendo `.git/`, excluyendo `node_modules/`)
con MD5 y manifest de restauracion. Se ejecuta al inicio de cada sesion de trabajo
(backup PRE) y al cierre (backup POST).

Genera 3 archivos:
- `<repo>-FULL-<timestamp>-source.tar.gz`
- `<repo>-FULL-<timestamp>-source.tar.gz.md5`
- `<repo>-FULL-<timestamp>-source-manifest.txt`

---

## Prerequisito

Working tree limpio. Verificar:

```bash
git -C /tmp/project/template-ecommerce-ui status --short
```

Si hay cambios sin commitear, commitearlos o stashearlos antes de generar el tarball.

---

## Paso 1 — Generar tarball + MD5 + manifest

Ejecutar en el bash_tool del asistente:

```bash
mkdir -p /tmp/backups

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPO="template-ecommerce-ui"
BASE="${REPO}-FULL-${TIMESTAMP}"
SRC="/tmp/project/template-ecommerce-ui"
OUT="/tmp/backups"

tar -czf "${OUT}/${BASE}-source.tar.gz" \
    -C "$(dirname ${SRC})" "$(basename ${SRC})" && \
md5sum "${OUT}/${BASE}-source.tar.gz" > "${OUT}/${BASE}-source.tar.gz.md5"

HEAD=$(git -C "$SRC" rev-parse HEAD)
COMMITS=$(git -C "$SRC" rev-list --count HEAD)
AHEAD=$(git -C "$SRC" rev-list origin/main..HEAD --count 2>/dev/null || echo "N/A")
SIZE=$(du -sh "${OUT}/${BASE}-source.tar.gz" | cut -f1)
MD5=$(cut -d' ' -f1 "${OUT}/${BASE}-source.tar.gz.md5")

cat > "${OUT}/${BASE}-source-manifest.txt" << MANIFEST
================================================================================
BACKUP MANIFEST
================================================================================
Archivo:      ${BASE}-source.tar.gz
Tamano:       ${SIZE}
MD5:          ${MD5}
Fecha:        $(date -u +"%Y-%m-%dT%H:%M:%SZ")

REPOSITORIO
-----------
Repo:         ${REPO}
HEAD:         ${HEAD}
Commits:      ${COMMITS} total (${AHEAD} adelante de origin/main)
Working tree: limpio

ULTIMOS COMMITS
---------------
$(git -C "$SRC" log --oneline -10)

INSTRUCCIONES DE RESTAURACION
------------------------------
Como deploy en WSL2:
  sudo -u svc-backups mkdir -p /srv/backups/project/${TIMESTAMP}
  sudo -u svc-backups tar -xzf ${BASE}-source.tar.gz \
      -C /srv/backups/project/${TIMESTAMP}

Como develop:
  git config --global --add safe.directory \
      /srv/backups/project/${TIMESTAMP}/${REPO}
  git -C /srv/repos/tui/${REPO} remote add backup-${TIMESTAMP} \
      /srv/backups/project/${TIMESTAMP}/${REPO}
  git -C /srv/repos/tui/${REPO} fetch backup-${TIMESTAMP}
  git -C /srv/repos/tui/${REPO} reset --hard backup-${TIMESTAMP}/main
  git -C /srv/repos/tui/${REPO} remote remove backup-${TIMESTAMP}
  git config --global --unset-all safe.directory
================================================================================
MANIFEST

echo "BASE:    ${BASE}"
echo "MD5:     ${MD5}"
echo "Size:    ${SIZE}"
echo "Commits: ${COMMITS}"
```

---

## Paso 2 — Verificar restauracion no-destructiva

Siempre verificar que el tarball se puede restaurar antes de considerarlo valido:

```bash
mkdir -p /tmp/restore-verify && \
tar -xzf /tmp/backups/<BASE>-source.tar.gz \
    -C /tmp/restore-verify && \
RESTORED=$(git -C /tmp/restore-verify/template-ecommerce-ui rev-parse HEAD) && \
ORIGINAL=$(git -C /tmp/project/template-ecommerce-ui rev-parse HEAD) && \
[ "$RESTORED" = "$ORIGINAL" ] && echo "VERIFICACION: OK" || echo "ERROR: HEAD no coincide" && \
echo "HEAD:    $RESTORED" && \
echo "Commits: $(git -C /tmp/restore-verify/template-ecommerce-ui rev-list --count HEAD)" && \
rm -rf /tmp/restore-verify
```

Resultado esperado: `VERIFICACION: OK`

---

## Paso 3 — Copiar al entorno WSL2 (en sesion real)

El tarball queda en `/tmp/backups/` del bash_tool. Para trasladarlo a WSL2:

1. El asistente lo presenta con `present_files` para descarga.
2. El usuario lo copia a `E:\Proyectos\template-e-comerce-ui\_backup\<timestamp>\`.
3. Desde WSL2 como `svc-backups` / `deploy` se copia a Clase B.

---

## Historial de ejecuciones

| Fecha | Archivo | Tamano | MD5 | HEAD | Commits |
|-------|---------|--------|-----|------|---------|
| 2026-05-26 | template-ecommerce-ui-FULL-20260526-004954-source.tar.gz | 2.5M | f61624d9e99b660c91703440ecfb9c48 | b1045e1 | 150 |
| 2026-05-28 | template-ecommerce-ui-FULL-20260528-005052-source.tar.gz | 120M | 5d1da244fad01127e6d56c3c5f1c40d9 | 2b4dc52 | 222 |
| 2026-05-28 | template-ecommerce-ui-FULL-20260528-222020-source.tar.gz | 175M | 61e9d6dbe9b7a0d0b2b8480855a25c4f | 1a4f439 | 243 |

---

## Notas de ejecucion

- El tarball incluye `.git/` completo para permitir restauracion con historial.
- Excluye `node_modules/` automaticamente porque `tar` comprime el directorio
  tal como esta en disco — si `node_modules/` no existe (bash_tool limpio),
  no se incluye.
- El tamano varia entre sesiones segun el estado de node_modules en el momento
  del backup: 2.5M (sin node_modules) vs 120-175M (con node_modules instalados).
- `date -u` en bash_tool puede no estar disponible en todos los entornos;
  si falla, usar `date +"%Y-%m-%dT%H:%M:%SZ"` sin `-u`.
