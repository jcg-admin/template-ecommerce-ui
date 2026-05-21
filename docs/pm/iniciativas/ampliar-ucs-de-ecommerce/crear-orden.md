# UC `crear-orden`

| Campo | Valor |
|-------|-------|
| Iniciativa | `ampliar-ucs-de-ecommerce` |
| Tipo | UC del ecommerce (no del integrador de pago) |
| Endpoint propuesto | `POST /api/v1/orders/` |
| Estado | En estudio. Sin decisiones de scope tomadas. |
| Fuentes de inspiracion | API de MercadoPago `POST /v1/orders` (catalogo completo de campos, enums, errores y ejemplos integrado en este documento). |

## Por que es del ecommerce y no del integrador de pago

**Crear una orden es un UC del ecommerce.** El comprador termina su
checkout, el ecommerce **decide crear la orden** (validar carrito,
calcular totales, congelar items, asignar `order_number`,
persistirla). El metodo de pago es **un campo de la orden**, no su
naturaleza.

El integrador de pago (MercadoPago, PayPal, Stripe, Conekta, o el
que sea) entra solo cuando el UC `crear-orden`, ya en marcha,
decide cobrar via tarjeta/OXXO/SPEI/transferencia. En ese momento
el ecommerce llama al integrador como **cliente**, no como
delegado del UC.

**Consecuencia para el modelado**:

- **Endpoint del UC**: `POST /api/v1/orders/` (del ecommerce). Crea
  la orden y, si aplica, dispara el cobro internamente. No es
  `/api/payments/mercadopago/create/`; ese era un endpoint del
  integrador que el template anterior trataba erroneamente como
  el UC.
- **Endpoints del integrador**: viven aparte
  (`/api/v1/payments/mercadopago/...`, `/payments/paypal/...`),
  invocados por el backend del ecommerce cuando la orden lo
  requiere. Son **dependencias internas** del UC, no su interfaz
  publica.
- **El frontend habla con el ecommerce, no con el integrador**.
  El integrador puede tener su propia interaccion con el frontend
  (iframe de 3DS, redirect a sandbox), pero el contrato principal
  es ecommerce ↔ frontend.

Esto corrige un error implicito del template heredado, donde
`paymentsSlice` y `checkoutSlice` mezclaban "crear orden" con
"crear preferencia MercadoPago" como si fueran el mismo UC.

## Forma del UC

### Actor

Comprador autenticado (puede ser invitado segun politica del
adoptante; depende de UCs adicionales fuera del scope inicial).

### Pre-condiciones

- El comprador tiene un carrito no vacio.
- Si el pago requiere autorizacion de tarjeta, el comprador ha
  generado un token de tarjeta valido (via SDK del integrador).
- Si el pago requiere direccion de envio (productos fisicos), el
  comprador ha seleccionado una direccion de su libreta o ingresado
  una nueva.

### Trigger

El comprador confirma el checkout. El frontend del ecommerce
despacha el thunk `createOrder(payload)` que ataca
`POST /api/v1/orders/`.

### Camino feliz (caso `automatic` con tarjeta)

1. El frontend arma el body de la orden (`items`, `total_amount`,
   `transactions.payments[]` con `payment_method`, `shipment`,
   `payer`, `external_reference`).
2. El frontend envia `POST /api/v1/orders/` con header
   `X-Idempotency-Key: <uuid v4>`.
3. El backend del ecommerce:
   - Valida que el carrito coincide con `items` y que `total_amount`
     es coherente.
   - Crea la orden en estado `created` con `order_number` propio y
     `external_reference` del frontend.
   - Si `payment_method.type` es `credit_card`/`debit_card`, llama
     al integrador (MercadoPago, Stripe, etc) para autorizar/cobrar
     el cargo.
   - Recibe la respuesta del integrador; actualiza la orden a
     `processed` (status_detail `accredited`) si OK, o a
     `action_required` si falta algo (challenge 3DS, etc).
4. Respuesta 201 con la orden, su `status`, su `status_detail`, y
   el detalle de la transaccion de pago.
5. El frontend redirige a la pagina de confirmacion o, si
   `status=action_required`, a la pagina que muestra el siguiente
   paso (iframe 3DS, voucher OXXO, instrucciones SPEI).

### Caminos alternativos

- **Pago con voucher (OXXO, Paycash)**: `status=action_required`,
  `status_detail=waiting_payment`. La respuesta incluye los datos
  para mostrar el voucher (URL, codigo de barras, referencia,
  codigo de verificacion).
- **Pago con transferencia (SPEI/CLABE)**: `status=action_required`,
  `status_detail=waiting_transfer`. Incluye instrucciones bancarias
  (`ticket_url`, `reference`).
- **3DS requerido (tarjeta de alto riesgo)**:
  `status=action_required`, `status_detail=pending_challenge`. El
  response trae la URL del reto; el frontend la muestra en iframe.
