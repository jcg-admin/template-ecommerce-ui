# UC `capturar-orden`

| Campo | Valor |
|-------|-------|
| Iniciativa | `ampliar-ucs-de-ecommerce` |
| Tipo | UC del ecommerce (no del integrador de pago) |
| Endpoint propuesto | `POST /api/v1/orders/{order_number}/capture/` |
| UC precondicionante | `crear-orden` con `capture_mode=manual` |
| Estado | En estudio. Sin decisiones de scope tomadas. |
| Fuente de inspiracion | API de MercadoPago `POST /v1/orders/{order_id}/capture` (catalogo completo de campos, enums, errores y ejemplo integrado en este documento). |

## Por que es del ecommerce y no del integrador de pago

Por el mismo principio aplicado a `crear-orden.md`: **capturar una
orden previamente autorizada es un UC del ecommerce**. El comprador
o el sistema del adoptante (manual o automatico tras un evento de
despacho) decide cobrar realmente el monto que estaba reservado.

El integrador de pago entra cuando el ecommerce, ya en marcha el
UC, le pide ejecutar la captura sobre la autorizacion previa. El
integrador no decide cuando capturar; el ecommerce si.

**Consecuencia para el modelado**:

- **Endpoint del UC**: `POST /api/v1/orders/{order_number}/capture/`
  (del ecommerce). Consistente con el patron de sub-recursos
  accionables ya usado por `ordersSlice` para `cancel`. **No** es
  `/api/payments/mercadopago/capture/`.
- El backend del ecommerce traduce internamente la captura a la
  llamada que corresponda al integrador que proceso la
  autorizacion original (puede ser MercadoPago, Stripe, etc).
  Esa traduccion no se expone al frontend.

## Forma del UC

### Actor

Tres actores posibles segun el modelo del adoptante:

- **Sistema del ecommerce** (caso comun): la captura se dispara
  automaticamente al ocurrir un evento de despacho/confirmacion
  (handler post-procesamiento, scheduler diario, webhook de un
  sistema de inventario, etc).
- **Admin** (caso comun en B2B o ventas con revision manual):
  desde un panel admin con un boton "Capturar pago" sobre una
  orden autorizada.
- **Comprador** (caso poco frecuente, alta confianza): si el
  modelo del adoptante permite que el comprador confirme la
  captura desde una pagina de la cuenta tras una accion fuera de
  linea.

El UC en el template prioriza los dos primeros como caminos
canonicos.

### Pre-condiciones

- Existe una orden con `order_number` valido creada por
  `crear-orden`.
- La orden esta en `status=action_required` con
  `status_detail=waiting_capture` (autorizacion vigente sin
  capturar). Cualquier otro estado produce 409.
- La autorizacion del integrador no ha expirado. Cada red de
  tarjetas tiene una ventana de captura (tipicamente 5-7 dias
  para Visa/Mastercard); fuera de esa ventana la autorizacion
  se cae y la captura no es posible.
- El actor (sistema, admin o comprador) tiene permisos para
  ejecutar la captura sobre esa orden.

### Trigger

Depende del actor:

- **Sistema**: handler interno o scheduler invoca el thunk
  `captureOrder(orderNumber)` que ataca
  `POST /api/v1/orders/{order_number}/capture/`.
- **Admin**: boton "Capturar pago" en `AdminOrderDetailPage` u
  hipotetica `AdminPaymentCapturePage` que despacha el thunk.
- **Comprador**: poco frecuente, no se modela en el template
  inicial.

### Camino feliz

1. El actor envia `POST /api/v1/orders/{order_number}/capture/`
   con header `X-Idempotency-Key: <uuid v4>`.
2. El backend del ecommerce:
   - Localiza la orden.
   - Verifica que esta en
     `status=action_required` con
     `status_detail=waiting_capture`.
   - Llama al integrador que proceso la autorizacion original
     pidiendole la captura sobre la transaccion autorizada.
   - Recibe respuesta del integrador; actualiza la orden a
     `status=processed`, `status_detail=accredited` (o
     `processing` / `in_process` si la red de pagos exige
     procesamiento async).
   - Decrementa el inventario si aun no se decremento.
