# Analisis de tooling SCSS — `ui-core-5.25.0/package.json`

| Campo | Valor |
|-------|-------|
| Iniciativa | `mapear-y-corregir-scss-completo` |
| Tarea | T-104 (Fase F0a, emergente tras peticion del usuario) |
| Documento | Analisis del `package.json` de ui-core para detectar tooling SCSS adoptable |
| Fecha | 2026-05-21 |
| Origen | Solicitud del usuario tras cerrar T-102 (instalacion de fusv): "antes puedes analizar de nuestra referencia ui-core-5.25.0/package.json existe algo que podemos adoptar que nos ayude con los del scss" |
| Fuente primaria | `/tmp/references/ui-core-5.25.0/package.json` |
| Fuente secundaria | `/tmp/project/template-e-comerce-ui/package.json` |
| Naturaleza | Trabajo analitico puro, no toca codigo. Produce recomendacion priorizada. |

## Por que este analisis

T-101 verifico la licencia (PASA). T-102 instalo `fusv` como
primera dependencia adoptada de ui-core. **Antes de pasar a T-103
(inventario de partials SCSS a portar)**, el usuario pide
inspeccionar el `package.json` de ui-core para detectar **otro
tooling adoptable** que ayude con el procesamiento de SCSS, no
solo el contenido SCSS.

Esta es una distincion importante:

| Aspecto | Trabajado en T-101..T-103 | Trabajado en T-104 (este analisis) |
|---------|---------------------------|-------------------------------------|
| Naturaleza | Contenido SCSS (partials, variables, mixins) | Tooling SCSS (compilacion, lint, watch, test, minificacion) |
| Pregunta | ¿Que del codigo SCSS de ui-core integramos? | ¿Que del proceso de build/test/lint de ui-core integramos? |
| Salida | Tabla por partial | Tabla por herramienta |

Aprovechar el tooling de ui-core es valor ortogonal a aprovechar
su contenido. Las decisiones aqui pueden adoptarse incluso si la
portacion SCSS no avanzara (la portacion seguramente avanzara,
pero la justificacion del tooling es independiente).

## Metodologia

1. Extraer los scripts del `package.json` de ui-core que
   tocan SCSS/CSS directa o indirectamente (compilacion, lint,
   minificacion, postcss, watch, test).
2. Extraer las `devDependencies` que sustentan esos scripts.
3. Comparar contra nuestro `package.json` actual: que ya
   tenemos, que falta.
4. Para cada herramienta nueva: evaluar **adopcion / diferimiento
   / descarte** con justificacion explicita.
5. Producir tabla priorizada con esfuerzo estimado por adopcion.

## Inventario: scripts SCSS de ui-core

| Script | Contenido | Proposito |
|--------|-----------|-----------|
| `css` | `npm-run-all css-compile css-prefix css-minify` | Pipeline completo de build CSS: compilar SCSS, prefijar con autoprefixer, minificar |
| `css-compile` | `sass --style expanded --source-map --embed-sources --no-error-css scss/:dist/css/` | Compila SCSS a CSS con sourcemap embebido y modo expanded |
| `css-lint` | `npm-run-all --aggregate-output --continue-on-error --parallel css-lint-*` | Orquesta TODOS los linters CSS en paralelo, sin detenerse al primer error |
| `css-lint-stylelint` | `stylelint "**/*.{css,scss}" --cache --cache-location .cache/.stylelintcache` | Stylelint con cache |
| `css-lint-vars` | `fusv scss/ docs/assets/scss/` | fusv para variables muertas |
| `css-minify` | `npm-run-all --aggregate-output --parallel css-minify-*` | Orquesta minificacion paralela |
| `css-minify-main` | `cleancss -O1 --format breakWith=lf --with-rebase --source-map --source-map-inline-sources --output dist/css/ --batch ...` | Minificacion con clean-css-cli, batch sobre todos los archivos no-min |
| `css-prefix` | `npm-run-all --aggregate-output --parallel css-prefix-*` | Orquesta autoprefixing paralelo |
| `css-prefix-main` | `postcss --config build/postcss.config.mjs --replace "dist/css/**/*.css" ...` | postcss-cli con config externa, reemplaza in-place |
| `css-test` | `jasmine --config=scss/tests/jasmine.js` | Tests de SCSS con jasmine + sass-true |
| `watch-css-main` | `nodemon --watch scss/ --ext scss --exec "npm-run-all css-lint css-compile css-prefix"` | Watch mode para desarrollo |
| `watch-css-test` | `nodemon --watch scss/ --ext scss,js --exec "npm run css-test"` | Watch de tests SCSS |

