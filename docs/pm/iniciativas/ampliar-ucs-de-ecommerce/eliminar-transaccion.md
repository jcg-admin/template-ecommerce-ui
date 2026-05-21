# UC `eliminar-transaccion`

| Campo | Valor |
|-------|-------|
| Iniciativa | `ampliar-ucs-de-ecommerce` |
| Tipo | UC del ecommerce (no del integrador de pago) |
| Endpoint propuesto | `DELETE /api/v1/orders/{order_number}/transactions/{transaction_id}/` |
| UC precondicionante | `agregar-transaccion` (la transaccion debe existir y estar en `created`) |
| UC simetrico | `agregar-transaccion` (este UC deshace lo que aquel hace) |
| Estado | En estudio. Sin decisiones de scope tomadas. |
| Fuente de inspiracion | API de MercadoPago `DELETE /v1/orders/{order_id}/transactions/{transaction_id}` (catalogo de campos, errores y ejemplo integrado en este documento, con dos divergencias documentadas). |

## Por que es del ecommerce y no del integrador de pago

Por el mismo principio aplicado a los UCs anteriores: **eliminar
una transaccion de pago de una orden manual es un UC del
ecommerce**. El comprador, sistema o admin del adoptante decide
revertir una transaccion declarada antes de procesarla.

El integrador no se involucra en este UC: la transaccion vive
solo en la base de datos del ecommerce mientras esta en estado
`created`. No se llamo al integrador para crearla; tampoco se le
llama para eliminarla.

**Consecuencia para el modelado**:

- **Endpoint del UC**: `DELETE /api/v1/orders/{order_number}/transactions/{transaction_id}/`
  (del ecommerce). Sub-sub-recurso, consistente con la jerarquia
  REST de `agregar-transaccion`.
- El backend del ecommerce solo elimina el registro. No hay
  llamada al integrador en este paso.
- Si la transaccion **ya fue procesada** (e.g. el integrador
  cobro el monto en una tarjeta), eliminarla seria dejar un
  cobro huerfano sin orden asociada. **El UC prohibe explicitamente
  eliminar transacciones procesadas**; para esos casos existe el
  UC distinto de reembolso.

## Por que existe este UC: simetria con `agregar-transaccion`

Este UC es **el complemento simetrico** de `agregar-transaccion`
en el flujo `processing_mode=manual`:

```
agregar-transaccion -> transaccion en created
                       (orden contiene la transaccion declarada)
        ↓
eliminar-transaccion (este UC)
        ↓
                       (transaccion eliminada, orden vuelve a
                        ser contenedor vacio si era la unica)
        ↓
agregar-transaccion (otra vez, posiblemente con datos distintos)
```

Sin este UC, el comprador o el sistema **no pueden corregir** una
transaccion mal agregada antes de procesarla. Tendrian que
cancelar la orden entera y crearla de nuevo. Habilitar la
eliminacion da granularidad: corregir solo el metodo de pago sin
perder la orden.

**Casos de uso tipicos**:

- **Comprador se equivoca**: agrego OXXO pero prefiere transferencia.
  Elimina la transaccion OXXO, agrega una nueva con SPEI.
- **Sistema corrige tras evento externo**: B2B donde el sistema
  agrego un metodo y la aprobacion posterior cambia el metodo
  acordado.
- **Token de tarjeta invalido**: el comprador agrego una tarjeta
  con token que expiro antes de procesarla; elimina y agrega de
  nuevo.

## Forma del UC

### Actor

- **Comprador** (caso comun): elimina su propia transaccion
  desde una pagina como `OrderPaymentSelectionPage` antes de
  confirmar el procesamiento.
- **Sistema del ecommerce** (B2B): corrige tras evento externo.
- **Admin** (poco frecuente): solo si el modelo del adoptante
  permite que el admin manipule pagos en nombre del comprador
  antes de procesar.

### Pre-condiciones

- Existe una orden con `order_number` valido.
- La orden esta en `status=created` con
  `processing_mode=manual`.
- La transaccion con `transaction_id` existe y pertenece a esa
  orden.
- **La transaccion esta en `status=created`**. Cualquier otro
  estado (especialmente `processed`, `processing`,
  `action_required`) bloquea la eliminacion para evitar dejar
  un cobro huerfano.
