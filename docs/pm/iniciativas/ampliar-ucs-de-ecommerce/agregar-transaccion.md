# UC `agregar-transaccion`

| Campo | Valor |
|-------|-------|
| Iniciativa | `ampliar-ucs-de-ecommerce` |
| Tipo | UC del ecommerce (no del integrador de pago) |
| Endpoint propuesto | `POST /api/v1/orders/{order_number}/transactions/` |
| UC precondicionante | `crear-orden` con `processing_mode=manual` |
| UC sucesor esperado | `procesar-orden` (procesa las transacciones agregadas) |
| Estado | En estudio. Sin decisiones de scope tomadas. |
| Fuente de inspiracion | API de MercadoPago `POST /v1/orders/{order_id}/transactions` (catalogo completo de campos, enums, errores y ejemplo integrado en este documento). |

## Por que es del ecommerce y no del integrador de pago

Por el mismo principio aplicado a `crear-orden.md` y
`capturar-orden.md`: **anadir transacciones de pago a una orden
manual es un UC del ecommerce**. El comprador o el sistema del
adoptante, despues de haber creado una orden como contenedor
vacio, decide que metodo(s) de pago aplicar.

El integrador entra cuando el ecommerce, una vez tiene las
transacciones agregadas, llama a procesarlas (UC siguiente). En
este UC el integrador **no se invoca todavia**: las transacciones
se quedan en estado `created` esperando ser procesadas.

**Consecuencia para el modelado**:

- **Endpoint del UC**: `POST /api/v1/orders/{order_number}/transactions/`
  (del ecommerce). Sub-recurso de la orden, consistente con
  `/capture/` y `/cancel/`. **No** es
  `/api/payments/mercadopago/transactions/`.
- El backend del ecommerce solo persiste las transacciones; no
  hace llamadas al integrador en este momento.

## Por que existe este UC: el flujo `manual`

Este UC es **el segundo eslabon** del flujo `processing_mode=manual`
de `crear-orden`:

```
crear-orden (processing_mode=manual)
    -> orden queda como contenedor vacio, status=created
agregar-transaccion (este UC)
    -> transacciones agregadas, status sigue siendo created,
       transacciones en status=created
procesar-orden (UC siguiente)
    -> integrador llamado, status pasa a processed/processing/
       action_required
[opcional: capturar-orden si capture_mode=manual]
    -> captura del monto autorizado
```

Sin este UC, `processing_mode=manual` no sirve para nada: una
orden creada en modo manual sin transacciones no puede pagarse.

**Casos de uso tipicos del flujo manual**:

- **Carritos guardados como pre-ordenes**: el comprador crea la
  orden sin elegir todavia el metodo de pago (lista de regalos,
  carrito de prueba). Mas tarde regresa y agrega el metodo via
  este UC.
- **B2B con aprobacion**: la orden se crea pendiente de
  aprobacion. Tras aprobar, el sistema agrega el metodo de pago
  acordado.
- **Pagos diferidos**: orden creada al confirmar pedido; metodo
  de pago se elige cuando el producto esta listo (e.g. servicios,
  productos custom).

## Forma del UC

### Actor

- **Comprador** (caso comun): regresa a su orden pendiente y
  selecciona metodo de pago en una pagina como
  `OrderPaymentSelectionPage`.
- **Sistema del ecommerce** (B2B): handler que, tras aprobacion
  externa, agrega la transaccion con el metodo acordado.
- **Admin** (poco frecuente): desde un panel admin si el modelo
  del adoptante permite registrar pagos en nombre del comprador.

### Pre-condiciones

- Existe una orden con `order_number` valido creada por
  `crear-orden`.
- La orden esta en `status=created` con
  `processing_mode=manual`. Cualquier otro `processing_mode`
  produce 400 `invalid_order_mode_for_operation`.
- La orden no tiene aun transacciones (en el modelo actual de
  MercadoPago, **maximo una transaccion por orden**; agregar
  cuando ya hay una produce 400
  `exceeded_number_of_transactions`).
- El actor tiene permisos sobre la orden.
- Si el metodo es tarjeta, el actor ha generado el `token` via
  SDK del integrador.

### Trigger

El actor envia `POST /api/v1/orders/{order_number}/transactions/`
con header `X-Idempotency-Key` y body con el array `payments[]`.

