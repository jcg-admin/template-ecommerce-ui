# UC `procesar-orden`

| Campo | Valor |
|-------|-------|
| Iniciativa | `ampliar-ucs-de-ecommerce` |
| Tipo | UC del ecommerce (no del integrador de pago) |
| Endpoint propuesto | `POST /api/v1/orders/{order_number}/process/` |
| UC precondicionante | `agregar-transaccion` (la orden debe tener al menos una transaccion en `created`) |
| UC sucesor opcional | `capturar-orden` (si `capture_mode=manual` y el resultado fue `action_required/waiting_capture`) |
| Estado | En estudio. Sin decisiones de scope tomadas. |
| Fuente de inspiracion | API de MercadoPago `POST /v1/orders/{order_id}/process` (catalogo de campos, errores y ejemplo integrado en este documento). |

## Por que es del ecommerce y no del integrador de pago

Por el mismo principio aplicado a los UCs anteriores: **procesar
una orden manual es un UC del ecommerce**. El comprador o el
sistema del adoptante, despues de haber agregado transacciones a
una orden manual, decide ejecutar el procesamiento.

A diferencia de los UCs `agregar/eliminar/actualizar-transaccion`,
**este UC si invoca al integrador**. Es la primera invocacion al
integrador en el flujo manual: las transacciones nacieron en el
ecommerce, vivieron en estado `created` mientras se editaban, y
solo ahora se ejecutan contra el integrador real.

**Consecuencia para el modelado**:

- **Endpoint del UC**: `POST /api/v1/orders/{order_number}/process/`
  (del ecommerce). Sub-recurso accionable, body vacio. Consistente
  con `/capture/` y `/cancel/`.
- El backend del ecommerce **si llama al integrador en este paso**:
  por cada transaccion en `created`, envia la peticion al
  integrador apropiado (MercadoPago para tarjeta MX, Stripe para
  EU, etc) y recoge el resultado.
- El response del UC consolida los resultados de todas las
  transacciones procesadas y los retorna al cliente.

## Por que existe este UC: cerrar el flujo manual

Este UC es **el cuarto y ultimo eslabon del flujo
`processing_mode=manual`**:

```
crear-orden (processing_mode=manual)
    -> orden contenedor vacio, status=created
agregar-transaccion
    -> transacciones declaradas en status=created
[opcional: actualizar-transaccion | eliminar-transaccion]
    -> ajustes mientras la orden esta en created
procesar-orden (este UC)
    -> integrador invocado por primera vez,
       status pasa a processed | processing | action_required
[opcional: capturar-orden si capture_mode=manual]
    -> captura del monto autorizado
```

Sin este UC, todo lo agregado en `agregar-transaccion` queda
inerte: la orden tiene transacciones declaradas pero nunca
ejecutadas. El flujo manual sin `procesar-orden` no es un flujo;
es un cajon de basura de intenciones no realizadas.

## Diferencia conceptual entre `procesar-orden` y `capturar-orden`

Ambos son endpoints de transicion de estado con body vacio. La
diferencia importa:

| Aspecto | `procesar-orden` | `capturar-orden` |
|---------|------------------|-------------------|
| Estado pre | `status=created`, `processing_mode=manual` | `status=action_required`, `status_detail=waiting_capture`, `capture_mode=manual` |
| Estado post | `processed` / `processing` / `action_required` | `processed` o `processing` |
| Que hace con el integrador | **Lo invoca por primera vez** | Le pide que cobre lo que ya autorizo |
| Quien creo las transacciones | El ecommerce (via `agregar-transaccion`) | El integrador (durante `crear-orden` automatic) |
| Que valida | Suma cuadra con total, hay al menos una transaccion | La transaccion existe y esta en `waiting_capture` |

Los dos UCs **pueden encadenarse**: una orden creada con
`processing_mode=manual` Y `capture_mode=manual` requiere
**procesar primero** (autoriza) y **capturar despues** (cobra).

## Forma del UC

### Actor