3. Respuesta 200 con la orden actualizada (no 201 como en
   `crear-orden`, porque no hay recurso nuevo).

### Caminos alternativos

- **Captura asincrona**: en algunos canales (debito de algunas
  redes, transferencia preautorizada), la captura no es
  instantanea. El response trae `status=processing`,
  `status_detail=in_process`. El estado final llega despues por
  webhook o consulta.
- **Reintento idempotente**: el actor reenvia la misma request
  con la misma `X-Idempotency-Key`. El backend devuelve **el
  mismo resultado** de la primera captura sin ejecutarla dos
  veces.

### Caminos de fallo

- Orden no existe (404 `order_not_found`).
- Orden existe pero **no esta en estado capturable**
  (`status=action_required`, `status_detail=waiting_capture`
  son las unicas condiciones validas). Cualquier otro estado
  produce 409 `cannot_capture_order`.
- Autorizacion expirada (409 `cannot_capture_order` o
  `operation_not_supported` segun la causa).
- Header `X-Idempotency-Key` ausente (400
  `idempotency_key_missing`).
- Idempotency key reutilizada con request distinta (409
  `idempotency_key_already_used`).
- Integrador rechaza la captura (402 con detalle).
- Actor sin permisos (403, codigo dependiente de la politica
  de auth del template).

### Post-condiciones

- La orden esta en `status=processed` con
  `status_detail=accredited` (caso sincrono) o `status=processing`
  con `status_detail=in_process` (caso async, pendiente de
  webhook).
- La transaccion de pago refleja el monto capturado en
  `transactions.payments[].paid_amount` y su propio
  `status`/`status_detail` actualizados.
- El inventario asociado a la orden esta decrementado.
- Si habia stock reservado con TTL, la reserva se convierte en
  consumo permanente.

## Contrato del endpoint

### Header

| Header | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| `X-Idempotency-Key` | string | **si** | Valor unico por intento. UUID v4 o string aleatorio, 1-64 caracteres. Reintentos con la misma clave devuelven el resultado de la primera captura sin re-ejecutarla. |
| `Authorization` | string | si | Cookie httpOnly o Bearer token segun politica del template. |
| `Content-Type` | string | si | `application/json`. |

### Path parameters

| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| `order_number` | string | **si** | Identificador human-readable de la orden, retornado por `crear-orden`. Debe corresponder a una orden existente en estado capturable. |

### Body de request

**El body es vacio** (`{}` o ausente). El endpoint captura la
totalidad de la autorizacion. La captura parcial (capturar menos
del monto autorizado) es un UC distinto (`capturar-orden-parcial`),
fuera del alcance de este documento.

### Enums

#### `status` (de la orden, en response)

Solo dos valores aparecen como respuesta de este endpoint:

| Valor | Descripcion |
|-------|-------------|
| `processed` | La captura se completo. Todas las transacciones procesadas exitosamente. |
| `processing` | La captura esta en proceso async. No requiere accion del integrador; el estado final llega por webhook. |

Notese que `created`, `action_required` y `canceled` no son
respuestas validas de este endpoint: si la orden no estaba en
`action_required` antes, el endpoint emite 409 antes de tocar la
orden.

#### `status_detail` (razon del status)

| Valor | Descripcion |
|-------|-------------|
| `accredited` | Pago acreditado. Aparece con `status=processed`. |
| `in_process` | Pago en proceso. Aparece con `status=processing`. |

### Response

#### Campos de nivel raiz

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `order_number` | string | Identificador de la orden capturada. Mismo del path param. |
| `status` | string | Nuevo estado de la orden. Ver enum. |
| `status_detail` | string | Razon del estado. Ver enum. |
| `transactions` | object | Contenedor con las transacciones actualizadas. |

#### `transactions.payments[]`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | string | ID del pago. |
| `amount` | string | Monto del pago. |
| `status` | string | Estado del pago tras la captura. Mismo enum que la orden. |
| `status_detail` | string | Razon del estado del pago. |
| `reference_id` | string | ID de referencia del pago. |

