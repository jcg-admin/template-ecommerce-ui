# Iniciativa: ampliar-ucs-de-ecommerce

| Campo | Valor |
|-------|-------|
| Slug | `ampliar-ucs-de-ecommerce` |
| Estado | En analisis |
| Orden de backlog | (no aplica: abierta directamente sin pasar por backlog) |
| Fecha de creacion (directorio) | 2026-05-21 |
| Fecha de apertura formal | 2026-05-21 |
| Iniciativa origen | Solicitud del usuario durante la pausa de `completar-dominio-de-ecommerce`. |
| Iniciativa que esta bloquea | `completar-dominio-de-ecommerce` (En ejecucion, en estado Bloqueo hasta cierre de esta). |

## Motivo de existencia

El template implementa **siete UCs de pagos** (`UC-PAY-01, 02, 05, 06,
08, 09, 11`) con huecos visibles (03, 04, 07, 10 no existen). Tras la
iniciativa cerrada `revisar-arquitectura-de-mocks` los mocks viven en
handlers MSW tipados, pero la **superficie de UCs cubierta es
estrecha**: dos handlers (`mercadopago/create/`, `paypal/create/`)
frente a siete UCs declarados en los slices. El gap entre lo
declarado y lo mockeado ya es deuda registrada por la iniciativa
anterior.

El usuario propone **ampliar los UCs del dominio inspirandose en como
la API de MercadoPago expone sus endpoints**. La hipotesis es que
MercadoPago, como integrador maduro, ha resuelto patrones de diseno
(idempotency keys, webhooks, paginacion, errores estructurados,
sub-recursos, status codes) que el template puede adoptar para
ampliar y endurecer su cobertura de pagos y, eventualmente, otros
dominios.

Esta iniciativa **estudia los ejemplos de MercadoPago**, los **cruza
contra el inventario actual del template**, **decide que UCs nuevos
incorporar** y **los implementa** (handlers MSW, slices, paginas,
tests, docs) bajo la disciplina del template (tipos canonicos, tests
verdes, sin acoplar codigo de produccion al mock).

## Estado actual

Iniciativa abierta directamente en **`En analisis`**, sin pasar por
backlog, por solicitud explicita del usuario en sesion del 2026-05-21.

La apertura sin backlog es **excepcional** pero esta justificada:

1. Surge durante la ejecucion de otra iniciativa
   (`completar-dominio-de-ecommerce`) como pivot por solicitud del
   usuario, no como item plan previamente registrado.
2. Bloquea la iniciativa en curso de manera controlada (el bloqueo
   esta registrado en su `progreso-*.md`).
3. PROC-GESTION-001 permite apertura directa con justificacion
   documentada cuando la fuente es solicitud del usuario; el
   procedimiento no exige siempre paso por backlog.

## Inventario inicial de pagos en el template

Resultado de la inspeccion ya hecha:

**UCs declarados** (en `src/hooks/domain/usePayments.js` y slices):
UC-PAY-01, 02, 05, 06, 08, 09, 11. **Huecos**: 03, 04, 07, 10.

**Slices**:
- `paymentsSlice.js`: `/api/v1/payments/mercadopago/checkout`,
  `/paypal/checkout`, `/retry`, `/admin/payments` (refund).
- `checkoutSlice.js`: `/api/orders/` (legacy), `/api/payments/...`
  (legacy). Familia de paths sin `v1` igual que la deuda detectada
  en auth.
- `ordersSlice.js`: `/api/v1/checkout/`, `/api/v1/orders/...`.

**Handlers MSW**:
- `src/mocks/handlers/payments.ts`: SOLO dos handlers
  (`mercadopago/create/`, `paypal/create/`). El resto de UCs de
  pagos **no tienen handler**; los slices fallan silenciosamente o
  esperan backend real.

**Paginas comprador**: `CheckoutPage`, `PaymentSelectionPage`,
`PaymentStatusPage`, `PaymentRetryPage`, `PaymentHistoryPage`.

**Paginas admin**: `AdminPaymentsPage`, `AdminPaymentRefundPage`.

## Documentos esperados

Estructura: **un UC por documento**, nombrado con el slug del UC sin
prefijos numericos ni referencias al integrador del que se inspira.
La razon: los UCs son del ecommerce, no del integrador; mezclar el
nombre del integrador en el archivo confunde la propiedad. Las
fuentes de inspiracion se citan dentro de cada documento.

El cruce contra el inventario del template se hace al final, cuando
todos los UCs propuestos esten estudiados.