- **Comprador** (caso comun en checkout en varios pasos): tras
  agregar metodo de pago, confirma "Pagar ahora" desde
  `OrderPaymentSelectionPage` o equivalente.
- **Sistema del ecommerce** (caso B2B o post-aprobacion): handler
  que dispara el procesamiento tras un evento externo
  (aprobacion gerencial, llegada de stock, scheduler de cobro
  diferido).
- **Admin** (poco frecuente): boton "Procesar pago" en panel
  admin sobre una orden manual lista.

### Pre-condiciones

- Existe una orden con `order_number` valido.
- La orden esta en `status=created` con
  `processing_mode=manual`.
- La orden tiene **al menos una transaccion** en
  `transactions.payments[]`, todas en `status=created`.
- La suma de `transactions.payments[].amount` iguala
  `total_amount` de la orden. La validacion se hace **aqui**, no
  al agregar transacciones (porque mientras se editan, la suma
  puede estar transitoriamente desigual).
- Si alguna transaccion es de tarjeta, su `token` sigue siendo
  valido (los tokens del integrador tienen ventana de uso
  limitada).
- El actor tiene permisos sobre la orden.

### Trigger

El actor envia
`POST /api/v1/orders/{order_number}/process/` con header
`X-Idempotency-Key`.

### Camino feliz (todas las transacciones procesan OK)

1. El actor envia el POST con `X-Idempotency-Key: <uuid v4>`.
2. El backend del ecommerce:
   - Localiza la orden y valida pre-condiciones (estado, modo,
     transacciones presentes, suma consistente).
   - Por cada transaccion en `created`, llama al integrador
     apropiado para ejecutar el pago.
   - Recoge respuestas del integrador y actualiza las
     transacciones a sus nuevos estados.
   - Determina el estado de la orden segun el estado agregado de
     sus transacciones (todas `processed` -> orden `processed`;
     alguna `action_required` -> orden `action_required`).
   - Decrementa inventario si todas las transacciones quedaron
     en `processed` o `action_required` con autorizacion vigente.
3. Respuesta 200 con la orden completa: `id`, `status`,
   `status_detail`, `transactions.payments[]` poblado con los
   resultados, `integration_data` con metadata del integrador,
   `created_date`, `last_updated_date`, etc.
4. El frontend redirige a la pagina de confirmacion si todas
   procesaron, o a la pagina de siguiente accion (iframe 3DS,
   voucher OXXO, instrucciones SPEI, etc) segun el primer
   `status_detail=action_required` que aparezca.

### Caminos alternativos

- **Pago con voucher / SPEI**: las transacciones quedan en
  `status=action_required`, `status_detail=waiting_payment` o
  `waiting_transfer`. El integrador genero el voucher; el
  ecommerce lo devuelve en `payment_method.ticket_url`,
  `barcode_content`, `reference`, etc (igual que en
  `crear-orden`). El comprador paga afuera; el resultado final
  llega por webhook.
- **3DS requerido**: las transacciones de tarjeta de alto riesgo
  quedan en `status=action_required`,
  `status_detail=pending_challenge`. Response trae
  `payment_method.transaction_security.url`. El comprador
  completa el reto.
- **Procesamiento asincrono**: alguna transaccion entra en
  revision manual del integrador; `status=processing`,
  `status_detail=in_process` o `pending_review_manual`. El
  resultado final llega por webhook.
- **Reintento idempotente**: misma `X-Idempotency-Key`
  devuelve el mismo resultado sin volver a invocar al integrador.

### Caminos de fallo

- Orden no existe (404 `order_not_found`).
- Orden no esta en modo manual (400
  `invalid_order_mode_for_operation`).
- Orden no esta en `status=created` (409
  `cannot_process_order`): ya fue procesada, ya esta procesando,
  o esta cancelada.
- Orden sin transacciones agregadas (400 `no_transactions`).
- Suma de `payments[].amount` no cuadra con `total_amount` (400
  `invalid_total_amount`).
- Header `X-Idempotency-Key` ausente (400
  `idempotency_key_missing`).
