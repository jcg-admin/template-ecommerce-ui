```yml
type: Contexto Persistente
version: 1.0.0
updated_at: 2026-06-02
adaptado_de: jcg-admin/e-comerce (.claude THYROX) — 2026-06-02
```

# CLAUDE.md — template-ecommerce-ui

**Level 2 — Puente entre el SKILL THYROX (Level 1) y este proyecto.**

Adaptado del sistema de agentes THYROX del monorepo `jcg-admin/e-comerce`
(iniciativa `adaptar-sistema-thyrox`). Aquí se declara la identidad, rutas y
convenciones **de este repo** para que skills y agentes genéricos resuelvan lo
específico del proyecto leyendo este archivo.

## Identidad

- **Repositorio:** `jcg-admin/template-ecommerce-ui` — **standalone** (NO es un
  submódulo, NO tiene submódulos). Es el frontend React del template e-commerce.
- **Hermano:** `jcg-admin/template-ecommerce-server` (backend, repo aparte).
- **Stack:** React 19 + Redux Toolkit 2 + React Query 5 + React Router 6 +
  SCSS Modules + Webpack 5. Mocks con MSW (DEMO_MODE). Tests con Jest + RTL.
  E2E con Playwright (`tests/e2e/`).

## Rutas y formato (NUESTRAS convenciones — difieren de e-comerce)

| Concepto | En este repo |
|----------|--------------|
| Iniciativas / work packages | `docs/pm/iniciativas/<slug>/` (slug kebab-case estable, sin timestamp) |
| Artefactos | **`.md`** (Markdown) — NO `.rst`, NO Sphinx |
| Artefactos por iniciativa | `index.md`, `alcance-<slug>.md`, `analisis-*.md`, `plan-*.md`, `tareas-*.md`, `progreso-*.md`, `decisiones-*.md` |
| Índice de iniciativas | `docs/pm/iniciativas/indice-de-iniciativas.md` |
| ADRs de producto (`adr_path`) | `docs/decisiones-de-arquitectura/` |
| Hallazgos de agentes | `docs/pm/agentes/registro-de-agentes.md` (hook SubagentStop) + `docs/pm/iniciativas/<slug>/` |
| Decisiones de arquitectura (arc42) | `docs/decisiones-de-arquitectura/` |

## Reglas NO aplicables en este repo (override de I-009)

Estas rules vienen de THYROX/e-comerce y asumen el **monorepo con submódulos +
Django/MariaDB + Sphinx**. En este repo standalone NO aplican; si una contradice
lo de aquí, **prevalece este CLAUDE.md**:

- `gitlink-bump-gate.md` — no hay submódulos; no hay gitlink que bumpear.
- `git-flow.md` — la rama padre `feature/solve-problem-docs` y el flujo de
  submódulos no aplican. Flujo real: rama de trabajo (`claude/<...>`) → push →
  PR a `main` solo si se pide. `--no-verify` por el husky pre-push.
- `test-execution-protocol.md` — no hay capa db (MariaDB) ni api (Django/pytest).
  El gate de tests aquí es: `npm test` (Jest) verde + `node scripts/check-scss.mjs`
  clean + `DEMO_MODE=true npm run build:demo` OK (+ `npm run test:e2e` cuando aplique).
- `build-logs.md` — no hay Sphinx/PlantUML; el "build" es webpack/jest.
- `bash-background-tasks.md` — sus paths (`/home/user/e-comerce-*`, rama
  `great-fermat`) son de e-comerce. El patrón general (Monitor/`--pid`, no
  `sleep`) sí es válido.

## Reglas vigentes (aplican)

`auto-audit-before-writing` (Premise Gate), `principio-rector-rup-arquitectura`,
`commit-conventions` (Tim Pope), `convention-naming` (sin prefijos numéricos),
`metadata-standards`, `timestamps-iso8601-obligatorios`,
`react-verification-gate`, `memoria-episodica-fallos`,
`calibration-verified-numbers`, `registro-reportes-agentes`,
`hallazgos-documentacion-obligatoria` (a `docs/pm/...`),
`agent-results-to-docs` (hook), `no-lazy-imports` (la parte UI),
`changelog-policy`, `thyrox-invariants` (con las adaptaciones de paths).

## Tech-stack confirmado

React 19 · Redux Toolkit 2 (slices en `src/redux/slices/`) · React Query 5 ·
React Router 6 (`src/router/AppRouter.jsx`) · SCSS Modules (`@use '@styles/abstracts' as *`) ·
Webpack 5 · MSW (`src/mocks/handlers/`) · Jest + Testing Library · Playwright (`tests/e2e/`).

## Flujo de sesión

1. Leer `docs/pm/iniciativas/indice-de-iniciativas.md` (estado de iniciativas).
2. Premise Gate (`auto-audit-before-writing`) antes de abrir/scaffoldear iniciativa.
3. Trabajo bajo la metodología que el intake THYROX rutee (ver
   `agents/thyrox-coordinator.md`); artefactos en `docs/pm/iniciativas/<slug>/`.
4. Verificación: jest + check-scss + build:demo (+ e2e) antes de cerrar.
5. Commits Tim Pope; push con `--no-verify`.

## Para más contexto

- SKILL Level-1: `skills/thyrox/SKILL.md`.
- Arquitectura del sistema de agentes: `ARCHITECTURE.md`.
- Skills de expertos relevantes: `skills/frontend-react/`, `skills/frontend-webpack/`.
- Las skills de `db-mysql`, `db-postgresql`, `python-mcp`, `sphinx`,
  `backend-nodejs` quedan importadas como referencia pero **no aplican** al UI.