## Inventario: dependencias SCSS de ui-core

| Dependencia | Version | Categoria | Proposito |
|-------------|---------|-----------|-----------|
| `autoprefixer` | `^10.5.0` | postcss-plugin | Prefijos vendor automaticos via PostCSS |
| `clean-css-cli` | `^5.6.3` | minificador | Minificador CSS via CLI |
| `find-unused-sass-variables` | `^6.2.0` | linter | Detecta variables SCSS muertas (**YA INSTALADO en T-102**) |
| `nodemon` | `^3.1.14` | watcher | Reinicia comando cuando archivos cambian |
| `npm-run-all` | `^4.1.5` | orquestador | Corre multiples npm scripts en serie o paralelo |
| `postcss` | `^8.5.14` | nucleo | Core de PostCSS (transformacion CSS via AST) |
| `postcss-cli` | `^11.0.1` | cli | CLI para correr PostCSS standalone |
| `postcss-combine-duplicated-selectors` | `^10.0.3` | postcss-plugin | Consolida selectores duplicados |
| `sass-embedded` | `^1.99.0` | compilador | Compilador SASS moderno (Dart Sass embebido, mas rapido que sass JS) |
| `sass-true` | `^10.1.0` | testing | Framework de testing para mixins/funciones SCSS |
| `stylelint` | `^16.26.1` | linter | Linter SCSS/CSS (**ya lo tenemos**, v17.11.1) |
| `stylelint-config-twbs-bootstrap` | `^16.1.0` | config | Reglas stylelint estilo Bootstrap |
| `jasmine` | `^5.13.0` | test runner | Runner usado por sass-true para ejecutar tests SCSS |

## Comparativa: que ya tenemos vs que falta

| Herramienta | ui-core | template-e-comerce-ui | Estado |
|-------------|---------|------------------------|--------|
| stylelint | `^16.26.1` | `^17.11.1` | Tenemos (mas reciente). Comparten ecosistema. |
| stylelint-config | `twbs-bootstrap` | `standard-scss` | Tenemos otra. Decision documentada en alcance vigente. |
| sass | sass-embedded `^1.99.0` | sass `^1.99.0` | Tenemos pero version JS, no embedded. Diferencia: rendimiento. |
| autoprefixer | `^10.5.0` | `^10.5.0` | Tenemos (misma version). Aplicado via webpack en build pipeline. |
| postcss | `^8.5.14` | (transitiva via postcss-loader/scss) | Tenemos transitiva. No directa. |
| postcss-loader | (no aplica) | `^7.3.0` | Tenemos (webpack-specific). |
| postcss-scss | (no aplica) | `^4.0.9` | Tenemos (webpack-specific). |
| `find-unused-sass-variables` | `^6.2.0` | `^6.2.0` | **Tenemos** (instalado en T-102, misma version). |
| `npm-run-all` | `^4.1.5` | NO | **Falta**. |
| `nodemon` | `^3.1.14` | NO | **Falta**. |
| `clean-css-cli` | `^5.6.3` | NO | **Falta**. Minificacion CSS la hace webpack en build prod. |
| `postcss-cli` | `^11.0.1` | NO | **Falta**. PostCSS estandalone para procesamiento offline. |
| `postcss-combine-duplicated-selectors` | `^10.0.3` | NO | **Falta**. |
| `sass-true` | `^10.1.0` | NO | **Falta**. **Testing framework para SCSS, no tenemos tests de SCSS.** |
| `jasmine` | `^5.13.0` | NO | **Falta**. Runner para sass-true. |
| `stylelint --cache` con `.stylelintcache` | si | NO | **Falta**. Cache de stylelint para builds incrementales. |
| Orquestacion paralela de linters | si (`css-lint`) | NO | **Falta**. Nuestros linters corren secuenciales o uno a uno. |

## Analisis por herramienta candidata

Esta es la evaluacion individual de cada herramienta nueva que
ui-core tiene y nosotros no. Por cada una: que hace, beneficio
concreto para nuestro template, costo de adopcion, recomendacion
priorizada.

### 1. `npm-run-all` — adoptar (alta prioridad)

