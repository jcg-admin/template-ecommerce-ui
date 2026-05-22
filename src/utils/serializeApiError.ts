/**
 * serializeApiError — ecommerce-ui
 *
 * Convierte cualquier error capturado en un thunk en un objeto plano
 * y serializable apto para `rejectWithValue`. Preserva los campos
 * tipados (`code`, `statusCode`, `validationErrors`) que produce
 * `apiService.js` mediante `apiErrors.js`, de modo que el
 * `errorHandlingMiddleware` pueda alimentar correctamente
 * `errorSlice.contextErrors[dominio]`.
 *
 * Reglas:
 *   - Si el error es instancia de APIError (TimeoutError, NetworkError,
 *     ValidationError, NotFoundError, ConflictError, ...) se copian sus
 *     campos canonicos.
 *   - Si no, se intenta extraer `body.detail` (formato DRF) o `message`.
 *   - El resultado siempre es un objeto plano con `message`, `code`,
 *     `statusCode` y opcionalmente `validationErrors`.
 *
 * Migracion: T-009 de la iniciativa
 * `resolver-hallazgos-de-deuda-del-template`.
 */

// El modulo apiErrors sigue siendo .js y exporta clases sin tipos.
// El import implicit-any se aceptara sin checkJs porque importamos solo
// la clase para usarla en instanceof. Cuando apiErrors migre a .ts, este
// archivo recibira tipos sin cambios.
import { APIError } from '@utils/apiErrors';

/**
 * Estructura serializable que produce esta funcion.
 * Cualquier consumidor (slices, middleware, tests) puede importar el
 * tipo desde aqui para tipar el resultado de un `rejectWithValue`.
 */
export interface SerializedApiError {
  message: string;
  code: string;
  statusCode: number | null;
  name: string;
  validationErrors: Record<string, string[]> | null;
}

/**
 * Forma minima de un error candidato a serializarse. No exigimos que
 * extienda Error porque la red puede devolver objetos planos con campos
 * extra; aceptamos cualquier valor y extraemos lo que haya.
 */
type ErrorLike = {
  message?: string;
  code?: string;
  status?: number;
  statusCode?: number;
  name?: string;
  validationErrors?: Record<string, string[]>;
  body?: {
    detail?: string;
  };
};

export function serializeApiError(err: unknown): SerializedApiError {
  if (err instanceof APIError) {
    // ValidationError extiende APIError y anade `validationErrors`.
    // El resto de subclases no la tienen; el cast permite leer la
    // propiedad sin asumir que existe en todas las subclases.
    const apiErr = err as APIError & {
      validationErrors?: Record<string, string[]>;
    };
    return {
      message:          err.message,
      code:             err.code,
      statusCode:       err.statusCode ?? null,
      name:             err.name,
      validationErrors: apiErr.validationErrors ?? null,
    };
  }

  const e = (err ?? {}) as ErrorLike;

  const message =
    e.body?.detail ||
    e.message ||
    'Error inesperado.';

  return {
    message,
    code:             e.code       ?? 'UNKNOWN',
    statusCode:       e.status     ?? e.statusCode ?? null,
    name:             e.name       ?? 'Error',
    validationErrors: e.validationErrors ?? null,
  };
}

export default serializeApiError;
