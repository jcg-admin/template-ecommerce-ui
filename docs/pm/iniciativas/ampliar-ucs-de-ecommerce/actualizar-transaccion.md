# UC `actualizar-transaccion`

| Campo | Valor |
|-------|-------|
| Iniciativa | `ampliar-ucs-de-ecommerce` |
| Tipo | UC del ecommerce (no del integrador de pago) |
| Endpoint propuesto | `PUT /api/v1/orders/{order_number}/transactions/{transaction_id}/` |
| UC precondicionante | `agregar-transaccion` (la transaccion debe existir y estar en `created`) |
| UC alternativo | `eliminar-transaccion` + `agregar-transaccion` (mismo efecto, distinto `transaction_id`) |
| Estado | En estudio. Sin decisiones de scope tomadas. |
| Fuente de inspiracion | API de MercadoPago `PUT /v1/orders/{order_id}/transactions/{transaction_id}` (catalogo de campos, errores y ejemplo integrado en este documento, con varias divergencias documentadas). |

## Por que es del ecommerce y no del integrador de pago

Por el mismo principio aplicado a los UCs anteriores: **actualizar
el metodo de pago de una transaccion en una orden manual es un UC
del ecommerce**. El actor decide cambiar como se va a pagar antes
de procesar.

El integrador no se involucra en este UC: la transaccion vive
solo en la base de datos del ecommerce mientras esta en estado
`created`. No se llamo al integrador para crearla; tampoco se le
llama para actualizarla.

## Por que existe este UC: alternativa a eliminar + agregar

Conceptualmente, **actualizar es equivalente a eliminar la
transaccion anterior y agregar una nueva con datos distintos**.
Surge la pregunta: ¿es necesario tener este UC si ya existen
`eliminar-transaccion` y `agregar-transaccion`?

**Si, por tres razones**:

### Razon 1: Preservacion del `transaction_id`

`update` preserva el `transaction_id` original; `delete + add`
genera uno nuevo. Esto importa cuando:

- Hay UI que referencia el `transaction_id` activo (ej. un panel
  admin con una pestana abierta sobre la transaccion).
- Hay sistemas externos del adoptante que ya tomaron el
  `transaction_id` original (ej. emisor de factura
  pre-asignada).