**Que hace**. Ejecuta multiples scripts de npm en secuencia
(`run-s` o `--serial`) o paralelo (`run-p` o `--parallel`) con
opciones avanzadas: `--aggregate-output`, `--continue-on-error`,
`--race`.

**Por que nos sirve**. Nuestros scripts SCSS son secuenciales
implicitamente. Ejemplo concreto: si quisieramos correr en
paralelo `lint:style` + `lint:scss-vars` + `lint:scss-compile`
para reducir tiempo de pre-push, ahora no podemos sin instalar
`npm-run-all` o `concurrently`. Tambien permite definir un
script `lint:scss-all` que orqueste los 3.

**Costo**. Una dependencia adicional (~50 KB). Su API es
estable; ui-core lleva anos usandola.

**Recomendacion**. **Adoptar**. Util incluso si solo lo usamos
para `lint:scss-all` que invoque los 3 linters SCSS en paralelo
con `--continue-on-error --aggregate-output`. Tarea pequena: 15
min de instalacion + redaccion de scripts.

### 2. `stylelint --cache` con `.stylelintcache` — adoptar (alta prioridad, esfuerzo minimo)

**Que hace**. Stylelint persiste un hash por archivo en
`.cache/.stylelintcache`. En la siguiente corrida, solo re-lintea
archivos modificados. Aceleracion brutal en repos grandes.

**Por que nos sirve**. Tenemos 125 archivos SCSS. Cada corrida
de `lint:style` actualmente re-procesa todos. El cache reduce el
tiempo de la 2da corrida en delante a milisegundos.

**Costo**. **Cero**. Solo modificar el script existente:
```diff
- "lint:style": "stylelint \"src/**/*.scss\""
+ "lint:style": "stylelint \"src/**/*.scss\" --cache --cache-location .cache/.stylelintcache"
```

Y anadir `.cache/` al `.gitignore`.

**Recomendacion**. **Adoptar**. Es la mejora con mejor relacion
beneficio/esfuerzo del analisis. Tarea: 5 min.

### 3. `sass-true` — adoptar (prioridad media, alto valor de cara a F4a)

**Que hace**. Framework de testing para SCSS. Permite escribir
tests de mixins, funciones y variables como assertions.

**Por que nos sirve**. **No tenemos tests de SCSS**. Cuando
empecemos la portacion masiva de mixins (F1a) y la integracion
en componentes (F4a), no tendremos forma automatizada de verificar
que un mixin produce el output esperado. Ejemplo concreto:
```scss
@mixin btn-base { padding: $btn-padding-y $btn-padding-x; ... }
```

Con sass-true podemos escribir:
```scss
@include test('btn-base produces correct padding') {
  @include assert {
    @include output { @include btn-base; }
    @include expect { padding: 8px 16px; ... }
  }
}
```

Sin sass-true, la unica forma de verificar es validacion visual.
Validacion visual no escala a 30+ mixins.

**Costo**. Dos dependencias (sass-true + jasmine como runner).
Tiempo de aprendizaje del framework: 30-60 min. Por cada mixin
portado, escribir 5-15 lineas de test. Compatible con nuestro
stack actual: sass-true funciona con sass JS (que ya tenemos),
no requiere sass-embedded.

**Recomendacion**. **Adoptar antes de F1a**. La inversion paga
desde el primer mixin portado porque elimina riesgo de regresion.

**Tarea derivada nueva sugerida**: T-NUEVA-fusv-paralela
"Anadir sass-true como devDependency y crear `scss/tests/`
con primer test placeholder" — ~45 min.

### 4. `sass-embedded` — diferir (prioridad baja)

**Que hace**. Compilador Dart Sass empaquetado como ejecutable
nativo, accesible desde Node via wrapper. Mas rapido que el
paquete `sass` (que es el mismo Dart Sass compilado a JS).

**Por que nos sirve**. Builds mas rapidos. Diferencia practica:
~30% mas rapido en projects grandes.

**Costo**. Sustituir `sass` por `sass-embedded` en
devDependencies. Riesgo: nuestro `sass-loader` de webpack puede
no soportar `sass-embedded` directamente en todas las versiones.
Verificar antes.

**Recomendacion**. **Diferir**. Nuestra suite SCSS no es lo
suficientemente grande para que el 30% sea perceptible. Esfuerzo
de verificar compatibilidad con sass-loader > beneficio.
Reconsiderar despues de F1a cuando el codigo SCSS habra crecido
~3x.