- El actor tiene permisos sobre la orden.

### Trigger

El actor envia `DELETE /api/v1/orders/{order_number}/transactions/{transaction_id}/`.

### Camino feliz

1. El actor envia el DELETE con la orden y la transaccion en la
   URL.
2. El backend del ecommerce:
   - Localiza la orden y verifica `status=created`,
     `processing_mode=manual`.
   - Localiza la transaccion y verifica que pertenece a la orden.
   - Verifica que la transaccion esta en `status=created`.
   - Elimina la transaccion (hard-delete o soft-delete segun
     politica del template; ver decision en seccion siguiente).
3. Respuesta 204 No Content **sin body**.
4. El frontend actualiza la UI quitando la transaccion eliminada
   y, si era la unica, vuelve a mostrar el selector de metodo de
   pago.

### Caminos alternativos

- **Reintento sobre transaccion ya eliminada**: el segundo DELETE
  devuelve 404 (transaccion no encontrada). Esto es comportamiento
  HTTP estandar: DELETE es idempotente, pero "ya no existe" se
  reporta como 404, no como 204. Algunos integradores prefieren
  204 en ambos casos; el UC del ecommerce **prefiere 404** por
  claridad de auditoria.

### Caminos de fallo

- Orden no existe (404 `order_not_found`).
- Transaccion no existe en esa orden (404
  `transaction_not_found`).
- Orden no esta en modo manual (400
  `invalid_order_mode_for_operation`).
- **Transaccion ya procesada** (409
  `cannot_delete_processed_transaction`). Para reembolsar usar
  el UC `reembolsar-orden` o equivalente.
- Actor sin permisos (403).

### Post-condiciones

- La transaccion ya no aparece en `transactions.payments[]` de
  la orden.
- Si era la unica transaccion, la orden queda como contenedor
  vacio en `status=created`, lista para recibir nuevas
  transacciones via `agregar-transaccion`.
- Si habia varias transacciones (pago partido) y se elimino una,
  **la orden queda en estado inconsistente**: la suma de
  `payments[].amount` ya no iguala `total_amount`. Procesar la
  orden en ese estado fallaria. El frontend debe forzar al actor
  a completar el monto faltante con otra `agregar-transaccion`
  antes de procesar.

## Contrato del endpoint

### Header

| Header | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| `X-Idempotency-Key` | string | **opcional** | Divergencia consciente respecto al material de MercadoPago. HTTP DELETE es idempotente por semantica; el ecommerce no exige idempotency key para esta operacion. Si el actor lo envia, el backend puede usarlo para detectar reintentos pero no es obligatorio. |
| `Authorization` | string | si | Cookie httpOnly o Bearer token segun politica del template. |
| `Content-Type` | string | no | El endpoint no recibe body; el header es irrelevante. |

**Nota de divergencia**: el material original menciona el error
`idempotency_key_already_used` (HTTP 409) sin declarar el header
en los `Request parameters`. Esa inconsistencia se resuelve aqui
**no exigiendo idempotency key** en el UC del ecommerce. Si el
backend del integrador la exige internamente, el backend del
ecommerce la genera por su cuenta; no se filtra al frontend.

### Path parameters

| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| `order_number` | string | **si** | Identificador human-readable de la orden. |
| `transaction_id` | string | **si** | ID del payment retornado por `agregar-transaccion`. |

### Body de request

El endpoint **no recibe body**. Cualquier contenido en el body se
ignora o produce 400 segun politica del backend.

### Response

**El endpoint retorna `204 No Content` sin body.**

**Nota de correccion del material**: el material original muestra
`"string"` como response example, lo cual contradice el codigo
204 (No Content significa exactamente eso: sin body). El UC del
ecommerce respeta la semantica HTTP estricta: 204 = body vacio.

### Errores

