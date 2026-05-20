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

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
