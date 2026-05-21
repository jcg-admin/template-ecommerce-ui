# UC `crear-orden`

| Campo | Valor |
|-------|-------|
| Iniciativa | `ampliar-ucs-de-ecommerce` |
| Tipo | UC del ecommerce (no del integrador de pago) |
| Estado | En estudio. Sin decisiones de scope tomadas. |
| Fuente de inspiracion (parcial) | Patrones del endpoint `POST /v1/orders` de MercadoPago, entre otros. |

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
   `payment_method`, `shipment`, `payer`, `external_reference`).
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
     `processed` (status `accredited`) si OK, o a `action_required`
     si falta algo (challenge 3DS, etc).
4. Respuesta 201 con la orden, su `status`, su `status_detail`, y
   el detalle de la transaccion de pago.
5. El frontend redirige a la pagina de confirmacion o, si
   `status=action_required`, a la pagina que muestra el siguiente
   paso (iframe 3DS, voucher OXXO, instrucciones SPEI).

### Caminos alternativos

- **Pago con voucher (OXXO, Paycash)**: `status=action_required`,
  `status_detail=waiting_payment`. La respuesta incluye los datos
  para mostrar el voucher (URL, codigo de barras, referencia).
- **Pago con transferencia (SPEI)**: `status=action_required`,
  `status_detail=waiting_transfer`. Incluye instrucciones bancarias.
- **3DS requerido (tarjeta de alto riesgo)**:
  `status=action_required`, `status_detail=pending_challenge`. El
  response trae la URL del reto; el frontend la muestra en iframe.
- **Reintento idempotente**: el frontend reenvia la misma request
  con la misma `X-Idempotency-Key` por timeout o reintento de red.
  El backend devuelve **la misma orden** sin crearla dos veces.

### Caminos de fallo

- Carrito vacio o desincronizado con `items` (400 con codigo
  `invalid_cart`).
- `total_amount` no coincide con la suma calculada (400 con codigo
  `invalid_total_amount`).
- Idempotency key reutilizada con body distinto (409
  `idempotency_key_conflict`).
- Pago rechazado por el integrador (402 con detalle del banco).
- Stock insuficiente entre validacion y persistencia (409
  `stock_unavailable`).

### Post-condiciones

- En el ecommerce existe una orden con `order_number` unico,
  asociada al comprador, con snapshot de `items` y `total_amount`
  congelados, con `payment_method` registrado, con `status` y
  `status_detail` reflejando el resultado.
- Si el pago se completo, el inventario se decrementa.
- Si el pago quedo pendiente (voucher, transferencia, 3DS), el
  ecommerce reserva el stock con TTL hasta la expiracion del pago.

## Patrones de diseno extraidos de la inspiracion

Cada uno se evalua en `Aplica al template` desde la optica del
ecommerce, no del integrador de pago.

### Header `X-Idempotency-Key`

**El patron**: header obligatorio que evita doble creacion por
reintentos.

**Donde lo necesita el ecommerce**: en `POST /api/v1/orders/`. Es
**el endpoint donde mas duele un doble** porque crea registro
nuevo (a diferencia de un PATCH idempotente por naturaleza).

**Como se expresa en el contrato del ecommerce**:

```
POST /api/v1/orders/
X-Idempotency-Key: <uuid v4 generado por el frontend>
```

Errores asociados (codigos del ecommerce, no de MercadoPago):

- `400 idempotency_key_missing`
- `400 idempotency_key_invalid_format`
- `409 idempotency_key_conflict` cuando la misma clave se usa con
  body distinto.
- `423 idempotency_key_locked` cuando otra request con la misma
  clave esta en proceso.

**Aplicabilidad**: **Alta**. Patron estandar de la industria.

### Modos `processing_mode` y `capture_mode`

**El patron**: dos ejes ortogonales:
- `processing_mode`: `automatic` (procesa al crear) | `manual`
  (procesa cuando se llama a un endpoint dedicado).