- **Reintento idempotente**: el frontend reenvia la misma request
  con la misma `X-Idempotency-Key` por timeout o reintento de red.
  El backend devuelve **la misma orden** sin crearla dos veces.
- **Modo `manual`**: el frontend crea la orden con
  `processing_mode=manual` y `transactions=null` (no array vacio:
  error). Las transacciones se anaden despues via endpoint
  dedicado.

### Caminos de fallo

- Header `X-Idempotency-Key` ausente (400 `idempotency_key_missing`).
- Carrito vacio o desincronizado con `items` (400 `invalid_cart`).
- `total_amount` no coincide con la suma de `transactions.payments[].amount`
  (400 `invalid_total_amount`).
- Idempotency key reutilizada con body distinto (409
  `idempotency_key_conflict`).
- Pago rechazado por el integrador (402 con detalle del banco).
- Stock insuficiente entre validacion y persistencia (409
  `stock_unavailable`).
- Modo `manual` con `transactions` como array vacio en vez de
  `null` (400 `order_builder_without_transactions`).

### Post-condiciones

- En el ecommerce existe una orden con `order_number` unico,
  asociada al comprador, con snapshot de `items` y `total_amount`
  congelados, con `payment_method` registrado, con `status` y
  `status_detail` reflejando el resultado.
- Si el pago se completo, el inventario se decrementa.
- Si el pago quedo pendiente (voucher, transferencia, 3DS), el
  ecommerce reserva el stock con TTL hasta la expiracion del pago.

## Contrato del endpoint

### Header

| Header | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| `X-Idempotency-Key` | string | **si** | Valor unico por intento. UUID v4 o string aleatorio, 1-64 caracteres. Reintentos con la misma clave devuelven la misma orden sin crear duplicado. |
| `Authorization` | string | si | Cookie httpOnly o Bearer token segun politica del template (JWT en cookies por ADR `dec-jwt-solo-en-cookies-httponly`). |
| `Content-Type` | string | si | `application/json`. |

### Body de request

#### Campos de nivel raiz

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `type` | string | opcional | Tipo de orden. Valor unico por ahora: `online` (pago en linea). |
| `external_reference` | string | opcional | Referencia del integrador (el ecommerce). Maximo 150 caracteres. Solo alfanumericos, guion (`-`) y guion bajo (`_`). Util para correlacionar con sistemas externos. |
| `total_amount` | string | opcional | Total a pagar. Hasta 2 decimales o ninguno. Debe ser equivalente a la suma de `transactions.payments[].amount`. |
| `transactions` | object | opcional | Contenedor de pagos. **Requerido en modo `automatic`**, **debe ser `null`** en modo `manual` (no array vacio). |
| `payer` | object | opcional | Informacion del pagador. Requerimiento de sub-campos varia segun metodo de pago. |
| `shipment` | object | opcional | Informacion de envio. Aplica solo si la orden lleva productos fisicos. |
| `capture_mode` | string | opcional | Modo de captura del pago. Ver enum mas abajo. |
| `processing_mode` | string | opcional | Modo de procesamiento de la orden. Ver enum mas abajo. |
| `description` | string | opcional | Descripcion libre de la orden o de un producto del marketplace. |
| `items` | array | opcional | Snapshot congelado de los items comprados. |
| `config` | object | opcional | Configuracion especifica (3DS para tarjetas online). |

#### `transactions.payments[]`

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `amount` | string | opcional | Monto de la transaccion. Si solo hay un pago, igual a `total_amount`. Si hay varios, la suma debe igualar `total_amount`. |
| `payment_method` | object | opcional | Detalle del metodo. Requerimiento de sub-campos varia segun tipo. |
| `expiration_time` | string | opcional | Duracion ISO 8601 (e.g. `P1D` = 1 dia, `P3Y6M4DT12H30M5S` = 3 anos, 6 meses, 4 dias, 12 horas, 30 min, 5 seg). Solo para OXXO, Paycash, Banamex, BBVA Bancomer, SPEI. |
| `date_of_expiration` | string | opcional | Timestamp absoluto de expiracion. Si no se envia `expiration_time`, adopta default segun metodo. |

#### `transactions.payments[].payment_method`

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `id` | string | opcional | Identificador del canal/marca. Ver enum mas abajo. Si es tarjeta, indica la marca (`visa`, `master`...). |
| `type` | string | opcional | Familia del metodo. Ver enum mas abajo. |
| `token` | string | condicional | Token seguro de la tarjeta. **Requerido para tarjetas**. 32-33 caracteres. Generado por el SDK del integrador. |
| `installments` | integer | opcional | Numero de cuotas/meses sin intereses. |
| `statement_descriptor` | string | opcional | Texto que aparecera en el estado de cuenta del comprador. Maximo 50 caracteres. |

