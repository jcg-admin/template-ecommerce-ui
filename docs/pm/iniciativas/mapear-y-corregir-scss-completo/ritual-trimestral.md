# Ritual trimestral SCSS — mapear-y-corregir-scss-completo

| Campo | Valor |
|-------|-------|
| Iniciativa | mapear-y-corregir-scss-completo (T-021) |
| Frecuencia | Trimestral |
| Duración estimada | ~30 min |

## Pasos del ritual

### 1. Ejecutar el inventario de variables muertas

```bash
npm run lint:scss-vars
```

Si reporta nuevas variables muertas (más de las N del baseline),
abrir una tarea de limpieza.

### 2. Ejecutar lint SCSS completo

```bash
npm run lint:scss-all
```

Si los errores superan el baseline documentado (30 en 2026-05-27),
investigar qué archivo introdujo la regresión.

### 3. Verificar el bloque T-202 en _variables.scss

Cuando ui-core publique una nueva versión mayor, revisar si hay
variables nuevas que deban integrarse o si alguna fue renombrada.
Referencia: `src/styles/abstracts/_variables.scss` sección T-202.

### 4. Actualizar la allowlist de hex colors

Si se detectan nuevos hex colors en `npm run lint:style`, tokenizarlos
siguiendo el patrón de T-009..T-013 (crear token en sección semántica
apropiada de _variables.scss).

### 5. Documentar el resultado

Registrar en el progreso de la iniciativa con timestamp y contadores:
- Variables totales / muertas
- Errores lint:style
- SCSS entries compilando