Nota: el response es **mas escueto** que el de `crear-orden`. No
incluye `created_date`, `last_updated_date`, `items`, `shipment`,
`payer`, etc. La razon: el endpoint solo confirma la transicion
de estado; los datos completos de la orden ya estan en el
recurso `GET /api/v1/orders/{order_number}/`.

### Errores

| HTTP | Codigo | Descripcion |
|------|--------|-------------|
| 400 | `idempotency_key_missing` | Header `X-Idempotency-Key` ausente. |
| 400 | `idempotency_key_invalid_format` | Valor fuera de rango (1-64 caracteres) o caracteres invalidos. |
| 400 | `invalid_path_param` | `order_number` malformado en la URL. |
| 401 | `unauthorized` | Credenciales invalidas o ausentes. |
| 402 | `payment_rejected` | Integrador rechazo la captura. Detalle en `errors[]`. |
| 403 | `forbidden` | Actor sin permisos sobre esta orden. |
| 404 | `order_not_found` | No existe orden con ese `order_number`. |
| 409 | `idempotency_key_conflict` | Misma `X-Idempotency-Key` usada con request distinta. |
| 409 | `cannot_capture_order` | La orden no esta en estado capturable. Solo `status=action_required` con `status_detail=waiting_capture` permite la operacion. |
| 409 | `operation_not_supported` | La operacion no aplica a esta orden. Causa tipica: autorizacion expirada en el integrador. |
| 500 | `idempotency_validation_failed` | Fallo de validacion de idempotencia. |
| 500 | `internal_error` | Error generico. |

Forma del error (misma envelope que `crear-orden`):

```json
{
  "code": "cannot_capture_order",
  "detail": "Order is in status=processed, only action_required with status_detail=waiting_capture allows capture",
  "errors": [
    {
      "field": "status",
      "expected": "action_required",
      "received": "processed"
    }
  ]
}
```

## Reglas de validacion clave

1. **Idempotency key obligatoria**. Header ausente -> 400.
   Reintentos con la misma clave y mismo `order_number` devuelven
   el mismo resultado. Misma clave con `order_number` distinto ->
   409 `idempotency_key_conflict`.

2. **Solo capturable en estado especifico**. El endpoint exige
   que la orden este exactamente en `status=action_required` con
   `status_detail=waiting_capture`. Cualquier otra combinacion
   produce 409 `cannot_capture_order` **antes** de tocar al
   integrador.

3. **Body vacio**. El endpoint no acepta body. Enviar uno con
   contenido se ignora o produce 400 segun politica del backend.
   Para captura parcial existe un UC distinto.

4. **Ventana de captura del integrador**. El backend del ecommerce
   no controla cuanto tiempo dura la autorizacion en la red de
   tarjetas; si expira, el integrador rechaza y el endpoint emite
   409 `operation_not_supported` con detalle.

5. **Idempotencia sobre el integrador**. La idempotencia es del
   ecommerce, no del integrador. El backend del ecommerce debe
   garantizar que solo una llamada al integrador se hace por
   `X-Idempotency-Key` aunque haya reintentos.

## Ejemplos

Todos los ejemplos usan el endpoint del ecommerce, no
`https://api.mercadopago.com/v1/orders/{id}/capture`.

### Ejemplo 1 — Captura sincrona exitosa

Caso comun: tarjeta de credito autorizada al checkout, despues
el admin confirma despacho y se dispara la captura.

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001234/capture/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: 9b1f4c8e-2d3a-4b5c-6d7e-8f9a0b1c2d3e' \
  --cookie 'access_token=...'
```

#### Response 200

```json
{
  "order_number": "ORD-2026-0001234",
  "status": "processed",
  "status_detail": "accredited",
  "transactions": {
    "payments": [{
      "id": "PAY-2026-0009876",
      "amount": "100.00",
      "status": "processed",
      "status_detail": "accredited",
      "reference_id": "REF-01JEVQM899NWS"
    }]
  }
}
```

### Ejemplo 2 — Captura asincrona (estado pendiente)

Caso comun en algunos canales de debito o cuando el integrador
necesita validacion adicional.

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001235/capture/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: 4e5f6a7b-8c9d-1e2f-3a4b-5c6d7e8f9a0b' \
  --cookie 'access_token=...'
```