#### `payer`

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `email` | string | condicional | **Requerido para OXXO, Paycash, Banamex, BBVA Bancomer, SPEI**. Para tarjeta es opcional (el token identifica al pagador). |
| `entity_type` | string | opcional | Tipo de entidad. Enum: `individual` o `association`. |
| `first_name` | string | opcional | Nombre del pagador. |
| `last_name` | string | opcional | Apellido del pagador. |
| `identification` | object | opcional | Documento de identificacion fiscal (CURP/RFC/CUIT/CPF). |
| `phone` | object | opcional | Telefono (`area_code` + `number`). |
| `address` | object | opcional | Direccion del pagador. |

#### `payer.identification`

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `type` | string | opcional | Tipo de documento. Depende del pais (`CURP`, `RFC`, `CUIT`, `CPF`, `CNPJ`, `DNI`, etc). |
| `number` | string | opcional | Numero del documento. |

#### `payer.address` y `shipment.address`

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `zip_code` | string | opcional | Codigo postal. |
| `street_name` | string | opcional | Calle. |
| `street_number` | string | opcional | Numero exterior. |
| `city` | string | opcional | Ciudad. |
| `state` | string | opcional | Estado/provincia. Maximo 50 caracteres. |
| `complement` | string | opcional | Complemento de direccion (depto, interior, referencias). |

#### `items[]`

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `title` | string | opcional | Nombre del item. Maximo 150 caracteres. |
| `unit_price` | string | opcional | Precio unitario. |
| `quantity` | integer | opcional | Cantidad comprada. |
| `description` | string | opcional | Descripcion del item. Maximo 100 caracteres. |
| `external_code` | string | opcional | Codigo externo del item (SKU del adoptante). |
| `picture_url` | string | opcional | URL de imagen del item. |
| `category_id` | string | opcional | ID de categoria. |
| `type` | string | opcional | Tipo del item. |
| `warranty` | boolean | opcional | Si el item tiene garantia. |
| `event_date` | string | opcional | Fecha del evento (para tickets/entradas). |

#### `config.online.transaction_security` (3DS)

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `validation` | string | opcional | Cuando ejecutar 3DS. Enum: `on_fraud_risk` (segun riesgo, recomendado) o `never` (default). |
| `liability_shift` | string | opcional | Responsabilidad financiera en disputa. Solo valor `required`. No enviar si `validation=never`. |
| `callback_url` | string | opcional | URL de retorno tras 3DS. |

### Enums

#### `capture_mode`

| Valor | Descripcion |
|-------|-------------|
| `automatic` | Autoriza y captura al mismo tiempo. Comportamiento clasico. |
| `manual` | Reserva el monto en la tarjeta del comprador; la captura se hace despues via `POST /api/v1/orders/{order_number}/capture/`. Util para reservas (hotel, alquiler) y para confirmar stock antes de cobrar. |
| `automatic_async` | Procesamiento asincrono. La orden puede quedar en `status=processing` esperando actualizacion async; el estado final llega por webhook o consulta. |

#### `processing_mode`

| Valor | Descripcion |
|-------|-------------|
| `automatic` | Procesamiento instantaneo. La orden se procesa al crearla. |
| `manual` | Procesamiento diferido. La orden se crea como contenedor; las transacciones se anaden despues via `POST /api/v1/orders/{order_number}/transactions/` y se procesan via `POST /api/v1/orders/{order_number}/process/`. |

#### `payment_method.type`

| Valor | Descripcion |
|-------|-------------|
| `credit_card` | Tarjeta de credito. |
| `debit_card` | Tarjeta de debito. |
| `ticket` | Pago en efectivo con voucher (OXXO, Paycash). |
| `atm` | Pago en ATM. |
| `bank_transfer` | Transferencia bancaria (SPEI/CLABE). |

#### `payment_method.id` (canal/marca, depende del pais y del integrador)

| Valor | Descripcion |
|-------|-------------|
| `visa` | Visa credito. |
| `master` | Mastercard credito. |
| `debvisa` | Visa debito. |
| `debmaster` | Mastercard debito. |
| `oxxo` | Voucher OXXO (Mexico). |
| `paycash` | Voucher Paycash (Mexico). |
| `bancomer` | BBVA Bancomer (Mexico). |
| `banamex` | Banamex (Mexico). |
| `clabe` | SPEI Transfers via CLABE (Mexico). |

Cada adoptante anade los canales propios de su pais/integrador.

#### `payer.entity_type`

| Valor | Descripcion |
|-------|-------------|
| `individual` | Persona fisica. |
| `association` | Persona moral/empresa. |

#### `status` (de la orden, en response)

| Valor | Descripcion |
|-------|-------------|
| `created` | La orden se creo exitosamente. |
| `processed` | Todas las transacciones se procesaron correctamente. |
| `action_required` | Se requiere accion del integrador o del comprador (capturar autorizacion, completar 3DS, pagar voucher, etc). |
| `processing` | La orden se esta procesando y no requiere accion. Puede ser pago en revision manual o creacion asincrona. |
| `canceled` | La orden se cancelo y no se procesara mas. |

