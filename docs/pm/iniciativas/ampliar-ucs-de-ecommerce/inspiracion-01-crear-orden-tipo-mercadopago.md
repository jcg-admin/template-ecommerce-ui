# Inspiracion 01 — Crear orden tipo MercadoPago `POST /v1/orders`

| Campo | Valor |
|-------|-------|
| Iniciativa | `ampliar-ucs-de-ecommerce` |
| Fuente | API de MercadoPago, `POST /v1/orders` |
| Fecha de estudio | 2026-05-21 |
| Estado | Estudiado, sin decisiones de scope tomadas |

Este documento es **un estudio descriptivo**. Extrae los patrones de
diseno del endpoint MercadoPago `POST /v1/orders` sin decidir
cuales adoptar; eso pertenece a `analisis-cruce-*.md` y al
`alcance-*.md` que se produciran despues.

## Que hace el endpoint

`POST /v1/orders` crea una orden de pago que puede estar en dos
modos:

- **Automatico**: la orden se procesa en una sola etapa. Se crea y
  el pago se intenta inmediatamente. El response trae el estado
  final del pago (`processed`, `action_required`, `processing`).
- **Manual**: la orden se crea como contenedor vacio de
  transacciones. Las transacciones se anaden despues via
  `POST /v1/orders/{order_id}/transactions` y se procesan via
  `POST /v1/orders/{order_id}/process`. La separacion permite
  reservar capacidad (autorizar) sin cobrar (capturar).

El status code de exito es 201.

## Patrones de diseno identificados

### Patron 01 — Header `X-Idempotency-Key`

**Que es**: header obligatorio con un valor unico por intento de
creacion. El servidor reconoce reintentos con la misma clave y
**no crea una orden duplicada**. Acepta UUID v4 o string aleatorio
de 1 a 64 caracteres.

**Como se materializa**:

```
POST /v1/orders
X-Idempotency-Key: a8e94f6b-7c2d-4a3f-...
```

**Errores asociados**:
- `400 empty_required_header`: header ausente.
- `400 invalid_idempotency_key_length`: fuera de rango.
- `409 idempotency_key_already_used`: clave ya consumida.
- `423 resource_locked`: clave bloqueada (en proceso).
- `500 idempotency_validation_failed`: fallo de validacion.

**Por que importa**: en pagos, el riesgo de doble cobro por
reintentos es real (timeout de red, doble click del usuario,
retry automatico del cliente). El header es el patron canonico de
la industria (Stripe lo usa con el mismo nombre).

### Patron 02 — Modo `automatic` vs `manual` (procesamiento y captura)

**Que es**: dos ejes ortogonales que controlan el ciclo de vida
del pago:

- `processing_mode`: `automatic` (procesa al crear) | `manual`
  (procesa cuando se llama al endpoint `/process`).
- `capture_mode`: `automatic` (autoriza y captura juntos) |
  `manual` (autoriza ahora, captura despues con `/capture`) |
  `automatic_async` (procesa async; el estado final llega por
  webhook).

**Como se materializa**: dos campos opcionales en el body de
creacion. Si `processing_mode=manual`, el array `transactions.payments`
debe ser `null` (no array vacio: error `order_builder_without_transactions`).

**Por que importa**: separa **autorizar** (reservar saldo) de
**capturar** (cobrar realmente). Casos comunes:
- E-commerce que cobra al despachar, no al recibir la orden.
- Reservas de hotel/auto donde se autoriza al reservar y se
  captura al hacer check-in.
- Verificacion previa de saldo sin comprometer fondos.

### Patron 03 — Estructura jerarquica `Order > transactions > payments[]`

**Que es**: el modelo permite **una orden con multiples
transacciones, cada transaccion con multiples pagos**. En la
practica, la orden actual permite solo una transaccion (`transactions`
es objeto, no array) con `transactions.payments[]` array.

**Como se materializa**:

```json
{
  "total_amount": "100.00",
  "transactions": {
    "payments": [
      { "amount": "60.00", "payment_method": { ... } },
      { "amount": "40.00", "payment_method": { ... } }
    ]
  }
}
```