- Idempotency-key reutilizada con orden distinta (409
  `idempotency_key_conflict`).
- **Fallo parcial** (HTTP 402 `partial_failure`): la orden fue
  procesada pero alguna transaccion fallo. Caso comun en pago
  partido. Respuesta incluye detalle por transaccion.
- **Fallo total** (HTTP 402 `payment_rejected`): todas las
  transacciones fueron rechazadas. El integrador devolvio
  errores para cada una.
- Token de tarjeta expirado (400 `expired_card_token`): el
  comprador agrego la transaccion hace tiempo y procesa cuando
  el token ya no sirve.
- Actor sin permisos (403).

### Post-condiciones

- La orden esta en `status=processed`, `processing`, o
  `action_required` segun el resultado.
- Cada transaccion tiene su `status` y `status_detail`
  actualizados con la respuesta del integrador.
- Si todas procesaron, el inventario esta decrementado.
- Si quedo pendiente accion (voucher, transferencia, 3DS), el
  inventario esta **reservado** con TTL hasta la expiracion del
  metodo de pago.
- Las transacciones han sido **invocadas contra el integrador**;
  ya no pueden eliminarse via `eliminar-transaccion` ni
  actualizarse via `actualizar-transaccion` (ambos UCs solo
  permiten `status=created`).
- Si fue fallo parcial, las transacciones exitosas estan en
  `processed/action_required` y las fallidas en estado terminal
  de fallo (`rejected` o similar).

## Contrato del endpoint

### Header

| Header | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| `X-Idempotency-Key` | string | **si** | Valor unico. UUID v4 o string aleatorio, 1-64 caracteres. **Obligatoria** porque este UC invoca al integrador: sin clave, reintentos pueden cobrar varias veces. |
| `Authorization` | string | si | Cookie httpOnly o Bearer token segun politica del template. |
| `Content-Type` | string | no | El endpoint no recibe body; el header es irrelevante. |

### Path parameters

| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| `order_number` | string | **si** | Identificador human-readable de la orden, retornado por `crear-orden`. Debe corresponder a una orden manual con transacciones agregadas. |

### Body de request

**El body es vacio** (igual que `capturar-orden`). Aplica el
patron 16: endpoint de transicion de estado con body vacio. Toda
la informacion necesaria esta en el path (`order_number`) y en
el estado servidor de la orden (transacciones ya agregadas,
metodo de pago configurado, suma cuadrada).

### Enums

#### `status` (de la orden, en response)

Solo tres valores aparecen como respuesta de este endpoint:

| Valor | Descripcion |
|-------|-------------|
| `processed` | Todas las transacciones se procesaron correctamente. |
| `processing` | Alguna transaccion esta en proceso async (revision manual, autorizacion pendiente). No requiere accion del integrador. |
| `action_required` | Alguna transaccion requiere accion del actor o del comprador (capturar, completar 3DS, pagar voucher, transferir). |

Notese que `created` y `canceled` no son respuestas validas: si
la orden estaba en `created`, este endpoint la **saca** de ese
estado; si estaba en `canceled`, el endpoint emite 409 antes de
procesar.

#### `status_detail` (razon del status)

| Valor | Descripcion |
|-------|-------------|
| `accredited` | Pago acreditado. Aparece con `status=processed`. |
| `waiting_capture` | Pago autorizado, requiere captura via `capturar-orden`. Aparece con `status=action_required` cuando `capture_mode=manual`. |
| `waiting_payment` | Voucher emitido, esperando pago externo. `status=action_required`. |
| `waiting_transfer` | Transferencia esperando. `status=action_required`. |
| `pending_challenge` | 3DS esperando completar. `status=action_required`. |
| `in_process` | Procesamiento async, sin accion. `status=processing`. |
| `pending_review_manual` | Revision manual del integrador. `status=processing`. |

### Response

El response es **completo** (no minimo). Trae la orden con todos
sus campos, incluyendo `transactions.payments[]` ricos con los
resultados del integrador.