| Documento | Estado |
|-----------|--------|
| [crear-orden.md](crear-orden.md) | Producido. UC del ecommerce con contrato detallado del endpoint `POST /api/v1/orders/`: header, body completo, enums, response, 24 errores catalogados, 8 reglas de validacion, 5 ejemplos (credito, debito, OXXO, SPEI, pago partido), 15 patrones evaluados. 985 lineas. |
| [capturar-orden.md](capturar-orden.md) | Producido. UC del ecommerce para capturar una autorizacion previa. Endpoint `POST /api/v1/orders/{order_number}/capture/`. 12 errores catalogados, 5 reglas de validacion, 4 ejemplos (sincrona, asincrona, no-capturable, inexistente), 3 patrones nuevos (body vacio, validacion de estado, response minimo). Dependencia critica: `capture_mode=manual` en `crear-orden`. 553 lineas. |
| [agregar-transaccion.md](agregar-transaccion.md) | Producido. UC del ecommerce para agregar transacciones a una orden creada en modo manual. Endpoint `POST /api/v1/orders/{order_number}/transactions/`. 20 errores catalogados, 7 reglas de validacion, 5 ejemplos (credito, OXXO, pago partido, error 400 modo invalido, error 400 limite excedido), 3 patrones nuevos (estado creado-pero-no-procesado, sub-recurso con/sin body, restriccion del integrador documentada). Dependencias criticas: `processing_mode=manual` en `crear-orden` + UC `procesar-orden` como sucesor obligado. 700 lineas. |
| [eliminar-transaccion.md](eliminar-transaccion.md) | Producido. UC del ecommerce para eliminar una transaccion en `status=created` de una orden manual. Endpoint `DELETE /api/v1/orders/{order_number}/transactions/{transaction_id}/`. 9 errores catalogados, 6 reglas, 5 ejemplos (eliminacion OK, error 409 ya procesada, error 404 inexistente, error 400 modo invalido, reintento sobre eliminada), 2 patrones nuevos (UC simetrico add/remove, restriccion de eliminacion por estado del hijo). **Dos divergencias conscientes del material**: idempotency-key opcional (HTTP DELETE es idempotente por naturaleza), response 204 sin body (corrige el `"string"` del material). 535 lineas. |
| [actualizar-transaccion.md](actualizar-transaccion.md) | Producido. UC del ecommerce para actualizar el `payment_method` de una transaccion en `status=created` preservando su `transaction_id`. Endpoint `PUT /api/v1/orders/{order_number}/transactions/{transaction_id}/`. 16 errores catalogados, 7 reglas, 5 ejemplos (cambio tarjeta, cambio tipo, cuotas, 409 procesada, 400 token faltante), 1 patron nuevo (update como verbo dedicado vs delete+create) + 1 extendido (response minimo a updates). **Tres divergencias conscientes del material**: PUT semantica de actualizacion parcial (no reemplazo total), sin actualizar `amount` (declarado fuera de scope), `payment_method` clasificado como body (no path como en la fuente). Justificacion explicita de por que existe el UC dado que `eliminar+agregar` produce el mismo efecto: preserva id, atomicidad, reduce churn de idempotency-keys. 660 lineas. |
| [procesar-orden.md](procesar-orden.md) | Producido. UC del ecommerce que **cierra el flujo manual**: ejecuta el procesamiento de una orden con transacciones agregadas, invocando al integrador por primera vez. Endpoint `POST /api/v1/orders/{order_number}/process/`. Body vacio (patron 16 tercera confirmacion). 16 errores catalogados incluyendo el caso especial de **fallo parcial** (HTTP 402 con detalle por transaccion). 7 reglas de validacion, 5 ejemplos (tarjeta exitosa, OXXO action_required, pago partido fallo parcial, 409 ya procesada, 400 suma incorrecta). **3 patrones nuevos**: (25) response completo cuando produce primera version rica - complementa al patron 18; (26) validacion diferida hasta el uso - suma cuadrada se valida al procesar, no al editar transacciones; (27) fallo parcial con detalle por sub-recurso - HTTP 402 con `errors[]` por transaccion. **Seccion explicita "Diferencia entre procesar-orden y capturar-orden"**: ambos transiciones con body vacio, pero procesar invoca al integrador por primera vez. 786 lineas. |
| `<otro-uc>.md` | Pendientes. Uno por UC que el usuario quiera incorporar. |
| `analisis-cruce-vs-template.md` | Pendiente. Cruce final contra inventario; identifica que UCs son nuevos, cuales endurecen los existentes, que patrones se adoptan. Producido cuando se hayan estudiado todos los UCs propuestos. |
| `alcance-ampliar-ucs-de-ecommerce.md` | Pendiente. UCs concretos a incorporar con criterios verificables. Producido tras el cruce. |
| `plan-ampliar-ucs-de-ecommerce.md` | Pendiente. Producido cuando paso a `En ejecucion`. |
| `tareas-ampliar-ucs-de-ecommerce.md` | Pendiente. |
| [progreso-ampliar-ucs-de-ecommerce.md](progreso-ampliar-ucs-de-ecommerce.md) | En uso. |
| `decisiones-ampliar-ucs-de-ecommerce.md` | Pendiente. Obligatorio al cierre. |

## Flujo previsto

1. Usuario propone un UC (con o sin material de referencia externo).
2. Produzco `<slug-del-uc>.md` caracterizando el UC desde la optica
   del ecommerce. Si hay material externo (API de un integrador,
   notas, etc), lo uso como **inspiracion** y lo cito explicitamente,
   pero el UC se modela como propiedad del ecommerce.
3. Repetir 1-2 hasta que el usuario indique que no hay mas UCs.
4. Produzco `analisis-cruce-vs-template.md` cruzando los UCs
   propuestos contra el inventario del template.
5. Produzco `alcance-ampliar-ucs-de-ecommerce.md`.
6. **Pausa para tu confirmacion del alcance antes de planificar.**
7. Produzco plan + tareas, paso a `En ejecucion`.
8. Ejecuto.
9. Cierro segun PROC-GESTION-001.

## Relacion con otras iniciativas

| Iniciativa | Relacion |
|-----------|----------|
| `completar-dominio-de-ecommerce` (En ejecucion, Bloqueada) | Esta iniciativa pausa la anterior. Cuando se cierre esta, la anterior se desbloquea y puede continuar; sus tareas T-001..T-018 quizas necesiten ajuste segun lo que se incorpore aqui. |
| `validar-contrato-de-mocks-vs-backend-real` (Backlog #1, bloqueada por backend) | Esta iniciativa **amplia el alcance futuro** de la validacion: cuando llegue el backend, habra mas UCs que validar. No afecta el bloqueo actual de aquella. |
| `revisar-arquitectura-de-mocks` (Cerrada) | Esta iniciativa **se construye sobre** la arquitectura MSW que aquella dejo. Los UCs nuevos se mockean como handlers MSW siguiendo las decisiones ya formalizadas. |
