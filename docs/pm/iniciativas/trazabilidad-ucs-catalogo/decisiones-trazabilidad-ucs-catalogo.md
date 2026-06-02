# Decisiones — trazabilidad-ucs-catalogo

## Seccion 1 — Decisiones de arquitectura

- **D-1 Trazabilidad antes que implementación.** Se mapearon los 158 UCs del
  catálogo (documentación de e-commerce) contra el template con 5 agentes
  clasificadores en paralelo (balanceados por familia, con vocabulario de
  dominio y reglas), produciendo `matriz-trazabilidad-ucs.md` con evidencia de
  archivo por UC. Esto evitó "implementar a ciegas".
- **D-2 Frontera UI vs backend.** Los 23 UCs **BACKEND-OPS** (webhooks de pago,
  emails transaccionales, cron/jobs, SSL/SSH/fail2ban, reportes a nivel de BD,
  guards server-side) NO se implementan en el repo de UI; pertenecen a
  `template-ecommerce-server`. Se documentan en la matriz para trazabilidad.
- **D-3 Implementación TDD + MSW por UC.** Cada hueco se construyó con el ciclo
  test→red→green, handler MSW para el flujo demo, e integración en la página
  real, etiquetando el código con su `UC-XXX-NN` (como el resto del template).
- **D-4 Cableado central de archivos compartidos.** Para paralelizar sin
  colisiones, los agentes NO editaron `AppRouter.jsx` ni `handlers/index.ts`;
  reportaron las líneas y el cableado se hizo en un commit único.

## Seccion 2 — Resultado cuantitativo

- **158 UCs** del catálogo clasificados. Conteo final:
  **131 IMPLEMENTADO / 23 BACKEND-OPS / 0 AUSENTE-UI**.
- **8 huecos UI cerrados** (TDD): UC-AUTH-16, UC-SRCH-02, UC-PRO-04, UC-PRO-05,
  UC-LOG-01, UC-LOG-02, UC-LOG-06, UC-LOG-07.
- Tests añadidos: ~50 (slices + páginas). **Suite: 1677 passed / 0 fallos.**
- `check-scss` 170 clean; `build:demo` OK.
- Commits: 99b0c58 (matriz) + dcfd960/42dfef6/78616e3/8e1a455/68cff02 (UCs).

## Seccion 3 — Bugs y hallazgos durante la ejecucion

- **Regresiones cruzadas** (agentes en paralelo no corrieron la suite completa,
  detectadas al integrar):
  - `SearchBar` cambió el `role` del input a `combobox` (UC-SRCH-02), rompiendo
    `CatalogPage` que busca `searchbox`. Fix: volver a `searchbox` conservando
    `aria-expanded/controls/autocomplete` + listbox de sugerencias.
  - `vouchersSlice` (UC-PRO-04) añadió `usage/isLoadingUsage/usageError` al
    estado inicial → el test `tests/unit/reducers/vouchersSlice.test.js` (no
    corrido por el agente) falló; se actualizó `INITIAL_STATE`.
- **Naming**: el término correcto es **e-commerce**; el repo de docs de
  referencia conserva un typo histórico en su nombre de GitHub.
- **FAV = wishlist**: el catálogo nombra "FAV" lo que el template implementa
  como wishlist (UC-WISH); no es un hueco.

## Seccion 4 — Criterios de completitud verificados

- [x] Matriz de trazabilidad publicada (158 UCs con evidencia).
- [x] Los 8 AUSENTE-UI implementados con test verde + handler MSW.
- [x] Rutas y handlers cableados (referral, couriers).
- [x] `npm test` 0 fallos (1677); `check-scss` clean (170); `build:demo` OK.
- [x] Cada UC nuevo etiquetado con su `UC-XXX-NN`.
- Fuera de alcance (documentado): 23 UCs BACKEND-OPS → `template-ecommerce-server`.
