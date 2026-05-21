# Como estudiar UCs inspirados en APIs externas

Procedimiento operativo derivado de la iniciativa
`ampliar-ucs-de-ecommerce` (2026-05-21). Aplica cuando una
iniciativa **estudia UCs del ecommerce inspirandose en como APIs
externas (MercadoPago, Stripe, PayPal, Conekta, etc) modelan
endpoints similares**.

Este procedimiento **no sustituye** al procedimiento general
documentado en
[como-gestionar-iniciativas.md](como-gestionar-iniciativas.md);
lo complementa con disciplinas especificas para el caso de
estudio de UCs.

## Cuando aplica este procedimiento

Aplica cuando se cumple **todo** lo siguiente:

- La iniciativa tiene como objetivo proponer o ampliar UCs del
  ecommerce.
- El usuario aporta material de referencia de APIs externas
  (postman, docs de proveedor, capturas de Swagger, etc) como
  inspiracion.
- El alcance de la iniciativa todavia esta en analisis o
  ejecucion. Una vez cerrada, los UCs producidos son
  documentacion de referencia y no requieren este procedimiento
  para mantenerlos.

## Estructura de archivos

Una iniciativa de este tipo organiza sus archivos asi:

```
docs/pm/iniciativas/<slug-de-la-iniciativa>/
├── index.md
├── progreso-<slug>.md
├── <slug-uc-1>.md             ← un archivo por UC
├── <slug-uc-2>.md
├── ...
├── analisis-cruce-vs-template.md   ← producido cuando todos
├── alcance-<slug>.md                 los UCs esten estudiados
├── plan-<slug>.md
├── tareas-<slug>.md
└── decisiones-<slug>.md
```

### Reglas de nombrado de archivos de UC

- **El nombre es el slug del UC, no del integrador**. Ejemplo:
  `crear-orden.md`, no `crear-orden-tipo-mercadopago.md`.
- **Sin prefijos numericos**. Ejemplo: `capturar-orden.md`, no
  `inspiracion-02-capturar.md`.
- **Sin referencia al proveedor**. Si en el futuro otra
  inspiracion para el mismo UC viene de Stripe, el archivo no
  hay que renombrarlo.
- **Verbo en infinitivo en espanol**. `crear-orden`,
  `capturar-orden`, `agregar-transaccion`, `eliminar-transaccion`,
  `actualizar-transaccion`, `procesar-orden`. No `add-transaction`,
  no `transaction-creation`.

Razon: los UCs son del ecommerce, no del integrador. El nombre
del archivo refleja la responsabilidad, no la fuente de
inspiracion.

## Disciplina de modelado: el UC es del ecommerce

Precedente arquitectonico central de la iniciativa
`ampliar-ucs-de-ecommerce`: **el UC pertenece al ecommerce; el
integrador es una dependencia interna**.

Consecuencias practicas:

- **Endpoint del UC**: `POST /api/v1/<recurso>/...` del ecommerce.
  No `/api/payments/mercadopago/...` ni similar.
- **El frontend del template habla con el ecommerce, no con el
  integrador**. El integrador puede tener su propia interaccion
  con el frontend (iframe 3DS, redirect a sandbox), pero el
  contrato principal es ecommerce ↔ frontend.
- **Los ejemplos usan hosts del ecommerce**:
  `api.tu-tienda.example.com`, no `api.mercadopago.com`.
- **Autenticacion segun politica del template** (cookies
  httpOnly por ADR `dec-jwt-solo-en-cookies-httponly`), no
  Bearer tokens visibles que asumen modelo del integrador.
- **Mantener el framing incluso si la fuente lo mezcla**. Si el
  material de inspiracion mezcla "crear orden" con "crear
  preferencia MercadoPago", el UC del ecommerce los separa
  conscientemente.

## Estructura canonica de un documento de UC

Cada `<slug-uc>.md` sigue **9 secciones canonicas** mas hasta
**3 secciones contextuales** segun la naturaleza del UC:

### Secciones canonicas (siempre presentes)

1. **Por que es del ecommerce y no del integrador de pago**.
   Confirma el framing y declara consecuencias para el modelado.
2. **Forma del UC**. Actor, pre-condiciones, trigger, camino
   feliz, caminos alternativos, caminos de fallo,
   post-condiciones.
3. **Contrato del endpoint**. Header, path params, body, enums,
   response, errores catalogados con HTTP status + codigo
   semantico + descripcion.
4. **Reglas de validacion clave**. Numeradas, incluyendo reglas
   no presentes en el material pero necesarias para integridad.
5. **Ejemplos**. Pares request/response curl+json, idealmente
   3-5 cubriendo casos representativos (incluyendo errores).
6. **Patrones de diseno extraidos de la inspiracion**.
   Numerados, con `que es / como se materializa / por que
   importa / aplicabilidad`. Incluir patrones descartados con
   razon.
7. **Resumen de aplicabilidad**. Tabla con aplicabilidad
   preliminar de cada patron al template.
8. **Que entrega este documento**.
9. **Que NO entrega este documento**.

### Secciones contextuales (segun necesidad)

- **Por que existe este UC: <contexto>**. Cuando el UC necesita
  justificacion contextual (cierre de un flujo, simetria con
  otro UC, alternativa a un par de operaciones existentes).
