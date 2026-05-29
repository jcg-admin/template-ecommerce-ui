/**
 * Jest Setup — ecommerce-ui UI
 * Configuración global para todos los tests
 */

require('@testing-library/jest-dom');

// Polyfills para MSW v2 en jsdom: jsdom no expone `Request`,
// `Response`, `Headers` ni `fetch` globalmente y `msw/node` los
// necesita en el scope del test. Node 22 los provee como globals
// nativos; aqui los re-asignamos al `global` que ve jest tras la
// inicializacion de jsdom. Hay que cargar `TextEncoder`/`TextDecoder`
// primero porque `undici` los usa antes de exponer el resto.
if (typeof globalThis.TextEncoder === 'undefined') {
  /* eslint-disable no-undef */
  const { TextEncoder, TextDecoder } = require('node:util');
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
  /* eslint-enable no-undef */
}
if (typeof globalThis.ReadableStream === 'undefined') {
  /* eslint-disable no-undef */
  const { ReadableStream, WritableStream, TransformStream } =
    require('node:stream/web');
  globalThis.ReadableStream = ReadableStream;
  globalThis.WritableStream = WritableStream;
  globalThis.TransformStream = TransformStream;
  /* eslint-enable no-undef */
}
if (typeof globalThis.MessagePort === 'undefined') {
  /* eslint-disable no-undef */
  const { MessageChannel, MessagePort } = require('node:worker_threads');
  globalThis.MessageChannel = MessageChannel;
  globalThis.MessagePort = MessagePort;
  /* eslint-enable no-undef */
}
if (typeof globalThis.Request === 'undefined') {
  /* eslint-disable no-undef */
  const { Request, Response, Headers, fetch, FormData } = require('undici');
  globalThis.Request = Request;
  globalThis.Response = Response;
  globalThis.Headers = Headers;
  globalThis.fetch = fetch;
  globalThis.FormData = FormData;
  /* eslint-enable no-undef */
}
if (typeof globalThis.BroadcastChannel === 'undefined') {
  /* eslint-disable no-undef */
  globalThis.BroadcastChannel = require('node:worker_threads').BroadcastChannel;
  /* eslint-enable no-undef */
}

// MSW: server para Jest (intercepta el modulo `http` de Node).
// Arranca antes de todos los tests, resetea handlers entre tests y
// cierra al final. Tras la eliminacion del `mockInterceptor` heredado
// (T-016 de la iniciativa `revisar-arquitectura-de-mocks`), MSW es la
// unica fuente de mock; `onUnhandledRequest: 'warn'` ayuda a detectar
// requests que no tienen handler aun (warning, no fallo).
const { server } = require('@mocks/node');

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(_query => ({
    matches: false,
    media: _query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const _localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = _localStorageMock;

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock IntersectionObserver (usado en lazy loading e imagenes)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Silenciar console.error de ReactDOM.render deprecation
const _originalError = console.error;
beforeAll(() => {
  console.error = (..._args) => {
    if (
      typeof _args[0] === 'string' &&
      _args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    _originalError.call(console, ..._args);
  };
});

afterAll(() => {
  console.error = _originalError;
});

jest.setTimeout(10000);

// Polyfill de HTMLDialogElement para jsdom — necesario para el componente Modal
// y ConfirmModal que usan <dialog> nativo. jsdom no implementa showModal/close.
if (typeof HTMLDialogElement !== 'undefined') {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () { this.open = false; };
  }
}
