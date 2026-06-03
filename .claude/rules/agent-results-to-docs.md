# Regla: resultados de agentes se registran en docs

> Siempre que se ejecute un subagente (tool Agent/Task), su resultado debe
> quedar registrado en docs de forma automatica. No depende de que Claude
> "se acuerde": lo fuerza un hook de Claude Code.

## Mecanismo (no es memoria, es un hook)

Un comportamiento automatico ante un evento requiere un **hook** en
`settings.json` — la memoria o las preferencias no disparan acciones. Por eso
esta regla se implementa con un hook `SubagentStop`:

| Pieza | Ruta |
|-------|------|
| Hook | `.claude/settings.json` → `hooks.SubagentStop` |
| Script | `.claude/hooks/save-agent-result.mjs` |
| Destino | `docs/pm/agentes/registro-de-agentes.md` (append-only) |

Cuando un subagente termina, el hook ejecuta el script, que lee el
`transcript_path` del subagente por stdin, extrae su **ultimo mensaje de
asistente** (el reporte final) y lo apende con timestamp ISO al registro.

El script esta diseñado para no fallar nunca (cualquier error sale con
codigo 0) para no interrumpir el flujo de trabajo.

## Activacion

`settings.json` se lee al iniciar la sesion. Si el archivo no existia cuando
la sesion arranco, el watcher no lo toma hasta abrir el menu `/hooks` una vez
o reiniciar Claude Code. Tras eso, el hook queda activo para todos los
subagentes siguientes.

## Verificacion

```bash
# El JSON del hook es valido y apunta al script:
jq -e '.hooks.SubagentStop[].hooks[] | select(.type=="command") | .command' .claude/settings.json

# Pipe-test del script con un transcript de prueba:
printf '%s\n' '{"type":"assistant","message":{"role":"assistant","content":[{"type":"text","text":"reporte"}]}}' > /tmp/t.jsonl
echo '{"session_id":"x","transcript_path":"/tmp/t.jsonl"}' | node .claude/hooks/save-agent-result.mjs
tail docs/pm/agentes/registro-de-agentes.md   # debe mostrar la entrada
```

## Alcance

- El registro es append-only y se versiona en git (es documentacion del
  proyecto, no un artefacto efimero).
- Captura el reporte final del agente, no su transcript completo (se recorta
  a ~6000 caracteres por entrada).