- **Diferencia conceptual entre <UC actual> y <UC similar>**.
  Cuando hay UCs cercanos que conviene comparar (ej.
  `procesar-orden` vs `capturar-orden`).
- **Dependencias con otros UCs**. Cuando el UC tiene UCs
  precondicionantes, sucesores o complementarios. Declarar
  explicitamente los UCs que deben adoptarse juntos.

## Disciplina de integracion del material fuente

**Precedente del usuario** (correccion en `crear-orden` durante
`ampliar-ucs-de-ecommerce`): **integrar el material completo en
la primera pasada, no abstraer prematuramente en patrones**.

Consecuencias practicas:

- **Tablas completas de campos** (request body, response,
  enums). No solo descripcion macro de la jerarquia.
- **Catalogo completo de errores** con HTTP status + codigo
  semantico + descripcion. No solo mencionar "hay errores".
- **Ejemplos curl + json completos**. No solo el camino feliz
  abstracto.
- **Enums catalogados** con descripcion de cada valor.
- **Reglas de validacion exactas** (rangos, formatos, longitudes).

Los patrones de diseno se extraen **despues** de tener el
contrato detallado, no en lugar de el. El meta-analisis sin el
contrato concreto es prematuro.

## Disciplina de divergencias respecto al material

El material de inspiracion suele tener:

- Errores de clasificacion (campos body declarados como path
  parameters).
- Inconsistencias entre verbos HTTP y semantica real
  (PUT etiquetado pero actualizacion parcial).
- Restricciones de estado no documentadas (cuando se puede
  eliminar, cuando se puede actualizar).
- Codigos de status omitidos en response examples.

**Disciplina del UC**:

1. **No copiar errores ciegamente**. Si el material clasifica
   mal un campo, el UC corrige y nota la correccion.
2. **Documentar divergencias explicitamente**. Cada divergencia
   respecto al material va en una nota dentro del contrato, con
   razon. Que el lector pueda contrastar.
3. **Anadir reglas no documentadas pero necesarias**. Si el
   material no declara que solo se puede eliminar en
   `status=created`, el UC del ecommerce lo anade con su error
   correspondiente (`cannot_delete_processed_transaction`). Si
   no se hace, el ecommerce queda expuesto a problemas de
   integridad.
4. **Registrar divergencias en `progreso-*.md`**. Cada hallazgo
   de error en el material va como `Hallazgo durante el
   analisis` con detalle de que se encontro y como se resolvio.

## Disciplina de catalogo de patrones

Tras varios UCs estudiados, los patrones de diseno se acumulan
con numeracion secuencial global. Reglas:

- **Numeracion unica** a lo largo de toda la iniciativa. Patron
  01 (idempotency-key) y patron 27 (fallo parcial) en distintos
  UCs siguen siendo el mismo patron 01 y el mismo patron 27.
- **Un patron se introduce en el UC donde aparece por primera
  vez** y se cita en UCs posteriores con la marca "heredado",
  "reforzado" o "extendido".
- **Patrones descartados** (los que el UC del ecommerce no
  adopta de la inspiracion) se documentan tambien con razon.
- **Aplicabilidad** se evalua desde la optica del ecommerce, no
  desde la del integrador. Niveles: Alta / Media / Baja / Fuera
  de scope / N/A aqui.
- **Retorno marginal decreciente** es senal de saturacion.
  Cuando varios UCs consecutivos no producen patrones nuevos,
  el catalogo esta cerca de su estado final y conviene cerrar
  la fase de estudio.

## Flujo previsto de la iniciativa

```
1. Usuario propone un UC (con o sin material de referencia)
2. Producir <slug-uc>.md siguiendo la estructura canonica
3. Registrar en progreso-*.md como `Analisis | <slug-uc> | ...`
4. Actualizar index.md con fila del UC
5. Commit Tim Pope: subject <= 50 chars, wrap 72
6. Repetir 1-5 hasta que el usuario indique que no hay mas UCs
7. Producir analisis-cruce-vs-template.md
8. Producir alcance-<slug>.md
9. PAUSA obligatoria para confirmacion del alcance
10. Producir plan-<slug>.md y tareas-<slug>.md
11. Pasar a En ejecucion
12. Ejecutar las tareas
13. Producir decisiones-<slug>.md al cierre
14. Cerrar
```

## Que NO hace este procedimiento

- No define la estructura del `alcance-*.md`, `plan-*.md`, etc.
  Esos siguen el procedimiento general.
- No describe como ejecutar las tareas; eso depende de cada
  iniciativa.
- No reemplaza decisiones de modelado especificas; cada UC se
  modela segun el material disponible y el contexto del template.

## Referencias

- Procedimiento general:
  [como-gestionar-iniciativas.md](como-gestionar-iniciativas.md)
- Iniciativa que origino este procedimiento:
  [ampliar-ucs-de-ecommerce](iniciativas/ampliar-ucs-de-ecommerce/index.md)
- ADR sobre autenticacion en cookies httpOnly:
  `docs/decisiones-de-arquitectura/decisiones-de-arquitectura.md`
  → `dec-jwt-solo-en-cookies-httponly`
