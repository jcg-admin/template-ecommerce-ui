# Analisis del trade-off: Service Worker en public/

| Campo | Valor |
|-------|-------|
| Iniciativa | revisar-arquitectura-de-mocks |
| Documento anexo a | `analisis-revisar-arquitectura-de-mocks.md` |
| Fecha | 2026-05-21 |

Este documento existe porque el analisis principal cerro la
recomendacion "MSW + Faker" mencionando como trade-off aceptado que
"MSW deja un Service Worker en `public/` que el adoptante debe
excluir del build de produccion o aceptar como artefacto inerte".

El usuario solicito profundizar ese punto antes de aprobar la
recomendacion. Aqui se hace.

## El terreno real del template

Antes de analizar el trade-off, conviene precisar como el template
maneja archivos estaticos hoy. El analisis general asumio una
situacion generica de proyecto Webpack; el template tiene
particularidades que cambian las conclusiones.

### Hechos verificados sobre `webpack.config.js`

- `output.path`: `dist/`. Con `clean: true` (borra `dist/` antes de
  cada build).
- `output.publicPath`: `'/'`.
- `HtmlWebpackPlugin` toma `./public/index.html` como template y
  produce `dist/index.html` con los hashes del bundle inyectados.
- **No hay `copy-webpack-plugin`** en la configuracion.
- `devServer.static.directory` apunta a `public/` para servir
  archivos estaticos en desarrollo.
- `devServer.watchFiles.paths` incluye `public/**/*` para que cambios
  en archivos de `public/` provoquen reload.

### Que llega realmente a `dist/`

Tras `npm run build`, `ls dist/ | grep -v chunk/map/css` produce
**un solo archivo no-codigo**: `index.html`. Los chunks JS y CSS son
generados por Webpack desde `src/`; los archivos estaticos de
`public/` (otros que el template HTML) **no se copian**.

### Implicacion directa

El comportamiento por defecto de `npx msw init public/` deposita el
worker en `public/mockServiceWorker.js`. En el template, ese archivo
**no llegaria a `dist/` con la configuracion actual**. El trade-off
descrito en el analisis principal **no aplica tal como esta
formulado**.

Se reformula correctamente abajo.

## Las cuatro preocupaciones reales

Disuelto el trade-off original, quedan cuatro preocupaciones legitimas
sobre meter MSW en el template. Las trato una por una.

### Preocupacion 1 — Archivo generado vs codigo fuente

`mockServiceWorker.js` es codigo **generado por la CLI de MSW**, no
escrito a mano. Hay dos escuelas:

(a) **Commitear** el archivo en `public/`. MSW lo recomienda
   explicitamente: *"It is recommended you commit the
   mockServiceWorker.js worker script in Git. This way, everyone
   working on the project can get MSW up and running without
   having to run any additional commands."*

(b) **No commitear** y generar en cada install. Soportado via
   `package.json` con:
   ```json
   "msw": {
     "workerDirectory": "public"
   }
   ```
   MSW regenera el archivo automaticamente en cada `npm install`.

Para un template que se clona y se adapta, **(a) es mas amable**.
El adoptante no tiene que entender el truco del `workerDirectory` ni
recordar correr `npx msw init` la primera vez. Cuesta ~10KB
commiteados (el script real pesa menos en 2026; verificable tras la
instalacion).

**Riesgo de (a)**: cuando MSW se actualiza con una version mayor, el
script commiteado queda obsoleto. Mitigacion: configurar
`workerDirectory` igualmente; MSW lo regenera en cada install y un
`git diff` despues de `npm install` revela cualquier discrepancia.

### Preocupacion 2 — Ruido en `public/`

Hoy `public/` contiene **solo** `index.html`. Anadir
`mockServiceWorker.js` lo lleva a dos archivos. No es ruido
significativo. Si la convencion del template fuera "todo en `src/`",
seria distinto; pero como el template ya usa `public/` para el HTML
de entrada, anadir un segundo archivo del mismo tipo (estatico,
servido en runtime) es coherente.

### Preocupacion 3 — Riesgo de que el worker termine en produccion

Esta era la preocupacion central del trade-off original. En el
template **no existe** con la configuracion actual de Webpack porque
`public/` no se copia a `dist/`. Pero conviene desambiguar:

- **Si en algun momento alguien anade `copy-webpack-plugin`** para
  servir favicons u otros assets, copiaria tambien
  `mockServiceWorker.js`. Eso seria un problema real si el bundle
  intentara registrar el worker en produccion.
- **Pero**: `worker.start()` solo se llama desde
  `src/index.jsx` con guard `if (process.env.NODE_ENV === 'development')`.
  Aun copiandose el archivo, el navegador no lo registra en
  produccion.
- El archivo, por si solo, sin el codigo que lo registra, es **404
  cuando nadie lo pide**. Inerte.

Conclusion: el riesgo es **doble guarded** (no se copia + no se
registra). Ambas defensas tendrian que romperse a la vez para causar
dano.

Esta defensa-en-profundidad debe quedar **documentada** en la
configuracion de Webpack para que un futuro mantenedor que anada
`copy-webpack-plugin` sepa que debe excluir explicitamente el worker
de la copia a `dist/`.

### Preocupacion 4 — Compatibilidad con el `verify-build.mjs`

El script de verificacion del build introducido en T-020 de la
iniciativa cerrada inspecciona `dist/main.*.js` buscando URLs
http(s). El worker de MSW **no esta en `dist/`**, asi que no afecta a
`verify-build`.

