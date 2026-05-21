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
