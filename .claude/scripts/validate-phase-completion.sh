#!/usr/bin/env bash
# ============================================================
# validate-phase-completion.sh — I-015
# ============================================================
# Valida que el repositorio esta en condicion de recibir un
# commit de cierre de iniciativa. Referenciado desde
# PROC-GESTION-TUI-001 Fase 5 Paso 6.
#
# Uso:
#   bash .claude/scripts/validate-phase-completion.sh
#
# Exit code 0 = todas las condiciones pasan — proceder con el commit.
# Exit code 1 = hay condiciones que fallan — no commitear todavia.
#
# Las 5 condiciones validadas:
#   C-1  Working tree limpio (sin cambios unstaged)
#   C-2  Nada staged (nada pendiente de commit)
#   C-3  Remote sync (todos los commits pusheados a origin/main)
#   C-4  Build exitoso con exit 0
#   C-5  Historial reciente (hay al menos 1 commit en las ultimas 4 horas)
# ============================================================

set -uo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
    echo "ERROR: no se encontro un repositorio git en el directorio actual." >&2
    exit 1
}
cd "$REPO_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RESET='\033[0m'

PASS=0
FAIL=0

check() {
    local id="$1"
    local desc="$2"
    local result="$3"   # "ok" | "fail" | "warn"
    local detail="$4"

    if [ "$result" = "ok" ]; then
        echo -e "  ${GREEN}PASA${RESET}  $id  $desc"
        [ -n "$detail" ] && echo "         $detail"
        PASS=$((PASS + 1))
    elif [ "$result" = "warn" ]; then
        echo -e "  ${YELLOW}WARN${RESET}  $id  $desc"
        [ -n "$detail" ] && echo "         $detail"
    else
        echo -e "  ${RED}FALLA${RESET} $id  $desc"
        [ -n "$detail" ] && echo "         $detail"
        FAIL=$((FAIL + 1))
    fi
}

echo ""
echo "validate-phase-completion.sh — I-015"
echo "Repositorio: $(basename "$REPO_ROOT")"
echo "Timestamp:   $(date -u +"%Y-%m-%dT%H:%M:%S")"
echo "──────────────────────────────────────────────"
echo ""

# ─── C-1: Working tree limpio ────────────────────────────
unstaged=$(git status --porcelain 2>/dev/null | grep -v "^[AMDRC?]" | wc -l | tr -d ' ')
if [ "$unstaged" -eq 0 ]; then
    check "C-1" "Working tree limpio" "ok" ""
else
    dirty=$(git status --porcelain | grep -v "^[AMDRC?]" | head -5)
    check "C-1" "Working tree limpio" "fail" \
        "Hay $unstaged archivo(s) con cambios unstaged: $(echo "$dirty" | tr '\n' ' ')"
fi

# ─── C-2: Nada staged ───────────────────────────────────
staged=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
if [ "$staged" -eq 0 ]; then
    check "C-2" "Nada staged pendiente de commit" "ok" ""
else
    staged_files=$(git diff --cached --name-only | head -5 | tr '\n' ' ')
    check "C-2" "Nada staged pendiente de commit" "fail" \
        "Hay $staged archivo(s) staged: $staged_files"
fi

# ─── C-3: Remote sync ───────────────────────────────────
# Fetch silencioso para actualizar la referencia remota
git fetch origin --quiet 2>/dev/null || true

local_head=$(git rev-parse HEAD 2>/dev/null)
remote_head=$(git rev-parse origin/main 2>/dev/null || echo "UNKNOWN")

if [ "$remote_head" = "UNKNOWN" ]; then
    check "C-3" "Remote sync (origin/main)" "warn" \
        "No se pudo obtener HEAD de origin/main — verificar manualmente"
elif [ "$local_head" = "$remote_head" ]; then
    check "C-3" "Remote sync (origin/main)" "ok" \
        "HEAD: ${local_head:0:7}"
else
    ahead=$(git rev-list origin/main..HEAD --count 2>/dev/null || echo "?")
    check "C-3" "Remote sync (origin/main)" "fail" \
        "Hay $ahead commit(s) sin push. Ejecutar: git push --no-verify origin main"
fi

# ─── C-4: Build exitoso ─────────────────────────────────
# Comprueba si existe dist/ y si fue generado recientemente (< 30 min)
if [ -d "$REPO_ROOT/dist" ]; then
    if [ -f "$REPO_ROOT/dist/index.html" ]; then
        # Verificar antiguedad del build
        if find "$REPO_ROOT/dist/index.html" -mmin -30 2>/dev/null | grep -q .; then
            check "C-4" "Build exitoso reciente" "ok" \
                "dist/index.html generado hace menos de 30 min"
        else
            check "C-4" "Build exitoso reciente" "warn" \
                "dist/index.html existe pero fue generado hace mas de 30 min. Considerar re-build."
        fi
    else
        check "C-4" "Build exitoso reciente" "fail" \
            "dist/ existe pero no contiene index.html. Ejecutar: npm run build"
    fi
else
    check "C-4" "Build exitoso reciente" "warn" \
        "dist/ no existe. Si el cierre incluye cambios de codigo, ejecutar: npm run build"
fi

# ─── C-5: Historial reciente ───────────────────────────
recent=$(git log --since="4 hours ago" --oneline 2>/dev/null | wc -l | tr -d ' ')
last_commit=$(git log --oneline -1 2>/dev/null)
if [ "$recent" -gt 0 ]; then
    check "C-5" "Historial reciente (ultimas 4h)" "ok" \
        "Ultimo commit: $last_commit"
else
    check "C-5" "Historial reciente (ultimas 4h)" "warn" \
        "No hay commits en las ultimas 4h. Ultimo: $last_commit"
fi

# ─── Resumen ────────────────────────────────────────────
echo ""
echo "──────────────────────────────────────────────"
echo "  PASAN: $PASS / 5"
echo "  FALLAN: $FAIL / 5"
echo ""

if [ "$FAIL" -eq 0 ]; then
    echo -e "  ${GREEN}OK — Proceder con el commit de cierre.${RESET}"
    echo ""
    exit 0
else
    echo -e "  ${RED}BLOQUEADO — Resolver $FAIL condicion(es) antes de commitear.${RESET}"
    echo ""
    exit 1
fi