#### `status_detail` (razon del status)

| Valor | Descripcion |
|-------|-------------|
| `created` | La orden se creo. |
| `accredited` | El pago fue acreditado. |
| `in_process` | El pago se esta procesando. |
| `in_review` | El pago esta en revision manual. |
| `waiting_payment` | Esperando pago (voucher OXXO/Paycash). |
| `waiting_capture` | Esperando captura de un pago autorizado. |
| `waiting_transfer` | Esperando transferencia de fondos. |
| `pending_challenge` | Esperando que el comprador complete el reto 3DS. |
| `pending_review_manual` | Pago pendiente de revision manual. |

#### `transaction_security.status` (3DS challenge)

| Valor | Descripcion |
|-------|-------------|
| `AUTHENTICATED` | El banco autentico al portador y reenvio a validacion de marca. |
| `NOT_AUTHENTICATED` | El reto no se completo o el banco no autorizo por riesgo. |
| `CHALLENGE` | El banco pidio reto al comprador; aun no se completa. |
| `ATTEMPTED` | Autenticacion realizada por la marca de tarjeta. |
| `REJECTED` | El banco rechazo autenticacion por riesgo y nego el reto. |
| `ERROR` | Falta info para 3DS (e.g. `device_id` no enviado). |

### Response

#### Campos de nivel raiz

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` o `order_number` | string | Identificador unico de la orden generado por el ecommerce. |
| `type` | string | Tipo de orden (`online`). |
| `processing_mode` | string | Modo de procesamiento aplicado. |
| `external_reference` | string | El `external_reference` enviado en el request, conservado. |
| `total_amount` | string | Total a pagar. |
| `total_paid_amount` | string | Suma de `transactions.payments[].paid_amount`. |
| `created_date` | string | ISO 8601 con `Z`. `yyyy-MM-ddTHH:mm:ss.sssZ`. |
| `last_updated_date` | string | ISO 8601 con `Z`. |
| `country_code` | string | Codigo de pais del sitio (`MX`, `AR`, `BR`...). |
| `status` | string | Estado de la orden. Ver enum. |
| `status_detail` | string | Razon del estado. Ver enum. |
| `capture_mode` | string | Modo de captura aplicado. |
| `shipment` | object | Direccion de envio (snapshot). |
| `transactions` | object | Contenedor con las transacciones procesadas. |
| `description` | string | Descripcion (snapshot). |
| `items` | array | Items (snapshot congelado). |
| `client_token` | string | Token de operaciones cliente (opcional segun politica del template; ver patron 12). |
| `config` | object | Configuracion aplicada. |

#### `transactions.payments[]` en response

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | string | ID del pago. |
| `amount` | string | Monto del pago. |
| `paid_amount` | string | Monto real pagado (incluye descuentos/tips). |
| `reference_id` | string | ID de referencia del pago. |
| `status` | string | Estado del pago. |
| `status_detail` | string | Razon del estado. |
| `expiration_time` | string | Duracion ISO 8601 si aplica. |
| `date_of_expiration` | string | Timestamp absoluto si aplica. |
| `payment_method` | object | Datos del metodo + datos especificos del canal. |

#### `transactions.payments[].payment_method` en response

| Campo | Tipo | Aparece en | Descripcion |
|-------|------|-----------|-------------|
| `id` | string | siempre | Canal/marca usado. |
| `type` | string | siempre | Familia del metodo. |
| `token` | string | tarjeta | Token usado. |
| `installments` | integer | tarjeta | Cuotas. |
| `statement_descriptor` | string | tarjeta | Texto del estado de cuenta. |
| `ticket_url` | string | OXXO, Paycash, Banamex, BBVA, SPEI | URL del voucher/instrucciones. |
| `barcode_content` | string | OXXO, Paycash, Banamex, BBVA | Contenido del codigo de barras. |
| `reference` | string | OXXO, Paycash, Banamex, BBVA | Numero de referencia. |
| `verification_code` | string | OXXO, Paycash, Banamex, BBVA | Codigo de verificacion. |
| `financial_institution` | string | Banamex, BBVA | Institucion financiera. |
| `transaction_security` | object | tarjeta + 3DS | Estado del reto 3DS (URL, ID, type, status). |

### Errores

Catalogo de errores que el endpoint puede emitir, derivado del
material de MercadoPago con codigos adaptados al ecommerce.

| HTTP | Codigo | Descripcion |
|------|--------|-------------|
| 400 | `idempotency_key_missing` | Header `X-Idempotency-Key` ausente. |
| 400 | `idempotency_key_invalid_format` | Valor fuera de rango (no entre 1 y 64 caracteres) o caracteres invalidos. |
| 400 | `required_properties` | Faltan propiedades requeridas. Detalle en `errors[].field`. |
| 400 | `unsupported_properties` | Propiedad no soportada en el body. |
| 400 | `minimum_properties` | Numero minimo de propiedades no alcanzado. |
| 400 | `property_type` | Tipo incorrecto (e.g. integer donde se espera string). |
| 400 | `minimum_items` | Numero minimo de items en array no alcanzado. |
| 400 | `maximum_items` | Numero maximo de items en array excedido. |
| 400 | `property_value` | Valor invalido para una propiedad (e.g. enum fuera del catalogo). |
| 400 | `json_syntax_error` | JSON malformado. |
| 400 | `invalid_properties` | Combinacion de propiedades invalida. |
| 400 | `invalid_total_amount` | `total_amount` no coincide con suma de `transactions.payments[].amount`. |
| 400 | `invalid_order_type` | Valor de `type` no soportado. Solo `online` por ahora. |
| 400 | `order_builder_without_transactions` | En modo `manual`, `transactions` debe ser `null` (no array vacio). |
| 400 | `invalid_cart` | Carrito vacio o desincronizado con `items` del body. |
| 401 | `unauthorized` | Credenciales invalidas o ausentes. |
| 402 | `payment_rejected` | Orden creada pero la transaccion fallo. Detalle en `errors[]`. |
| 409 | `idempotency_key_conflict` | Misma `X-Idempotency-Key` con body distinto al original. |
| 409 | `stock_unavailable` | Stock insuficiente entre validacion y persistencia. |
| 423 | `idempotency_key_locked` | Otra request con la misma clave esta en proceso. |
| 500 | `idempotency_validation_failed` | Fallo de validacion de idempotencia. |
| 500 | `internal_error` | Error generico. |

Forma del error:

```json
{
  "code": "invalid_total_amount",
  "detail": "total_amount does not match sum of transactions.payments[].amount",
  "errors": [
    {
      "field": "total_amount",
      "expected": "100.00",
      "received": "90.00"
    }
  ]
}
```

## Reglas de validacion clave

1. **Idempotency key obligatoria**. Header ausente -> 400.
   Reintentos con la misma clave y mismo body devuelven la misma
   orden. Misma clave con body distinto -> 409.

2. **Suma de pagos igual al total**. `sum(transactions.payments[].amount)`
   debe ser igual a `total_amount`. Si no -> 400
   `invalid_total_amount`. Aplica tanto cuando hay un solo pago
   como cuando hay varios (pago partido).

3. **Modo `manual` exige `transactions: null`**. Array vacio `[]`
   no es valido y produce 400 `order_builder_without_transactions`.

4. **`payment_method.token` obligatorio para tarjetas**. Cualquier
   `payment_method.type` en `credit_card` o `debit_card` debe traer
   `token` de 32-33 caracteres generado por el SDK del integrador.

5. **`payer.email` obligatorio para no-tarjeta**. OXXO, Paycash,
   Banamex, BBVA, SPEI requieren `payer.email`. Para tarjeta es
   opcional.

6. **`expiration_time` en formato ISO 8601 duration**. Solo
   aplica a metodos asincronos (OXXO, Paycash, etc). Ejemplos:
   `P1D` (1 dia), `PT2H` (2 horas), `P3Y6M4DT12H30M5S`. Si no se
   envia, el backend aplica default por metodo.

7. **`external_reference` con caracteres restringidos**. Maximo
   150 caracteres. Solo `[a-zA-Z0-9_-]`. Caracteres especiales
   (`[ ], (), '', @`) no permitidos.

8. **3DS opcional**. Si `config.online.transaction_security.validation=on_fraud_risk`
   y el backend del integrador exige reto, el response trae
   `status=action_required`, `status_detail=pending_challenge`, y
   `transactions.payments[].payment_method.transaction_security.url`
   con la URL del iframe. El comprador tiene 40 minutos.

## Ejemplos

Todos los ejemplos usan el endpoint del ecommerce
`POST /api/v1/orders/`, no `https://api.mercadopago.com/v1/orders`.
Las shapes derivan del material de MercadoPago adaptadas a la
estructura del template (cookies httpOnly, no Bearer token visible
en frontend).