### Camino feliz

1. El actor arma el body con `payments[]` (1 o varios pagos si
   se hace pago partido; suma debe igualar `total_amount` de la
   orden).
2. El actor envia el POST con `X-Idempotency-Key: <uuid v4>`.
3. El backend del ecommerce:
   - Localiza la orden.
   - Verifica `status=created` y `processing_mode=manual`.
   - Valida que aun no hay transacciones (o que el agregado no
     excede el limite).
   - Valida que la suma de `payments[].amount` cuadre con
     `total_amount` original de la orden.
   - Si `payment_method.type` es tarjeta, valida formato de
     `token`.
   - Persiste las transacciones en estado `created` /
     `status_detail=created`. **No llama al integrador**.
4. Respuesta 201 con el array `payments[]` actualizado, cada uno
   con su `id` asignado por el ecommerce y su `status=created`.
5. El frontend muestra confirmacion ("Metodo de pago registrado,
   listo para procesar") y habilita el siguiente paso (UC
   `procesar-orden`).

### Caminos alternativos

- **Reintento idempotente**: misma `X-Idempotency-Key` con mismo
  body devuelve las mismas transacciones sin duplicarlas.
- **Pago partido**: el body trae varios `payments[]` con metodos
  distintos, sumando `total_amount`. Pasa por la misma validacion.

### Caminos de fallo

- Orden no existe (404 `order_not_found`).
- Orden existe pero **no esta en modo manual** (400
  `invalid_order_mode_for_operation`).
- Orden ya tiene transacciones (400
  `exceeded_number_of_transactions`).
- Header `X-Idempotency-Key` ausente (400
  `idempotency_key_missing`).
- Idempotency key reutilizada con body distinto (409
  `idempotency_key_conflict`).
- Suma de `payments[].amount` no coincide con `total_amount` de
  la orden (400 `invalid_total_amount`).
- Tarjeta sin `token`, o token con formato invalido (400
  `required_properties` / `property_value`).
- Actor sin permisos (403).

### Post-condiciones

- La orden ahora tiene `transactions.payments[]` poblado con las
  transacciones en estado `created`.
- La orden sigue en `status=created`: agregar transacciones **no
  cambia el status de la orden**, solo poblar el contenedor.
- El integrador **no ha sido invocado todavia**. La carga al
  integrador ocurre en `procesar-orden`.

## Contrato del endpoint

### Header

| Header | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| `X-Idempotency-Key` | string | **si** | Valor unico por intento. UUID v4 o string aleatorio, 1-64 caracteres. |
| `Authorization` | string | si | Cookie httpOnly o Bearer token segun politica del template. |
| `Content-Type` | string | si | `application/json`. |

### Path parameters

| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| `order_number` | string | **si** | Identificador human-readable de la orden, retornado por `crear-orden`. Debe corresponder a una orden en modo manual. |

### Body de request

#### Campos de nivel raiz

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `payments` | array | **si** | Lista de pagos a agregar a la transaccion. Limitado a 1 en el modelo actual del integrador; pago partido se ejerce con varios elementos en este array. |

Nota: el material original de MercadoPago clasifica `payments`
bajo "Path" por error de su documentacion. **Es body**: array con
objetos. Este documento corrige la clasificacion.

#### `payments[]`

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `amount` | string | opcional | Monto del pago. Si solo hay un pago, debe igualar `total_amount` de la orden. Si hay varios, la suma debe igualar `total_amount`. Hasta 2 decimales o ninguno. |
| `payment_method` | object | opcional | Detalle del metodo. Mismo shape que en `crear-orden`. |

#### `payments[].payment_method`

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `id` | string | opcional | Canal/marca. Ver enum. |
| `type` | string | opcional | Familia del metodo. Ver enum. |
| `token` | string | condicional | **Requerido para tarjetas**. 32-33 caracteres. |
| `installments` | integer | opcional | Numero de cuotas. |
| `statement_descriptor` | string | opcional | Texto en estado de cuenta. Maximo 50 caracteres. |

### Enums

Los enums son **identicos** a los de `crear-orden.md`. Se citan
aqui por completitud sin redeclarar:

- `payment_method.type`: `credit_card`, `debit_card`, `ticket`,
  `atm`, `bank_transfer`. Ver `crear-orden.md` para descripciones.