| HTTP | Codigo | Descripcion |
|------|--------|-------------|
| 400 | `invalid_path_param` | `order_number` malformado en la URL. |
| 400 | `invalid_transaction_id` | `transaction_id` malformado en la URL. |
| 400 | `invalid_order_mode_for_operation` | La orden no esta en `processing_mode=manual`. |
| 401 | `unauthorized` | Credenciales invalidas o ausentes. |
| 403 | `forbidden` | Actor sin permisos sobre esta orden o transaccion. |
| 404 | `order_not_found` | No existe orden con ese `order_number`. |
| 404 | `transaction_not_found` | La orden existe pero no tiene una transaccion con ese `transaction_id`. |
| 409 | `cannot_delete_processed_transaction` | La transaccion existe pero esta en `status` distinto a `created` (e.g. `processed`, `processing`, `action_required`). Para revertir pagos procesados usar el UC de reembolso. |
| 500 | `internal_error` | Error generico. |

Forma del error (misma envelope que UCs previos):

```json
{
  "code": "cannot_delete_processed_transaction",
  "detail": "Transaction PAY-2026-0009880 is in status=processed; only transactions in status=created can be deleted. Use the refund UC instead.",
  "errors": [
    {
      "field": "status",
      "expected": "created",
      "received": "processed"
    }
  ]
}
```

## Reglas de validacion clave

1. **Solo en modo manual**. La orden debe estar en
   `processing_mode=manual`. En modo `automatic` no hay
   transacciones "declaradas pero no procesadas" que eliminar;
   las transacciones nacen procesadas o intentadas.

2. **Solo transacciones en `status=created`**. Esta regla es
   critica: eliminar una transaccion que ya invoco al integrador
   dejaria un cobro huerfano. El backend del ecommerce **rechaza
   con 409** cualquier intento sobre transacciones en otro
   estado y **dirige al actor** al UC apropiado (reembolso).

3. **DELETE es idempotente; "ya no existe" se reporta como 404,
   no 204**. Decision del UC para claridad de auditoria. Reintentos
   del cliente sobre una transaccion ya eliminada deben verse en
   los logs como 404, no confundirse con eliminaciones nuevas.

4. **Eliminar deja la orden potencialmente inconsistente**. Si
   la transaccion eliminada era parte de un pago partido y
   quedan otras transacciones con suma menor a `total_amount`,
   el siguiente intento de `procesar-orden` fallara con
   `invalid_total_amount`. El frontend debe guiar al actor a
   completar el monto antes de procesar.

5. **Sin idempotency-key obligatoria**. Divergencia consciente
   respecto al material. Si el integrador interno la exige, el
   backend del ecommerce la genera; no se filtra al frontend.

6. **Hard-delete vs soft-delete: politica del template**. El
   contrato HTTP es el mismo (204), pero internamente el backend
   puede:
   - **Hard-delete**: borra el registro. Mas simple, no deja
     rastro.
   - **Soft-delete**: marca la transaccion como eliminada pero
     conserva el registro para auditoria. Recomendado para
     B2B con requisitos de trazabilidad.
   El UC del ecommerce no impone una; el adoptante decide segun
   su politica de auditoria.

## Ejemplos

### Ejemplo 1 — Eliminar transaccion exitosa

Caso comun: el comprador agrego una tarjeta y antes de confirmar
el procesamiento decide cambiar a transferencia.

#### Request

```bash
curl -X DELETE \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001240/transactions/PAY-2026-0009880/' \
  --cookie 'access_token=...'
```

#### Response 204

```
(sin body)
```

Tras esta operacion, la orden `ORD-2026-0001240` ya no tiene la
transaccion `PAY-2026-0009880`. Si era la unica, la orden vuelve
a estar como contenedor vacio.

### Ejemplo 2 — Error: transaccion ya procesada

#### Request

```bash
curl -X DELETE \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001234/transactions/PAY-2026-0009876/' \
  --cookie 'access_token=...'
```

#### Response 409

```json
{
  "code": "cannot_delete_processed_transaction",
  "detail": "Transaction PAY-2026-0009876 is in status=processed; only transactions in status=created can be deleted. Use the refund UC instead.",
  "errors": [
    {
      "field": "status",
      "expected": "created",
      "received": "processed"
    }
  ]
}
```

El frontend redirige al actor al flujo de reembolso si
corresponde, o muestra mensaje de que la transaccion no puede
deshacerse desde aqui.

### Ejemplo 3 — Error: transaccion no existe en la orden

#### Request

