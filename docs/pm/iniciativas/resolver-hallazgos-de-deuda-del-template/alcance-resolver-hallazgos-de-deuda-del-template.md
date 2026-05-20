# Alcance: Resolver hallazgos de deuda del template

| Campo | Valor |
|-------|-------|
| Iniciativa | resolver-hallazgos-de-deuda-del-template |
| Estado | En analisis |
| Version | 0.1.0 |
| Fecha de creacion | 2026-05-20T21:09:03 |

## Por que existe esta iniciativa

El template heredo de su repositorio fuente un inventario de
**riesgos y deuda** documentados en
`docs/riesgos-y-deuda-tecnica/riesgos-y-deuda-tecnica.md` y un
inventario de **hallazgos** en la iniciativa previa
`analizar-ramas-pendientes-de-integracion`. Ese inventario hoy mezcla
tres categorias que conviene separar:

- Hallazgos **especificos del repositorio fuente** que no aplican al
  template (ramas que aqui no existen, release candidate de develop a
  main, sprint 4 sin trazar).
- Hallazgos **aplicables al template** que requieren resolucion
  concreta (decorators y types huerfanos, stack TypeScript sin uso,
  README sin enlaces a la documentacion).
- Riesgos **continuos** que ni se resuelven ni se ignoran
  (divergencia mocks vs contrato real, monitoreo del allowlist de
  hex).

Esta iniciativa toma cada hallazgo por separado, produce un analisis
con opciones de resolucion y, tras aprobacion, ejecuta las acciones.

## Inventario de hallazgos cubiertos

| ID | Nombre | Origen | Aplica al template |
|----|--------|--------|---------------------|
| H-01 | `deuda-decorators-experimental` | `riesgos-y-deuda-tecnica/` | Si |
| H-02 | `deuda-tipos-en-src-types` | `riesgos-y-deuda-tecnica/` | Si |
| H-03 | `deuda-sin-typescript-en-src` | `riesgos-y-deuda-tecnica/` | Si |
| H-04 | `deuda-readme-sin-actualizar-tras-cambios` | `riesgos-y-deuda-tecnica/` | Si |
| H-05 | `deuda-de-allowlist-color-no-hex` | `riesgos-y-deuda-tecnica/` | Si — delegado a iniciativa propia |
| H-06 | `deuda-de-tareas-sprint-4-sin-trazar` | `riesgos-y-deuda-tecnica/` | No (historico del repo fuente) |
| H-07 | `riesgo-divergencia-mocks-vs-contrato-real` | `riesgos-y-deuda-tecnica/` | Si — delegado a iniciativa propia (proxima iniciativa) |
| H-08 | `riesgo-bundle-construido-con-API-URL-equivocada` | `riesgos-y-deuda-tecnica/` | Si |
| H-09 | `riesgo-ausencia-de-ci-cd-automatizado` | `riesgos-y-deuda-tecnica/` | No (CI/CD fuera del scope) |
| H-10 | `riesgo-sin-cobertura-de-tests-medida` | `riesgos-y-deuda-tecnica/` | No (ya resuelto: `jest.config.cjs` declara threshold 80%) |
| H-11 | `riesgo-rama-pendiente-no-integrada` | `riesgos-y-deuda-tecnica/` | No (no hay rama pendiente en el template) |
| H-12 | `riesgo-release-candidate-acumulado-en-develop` | `riesgos-y-deuda-tecnica/` | No (no hay `develop` ni `main` en el template) |
| H-13 | `hallazgo-pr-uno-no-aparece-como-rama-remota` | iniciativa previa | No (historico) |
| H-14 | `hallazgo-conflicto-en-package-json-de-la-rama-pendiente` | iniciativa previa | No (historico) |
| H-15 | `hallazgo-rama-pendiente-tiene-36-commits-de-atraso` | iniciativa previa | No (historico) |
| H-16 | `hallazgo-deuda-en-src-decorators-y-src-types` | iniciativa previa | No (duplicado de H-01 y H-02) |
| H-17 | `hallazgo-readme-raiz-no-menciona-arc42-ni-pm` | iniciativa previa | No (duplicado de H-04) |
| H-18 | `hallazgo-stack-de-typescript-sin-uso-en-src` | iniciativa previa | No (duplicado de H-03) |
| H-19 | `hallazgo-ausencia-de-ci-cd` | iniciativa previa | No (duplicado de H-09) |
| H-20 | `hallazgo-149-commits-en-develop-sin-promover` | iniciativa previa | No (historico) |

**Total**: 20 hallazgos en el inventario heredado.
**Cubiertos en esta iniciativa**: 5 (H-01, H-02, H-03, H-04, H-08).
**Delegados a iniciativa propia**: 2 (H-05, H-07). Aplican al
template pero su alcance justifica una iniciativa separada; esta
iniciativa documenta donde se ubicaran.
**Se retiran del inventario**: 9 (historicos del repo fuente o
fuera de scope por decision: H-06, H-09, H-10, H-11, H-12, H-13,
H-14, H-15, H-20).
**Duplicados que se consolidan**: 4 (H-16, H-17, H-18, H-19).