**Por que diverge del patron 18** (response minimo en
transiciones), aplicado en `capturar-orden`:

- En `capturar-orden`, el cliente ya tenia la version "rica" de
  la orden: la habia visto en `crear-orden` o en respuestas
  previas. Solo necesita saber que cambio.
- En `procesar-orden`, el cliente **solo habia visto la orden en
  estado `created`** (datos minimos: contenedor con transacciones
  declaradas sin resultado del integrador). La primera version
  "rica" la produce este endpoint, con los datos que el
  integrador acaba de devolver (autorizaciones, IDs del
  integrador, fechas de expiracion, tickets de OXXO, etc).
- **Devolver la orden completa aqui es eficiente**: ahorra al
  cliente una llamada inmediata a
  `GET /api/v1/orders/{order_number}/`.

**Patron 25 (nuevo)**: response completo cuando la operacion
produce la primera version rica del recurso. Complementa al
patron 18.

#### Campos de nivel raiz (response)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `order_number` (o `id`) | string | Identificador de la orden. |
| `processing_mode` | string | `manual` (consistente). |
| `capture_mode` | string | Modo de captura aplicado. |
| `external_reference` | string | El `external_reference` del request inicial. |
| `total_amount` | string | Total. |
| `total_paid_amount` | string | Suma de `paid_amount` de las transacciones. |
| `created_date` | string | ISO 8601 con Z. |
| `last_updated_date` | string | ISO 8601 con Z. |
| `country_code` | string | Pais del adoptante. |
| `type` | string | `online`. |
| `status` | string | Nuevo estado de la orden. Ver enum. |
| `status_detail` | string | Razon del estado. Ver enum. |
| `transactions` | object | Contenedor con las transacciones procesadas. |
| `description` | string | Snapshot. |
| `items` | array | Snapshot congelado. |
| `user_id` | string | Identificador del adoptante en el ecommerce (no del integrador). |

#### `transactions.payments[]` en response

Mismo shape que en `crear-orden`. Incluye campos especificos del
metodo (ticket_url para OXXO, barcode_content, reference,
verification_code, etc) cuando aplican.

### Errores

| HTTP | Codigo | Descripcion |
|------|--------|-------------|
| 400 | `idempotency_key_missing` | Header `X-Idempotency-Key` ausente. |
| 400 | `idempotency_key_invalid_format` | Valor fuera de rango (1-64 caracteres) o invalido. |
| 400 | `invalid_path_param` | `order_number` malformado en la URL. |
| 400 | `invalid_order_mode_for_operation` | La orden no esta en `processing_mode=manual`. |
| 400 | `no_transactions` | La orden no tiene transacciones agregadas. Llamar primero a `agregar-transaccion`. |
| 400 | `invalid_total_amount` | Suma de `payments[].amount` no coincide con `total_amount` de la orden. Validacion ocurre aqui, no al agregar. |
| 400 | `expired_card_token` | El token de tarjeta agregado en una transaccion ya no es valido. El actor debe actualizar la transaccion con un token nuevo via `actualizar-transaccion`. |
| 401 | `unauthorized` | Credenciales invalidas. |
| 402 | `payment_rejected` | Todas las transacciones fueron rechazadas por el integrador. |
| 402 | `partial_failure` | La orden se proceso pero alguna transaccion fallo. Detalle por transaccion en `errors[]`. |
| 403 | `forbidden` | Actor sin permisos sobre esta orden. |
| 404 | `order_not_found` | No existe orden con ese `order_number`. |
| 409 | `cannot_process_order` | La orden ya fue procesada, esta procesando, o esta cancelada. Solo `status=created` con `processing_mode=manual` permite la operacion. |
| 409 | `idempotency_key_conflict` | Misma `X-Idempotency-Key` con orden distinta. |
| 500 | `idempotency_validation_failed` | Fallo de validacion de idempotencia. |
| 500 | `internal_error` | Error generico. |

Forma del error de **fallo parcial** (caso especial con detalle
por transaccion):

