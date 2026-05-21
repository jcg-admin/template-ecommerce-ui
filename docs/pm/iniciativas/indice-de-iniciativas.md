# Indice de iniciativas

Catalogo unico de iniciativas de este repositorio. Cualquier
iniciativa propuesta, en analisis, en ejecucion o cerrada vive en
este indice. Cuando cambia de estado se actualiza su fila; no se
crean tablas paralelas por estado.

El procedimiento que define como se gestiona cada iniciativa vive
en [como-gestionar-iniciativas.md](../como-gestionar-iniciativas.md).

## Tabla

Estados posibles: `Backlog`, `En analisis`, `En ejecucion`, `Cerrada`.

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
| [ampliar-ucs-de-ecommerce](ampliar-ucs-de-ecommerce/) | En analisis | Solicitud usuario (pivot durante completar-dominio) | Estudiar como la API de MercadoPago expone sus endpoints como fuente de inspiracion, cruzarlo contra el inventario actual del template (7 UCs de pagos declarados, 2 mockeados, huecos en 03/04/07/10), decidir que UCs nuevos incorporar y ejecutarlos bajo la disciplina del template. Bloquea a `completar-dominio-de-ecommerce` hasta su cierre. | |
| [monitorear-y-reducir-allowlist-hex](monitorear-y-reducir-allowlist-hex/) | Backlog | resolver-hallazgos-de-deuda-del-template (H-05) | Mantener la allowlist de colores `#hex` plana o decreciente mediante un bloqueador mecanico en pre-push y un ritual trimestral documentado. | 3 |

## Iniciativas mencionadas en commits pero sin directorio aqui

Algunos commits del repo hacen referencia a iniciativas que **no
viven en este repo de UI** porque son del monorepo conceptual
`e-comerce` que tiene su gestion en otro repositorio (`e-comerce-doc`
con Sphinx). Se listan para trazabilidad:

| Iniciativa referenciada | Donde vive | Por que se referencia desde commits del UI |
|-------------------------|------------|--------------------------------------------|
| `eliminar-lazy-imports-ui` | `e-comerce-doc/source/gestion/pm/ui/iniciativas/` | Origina los commits `46acc7d`, `09fa1bd` de la rama pendiente. |
| `provisionar-nodejs-ui-develop` | `e-comerce-doc/source/gestion/pm/ui/iniciativas/` | Origina el commit `04e526b` (provisioner). |
| `corregir-carga-env-webpack-config` | `e-comerce-doc/source/gestion/pm/ui/iniciativas/` | Origina el commit `c9c3465` (fix del callback de webpack). |

La razon por la que estas iniciativas no se replican aqui: el
procedimiento PROC-GESTION-001 declara cinco submodulos (`api`,
`db`, `docs`, `server`, `ui`) y centraliza la gestion en el repo
`docs`. Este repo (`e-comerce-ui`) es el submodulo `ui` desde el
punto de vista del codigo, pero la documentacion de iniciativas
vive en el repo `docs` segun el procedimiento. Aqui se conservan
solo iniciativas cuyo objeto de trabajo es la documentacion o el
codigo local de este repositorio.
