# Procedimiento: generar tarball del proyecto

## Cuando usarlo

Al cerrar una sesion de trabajo significativa o antes de integrar
cambios en la distro (Clase B).

## Comando

```bash
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPO="template-ecommerce-ui"
SRC="/tmp/project/template-ecommerce-ui"
OUT="/tmp/backups"
BASE="${REPO}-FULL-${TIMESTAMP}"

mkdir -p "$OUT" && \
tar -czf "${OUT}/${BASE}-source.tar.gz" \
    -C "$(dirname ${SRC})" \
    --exclude="template-ecommerce-ui/node_modules" \
    --exclude="template-ecommerce-ui/dist" \
    "$(basename ${SRC})" && \
md5sum "${OUT}/${BASE}-source.tar.gz" > "${OUT}/${BASE}-source.tar.gz.md5" && \
MD5=$(cut -d' ' -f1 "${OUT}/${BASE}-source.tar.gz.md5") && \
SIZE=$(du -sh "${OUT}/${BASE}-source.tar.gz" | cut -f1) && \
HEAD=$(git -C "$SRC" rev-parse HEAD) && \
COMMITS=$(git -C "$SRC" rev-list --count HEAD) && \
echo "BASE:    ${BASE}" && \
echo "MD5:     ${MD5}" && \
echo "Tamano:  ${SIZE}" && \
echo "HEAD:    ${HEAD}" && \
echo "Commits: ${COMMITS}"
```

Incluye `.git` (historia completa). Excluye `node_modules` y `dist`.

## Verificar el tarball

```bash
mkdir -p /tmp/restore-verify && \
tar -xzf "${OUT}/${BASE}-source.tar.gz" -C /tmp/restore-verify && \
RESTORED=$(git -C /tmp/restore-verify/template-ecommerce-ui rev-parse HEAD) && \
ORIGINAL=$(git -C "$SRC" rev-parse HEAD) && \
[ "$RESTORED" = "$ORIGINAL" ] && echo "HEAD: OK" || echo "HEAD: FALLA" && \
echo "Commits: $(git -C /tmp/restore-verify/template-ecommerce-ui rev-list --count HEAD)" && \
echo "node_modules (debe ser 0): $(ls /tmp/restore-verify/template-ecommerce-ui/node_modules 2>/dev/null | wc -l)" && \
echo ".git presente: $(test -d /tmp/restore-verify/template-ecommerce-ui/.git && echo SI || echo NO)" && \
rm -rf /tmp/restore-verify
```

## Copiar a outputs (para descargar desde claude.ai)

```bash
cp "${OUT}/${BASE}-source.tar.gz" /mnt/user-data/outputs/
cp "${OUT}/${BASE}-source.tar.gz.md5" /mnt/user-data/outputs/
```

## Integracion en la distro (Clase B)

```bash
# Paso 1: extraer en /srv/backups/
sudo -u svc-backups mkdir -p /srv/backups/project/${TIMESTAMP}
sudo -u svc-backups cp <ruta>/${BASE}-source.tar.gz /srv/backups/project/${TIMESTAMP}/
sudo -u svc-backups tar -xzf /srv/backups/project/${TIMESTAMP}/${BASE}-source.tar.gz \
    -C /srv/backups/project/${TIMESTAMP}/

# Paso 2: aplicar al repo local
git config --global --add safe.directory /srv/backups/project/${TIMESTAMP}/template-ecommerce-ui
cd /srv/repos/tui/template-ecommerce-ui
git remote add backup-${TIMESTAMP} /srv/backups/project/${TIMESTAMP}/template-ecommerce-ui
git fetch backup-${TIMESTAMP}
git reset --hard backup-${TIMESTAMP}/main
git remote remove backup-${TIMESTAMP}
git config --global --remove-section safe

# Paso 3: reinstalar dependencias
npm install

# Paso 4: verificar
npm run dev         # http://localhost:3001
npm test
```

## Nota sobre git archive

`git archive` NO incluye `.git` — no sirve para la integracion en distro
porque el repo de destino necesita la historia. Usar siempre `tar` con
`--exclude` como se muestra arriba.