```json
{
  "code": "partial_failure",
  "detail": "Order ORD-2026-0001240 was processed but 1 of 2 transactions failed",
  "errors": [
    {
      "transaction_id": "PAY-2026-0009883",
      "code": "card_declined",
      "detail": "Card was declined by the issuer",
      "field": "payment_method.token"
    }
  ]
}
```

## Reglas de validacion clave

1. **Solo en modo manual**. La orden debe tener
   `processing_mode=manual`. En modo `automatic` el procesamiento
   ocurre al crear; este endpoint no aplica.

2. **Solo `status=created`**. Si la orden ya fue procesada,
   esta procesando, o esta cancelada: 409 `cannot_process_order`.
   Igual disciplina que `capturar-orden` con su propia
   restriccion.

3. **Al menos una transaccion**. Sin transacciones agregadas, no
   hay nada que procesar: 400 `no_transactions`.

4. **Suma cuadra con total**. La consistencia
   `sum(payments[].amount) = total_amount` se valida aqui, no al
   agregar. Razon: mientras se editan transacciones via
   `agregar/eliminar/actualizar`, la suma puede estar
   transitoriamente desigual; solo el procesamiento exige
   consistencia.

5. **Idempotency-key obligatoria**. Este UC invoca al
   integrador. Sin clave, reintentos por timeout o re-clicks
   pueden cobrar varias veces al comprador.

6. **El UC invoca al integrador**. A diferencia de los UCs de
   `agregar/eliminar/actualizar/eliminar-transaccion`, este si
   ejecuta llamadas externas. El timeout y las garantias de
   reintento dependen del integrador.

7. **Tokens de tarjeta pueden expirar**. Si una transaccion fue
   agregada hace mucho (e.g. orden manual que estuvo abierta
   varias horas), su token puede haber expirado. El UC reporta
   `expired_card_token` y dirige al actor a `actualizar-transaccion`
   con un token fresco.

## Ejemplos

### Ejemplo 1 — Procesamiento sincrono exitoso (tarjeta de credito)

Caso comun: orden manual con una sola transaccion de tarjeta
agregada, procesa OK al primer intento.

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001240/process/' \
  -H 'X-Idempotency-Key: f1e2d3c4-b5a6-7890-1234-567890abcdef' \
  --cookie 'access_token=...'
```

#### Response 200

```json
{
  "order_number": "ORD-2026-0001240",
  "processing_mode": "manual",
  "capture_mode": "automatic",
  "external_reference": "ORD-2026-08-1240",
  "total_amount": "300.00",
  "total_paid_amount": "300.00",
  "created_date": "2026-08-26T13:00:00.000Z",
  "last_updated_date": "2026-08-26T15:30:25.123Z",
  "country_code": "MX",
  "type": "online",
  "status": "processed",
  "status_detail": "accredited",
  "transactions": {
    "payments": [{
      "id": "PAY-2026-0009880",
      "amount": "300.00",
      "paid_amount": "300.00",
      "reference_id": "REF-01JEVR5XYZ123",
      "status": "processed",
      "status_detail": "accredited",
      "payment_method": {
        "id": "master",
        "type": "credit_card",
        "installments": 3,
        "statement_descriptor": "MI TIENDA"
      }
    }]
  },
  "items": [{
    "title": "Smartphone",
    "unit_price": "300.00",
    "quantity": 1,
    "external_code": "SKU-12345"
  }],
  "description": "Smartphone"
}
```

### Ejemplo 2 — Procesamiento con OXXO (requiere accion del comprador)

Caso comun: orden manual con voucher OXXO. El procesamiento
genera el voucher; el pago real ocurre cuando el comprador va al
OXXO.

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001241/process/' \
  -H 'X-Idempotency-Key: 2c3d4e5f-6a7b-8c9d-1e2f-3a4b5c6d7e8f' \
  --cookie 'access_token=...'
```

#### Response 200

