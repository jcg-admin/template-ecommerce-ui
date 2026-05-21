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

// MSW: arranca el Service Worker solo en desarrollo. El bundle de
// produccion no incluye MSW ni los handlers; webpack ya hace tree
// shaking de import dinamico bajo bloque `if (NODE_ENV !== 'production')`
// porque DefinePlugin sustituye `process.env.NODE_ENV` antes de
// minificar. El archivo `public/mockServiceWorker.js` no se copia a
// `dist/` (no hay copy-webpack-plugin), asi que aunque alguien
// solicitara la URL en produccion seria 404 inocuo. Doble guarded.
async function startApp() {
  if (process.env.NODE_ENV !== 'production') {
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