### Ejemplo 1 — Pago con tarjeta de credito

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: 8a3f4b2c-1e5d-4f6a-9b7c-3e8d2a1b4c5f' \
  --cookie 'access_token=...' \
  -d '{
  "type": "online",
  "external_reference": "ORD-2026-08-1234",
  "transactions": {
    "payments": [{
      "amount": "100.00",
      "payment_method": {
        "id": "master",
        "type": "credit_card",
        "token": "1c87b6b301010101ddcd92f9bbbb3be2",
        "installments": 1,
        "statement_descriptor": "MI TIENDA"
      }
    }]
  },
  "payer": {
    "email": "comprador@example.com",
    "first_name": "Demo",
    "last_name": "User",
    "identification": {
      "type": "CURP",
      "number": "MEMP840321HDFRNSO"
    }
  },
  "shipment": {
    "address": {
      "zip_code": "03940",
      "street_name": "Calle Falsa",
      "street_number": "1602",
      "city": "Ciudad de Mexico",
      "state": "CDMX",
      "complement": "Apto 303"
    }
  },
  "total_amount": "100.00",
  "capture_mode": "automatic",
  "processing_mode": "automatic",
  "description": "Smartphone",
  "items": [{
    "title": "Smartphone",
    "unit_price": "100.00",
    "quantity": 1,
    "external_code": "SKU-12345",
    "picture_url": "https://tu-tienda.example.com/img/smartphone.jpg",
    "category_id": "phones",
    "warranty": true
  }]
}'
```

#### Response 201

```json
{
  "order_number": "ORD-2026-0001234",
  "type": "online",
  "processing_mode": "automatic",
  "external_reference": "ORD-2026-08-1234",
  "total_amount": "100.00",
  "total_paid_amount": "100.00",
  "created_date": "2026-08-26T13:06:51.045Z",
  "last_updated_date": "2026-08-26T13:06:52.130Z",
  "country_code": "MX",
  "status": "processed",
  "status_detail": "accredited",
  "capture_mode": "automatic",
  "shipment": {
    "address": {
      "zip_code": "03940",
      "street_name": "Calle Falsa",
      "street_number": "1602",
      "city": "Ciudad de Mexico",
      "state": "CDMX",
      "complement": "Apto 303"
    }
  },
  "transactions": {
    "payments": [{
      "id": "PAY-2026-0009876",
      "amount": "100.00",
      "paid_amount": "100.00",
      "reference_id": "REF-01JEVQM899NWS",
      "status": "processed",
      "status_detail": "accredited",
      "payment_method": {
        "id": "master",
        "type": "credit_card",
        "installments": 1,
        "statement_descriptor": "MI TIENDA"
      }
    }]
  },
  "items": [{
    "title": "Smartphone",
    "unit_price": "100.00",
    "quantity": 1,
    "external_code": "SKU-12345",
    "picture_url": "https://tu-tienda.example.com/img/smartphone.jpg",
    "category_id": "phones",
    "warranty": true
  }],
  "description": "Smartphone"
}
```

### Ejemplo 2 — Pago con tarjeta de debito

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: 7c1d8e3f-2a9b-4c5d-8e7f-1b2a3c4d5e6f' \
  --cookie 'access_token=...' \
  -d '{
  "type": "online",
  "external_reference": "ORD-2026-08-1235",
  "transactions": {
    "payments": [{
      "amount": "50.00",
      "payment_method": {
        "id": "debvisa",
        "type": "debit_card",
        "token": "9d76a2c401020304eefe83a8aabb4cd1",
        "installments": 1
      }
    }]
  },
  "payer": {
    "email": "comprador@example.com"
  },
  "total_amount": "50.00",
  "processing_mode": "automatic"
}'
```

