# Iniciativa: adaptar-sistema-thyrox

**Estado:** EN EJECUCIÓN
**Creada:** 2026-06-02
**Origen:** Solicitud usuario — clonar el sistema de agentes THYROX
(`jcg-admin/e-comerce`) y adaptarlo a este proyecto, usando nuestro formato de
docs (`.md` en `docs/pm/iniciativas/`).

## Motivo

THYROX es el framework agéntico de metodología del monorepo `e-comerce`
(82 skills, 29 agentes, 21 comandos, 21 rules: PM/DMAIC/PDCA/RUP/Lean/BPMN, con
intake que rutea metodología y coordinadores que orquestan análisis→
implementación). Nuestro template ya tenía una **adaptación parcial** (3 rules).
Esta iniciativa importa el framework completo y lo adapta a `template-ecommerce-ui`.

## Qué se hizo

1. **Import** de `.claude/{agents,commands,references,skills,rules,scripts,hooks,
   .claude-plugin,ARCHITECTURE.md,CLAUDE.md}` desde `jcg-admin/e-comerce`,
   **sin pisar** nuestro `settings.json` (hook SubagentStop) ni las 2 rules ya
   adaptadas (`auto-audit-before-writing`, `commit-conventions`).
2. **Adaptación de rutas/formato** (sed global, 49 archivos):
   `docs/source/gestion/pm/<sub>/iniciativas` → `docs/pm/iniciativas`; `.rst` →
   `.md` (excepto la skill `sphinx`, que es `.rst` por naturaleza).
3. **Reescritura del puente `CLAUDE.md`** (Level 2) para la identidad de este
   repo (React UI standalone, sin submódulos/Django/MariaDB/Sphinx) y declaración
   de **qué rules NO aplican** aquí (override de I-009).

## Adaptación clave — reglas no aplicables

`gitlink-bump-gate`, `git-flow` (rama padre/submódulos), `test-execution-protocol`
(MariaDB/Django/pytest), `build-logs` (Sphinx), `bash-background-tasks` (paths
e-comerce) **no aplican** a este repo standalone. Documentado en `CLAUDE.md`.
Las skills `db-*`, `python-mcp`, `sphinx`, `backend-nodejs` quedan como
referencia, no aplican al UI.

## Índice

| Archivo | Descripción |
|---------|-------------|
| `alcance-adaptar-sistema-thyrox.md` | Premisa verificada + qué cubre + fuera de alcance |
| `progreso-adaptar-sistema-thyrox.md` | Log |

## Pendiente

- Adaptación fina por-archivo de los cuerpos de skills/rules que aún citan
  ejemplos de e-comerce (el puente `CLAUDE.md` gobierna mientras tanto).