```bash
curl -X DELETE \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001240/transactions/PAY-NO-EXISTE/' \
  --cookie 'access_token=...'
```

#### Response 404

```json
{
  "code": "transaction_not_found",
  "detail": "Order ORD-2026-0001240 does not have a transaction with id PAY-NO-EXISTE"
}
```

### Ejemplo 4 — Error: orden no esta en modo manual

#### Request

```bash
curl -X DELETE \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001234/transactions/PAY-2026-0009876/' \
  --cookie 'access_token=...'
```

#### Response 400

```json
{
  "code": "invalid_order_mode_for_operation",
  "detail": "Order ORD-2026-0001234 has processing_mode=automatic; transactions cannot be deleted from orders in automatic mode",
  "errors": [
    {
      "field": "processing_mode",
      "expected": "manual",
      "received": "automatic"
    }
  ]
}
```

### Ejemplo 5 — Reintento sobre transaccion ya eliminada

#### Request

```bash
curl -X DELETE \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001240/transactions/PAY-2026-0009880/' \
  --cookie 'access_token=...'
```

#### Response 404

```json
{
  "code": "transaction_not_found",
  "detail": "Order ORD-2026-0001240 does not have a transaction with id PAY-2026-0009880"
}
```

Reintento idempotente desde la optica del cliente (volver a
intentar borrar lo que ya no existe), pero el backend lo trata
como 404 para distinguir auditorialmente "eliminacion exitosa"
de "intento sobre algo que ya no estaba".

## Patrones de diseno extraidos de la inspiracion

Este UC introduce dos patrones nuevos y reafirma algunos previos.

### Patron 22 — UC simetrico de un par add/remove

**El patron**: ciertos UCs viven en pares simetricos. Por cada
"agregar X a Y" suele existir un "eliminar X de Y" complementario
que opera sobre el mismo recurso compuesto.

**Pares simetricos en el dominio de la orden**:

| Agregar | Eliminar |
|---------|----------|
| `agregar-transaccion` | `eliminar-transaccion` (este UC) |
| Futuro `agregar-item` | Futuro `eliminar-item` |
| Futuro `agregar-cupon` | Futuro `eliminar-cupon` |

**Por que importa**: la simetria sugiere que el contrato y las
validaciones de uno deben corresponderse con las del otro.
Tipicamente:
- Mismas pre-condiciones de estado del recurso padre.
- Mismas restricciones de quien puede hacerlo.
- Validaciones inversas: el "agregar" valida que el recurso
  hijo es nuevo; el "eliminar" valida que existe y es
  eliminable.

**Aplicabilidad**: **Alta**. Disciplina de diseno para futuros
UCs del template.

### Patron 23 — Restriccion de eliminacion por estado del hijo

**El patron**: en un recurso compuesto (orden con transacciones),
**la eliminacion del hijo depende del estado del hijo**, no solo
del padre. El padre puede estar en estado valido pero el hijo
en estado no-eliminable.

Aplicado aqui:
- La orden esta en `status=created` y `processing_mode=manual`:
  estado del **padre** permite operacion.
- Pero la transaccion esta en `status=processed`: estado del
  **hijo** la bloquea.

**Por que importa**: la validacion de eliminacion **no es
monolitica**. El UC debe distinguir dos clases de error:
- "El recurso padre no permite la operacion en absoluto" (400
  `invalid_order_mode_for_operation`).
- "El recurso padre permite, pero este hijo especifico no es
  eliminable por su estado" (409
  `cannot_delete_processed_transaction`).

**Aplicabilidad**: **Alta** para todos los UCs de
"eliminar/modificar hijo de un recurso compuesto".

### Patron 17 vuelve a aplicar — Validacion de estado antes que de input

Como en `capturar-orden` y `agregar-transaccion`: validacion del
estado servidor antes de procesar. Aqui se aplica **doble**:

1. Estado del padre (orden en modo manual y status=created).
2. Estado del hijo (transaccion en status=created).

### Patron 20 reforzado — Sub-recurso sin body

Como en `capturar-orden`. DELETE sin body es un caso especial:
no es transicion de estado (capture/cancel/process) pero tampoco
agrega contenido (transactions). Es **un tercer tipo**: eliminar
contenido existente. El patron 20 se extiende:

| Familia | Body | Ejemplos |
|---------|------|----------|
| **Transicion de estado** | Vacio | POST `/capture/`, POST `/cancel/`, POST `/process/` |
| **Anadir contenido** | Con datos | POST `/transactions/`, POST `/items/` |
| **Eliminar contenido** | Vacio | DELETE `/transactions/:id/`, DELETE `/items/:id/` |

### Patron descartado: idempotency-key obligatoria

Decision del UC: el material de MercadoPago menciona
`idempotency_key_already_used` pero no declara el header en el
contrato. Esa ambiguedad se resuelve **no exigiendo el header**
en el UC del ecommerce, apoyandose en la idempotencia natural
del verbo DELETE. Documentado como divergencia consciente, no
como omision.

### Patron descartado: 204 con body

El material muestra `"string"` como response example a un 204.
Es contradiccion semantica HTTP. El UC del ecommerce **no
preserva** esta inconsistencia: 204 = body vacio, sin
excepciones.

## Resumen de aplicabilidad al UC `eliminar-transaccion`

| Patron | Aplicabilidad | Origen |
|--------|---------------|--------|
| `X-Idempotency-Key` (patron 01) | **No obligatorio** (divergencia consciente) | Heredado pero relajado |
| Sub-recurso accionable (patron 06) | **Alta** | Heredado |
| Validacion de estado antes que input (patron 17) | **Alta** (doble: padre + hijo) | Reforzado |
| Sub-recurso con/sin body (patron 20) | **Extension** (tercera familia: eliminar contenido) | Extendido |
| Errores con codigo semantico (patron 11) | **Alta** | Heredado |
| Restriccion del integrador documentada (patron 21) | **N/A** aqui (no hay restriccion del integrador) | - |
| UC simetrico de un par add/remove (patron 22) | **Alta** | Nuevo |
| Restriccion de eliminacion por estado del hijo (patron 23) | **Alta** | Nuevo |

## Dependencias con otros UCs

- **`agregar-transaccion`** (UC simetrico precondicionante): este
  UC solo tiene sentido si existe el otro. Los dos se adoptan
  juntos o ninguno.
- **`crear-orden`** con `processing_mode=manual`: dependencia
  transitiva via `agregar-transaccion`.
- **`reembolsar-orden`** (UC complementario para transacciones
  ya procesadas): para revertir cobros consumados. Probablemente
  se modele como `reembolsar-orden.md` o
  `reembolsar-transaccion.md` segun granularidad.
- **`cancelar-orden`** (UC alternativo a nivel orden): si el
  comprador quiere abandonar la orden entera en vez de corregir
  una transaccion, ese UC aplica. Ambos coexisten.

## Que entrega este documento

- Caracterizacion del UC `eliminar-transaccion` como propiedad
  del ecommerce.
- Contrato detallado del endpoint
  `DELETE /api/v1/orders/{order_number}/transactions/{transaction_id}/`:
  header (idempotency-key opcional, divergencia consciente),
  path params, sin body, response 204 sin body (correccion del
  material), 9 errores catalogados.
- 5 ejemplos request/response: eliminacion exitosa, error 409
  procesada, error 404 inexistente, error 400 modo invalido,
  reintento sobre eliminada.
- 6 reglas de validacion clave.
- 2 patrones nuevos (22 UC simetrico add/remove, 23 restriccion
  de eliminacion por estado del hijo).
- Extension del patron 20 a tercera familia (eliminar
  contenido).
- Dos divergencias conscientes del material original (no exigir
  idempotency-key, 204 sin body) documentadas explicitamente.

## Que NO entrega este documento

- Decision de cuales patrones se adoptan.
- Plan de implementacion.
- Modificacion de codigo del template.
- UC `reembolsar-orden` / `reembolsar-transaccion` para revertir
  pagos procesados.
- UC para modificar (PATCH) una transaccion en `created` en vez
  de eliminarla; el material no documenta este endpoint y el UC
  del ecommerce no lo asume.

Esas decisiones viven en `alcance-*.md` y `plan-*.md` que se
produciran cuando todos los UCs propuestos esten estudiados.