Pero si en algun momento alguien lo copiara, el worker contiene
referencias a URLs internas de MSW (no del backend del template). El
filtro de ruido de `verify-build.mjs` (`react.dev`, `github`, `w3`,
`cdns`) no incluye `mswjs.io`. Si MSW deposita URLs propias en el
worker, podrian aparecer en el listado. **No causaria fail**, solo
ruido visual.

Mitigacion (cuando aplique): anadir `mswjs.io` al patron NOISE_PATTERNS
de `verify-build.mjs`. Costo: una linea.

## Comparacion con alternativas

Para que el trade-off quede contextualizado, vale la pena comparar
con lo que harian otras alternativas:

| Alternativa | Artefacto en `public/`? | Riesgo equivalente |
|-------------|-------------------------|--------------------|
| Mantener interceptor | No | (otro: codigo de prod mezclado con mock) |
| MSW | Si (`mockServiceWorker.js`, ~10KB) | Bajo, doble guarded en este template |
| json-server | No | (otro: dos procesos requeridos) |
| Prism | No | (otro: OpenAPI inexistente) |
| MirageJS | No | (otro: tecnologia en declive) |

Ninguna alternativa esta libre de trade-offs. La pregunta no es "MSW
tiene un trade-off?" sino "¿el trade-off de MSW es menor que el de
las alternativas?". La respuesta es si.

## Plan de mitigacion concreto

Cuando se ejecute la iniciativa, las tareas que tocan este trade-off
seran:

### Mitigacion 1 — Commitear el worker con configuracion explicita

```json
// package.json
"msw": {
  "workerDirectory": "public"
}
```

Esto activa la regeneracion automatica del worker en cada
`npm install` y al mismo tiempo permite que el archivo se commitee
(la primera generacion va a Git; las regeneraciones aparecen como
diffs durante upgrades de MSW que el mantenedor revisa).

### Mitigacion 2 — Documentar la guard en webpack.config.js

Anadir comentario explicito cerca del bloque `HtmlWebpackPlugin`:

```js
// NOTA: public/mockServiceWorker.js NO se copia a dist/.
// La configuracion actual solo procesa public/index.html via
// HtmlWebpackPlugin. Si en el futuro se anade copy-webpack-plugin
// para servir favicons u otros assets, excluir explicitamente
// public/mockServiceWorker.js de la copia.
```

### Mitigacion 3 — Guard explicita en src/index.jsx

```jsx
if (process.env.NODE_ENV === 'development') {
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass', // requests no mockeadas pasan
  });
}
```

El guard `NODE_ENV === 'development'` asegura que aun si el worker
estuviera en dist (no es el caso), no se registraria.

### Mitigacion 4 — Documentar en vista de despliegue

Anadir en `docs/vista-de-despliegue/vista-de-despliegue.md` una nota
breve:

> Mock Service Worker (MSW) deposita `mockServiceWorker.js` en
> `public/` solo para desarrollo. La configuracion de Webpack del
> template **no copia** ese archivo a `dist/`, por lo que el bundle
> de produccion no contiene el worker. Si una adaptacion del template
> anade `copy-webpack-plugin`, debe excluir explicitamente este
> archivo.

### Mitigacion 5 — Considerar carpeta alternativa fuera de `public/`

MSW acepta cualquier directorio para `msw init`. En vez de
`public/`, se podria usar `src/mocks/worker/`:

```
npx msw init ./src/mocks/worker --save
```

Y servirlo via `devServer.static` con un mapping explicito. Esto
**aisla** el worker en el subarbol de mocks, dejando `public/` solo
para HTML de entrada.

Trade-off de esta opcion: rompe la convencion de MSW. La mayoria de
ejemplos de la comunidad asumen `public/`. Si el adoptante busca
ayuda en Stack Overflow, encontrara guias que asumen `public/`.

**Recomendacion**: mantener `public/`. Es la convencion. El template
no gana nada significativo aislando el worker fuera.

## Veredicto

El trade-off "MSW deja un Service Worker en `public/`" tal como
estaba formulado en el analisis principal **esta sobredimensionado**
para el caso concreto de este template:

- El archivo no llega a produccion por defecto (no hay
  `copy-webpack-plugin`).
- El registro del worker esta guarded por `NODE_ENV` desde el
  codigo cliente.
- El archivo en si es inerte sin codigo que lo registre.
- El archivo se puede commitear o regenerar automaticamente, ambas
  opciones son robustas.

Las cuatro mitigaciones documentadas arriba **son baratas**: ninguna
introduce dependencias nuevas, ninguna anade complejidad significativa,
ninguna obliga a documentacion extensa mas alla de una nota corta en
varios archivos.

El trade-off original se sostiene como "consideracion menor que se
gestiona con documentacion + guards", no como "razon para
reconsiderar la eleccion de MSW".

## Decision a aprobar

Tras este analisis, la pregunta es: **¿el trade-off del Service
Worker en `public/` es aceptable bajo el plan de mitigacion
descrito?**

Si la respuesta es si, la recomendacion MSW + Faker del analisis
general queda confirmada y se puede pasar a `plan-*.md`.

Si la respuesta es no, las opciones son:

- Adoptar la Mitigacion 5 (worker fuera de `public/`) con su
  trade-off de romper convencion.
- Reconsiderar la recomendacion principal: volver a la alternativa
  "mantener interceptor actual" aceptando su trade-off distinto
  (acoplamiento de produccion con mock).
- Profundizar otro punto especifico antes de decidir.
