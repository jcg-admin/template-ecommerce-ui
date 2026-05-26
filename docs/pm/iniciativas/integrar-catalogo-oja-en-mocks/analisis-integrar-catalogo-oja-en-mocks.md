# Analisis: Integrar catalogo Oja en mocks

| Campo | Valor |
|-------|-------|
| Iniciativa | integrar-catalogo-oja-en-mocks |
| Fecha de creacion | 2026-05-26 |

## Inventario del catalogo fuente

| Metrica | Valor |
|---------|-------|
| Total productos | 256 |
| Con descuento | 104 (40.6%) |
| Sin descuento | 152 (59.4%) |
| Descuento minimo | 5% |
| Descuento maximo | 65% |
| Descuento promedio | 27.3% |
| Precio minimo | $25 MXN |
| Precio maximo | $17,999 MXN |
| Precio promedio | $1,495 MXN |
| Con stock explicito | 0 (todos son null) |
| Imagenes totales | 322 referencias / 320 archivos PNG en disco |
| Productos con multiples imagenes | 37 |
| Peso total imagenes | 24 MB |
| Peso promedio por imagen | 77 KB |
| Peso maximo (P90) | 116 KB |

## 14 Categorias con conteo de productos

| ID | Nombre real | Slug | Productos |
|----|-------------|------|-----------|
| 1 | Lo Nuevo | `lo-nuevo` | 82 |
| 2 | Akoses / Medicinas | `akoses-medicinas` | 74 |
| 3 | Collares y Pulseras | `collares-y-pulseras` | 69 |
| 4 | Isan / Iconos | `isan-iconos` | 67 |
| 5 | Complementos y Herramientas | `complementos-y-herramientas` | 45 |
| 6 | Enseres | `enseres` | 29 |
| 7 | Collares de Orumila | `collares-de-orumila` | 18 |
| 8 | Ikoberes / Amuletos | `ikoberes-amuletos` | 14 |
| 9 | Semillas | `semillas` | 10 |
| 10 | Ropa y Telas | `ropa-y-telas` | 8 |
| 11 | Varios | `varios` | 7 |
| 12 | Paquetes | `paquetes` | 5 |
| 13 | Mayoreo | `mayoreo` | 3 |
| 14 | Titulos | `titulos` | 3 |

Nota: un producto puede aparecer en multiples categorias (campo
`categorias` es un array). Se usa `categoria_principal` para asignar
la categoria primaria a cada producto.

## Analisis de la transformacion de campos

### Campos que requieren transformacion de nombre

```
nombre           -> name
precio_actual    -> base_price
precio_original  -> original_price
descuento_pct    -> discount_pct
descripcion      -> description
stock_disponible -> stock
categoria_principal -> category_name (string) + category (objeto)
valoracion       -> rating_avg
num_resenas      -> review_count
imagenes         -> images (array transformado)
```

### Campos que requieren calculo

```
price_with_tax = base_price * 1.16   (IVA 16% MXN)
effective_price = precio_original ? base_price : price_with_tax
stock           = stock_disponible ?? 10  (todos son null en el catalogo)
id              = indice 1-based del producto en el array
sku             = 'OJA-' + slug.substring(0,8).toUpperCase()
```

### Campos ignorados

```
url, breadcrumb, fecha_entrega, url_wishlist, ahorro,
unidades_compradas, scrapeado_en
```

### Transformacion de imagenes

```
imagenes[0].archivo  -> images[0].url = '/catalog/images/' + archivo
imagenes[0].is_main  = true
```

Solo se usa la primera imagen por producto (MVP). Los 37 productos con
multiples imagenes se quedan con la primera hasta que se implemente
la galeria.

### Transformacion de categoria

```python
# categoria_principal: string como "Akoses / Medicinas"
# Se mapea a objeto Category:
{
  id:            ID de la tabla de categorias (1-14)
  name:          nombre real (ej: "Akoses / Medicinas")
  slug:          slug normalizado (ej: "akoses-medicinas")
  product_count: conteo de productos en esa categoria
}
```

## Analisis de imagenes como assets estaticos

### Por que Opcion A (public/ + CopyPlugin)

**Opcion A**: `public/catalog/images/` + `copy-webpack-plugin` -> `dist/catalog/images/`

| Criterio | Opcion A | Opcion B (webpack asset/resource) | Opcion C (URLs externas) |
|----------|----------|-----------------------------------|--------------------------|
| Peso adicional en bundle JS | 0 bytes | 0 bytes (los hashes van en JS, imagenes separadas) | 0 bytes |
| Peso adicional en dist/ | +24 MB (solo DEMO_MODE) | +24 MB (siempre) | 0 bytes |
| Disponible en npm run dev | Si (public/ se sirve directo) | Si (webpack procesa) | Si (URL externa) |
| Dependencia externa | No | No | Si (ojayoruba.com debe estar online) |
| Paths predecibles | Si (/catalog/images/slug.png) | No (hash en nombre) | Si |
| Solo en DEMO_MODE | Si (CopyPlugin condicional) | No (webpack los procesa siempre si se importan) | Si (solo el string de URL) |
| Complejidad | Baja | Alta (require o import dinamico por producto) | Baja |

**Decision: Opcion A.** Es la mas simple, no agrega peso en produccion
sin DEMO_MODE, y los paths son predecibles (lo que permite referenciarlos
como strings simples en el archivo de datos sin complicar el build).

### Implementacion de imagenes

**En `webpack.config.js`** (extension del patron de `mockServiceWorker.js`):

```javascript
isDemoMode && new CopyPlugin({
  patterns: [
    {
      from: path.resolve(__dirname, 'public/mockServiceWorker.js'),
      to:   path.resolve(__dirname, 'dist/mockServiceWorker.js'),
    },
    // NUEVO: imagenes del catalogo demo
    {
      from: path.resolve(__dirname, 'public/catalog/images'),
      to:   path.resolve(__dirname, 'dist/catalog/images'),
    },
  ],
}),
```

**En `npm run dev`**: webpack-dev-server sirve `public/` desde root.
Las imagenes en `public/catalog/images/` estaran disponibles en
`http://localhost:3001/catalog/images/nombre.png` sin configuracion
adicional.

## Estructura de archivos a crear/modificar

```
src/
  mocks/
    data/
      catalog.ts          <- NUEVO: 256 productos + 14 categorias
    handlers/
      catalog.ts          <- MODIFICAR: usar data/catalog.ts en lugar de Faker
    factories/
      product.ts          <- MODIFICAR: actualizar CATEGORIES con las 14 reales

scripts/
  transform-catalog.mjs   <- NUEVO: script de transformacion

public/
  catalog/
    images/               <- NUEVO: 320 PNGs del catalogo
      *.png

webpack.config.js         <- MODIFICAR: CopyPlugin agrega catalog/images en DEMO_MODE
```

## Consideraciones de mantenimiento

- `src/mocks/data/catalog.ts` es generado por el script pero se versiona.
  No se regenera automaticamente en el build.
- Si el catalogo de Ọja Yoruba cambia, el operador ejecuta el script
  manualmente y commitea el nuevo `catalog.ts`.
- Las imagenes en `public/catalog/images/` tambien se versionan.
  Son 24 MB — aceptable para un repo de template de demostracion.
- El script de transformacion recibe la ruta del JSON como argumento
  para que funcione con cualquier catalogo futuro.