### 5. `nodemon` para watch SCSS — diferir (prioridad baja)

**Que hace**. Re-corre un comando cada vez que cambia un
archivo en directorios observados.

**Por que nos sirve**. ui-core lo usa para watch-css-main
(re-compilar SCSS al cambiar). Nuestro webpack ya tiene watch
mode via `npm run build:watch` y dev server con HMR.

**Costo**. Una dependencia adicional, scripts nuevos.

**Recomendacion**. **Descartar/diferir**. Nuestro webpack
dev-server ya hace lo equivalente. Reconsiderar solo si llega a
existir un pipeline de SCSS independiente del webpack
(distribucion de mixins como libreria, por ejemplo).

### 6. `clean-css-cli` — descartar

**Que hace**. Minificador CSS standalone.

**Por que nos sirve**. ui-core lo usa porque distribuye CSS
en `dist/css/`. Webpack en modo `production` ya minifica
nuestro CSS via `mini-css-extract-plugin` + `css-minimizer-webpack-plugin`
(o el optimizer default).

**Costo**. Dependencia redundante.

**Recomendacion**. **Descartar**. Webpack ya cubre el caso.

### 7. `postcss-cli` — descartar

**Que hace**. CLI para PostCSS standalone (correr autoprefixer
y otros plugins sin webpack).

**Por que nos sirve**. ui-core lo usa porque procesa el CSS
distribuible offline. Nosotros corremos autoprefixer via
`postcss-loader` dentro de webpack.

**Costo**. Redundante.

**Recomendacion**. **Descartar**. Ya tenemos postcss-loader.

### 8. `postcss-combine-duplicated-selectors` — diferir (prioridad muy baja)

**Que hace**. Plugin postcss que consolida selectores
duplicados (`.foo { color: red } .foo { background: blue }`
-> `.foo { color: red; background: blue }`).

**Por que nos sirve**. **Casi nada** porque usamos CSS Modules:
los selectores ya tienen scope local (`.foo` es realmente
`._foo_xyz123`) y casi nunca colisionan.

**Costo**. Una dependencia, configuracion de postcss.

**Recomendacion**. **Descartar**. CSS Modules elimina la
clase de problema que resuelve. Reconsiderar solo si en algun
momento abandonamos CSS Modules (improbable, decision
arquitectonica vigente).

### 9. `stylelint-config-twbs-bootstrap` — adoptar parcialmente (alta prioridad)

**Que hace**. Conjunto de reglas stylelint mantenido por el
equipo Bootstrap. Es el config que ui-core usa.

**Por que nos sirve**. Tenemos `stylelint-config-standard-scss`.
La config de twbs incluye reglas adicionales valiosas:
- `declaration-no-important` activo (por defecto en `standard`
  esta off).
- `function-disallowed-list` para prohibir
  `lighten`/`darken`/etc (funciones SCSS deprecated en
  Dart Sass 3).
- `property-disallowed-list` para reglas a11y.

**Costo**. Cambiar `extends` en `.stylelintrc.json`. Riesgo:
la config nueva puede reportar nuevas violaciones en nuestro
codigo actual (esperable; las resolvemos como deuda incremental).

**Recomendacion**. **No reemplazar config completo**, pero
**copiar las 3 reglas valiosas** a nuestro `.stylelintrc.json`
existente. Cambio quirurgico, menos disruptivo, mismo beneficio.

Las 3 reglas a copiar:
```json
{
  "declaration-no-important": true,
  "function-disallowed-list": ["lighten", "darken", "saturate", "desaturate", "invert", "fade-in", "fade-out", "transparentize", "mix", "fadein", "fadeout"],
  "property-disallowed-list": []
}
```

(El `property-disallowed-list` lo dejamos vacio o lo
poblamos selectivamente en T-NUEVA-de-stylelint).

