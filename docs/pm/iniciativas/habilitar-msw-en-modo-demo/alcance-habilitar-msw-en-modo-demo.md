# Alcance: Habilitar MSW en modo demo

| Campo | Valor |
|-------|-------|
| Iniciativa | habilitar-msw-en-modo-demo |
| Estado | En ejecucion |
| Version | 1.0.0 |
| Fecha de creacion | 2026-05-26T00:25:12 |
| Iniciativa origen | (raiz) |

## Por que existe esta iniciativa

El `dist/` compilado con `npm run build` y servido via Nginx no
muestra datos. El operador ve la app cargada pero sin productos,
sin categorias, sin carrito. No hay error visible — la app arranca
pero todas las llamadas a `/api/v1/...` no tienen quien las
intercepte.

La causa: dos decisiones correctas individualmente que combinadas
producen este comportamiento:

1. `src/index.jsx` solo arranca MSW si `NODE_ENV !== 'production'`.
   Correcto: no se quiere MSW en produccion real.
2. Webpack no copia `public/mockServiceWorker.js` a `dist/`.
   Correcto en el sentido de que en produccion real el service
   worker no debe existir.

El resultado: nadie que clone el template y haga `npm run build` +
sirva el `dist/` puede ver la app funcionando sin un backend real.
El modo de demostracion — el caso de uso mas natural al evaluar un
template — no funciona.

## Que esta dentro del alcance

1. Agregar `DEMO_MODE=true` como variable de entorno que activa
   MSW sobre el bundle compilado.

2. Copiar `public/mockServiceWorker.js` a `dist/` cuando
   `DEMO_MODE=true` mediante `copy-webpack-plugin`.

3. Actualizar `src/index.jsx` para arrancar MSW tambien cuando
   `process.env.DEMO_MODE === 'true'`, ademas del guard de
   `NODE_ENV`.

4. Documentar en `README.md` el comando de build para modo demo:
   `DEMO_MODE=true npm run build`.

5. Actualizar `docs/vista-de-despliegue/` con el nuevo modo.

6. Actualizar `docs/decisiones-de-arquitectura/` si el analisis
   concluye que la decision `dec-mocks-via-msw-service-worker`
   necesita una nota de extension (no supersede).

## Criterio de completitud

1. `DEMO_MODE=true npm run build` produce un `dist/` con
   `mockServiceWorker.js` incluido.
2. Ese `dist/` servido via Nginx muestra el catalogo de productos,
   categorias y carrito con datos de mock.
3. `npm run build` sin `DEMO_MODE` no cambia — `mockServiceWorker.js`
   no se copia.
4. `npm run dev` no cambia — MSW sigue arrancando por `NODE_ENV`.
5. `npm test` sin regresiones.
6. `README.md` documenta el modo demo.

## Fuera de alcance

| Item | Razon |
|------|-------|
| Cambiar el guard `NODE_ENV` en produccion real | El comportamiento de produccion sin `DEMO_MODE` no cambia |
| Validar el contrato de los mocks vs backend real | Es la iniciativa `validar-contrato-de-mocks-vs-backend-real` (Backlog) |
| Agregar datos de mock para dominios sin handler | `inventory` y `returns` ya tienen handler; los demas estan completos |
| CI/CD automatico para el build demo | No hay CI/CD en el repo (declarado en riesgos) |

## Estimacion de esfuerzo

| Fase | Descripcion | Esfuerzo |
|------|-------------|----------|
| F0 | Analisis + PM docs | 20 min |
| F1 | Webpack: copy-webpack-plugin + DEMO_MODE | 20 min |
| F2 | src/index.jsx: guard DEMO_MODE | 10 min |
| F3 | Documentacion (README, vista-de-despliegue, ADR nota) | 20 min |
| F4 | Verificacion y cierre | 15 min |
| Total | | ~85 min |
