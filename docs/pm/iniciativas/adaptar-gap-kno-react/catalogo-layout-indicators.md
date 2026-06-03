```yml
created_at: 2026-06-03 00:07:59
project: template-ecommerce-ui
author: claude
status: Borrador
version: 1.0.0
iniciativa: adaptar-gap-kno-react
```

# Catálogo de componentes ADAPTABLES — kno-react (layout, indicators, labels, listview, notification, animation, ripple, scrollview, tooltip, popup)

> Análisis READ-ONLY. Inventario de componentes React (PascalCase) exportados
> por 10 paquetes kno-react en `/tmp/references/-progress/`, cruzado contra lo
> ya adaptado en `src/components/common/` (49 dirs) y
> `src/components/common/primitives/index.jsx`.
>
> Fuentes: README.md de cada paquete + listado de dirs/`.d.ts`. UCs mapeados
> contra `/tmp/references/e-comerce-docs/source/requisitos/casos-uso/`.
> Repo UI @ `4f6238a`.

## Método

- **Adaptable**: YES = sin engine pesado (CSS/markup/estado simple).
  PARTIAL = adaptable pero requiere lógica de posicionamiento/colisión o
  data-binding no trivial. NO = requiere motor pesado (virtualización,
  data-query, editing engine) — ninguno en este lote.
- **Estado**: COVERED (nombre del componente local) o GAP.
- **Cobertura local verificada** con `ls src/components/common/` (49 dirs) +
  `cat index.js` + `cat primitives/index.jsx`.

## Tabla maestra

| Componente | Paquete | Props clave | Adaptable | Estado | UC | Prioridad |
|-----------|---------|-------------|-----------|--------|----|-----------|
| ActionSheet | layout | `open`, `items[]`, `onClick` | YES | GAP | generic / móvil quick-menu | Baja |
| AppBar | layout | `themeColor`, `position` (+ AppBarSection, AppBarSpacer) | YES | GAP | generic (header/nav app) | Media |
| Avatar | layout | `type` (text/icon/image) | YES | COVERED → `Avatar` | uc-acc / perfil | — |
| BottomNavigation | layout | `items[]`, `position` | YES | GAP | generic (nav móvil) | Baja |
| Breadcrumb | layout | `data[]` | YES | GAP | uc-cat-01 / uc-cat-02 (navegación catálogo) | Media |
| Card | layout | `orientation` (+ CardHeader/Body/Title/Actions) | YES | GAP (parcial: PDP usa cards ad-hoc) | uc-cat-01 (grid productos) | Media |
| ContextMenu | layout | `show`, `offset`, `items[]` | PARTIAL | GAP | admin (acciones fila) | Baja |
| Drawer | layout | `expanded`, `position`, `items[]` | YES | COVERED → `Offcanvas` (equivalente) | generic | — |
| ExpansionPanel | layout | `title`, `expanded`, `onAction` | YES | COVERED → `Accordion` / `Collapse` | uc-cat-02 (specs PDP) | — |
| GridLayout | layout | `rows`, `cols`, `gap` | YES | GAP | generic (dashboards) | Baja |
| Menu | layout | `items[]`, `vertical` | PARTIAL | COVERED → `Dropdown` (equivalente simple) | generic | — |
| PanelBar | layout | `items[]`, `expandMode` | YES | COVERED → `Accordion` (equivalente) | generic | — |
| Splitter | layout | `panes[]`, `orientation` | PARTIAL | GAP | admin (layouts redimensionables) | Baja |
| StackLayout | layout | `orientation`, `gap`, `align` | YES | GAP | generic (utilidad layout) | Baja |
| Stepper | layout | `value`, `items[]`, `onChange` | YES | COVERED → `Stepper` | uc-cart/checkout | — |
| TabStrip | layout | `selected`, `onSelect` (+ TabStripTab) | YES | COVERED → `Tabs` | generic | — |
| TileLayout | layout | `columns`, `items[]`, reorder/resize | PARTIAL | GAP | dashboard (tiles dnd) | Baja |
| TimeLine | layout | `events[]`, `orientation` | YES | GAP | uc-ord (tracking pedido) / uc-not-03 (envío) | Media |
| Badge | indicators | `value`, `themeColor`, `align` (+ BadgeContainer) | YES | COVERED → `Badge` | uc-cart (contador), uc-not | — |
| Loader | indicators | `type`, `size`, `themeColor` | YES | COVERED → `LoadingButton` / spinner primitives | generic | — |
| Skeleton | indicators | `shape`, `animation` | YES | COVERED → `Skeleton` | generic (loading states) | — |
| FloatingLabel | labels | `label`, `editorId`, `editorValue` | YES | GAP (Field primitive usa label fijo) | generic (forms) | Baja |
| Label | labels | `editorId`, `optional` | YES | COVERED → `Field` (label integrado) | generic | — |
| Hint | labels | children, `direction` | YES | COVERED → `Field` (prop `hint`) | generic | — |
| Error | labels | children, `direction` | YES | COVERED → `Field` (prop `error`) | generic | — |
| ListView | listview | `data[]`, `item` render, paging | NO (engine paging/endless scroll, licencia premium) | GAP | uc-cat-01 (listado) | Baja |
| Notification | notification | `type`, `closable` (+ NotificationGroup) | YES | COVERED → `Toast` / `Alert` | uc-not-* | — |
| Animation (Fade/Slide/Zoom/Expand/Push/Reveal) | animation | children, `appear`, `enter`, `exit` | YES | GAP (transiciones ad-hoc en SCSS) | generic (infra UI) | Media |
| Ripple | ripple | wrapper (efecto material) | YES | GAP | generic (estético) | Baja |
| ScrollView | scrollview | `endless`, `arrows`, `pageable` | PARTIAL | COVERED → `Carousel` (equivalente) | uc-cat-07 (relacionados) | — |
| Tooltip | tooltip | `anchorElement`, `position`, `openDelay` | YES | COVERED → `Tooltip` | generic | — |
| Popover | tooltip | `show`, `anchor`, `title` (+ PopoverActionsBar) | YES | COVERED → `Popover` | generic | — |
| Popup | popup | `anchor`, `show`, `collision`, `align` | PARTIAL | COVERED → `Popover` / `Dropdown` (posicionamiento básico) | generic (infra overlay) | — |