## Iniciativas futuras delegadas desde esta

Dos hallazgos aplicables tienen alcance que excede el limite de
trabajo cohesivo de esta iniciativa. Se documentan aqui para que la
trazabilidad quede clara: cuando se abran las iniciativas
correspondientes, hereden el contexto.

| Hallazgo | Slug propuesto de la iniciativa | Resumen del alcance |
|----------|---------------------------------|---------------------|
| H-05 | `monitorear-y-reducir-allowlist-hex` | Bloqueador mecanico en pre-push con umbral de allowlist, ritual trimestral de auditoria documentado como `pm/iniciativas/auditar-allowlist-hex-trimestral-{YYYYQN}/`, criterios de conversion de hex a token. Producira al menos: un script `scripts/check-hex-allowlist-size.sh`, un hook `.husky/pre-push` modificado, y la plantilla del ritual trimestral. |
| H-07 | `validar-contrato-de-mocks-vs-backend-real` | Sistema de validacion de contratos entre mocks y backend real. Excede esta iniciativa porque las opciones reales (schema por endpoint con ajv/zod, generador desde OpenAPI, smoke tests contra staging) requieren cada una su propio diseno y, en algunos casos, coordinacion con el repositorio del backend. Sera la siguiente iniciativa cuando esta cierre. |

Ambas iniciativas tienen su carpeta destino prevista:

- `docs/pm/iniciativas/monitorear-y-reducir-allowlist-hex/`
- `docs/pm/iniciativas/validar-contrato-de-mocks-vs-backend-real/`

Esta iniciativa **no las crea**. Solo declara su existencia y
referencia para que el cierre de esta sea coherente.

## Criterio de completitud verificable

La iniciativa esta completa cuando **todas** las siguientes
afirmaciones son verdaderas. Cada una es comprobable mecanicamente.

1. Cada uno de los 5 hallazgos cubiertos (H-01, H-02, H-03, H-04,
   H-08) tiene veredicto formal: resuelto, retirado o aceptado con
   justificacion explicita.
2. Los hallazgos resueltos tienen su commit Tim Pope correspondiente
   en `git log` con referencia al ID del hallazgo en el cuerpo.
3. Los 2 hallazgos delegados (H-05, H-07) aparecen en
   `docs/riesgos-y-deuda-tecnica/riesgos-y-deuda-tecnica.md` con
   estado "delegado a iniciativa propia" y referencia al slug de la
   iniciativa correspondiente.
4. Los 9 hallazgos retirados (H-06, H-09, H-10, H-11, H-12, H-13,
   H-14, H-15, H-20) y los 4 duplicados (H-16, H-17, H-18, H-19) ya
   no aparecen en
   `docs/riesgos-y-deuda-tecnica/riesgos-y-deuda-tecnica.md` ni en
   `docs/pm/iniciativas/analizar-ramas-pendientes-de-integracion/decisiones-*.md`.
5. El documento de decisiones al cierre
   (`decisiones-resolver-hallazgos-*.md`) contiene las tres secciones
   obligatorias por PROC-GESTION-001: decisiones de diseno, hallazgos
   durante la ejecucion, verificacion post-ejecucion.
6. `docs/riesgos-y-deuda-tecnica/riesgos-y-deuda-tecnica.md` queda
   con un inventario coherente: solo hallazgos vivos del template,
   con estado claro de cada uno.
7. Los archivos `tareas-resolver-*.md` y `progreso-resolver-*.md`
   existen y tienen la trazabilidad completa entre cada tarea T-NNN
   y el hallazgo H-NN que aborda.

## Fuera de alcance

| Item | Por que esta fuera |
|------|--------------------|
| CI/CD con GitHub Actions | El usuario declaro N/A para el template. Si en el futuro se decide incluir, se abre una iniciativa propia. |
| Migracion completa a TypeScript | El analisis evalua opciones; ejecutar una migracion masiva queda como iniciativa separada si esa es la opcion elegida. |
| Cambios en la arquitectura del template (Redux, React Query, layouts) | La iniciativa resuelve hallazgos pendientes, no rediseña la espina dorsal. |
| Hallazgos del repositorio fuente que no aplican al template | Se retiran del inventario sin analisis adicional. |
| Resolucion de la divergencia mocks vs backend real con OpenAPI spec | Requiere un spec OpenAPI del backend que no esta disponible en este repositorio. Se analizan alternativas de mitigacion. |

## Decisiones de proceso

| Decision | Justificacion |
|----------|---------------|
| Fase de analisis previa a tareas | El plan requiere decisiones que afectan la lista de tareas. Crear tareas sin alinear el plan llevaria a recrear el archivo varias veces. |
| Un solo documento de analisis | Los hallazgos son pocos (7) y comparten estilo. Un documento por hallazgo agregaria fragmentacion sin claridad. |
| Decisiones del usuario, no de quien escribe | Cada hallazgo se presenta con opciones. La decision se anota al final del analisis con firma. |
