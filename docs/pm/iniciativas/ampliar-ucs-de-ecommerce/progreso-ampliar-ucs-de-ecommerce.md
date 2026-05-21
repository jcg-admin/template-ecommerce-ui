# Progreso — `ampliar-ucs-de-ecommerce`

Log temporal de la iniciativa. Una fila por evento relevante segun
las clases definidas en PROC-GESTION-001.

## Log

| Timestamp UTC | Clase | Sujeto | Detalle |
|---------------|-------|--------|---------|
| 2026-05-21T06:00:00 | Apertura iniciativa | ampliar-ucs-de-ecommerce | Apertura directa en estado `En analisis` sin paso previo por backlog. Justificacion documentada en index.md: surge como pivot durante la ejecucion de `completar-dominio-de-ecommerce`, por solicitud explicita del usuario. PROC-GESTION-001 admite apertura directa con justificacion. Verificacion del paso 2 del procedimiento (ADRs previas): grep en `docs/decisiones-de-arquitectura/decisiones-de-arquitectura.md` de "uc-pay", "uc-checkout", "ucs", "use case", "caso de uso" devuelve solo una mencion casual en una nota de la ADR `dec-lazy-loading-solo-con-React-lazy`. Ninguna ADR sobre inventario o disciplina de UCs. Paso 2 limpio. Apertura motivada por: el template implementa 7 UCs de pagos con huecos visibles (03, 04, 07, 10 sin existir); los handlers MSW solo cubren 2 de los 7 UCs; el usuario propone estudiar como MercadoPago expone sus endpoints como fuente de inspiracion para ampliar y endurecer la cobertura. Bloqueo asociado: `completar-dominio-de-ecommerce` queda formalmente bloqueada hasta el cierre de esta. |

| 2026-05-21T05:29:20 | Analisis | inspiracion-01 | Producido inspiracion-01-crear-orden-tipo-mercadopago.md (~330 lineas). Estudio descriptivo del endpoint POST /v1/orders de MercadoPago. **15 patrones de diseno** identificados con descripcion, ejemplo de codigo y por que importa: idempotency-key header, modos automatic/manual, jerarquia Order>transactions>payments[], external_reference, status+status_detail separados, sub-recursos accionables /capture y /process, payment_method estructurado type+id, response variante por metodo (OXXO ticket inline), payer.identification granular, items[] desnormalizados congelados, 3DS via config.online.transaction_security, client_token para operaciones cliente, errores estructurados con codigo, integration_data multi-tenant, fechas ISO 8601 Z. **Sin decisiones de scope tomadas**. Tabla resumen al final clasifica preliminarmente cada patron en Alta/Media/Baja aplicabilidad o Fuera-de-scope. Candidatos fuertes preliminares destacados: patrones 01 (idempotency), 04 (external_reference), 05 (status split), 07 (payment_method object), 13 (error codes). **Decision de proceso sin pausar**: el nombre del archivo NO incluye 'mercadopago' como prefijo (la estructura es 'inspiracion-NN-<patron>') porque el usuario advirtio que no todas las inspiraciones futuras vendran de MercadoPago. El index.md se actualizo para reflejar la nueva estructura: archivos numerados por inspiracion + un cruce final. |
| 2026-05-21T05:34:03 | Hallazgo durante el analisis | crear-orden | **Hallazgo arquitectonico durante el analisis de UCs**: el primer documento producido ('inspiracion-01-crear-orden-tipo-mercadopago.md') trataba el endpoint POST /v1/orders de MercadoPago como si fuera el UC mismo. El usuario corrigio: **crear-orden es un UC del ecommerce**, no del integrador de pago. MercadoPago solo es uno de los metodos de cobro que el UC puede invocar. Consecuencias: (a) el endpoint correcto del UC es POST /api/v1/orders/ (del ecommerce), no /api/payments/mercadopago/create/ (que es del integrador, una dependencia interna del UC). (b) El nombre del archivo no debe llevar prefijos 'inspiracion-NN' ni referencias al integrador del que se inspira; el nombre es el slug del UC. (c) Los patrones extraidos de MercadoPago se citan como **inspiracion**, pero el UC se modela desde la responsabilidad del ecommerce. **Esto era un error grave del template heredado tambien**: paymentsSlice y checkoutSlice mezclan 'crear orden' con 'crear preferencia MercadoPago' como si fueran el mismo UC; el patron correcto los separa. |
| 2026-05-21T05:34:03 | Analisis | crear-orden | Renombrado archivo via git mv: 'inspiracion-01-crear-orden-tipo-mercadopago.md' -> 'crear-orden.md'. Contenido reescrito desde la optica del ecommerce: el UC pertenece al ecommerce, los patrones de MercadoPago son inspiracion citada. Cada patron se evalua por su aplicabilidad al ecommerce, no por su diseno en MercadoPago. Tres patrones reclasificados como fuera de scope o no aplicables: 3DS (concierne solo al backend), client_token (no aplica al modelo ecommerce-habla-con-ecommerce), integration_data (single-tenant). Index.md actualizado: estructura ahora es '<slug-del-uc>.md' sin prefijo numerico ni referencia al integrador. Flujo previsto rescrito en consecuencia. |
## Contadores

| Clase | Conteo |
|-------|--------|
| Apertura iniciativa | 1 |
| Analisis | 2 |
| Hallazgo durante el analisis | 1 |
| Reconsideracion | 0 |
| Decisiones aprobadas | 0 |
| Plan | 0 |
| Cambio de estado | 0 |
| Replan | 0 |
| Hallazgo durante la ejecucion | 0 |
| Inicio de tarea | 0 |
| Cierre de tarea | 0 |
| Fase cerrada | 0 |
| Bloqueo | 0 |
| Desbloqueo | 0 |
| Cambio de alcance | 0 |
| Cierre de iniciativa | 0 |
