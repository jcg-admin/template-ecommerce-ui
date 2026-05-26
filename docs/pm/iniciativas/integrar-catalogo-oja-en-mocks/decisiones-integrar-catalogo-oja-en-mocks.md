# Decisiones: Integrar catalogo Oja en mocks

| Campo | Valor |
|-------|-------|
| Iniciativa | integrar-catalogo-oja-en-mocks |
| Fecha de creacion | 2026-05-26T01:05:16 |

## Seccion 1 — Decisiones de diseno

### dec-precio-iva-incluido

`precio_actual` del scraper es el precio que ve el cliente en
ojayoruba.com. En Mexico los precios en tiendas online se muestran
con IVA incluido por ley. Por tanto:

```
price_with_tax = precio_actual          (precio que paga el cliente)
base_price     = round(precio_actual / 1.16, 2)
```

El alcance original decia lo contrario (`base_price = precio_actual`,
`price_with_tax = base_price * 1.16`). Corregido antes de codificar.

### dec-product-count-desde-categorias-array

`categoria_principal` en el JSON del scraper solo tiene 8 valores
unicos (la categoria primaria de WooCommerce). Las otras 6 categorias
(Ikoberes, Semillas, Varios, Paquetes, Mayoreo, Titulos) solo aparecen
en el array `categorias[]` de cada producto.

Decision: `product_count` de cada categoria se calcula desde el array
`categorias[]` para que todas las 14 muestren conteos reales. La
asignacion de categoria primaria de cada producto sigue usando
`categoria_principal`.

Consecuencia: la suma de `product_count` es 434 (>256) porque los
productos aparecen en multiples categorias. Correcto y esperado.

### dec-imagenes-public-copyplugin

Las 320 imagenes PNG (24 MB) viven en `public/catalog/images/` y
se copian a `dist/catalog/images/` via `copy-webpack-plugin` solo
cuando `DEMO_MODE=true`. Tres alternativas evaluadas en el analisis:

- Opcion B (webpack asset/resource): descartada — require imports
  dinamicos por cada imagen, no viable con 320 archivos y paths
  generados en runtime.
- Opcion C (URLs externas ojayoruba.com): descartada — dependencia
  de disponibilidad de servidor externo.
- **Opcion A elegida**: paths predecibles como strings, cero peso en
  production sin DEMO_MODE, disponible en `npm run dev` sin build.

### dec-catalog-ts-versionado

`src/mocks/data/catalog.ts` es generado por el script pero se versiona
en el repo. No se regenera automaticamente en el build. Razon: el
catalogo real cambia raramente; regenerar en cada build agrega tiempo
innecesario y hace que el diff del commit mezcle codigo y datos.

### dec-solo-primera-imagen-mvp

37 productos tienen 2-4 imagenes en el scraper. Solo se usa la primera
imagen por producto. Implementar galeria es trabajo de UI independiente
de la integracion del catalogo.

### dec-faker-eliminado-de-handler

El handler `catalog.ts` ya no importa `@faker-js/faker` ni
`createProductList`. Los datos son estaticos. La factory `product.ts`
conserva Faker para tests que necesiten productos con overrides
arbitrarios. El handler y la factory tienen fuentes de datos distintas
e independientes por diseno.

## Seccion 2 — Hallazgos durante la ejecucion

### hallazgo-categoria-principal-8-valores

El `_catalogo_completo.json` tiene solo 8 valores unicos en
`categoria_principal`, no 14. Las 6 categorias restantes aparecen
en `categorias[]` como categorias secundarias. El script original
calculaba `product_count` desde `categoria_principal` y generaba 6
categorias con count=0. Corregido en T-102.

### hallazgo-alcance-precio-invertido

El alcance declaraba `base_price = precio_actual`. La realidad del
mercado mexicano y el comportamiento de ojayoruba.com lo invierten.
Corregido antes de codificar. Documentado en dec-precio-iva-incluido.

### hallazgo-src-mocks-data-no-existia

El directorio `src/mocks/data/` no existia. Creado como parte de F1
(T-101). El script lo crea con `mkdirSync({ recursive: true })`.

## Seccion 3 — Verificacion post-ejecucion

| Criterio | Resultado | Evidencia |
|----------|-----------|-----------|
| Script genera 256 productos | PASA | `node scripts/transform-catalog.mjs ... -> 256 productos` |
| Script genera 14 categorias | PASA | Salida del script: `Categorias: 14` |
| 0 categorias con product_count=0 | PASA | Python check: `Sin product_count=0: 0` |
| 256 referencias a imagenes en catalog.ts | PASA | `len(imgs): 256` |
| Primera imagen existe en public/ | PASA | `ls public/catalog/images/abe-esu-cuchilla-de-esu.png` |
| Handler no usa Faker | PASA | `grep faker catalog.ts` retorna vacio |
| Handler importa CATALOG_PRODUCTS | PASA | Linea 26 de catalog.ts handler |
| 4 handlers con paths correctos | PASA | grep http.get muestra los 4 paths /api/v1/ |
| CopyPlugin condicional (DEMO_MODE) | PASA | `isDemoMode && new CopyPlugin` en webpack.config.js |
| CopyPlugin tiene 2 patterns | PASA | mockServiceWorker.js + catalog/images |
| 14 categorias en product.ts factory | PASA | grep CATEGORIES product.ts muestra 14 entradas |
| Verificacion funcional npm run dev | PENDIENTE | Requiere Node+npm en distro WSL2 |
| Verificacion funcional npm run build:demo | PENDIENTE | Requiere Node+npm en distro WSL2 |
