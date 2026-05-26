import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';

// Exponer la configuracion del build para diagnostico en runtime.
// El operador puede abrir la consola del navegador y ejecutar
// `window.__APP_CONFIG__` para confirmar que el bundle servido es
// el que se espera (URL de API, version del package y timestamp del
// build). Util cuando un despliegue parece desactualizado o cuando
// el servidor sirve un bundle con `.env` equivocado.
if (typeof window !== 'undefined') {
  window.__APP_CONFIG__ = Object.freeze({
    apiUrl:  process.env.API_URL,
    version: process.env.APP_VERSION,
    builtAt: process.env.BUILT_AT,
  });
}

const container = document.getElementById('root');
const root = createRoot(container);

// MSW: arranca el Service Worker en dos casos:
// 1. Desarrollo: NODE_ENV !== 'production' (comportamiento original).
// 2. Demo: DEMO_MODE === 'true' en el bundle compilado. Permite
//    demostrar el template con datos de mock sobre el dist/ servido
//    por Nginx, sin necesitar un backend real. Activar con:
//    DEMO_MODE=true npm run build  (o npm run build:demo)
// El archivo mockServiceWorker.js se copia a dist/ via copy-webpack-plugin
// solo cuando DEMO_MODE=true (ver webpack.config.js). En produccion real
// sin DEMO_MODE, este bloque no ejecuta y el service worker no existe en
// dist/. Doble guardado: guard de codigo + ausencia del archivo.
async function startApp() {
  if (process.env.NODE_ENV !== 'production' || process.env.DEMO_MODE === 'true') {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
    });
  }

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

startApp();
