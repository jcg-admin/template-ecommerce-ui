# Prompt para retomar la iniciativa `mapear-y-corregir-scss-completo`

Pegar este texto al inicio de una sesion nueva de Claude. Esta
escrito para que Claude pueda retomar el trabajo sin re-explicar
nada y sin cometer los errores de continuidad que han ocurrido
en sesiones previas (asumir HEAD incorrecto, producir
documentos duplicados, pedir confirmaciones triviales).

---

## INICIO DEL PROMPT (copiar desde aqui hacia abajo)

Eres un asistente que continua trabajo en curso en un repositorio
git. **Antes de hacer cualquier cosa, lee este prompt completo y
luego ejecuta las verificaciones de la seccion "VERIFICACIONES
OBLIGATORIAS DE ARRANQUE" sin omitir ninguna**.

## CONTEXTO DEL PROYECTO

- **Repo**: `/tmp/project/template-e-comerce-ui/`
- **Tipo**: template SCSS de e-commerce con React + CSS Modules
- **Procedimiento de gestion**: PROC-GESTION-001 v4.0.0 + arc42
- **Convencion de commits**: Tim Pope (subject <=50 chars, wrap
  body a 72 chars)
- **Autor**: Nestor Monroy
- **Idioma**: castellano sin tildes en codigo y mensajes git;
  con tildes en prosa de documentos

## REGLAS OPERATIVAS

Aplicar siempre, especialmente cuando estes dudando:

1. **Avanza con TODAS las tareas en secuencia, una por commit,
   sin pedir confirmacion**. Solo pausar para ambiguedades
   reales de scope o decisiones arquitectonicas grandes; nunca
   para confirmar tareas mecanicas o decisiones menores.

2. **Si dudas, analiza, documenta y toma SIEMPRE LA MEJOR
   DECISION**. Documentar la decision tomada en
   `progreso-*.md` como `Hallazgo durante la ejecucion` con
   la justificacion. No pausar para que el usuario decida.

3. **Tests con delta cero o mejora respecto al baseline**.
   Baseline actual: ver seccion "ESTADO VERIFICABLE" abajo.
   Cualquier commit que reduzca passing o incremente failing
   es regresion; revertir. Anadir tests passing es mejora
   aceptada que actualiza el baseline.

4. **Hallazgos organicos paralelos se registran pero NO
   bloquean**. Si descubres deuda no relacionada a la tarea
   actual, anotala en `progreso-*.md` como hallazgo y sigue.
   Iniciativa propia futura.

## VERIFICACIONES OBLIGATORIAS DE ARRANQUE

**Ejecutar las 7 verificaciones siguientes en orden antes de
tocar nada**. Si alguna falla o devuelve resultado inesperado,
parar y reportar al usuario.

### V1: HEAD real del repo

```bash
cd /tmp/project/template-e-comerce-ui
git log --oneline -5
```

**Esperado a la fecha del backup mas reciente** (2026-05-21
19:39 UTC):

    786b84c Analyse variables collisions before T-202 port
    ad560d6 Analyse T-202 before executing (F1a)
    0d3ac5f Port ui-core SCSS functions (T-201, F1a)
    cda3f4f Inventory ui-core partials and close F0a (T-103)
    c7dec38 Install sass-true SCSS testing (T-108, F0a)

Si HEAD es posterior a `786b84c`, la sesion previa avanzo;
**lee los commits nuevos** con `git show <hash>` para
entender que se hizo antes de continuar. Esto evita el error
recurrente de producir documentos duplicados (paso con T-104
y con T-202).

### V2: Working tree limpio

```bash
git status -s
```

Si **NO** esta limpio, hay trabajo a medio terminar de la
sesion previa. Revisar archivos pendientes con `git diff` antes
de decidir.

### V3: Baseline de tests

```bash
npm test --silent 2>&1 | grep "Tests:" | head -1
```

Baseline minimo aceptable (puede ser mayor si T-202 anadio
mas tests): `Tests: 2 failed, 813 passed, 815 total`.

Los 2 failed son **deuda heredada** de la iniciativa cerrada
`revisar-arquitectura-de-mocks` (CatalogPage badge Destacado).
**NO** intentar arreglarlos en esta iniciativa.

### V4: Build verde

```bash
npm run verify-build 2>&1 | tail -3
```

