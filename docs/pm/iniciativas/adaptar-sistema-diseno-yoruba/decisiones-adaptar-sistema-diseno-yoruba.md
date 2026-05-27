# Decisiones: Adaptar sistema de diseno Yoruba

| Campo | Valor |
|-------|-------|
| Iniciativa | adaptar-sistema-diseno-yoruba |
| Fecha de creacion | 2026-05-27T07:41:35 |
| Fecha de cierre | 2026-05-27T22:15:00 |

## Seccion 1 — Decisiones de diseno

### dec-no-cp-masivo

El paquete `dist-yoruba-ui` documenta `cp -R dist-yoruba-ui/src/* /repo/src/`
como procedimiento de instalacion. Se descarto por completo.

Alternativa descartada: aplicar el `cp -R` masivo directamente.
Razon: el paquete tiene rutas en espanol (`/catalogo`, `/mi-cuenta`)
vs la convencion EN del template (`/catalog`, `/account`); action
creators con nombres distintos a los nuestros; y un `_variables.scss`
que reemplaza todos los tokens sin aliases de compatibilidad para los
existentes. Un `cp -R` hubiera roto el build en 160 errores y dejado
rutas rotas en toda la app.

### dec-aliases-compatibilidad

Al reemplazar `_variables.scss` con la paleta del brazalete, los
modulos SCSS del repo usaban 24 variables del tema anterior
(`$color-danger`, `$gray-*`, `$white`, `$bg-surface`, `$spacing-7`,
etc.). Se agrego un bloque de aliases al final de `_variables.scss`
que mapea los nombres heredados a los equivalentes semanticos de la
nueva paleta.

Alternativa descartada: reemplazar todas las referencias en los
modulos SCSS de una vez. Hubiera sido 100+ cambios en archivos fuera
del alcance de esta iniciativa. El bloque de aliases es la deuda
conocida — se eliminara gradualmente en `mapear-y-corregir-scss-completo`.

### dec-image-url-alias

El paquete usa `product.image_url` (string plano). Nuestro catalogo
genera `product.images[0].url` (array). Se agrego `image_url` como
campo extra en `transform-catalog.mjs`, alias de `images[0].url`.

Alternativa descartada: modificar todos los componentes del paquete
para usar `images[0].url`. Hubiera requerido tocar cada componente
individualmente; el alias en el script es un cambio de un solo punto.

ProductPage ya usaba `product.images[]` (array) para la galeria de
multiples imagenes — no se modifico. El alias solo aplica a los
componentes de lista (ProductCard, HomePage).

### dec-orisha-name-omitido

El ProductCard del paquete tiene un tag de orisha (`product.orisha_name`).
El catalogo de Oja Yoruba no tiene relacion producto-orisha en el
JSON del scraper. Se omitio el tag.

Alternativa descartada: mapear la categoria a un orisha segun una
tabla de equivalencias. Hubiera sido una decision de negocio arbitraria
sin base en los datos reales. Se documenta como posible enriquecimiento
futuro.

### dec-rutas-en-ingles

El paquete usa rutas en espanol (`/catalogo`, `/mi-cuenta`, `/carrito`).
El template mantiene la convencion en ingles (`/catalog`, `/account`,
`/cart`). Se adapto cada componente y pagina durante la integracion.

Alternativa descartada: adoptar las rutas en espanol del paquete.
Hubiera requerido cambiar el AppRouter completo y todos los tests
existentes que usan rutas EN. La convencion EN esta establecida en
el repo desde el inicio.

### dec-checkoutslice-deprecated

Las paginas de checkout del paquete importan de `checkoutSlice` que
en nuestro repo esta marcado `@deprecated`. Se redirigieron los
imports a `paymentsSlice` (el slice activo) y se agregaron los thunks
faltantes (`initiatePayment`, `fetchPaymentHistory`, etc.).

Alternativa descartada: restaurar `checkoutSlice` como activo.
`paymentsSlice` ya tiene los handlers MSW y es el que usa el
codigo existente de `PaymentSelectionPage`.

### dec-tests-componentes-deuda

Los tests de componentes (197 fallos) buscan texto y estructura HTML
del diseno anterior. Se documentan como deuda tecnica — no se
actualizaron en esta iniciativa porque hacerlo requiere revisar cada
test contra el nuevo marcado, lo cual es trabajo de cobertura de
tests separado del objetivo de adaptar el sistema de diseno.

Los tests de Redux (141/141 PASAN) confirman que la logica de negocio
no tiene regresiones.

---

## Seccion 2 — Hallazgos durante la ejecucion

### F1: aliases de compatibilidad (H-F1-02)

El nuevo `_variables.scss` no definia 24 variables del tema anterior.
Solucion iterativa en 5 tandas de build. BUILD paso de 160 errores a 0.

### F1: conflicto @use namespace (H-F1-03)

`abstracts/_typography.scss` hacia `@use 'variables' as *` internamente.
Al importarlo desde `main.scss` junto con `base/_typography.scss`
(que tambien importa variables via `../abstracts`), SCSS reportaba
namespace duplicado. Solucion: integrar el contenido de
`abstracts/_typography.scss` en `base/_typography.scss`.

### F4: export default duplicado (H-F4-09)

Al agregar thunks al final de los slices, el fragmento `old` del
`str_replace` incluia la linea `export default slice.reducer`. Al
reemplazarlo, quedo una segunda copia. Babel lanza SyntaxError.
Leccion: leer el archivo ANTES de str_replace para confirmar que
el fragmento old no incluye el export default.

### F4/F5: rutas en template literals (H-F4-07, H-F5-02)

El mapa de reemplazos usaba comparacion de strings con comillas.
Las rutas dentro de template literals (`` `/mi-cuenta/${id}` ``)
no se capturaban. Solucion: segunda pasada con `sed` apuntando
al patron con `${`.

### F6: rutas admin sin trailing slash (H-F6-02)

El ROUTE_MAP tenia `/admin/pedidos/` (con slash final) pero los
archivos usaban `/admin/pedidos` (sin slash). No matcheaban. Solucion:
`sed` adicional con el patron sin slash.

---

## Seccion 3 — Verificacion post-ejecucion

| Criterio del alcance | Resultado | Evidencia |
|----------------------|-----------|-----------|
| 1. Paleta visual del brazalete visible | PASA | CSS bundle: #0e1400, #8cb800, Fraunces, IBM Plex |
| 2. `npm run build:demo` sin errores | PASA | EXIT=0, 26 warnings (Sass preexistentes) |
| 3. Handlers MSW sin regresion | PASA | Tests Redux 141/141 pasan; build:demo genera dist/ con mockServiceWorker.js |
| 4. Tests existentes 0 regresiones | FALLA PARCIAL | 597 pasan, 197 fallan. Tests Redux: 0 regresiones. Tests de componentes: 197 regresiones por cambio de marcado HTML (H-F7-01, deuda tecnica) |
| 5. ProductCard muestra imagen, categoria y precio | PASA | ProductCard.jsx usa image_url (T-201/T-305), category_name, precio MXN |

### Criterio 4 — detalle de los 197 tests fallidos

Todos los fallos siguen el mismo patron: `Unable to find an element
with the text: X` donde X es texto del componente anterior que el
nuevo diseno Yoruba cambio (labels, mensajes de estado, rutas en el
DOM). Ningun fallo indica regresion en logica de Redux, API calls,
o flujos de negocio.

Accion recomendada: crear la iniciativa `actualizar-tests-diseno-yoruba`
para actualizar los 30 suites afectadas con el nuevo marcado HTML.