#### Response 200

```json
{
  "order_number": "ORD-2026-0001235",
  "status": "processing",
  "status_detail": "in_process",
  "transactions": {
    "payments": [{
      "id": "PAY-2026-0009877",
      "amount": "50.00",
      "status": "processing",
      "status_detail": "in_process",
      "reference_id": "REF-01JEVQX102PQR"
    }]
  }
}
```

El frontend del admin muestra "Captura en proceso, pendiente de
confirmacion" y polea el estado o espera un webhook del backend.

### Ejemplo 3 — Error: orden no capturable

Intento de capturar una orden que ya fue capturada o que nunca
estuvo en estado capturable (e.g. orden con
`processing_mode=automatic` y `capture_mode=automatic`, que se
cobro al crearse).

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001234/capture/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: 1a2b3c4d-5e6f-7a8b-9c1d-2e3f4a5b6c7d' \
  --cookie 'access_token=...'
```

#### Response 409

```json
{
  "code": "cannot_capture_order",
  "detail": "Order ORD-2026-0001234 is in status=processed, only action_required with status_detail=waiting_capture allows capture",
  "errors": [
    {
      "field": "status",
      "expected": "action_required",
      "received": "processed"
    }
  ]
}
```

### Ejemplo 4 — Error: orden inexistente

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-NO-EXISTE/capture/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: 7f8a9b1c-2d3e-4f5a-6b7c-8d9e1f2a3b4c' \
  --cookie 'access_token=...'
```

#### Response 404

```json
{
  "code": "order_not_found",
  "detail": "Order with number ORD-NO-EXISTE does not exist"
}
```

## Patrones de diseno extraidos de la inspiracion

Este UC es el primer **caso concreto** de varios patrones que
`crear-orden.md` ya identifico. Aqui se confirman y, donde aplica,
se anaden patrones nuevos especificos del modo "transicion de
estado".

### Patron 06bis — Sub-recurso accionable confirmado

`POST /api/v1/orders/{order_number}/capture/` es el primer
ejemplo concreto del patron 06 (sub-recursos accionables) en
modo "captura una autorizacion". El template ya tiene
`/cancel/`; este endpoint extiende el conjunto naturalmente.

**Aplicabilidad al template**: **Alta si** se adoptan los modos
manuales de `crear-orden`. Sin `capture_mode=manual` o
`processing_mode=manual`, este endpoint no tiene casos de uso.

### Patron 16 — Endpoint de transicion de estado con body vacio

**El patron**: el endpoint no recibe payload. Toda la informacion
necesaria esta en el path (`order_number`) y en el estado
servidor de la orden. El endpoint solo dispara la transicion.

**Por que importa**: simplifica el contrato. No hay duda sobre
"que campos enviar", no hay validacion de body cruzada con
estado. La unica regla es "la orden esta en el estado correcto".

**Generalizable a**:

- `POST /api/v1/orders/{order_number}/cancel/` (ya existe)
- `POST /api/v1/orders/{order_number}/process/`
- `POST /api/v1/orders/{order_number}/refund/` (cuando es total;
  refund parcial requeriria body con monto)

**Aplicabilidad**: **Alta**. Disciplina simple, consistente.

### Patron 17 — Validacion de estado antes que de input

**El patron**: el endpoint **valida primero el estado servidor**
de la orden, no el input del cliente. Si el estado no permite la
operacion, emite 409 `cannot_capture_order` antes de tocar al
integrador o ejecutar logica.

**Por que importa**: evita efectos colaterales por intentos en
estados invalidos (e.g. capturar dos veces, capturar una orden
cancelada). Es el equivalente REST de una guarda en un state
machine.

**Generalizable a**:

- Cancelar una orden ya cancelada: 409.
- Procesar una orden ya procesada: 409.
- Reembolsar una orden sin cobrar: 409.

**Aplicabilidad**: **Alta**. Disciplina critica para integridad.

### Patron 18 — Response minimo en transiciones