Esperado: `verify-build: OK ningun criterio fallo.`

### V5: Lint SCSS limpio

```bash
rm -rf .cache && npm run lint:style 2>&1 | tail -3
npm run lint:scss-compile 2>&1 | tail -3
```

Esperados: `lint:style` 0 errores; `lint:scss-compile` "102
SCSS entries compiled clean".

### V6: Estado de la iniciativa SCSS

```bash
cat docs/pm/iniciativas/mapear-y-corregir-scss-completo/index.md
ls docs/pm/iniciativas/mapear-y-corregir-scss-completo/
```

Confirma que existen 12 documentos:
  - alcance-mapear-y-corregir-scss-completo.md
  - analisis-T-202.md
  - analisis-inspiracion-ui-core-5.25.0.md
  - analisis-mapear-y-corregir-scss-completo.md
  - analisis-t-202-integracion-variables.md
  - analisis-tooling-scss-ui-core.md
  - index.md
  - inventario-partials-ui-core.md
  - plan-mapear-y-corregir-scss-completo.md
  - progreso-mapear-y-corregir-scss-completo.md
  - replan-mapear-y-corregir-scss-completo.md
  - tareas-mapear-y-corregir-scss-completo.md

### V7: Referencias externas

```bash
ls /tmp/references/ui-core-5.25.0/scss/ | head -5
cat /tmp/references/ui-core-5.25.0/LICENSE | head -3
```

Esperado: directorio existe; LICENSE indica MIT.

Si el directorio `/tmp/references/ui-core-5.25.0/` **no
existe** (probable tras reinicio de entorno), clonarlo:

```bash
mkdir -p /tmp/references
cd /tmp/references
git clone --depth 1 https://github.com/NestorMonroy/ui-core-5.25.0.git
```

## ESTADO DE LA INICIATIVA

**Iniciativa activa**: `mapear-y-corregir-scss-completo`
**Estado**: En ejecucion
**Fase activa**: F1a (portacion de capa abstracta)

### Fases cerradas

- **F0** (cerrada en `dfb1163`): T-001 (diagnostico
  `_animations.scss`), T-002 (categorizacion `!important`).
  Acciones derivadas pendientes de aplicar al cerrar F1.

- **F0a** (cerrada en `cda3f4f`): 8 tareas:
  - T-101 verificar licencia ui-core (MIT verificado).
  - T-102 instalar fusv (find-unused-sass-variables).
  - T-103 inventario de partials (62 a portar, ~700 a diferir).
  - T-104 analisis tooling ui-core package.json.
  - T-105 stylelint cache (53% speedup).
  - T-106 npm-run-all orquestador.
  - T-107 3 reglas selectivas stylelint + 14 disables.
  - T-108 sass-true testing.

### F1a en ejecucion

- **T-201** (commiteado en `0d3ac5f`): 13 funciones SCSS de
  ui-core portadas a `src/styles/abstracts/functions/` + 21
  tests sass-true que pasan + 7 variables anticipadas en
  `_variables.scss`.

- **T-202** (analizada, NO ejecutada todavia): integracion
  masiva del `_variables.scss` de ui-core. **PROXIMA TAREA
  A EJECUTAR**. Dos analisis previos existen:
  - `analisis-t-202-integracion-variables.md` (750 lineas,
    commit `ad560d6`, sesion previa, plan paso a paso de
    8 pasos).
  - `analisis-T-202.md` (606 lineas, commit `786b84c`, esta
    sesion, 10 reglas operativas + 5 grupos de divergencias).
  Hay duplicado: **fusionarlos** es sub-tarea pendiente
  antes de ejecutar T-202.

- T-203..T-209: pendientes despues de T-202.

### Tareas pendientes en F1a

1. **(sub-tarea) Fusionar los 2 analisis de T-202** en un
   solo documento autoritativo. Mezclar lo mejor de cada
   uno: plan paso a paso (del preexistente) + reglas
   operativas y grupos (del nuevo). ~30 min.
2. **T-202** integrar `_variables.scss` de ui-core en el
   nuestro siguiendo el analisis fusionado. ~180 min
   estimados.
3. T-203 portar `_variables-dark.scss` (inerte, preparacion
   dark mode futuro). ~30 min.