## Resumen de GAPs Adaptables (YES o PARTIAL)

GAP + Adaptable=YES/PARTIAL (excluye ListView que es NO/engine):

- **AppBar** (layout) — Media — generic
- **Breadcrumb** (layout) — Media — uc-cat-01/02
- **Card** (layout) — Media — uc-cat-01
- **TimeLine** (layout) — Media — uc-ord (tracking) / uc-not-03
- **Animation** (animation) — Media — generic infra
- **ActionSheet** (layout) — Baja — generic móvil
- **BottomNavigation** (layout) — Baja — generic móvil
- **ContextMenu** (layout, PARTIAL) — Baja — admin
- **GridLayout** (layout) — Baja — generic
- **Splitter** (layout, PARTIAL) — Baja — admin
- **StackLayout** (layout) — Baja — generic
- **TileLayout** (layout, PARTIAL) — Baja — dashboard
- **FloatingLabel** (labels) — Baja — generic forms
- **Ripple** (ripple) — Baja — estético

## Notas de cobertura (equivalencias locales)

- `Avatar`, `Badge`, `Skeleton` adaptados como dirs propios + barrel en `index.js`.
- `Offcanvas` cubre Drawer; `Accordion`/`Collapse` cubren ExpansionPanel/PanelBar;
  `Tabs` cubre TabStrip; `Dropdown` cubre Menu; `Carousel` cubre ScrollView;
  `Tooltip`/`Popover` cubren Tooltip/Popover/Popup; `Toast`/`Alert` cubren Notification;
  `Stepper` cubre Stepper; `LoadingButton`/spinner cubren Loader.
- `Field` primitive absorbe Label + Hint + Error (props `hint`/`error`).
```