- `payment_method.id`: `visa`, `master`, `debvisa`, `debmaster`,
  `oxxo`, `paycash`, `bancomer`, `banamex`, `clabe`. Ver
  `crear-orden.md` para descripciones.

### Enum acotado para `status` y `status_detail` en este endpoint

El response solo emite un valor para cada campo, reflejando que
las transacciones recien agregadas estan **listas para procesar**
pero aun **no procesadas**:

| Campo | Valor | Descripcion |
|-------|-------|-------------|
| `payments[].status` | `created` | La transaccion se creo exitosamente, lista para procesar. |
| `payments[].status_detail` | `created` | Confirmacion del estado. |

Cualquier otro valor (`processed`, `action_required`, etc) llega
recien tras llamar a `procesar-orden`.

### Response

#### Campos de nivel raiz

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `payments` | array | Las transacciones recien creadas, cada una con su `id` asignado por el ecommerce. |

Notese: el response **no incluye** la orden completa
(`order_number`, `status` de la orden, etc). Solo confirma las
transacciones agregadas. Para ver la orden actualizada, el
frontend hace `GET /api/v1/orders/{order_number}/`.

#### `payments[]` en response

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | string | ID del pago asignado por el ecommerce. |
| `amount` | string | Monto. |
| `date_of_expiration` | string | Timestamp de expiracion si el metodo lo requiere (OXXO, SPEI, etc). |
| `status` | string | Estado del pago. Solo `created` en este endpoint. |
| `status_detail` | string | Razon del estado. Solo `created`. |
| `payment_method` | object | Datos del metodo (eco del request). |

### Errores

| HTTP | Codigo | Descripcion |
|------|--------|-------------|
| 400 | `idempotency_key_missing` | Header `X-Idempotency-Key` ausente. |
| 400 | `idempotency_key_invalid_format` | Valor fuera de rango (1-64 caracteres) o invalido. |
| 400 | `invalid_path_param` | `order_number` malformado en la URL. |
| 400 | `required_properties` | Faltan propiedades requeridas. Detalle en `errors[].field`. |
| 400 | `unsupported_properties` | Propiedad no soportada en el body. |
| 400 | `minimum_properties` | Numero minimo de propiedades no alcanzado. |
| 400 | `property_type` | Tipo incorrecto. |
| 400 | `minimum_items` | `payments[]` vacio. |
| 400 | `maximum_items` | Demasiados items en algun array. |
| 400 | `property_value` | Valor invalido para una propiedad (e.g. enum fuera del catalogo). |
| 400 | `json_syntax_error` | JSON malformado. |
| 400 | `invalid_properties` | Combinacion de propiedades invalida. |
| 400 | `invalid_total_amount` | Suma de `payments[].amount` no coincide con `total_amount` de la orden. |
| 400 | `exceeded_number_of_transactions` | La orden ya tiene transacciones (en el modelo actual del integrador, maximo una transaccion por orden). |
| 400 | `invalid_order_mode_for_operation` | La orden no esta en `processing_mode=manual`. Solo ordenes manuales aceptan agregado posterior de transacciones. |
| 401 | `unauthorized` | Credenciales invalidas o ausentes. |
| 403 | `forbidden` | Actor sin permisos sobre esta orden. |
| 404 | `order_not_found` | No existe orden con ese `order_number`. |
| 409 | `idempotency_key_conflict` | Misma `X-Idempotency-Key` usada con body distinto. |
| 500 | `idempotency_validation_failed` | Fallo de validacion de idempotencia. |
| 500 | `internal_error` | Error generico. |

Forma del error (misma envelope que `crear-orden`):

```json
{
  "code": "invalid_order_mode_for_operation",
  "detail": "Order ORD-2026-0001234 has processing_mode=automatic; transactions can only be added to orders in manual mode",
  "errors": [
    {
      "field": "processing_mode",
      "expected": "manual",
      "received": "automatic"
    }
  ]
}
```

## Reglas de validacion clave

1. **Idempotency key obligatoria**. Header ausente -> 400.
   Reintentos con misma clave y mismo body devuelven las mismas
   transacciones sin duplicar.

2. **Solo en modo manual**. La orden debe tener
   `processing_mode=manual`. Cualquier otro modo -> 400
   `invalid_order_mode_for_operation`. Esta validacion es la que
   diferencia este UC del flujo `automatic`.