4. T-204 portar `_maps.scss`. ~45 min.
5. T-205 portar ~22 mixins de ui-core. ~120 min.
6. T-206 consolidar `visually-hidden`. ~15 min.
7. T-207 consolidar `focus-ring` con
   `_focus-indicators.scss`. ~30 min.
8. T-208 `_root.scss` selectivo con `--ec-`
   (~30-50 properties, no 130). ~90 min.
9. T-209 portar componentes como mixins parametrizados.
   ~180 min.

**Esfuerzo restante F1a**: ~690 min (~11.5 h) sin contar
fusion del analisis duplicado.

## DECISIONES APROBADAS (no re-preguntar)

| ID | Decision |
|----|----------|
| D-MODO | Modo B: portar SCSS de ui-core como mixins, NO como clases globales. Preserva CSS Modules. |
| D-PREFIJO | Prefijo CSS custom property: `--ec-` (de e-comerce). |
| D-COREUI-BUNDLES | Bundles `coreui-*.scss` y `.rtl.scss` no se portan. |
| Decision 1' | No eliminar variables/mixins muertos; integrar siguiendo ui-core o marcar con `// fusv-disable`. |
| Decision 2 | Allowlist real via comentario inline con razon despues de `--`. |
| Decision 3 | Validacion visual confiada para tokenizaciones 1:1. |
| Decision 4' | ADR `dec-tokens-via-sass-y-cssvars-selectivos` con `--ec-`. T-208 expone ~30-50 properties, no 130. |
| Decision 5 | Adoptar fusv + activar `declaration-no-important` + patron `// scss-docs-start NAME` + 3 reglas stylelint selectivas. |
| Decision 6 | `!default` en todas las variables (~223 afectadas). T-202 lo aplica masivo. |

## CONFIGURACION DE REMOTE GIT

```
origin  https://github.com/jcg-admin/template-e-comerce-ui.git
```

Configurado pero **sin push hasta el momento**. Repo remoto
vacio en GitHub. Para pushear cuando convenga:

```bash
git push -u origin main
```

## BACKUPS DISPONIBLES

En `/tmp/backups/` existen multiples backups del proyecto. El
mas reciente al producir este prompt:

- `template-e-comerce-ui-20260521-193954-source.tar.gz` (5.5 MB)
- `template-e-comerce-ui-20260521-193954-source.tar.gz.md5`
- `template-e-comerce-ui-20260521-193954-manifest.txt`

Captura HEAD `786b84c`, 127 commits, working tree CLEAN.

Si `/tmp/` se vacio entre sesiones, el backup NO esta
disponible localmente; el usuario debe haberlo conservado
externamente.

## ERRORES DE CONTINUIDAD A EVITAR

Patrones de error que han ocurrido en sesiones previas:

1. **Asumir HEAD del resumen sin verificar**. La V1 de este
   prompt lo evita.
2. **Producir documentos duplicados** porque sesiones previas
   ya los crearon (paso con T-104 y con T-202). **Verificar
   con `git log --all --oneline -- <ruta>`** antes de crear
   cualquier documento de PM.
3. **Pedir confirmaciones triviales**. La regla 1 lo evita;
   solo pausar para ambiguedades arquitectonicas reales.
4. **No leer suficiente contexto antes de actuar**. Tras V1-V7,
   leer al menos:
   - `docs/pm/iniciativas/mapear-y-corregir-scss-completo/index.md`
   - Ultimo evento de `progreso-*.md` (`tail -50`)
   - Documento mas reciente segun la tarea proxima.
5. **Olvidar el patron de commit Tim Pope**. Subject <=50
   chars, wrap a 72 en body. Si el commit excede 50, hacer
   `git commit --amend` con subject mas corto.

## QUE HACER AHORA

Tras V1-V7 verdes, **el siguiente paso natural es**:

A) Fusionar los 2 analisis de T-202 en un solo documento
   autoritativo. Esto desbloquea T-202 limpio.

B) Si el usuario explicitamente pide saltar la fusion,
   ejecutar T-202 usando uno de los dos analisis como guia
   (el preexistente `analisis-t-202-integracion-variables.md`
   tiene el plan paso a paso mas operativo).

**Si el usuario solo dice "continua" o equivalente, aplicar
opcion A**. Es lo coherente con el ultimo turno de la sesion
previa que cerraba con esta sub-tarea declarada.

## FIN DEL PROMPT
