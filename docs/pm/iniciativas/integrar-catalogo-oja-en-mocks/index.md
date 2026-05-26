# Iniciativa: integrar-catalogo-oja-en-mocks

| Campo | Valor |
|-------|-------|
| Slug | `integrar-catalogo-oja-en-mocks` |
| Estado | Cerrada |
| Orden de backlog | (vacio: abierta directamente) |
| Fecha de creacion (directorio) | 2026-05-26 |
| Fecha de apertura formal | 2026-05-26 |
| Fecha de paso a ejecucion | 2026-05-26 |
| Fecha de cierre | 2026-05-26 |
| Iniciativa origen | (raiz) |

## Motivo de existencia

Los handlers MSW de `catalog.ts` generan productos con `@faker-js/faker`:
nombres en ingles generico, precios arbitrarios, categorias inventadas.
El modo demo (`DEMO_MODE=true`) muestra datos sin contexto de negocio.

Existe un catalogo real de 256 productos de **Ọja Yoruba** (tienda de
productos de la tradicion Yoruba) con datos reales: nombres en
español/yoruba, precios en MXN, 14 categorias, 320 imagenes PNG de
producto. Este catalogo reemplaza los datos ficticios de Faker en el
modo demo.

El trabajo tiene tres dimensiones independientes:

1. **Transformacion de datos**: el JSON del scraper usa campos en
   español (`nombre`, `precio_actual`, `categorias`). Los handlers
   y tipos del template usan ingles (`name`, `base_price`, `category`).
   Se genera un archivo TypeScript con los datos ya transformados.

2. **Imagenes como assets estaticos**: 320 PNGs (24 MB total, 77 KB
   promedio). Se sirven como archivos estaticos en `dist/catalog/images/`
   via `copy-webpack-plugin`, solo cuando `DEMO_MODE=true`. El bundle
   JS referencia las rutas como strings — cero peso adicional en JS.

3. **14 categorias reales**: los handlers actuales tienen 5 categorias
   inventadas. Se reemplazan con las 14 categorias del catalogo real.

## ADR relacionada

`dec-mocks-via-msw-service-worker` — no se supersede. Esta iniciativa
es una evolucion del contenido de los mocks, no de la arquitectura.
El `DEMO_MODE` introducido en `habilitar-msw-en-modo-demo` es el
mecanismo de activacion; esta iniciativa lo rellena con datos reales.

## Estado actual

Iniciativa **en ejecucion** desde 2026-05-26.

## Indice de documentos

| Documento | Proposito |
|-----------|-----------|
| [alcance-integrar-catalogo-oja-en-mocks.md](alcance-integrar-catalogo-oja-en-mocks.md) | Que cubre, criterio de completitud, fuera de alcance. |
| [analisis-integrar-catalogo-oja-en-mocks.md](analisis-integrar-catalogo-oja-en-mocks.md) | Mapeo de campos, analisis de imagenes, estructura de datos generada. |
| [plan-integrar-catalogo-oja-en-mocks.md](plan-integrar-catalogo-oja-en-mocks.md) | Fases, tareas atomicas T-NNN y DAG. |
| [tareas-integrar-catalogo-oja-en-mocks.md](tareas-integrar-catalogo-oja-en-mocks.md) | Lista plana de tareas con estado. |
| [progreso-integrar-catalogo-oja-en-mocks.md](progreso-integrar-catalogo-oja-en-mocks.md) | Log del avance. |
| [decisiones-integrar-catalogo-oja-en-mocks.md](decisiones-integrar-catalogo-oja-en-mocks.md) | Decisiones de diseno, hallazgos y verificacion. |
