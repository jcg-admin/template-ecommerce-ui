# Alcance — adaptar-sistema-thyrox

## Premisa verificada

| Campo | Valor |
|-------|-------|
| Nivel de gate ejecutado | 0c (cross-repo: clonar y analizar `jcg-admin/e-comerce`) |
| Red flags activos | RF-3 (cross-repo), RF-6 (toca infraestructura compartida: `.claude/`) |
| Resultado | **CONFIRMAR** (con adaptación) |
| Evidencia | `jcg-admin/e-comerce/.claude` clonado en `/tmp/references/e-comerce`: 82 skills, 29 agentes, 21 comandos, 21 rules, 55 references (verificado con `ls \| wc -l`). Nuestras 3 rules previas (`auto-audit-before-writing`, `commit-conventions`, `agent-results-to-docs`) son adaptación parcial previa de THYROX. |
| Iniciativas previas revisadas | Las 3 rules en `.claude/rules/` ya eran THYROX adaptado (sin iniciativa formal) |

**Conclusión:** importar el framework completo y adaptarlo. Adaptación
gobernada por el puente `CLAUDE.md` (identidad + rutas + formato + rules N/A),
ya que e-comerce asume monorepo+submódulos+Django+MariaDB+Sphinx y este repo es
un UI React standalone con docs en `.md`.

## Qué cubre

- Import de `.claude/` (agents, commands, references, skills, rules, scripts,
  hooks, .claude-plugin, ARCHITECTURE.md, CLAUDE.md) preservando nuestro
  `settings.json` y rules adaptadas.
- Adaptación de rutas (`docs/pm/iniciativas`) y formato (`.md`).
- Reescritura del puente `CLAUDE.md` con la identidad de este repo y la lista de
  rules no aplicables.

## Fuera de alcance

- Editar el repo origen `jcg-admin/e-comerce` (solo lectura/clonado).
- Reescritura profunda de cada uno de los 381 archivos del framework: los
  cuerpos de skills/rules con ejemplos de e-comerce se dejan como referencia; el
  puente `CLAUDE.md` gobierna la adaptación. Follow-up si se requiere limpieza fina.
- Skills no aplicables al UI (`db-mysql`, `db-postgresql`, `python-mcp`,
  `sphinx`, `backend-nodejs`): se conservan como referencia, no se usan.

## Criterio de completitud

- Framework importado en `.claude/` sin romper `settings.json`/hooks propios.
- Puente `CLAUDE.md` adaptado (identidad + rutas + rules N/A).
- App intacta: `.claude/` no entra al bundle; `npm test`/`build:demo` sin cambios.