**Regla de consistencia**: la suma de `payments[].amount` debe
igualar `total_amount`. Error `400 invalid_total_amount` si no
coincide.

**Por que importa**: soporta nativamente **pago partido** ("paga
60 con tarjeta y 40 con voucher"), caso comun en e-commerce con
saldos y gift cards.

### Patron 04 — `external_reference` como ID propio del integrador

**Que es**: campo opcional, hasta 150 caracteres, alfanumerico +
guion + guion bajo. Lo asigna el integrador (no MercadoPago) y
sirve para correlacionar la orden con el sistema interno del
integrador.

**Como se materializa**: campo `external_reference` en body. Se
preserva en el response y aparece en notificaciones/webhooks.

**Por que importa**: separa **identidad de dominio** (el numero
de pedido del e-commerce, p.ej. "ORD-2026-08-1234") de
**identidad del proveedor** (el `id` que MercadoPago asigna,
p.ej. `ORD01J49MMW3SSBK5PSV3DFR32959`). Sin esto, el integrador
tiene que mantener una tabla de mapeo.

### Patron 05 — Ciclo de vida con `status` + `status_detail`

**Que es**: dos campos que describen el estado:
- `status` (4-5 valores): estado **macro**. `created`,
  `processed`, `action_required`, `processing`, `canceled`.
- `status_detail` (~7 valores): **razon** del estado.
  `accredited`, `in_process`, `in_review`, `waiting_payment`,
  `waiting_capture`, `waiting_transfer`, `created`.

**Por que importa**: un solo campo de estado mezcla "donde
estoy" con "por que estoy ahi". La separacion permite que la
UI muestre dos cosas:
- Etiqueta corta del estado (chip de color).
- Mensaje explicativo de que pasa o que tiene que hacer el
  comprador.

Comparado con el template actual (`OrderStatus` plano con
`PENDING_PAYMENT`, `PAID`, ...), este modelo es mas expresivo
sin perder simplicidad.

### Patron 06 — Sub-recursos accionables (`/capture`, `/process`, `/transactions`)

**Que es**: acciones sobre la orden no son flags en un PATCH;
son **endpoints dedicados** que representan transiciones de
estado del dominio.

```
POST /v1/orders/{order_id}/capture        captura una autorizacion
POST /v1/orders/{order_id}/process        procesa orden manual
POST /v1/orders/{order_id}/transactions   anade transaccion a orden manual
```

**Por que importa**: REST puro con verbos de dominio. Cada
endpoint:
- Tiene su propio set de validaciones (no se mezclan).
- Tiene su propio idempotency key.
- Tiene sus propios errores especificos.
- Es testeable individualmente.

Comparado con el template actual (`PATCH /api/v1/orders/:id/`
con un objeto generico), este modelo da mas estructura.

### Patron 07 — Pago como dato estructurado, no enum simple

**Que es**: `payment_method` es objeto con `id`, `type`, `token`,
`installments`, `statement_descriptor`. No es un enum string
`'mercadopago' | 'paypal'`.

```json
"payment_method": {
  "id": "master",
  "type": "credit_card",
  "token": "1c87b...",
  "installments": 1,
  "statement_descriptor": "My Store"
}
```

**Familia de tipos** (`payment_method.type`):
`credit_card`, `debit_card`, `ticket` (efectivo: OXXO),
`atm`, `bank_transfer` (SPEI).

**`id`** identifica la marca o canal especifico dentro del
tipo: `visa`, `master`, `debvisa`, `debmaster`, `oxxo`,
`paycash`, `bancomer`, `banamex`, `clabe`.

**Por que importa**: el frontend puede ramificar UI por `type`
sin hardcodear la lista de canales:
- `credit_card`/`debit_card` → form de tarjeta.
- `ticket` → boton "Generar voucher OXXO" + display de barcode.
- `bank_transfer` → display de CLABE + instrucciones.

Y el backend acepta canales nuevos sin cambiar el shape.

### Patron 08 — Idempotencia de respuesta segun metodo de pago

**Que es**: el shape del response **varia segun el medio de
pago** del array `transactions.payments[]`:

- **Tarjeta**: `status=processed`, `status_detail=accredited`.
  Pago cobrado inmediatamente.
- **OXXO/Paycash/etc**: `status=action_required`,
  `status_detail=waiting_payment`. El response trae
  `ticket_url`, `barcode_content`, `reference`,
  `verification_code` para que la UI muestre el voucher al
  comprador.
- **SPEI**: `status=action_required`,
  `status_detail=waiting_transfer`. Trae `ticket_url` con
  instrucciones bancarias.

**Por que importa**: la UI no necesita un endpoint adicional
para obtener los datos del voucher OXXO o las instrucciones SPEI.
Vienen en el mismo response que crea la orden.

### Patron 09 — `payer` opcional y granular

**Que es**: objeto `payer` con `email`, `entity_type` (individual
o association), `first_name`, `last_name`, `identification`
(tipo + numero), `phone` (area_code + number), `address`.

**Requerido condicionalmente**: `email` obligatorio solo para
metodos no-tarjeta (OXXO, SPEI, etc); para tarjeta es opcional
porque el token ya identifica al pagador.

**Por que importa**: en mercados con identificacion fiscal
obligatoria (Mexico CURP/RFC, Argentina CUIT/DNI, Brasil CPF/CNPJ),
el campo `identification` se vuelve obligatorio para la factura
fiscal. El template hoy no tiene este modelo.

### Patron 10 — `items[]` desnormalizados en la orden

**Que es**: la orden lleva su propio array `items[]` con
`title`, `unit_price`, `quantity`, `description`, `external_code`,
`picture_url`, `category_id`, `type`, `warranty`, `event_date`.

**Por que importa**: el snapshot del item se **congela en la
orden**. Si el producto cambia de precio o se elimina del
catalogo despues, la orden sigue siendo legible y reproducible.
El template actual mezcla referencias (`product_id`) con
desnormalizados (`name`, `price` en `CartItem`); el patron
MercadoPago lo formaliza con campos explicitos congelados.

### Patron 11 — `config.online.transaction_security` (3DS)

**Que es**: configuracion de **3D Secure** dentro de `config.online`:

```json
"config": {
  "online": {
    "transaction_security": {
      "validation": "on_fraud_risk",
      "liability_shift": "required"
    },
    "callback_url": "..."
  }
}
```

**Que pasa cuando 3DS se activa**: el response trae
`status=action_required`, `status_detail=pending_challenge`, y
una `url` para mostrar el reto en un iframe. El comprador tiene
40 minutos para completarlo. La UI no hace nada especial mas
alla de renderizar el iframe.

**Por que importa**: 3DS es **requerido por regulacion** en
varias jurisdicciones (PSD2 en Europa, regulacion mexicana). El
template actual no lo modela.

### Patron 12 — `client_token` para operaciones del lado cliente

**Que es**: el response incluye `client_token`, un token de
autorizacion **emitido por orden** que permite ejecutar ciertas
operaciones desde el frontend sin exponer las credenciales del
integrador.

**Por que importa**: separacion de privilegios. El backend del
integrador crea la orden con su `ACCESS_TOKEN` privado, y el
frontend recibe solo el `client_token` para operaciones
limitadas (consultar estado, completar 3DS). El template actual
no tiene este patron.

### Patron 13 — Errores estructurados con codigo + descripcion

**Que es**: cada error tiene un **codigo** (string semantico,
no solo HTTP status) y un mensaje. Ejemplos: `required_properties`,
`property_type`, `invalid_total_amount`, `idempotency_key_already_used`.

**Por que importa**: la UI puede ramificar logica por codigo
sin parsear mensajes de texto. El template usa
`createErrorFromResponse` que ya soporta esto parcialmente, pero
no hay un catalogo de codigos canonicos.

### Patron 14 — `integration_data` para metadatos del integrador

**Que es**: objeto con `integrator_id`, `platform_id`,
`corporation_id`, `sponsor.id`. Identifica **quien** creo la
orden dentro del ecosistema MercadoPago.

**Por que importa**: en sistemas multi-tenant o con sponsors
(p.ej. una plataforma que aloja varias tiendas), el campo
permite atribuir la orden y aplicar reglas/comisiones distintas
sin endpoints separados.

Probablemente fuera de scope para este template (que es
single-tenant por diseno), pero se documenta por completitud.

### Patron 15 — `created_date` / `last_updated_date` en formato ISO 8601 Z

**Que es**: las dos fechas estandar de auditoria, en UTC con
sufijo Z. Formato `yyyy-MM-ddTHH:mm:ss.sssZ`.

**Por que importa**: el template actual usa
`created_at` con formato inconsistente. El nombre `_date` y
formato Z aliviana la conversion de zona horaria en cliente.

## Resumen de patrones identificados

| # | Patron | Aplicabilidad al template (preliminar) |
|---|--------|----------------------------------------|
| 01 | `X-Idempotency-Key` header | **Alta**. Pagos lo necesitan; el template no lo tiene. |
| 02 | `automatic` vs `manual` modes | **Media**. Util para reservas o cobro diferido. Hoy no se ofrece. |
| 03 | `Order > transactions > payments[]` | **Alta** si se quiere pago partido; **media** si no. |
| 04 | `external_reference` | **Alta**. Util incluso sin proveedor externo (separar `order_number` de PK). |
| 05 | `status` + `status_detail` separados | **Alta**. Mejora UI sin perder simplicidad. |
| 06 | Sub-recursos accionables `/capture`, `/process` | **Media**. Solo si se adopta el modo `manual`. |
| 07 | `payment_method` estructurado por type+id | **Alta**. El template tiene `paymentMethod: 'mercadopago' | 'paypal'` plano. |
| 08 | Response varia por metodo (OXXO incluye ticket inline) | **Alta** si se anaden metodos no-tarjeta. |
| 09 | `payer.identification` granular | **Media**. Util para factura fiscal; depende de adopcion del template. |
| 10 | `items[]` desnormalizados congelados | **Alta**. El template ya hace parcial; formalizarlo es facil. |
| 11 | `config.online.transaction_security` (3DS) | **Media**. Necesario para PSD2/SCA; opcional para MX nativo. |
| 12 | `client_token` para operaciones cliente | **Baja**. Complejidad adicional, beneficio dudoso para un template. |
| 13 | Errores estructurados con codigo | **Alta**. Mejora UX y manejo. Parcialmente presente. |
| 14 | `integration_data` multi-tenant | **Fuera de scope**. El template es single-tenant. |
| 15 | `created_date`/`last_updated_date` ISO 8601 Z | **Media**. Renombrar es mecanico; pelea con `created_at` ya extendido. |

## Que sigue

Este documento es estudio descriptivo. Las decisiones de **que
patrones adoptar** y **como** se toman en
`analisis-cruce-inspiraciones-vs-template.md` (despues de recibir
todas las inspiraciones que el usuario quiera pasar) y se
formalizan en `alcance-ampliar-ucs-de-ecommerce.md`.

Patrones que ya destaco como **candidatos fuertes** para
incorporar en el alcance:

- **Patron 01** (idempotency key): casi obligatorio en pagos.
- **Patron 04** (external_reference): trivial de anadir, gran valor.
- **Patron 05** (status + status_detail): mejora la UX sin
  fricion arquitectonica.
- **Patron 07** (payment_method estructurado): alinea el template
  con cualquier integrador serio.
- **Patron 13** (errores con codigo): el template ya tiene
  infraestructura (`createErrorFromResponse`); solo falta
  formalizar el catalogo.

Patrones que destaco como **candidatos a discutir**:

- **Patron 02** (manual/automatic): depende de si el template
  quiere ofrecer "reservar y capturar despues" como capacidad
  estandar.
- **Patron 03** (pago partido): util si el catalogo del template
  soporta vouchers/saldos combinables.
- **Patron 11** (3DS): obligatorio segun jurisdiccion; opcional
  por defecto.

Patrones que destaco como **fuera de scope** probable:

- **Patron 12** (client_token): complejidad excesiva.
- **Patron 14** (integration_data multi-tenant): el template es
  single-tenant.
