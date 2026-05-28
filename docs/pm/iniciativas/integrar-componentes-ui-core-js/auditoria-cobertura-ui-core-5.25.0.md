# Auditoria: cobertura ui-core-5.25.0 en el template

| Campo | Valor |
|-------|-------|
| Fecha | 2026-05-28 |
| ui-core version | 5.25.0 |
| Total componentes ui-core | 29 |
| Implementados en el template | 18 |
| Diferidos formalmente | 11 |
| Cobertura | 18/29 = 62% directa + 11/29 diferidos documentados |

---

## Componentes IMPLEMENTADOS (18/29)

| Componente ui-core | Archivo en el template | Tests | Integraciones |
|--------------------|------------------------|-------|---------------|
| modal | `common/Modal/Modal.jsx` | 5 | RefundModal, StockAdjustModal |
| toast | `common/Toast/ToastContainer.jsx` | 6 | AdminLayout, AccountLayout |
| dropdown | `common/Dropdown/Dropdown.jsx` | 6 | Header (menú usuario) |
| tooltip | `common/Tooltip/Tooltip.jsx` | 6 | Preparado |
| collapse | `common/Collapse/Collapse.jsx` | 7 | ProductPage (cuidado) |
| tab | `common/Tabs/Tabs.jsx` | 6 | ProductPage, AdminDashboardPage |
| carousel | `common/Carousel/Carousel.jsx` | 6 | Preparado |
| range-slider | `common/RangeSlider/RangeSlider.jsx` | 7 | CatalogFilters |
| autocomplete | `common/Autocomplete/Autocomplete.jsx` | 7 | SearchBar |
| multi-select | `common/MultiSelect/MultiSelect.jsx` | 8 | Preparado |
| stepper | `common/Stepper/Stepper.jsx` | 6 | CheckoutPage |
| otp-input | `auth/OTPInput/OTPInput.jsx` | 6 | VerifyEmailPage |
| rating | `catalog/Rating/Rating.jsx` | 7 | ProductCard, ProductPage |
| sidebar | `layout/Sidebar/Sidebar.jsx` | 7 | AdminLayout, AccountLayout |
| button | `common/primitives/index.jsx` (prop `loading`) | integracion | Formularios |
| password-input | `common/primitives/index.jsx` (prop `passwordToggle`) | integracion | Login, Register |
| search-button | `layout/Header/index.jsx` (Ctrl+K) | integracion | Header |
| navigation | Absorbido por Sidebar común | — | AdminSidebar, AccountSidebar |

**Hooks UI de soporte (5):**
`useClickOutside` (4t), `useEscapeKey` (4t), `useKeyboardShortcut` (4t),
`useScrollLock` (3t), `useFloating` (3t)

---

## Componentes DIFERIDOS (11/29)

| Componente ui-core | Razón de diferimiento | Requisito para implementar |
|--------------------|-----------------------|---------------------------|
| alert | Toast cubre el caso principal. Alert = mensajes inline persistentes. | Demanda real de alerta inline |
| loading-button | Cubierto por `Button` primitivo con prop `loading` | — (ya cubierto) |
| calendar | Sub-componente de DatePicker. Sin valor standalone. | Implementar DatePicker |
| date-picker | Depende de Calendar (~1128L). Sin campos de fecha en template actual. | Sección de historial de pedidos con filtro de fecha |
| date-range-picker | >1200L en ui-core. Filtros admin usan `input[type=date]`. | AdminOrdersPage / AdminPaymentsPage con filtro por fecha |
| time-picker | Sin demanda en el template. | Funcionalidad de horarios de entrega |
| chip | Tags de producto en admin. Bajo uso actual. | AdminProductsPage con etiquetas |
| chip-input | Misma razón que chip. | — |
| scrollspy | Solo si ProductPage crece mucho. CSS Intersection Observer ya disponible. | ProductPage con descripción muy larga |
| offcanvas | Carrito lateral si se implementa. | Implementar carrito lateral (side-drawer) |
| popover | Extensión natural de Tooltip. Agregar como variante. | Necesidad de contenido enriquecido en popover |

---

## Resumen ejecutivo

- Los **18 implementados** cubren el 100% de los casos de uso activos del template.
- Los **11 diferidos** tienen criterios de desbloqueo documentados — ninguno es urgente.
- Los 5 diferidos que son `loading-button` ya están cubiertos por el Button primitivo.
- `calendar`/`date-picker`/`date-range-picker`/`time-picker` forman un grupo coherente
  que se implementaría junto cuando haya demanda real de filtros por fecha.
- `chip`/`chip-input` se implementarían junto a la funcionalidad de etiquetas en admin.
- 21 archivos del template ya importan al menos un componente nuevo.
- **0 componentes de ui-core usados en producción sin equivalente en el template.**