3. **Limite de transacciones**. En el modelo actual del
   integrador, una orden acepta **maximo una transaccion**. Si ya
   hay una -> 400 `exceeded_number_of_transactions`. Esto es
   restriccion del integrador, no del UC; el ecommerce la valida
   antes de persistir.

4. **Suma de pagos igual al total de la orden**. Sigue siendo
   `sum(payments[].amount) = total_amount` aunque el endpoint sea
   distinto. La regla viaja con la orden, no con el endpoint.

5. **Token obligatorio para tarjetas**. Igual que en `crear-orden`,
   `payment_method.type` en `credit_card`/`debit_card` exige
   `token` de 32-33 caracteres.

6. **Sin efecto sobre el status de la orden**. Agregar
   transacciones a una orden manual **no cambia su status**: la
   orden sigue en `created` hasta que se llame a `procesar-orden`.
   Esto contrasta con `crear-orden automatic` donde la creacion
   ya dispara el procesamiento.

7. **Sin llamada al integrador todavia**. El backend del ecommerce
   solo persiste; no llama a MercadoPago/Stripe/etc en este paso.
   La llamada al integrador es de `procesar-orden`.

## Ejemplos

### Ejemplo 1 — Agregar transaccion con tarjeta de credito

Caso comun: orden creada en modo manual durante un checkout en
varios pasos. El comprador completa los datos de pago en una
pagina posterior.

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001240/transactions/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: 5d8e9f1a-2b3c-4d5e-6f7a-8b9c1d2e3f4a' \
  --cookie 'access_token=...' \
  -d '{
  "payments": [{
    "amount": "300.00",
    "payment_method": {
      "id": "master",
      "type": "credit_card",
      "token": "3c5e8a9b101010101bcdef9876543210",
      "installments": 3,
      "statement_descriptor": "MI TIENDA"
    }
  }]
}'
```

#### Response 201

```json
{
  "payments": [{
    "id": "PAY-2026-0009880",
    "amount": "300.00",
    "status": "created",
    "status_detail": "created",
    "payment_method": {
      "id": "master",
      "type": "credit_card",
      "token": "3c5e8a9b101010101bcdef9876543210",
      "installments": 3,
      "statement_descriptor": "MI TIENDA"
    }
  }]
}
```

La orden `ORD-2026-0001240` sigue en `status=created`; las
transacciones estan listas para procesar via `procesar-orden`.

### Ejemplo 2 — Agregar transaccion con OXXO

Caso B2B: orden creada manualmente desde un sistema externo, se
agrega luego el voucher OXXO para el comprador.

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001241/transactions/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: 7a8b9c1d-2e3f-4a5b-6c7d-8e9f1a2b3c4d' \
  --cookie 'access_token=...' \
  -d '{
  "payments": [{
    "amount": "1500.00",
    "payment_method": {
      "id": "oxxo",
      "type": "ticket"
    }
  }]
}'
```

#### Response 201

```json
{
  "payments": [{
    "id": "PAY-2026-0009881",
    "amount": "1500.00",
    "status": "created",
    "status_detail": "created",
    "payment_method": {
      "id": "oxxo",
      "type": "ticket"
    }
  }]
}
```

El `ticket_url`, `barcode_content`, etc **no aparecen aqui**: solo
los emite el integrador tras `procesar-orden`. En este punto la
transaccion esta declarada pero no procesada.

### Ejemplo 3 — Pago partido (varias formas de pago)