```json
{
  "order_number": "ORD-2026-0001241",
  "processing_mode": "manual",
  "capture_mode": "automatic_async",
  "external_reference": "ORD-2026-08-1241",
  "total_amount": "1500.00",
  "total_paid_amount": "0.00",
  "created_date": "2026-08-26T13:30:00.000Z",
  "last_updated_date": "2026-08-26T15:35:10.456Z",
  "country_code": "MX",
  "type": "online",
  "status": "action_required",
  "status_detail": "waiting_payment",
  "transactions": {
    "payments": [{
      "id": "PAY-2026-0009881",
      "amount": "1500.00",
      "reference_id": "REF-01JEVR6ABC456",
      "status": "action_required",
      "status_detail": "waiting_payment",
      "expiration_time": "P3D",
      "date_of_expiration": "2026-08-29T15:35:10.456Z",
      "payment_method": {
        "id": "oxxo",
        "type": "ticket",
        "ticket_url": "https://api.tu-tienda.example.com/vouchers/oxxo/PAY-2026-0009881.pdf",
        "barcode_content": "98765400000150123456789012345678901234",
        "reference": "98765400000150",
        "verification_code": "8901"
      }
    }]
  },
  "items": [...]
}
```

El frontend muestra el voucher al comprador con instrucciones
para pagar en OXXO en los proximos 3 dias.

### Ejemplo 3 — Pago partido con fallo parcial

Orden con dos transacciones: tarjeta visa por 200 y voucher de
tienda por 100. La tarjeta es rechazada, el voucher se acepta.

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001242/process/' \
  -H 'X-Idempotency-Key: 4e5f6a7b-8c9d-1e2f-3a4b-5c6d7e8f9a1b' \
  --cookie 'access_token=...'
```

#### Response 402

```json
{
  "code": "partial_failure",
  "detail": "Order ORD-2026-0001242 was processed but 1 of 2 transactions failed",
  "errors": [
    {
      "transaction_id": "PAY-2026-0009882",
      "code": "card_declined",
      "detail": "Card was declined by the issuer (insufficient funds)",
      "field": "payment_method.token"
    }
  ],
  "order": {
    "order_number": "ORD-2026-0001242",
    "status": "action_required",
    "status_detail": "waiting_payment",
    "total_amount": "300.00",
    "total_paid_amount": "100.00",
    "transactions": {
      "payments": [
        {
          "id": "PAY-2026-0009882",
          "amount": "200.00",
          "status": "rejected",
          "status_detail": "card_declined"
        },
        {
          "id": "PAY-2026-0009883",
          "amount": "100.00",
          "paid_amount": "100.00",
          "status": "processed",
          "status_detail": "accredited"
        }
      ]
    }
  }
}
```

El frontend muestra el error con el detalle por transaccion y
ofrece al comprador la opcion de actualizar la transaccion
fallida via `actualizar-transaccion` o eliminarla y agregar
otra.

### Ejemplo 4 — Error: orden ya procesada

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001240/process/' \
  -H 'X-Idempotency-Key: 9a1b2c3d-4e5f-6a7b-8c9d-1e2f3a4b5c6d' \
  --cookie 'access_token=...'
```

#### Response 409

```json
{
  "code": "cannot_process_order",
  "detail": "Order ORD-2026-0001240 is in status=processed; only orders in status=created with processing_mode=manual can be processed",
  "errors": [
    {
      "field": "status",
      "expected": "created",
      "received": "processed"
    }
  ]
}
```

### Ejemplo 5 — Error: suma de transacciones no cuadra

Caso: el actor agrego una transaccion por 200, eliminó otra por
100, y procesa con la orden cuyo `total_amount` es 300.

#### Request

```bash
curl -X POST \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001243/process/' \
  -H 'X-Idempotency-Key: 1d2e3f4a-5b6c-7d8e-9f1a-2b3c4d5e6f7a' \
  --cookie 'access_token=...'
```

#### Response 400

```json
{
  "code": "invalid_total_amount",
  "detail": "Sum of transactions.payments[].amount (200.00) does not match order total_amount (300.00). Add or update transactions to make the sum equal before processing.",
  "errors": [
    {
      "field": "transactions.payments[].amount",
      "expected": "300.00",
      "received": "200.00"
    }
  ]
}
```