- Hay logs/audits donde el cambio queda como evento sobre la
  misma entidad ("transaccion X cambio metodo de pago") en vez
  de dos eventos ("transaccion X eliminada", "transaccion Y
  creada").

### Razon 2: Atomicidad

`update` es una sola operacion atomica. `delete + add` son dos
operaciones; entre medias, la orden puede quedar transitoriamente
sin transacciones, lo cual:

- Permite que otra request observe un estado intermedio
  inconsistente.
- Si el `add` falla tras un `delete` exitoso, la orden queda
  sin metodo de pago hasta que el actor reintente.

### Razon 3: Reduccion del churn de idempotency-keys

Cada `agregar-transaccion` consume una idempotency-key del lado
del cliente. Hacer `delete + add` en vez de `update` duplica el
consumo. Para flujos donde el actor cambia de opinion varias
veces, el `update` es menos pesado de gestionar.

**Casos de uso tipicos**:

- **Comprador cambia de tarjeta**: agrego Visa, prefiere Master.
  Actualiza la transaccion preservando su id en el sistema.
- **Comprador cambia metodo**: agrego tarjeta, prefiere SPEI.
  Cambio de `type` y `id` del `payment_method`.
- **Comprador ajusta detalle**: cambio de `installments` (cuotas)
  o `statement_descriptor` sin cambiar tarjeta.

## Forma del UC

### Actor

- **Comprador** (caso comun): cambia datos de su transaccion
  pendiente desde `OrderPaymentSelectionPage` antes de procesar.
- **Sistema del ecommerce**: actualiza tras un evento externo
  (e.g. el SDK del integrador devuelve un token nuevo porque el
  anterior expiro).
- **Admin** (poco frecuente): modela de adoptante que permite al
  admin asistir en la edicion de pagos.

### Pre-condiciones

- Existe una orden con `order_number` valido.
- La orden esta en `status=created` con
  `processing_mode=manual`.
- La transaccion con `transaction_id` existe y pertenece a la
  orden.
- **La transaccion esta en `status=created`**. Mismo razonamiento
  que `eliminar-transaccion`: actualizar una transaccion ya
  procesada cambiaria retrospectivamente el metodo de pago de un
  cobro real, problema serio de integridad.
- El actor tiene permisos sobre la orden.
- Si el nuevo `payment_method.type` es tarjeta, el actor ha
  generado un `token` valido via SDK del integrador.

### Trigger

El actor envia `PUT /api/v1/orders/{order_number}/transactions/{transaction_id}/`
con header `X-Idempotency-Key` y body con el nuevo
`payment_method`.

### Camino feliz

1. El actor arma el body con el `payment_method` actualizado.
2. El actor envia el PUT con `X-Idempotency-Key: <uuid v4>`.
3. El backend del ecommerce:
   - Localiza la orden y verifica `status=created`,
     `processing_mode=manual`.
   - Localiza la transaccion y verifica que pertenece a la orden.
   - Verifica que la transaccion esta en `status=created`.
   - Valida el formato del nuevo `payment_method` (token si es
     tarjeta, etc).
   - Actualiza el `payment_method` de la transaccion preservando
     `id`, `amount`, `status`.
   - **No llama al integrador** (la transaccion sigue en
     `created`).
4. Respuesta 200 con el `payment_method` actualizado.
5. El frontend refresca la UI mostrando el nuevo metodo.

### Caminos alternativos

- **Reintento idempotente**: misma `X-Idempotency-Key` con mismo
  body devuelve el mismo estado actual de la transaccion sin
  re-aplicar el cambio.
- **Cambio entre tipos de pago** (tarjeta a OXXO o viceversa):
  permitido porque el shape del `payment_method` cambia (token
  opcional, etc); el backend valida el shape correcto del nuevo
  type.

### Caminos de fallo

- Orden no existe (404 `order_not_found`).
- Transaccion no existe en esa orden (404
  `transaction_not_found`).
- Orden no esta en modo manual (400
  `invalid_order_mode_for_operation`).
- **Transaccion ya procesada** (409
  `cannot_update_processed_transaction`).
- Header `X-Idempotency-Key` ausente (400
  `idempotency_key_missing`).
- Idempotency-key reutilizada con body distinto (409
  `idempotency_key_conflict`).
- Tarjeta sin `token`, o token invalido (400 `required_properties`).
- Actor sin permisos (403).

### Post-condiciones

- La transaccion conserva su `id`, su `amount` y su `status`
  (`created`).
- El `payment_method` de la transaccion es el nuevo.
- El integrador **no ha sido invocado**.
- Si hay UI o sistemas externos referenciando el
  `transaction_id`, esas referencias siguen siendo validas.

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
| `order_number` | string | **si** | Identificador human-readable de la orden. |
| `transaction_id` | string | **si** | ID del payment retornado por `agregar-transaccion`. |

### Body de request

#### Campos de nivel raiz

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `payment_method` | object | **si** | Nuevo metodo de pago. Reemplaza el anterior. |

**Nota de correccion del material**: el material original
clasifica `payment_method` bajo "Path parameters" cuando es
claramente body (es un objeto con sub-campos como `id`, `type`,
`token`, etc). Es el segundo error de clasificacion del mismo
tipo que ya aparecio en `agregar-transaccion.md`. El UC del
ecommerce corrige: `payment_method` es body.

**Nota sobre `amount`**: el material **no permite** actualizar
`amount` (no aparece en los Request parameters). El UC del
ecommerce respeta esta restriccion conscientemente: cambiar el
monto es conceptualmente distinto y debe hacerse via `eliminar`
+ `agregar` para que el cambio sea explicito y auditable. Si el
adoptante necesita cambiar `amount` con frecuencia, ese seria un
UC propio (`actualizar-amount-transaccion`) fuera del scope de
este.

#### `payment_method`

Mismo shape que en `agregar-transaccion`:

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `id` | string | opcional | Canal/marca. Mismo enum que `crear-orden`. |
| `type` | string | opcional | Familia. Mismo enum que `crear-orden`. |
| `token` | string | condicional | **Requerido si `type` es tarjeta**. 32-33 caracteres. |
| `installments` | integer | opcional | Numero de cuotas. |
| `statement_descriptor` | string | opcional | Texto en estado de cuenta. Maximo 50 caracteres. |

### Verbo HTTP: PUT vs PATCH

El material usa **PUT**, pero la semantica HTTP estricta de PUT
es **reemplazo total del recurso** (RFC 7231 seccion 4.3.4). Solo
permitir actualizar `payment_method` (no `amount`, no `status`)
es **actualizacion parcial**, semanticamente mas cercano a PATCH.

**Decision del UC del ecommerce**: mantener PUT para consistencia
con el material y porque el frontend del template tipicamente no
distingue PUT de PATCH para este caso. Pero se documenta
explicitamente que **la semantica real es "reemplaza el campo
`payment_method`"**, no "reemplaza la transaccion entera".

Si el adoptante prefiere PATCH para que la semantica HTTP sea
estricta, el contrato funcional es identico. La eleccion no
afecta al frontend del template.

### Response

#### Campos de nivel raiz

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `payment_method` | object | El metodo de pago actualizado (eco del request). |

**Nota sobre response minimo**: el response **no incluye** la
transaccion completa (`id`, `amount`, `status`). Solo confirma el
nuevo `payment_method`. Aplicacion del patron 18 de
`capturar-orden.md` (response minimo en transiciones), aunque
aqui no hay transicion de estado; es **response minimo en
actualizaciones**. Para ver la transaccion completa, el frontend
hace `GET /api/v1/orders/{order_number}/`.

#### `payment_method` en response

Mismo shape que el del request, ecoando los valores aplicados.

### Errores

| HTTP | Codigo | Descripcion |
|------|--------|-------------|
| 400 | `idempotency_key_missing` | Header `X-Idempotency-Key` ausente. |
| 400 | `idempotency_key_invalid_format` | Valor fuera de rango (1-64 caracteres) o invalido. |
| 400 | `invalid_path_param` | `order_number` malformado en la URL. |
| 400 | `invalid_transaction_id` | `transaction_id` malformado en la URL. |
| 400 | `required_properties` | Faltan propiedades requeridas (ej. `token` para tarjeta). |
| 400 | `property_type` | Tipo incorrecto. |
| 400 | `property_value` | Valor invalido (ej. `type` o `id` fuera del enum). |
| 400 | `invalid_order_mode_for_operation` | La orden no esta en `processing_mode=manual`. |
| 401 | `unauthorized` | Credenciales invalidas. |
| 403 | `forbidden` | Actor sin permisos sobre esta orden o transaccion. |
| 404 | `order_not_found` | No existe orden con ese `order_number`. |
| 404 | `transaction_not_found` | La orden existe pero no tiene esa transaccion. |
| 409 | `cannot_update_processed_transaction` | La transaccion existe pero esta en `status` distinto a `created`. Para revertir un cobro consumado usar el UC de reembolso. |
| 409 | `idempotency_key_conflict` | Misma `X-Idempotency-Key` usada con body distinto. |
| 500 | `idempotency_validation_failed` | Fallo de validacion de idempotencia. |
| 500 | `internal_error` | Error generico. |

Forma del error (misma envelope que UCs previos):

```json
{
  "code": "cannot_update_processed_transaction",
  "detail": "Transaction PAY-2026-0009876 is in status=processed; only transactions in status=created can be updated. Use the refund UC to revert processed payments.",
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

1. **Idempotency-key obligatoria**. Header ausente -> 400.
   Reintentos con misma clave y mismo body devuelven la
   transaccion sin re-aplicar la actualizacion. Esto **diverge**
   de `eliminar-transaccion` donde la idempotency-key es
   opcional; aqui es obligatoria porque el PUT lleva body con
   datos que pueden tener efectos colaterales (e.g. consumir un
   token de tarjeta que solo se puede usar una vez segun politica
   del integrador).

2. **Solo en modo manual**. La orden debe estar en
   `processing_mode=manual`. Mismo razonamiento que UCs previos
   del flujo manual.

3. **Solo transacciones en `status=created`**. Critica. Actualizar
   una transaccion ya procesada cambiaria retrospectivamente el
   metodo de pago de un cobro real. **Esta regla no esta en el
   material original** y es anadido consciente del UC. Sin ella,
   el ecommerce queda expuesto a inconsistencias graves.

4. **Solo `payment_method` es modificable**. El UC explicitamente
   no permite cambiar `amount`, `status`, ni ningun otro campo
   de la transaccion. Cambiar `amount` debe hacerse via
   `eliminar` + `agregar` para que el cambio sea explicito.

5. **Token obligatorio para tarjetas**. Igual que en `crear-orden`
   y `agregar-transaccion`: `payment_method.type` en
   `credit_card`/`debit_card` exige `token` de 32-33 caracteres.

6. **Sin efecto sobre `id` ni `amount`**. La actualizacion
   preserva el `transaction_id` y el `amount`. Cualquier
   referencia externa al `transaction_id` sigue siendo valida.

7. **Sin llamada al integrador**. El backend del ecommerce solo
   actualiza el registro local; no llama a MercadoPago/Stripe/etc.
   La llamada al integrador es de `procesar-orden`.

## Ejemplos

### Ejemplo 1 — Cambiar de Visa a Master

Caso comun: el comprador agrego una Visa y antes de procesar
decide pagar con su Master.

#### Request

```bash
curl -X PUT \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001240/transactions/PAY-2026-0009880/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: a1b2c3d4-5e6f-7a8b-9c1d-2e3f4a5b6c7d' \
  --cookie 'access_token=...' \
  -d '{
  "payment_method": {
    "id": "master",
    "type": "credit_card",
    "token": "3c5e8a9b101010101bcdef9876543210",
    "installments": 1,
    "statement_descriptor": "MI TIENDA"
  }
}'
```

#### Response 200

```json
{
  "payment_method": {
    "id": "master",
    "type": "credit_card",
    "token": "3c5e8a9b101010101bcdef9876543210",
    "installments": 1,
    "statement_descriptor": "MI TIENDA"
  }
}
```

La transaccion `PAY-2026-0009880` conserva su id, su amount
original y su status (`created`); solo cambio el metodo.

### Ejemplo 2 — Cambiar de tarjeta a OXXO

Cambio de tipo de pago: el comprador prefiere pagar con voucher.

#### Request

```bash
curl -X PUT \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001241/transactions/PAY-2026-0009881/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: b2c3d4e5-6f7a-8b9c-1d2e-3f4a5b6c7d8e' \
  --cookie 'access_token=...' \
  -d '{
  "payment_method": {
    "id": "oxxo",
    "type": "ticket"
  }
}'
```

#### Response 200

```json
{
  "payment_method": {
    "id": "oxxo",
    "type": "ticket"
  }
}
```

El `token` y `installments` desaparecen porque OXXO no los usa.
El backend del ecommerce limpia esos campos al actualizar.

### Ejemplo 3 — Cambiar solo el numero de cuotas

Caso menor: el comprador conservar la misma tarjeta pero cambia
de 1 a 12 cuotas (meses sin intereses).

#### Request

```bash
curl -X PUT \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001242/transactions/PAY-2026-0009882/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: c3d4e5f6-7a8b-9c1d-2e3f-4a5b6c7d8e9f' \
  --cookie 'access_token=...' \
  -d '{
  "payment_method": {
    "id": "master",
    "type": "credit_card",
    "token": "3c5e8a9b101010101bcdef9876543210",
    "installments": 12,
    "statement_descriptor": "MI TIENDA"
  }
}'
```

#### Response 200

```json
{
  "payment_method": {
    "id": "master",
    "type": "credit_card",
    "token": "3c5e8a9b101010101bcdef9876543210",
    "installments": 12,
    "statement_descriptor": "MI TIENDA"
  }
}
```

### Ejemplo 4 — Error: transaccion ya procesada

#### Request

```bash
curl -X PUT \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001234/transactions/PAY-2026-0009876/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: d4e5f6a7-8b9c-1d2e-3f4a-5b6c7d8e9f1a' \
  --cookie 'access_token=...' \
  -d '{ "payment_method": { "id": "master", "type": "credit_card", "token": "..." } }'
```

#### Response 409

```json
{
  "code": "cannot_update_processed_transaction",
  "detail": "Transaction PAY-2026-0009876 is in status=processed; only transactions in status=created can be updated. Use the refund UC to revert processed payments.",
  "errors": [
    {
      "field": "status",
      "expected": "created",
      "received": "processed"
    }
  ]
}
```

### Ejemplo 5 — Error: token obligatorio faltante en tarjeta

#### Request

```bash
curl -X PUT \
  'https://api.tu-tienda.example.com/api/v1/orders/ORD-2026-0001240/transactions/PAY-2026-0009880/' \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: e5f6a7b8-9c1d-2e3f-4a5b-6c7d8e9f1a2b' \
  --cookie 'access_token=...' \
  -d '{ "payment_method": { "id": "master", "type": "credit_card", "installments": 1 } }'
```

#### Response 400

```json
{
  "code": "required_properties",
  "detail": "payment_method.token is required when payment_method.type is credit_card or debit_card",
  "errors": [
    {
      "field": "payment_method.token",
      "expected": "string (32-33 chars)",
      "received": "missing"
    }
  ]
}
```

## Patrones de diseno extraidos de la inspiracion

Este UC introduce un patron nuevo y refuerza varios previos.

### Patron 24 — Actualizacion parcial como verbo dedicado vs delete+create

**El patron**: en recursos compuestos, existe la disyuntiva entre
ofrecer un endpoint `update` dedicado o forzar al cliente a
hacer `delete + create`. Las dos aproximaciones tienen el mismo
efecto observable, pero distintos costes y propiedades.

**Cuando ofrecer `update`**:
- El recurso tiene un identificador estable que terceros sistemas
  o UIs ya estan referenciando.
- La atomicidad importa para evitar estados intermedios
  inconsistentes.
- El churn de idempotency-keys es un coste percibido.
- El audit log se beneficia de "evento sobre la misma entidad"
  vs "delete + create".

**Cuando NO ofrecer `update`**:
- El recurso es efimero y nadie depende del id.
- El cliente puede hacer `delete + create` sin coordinar nada.
- El backend prefiere la simplicidad de no tener un tercer verbo
  sobre el recurso.

**En este UC**: el voto va por **ofrecer `update`** porque las
tres razones (preservar id, atomicidad, reducir churn) aplican al
modelo del template.

**Aplicabilidad**: **Alta** para futuros UCs sobre recursos
compuestos del template.

### Patron 17 vuelve a aplicar — Validacion de estado antes que input

Tercera aparicion (tras `capturar-orden`, `agregar-transaccion`,
`eliminar-transaccion`). Aqui se aplica doble:

1. Estado del padre (orden en modo manual, status=created).
2. Estado del hijo (transaccion en status=created).

Confirma el patron como **disciplina central** del UC de
modificacion sobre recursos compuestos.

### Patron 18 reforzado — Response minimo en actualizaciones

`capturar-orden` introdujo "response minimo en transiciones". Este
UC lo extiende a "response minimo en actualizaciones": el response
solo trae el campo que cambio (`payment_method`), no la entidad
completa.

**Extension del patron 18**:

| Tipo de operacion | Response |
|-------------------|----------|
| Creacion (POST) | Entidad completa |
| Transicion de estado (POST sub-recurso) | Solo lo que cambio |
| Actualizacion parcial (PUT/PATCH) | Solo el campo actualizado |
| Eliminacion (DELETE) | 204 sin body |
| Consulta (GET) | Entidad completa |

**Aplicabilidad**: **Alta**. Disciplina coherente.

### Patron 23 vuelve a aplicar — Restriccion por estado del hijo

Idem `eliminar-transaccion`: el estado del hijo bloquea aunque el
padre permita. Dos clases de error distintas:

- `invalid_order_mode_for_operation` (padre no permite).
- `cannot_update_processed_transaction` (hijo no permite).

### Patron descartado: PUT como reemplazo total

El material usa PUT pero la semantica real es actualizacion
parcial de un solo campo. El UC del ecommerce documenta esta
divergencia: PUT se conserva por consistencia con la fuente, pero
el adoptante puede preferir PATCH sin afectar el contrato
funcional. **El patron 24 abstrae esta decision** como
"actualizacion parcial como verbo dedicado", independiente del
verbo HTTP elegido.

### Patron descartado: `amount` actualizable

El material no permite actualizar `amount`; el UC del ecommerce
respeta la restriccion. Cambiar el monto es operacion
conceptualmente distinta que debe hacerse via `eliminar` +
`agregar` para auditabilidad. Si el adoptante necesita esto con
frecuencia, sera un UC propio (`actualizar-amount-transaccion`)
fuera del scope.

### Patron descartado: clasificar `payment_method` como path param

Mismo error que en `agregar-transaccion`: la fuente clasifica
incorrectamente. Corregido en el UC.

## Resumen de aplicabilidad al UC `actualizar-transaccion`

| Patron | Aplicabilidad | Origen |
|--------|---------------|--------|
| `X-Idempotency-Key` (patron 01) | **Alta** (obligatoria; divergente de `eliminar-transaccion`) | Heredado |
| Sub-recurso accionable (patron 06) | **Alta** | Heredado |
| `payment_method` objeto (patron 07) | **Alta** | Heredado de `crear-orden` |
| Validacion de estado antes que input (patron 17) | **Alta** (doble: padre + hijo) | Reforzado |
| Response minimo (patron 18) | **Alta** (extendido a updates) | Extendido |
| Sub-recurso con body (patron 20) | **Alta** | Heredado |
| UC simetrico add/remove (patron 22) | **N/A** aqui (este UC no es simetrico, es alternativo a delete+add) | - |
| Restriccion por estado del hijo (patron 23) | **Alta** | Reforzado |
| Update como verbo dedicado vs delete+create (patron 24) | **Alta** | Nuevo |

## Dependencias con otros UCs

- **`agregar-transaccion`** (UC precondicionante obligatorio):
  la transaccion debe existir. Si el adoptante no incluye
  `agregar-transaccion` en su scope, este UC no aplica.
- **`crear-orden`** con `processing_mode=manual`: dependencia
  transitiva.
- **`eliminar-transaccion`** (UC alternativo): el cliente
  podria usar `eliminar + agregar` en vez de `actualizar`. Los
  dos UCs coexisten; ofrecer ambos da flexibilidad al cliente.
- **`reembolsar-orden`** o equivalente (UC complementario):
  para transacciones ya procesadas que necesitan correccion, el
  flujo es reembolsar y crear nueva orden, no actualizar.

## Que entrega este documento

- Caracterizacion del UC `actualizar-transaccion` como propiedad
  del ecommerce.
- Justificacion de **por que existe** dado que `eliminar +
  agregar` produce el mismo efecto: preservacion del
  `transaction_id`, atomicidad, reduccion de churn.
- Contrato detallado del endpoint
  `PUT /api/v1/orders/{order_number}/transactions/{transaction_id}/`:
  header, path params, body con solo `payment_method`, response
  minimo, 16 errores catalogados.
- Discusion explicita de **PUT vs PATCH** documentando que la
  semantica real es actualizacion parcial.
- 5 ejemplos: cambio entre tarjetas, cambio tarjeta a OXXO,
  cambio de cuotas, error 409 ya procesada, error 400 token
  faltante.
- 7 reglas de validacion clave incluyendo la regla critica de
  **estado del hijo** no presente en el material original.
- 1 patron nuevo (24 update como verbo dedicado vs delete+create)
  + 1 patron extendido (18 response minimo a actualizaciones).
- Tres divergencias conscientes del material documentadas:
  PUT semantica, sin actualizar `amount`, `payment_method` es
  body no path.

## Que NO entrega este documento

- Decision de cuales patrones se adoptan.
- Plan de implementacion.
- Modificacion de codigo del template.
- UC para actualizar `amount` de una transaccion (declarado fuera
  de scope; si se necesita, seria UC propio).
- UC para actualizar transacciones procesadas (eso es reembolso
  + nueva orden).
- Decision PUT vs PATCH: documentada como equivalente; el
  adoptante elige sin que cambie el contrato funcional.

Esas decisiones viven en `alcance-*.md` y `plan-*.md` que se
produciran cuando todos los UCs propuestos esten estudiados.