Aunque la orden acepta solo una `transaction`, esa transaccion
puede tener varios `payments[]`. Util si el adoptante implementa
gift cards combinables con tarjeta.

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001242/transactions/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: 9c1d2e3f-4a5b-6c7d-8e9f-1a2b3c4d5e6f' \
  --cookie 'access_token=...' \
  -d '{
  "payments": [
    {
      "amount": "200.00",
      "payment_method": {
        "id": "visa",
        "type": "credit_card",
        "token": "ab12cd34ef56...",
        "installments": 1
      }
    },
    {
      "amount": "100.00",
      "payment_method": {
        "id": "store_voucher",
        "type": "ticket"
      }
    }
  ]
}'
```

#### Response 201

```json
{
  "payments": [
    {
      "id": "PAY-2026-0009882",
      "amount": "200.00",
      "status": "created",
      "status_detail": "created",
      "payment_method": {
        "id": "visa",
        "type": "credit_card",
        "installments": 1
      }
    },
    {
      "id": "PAY-2026-0009883",
      "amount": "100.00",
      "status": "created",
      "status_detail": "created",
      "payment_method": {
        "id": "store_voucher",
        "type": "ticket"
      }
    }
  ]
}
```

### Ejemplo 4 — Error: orden no esta en modo manual

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001234/transactions/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: 1a2b3c4d-5e6f-7a8b-9c1d-2e3f4a5b6c7d' \
  --cookie 'access_token=...' \
  -d '{ "payments": [{ "amount": "100.00", "payment_method": {"id": "master", "type": "credit_card", "token": "..."} }] }'
```

#### Response 400

```json
{
  "code": "invalid_order_mode_for_operation",
  "detail": "Order ORD-2026-0001234 has processing_mode=automatic; transactions can only be added to orders in manual mode",
  "errors": [
    {
      "field": "processing_mode",
      "expected": "manual",
      "received": "automatic"
    }
  ]
}
```

### Ejemplo 5 — Error: orden ya tiene transacciones

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001240/transactions/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: 3b4c5d6e-7f8a-9b1c-2d3e-4f5a6b7c8d9e' \
  --cookie 'access_token=...' \
  -d '{ "payments": [{ "amount": "300.00", "payment_method": {"id": "visa", "type": "credit_card", "token": "..."} }] }'
