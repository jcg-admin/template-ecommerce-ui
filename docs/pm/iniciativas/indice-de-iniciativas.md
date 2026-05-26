# Indice de iniciativas

Catalogo unico de iniciativas de este repositorio. Cualquier
iniciativa propuesta, en analisis, en ejecucion o cerrada vive en
este indice. Cuando cambia de estado se actualiza su fila; no se
crean tablas paralelas por estado.

El procedimiento que define como se gestiona cada iniciativa vive
en [como-gestionar-iniciativas.md](../como-gestionar-iniciativas.md).

## Tabla

Estados posibles: `Backlog`, `En analisis`, `En ejecucion`, `Cerrada`,
`Cancelada`.

Distincion `Cerrada` vs `Cancelada`:

- **Cerrada**: la iniciativa ejecuto su trabajo y produjo resultados.
  Tiene `decisiones-*.md` con las cuatro secciones canonicas.
- **Cancelada**: la iniciativa no se ejecuto y su scope fue absorbido
  por otra, descartado, o reconceptualizado. No requiere
  `decisiones-*.md` propio; la justificacion vive en el `index.md`
  de la iniciativa cancelada con apunte a la iniciativa que la
  subsume (si aplica).

La columna **Orden de backlog** solo lleva valor cuando el estado es
`Backlog`; indica la prioridad propuesta de apertura. Cuando la
iniciativa pasa a otro estado, la celda se vacia.

| Slug | Estado | Iniciativa origen | Motivo de existencia | Orden de backlog |
|------|--------|-------------------|----------------------|------------------|
| [analizar-ramas-pendientes-de-integracion](analizar-ramas-pendientes-de-integracion/) | Cerrada | (raiz) | Inventariar las seis ramas remotas del repo, clasificarlas por estado de integracion y documentar tanto las pendientes como las ya integradas. | |
| [resolver-hallazgos-de-deuda-del-template](resolver-hallazgos-de-deuda-del-template/) | Cerrada | (raiz) | Resolver hallazgos de deuda del template aplicables (H-01 a H-04, H-08), delegar 2 a iniciativas propias (H-05, H-07), retirar 13 historicos o duplicados. | |
| [revisar-arquitectura-de-mocks](revisar-arquitectura-de-mocks/) | Cerrada | (raiz) | Analizar las opciones de arquitectura de mocks contra los criterios del template (adoptable por terceros, no acoplar el codigo de produccion, mantener trazabilidad con el dominio), recomendar una y aplicarla si la decision es cambiar. Precede a `validar-contrato-de-mocks-vs-backend-real`: primero se decide como viven los mocks, despues se valida que su forma coincide con el backend real cuando llegue. | |
| [validar-contrato-de-mocks-vs-backend-real](validar-contrato-de-mocks-vs-backend-real/) | Backlog | resolver-hallazgos-de-deuda-del-template (H-07) | Asegurar que los mocks de `src/mocks/` reflejen el contrato real del backend Django+DRF, mediante schema por endpoint o generacion desde OpenAPI. | 1 |
| [completar-dominio-de-ecommerce](completar-dominio-de-ecommerce/) | En ejecucion | resolver-hallazgos-de-deuda-del-template (Fase 5 replan, H-02) | Completar el modelo de dominio del template a nivel de las entidades comunes a cualquier e-commerce: User extendido, Address como entidad reutilizable, ProductVariant, Review, junto con los UCs que las soporten. **Bloqueada** desde 2026-05-21 por apertura de `ampliar-ucs-de-ecommerce`. | |
| [ampliar-ucs-de-ecommerce](ampliar-ucs-de-ecommerce/) | En analisis (pausada) | Solicitud usuario (pivot durante completar-dominio) | Estudiar como la API de MercadoPago expone sus endpoints como fuente de inspiracion, cruzarlo contra el inventario actual del template, decidir que UCs nuevos incorporar y ejecutarlos bajo la disciplina del template. **Pausada 2026-05-21** tras 6 UCs estudiados, esperando decision del usuario sobre como continuar. Bloquea a `completar-dominio-de-ecommerce` hasta su cierre. | |
| [monitorear-y-reducir-allowlist-hex](monitorear-y-reducir-allowlist-hex/) | Cancelada | resolver-hallazgos-de-deuda-del-template (H-05) | Mantener la allowlist de colores `#hex` plana o decreciente mediante un bloqueador mecanico en pre-push y un ritual trimestral documentado. **Cancelada 2026-05-21**: subsumida por `mapear-y-corregir-scss-completo` que amplia el scope a mapeo y correccion integral del SCSS, no solo allowlist hex. | |
| [mapear-y-corregir-scss-completo](mapear-y-corregir-scss-completo/) | En ejecucion | Solicitud usuario (ampliacion de scope de `monitorear-y-reducir-allowlist-hex` cancelada) | Mapear y corregir el SCSS completo del template: organizacion de variables, tokens de diseno, convenciones de nombrado, pipeline `@use`/`@forward`, especificidad, modulos vs globales, variables muertas/duplicadas. **No es solo auditoria**: incluye fase correctiva por dimension (cambios aplicados al repo). Subsume el trabajo planeado para `monitorear-y-reducir-allowlist-hex` (allowlist hex + bloqueador pre-push + ritual trimestral) como dimension 9 de 9. **Plan: 5 fases, 24 tareas, ~8.75 h, En ejecucion desde 2026-05-21**. | |
| [corregir-nomenclatura-ecommerce-y-estilo-diagramas](corregir-nomenclatura-ecommerce-y-estilo-diagramas/) | Cerrada | Solicitud usuario (calidad del template antes de pushear) | Corregir el typo historico `e-comerce` (una `m`, con guion) a `ecommerce` (doble `m`, sin guion) en TODOS los strings que apuntan a este proyecto y sus repos hermanos. Adicionalmente: estandarizar el estilo de diagramas Mermaid segun convencion canonica (tema dark + identificadores snake_case + classDef para flowchart). Iniciativa cross-repo coordinando trabajo en `template-ecommerce-ui` y `template-ecommerce-server` (renombrado en F2). **Cerrada 2026-05-22**. 7 decisiones D-*, 7 fases (F0-F7), 32 tareas, 12 commits (10 UI + 2 server), 19 diagramas reestilados, ~256 archivos modificados en el UI, ~27 archivos en server. Excepciones preservadas: referente externo `jcg-admin/e-comerce-server`, procedimiento `ecomerce-p001`, mensajes de commit historicos. Cero regresiones (tests 2/813 mantienen baseline). | |
| [habilitar-msw-en-modo-demo](habilitar-msw-en-modo-demo/) | Cerrada | (raiz) | El `dist/` compilado con `npm run build` no muestra datos porque MSW esta guardado por `NODE_ENV !== 'production'` y `mockServiceWorker.js` no se copia a `dist/`. Esta iniciativa agrega `DEMO_MODE=true` como variable opt-in que activa MSW sobre el bundle compilado mediante `copy-webpack-plugin` condicional. Un build de produccion real sin `DEMO_MODE` no cambia. | |
| [auditar-y-corregir-inconsistencias](auditar-y-corregir-inconsistencias/) | Cerrada | (raiz) | Los handlers MSW interceptan paths distintos a los que la app realmente llama. H-01 CRITICA: `catalog.ts` intercepta `/api/products/` pero la app llama a `/api/v1/catalogue/`. H-02: handlers legacy en `auth.ts`. H-04: `payments.ts` con paths incorrectos. H-05: wishlist path sin `/v1/`. H-06: `API_BASE` codigo muerto. H-07: proxy devServer fallback sin documentar. | |