- `capture_mode`: `automatic` (autoriza y captura juntos) | `manual`
  (autoriza ahora, captura despues) | `automatic_async` (procesa
  async, estado final llega por webhook).

**Donde lo necesita el ecommerce**:

- `processing_mode=manual` permite **carritos guardados como
  pre-ordenes** que se procesan despues (e.g. listas de regalos,
  pedidos B2B con aprobacion).
- `capture_mode=manual` permite **autorizar sin cobrar**: util para
  reservas (hoteles, alquileres), o para esperar confirmacion de
  stock antes de cobrar.
- `capture_mode=automatic_async` permite metodos de pago
  inherentemente asincronos (transferencia bancaria) sin bloquear
  la UI.

**Aplicabilidad**: **Media**. Util pero opcional segun el modelo de
negocio del adoptante. El template puede ofrecerlo como capacidad
documentada que el adoptante activa cuando lo necesita.

### Jerarquia `Order > transactions > payments[]`

**El patron**: la orden puede tener multiples transacciones, cada
transaccion puede tener multiples pagos. Suma de
`payments[].amount` igual a `total_amount`.

**Donde lo necesita el ecommerce**: **pago partido**. Casos comunes:

- "Pago 60 con tarjeta y 40 con voucher de regalo."
- "Pago 80 con tarjeta de credito y 20 con saldo de la cuenta."
- B2B donde una orden grande se paga en varias transferencias.

El template actual no soporta esto. La estructura jerarquica deja
la puerta abierta sin obligar.

**Aplicabilidad**: **Alta si** el template quiere soportar
vouchers/saldos combinables; **Media** si no es prioridad.

### `external_reference` como ID propio

**El patron**: campo opcional que el cliente del API asigna para
correlacionar con su sistema interno.

**Donde lo necesita el ecommerce**: el ecommerce **es** el cliente
del API del integrador. El ecommerce asigna su `order_number` y se
lo pasa al integrador como `external_reference` para
correlacionarlo en webhooks/reportes.

A nivel del UC `crear-orden` del ecommerce, el equivalente es
**permitir que el adoptante del template asigne su propio
`order_number`** en vez de obligar a usar el `id` interno. El
template hoy ya lo tiene (`order_number` como human-readable PK,
declarado en `Order` de `domain.ts`), asi que **ya cumple**.

**Aplicabilidad**: **Ya presente**. Solo formalizar el
mapeo backend ↔ integrador en documentacion.

### `status` + `status_detail` separados

**El patron**: dos campos en lugar de uno:
- `status`: estado **macro** (5 valores). `created`, `processed`,
  `action_required`, `processing`, `canceled`.
- `status_detail`: razon especifica (~7 valores). `accredited`,
  `in_process`, `in_review`, `waiting_payment`, `waiting_capture`,
  `waiting_transfer`, `created`.

**Donde lo necesita el ecommerce**: el template hoy tiene
`OrderStatus` plano con valores `PENDING_PAYMENT`, `PAID`,
`PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`.
Mezcla "donde esta el pago" con "donde esta el envio" en un solo
campo.

El patron separado permite:
- `payment_status` con valores del ciclo de pago.
- `fulfillment_status` con valores del ciclo de envio
  (`pending`, `processing`, `shipped`, `delivered`).
- O un `status` macro + `status_detail` que diferencia los dos
  ejes.

**Aplicabilidad**: **Alta**. Modeliza la realidad mejor.

### Sub-recursos accionables

**El patron**: las acciones sobre la orden son endpoints dedicados,
no flags en un PATCH generico.

```
POST /api/v1/orders/:order_number/cancel/
POST /api/v1/orders/:order_number/capture/      (si capture=manual)
POST /api/v1/orders/:order_number/process/      (si processing=manual)
POST /api/v1/orders/:order_number/refund/
```

**Donde lo necesita el ecommerce**: el template **ya hace esto
parcialmente**. `ordersSlice` declara:

- `POST /api/v1/orders/:order_number/cancel/`
- `POST /api/v1/admin/orders/:order_number/status/`
- `POST /api/v1/admin/orders/:order_number/cancel/`

Lo extiende el patron: anadir `/capture/` y `/process/` si se
adoptan los modos manuales, mantener la disciplina de sub-recursos.

**Aplicabilidad**: **Ya presente parcialmente**. Extension natural
si se adoptan modos manuales.

### `payment_method` como objeto estructurado

**El patron**: en vez de `paymentMethod: 'mercadopago' | 'paypal'`
(enum plano), un objeto:

```json
{
  "id": "master",           // marca o canal
  "type": "credit_card",    // familia
  "token": "...",           // token de tarjeta si aplica
  "installments": 1,        // si aplica
  "statement_descriptor": "..."
}
```

**Familia de tipos** (`type`):
`credit_card`, `debit_card`, `ticket`, `atm`, `bank_transfer`,
y los que vengan.

**Donde lo necesita el ecommerce**: el template hoy tiene
`paymentMethod: 'mercadopago' | 'paypal'` (enum plano sobre el
**integrador**, no sobre el **metodo**). Esto fuerza al frontend a
saber que MercadoPago hace tarjeta y PayPal hace su propio
checkout, perdiendo la abstraccion.

El patron estructurado:
- Desacopla **metodo** (lo que el comprador usa) del **integrador**
  (quien lo procesa).
- Un mismo metodo (`credit_card`) puede procesarse por integradores
  distintos (MercadoPago para MX, Stripe para EU); el frontend no
  cambia.
- Anadir un metodo nuevo (Apple Pay, Google Pay) no cambia el
  contrato, solo anade un `type` o un `id`.

**Aplicabilidad**: **Alta**. Salto cualitativo en la arquitectura
del template.

### Response varia segun metodo

**El patron**: el response de `POST /api/v1/orders/` trae datos
distintos segun el metodo:

- Tarjeta procesada: solo `status=processed`, `status_detail=accredited`.
- OXXO: ademas `ticket_url`, `barcode_content`, `reference`,
  `verification_code`.
- SPEI: ademas `ticket_url` con instrucciones bancarias y
  `expiration_time`.
- 3DS: ademas `transaction_security.url` con el reto.