#### Response 201

```json
{
  "order_number": "ORD-2026-0001235",
  "type": "online",
  "processing_mode": "automatic",
  "external_reference": "ORD-2026-08-1235",
  "total_amount": "50.00",
  "total_paid_amount": "50.00",
  "created_date": "2026-08-26T14:22:10.123Z",
  "last_updated_date": "2026-08-26T14:22:11.456Z",
  "country_code": "MX",
  "status": "processed",
  "status_detail": "accredited",
  "capture_mode": "automatic_async",
  "transactions": {
    "payments": [{
      "id": "PAY-2026-0009877",
      "amount": "50.00",
      "paid_amount": "50.00",
      "reference_id": "REF-01JEVQX102PQR",
      "status": "processed",
      "status_detail": "accredited",
      "payment_method": {
        "id": "debvisa",
        "type": "debit_card",
        "installments": 1
      }
    }]
  }
}
```

### Ejemplo 3 — Pago con voucher OXXO

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: 5b9e1f2a-3c4d-4e5f-6789-0a1b2c3d4e5f' \
  --cookie 'access_token=...' \
  -d '{
  "type": "online",
  "external_reference": "ORD-2026-08-1236",
  "transactions": {
    "payments": [{
      "amount": "150.00",
      "payment_method": {
        "id": "oxxo",
        "type": "ticket"
      },
      "expiration_time": "P3D"
    }]
  },
  "payer": {
    "email": "comprador@example.com",
    "first_name": "Demo",
    "last_name": "User"
  },
  "total_amount": "150.00",
  "processing_mode": "automatic"
}'
```

#### Response 201

```json
{
  "order_number": "ORD-2026-0001236",
  "type": "online",
  "processing_mode": "automatic",
  "external_reference": "ORD-2026-08-1236",
  "total_amount": "150.00",
  "total_paid_amount": "0.00",
  "created_date": "2026-08-26T15:00:00.000Z",
  "last_updated_date": "2026-08-26T15:00:00.000Z",
  "country_code": "MX",
  "status": "action_required",
  "status_detail": "waiting_payment",
  "capture_mode": "automatic_async",
  "transactions": {
    "payments": [{
      "id": "PAY-2026-0009878",
      "amount": "150.00",
      "reference_id": "REF-01JEVR0XYZ123",
      "status": "action_required",
      "status_detail": "waiting_payment",
      "expiration_time": "P3D",
      "date_of_expiration": "2026-08-29T15:00:00.000Z",
      "payment_method": {
        "id": "oxxo",
        "type": "ticket",
        "ticket_url": "https://api.tu-tienda.example.com/vouchers/oxxo/PAY-2026-0009878.pdf",
        "barcode_content": "98765400000150123456789012345678901234",
        "reference": "98765400000150",
        "verification_code": "8901"
      }
    }]
  }
}
```

El frontend usa `ticket_url` para abrir el voucher en una pestana
nueva o descargar el PDF. `barcode_content` se puede renderizar
como codigo de barras si el adoptante prefiere mostrarlo en
pantalla en vez de redirigir al PDF.

### Ejemplo 4 — Pago con SPEI (transferencia)

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: 2a8f4d5e-6b7c-8d9e-1f2a-3b4c5d6e7f8a' \
  --cookie 'access_token=...' \
  -d '{
  "type": "online",
  "external_reference": "ORD-2026-08-1237",
  "transactions": {
    "payments": [{
      "amount": "2500.00",
      "payment_method": {
        "id": "clabe",
        "type": "bank_transfer"
      },
      "expiration_time": "P1D"
    }]
  },
  "payer": {
    "email": "comprador@example.com",
    "first_name": "Demo",
    "last_name": "User"
  },
  "total_amount": "2500.00",
  "processing_mode": "automatic"
}'
```