## Patrones de diseno extraidos de la inspiracion

Este UC introduce un patron nuevo y refuerza varios previos.

### Patron 25 — Response completo cuando la operacion produce la primera version rica

**El patron**: complemento del patron 18 (response minimo en
transiciones). El patron 18 dice "devolver solo lo que cambio".
El patron 25 dice **cuando NO aplicar el patron 18**: cuando la
operacion produce la primera version "rica" del recurso, conviene
devolverla completa.

**Criterios para aplicar 25 en vez de 18**:

- El cliente solo habia visto el recurso en una version
  "delgada" antes (e.g. orden en `created` con datos minimos).
- La operacion produce datos nuevos que el cliente necesita
  ver (e.g. resultados del integrador: autorizaciones, vouchers,
  IDs externos).
- Forzar al cliente a hacer un `GET` inmediatamente despues seria
  un round-trip innecesario.

**Comparacion**:

| Operacion | Estado pre | Estado post | Patron de response |
|-----------|------------|-------------|---------------------|
| `crear-orden` | recurso no existia | rica | Completo (no aplica 18) |
| `procesar-orden` | rica pero "delgada" (sin integrador) | rica con datos del integrador | **Patron 25**: completo |
| `capturar-orden` | rica con datos del integrador | rica con captura | Patron 18: minimo |
| `actualizar-transaccion` | rica | rica con cambio en un campo | Patron 18: minimo (solo el campo) |

**Aplicabilidad**: **Alta**. Disciplina coherente con el patron
18 anterior.

### Patron 26 — Validacion diferida hasta el momento del uso

**El patron**: ciertas validaciones se hacen **al usar** el
recurso, no **al construirlo**. En este UC: la suma de
`payments[].amount` con `total_amount` se valida al procesar, no
al agregar/actualizar/eliminar transacciones.

**Por que diferir**: mientras el actor edita transacciones (las
agrega, las cambia, las elimina), el estado intermedio puede
violar la regla. Si se valida en cada edicion, el actor no puede
construir progresivamente el conjunto de transacciones. Por
ejemplo, no podria eliminar una de 200 y agregar otra de 200 en
dos pasos sin que el primer paso fallara.

**Cuando aplicar**: validaciones cuya unica restriccion es "el
recurso final debe ser consistente". Validaciones de formato, tipo
o rango de campos individuales siguen siendo inmediatas.

**Aplicabilidad**: **Alta**. Generalizable a otros flujos
multi-paso del template (e.g. construir un cupon complejo con
varias condiciones combinadas).

### Patron 27 — Fallo parcial con detalle por sub-recurso

**El patron**: cuando una operacion sobre un recurso compuesto
puede fallar parcialmente (algunas sub-partes OK, otras fallan),
el error HTTP no es ni 2xx ni 4xx puro. La convencion adoptada:

- **HTTP 402** (no 200, porque hubo fallo; no 400, porque hubo
  exito parcial).
- **Code**: `partial_failure` o `payment_rejected` segun
  granularidad.
- **`errors[]`**: detalle por sub-recurso fallado.
- **`order`** (o el recurso afectado): el estado actualizado, con
  cada sub-recurso reflejando su resultado individual.

**Por que importa**: la UI necesita saber **que** fallo y **que**
funciono para guiar al actor. Un 400 generico "transacciones
fallaron" obliga al cliente a hacer un GET para descubrir cuales.

**Aplicabilidad**: **Alta** para todas las operaciones del
template sobre recursos compuestos (pago partido, ordenes
multi-item con stock parcial, etc).

### Patron 16 confirmado por tercera vez — Body vacio en transiciones

`capturar-orden` y `procesar-orden` son los dos UCs canonicos de
transicion de estado con body vacio. `cancelar-orden` (cuando se
modele) sera el tercero. Patron solido.

### Patron 17 vuelve a aplicar — Validacion de estado antes que input

Cuarta aparicion. Aqui se aplica triple:

