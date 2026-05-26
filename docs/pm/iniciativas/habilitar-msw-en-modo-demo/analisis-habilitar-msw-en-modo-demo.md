# Analisis: Habilitar MSW en modo demo

| Campo | Valor |
|-------|-------|
| Iniciativa | habilitar-msw-en-modo-demo |
| Fecha de creacion | 2026-05-26T00:25:12 |

## Diagnostico: por que no carga nada

### Traza de ejecucion en produccion (sin DEMO_MODE)

```
npm run build
  -> webpack mode=production
  -> DefinePlugin: process.env.NODE_ENV = 'production'
  -> HtmlWebpackPlugin: copia public/index.html -> dist/index.html
  -> (no hay copy-webpack-plugin: public/mockServiceWorker.js NO se copia)
  -> dist/ producido

Nginx sirve dist/index.html
  -> Browser carga main.[hash].js
  -> src/index.jsx ejecuta startApp()
  -> if (process.env.NODE_ENV !== 'production') // FALSE en produccion
       -> bloque MSW NO ejecuta
  -> root.render(<App />) arranca sin MSW activo

App hace fetch('/api/v1/products/')
  -> No hay Service Worker registrado
  -> Request sale al servidor real
  -> Nginx: /api/* -> proxy_pass API_UPSTREAM (vacio) -> 502 Bad Gateway
  -> App recibe error, no muestra datos
```

### Por que MSW no puede arrancar aunque se quitara el guard

Incluso si se eliminara el guard de `NODE_ENV`, MSW fallaria:

```
worker.start()
  -> Browser intenta registrar Service Worker en /mockServiceWorker.js
  -> GET /mockServiceWorker.js -> 404 (no existe en dist/)
  -> worker.start() rechaza con error
  -> App arranca sin MSW
```

Ambas condiciones deben resolverse juntas: copiar el archivo Y
permitir el arranque del worker.

## Alternativas evaluadas

### Alternativa A — Variable `DEMO_MODE=true` (elegida)

Agrega una tercera condicion al guard de `src/index.jsx`:

```js
if (process.env.NODE_ENV !== 'production' || process.env.DEMO_MODE === 'true') {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
}
```

Y en `webpack.config.js` usa `copy-webpack-plugin` condicionalmente:

```js
// Solo cuando DEMO_MODE=true
isDemoMode && new CopyPlugin({
    patterns: [{ from: 'public/mockServiceWorker.js', to: 'mockServiceWorker.js' }]
}),
```

Build para demo: `DEMO_MODE=true npm run build`
Build de produccion real: `npm run build` (sin cambios)

**Ventajas**: completamente opt-in. Un build de produccion sin
`DEMO_MODE` no cambia en absoluto. El `dist/` de produccion no
incluye `mockServiceWorker.js`.

**Desventajas**: el adoptante del template debe conocer este flag.
Se documenta en `README.md`.

### Alternativa B — Copiar siempre `mockServiceWorker.js` a `dist/`

Agregar `copy-webpack-plugin` sin condicion. El service worker
estaria en `dist/` siempre, pero el guard de `NODE_ENV` impediria
que MSW lo registrara en un build de produccion normal.

**Ventaja**: mas simple — no hay nueva variable de entorno.

**Desventaja**: expone `mockServiceWorker.js` en produccion, un
archivo de 9KB que el navegador de produccion jamas usara. Aunque
inocuo funcionalmente, es ruido en el `dist/` de produccion y puede
confundir a auditores de seguridad.

**Descartada**: la variable `DEMO_MODE` es solo 1 linea adicional
y evita el ruido en produccion.

### Alternativa C — Usar `npm run dev` para demostraciones

Documentar que el modo demo requiere `npm run dev` y no `npm run
build`.

**Ventaja**: cero cambios de codigo.

**Desventaja**: `npm run dev` requiere que el evaluador tenga Node
instalado, clone el repo y ejecute el servidor de desarrollo. El
caso de uso de demostrar el template con el `dist/` ya compilado
(el que el server sirve) no queda cubierto.

**Descartada**: el caso de uso que motiva la iniciativa (ver la app
funcionando sobre el `dist/` servido por Nginx) no se resuelve.

## Decision

**Alternativa A**: variable `DEMO_MODE=true` con `copy-webpack-plugin`
condicional.

## Inventario de archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `webpack.config.js` | Leer `DEMO_MODE` del entorno; agregar `copy-webpack-plugin` condicional |
| `src/index.jsx` | Guard extendido: `NODE_ENV !== 'production' \|\| DEMO_MODE === 'true'` |
| `package.json` | Agregar script `build:demo` como alias de `DEMO_MODE=true npm run build` |
| `README.md` | Documentar modo demo: `npm run build:demo` |
| `docs/vista-de-despliegue/vista-de-despliegue.md` | Agregar fila "Build demo" en tabla de configuracion por entorno |

## Riesgos identificados

| ID | Riesgo | Mitigacion |
|----|--------|------------|
| R-1 | `copy-webpack-plugin` no esta en las dependencias actuales | Verificar antes de T-101; instalar con `npm install --save-dev copy-webpack-plugin` si es necesario |
| R-2 | El guard extendido en `src/index.jsx` se activa accidentalmente en produccion si `DEMO_MODE` queda en `.env.production` | Documentar que `DEMO_MODE` es una variable de build, no de produccion; el `.env.production.example` no debe incluirla |
| R-3 | Node 18.19.1 en la distro no puede ejecutar `npm test` (EBADENGINE) | Tests se verifican con Node >= 20 en el entorno de CI o maquina Windows |
