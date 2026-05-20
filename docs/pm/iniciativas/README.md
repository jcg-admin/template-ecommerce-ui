# Iniciativas

Lista de iniciativas de `pm/` para este repositorio. Cada iniciativa
es un paquete de trabajo acotado con cinco artefactos canonicos
(alcance, analisis, tareas, progreso, decisiones) y un nombre en
verbo en infinitivo mas objeto de trabajo.

## Iniciativas registradas

| Iniciativa | Estado | Propósito |
|-----------|--------|-----------|
| [analizar-ramas-pendientes-de-integracion](analizar-ramas-pendientes-de-integracion/) | COMPLETADA | Inventariar las seis ramas remotas del repo, clasificarlas por estado de integracion y documentar tanto las pendientes como las ya integradas para referencia futura. |
| [resolver-hallazgos-de-deuda-del-template](resolver-hallazgos-de-deuda-del-template/) | EN EJECUCION | Resolver los 5 hallazgos aplicables al template (H-01 a H-04, H-08), delegar 2 a iniciativas propias (H-05, H-07), retirar 13 historicos o duplicados (H-06, H-09 a H-20). Plan en 7 fases productivas mas cierre, 25 tareas atomicas. |

## Iniciativas previstas para abrirse cuando esta cierre

Salen del documento de alcance de `resolver-hallazgos-de-deuda-del-template`.
Se listan aqui para trazabilidad antes de que existan sus directorios.

| Slug previsto | Hallazgo origen | Orden previsto |
|---------------|-----------------|----------------|
| `validar-contrato-de-mocks-vs-backend-real` | H-07 | Primera proxima iniciativa |
| `monitorear-y-reducir-allowlist-hex` | H-05 | Segunda proxima iniciativa |

## Iniciativas mencionadas en commits pero sin directorio aqui

Algunos commits del repo hacen referencia a iniciativas que **no
viven en este repo de UI** porque son del monorepo conceptual
`e-comerce` que tiene su gestion en otro repositorio (`e-comerce-doc`
con Sphinx). Se listan aqui para trazabilidad:

| Iniciativa referenciada | Donde vive | Por que se referencia desde commits del UI |
|-------------------------|------------|--------------------------------------------|
| `eliminar-lazy-imports-ui` | `e-comerce-doc/source/gestion/pm/ui/iniciativas/` | Origina los commits `46acc7d`, `09fa1bd` de la rama pendiente. |
| `provisionar-nodejs-ui-develop` | `e-comerce-doc/source/gestion/pm/ui/iniciativas/` | Origina el commit `04e526b` (provisioner). |
| `corregir-carga-env-webpack-config` | `e-comerce-doc/source/gestion/pm/ui/iniciativas/` | Origina el commit `c9c3465` (fix del callback de webpack). |

La razon por la que estas iniciativas no se replican aqui:

- El procedimiento PROC-GESTION-001 declara cinco submodulos (`api`,
  `db`, `docs`, `server`, `ui`) y centraliza la gestion en el repo
  `docs`. Este repo (`e-comerce-ui`) es el submodulo `ui` desde el
  punto de vista del codigo, pero la documentacion de iniciativas
  vive en el repo `docs` segun el procedimiento.
- Aqui se conserva una iniciativa de **analisis** propia del repo
  (`analizar-ramas-pendientes-de-integracion`) porque su objeto de
  trabajo es la documentacion local de este repositorio.

## Como agregar una nueva iniciativa

1. Confirmar que el trabajo es propio de este repo de UI (no requiere
   conocer la documentacion centralizada de UCs).
2. Elegir un nombre en verbo + objeto (`analizar-X`, `documentar-Y`,
   `corregir-Z`).
3. Crear el directorio `pm/iniciativas/<nombre>/`.
4. Crear los cinco archivos canonicos.
5. Anadir una fila a la tabla "Iniciativas registradas" de este
   README.

Si la iniciativa toca codigo, no documentacion del repo, registrarla
en el repo `docs` segun el procedimiento general.