**Donde lo necesita el ecommerce**: si el ecommerce ofrece metodos
no-tarjeta, la UI necesita estos datos **en el mismo response que
crea la orden**, no en una segunda llamada. Evita race conditions
("creo la orden, ahora pido el voucher; mientras tanto el usuario
ya esta en otra pantalla").

**Aplicabilidad**: **Alta** si se anaden metodos no-tarjeta;
**N/A** si solo tarjetas (el template hoy solo modela 2 integradores
de tarjeta).

### `payer.identification` granular

**El patron**: payer con identificacion fiscal:

```json
"payer": {
  "email": "...",
  "first_name": "...",
  "last_name": "...",
  "identification": {
    "type": "CURP",
    "number": "MEMP840321HDFRNSO"
  }
}
```

**Donde lo necesita el ecommerce**: para emitir **factura fiscal**.
En Mexico CFDI requiere RFC; Argentina factura A requiere CUIT;
Brasil NFe requiere CPF/CNPJ. El template hoy tiene `User` parcial
que no modela esto.

**Aplicabilidad**: **Media**. Depende de si el adoptante necesita
factura fiscal (B2B casi siempre, B2C variable). Cruza con la
iniciativa pausada `completar-dominio-de-ecommerce` que iba a
extender `User`.

### `items[]` desnormalizados congelados

**El patron**: la orden lleva su propio array de items con snapshot
de cada producto (`title`, `unit_price`, `quantity`,
`picture_url`, `category_id`). Si el producto cambia despues, la
orden conserva como estaba al comprar.

**Donde lo necesita el ecommerce**: **el template ya lo hace
parcialmente**. `Order.items?: CartItem[]` y `CartItem` lleva
`name`, `price`, `quantity`. Pero `picture_url`, `category_id`,
`description` no estan en `CartItem`.

**Aplicabilidad**: **Alta**. Extension trivial del tipo. Garantiza
que ver una orden vieja muestra el producto **como era cuando se
compro**, no como esta hoy.

### Errores estructurados con codigo semantico

**El patron**: cada error tiene `code` (string semantico) +
`message`. Ejemplos: `invalid_total_amount`, `idempotency_key_conflict`,
`stock_unavailable`.

**Donde lo necesita el ecommerce**: el template ya tiene
`createErrorFromResponse` y `serializeApiError` que preservan
codigo, statusCode, validationErrors. Falta **el catalogo
canonico** de codigos del ecommerce.

**Aplicabilidad**: **Alta**. Infraestructura ya existe; el catalogo
se documenta en un ADR o en un modulo `src/utils/apiErrorCodes.ts`.

### Tres patrones explicitamente descartados o secundarios

- **`config.online.transaction_security` (3DS)**: el frontend del
  ecommerce solo necesita renderizar la URL en iframe si el
  response lo indica; no necesita el campo de configuracion en el
  request. Decision del backend; **fuera de scope del UI** salvo
  el camino del response.
- **`client_token`**: tiene sentido cuando el frontend dialoga
  directamente con el integrador (modelo de MercadoPago). El
  ecommerce que estamos modelando **no expone el integrador al
  frontend**; el frontend solo habla con el ecommerce. Por tanto
  **no aplica** salvo que se redisene el flujo.
- **`integration_data` multi-tenant**: el template es single-tenant
  por diseno. **Fuera de scope**.

### Fechas ISO 8601 con `Z`

**El patron**: `created_date` / `last_updated_date` en formato
`yyyy-MM-ddTHH:mm:ss.sssZ`.

**Donde lo necesita el ecommerce**: el template usa `created_at`
sin sufijo Z. Renombrar es churn; mantener el sufijo Z al emitir
es la garantia real. **Aplicabilidad: Media**. Mejor formalizar
disciplina de formato que renombrar campos.

## Resumen de aplicabilidad al UC `crear-orden` del ecommerce

| Patron | Aplicabilidad | Origen del patron |
|--------|---------------|-------------------|
| `X-Idempotency-Key` | **Alta** | MercadoPago, tambien Stripe |
| `processing_mode` + `capture_mode` | Media | MercadoPago |
| `Order > transactions > payments[]` | Alta (si split pay) | MercadoPago |
| `external_reference` | Ya presente | MercadoPago, comun |
| `status` + `status_detail` | **Alta** | MercadoPago |
| Sub-recursos accionables | Ya presente | REST, MercadoPago lo formaliza |
| `payment_method` objeto | **Alta** | MercadoPago, Stripe lo hace similar |
| Response varia por metodo | **Alta** (si non-card) | MercadoPago |
| `payer.identification` | Media | MercadoPago, regulacion fiscal |
| `items[]` congelados | **Alta** (extension) | MercadoPago, e-commerce comun |
| Errores con codigo semantico | **Alta** | MercadoPago, REST maduro |
| 3DS en config | Fuera de scope (frontend) | MercadoPago |
| `client_token` | No aplica al modelo | MercadoPago |
| `integration_data` multi-tenant | Fuera de scope | MercadoPago |
| Fechas ISO 8601 Z | Media (disciplina) | MercadoPago |

## Que entrega este documento

- Caracterizacion del UC `crear-orden` como propiedad del ecommerce.
- Separacion explicita ecommerce vs integrador de pago.
- 15 patrones evaluados desde la optica del ecommerce, no desde la
  optica del integrador.
- Senalizacion preliminar de cuales tienen alta aplicabilidad para
  el alcance.

## Que NO entrega este documento

- Decision de cuales patrones se adoptan.
- Plan de implementacion.
- Modificacion de codigo.

Esas decisiones viven en `alcance-*.md` y `plan-*.md` que se
produciran cuando todas las UCs propuestas esten estudiadas.