**El patron**: el response solo trae los campos que cambiaron
(`status`, `status_detail`, transacciones afectadas). No
re-emite los campos inmutables (items, payer, shipment,
created_date). El cliente que necesite la orden completa hace
`GET /api/v1/orders/{order_number}/`.

**Por que importa**: separa **el comando** (capture) de **la
consulta** (read). Reduce ancho de banda, evita pelearse con
caches de datos inmutables. Hace explicito que la captura no
muta items ni payer.

**Aplicabilidad**: **Alta**. CQRS suave en HTTP.

### Patron 02 reforzado — Modo `manual` tiene sentido

Este UC **no existe** sin `capture_mode=manual` en `crear-orden`.
Si el template adopta solo `capture_mode=automatic`, este UC es
inutil. Decision de proceso:

> **Si el alcance final no incluye `capture_mode=manual` ni
> `processing_mode=manual` en `crear-orden`, este UC no se
> implementa.**

Se anota como dependencia explicita.

### Patron descartado: idempotencia mas debil que `crear-orden`

El material original solo lista 6 errores especificos para este
endpoint, sin todas las variantes de `crear-orden`
(`unsupported_properties`, `property_type`, etc). Razon: el body
es vacio, asi que no hay propiedades que validar. La idempotencia
sigue siendo obligatoria pero el catalogo de errores es mas
pequeno.

**Aplicabilidad**: **N/A**. Simplemente reconocer que un endpoint
con body vacio tiene menos modos de fallo.

## Resumen de aplicabilidad al UC `capturar-orden`

| Patron | Aplicabilidad | Origen |
|--------|---------------|--------|
| `X-Idempotency-Key` (patron 01) | **Alta** | Heredado de `crear-orden` |
| Sub-recurso accionable (patron 06) | **Alta** | Confirmado por este UC |
| Body vacio en transiciones (patron 16) | **Alta** | Nuevo |
| Validacion de estado antes que de input (patron 17) | **Alta** | Nuevo |
| Response minimo (patron 18) | **Alta** | Nuevo |
| Modo `manual` necesario (patron 02 reforzado) | **Dependencia** | Heredado |
| `status` + `status_detail` (patron 05) | **Alta** | Heredado |
| Errores con codigo semantico (patron 11) | **Alta** | Heredado |

## Dependencias con otros UCs

- **`crear-orden`** (UC precondicionante): la captura solo aplica
  sobre ordenes creadas con `capture_mode=manual`. Si el alcance
  final de la iniciativa no incluye el modo manual, este UC se
  descarta.
- **`cancelar-orden`** (UC complementario, ya parcialmente en el
  template): una orden autorizada pero no capturada puede
  cancelarse en vez de capturarse. La cancelacion libera la
  autorizacion en la red de tarjetas (transicion equivalente).
  Probablemente se modele en un UC propio (`cancelar-orden.md`)
  cuando llegue el momento.

## Que entrega este documento

- Caracterizacion del UC `capturar-orden` como propiedad del
  ecommerce.
- Contrato detallado del endpoint
  `POST /api/v1/orders/{order_number}/capture/`: header, path,
  body vacio, response, enums acotados (2 status, 2
  status_detail), 12 errores catalogados.
- 4 ejemplos request/response: captura sincrona, captura async,
  orden no capturable, orden inexistente.
- 3 patrones nuevos (16, 17, 18) identificados a partir de este
  UC: body vacio, validacion de estado, response minimo.
- Confirmacion de patrones previos heredados de `crear-orden`.
- Identificacion de la dependencia critica con `capture_mode=manual`.

## Que NO entrega este documento

- Decision de cuales patrones se adoptan.
- Plan de implementacion.
- Modificacion de codigo del template.
- UC de captura parcial (capturar monto distinto al autorizado);
  ese seria `capturar-orden-parcial.md` si se decide modelar.
- UC de liberar autorizacion sin capturar (eso es
  `cancelar-orden.md` o equivalente).

Esas decisiones viven en `alcance-*.md` y `plan-*.md` que se
produciran cuando todos los UCs propuestos esten estudiados.