#### Response 201

```json
{
  "order_number": "ORD-2026-0001237",
  "type": "online",
  "processing_mode": "automatic",
  "external_reference": "ORD-2026-08-1237",
  "total_amount": "2500.00",
  "total_paid_amount": "0.00",
  "created_date": "2026-08-26T16:30:00.000Z",
  "last_updated_date": "2026-08-26T16:30:00.000Z",
  "country_code": "MX",
  "status": "action_required",
  "status_detail": "waiting_transfer",
  "capture_mode": "automatic_async",
  "transactions": {
    "payments": [{
      "id": "PAY-2026-0009879",
      "amount": "2500.00",
      "reference_id": "REF-01JEVR1ABC456",
      "status": "action_required",
      "status_detail": "waiting_transfer",
      "expiration_time": "P1D",
      "date_of_expiration": "2026-08-27T16:30:00.000Z",
      "payment_method": {
        "id": "clabe",
        "type": "bank_transfer",
        "ticket_url": "https://api.tu-tienda.example.com/vouchers/spei/PAY-2026-0009879.pdf",
        "reference": "012345678901234567"
      }
    }]
  }
}
```

El frontend muestra `reference` (la CLABE) y `ticket_url` con las
instrucciones bancarias completas (banco destinatario, concepto,
monto, fecha limite).

### Ejemplo 5 — Pago partido (tarjeta + voucher)