## Iniciativas mencionadas en commits pero sin directorio aqui

Algunos commits del repo hacen referencia a iniciativas que **no
viven en este repo de UI** porque son del monorepo conceptual
`ecommerce` que tiene su gestion en otro repositorio (`ecommerce-doc`
con Sphinx). Se listan para trazabilidad:

| Iniciativa referenciada | Donde vive | Por que se referencia desde commits del UI |
|-------------------------|------------|--------------------------------------------|
| `eliminar-lazy-imports-ui` | `ecommerce-doc/source/gestion/pm/ui/iniciativas/` | Origina los commits `46acc7d`, `09fa1bd` de la rama pendiente. |
| `provisionar-nodejs-ui-develop` | `ecommerce-doc/source/gestion/pm/ui/iniciativas/` | Origina el commit `04e526b` (provisioner). |
| `corregir-carga-env-webpack-config` | `ecommerce-doc/source/gestion/pm/ui/iniciativas/` | Origina el commit `c9c3465` (fix del callback de webpack). |

La razon por la que estas iniciativas no se replican aqui: el
procedimiento PROC-GESTION-001 declara cinco submodulos (`api`,
`db`, `docs`, `server`, `ui`) y centraliza la gestion en el repo
`docs`. Este repo (`ecommerce-ui`) es el submodulo `ui` desde el
punto de vista del codigo, pero la documentacion de iniciativas
vive en el repo `docs` segun el procedimiento. Aqui se conservan
solo iniciativas cuyo objeto de trabajo es la documentacion o el
codigo local de este repositorio.
| [integrar-catalogo-oja-en-mocks](integrar-catalogo-oja-en-mocks/) | Cerrada | (raiz) | Los handlers MSW generan productos con Faker (datos ficticios). El catalogo real de Oja Yoruba (256 productos, 14 categorias, 320 PNGs) reemplaza los datos de Faker. Tres dimensiones: transformacion de campos ES->EN, imagenes como assets estaticos en DEMO_MODE via CopyPlugin, 14 categorias reales en lugar de las 5 inventadas. | |
| [auditar-integracion-catalogo](auditar-integracion-catalogo/) | En ejecucion | (raiz) | Auditoria de las tres iniciativas recientes. 7 hallazgos: A-02 paginacion de busqueda rota, A-07 filtro por categoria retorna vacio para 6 de 14 categorias (causa: categoria_principal solo tiene 8 valores), A-01 JSDoc browser.ts desactualizado, A-03 checkoutSlice legacy sin deprecated, A-05 script sin entrada npm, A-06 as const con readonly. | |