```

#### Response 400

```json
{
  "code": "exceeded_number_of_transactions",
  "detail": "Order ORD-2026-0001240 already has one transaction; the current model allows only one transaction per order",
  "errors": [
    {
      "field": "transactions",
      "expected": "at most 1",
      "received": "1 (existing) + 1 (attempted)"
    }
  ]
}
```

## Patrones de diseno extraidos de la inspiracion

Este UC confirma patrones ya identificados y anade uno nuevo
especifico de los flujos en etapas.

### Patron 06 confirmado — Sub-recurso accionable como "anadir"

`POST /api/v1/orders/{order_number}/transactions/` es otra
instancia del patron sub-recurso. A diferencia de `/capture/`
(que es transicion de estado sin body), este endpoint **si lleva
body** porque agrega datos al recurso padre.

**Distincion**:
- Sub-recurso **transicion de estado** (patron 16):
  `POST /capture/`, `POST /cancel/`, `POST /process/`. Body
  vacio.
- Sub-recurso **anadir contenido**: `POST /transactions/`. Body
  con los datos a anadir.

Ambos son sub-recursos, pero el contrato es distinto.

**Aplicabilidad**: **Alta** si se adopta `processing_mode=manual`
en el alcance.

### Patron 17 reforzado — Validacion de estado antes que de input

Este UC vuelve a aplicar el patron 17 ya identificado en
`capturar-orden.md`: **valida el estado del recurso antes que el
input**. Dos validaciones de estado:

1. La orden esta en `processing_mode=manual` (sino: 400
   `invalid_order_mode_for_operation`).
2. La orden no excede el numero de transacciones permitidas
   (sino: 400 `exceeded_number_of_transactions`).

Solo si pasan ambas, se valida el body.

**Aplicabilidad**: **Alta**. Consistente con `capturar-orden`.

### Patron 19 — Estado "creado pero no procesado"

**El patron**: las transacciones recien agregadas viven en un
estado intermedio: existen en el modelo de datos pero **no han
sido enviadas al integrador**. El enum acotado refleja esto:
solo `status=created`, `status_detail=created`.

**Por que importa**: separa **declarar la intencion de pago** de
**ejecutar el pago**. Util para:

- Auditar transacciones declaradas vs procesadas (compliance).
- Reintentar la fase de procesamiento sin re-declarar
  transacciones.
- Permitir cancelar transacciones declaradas antes de procesarlas
  (si el modelo lo soporta).

**Aplicabilidad**: **Solo si se adopta el flujo manual**. Sin
modo manual, todas las transacciones nacen procesadas o en
proceso, nunca en `created` puro.

### Patron 20 — Sub-recurso con body vs sin body

**El patron**: dentro del conjunto de sub-recursos accionables
sobre una orden, hay dos familias:

| Familia | Body | Ejemplos |
|---------|------|----------|
| **Transicion de estado** | Vacio | `/capture/`, `/cancel/`, `/process/`, `/refund/` (total) |
| **Anadir contenido** | Con datos | `/transactions/`, futuras `/items/`, `/coupons/`, `/notes/` |

La distincion es util para el modelado del template: si una
operacion no cambia datos de la orden mas alla del estado, el
endpoint **no debe** recibir body. Si agrega datos, el endpoint
**debe** recibir body con esos datos.

**Aplicabilidad**: **Alta**. Disciplina clara para diseno futuro.

### Patron 21 — Restriccion del integrador documentada en el UC

**El patron**: el error 400 `exceeded_number_of_transactions`
declara explicitamente "maximo una transaccion por orden". Esto
es **restriccion del modelo actual del integrador**, no del UC.
El UC permite multiples transacciones por jerarquia
(`Order > transactions[] > payments[]`), pero el integrador hoy
solo permite una.

**Por que importa**: separar **restricciones del integrador**
(que pueden cambiar) de **disciplina del UC** (que es estable).
Si MercadoPago anade soporte para multiples transacciones manana,
el UC ya esta listo: solo el limite cambia.

**Aplicabilidad**: **Disciplina documental**. Util cuando el
template encuentre restricciones similares en otros integradores.

## Resumen de aplicabilidad al UC `agregar-transaccion`

| Patron | Aplicabilidad | Origen |
|--------|---------------|--------|
| `X-Idempotency-Key` (patron 01) | **Alta** | Heredado |
| Sub-recurso accionable (patron 06) | **Alta** | Confirmado |
| Endpoint de transicion con body vacio (patron 16) | **N/A** | Esta es la otra familia (con body) |
| Validacion de estado antes que input (patron 17) | **Alta** | Reforzado |
| `payment_method` objeto (patron 07) | **Alta** | Heredado de `crear-orden` |
| Errores con codigo semantico (patron 11) | **Alta** | Heredado |
| Estado "creado pero no procesado" (patron 19) | **Solo si modo manual** | Nuevo |
| Sub-recurso con body vs sin body (patron 20) | **Alta** | Nuevo, disciplina |
| Restriccion del integrador documentada (patron 21) | **Disciplina documental** | Nuevo |

## Dependencias con otros UCs

- **`crear-orden`** (UC precondicionante): este UC solo aplica
  sobre ordenes creadas con `processing_mode=manual`. Si el
  alcance final no incluye el modo manual, este UC se descarta.
- **`procesar-orden`** (UC sucesor obligado): sin procesar-orden,
  agregar-transaccion no completa el flujo. La transaccion queda
  en `created` indefinidamente. Los dos UCs **deben adoptarse
  juntos** o ninguno.
- **`cancelar-orden`** (UC complementario opcional): permite
  liberar una orden manual con transacciones agregadas sin
  procesarlas. Util si el comprador se arrepiente antes de
  pagar.

## Que entrega este documento

- Caracterizacion del UC `agregar-transaccion` como propiedad
  del ecommerce.
- Contrato detallado del endpoint
  `POST /api/v1/orders/{order_number}/transactions/`: header,
  path, body con `payments[]`, response, enums acotados (solo
  `created`), 20 errores catalogados.
- 5 ejemplos request/response: tarjeta credito, OXXO, pago
  partido, error 400 modo invalido, error 400 limite excedido.
- 3 patrones nuevos (19 estado creado-pero-no-procesado, 20
  sub-recurso con/sin body, 21 restriccion del integrador
  documentada).
- Confirmacion de patrones previos heredados.
- Identificacion de dos dependencias criticas:
  `processing_mode=manual` en `crear-orden`, y existencia del UC
  `procesar-orden` como sucesor obligado.

## Que NO entrega este documento

- Decision de cuales patrones se adoptan.
- Plan de implementacion.
- Modificacion de codigo del template.
- UC `procesar-orden` (siguiente UC esperado).
- UC para eliminar/modificar transacciones agregadas antes de
  procesarlas; el material original no documenta DELETE ni PATCH
  sobre transactions.

Esas decisiones viven en `alcance-*.md` y `plan-*.md` que se
produciran cuando todos los UCs propuestos esten estudiados.