Hipotetico, derivado del patron 03 que MercadoPago contempla pero
no muestra ejemplo. Util cuando el ecommerce ofrece saldo de
cuenta o vouchers de regalo combinables con tarjeta.

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: 3c5d8e9f-1a2b-3c4d-5e6f-7a8b9c0d1e2f' \
  --cookie 'access_token=...' \
  -d '{
  "type": "online",
  "external_reference": "ORD-2026-08-1238",
  "transactions": {
    "payments": [
      {
        "amount": "200.00",
        "payment_method": {
          "id": "master",
          "type": "credit_card",
          "token": "abc123...",
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
  },
  "payer": { "email": "comprador@example.com" },
  "total_amount": "300.00",
  "processing_mode": "automatic"
}'
```

La suma de `payments[].amount` (200 + 100) es igual a
`total_amount` (300). El response trae las dos transacciones
procesadas independientemente, ambas con su propio `status`.

## Patrones de diseno extraidos de la inspiracion

Cada patron se evalua desde la **optica del ecommerce**, no desde
la del integrador.

### Patron 01 — `X-Idempotency-Key` header

**El patron**: header obligatorio que evita doble creacion por
reintentos.

**Donde lo necesita el ecommerce**: en `POST /api/v1/orders/`. Es
**el endpoint donde mas duele un doble** porque crea registro
nuevo (a diferencia de un PATCH idempotente por naturaleza).

**Aplicabilidad**: **Alta**. Patron estandar de la industria.

### Patron 02 — Modos `processing_mode` y `capture_mode`

**El patron**: dos ejes ortogonales:
- `processing_mode`: `automatic` (procesa al crear) | `manual`
  (procesa cuando se llama a un endpoint dedicado).
- `capture_mode`: `automatic` | `manual` (autoriza ahora, captura
  despues) | `automatic_async` (procesa async, estado final llega
  por webhook).

**Aplicabilidad**: **Media**. Util pero opcional segun el modelo
de negocio del adoptante.

### Patron 03 — Jerarquia `Order > transactions > payments[]`

**El patron**: la orden puede tener multiples transacciones, cada
transaccion puede tener multiples pagos. Suma de
`payments[].amount` igual a `total_amount`.

**Aplicabilidad**: **Alta si** el template quiere soportar
vouchers/saldos combinables; **Media** si no es prioridad.

### Patron 04 — `external_reference` como ID propio

**Aplicabilidad**: **Ya presente**. El template ya tiene
`order_number` como human-readable PK.

### Patron 05 — `status` + `status_detail` separados

**Aplicabilidad**: **Alta**. Modeliza la realidad mejor que el
`OrderStatus` plano actual del template.

### Patron 06 — Sub-recursos accionables

**El patron**: las acciones sobre la orden son endpoints dedicados,
no flags en un PATCH generico.

```
POST /api/v1/orders/:order_number/cancel/
POST /api/v1/orders/:order_number/capture/      (si capture=manual)
POST /api/v1/orders/:order_number/process/      (si processing=manual)
POST /api/v1/orders/:order_number/refund/
```

**Aplicabilidad**: **Ya presente parcialmente**.

### Patron 07 — `payment_method` como objeto estructurado

**El patron**: en vez de `paymentMethod: 'mercadopago' | 'paypal'`
(enum plano), un objeto con `id`, `type`, `token`, `installments`,
`statement_descriptor`.

**Aplicabilidad**: **Alta**. Salto cualitativo en la arquitectura
del template.

### Patron 08 — Response varia segun metodo

**Aplicabilidad**: **Alta** si se anaden metodos no-tarjeta.

### Patron 09 — `payer.identification` granular

**Aplicabilidad**: **Media**. Util para factura fiscal.

### Patron 10 — `items[]` desnormalizados congelados

**Aplicabilidad**: **Alta**. Extension trivial del tipo `CartItem`.

### Patron 11 — Errores estructurados con codigo semantico

**Aplicabilidad**: **Alta**. Infraestructura ya existe parcialmente.

### Tres patrones descartados o secundarios

- **`config.online.transaction_security` (3DS)**: el frontend solo
  necesita renderizar la URL si el response la trae; no necesita
  configurarlo en el request. **Fuera de scope del UI**.
- **`client_token`**: solo tiene sentido cuando el frontend
  dialoga directamente con el integrador. **No aplica** al modelo
  ecommerce-habla-con-ecommerce.
- **`integration_data` multi-tenant**: el template es single-tenant
  por diseno. **Fuera de scope**.

### Disciplina de fechas ISO 8601 con `Z`

**Aplicabilidad**: **Media** (disciplina de formato, no rename de
campos).

## Resumen de aplicabilidad al UC `crear-orden`

| Patron | Aplicabilidad |
|--------|---------------|
| `X-Idempotency-Key` | **Alta** |
| `processing_mode` + `capture_mode` | Media |
| `Order > transactions > payments[]` | Alta (si split pay) |
| `external_reference` | Ya presente |
| `status` + `status_detail` | **Alta** |
| Sub-recursos accionables | Ya presente parcialmente |
| `payment_method` objeto | **Alta** |
| Response varia por metodo | **Alta** (si non-card) |
| `payer.identification` | Media |
| `items[]` congelados | **Alta** (extension) |
| Errores con codigo semantico | **Alta** |
| 3DS en config | Fuera de scope (frontend) |
| `client_token` | No aplica al modelo |
| `integration_data` multi-tenant | Fuera de scope |
| Fechas ISO 8601 Z | Media (disciplina) |

## Que entrega este documento

- Caracterizacion completa del UC `crear-orden` como propiedad del
  ecommerce.
- Contrato detallado del endpoint `POST /api/v1/orders/`: header,
  body, response, enums, errores, reglas de validacion.
- 5 ejemplos request/response cubriendo credito, debito, OXXO,
  SPEI y pago partido.
- 15 patrones de diseno evaluados desde el ecommerce.
- Tabla de aplicabilidad preliminar.

## Que NO entrega este documento

- Decision de cuales patrones se adoptan.
- Plan de implementacion.
- Modificacion de codigo del template.
- Implementacion del handler MSW correspondiente.

Esas decisiones viven en `alcance-*.md` y `plan-*.md` que se
produciran cuando todos los UCs propuestos esten estudiados.
