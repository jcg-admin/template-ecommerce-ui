# Analisis: Corregir deuda diseno Yoruba

| Campo | Valor |
|-------|-------|
| Iniciativa | corregir-deuda-diseno-yoruba |
| Fecha de creacion | 2026-05-27T19:14:49 |

## D-01 — [PROVEN] 197 tests fallan en 18 suites

Evidencia:
```
npm test -- --watchAll=false
-> Test Suites: 30 failed, 98 passed, 128 total
-> Tests: 197 failed, 597 passed, 794 total
```

Suites afectadas:
```
FAIL src/components/catalog/RelatedProductsSection.test.jsx
FAIL src/components/layout/Header/Header.test.jsx
FAIL src/pages/account/AddressesPage.test.jsx
FAIL src/pages/account/OrderDetailPage.test.jsx
FAIL src/pages/account/WishlistPage.test.jsx
FAIL src/pages/admin/AdminProductsPage.test.jsx
FAIL src/pages/admin/AdminUserDetailPage.test.jsx
FAIL src/pages/admin/AdminUsersPage.roleChange.test.jsx
FAIL src/pages/admin/AdminUsersPage.test.jsx
FAIL src/pages/auth/VerifyEmailPage.test.jsx
FAIL src/pages/cart/CartPage.test.jsx
FAIL src/pages/catalog/CatalogPage.test.jsx
FAIL src/pages/catalog/ProductPage.test.jsx
FAIL src/pages/catalog/SearchResultsPage.test.jsx
FAIL src/pages/checkout/CheckoutPage.test.jsx
FAIL src/pages/home/HomePage.test.jsx
FAIL tests/unit/pages/AccountPage.test.jsx
FAIL tests/unit/pages/ProfilePage.test.jsx
```

Patron principal: `Unable to find an element with the text: X`
donde X es texto del componente anterior que el nuevo diseno cambio.

Causa secundaria detectada (Gate 0b): CartPage.test.jsx pasa
`item.name` en el mock pero CartPage.jsx ahora espera
`item.product_name` (shape del paquete Yoruba). El test no falla
solo por markup sino por shape de datos incompatible.

```
# Evidencia shape mismatch:
grep "product_name" src/pages/cart/CartPage.jsx
-> 150: {item.image_url ? <img alt={item.product_name} />
-> 156: <div className={styles.itemName}>{item.product_name}</div>

grep '"name": "Collar Yemaya"' src/pages/cart/CartPage.test.jsx
-> items[0].name = 'Collar Yemaya'  (campo incorrecto)
```

## D-02 — [PROVEN] 37 aliases de compatibilidad en `_variables.scss`

Evidencia:
```
grep -c "^\$" src/styles/abstracts/_variables.scss
# Seccion de aliases tiene 37 variables en 4 bloques:
#   Bloque 1 (linea 368): aliases semanticos directos
#   Bloque 2 (linea 402): segunda tanda (hallazgo T-107 build 3)
#   Bloque 3 (linea 420): tercera tanda (hallazgo T-107 build 3)
#   Bloque 4 (linea 424): cuarta tanda (hallazgo F4)

grep -rln "\$color-danger\|\$gray-50\|\$white\b" src/ --include="*.scss"
-> 84 archivos, 149 ocurrencias
```

### Mapa de reemplazos (37 aliases)

| Variable legacy | Reemplazar por |
|----------------|----------------|
| `$color-primary` | `$primary-color` |
| `$color-danger` | `$error-color` |
| `$color-error` | `$error-color` |
| `$color-text` | `$text-primary` |
| `$surface` | `$bg-elevated` |
| `$bg-surface` | `$bg-elevated` |
| `$bg-subtle` | `$bg-sunken` |
| `$bg-muted` | `$bg-sunken` |
| `$white` | `#F5F7EE` |
| `$text-strong` | `$text-primary` |
| `$text-soft` | `$text-muted` |
| `$font-size-display` | `$font-size-4xl` |
| `$gray-50` | `rgba($text-primary, 0.04)` |
| `$gray-200` | `rgba($text-primary, 0.12)` |
| `$gray-400` | `rgba($text-primary, 0.28)` |
| `$gray-500` | `rgba($text-primary, 0.20)` |
| `$gray-600` | `$text-muted` |
| `$gray-700` | `$text-secondary` |
| `$gray-800` | `rgba($text-primary, 0.65)` |
| `$gray-950` | `$bg-sunken` |
| `$success-strong` | `$lime-deep` |
| `$danger-strong` | `$vino-deep` |
| `$danger-deep` | `$vino-deep` |
| `$danger-bg` | `rgba($vino, 0.12)` |
| `$info-strong` | `$bronze` |
| `$indigo-500` | `#4A5FC1` |
| `$indigo-600` | `#1C5BD8` |
| `$indigo-700` | `#1A4F8B` |
| `$indigo-900` | `#14296B` |
| `$amber-500` | `$coral` |
| `$amber-700` | `$rust` |
| `$amber-900` | `$bronze-deep` |
| `$amber-bg` | `rgba($bronze, 0.12)` |
| `$radius-sm` | `$border-radius-sm` |
| `$radius-md` | `$border-radius-md` |
| `$radius-lg` | `$border-radius-lg` |
| `$spacing-7` | `28px` |

Nota: los colores `$indigo-*` no tienen equivalente semantico en la
paleta del brazalete. Se mantienen como valores hex directos (no se
eliminan, se inline-an en los modulos que los usan).

## D-03 — [PROVEN] NotFoundPage no adaptada al diseno Yoruba

Evidencia:
```
wc -l src/pages/NotFoundPage.jsx
-> 19 (version anterior)

wc -l dist-yoruba-ui/src/pages/NotFoundPage.jsx
-> 30 (version Yoruba con MetaTag, Button, tipografia editorial)

diff NotFoundPage.jsx ref/NotFoundPage.jsx
-> El repo tiene la version del bootstrap. El paquete tiene:
   - import MetaTag, Button desde primitives (F3)
   - 404 en tipografia grande
   - MetaTag tone="bronze"
   - Rutas EN (/catalog?category=akoses-medicinas)
   - NotFoundPage.module.scss (nuevo)
```

La pagina aparece en el ZIP y en el inventario de vistas
pero fue omitida en F3 porque esta en src/pages/ raiz (no en
un subdirectorio), y el script de F3 procesaba subdirectorios.

## D-04 — [INFERRED] Shape de datos del mock de CartPage.test.jsx

Razonamiento: CartPage usa `item.product_name` (shape del paquete
Yoruba, alineado con el serializer Django). CartPage.test.jsx pasa
objetos con `item.name` (shape anterior). El test falla aunque la
logica Redux es correcta — es el mock del test el que tiene el campo
incorrecto.

El mismo patron puede existir en otros tests de paginas adaptadas.
Se verifica al corregir cada suite en F1.

## Dependencias entre hallazgos

D-02 (aliases) es independiente de D-01 (tests) y D-03 (NotFoundPage).
Se puede ejecutar en cualquier orden. Se ejecuta F2 antes de F1 para
que los tests corran con el SCSS final.

D-03 (NotFoundPage) es de 2 archivos — se puede hacer en cualquier
momento de la iniciativa.
