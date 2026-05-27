# Alcance: Corregir deuda diseno Yoruba

| Campo | Valor |
|-------|-------|
| Iniciativa | corregir-deuda-diseno-yoruba |
| Estado | En ejecucion |
| Version | 1.0.0 |
| Fecha de creacion | 2026-05-27T19:14:49 |
| Iniciativa origen | adaptar-sistema-diseno-yoruba |

## Premisa verificada

| Campo | Valor |
|-------|-------|
| Nivel de gate ejecutado | 0b (RF-6 activo: toca _variables.scss y 84 modulos SCSS) |
| Red flags activos | RF-6 — fix toca SCSS globals (_variables.scss con 84 modulos dependientes) |
| Resultado | CONFIRMAR + EXPANDIR — deuda mas amplia de lo documentado en decisiones previas |
| Evidencia D-01 | `npm test -- --watchAll=false` -> 30 FAIL, 197 tests fallan |
| Evidencia D-02 | `grep -rln "\$color-danger\|\$gray-50\|\$white\b" src/ --include="*.scss"` -> 84 archivos, 149 ocurrencias |
| Evidencia D-03 | `diff NotFoundPage.jsx ref/NotFoundPage.jsx` -> 30 lineas ref vs 19 en repo (no adaptada) |
| Evidencia D-04 | `grep "item.name\|product_name" CartPage.jsx` -> CartPage usa product_name, test pasa item.name |
| Iniciativas previas revisadas | `adaptar-sistema-diseno-yoruba` @ HEAD — origen de la deuda documentada |

## Por que existe esta iniciativa

Cerrar la deuda tecnica generada por `adaptar-sistema-diseno-yoruba`
para que el repo quede en estado consistente: tests verdes, variables
semanticas sin aliases legacy, y todas las vistas del paquete de
referencia adaptadas.

## Que esta dentro del alcance

### F1 — Corregir tests de componentes (18 suites, 197 tests)

Para cada suite que falla, una de dos acciones:
- Si el test verifica comportamiento que el nuevo componente sigue
  teniendo pero con markup distinto: actualizar el test para que
  use los selectores correctos del nuevo marcado.
- Si el test verifica un feature que el nuevo diseno elimino (ej.
  badge de notificaciones en el Header): evaluar si el feature debe
  volverse a agregar al componente o si el test debe eliminarse.

El criterio es que cada test despues de esta fase verifique algo
real en el componente actual.

### F2 — Resolver aliases de compatibilidad en `_variables.scss`

Reemplazar las 149 ocurrencias de variables legacy en los 84
archivos SCSS por las variables semanticas correctas de la nueva
paleta. Eliminar los 4 bloques de aliases al final de
`_variables.scss`.

El mapa de reemplazo esta en el analisis (A-02).

### F3 — Adaptar `NotFoundPage`

Reemplazar `src/pages/NotFoundPage.jsx` con la version del paquete
(30 lineas, usa `MetaTag` y `Button` de primitives, tipografia
editorial Yoruba). Adaptar rutas a convencion EN.
Adoptar `NotFoundPage.module.scss` del paquete.

## Criterio de completitud

1. `npm test -- --watchAll=false` retorna 0 suites fallidas.
2. `_variables.scss` no contiene bloques de aliases de compatibilidad.
3. `npm run build` EXIT=0 sin nuevos errores.
4. `NotFoundPage.jsx` tiene el marcado Yoruba (MetaTag, Button, 404 editorial).

## Fuera de alcance

| Item | Razon |
|------|-------|
| Crear tests nuevos para features sin cobertura | Aumentaria el alcance indefinidamente |
| Otros archivos SCSS fuera del mapa de aliases | Iniciativa `mapear-y-corregir-scss-completo` los cubre |
| Actualizar tests del panel admin | La mayoria de paginas admin no tienen tests existentes que fallen |

## Estimacion de esfuerzo

| Fase | Archivos | Esfuerzo estimado |
|------|----------|-------------------|
| F1 | 18 suites de tests | 90 min |
| F2 | 84 archivos SCSS | 60 min |
| F3 | 2 archivos JSX/SCSS | 15 min |
| F4 | verificacion y cierre | 20 min |
| **Total** | **~104 archivos** | **~3 horas** |