Esta accion **ya esta en el alcance** como Decision 5
("Decision 5 — Adoptar herramientas y disciplinas de ui-core
en stylelint y linting de variables"). Este analisis la
confirma con justificacion concreta.

### 10. `lockfile-lint` — adoptar (prioridad media-baja, no SCSS pero sano)

**Que hace**. Lintea el lockfile (`package-lock.json`) para
asegurar que todos los paquetes vienen del registry esperado,
con esquemas HTTPS, etc.

**Por que nos sirve**. Defensa contra supply-chain attacks
(paquetes secuestrados, registries hostiles). No es SCSS-
specific pero es buena disciplina general.

**Costo**. Una dependencia, un script nuevo.

**Recomendacion**. **Adoptar**, pero **fuera del scope de esta
iniciativa**. Es trabajo de hardening general. Lo dejo
documentado aqui como hallazgo organico paralelo para una
iniciativa futura de hardening.

### 11. `bundlewatch` — descartar

**Que hace**. Monitorea el tamano de bundles entre commits para
detectar regresiones.

**Por que nos sirve**. Ya tenemos `verify-build` que hace
checks de bundle. No es identico (bundlewatch mide tamano,
verify-build mide URLs en bundle).

**Costo**. Dependencia adicional.

**Recomendacion**. **Descartar de esta iniciativa**. Si
queremos monitoreo de bundle size, es trabajo de otra
iniciativa de performance.

### 12. Patron `--aggregate-output --continue-on-error --parallel` — adoptar (esfuerzo cero adicional una vez se tiene `npm-run-all`)

**Que hace**. Conjunto de flags para `npm-run-all` que:
- `--aggregate-output`: cada script imprime su output en bloque
  al terminar, no entremezclado.
- `--continue-on-error`: corre todos los scripts aunque uno
  falle. Reporta los errores al final.
- `--parallel`: ejecuta en paralelo.

**Por que nos sirve**. Hace los runs de lint y test mas
manejables. Importante: `--continue-on-error` permite que un
desarrollador vea TODOS los errores de SCSS+JS+types juntos en
vez de iterar uno a uno.

**Costo**. Cero (depende solo de tener `npm-run-all`).

**Recomendacion**. **Adoptar** dentro del paquete de adopcion
de `npm-run-all`.

## Hallazgo orgánico: discrepancia de filosofia en versiones

En la comparativa de dependencias, dos discrepancias de version
me llaman la atencion:

| Dep | ui-core | nuestro | Implicacion |
|-----|---------|---------|-------------|
| `eslint` | `^9.39.4` | `^8.57.0` | Ui-core esta en eslint v9 (flat config). Nosotros en v8 (legacy config). Migracion v8 -> v9 es trabajo de mediano esfuerzo. Fuera de scope. |
| `stylelint` | `^16.26.1` | `^17.11.1` | Estamos mas recientes. Bien. |

Ningun ajuste necesario para esta iniciativa. Solo se anota como
contexto.

## Tabla resumen de adopcion priorizada

| # | Herramienta | Accion | Prioridad | Esfuerzo | Cuando |
|---|-------------|--------|-----------|----------|--------|
| 1 | `stylelint --cache` | Adoptar | Alta | 5 min | **Ya** (sin nueva iniciativa, parte de Decision 5 de esta) |
| 2 | `npm-run-all` | Adoptar | Alta | 15 min | F0a, antes de F1a |
| 3 | `stylelint-config-twbs-bootstrap` reglas selectivas (3 reglas) | Adoptar parcial | Alta | 30 min | F0a, ya en Decision 5 |
| 4 | `sass-true` + `jasmine` | Adoptar | Media-alta | 45 min instalacion + ~10 min por mixin testado | **Antes de F1a** (la portacion necesita tests para evitar regresion) |
| 5 | `--aggregate-output --continue-on-error --parallel` | Adoptar | Media | 0 min (con npm-run-all) | Junto con #2 |
| 6 | `lockfile-lint` | Adoptar fuera de scope | Media-baja | 15 min | Iniciativa futura de hardening |
| 7 | `sass-embedded` | Diferir | Baja | 30 min verificacion compat | Reconsiderar despues de F1a |
| 8 | `nodemon` (watch) | Diferir | Baja | — | Solo si SCSS deja de ir por webpack |
| 9 | `clean-css-cli` | Descartar | — | — | Webpack ya minifica |
| 10 | `postcss-cli` | Descartar | — | — | postcss-loader ya cubre |
| 11 | `postcss-combine-duplicated-selectors` | Descartar | — | — | CSS Modules elimina el problema |
| 12 | `bundlewatch` | Descartar | — | — | Otra iniciativa |

## Acciones derivadas para la iniciativa

Estas acciones se integran al replan existente como nuevas tareas
en F0a o en otras fases, sin alterar la disciplina aprobada:

### Tareas nuevas T-105 a T-108 (a anadir en F0a)

| ID nuevo | Accion | Prioridad | Esfuerzo |
|----------|--------|-----------|----------|
| **T-105** | Activar `--cache` en `lint:style` y `lint:style:fix`. Anadir `.cache/` al `.gitignore`. | Alta | 5 min |
| **T-106** | Instalar `npm-run-all` como devDependency. Definir script `lint:scss-all` que corra los 3 linters SCSS en paralelo con `--continue-on-error --aggregate-output`. | Alta | 15 min |
| **T-107** | Anadir las 3 reglas selectivas (`declaration-no-important`, `function-disallowed-list`, `property-disallowed-list`) a `.stylelintrc.json` con `function-disallowed-list` poblado con funciones SCSS deprecated. Esto ya estaba en Decision 5 pero ahora se concreta como tarea. | Alta | 30 min |
| **T-108** | Instalar `sass-true` + `jasmine`. Crear directorio `src/styles/tests/` con primer test placeholder. Anadir script `test:scss`. | Media-alta | 45 min |

### Decisiones documentadas (van al `decisiones-*.md` al cierre)

- **No adoptar** `clean-css-cli`, `postcss-cli`,
  `postcss-combine-duplicated-selectors`, `nodemon`, `bundlewatch`.
  Justificacion: redundancia con webpack o con CSS Modules.
- **Diferir** `sass-embedded` y `lockfile-lint`. Justificacion:
  fuera del scope SCSS o requieren verificacion adicional.

### Impacto en el replan

Antes del analisis T-104:

- F0a tenia 3 tareas (T-101, T-102, T-103) y ~90 min.

Despues del analisis T-104:

- F0a tiene 4 tareas T-101..T-104 (T-104 es este analisis, sin
  toque de codigo) + 4 nuevas T-105..T-108 antes de pasar a T-103
  (inventario de partials).
- Esfuerzo de F0a sube de 90 min a ~190 min.
- T-104 ya esta cerrada al producir este documento.

T-105..T-108 son **ortogonales a T-103**: pueden ejecutarse antes
o despues sin afectar la portacion SCSS. La recomendacion
operativa: **ejecutar T-105 y T-106 inmediatamente** (esfuerzo
total ~20 min, ganancia inmediata de velocidad y orquestacion);
**T-107 y T-108 antes de F1a** (porque tocan stylelint y testing
que afectan la portacion).

## Conclusion ejecutiva

De las **12 herramientas evaluadas** en el `package.json` de
ui-core:

- **4 adoptar** (`stylelint --cache`, `npm-run-all`, 3 reglas
  stylelint, `sass-true`+`jasmine`). Esfuerzo total: ~95 min.
  Beneficio: mejor disciplina de lint, mejor testing de SCSS,
  builds incrementales rapidos.
- **2 diferir** (`sass-embedded`, `lockfile-lint`). Reconsiderar
  despues de F1a o en otra iniciativa.
- **4 descartar** (`clean-css-cli`, `postcss-cli`,
  `postcss-combine-duplicated-selectors`, `nodemon` para SCSS).
  Justificacion: redundancia con webpack o con CSS Modules.
- **2 ya las teniamos** (`stylelint`, `autoprefixer`).

El **valor mayor** del analisis no es la lista de adopciones, es
**el hallazgo de `sass-true`**. Sin testing de SCSS, la portacion
masiva de mixins (F1a) y su integracion en componentes (F4a) son
ejecuciones a ciegas. Con `sass-true`, podemos verificar que cada
mixin portado produce el output esperado, antes de aplicarlo en
componentes.

## Pre-condicion para reanudar T-103

Antes de pasar a T-103 (inventario de partials a portar) y a
F1a (portacion masiva):

- T-104 cerrada con este analisis (este documento).
- T-105, T-106 idealmente ejecutadas (mejoran experiencia de
  desarrollo desde ya).
- T-107 ejecutada (formaliza disciplina de stylelint que la
  iniciativa requiere).
- T-108 ejecutada (instala testing framework para SCSS que F1a
  necesitara).

## Que sigue

1. Cerrar T-104 (este documento es su salida).
2. Decidir orden de ejecucion: ¿T-105..T-108 inmediatamente o
   T-103 inmediatamente?
3. Recomendacion: **T-105, T-106, T-107, T-108 antes de T-103**,
   porque T-103 produce inventario para portacion, y la portacion
   se beneficia de tener cache de stylelint, orquestacion
   paralela, reglas mas estrictas y testing framework ya
   operativos. T-103 no toca codigo y se beneficia poco del
   tooling.
