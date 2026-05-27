---
artefacto: RULE-AUTO-AUDIT-001
tipo: Regla
dominio: normativa
subdominio: metodologia/premise-gate
estado: Aprobado
version: 1.0.0
fecha_creacion: 2026-05-27T15:27:49
fecha_actualizacion: 2026-05-27T15:27:49
autor: NestorMonroy
clasificacion: Interno
repos: template-ecommerce-ui, template-ecommerce-server
---

# Stage 0 — Premise Gate

> Obligatorio antes de crear cualquier archivo en `docs/pm/iniciativas/`.
> No se sustituye por lectura informal ni por experiencia previa en el área.

## Proposito

Antes de abrir una iniciativa el ejecutor debe confirmar que las premisas
que la motivan son verdaderas en el codigo real — no en un analisis previo,
no en la memoria de sesion, no en un documento desactualizado.

El gate tiene tres niveles con promocion automatica ante red flags.

---

## Nivel 0a — Verificacion focal (~2 min, siempre)

Ejecutar siempre, sin excepcion.

```bash
# 1. Localizar el file:line citado en el hallazgo
grep -rn "<patron>" src/ --include="*.ts" --include="*.tsx" \
     --include="*.js" --include="*.jsx" --include="*.scss" | head -10

# 2. Confirmar que la linea coincide con la descripcion del hallazgo
cat src/<archivo> | sed -n '<N>,<M>p'

# 3. Detectar iniciativas previas que pudieran haber cerrado el hallazgo
ls docs/pm/iniciativas/ | grep -i "<keyword>"
git log --oneline --grep="<keyword>" | head -10
```

**Resultado esperado**: el codigo en esa linea confirma el hallazgo
tal como se describe. Si no coincide, el hallazgo esta desactualizado.

---

## Nivel 0b — Lectura sistematica (~5 min, severidad >= MEDIA)

Leer el analisis o audit completo, no solo la cita que motivo la iniciativa.

Identificar:
- Patrones sistémicos que el hallazgo focal no captura
- Drift documentado sin fix (comentarios que contradicen el codigo real)
- Dependencias entre modulos que el fix podria afectar

---

## Nivel 0c — Trazado end-to-end (~15-30 min, obligatorio ante red flags)

```bash
# Grep en los dos repositorios
grep -rn "<patron>" /tmp/project/template-ecommerce-ui/src/ | head -20
grep -rn "<patron>" /tmp/project/template-ecommerce-server/    | head -20

# Verificar suposiciones contra el codigo real
# Budget maximo: 30 min.
# Si no hay claridad, abrir iniciativa de investigacion separada
# antes de crear el scaffold.
```

---

## Red flags que obligan escalar a 0c

Cualquiera de estas senales obliga promocion inmediata a nivel 0c:

| ID | Senal |
|----|-------|
| RF-1 | Drift documentado sin fix en el analisis o UC fuente |
| RF-2 | Palabras-clave en el hallazgo: `state`, `storage`, `schema`, `migration`, `interceptor`, `middleware`, `signal`, `transaction`, `concurrent`, `cache`, `webhook`, `scheduler`, `lifecycle` |
| RF-3 | Fix cross-repositorio (toca template-ecommerce-ui Y template-ecommerce-server) |
| RF-4 | Analisis anterior a un refactor relevante en el area |
| RF-5 | Comentarios del codigo contradicen el comportamiento observado |
| RF-6 | El analisis fue producido con alcance focal pero el fix toca infraestructura compartida (webpack config, SCSS globals, mocks base) |
| RF-7 | Iniciativas previas pudieron cerrar items del analisis sin actualizar su metadata |

---

## Resultados posibles del gate

| Resultado | Significado | Accion |
|-----------|-------------|--------|
| `CONFIRMAR` | Premisa verificada, alcance correcto | Proceder con el scaffold |
| `EXPANDIR` | Premisa verificada, alcance mas amplio de lo previsto | Ajustar alcance antes del scaffold |
| `COLAPSAR` | Premisa verificada, alcance mas reducido de lo previsto | Reducir alcance antes del scaffold |
| `REORDENAR` | Hay dependencias que cambian el orden de las fases | Reordenar antes del scaffold |
| `INVESTIGAR` | Premisa no verificable con los datos actuales | Abrir iniciativa de investigacion; no crear scaffold todavia |

---

## Formato obligatorio en `alcance-<slug>.md`

La primera seccion del alcance es siempre `## Premisa verificada`.
Sin ella el alcance se considera incompleto y el resto de artefactos
no debe generarse.

```markdown
## Premisa verificada

| Campo | Valor |
|-------|-------|
| Nivel de gate ejecutado | 0a / 0b / 0c |
| Red flags activos | RF-N, RF-M / Ninguno |
| Resultado | CONFIRMAR / EXPANDIR / COLAPSAR / REORDENAR / INVESTIGAR |
| Evidencia | `grep -n "patron" src/archivo.ts` → linea N: `<fragmento exacto>` |
| Iniciativas previas revisadas | `<slug>` @ `<hash>` / Ninguna |
```

Si el resultado es `REORDENAR` o `INVESTIGAR`, no se crea el directorio
de la iniciativa hasta resolver la bloqueante.
