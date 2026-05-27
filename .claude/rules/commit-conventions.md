---
artefacto: RULE-COMMIT-CONV-001
tipo: Regla
dominio: normativa
subdominio: vcs/commits
estado: Aprobado
version: 1.0.0
fecha_creacion: 2026-05-27T15:27:49
fecha_actualizacion: 2026-05-27T15:27:49
autor: NestorMonroy
clasificacion: Interno
repos: template-ecommerce-ui, template-ecommerce-server
---

# Convenciones de Commits

> Formato Tim Pope obligatorio en ambos repositorios.
> Referenciado desde PROC-GESTION-TUI-001 Fase 4 Paso 7.

---

## Formato

```
<subject>

<body>
```

---

## Subject (primera linea)

| Regla | Detalle |
|-------|---------|
| Longitud | <= 50 caracteres |
| Modo verbal | Imperativo presente ("Add", "Fix", "Remove", "Update") |
| Capitalizacion | Primera letra mayuscula |
| Punto final | Prohibido |
| Referencia a tarea | Incluir al final cuando aplica |

**Referencia a tarea**: cuando el commit ejecuta una tarea especifica
del plan, agregar la referencia al final del subject:

```
Fix catalog.ts paths to /api/v1/catalogue/ (T-101)
```

Si el commit agrupa varias tareas de la misma fase (cierre de fase),
listarlas en el body, no en el subject.

---

## Body (separado por linea en blanco)

| Regla | Detalle |
|-------|---------|
| Separacion | Linea en blanco entre subject y body |
| Longitud de linea | <= 72 caracteres (wrap obligatorio) |
| Contenido | QUE cambio y POR QUE; nunca solo COMO |
| Obligatoriedad | Obligatorio salvo commits triviales (docs de una linea) |

---

## Ejemplos

### Correcto

```
Add brazalete palette to _variables.scss (T-102)

_variables.scss usaba hex hardcodeados sin semantica.
La paleta del brazalete define tokens con nombre que
permiten consistencia entre temas y facilitan el modo
oscuro sin busqueda manual de colores.
```

```
Fix catalog.ts paths to /api/v1/catalogue/ (T-101)

MSW handlers intercepted /api/products/* but catalogSlice.js
(comment: Sprint 5 URLs corregidas a /api/v1/catalogue/*)
calls /api/v1/catalogue/*. No catalog data was shown even
with MSW active.
```

```
Close initiative auditar-integracion-catalogo (F5)

All 7 findings resolved. See decisiones-*.md for details.
  A-07 FIXED: all_categories[] filter, 14/14 categories pass
  A-02 FIXED: search handler returns all results, next=null
  A-06 FIXED: as const removed, mutable arrays
```

### Incorrecto (prohibido)

```
T-102: actualizo variables         <- no imperativo, no informativo
```
```
fix stuff                          <- no capitalizado, sin contexto
```
```
Added the brazalete color palette to the variables scss file.  <- >50 chars, pasado
```

---

## Push desde la distro

La distro tiene Node 18.19.1. El pre-push hook de husky ejecuta
stylelint que requiere Node 20+. Siempre usar `--no-verify`:

```bash
git push --no-verify origin main
```

---

## Verificacion del subject

```bash
# Contar caracteres del subject antes de commitear
echo -n "Fix catalog.ts paths to /api/v1/catalogue/ (T-101)" | wc -c
# Debe ser <= 50
```