1. Estado del padre (orden en modo manual).
2. Estado del padre (orden en status=created).
3. Estado de los hijos (transacciones presentes, sumando correcto).

Patron critico, validado por repeticion.

### Patron descartado: response minimo aqui

El UC explicitamente diverge del patron 18 (response minimo en
transiciones) y lo justifica via patron 25. Ambos coexisten como
disciplina: 18 para transiciones de estado puras, 25 para
transiciones que producen la primera version rica.

## Resumen de aplicabilidad al UC `procesar-orden`

| Patron | Aplicabilidad | Origen |
|--------|---------------|--------|
| `X-Idempotency-Key` (patron 01) | **Alta** (critica: invoca integrador) | Heredado |
| Sub-recurso accionable (patron 06) | **Alta** | Heredado |
| Endpoint de transicion con body vacio (patron 16) | **Alta** | Confirmado |
| Validacion de estado antes que input (patron 17) | **Alta** (triple) | Reforzado |
| Response minimo (patron 18) | **N/A aqui** (aplica 25 en su lugar) | - |
| Response completo cuando produce primera version rica (patron 25) | **Alta** | Nuevo |
| Validacion diferida hasta el uso (patron 26) | **Alta** | Nuevo |
| Fallo parcial con detalle por sub-recurso (patron 27) | **Alta** | Nuevo |
| Errores con codigo semantico (patron 11) | **Alta** | Heredado |

## Dependencias con otros UCs

- **`agregar-transaccion`** (UC precondicionante obligatorio):
  sin transacciones agregadas, este UC emite 400 `no_transactions`.
  Los dos UCs **deben adoptarse juntos**.
- **`crear-orden`** con `processing_mode=manual`: dependencia
  transitiva.
- **`actualizar-transaccion`** (UC de soporte): util para
  corregir transacciones antes de procesar (ej. token expirado).
- **`eliminar-transaccion`** (UC de soporte): util para descartar
  transacciones antes de procesar.
- **`capturar-orden`** (UC sucesor opcional): si la orden tiene
  `capture_mode=manual` y el procesamiento la dejo en
  `action_required/waiting_capture`, este UC se llama despues.

## Que entrega este documento

- Caracterizacion del UC `procesar-orden` como cierre del flujo
  manual, propiedad del ecommerce.
- **Diferencia explicita entre `procesar-orden` y `capturar-orden`**:
  ambos son transiciones con body vacio, pero `procesar` invoca
  al integrador por primera vez mientras `capturar` le pide cobrar
  lo ya autorizado.
- Contrato detallado del endpoint
  `POST /api/v1/orders/{order_number}/process/`: header, path,
  body vacio, response completo (con justificacion por que
  diverge del patron 18), 16 errores catalogados incluyendo el
  caso especial de fallo parcial.
- 5 ejemplos: tarjeta exitosa, OXXO con action_required, pago
  partido con fallo parcial, error 409 ya procesada, error 400
  suma incorrecta.
- 7 reglas de validacion clave incluyendo la regla de
  **validacion diferida** (suma se valida al procesar, no al
  agregar).
- **3 patrones nuevos**: (25) response completo cuando produce
  primera version rica, (26) validacion diferida hasta el uso,
  (27) fallo parcial con detalle por sub-recurso.
- Confirmacion de patrones previos heredados.
- **Patron 16 confirmado por tercera vez** (cierra el flujo
  manual con body vacio).

## Que NO entrega este documento

- Decision de cuales patrones se adoptan.
- Plan de implementacion.
- Modificacion de codigo del template.
- UC `cancelar-orden` (alternativa a procesar si el comprador
  abandona).
- UC para reintentar transacciones fallidas tras un partial_failure
  (depende del modelo: puede ser via `actualizar-transaccion` con
  token nuevo + procesar de nuevo, o un UC propio
  `reintentar-transaccion`).

Esas decisiones viven en `alcance-*.md` y `plan-*.md` que se
produciran cuando todos los UCs propuestos esten estudiados.
