# Iniciativa: adaptar-componentes-kno-react

**Estado:** EN ANÁLISIS
**Creada:** 2026-06-02
**Origen:** Solicitud usuario — estudiar el repo `NestorMonroy/-progress` (paquetes
`kno-*`) para adaptar de manera **nativa** componentes como ScrollView,
PDF Viewer, Gantt, etc. al dominio del template.
**Rama:** claude/brave-lamport-BUmBM

## Motivo

El usuario quiere incorporar al template las capacidades de una librería de
componentes rica (ScrollView/carrusel, visor PDF, Gantt, grid avanzado, upload,
etc.). El repo de referencia se clonó en `/tmp/references/-progress` (no
versionado en este repo).

## Enfoque que gobierna la iniciativa (Premise Gate)

El objetivo declarado es adaptar **de manera nativa** estos componentes al
template. Por tanto la estrategia es la misma que en la iniciativa previa
`integrar-componentes-ui-core-js`: **estudiar el catálogo, las APIs públicas
(`.d.ts`) y los patrones de UX como referencia de diseño, e implementar
componentes y UCs propios desde cero** en el stack del template (React + hooks
+ Redux/React Query + SCSS del sistema Yoruba). El resultado es código propio;
el repo de referencia no se importa ni se empaqueta en producción.

Datos observados del repo (neutrales, para contexto de la referencia):

- Los `package.json` usan el scope `@progress/kno-react-*` y metadatos con
  `productCode: "KENDOUIREACT"`; los `README.md` mencionan "license key". O sea,
  el catálogo está modelado sobre **KendoReact**, una librería madura — buena
  como referencia de API y UX.
- Los paquetes vienen **compilados/minificados** (`.mjs`/`.js`) + typings
  `.d.ts`. La fuente útil para inspirarse es la **API pública** (`.d.ts`,
  README) y el comportamiento, no los internals.

> Nota de procedencia: la conclusión sobre uso/licencia del código de referencia
> la define el dueño del proyecto. Esta iniciativa no copia ni redistribuye ese
> código; produce implementaciones nativas, por lo que el enfoque es válido con
> independencia de la procedencia.

## Estado actual

- Repo clonado y auditado: 70 paquetes `kno-*` (41 `kno-react-*`).
- Premise Gate ejecutado (nivel 0c por red flags: licencia + infra compartida).
- Inventario y mapeo al dominio ecommerce documentados en
  `analisis-inventario-y-mapeo.md`.
- Pendiente: que el usuario priorice qué componentes adaptar primero y confirme
  el reencuadre nativo, para planear las fases y los UCs.

## Índice

| Archivo | Descripción |
|---------|-------------|
| `alcance-adaptar-componentes-kno-react.md` | Premisa verificada, qué cubre, criterio, fuera de alcance |
| `analisis-inventario-y-mapeo.md` | 41 paquetes `kno-react-*` mapeados al dominio ecommerce y a lo que el template ya tiene |
