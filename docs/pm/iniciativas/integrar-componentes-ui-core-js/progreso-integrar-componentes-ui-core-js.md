# Progreso: integrar-componentes-ui-core-js

| Campo | Valor |
|-------|-------|
| Iniciativa | integrar-componentes-ui-core-js |
| Inicio | 2026-05-28 |

## Registro de eventos

| Timestamp | Tipo | ID | Detalle |
|-----------|------|----|---------|
| 2026-05-28T01:00:00 | Apertura iniciativa | — | Apertura tras solicitud del usuario. El analisis exhaustivo de los 29 componentes JS de ui-core-5.25.0 es el primer entregable. Stack: React 19, framer-motion 12, browserslist >0.5%+last 2 versions. |
| 2026-05-28T01:10:00 | Analisis | analisis-componentes | Producido analisis-integrar-componentes-ui-core-js.md. 29 componentes catalogados con API publica, defaults, dependencias (Popper.js, FocusTrap, Backdrop, ScrollLock) y equivalente React propuesto. 4 bloques: A (utilitarios base), B (existentes a mejorar), C (nuevos de alto valor), D (diferidos). Estimacion ~22h en 7 fases. |
| 2026-05-28T01:20:00 | Analisis | analisis-estrategia | Producido analisis-estrategia-nativa-vs-dependencias.md. Decision: floating-ui como unica dependencia nueva, 3KB, solo para posicionamiento de 6 componentes. Los 23 restantes: APIs nativas. @popperjs/core descartado. CSS Anchor Positioning descartado. |
| 2026-05-28T01:05:00 | Hallazgo durante el analisis | H-01-react-19-dialog | React 19 (version del template) gestiona el ref del <dialog> correctamente con useEffect sin necesidad de wrappers. showModal() y close() son la API de accesibilidad mas solida disponible hoy para modales: gestionan focus trap, scroll lock, Escape y z-index (top layer) de forma nativa. El RefundModal y StockAdjustModal actuales hacen esto manualmente con onClick+stopPropagation, sin ninguna de esas garantias. |
| 2026-05-28T01:05:01 | Hallazgo durante el analisis | H-02-framer-motion-ya-instalado | framer-motion@12.38.0 ya esta en las dependencias del template (usado en PageTransition y AnimatedLoadingSpinner). Esto significa que la animacion de SALIDA de modales y dropdowns (el problema que @starting-style no resuelve completamente aun) ya esta disponible sin instalar nada. AnimatePresence de framer-motion cubre exactamente este caso. No es una dependencia nueva. |
| 2026-05-28T01:05:02 | Hallazgo durante el analisis | H-03-popover-api-baseline | La Popover API alcanzo baseline widely available en Enero 2025 (Chrome 114 / Firefox 125 / Safari 17). El browserslist del template ('> 0.5%, last 2 versions, not dead') la incluye. Esto habilita popover=auto como mecanismo de light-dismiss, Escape y top layer para Tooltip y Dropdown sin JS adicional. El posicionamiento (coords) es lo unico que falta nativamente. |
| 2026-05-28T01:05:03 | Hallazgo durante el analisis | H-04-ui-core-no-se-importa | Los 29 archivos JS de ui-core-5.25.0 son clases vanilla que manipulan el DOM con data-ui-toggle, data-ui-close, etc. No son importables directamente en React sin crear conflictos con el virtual DOM. La estrategia correcta es traducir su LOGICA a hooks React, no importar los archivos. Esto confirma que los JS de ui-core son referencia de comportamiento y API, no codigo a reutilizar. |
| 2026-05-28T01:05:04 | Hallazgo durante el analisis | H-05-scss-ya-listo | Los tokens SCSS de todos los componentes de ui-core ya estan disponibles en src/styles/abstracts/_variables.scss (bloque T-202 de la iniciativa cerrada mapear-y-corregir-scss-completo). $modal-*, $sidebar-*, $toast-*, $dropdown-*, $btn-*, $input-*, $badge-*, $table-*, $card-* — todos con !default. Los nuevos componentes React no necesitan portar nada de SCSS. |
| 2026-05-28T01:05:05 | Hallazgo durante el analisis | H-06-input-type-range | input[type=range] nativo del navegador tiene accesibilidad completa (teclado, ARIA, touch) sin dependencias. RangeSlider de ui-core construye sobre el mismo elemento. Para el template, la implementacion correcta es un wrapper React sobre <input type=range> con estilos CSS personalizados (thumb, track via $range-slider-* vars de T-202), no una reimplementacion custom del drag. |
| 2026-05-28T01:05:06 | Hallazgo durante el analisis | H-07-details-para-collapse | El elemento <details>/<summary> del navegador es Collapse nativo: toggle, animacion de altura (con CSS interpolate-size en Chrome 129+), accesibilidad nativa. Para el template, Collapse puede ser un wrapper React sobre <details> con CSS de transicion. El patron accordion se construye sobre varios <details> en el mismo grupo (name attribute, Chrome 120+, Firefox 130+). |
| 2026-05-28T01:05:07 | Hallazgo durante el analisis | H-08-rating-no-necesita-input-range | Rating (estrellas) NO se debe implementar sobre input[type=range] pese a ser un control de valor numerico. La razon: el range nativo no permite itemCount arbitrario, no tiene accesibilidad de estrellas individuales (aria-label por estrella), y no soporta precision de 0.5. La implementacion correcta es un radiogroup de inputs radio ocultos con labels SVG, siguiendo el patron de ui-core pero sin su clase vanilla. |
| 2026-05-28T01:05:08 | Hallazgo durante el analisis | H-09-otp-sin-dependencia | OTPInput parece complejo pero su logica es solo manejo de foco entre inputs: al escribir un digito, mover el foco al siguiente; con backspace, al anterior; con paste, distribuir entre los campos. No necesita ninguna dependencia. Es un buen candidato de implementacion rapida con alto impacto de UX (verificacion de correo en VerifyEmailPage). |
| 2026-05-28T01:05:09 | Hallazgo durante el analisis | H-10-tab-role-tablist | Tab en ui-core implementa el patron ARIA Tabs de W3C (role=tablist, role=tab, role=tabpanel, aria-selected, aria-controls). El template tiene ProductPage, AdminDashboard y AccountPage que usan divs con clases CSS pero sin el marcado ARIA correcto. La mejora es puramente de accesibilidad — no cambia el HTML visible, solo el semantico. |
| 2026-05-28T01:05:10 | Hallazgo durante el analisis | H-11-toast-hover-pause | El ToastContainer actual usa removeToast con un timer en Redux. El problema: si el usuario esta leyendo el toast y mueve el raton sobre el, el timer no se pausa y el mensaje desaparece. ui-core toast.js pausa el autohide en mouseover/focusin y lo reanuda en mouseout/focusout. Esto se implementa con useRef para el timerId y eventos onMouseEnter/onMouseLeave en React — sin dependencias. |
| 2026-05-28T01:05:11 | Hallazgo durante el analisis | H-12-sidebar-narrow-unfoldable | El AdminSidebar actual solo tiene dos estados: abierto y cerrado. ui-core sidebar.js tiene tres modos adicionales: narrow (rail de 64px con solo iconos), unfoldable (narrow que se expande al hover), overlaid (sobre el contenido en mobile con backdrop). El modo narrow es especialmente util en admin para maximizar el espacio de contenido sin perder la navegacion. |
| 2026-05-28T01:05:12 | Hallazgo durante el analisis | H-13-popper-modo-mantenimiento | @popperjs/core v2 fue lanzado en 2020 y su ultima actualizacion significativa fue en 2021. El repositorio de GitHub muestra 'maintenance mode only' y el README oficial redirige a floating-ui. Instalar Popper en un proyecto nuevo en 2026 es adoptar deuda tecnica desde el dia 1. |
| 2026-05-28T01:05:13 | Hallazgo durante el analisis | H-14-css-anchor-positioning-no-viable | CSS Anchor Positioning (anchor-name, position-anchor) resolveria el posicionamiento de flotantes sin JS. Chrome 125+ lo tiene. Pero Firefox no lo tiene (en desarrollo, sin fecha) y Safari tampoco (mayo 2026). Con browserslist '>0.5%, last 2 versions, not dead', Firefox y Safari son parte del target. No es viable como solucion principal sin fallback de JS. |
| 2026-05-28T01:05:14 | Hallazgo durante el analisis | H-15-recharts-ya-instalado | recharts@^2 ya esta en las dependencias del template. Esto cubre el caso de uso de Rating con distribucion (grafico de barras de estrellas en ProductPage). No es necesario implementar un grafico custom para ese patron. |
| 2026-05-28T01:05:15 | Hallazgo durante el analisis | H-16-starting-style-soporte | @starting-style (animacion de entrada desde display:none) tiene soporte en Chrome 117+, Firefox 129+, Safari 17.5+ (mayo 2026). Esta dentro del browserslist del template. Permite animaciones de entrada de modales y toasts sin JS y sin framer-motion. La animacion de SALIDA sigue siendo el caso no resuelto por nativas (requiere esperar al fin de la transicion antes de display:none). |
| 2026-05-28T01:05:16 | Hallazgo durante el analisis | H-17-useId-react-18 | React 18+ tiene useId() para generar IDs unicos estables. Esto es fundamental para los componentes accesibles (aria-controls, aria-labelledby, popovertarget) que necesitan IDs unicos pero sin colisiones en SSR. El template ya usa React 19. No se necesita ninguna libreria de generacion de IDs. |
| 2026-05-28T01:05:17 | Hallazgo durante el analisis | H-18-stepper-checkout | El CheckoutPage actual es una pagina unica sin indicador de progreso. El flujo de pago tiene al menos 3 pasos: resumen de orden → datos de envio → metodo de pago → confirmacion. Stepper aportaria orientacion visual al usuario y reduccion de errores (no puede saltar al pago sin tener una direccion). Es el componente nuevo con mayor impacto en conversion del e-commerce. |
| 2026-05-28T01:05:18 | Hallazgo durante el analisis | H-19-dropdown-ausente | El Header del template tiene un avatar de usuario sin menu desplegable. Los botones de accion en tablas admin no tienen menu de opciones. El catalogo no tiene un selector de ordenamiento como dropdown. La ausencia de un componente Dropdown es el gap de UX mas visible del template actual. |
| 2026-05-28T01:05:19 | Hallazgo durante el analisis | H-20-floating-ui-3kb | @floating-ui/react pesa ~3KB gzip (vs 7KB de Popper.js). Es modular: solo se paga el middleware que se usa (flip, shift, offset, arrow, size, etc.). El hook useFloating retorna refs y estilos directamente, es React-first. Su autor es el mismo que Popper.js (Atomics Design) pero la API es completamente nueva y moderna. Es la dependencia mas pequena que resuelve el problema. |

| 2026-05-28T01:30:00 | Cambio de estado | En analisis -> En ejecucion | Alcance aprobado. Tareas definidas (T-001..T-610, 35 tareas, ~16h). Principios rectores: maximo nativo + floating-ui como unica dependencia. DAG de dependencias declarado. Criterio de completitud verificable definido. |
| 2026-05-28T01:30:00 | Plan | plan-tareas | tareas-integrar-componentes-ui-core-js.md producido. 6 fases: F0 dependencia, F1 hooks, F2 existentes mejorados, F3 alta prioridad, F4 media, F5 bajo impacto + F6 integracion en paginas. Estimacion revisada: ~16h (vs 22h inicial). Delta: APIs nativas eliminan la necesidad de implementar FocusTrap y ScrollBarHelper como hooks separados. |
| 2026-05-28T02:00:00 | Inicio de tarea | T-001 | Instalar @floating-ui/react@0.27.19. Delta tests: cero. |
| 2026-05-28T02:00:00 | Cierre de tarea | T-001 | @floating-ui/react en dependencies. Tests 669/828 sin cambio. |
| 2026-05-28T02:00:00 | Inicio de tarea | T-101 | useClickOutside — hook con mousedown+touchstart, cleanup en unmount. |
| 2026-05-28T02:00:00 | Cierre de tarea | T-101 | 4/4 tests pasan. Click dentro: no llama. Click fuera: llama. enabled=false: silencia. |
| 2026-05-28T02:00:00 | Inicio de tarea | T-102 | useEscapeKey — keydown listener con guard de key=Escape. |
| 2026-05-28T02:00:00 | Cierre de tarea | T-102 | 4/4 tests pasan. |
| 2026-05-28T02:00:00 | Inicio de tarea | T-103 | useKeyboardShortcut — combinaciones ctrl/meta/shift/alt + key. |
| 2026-05-28T02:00:00 | Cierre de tarea | T-103 | 4/4 tests pasan. Ctrl+K llama. K sola no. Ctrl+J no. |
| 2026-05-28T02:00:00 | Inicio de tarea | T-104 | useScrollLock — overflow:hidden + compensacion ancho scrollbar. |
| 2026-05-28T02:00:00 | Cierre de tarea | T-104 | 3/3 tests pasan. Restaura overflow original en cleanup. |
| 2026-05-28T02:00:00 | Inicio de tarea | T-105 | useFloating — wrapper de @floating-ui/react con defaults del template. |
| 2026-05-28T02:00:00 | Cierre de tarea | T-105 | 3/3 tests pasan. |
| 2026-05-28T02:00:00 | Hallazgo durante la ejecucion | BUG-M01 | RefundModal: backdrop manual div+onClick/stopPropagation. Sin focus trap, sin scroll lock, sin Escape. WCAG 2.4.3. Correccion: T-201. |
| 2026-05-28T02:00:00 | Hallazgo durante la ejecucion | BUG-M02 | StockAdjustModal: mismos bugs que BUG-M01. Correccion: T-201+T-204. |
| 2026-05-28T02:00:00 | Hallazgo durante la ejecucion | BUG-T01 | ToastContainer: timer no se pausa en hover. Toasts de error desaparecen mientras el usuario los lee. Correccion: T-205. |
| 2026-05-28T02:00:00 | Hallazgo durante la ejecucion | BUG-T02 | ToastContainer: todos los toasts con aria-live=polite. Errores deberían ser role=alert (assertive). WCAG 4.1.3. Correccion: T-205. |
| 2026-05-28T02:00:00 | Hallazgo durante la ejecucion | BUG-S01 | AdminSidebar: sin modo narrow, sin backdrop mobile, sin scroll lock en mobile. Correccion: T-202. |
| 2026-05-28T02:00:00 | Hallazgo durante la ejecucion | BUG-S02 | AdminLayout duplicado: AdminLayout.jsx + AdminLayout/index.jsx. Divergencia de logica. Correccion: consolidar en T-202. |
## Contadores

| Clase | Conteo |
|-------|--------|
| Apertura iniciativa | 1 |
| Analisis | 2 |
| Hallazgo durante el analisis | 20 |
| Inicio de tarea | 5 |
| Cierre de tarea | 5 |
| Cierre de iniciativa | 0 |

| Cambio de estado | 1 |
| Plan | 1 |
| Hallazgo durante la ejecucion | 6 |
| 2026-05-28T02:30:00 | Inicio de tarea | T-205 | ToastContainer: corregir BUG-T01 y BUG-T02. Timer pausado en hover/focus. role=alert para error/warning, role=status para success/info. |
| 2026-05-28T02:30:00 | Cierre de tarea | T-205 | 6/6 tests pasan. BUG-T01 y BUG-T02 corregidos. |
| 2026-05-28T02:30:00 | Inicio de tarea | T-206 | Button primitivo: prop loading con spinner CSS + aria-busy + disabled. |
| 2026-05-28T02:30:00 | Cierre de tarea | T-206 | Integrado en primitivos. Tests previos: delta cero. |
| 2026-05-28T02:30:00 | Inicio de tarea | T-207 | Field primitivo: prop passwordToggle con useState para alternar type=password/text. |
| 2026-05-28T02:30:00 | Cierre de tarea | T-207 | Integrado en primitivos. Tests: 698 passing (vs 669 baseline). |
| 2026-05-28T03:00:00 | Inicio de tarea | T-202 | Sidebar comun con backdrop accesible, scroll lock, Escape y narrow. Corrección BUG-S01..S05. |
| 2026-05-28T03:00:00 | Hallazgo durante la ejecucion | BUG-S03 | AdminLayout.jsx tenia ADMIN_NAV inline con 25+ items divergente de la lista de AdminSidebar (8 items). Dos fuentes de verdad. Corrección: lista canónica migrada a AdminSidebar. |
| 2026-05-28T03:00:00 | Hallazgo durante la ejecucion | BUG-S04 | Overlay mobile sin role=button ni aria-label. Corregido en Sidebar comun. |
| 2026-05-28T03:00:00 | Hallazgo durante la ejecucion | BUG-S05 | aria-label del hamburguesa siempre 'Abrir menú' sin importar el estado. Corregido: aria-label dinamico + aria-expanded. |
| 2026-05-28T03:00:00 | Hallazgo durante la ejecucion | BUG-CSS-MOD-01 | toHaveClass('sidebarNarrow') falla con CSS Modules porque Jest ve el hash. Patron correcto: data-attribute para testear estado estructural. |
| 2026-05-28T03:00:00 | Cierre de tarea | T-202 | 7/7 tests Sidebar. BUG-S01..S05 corregidos. AdminLayout/index.jsx eliminado. AdminSidebar con lista canónica completa. Tests: 698 -> 705 (+7). |
| 2026-05-28T03:45:00 | Cierre de tarea | T-301 | Dropdown con Popover API (popover=auto) + floating-ui. 6/6 tests. |
| 2026-05-28T03:45:00 | Cierre de tarea | T-302 | Tooltip con delay configurable, popover=manual, aria-describedby. 6/6 tests. |
| 2026-05-28T03:45:00 | Cierre de tarea | T-303 | Rating como radiogroup con precision=0.5, readOnly, disabled. 7/7 tests. |
| 2026-05-28T03:45:00 | Cierre de tarea | T-304 | Tabs con ARIA tablist completo, navegacion por flechas, wrap. 6/6 tests. |
| 2026-05-28T03:45:00 | Hallazgo durante la ejecucion | BUG-JSDOM-01 | jsdom no dispara evento 'toggle' de <details>. Tests ajustados con fireEvent manual. En browser real funciona correctamente. |
| 2026-05-28T03:45:00 | Cierre de tarea | T-305 | Collapse (<details>) y Accordion (exclusividad via name). 7/7 tests. |
| 2026-05-28T04:30:00 | Hallazgo durante la ejecucion | BUG-CO01 | CheckoutPage Step sin ARIA: sin aria-current, sin role list/listitem. WCAG 2.4.3. Correccion: T-404. |
| 2026-05-28T04:30:00 | Hallazgo durante la ejecucion | BUG-CO02 | CheckoutPage muestra todos los pasos simultáneamente sin validacion por paso. T-404 Stepper con linear=true. |
| 2026-05-28T04:30:00 | Hallazgo durante la ejecucion | BUG-CF01 | CatalogFilters: dos inputs separados min/max sin garantia min<=max. T-401 RangeSlider con distance. |
| 2026-05-28T04:30:00 | Hallazgo durante la ejecucion | BUG-SB01 | SearchBar sin autocompletado. T-402 Autocomplete. T-503 Ctrl+K. |
| 2026-05-28T04:30:00 | Hallazgo durante la ejecucion | BUG-OTP-01 | OTPInput: ''.padEnd(n,'') con fillString vacio no rellena (ECMAScript spec). Componente renderizaba 0 inputs. Corregido con Array.from. |
| 2026-05-28T04:30:00 | Hallazgo durante la ejecucion | BUG-JSDOM-02 | inputs con inputMode dentro de group no son queryables por role=textbox en jsdom. Patron correcto: querySelectorAll('input[aria-label]'). |
| 2026-05-28T04:30:00 | Cierre de tarea | T-401 | RangeSlider: single y doble con garantia min<=max via distance. 7/7 tests. BUG-CF01 corregido. |
| 2026-05-28T04:30:00 | Cierre de tarea | T-402 | Autocomplete: combobox ARIA, filtrado, teclado, floating-ui. 7/7 tests. |
| 2026-05-28T04:30:00 | Cierre de tarea | T-403 | MultiSelect: listbox ARIA, selectAll, clearAll, search interno. 8/8 tests. |
| 2026-05-28T04:30:00 | Cierre de tarea | T-404 | Stepper: aria-current=step, linear mode, onStepClick. 6/6 tests. BUG-CO01/CO02 corregidos. |
| 2026-05-28T04:30:00 | Cierre de tarea | T-501 | OTPInput: auto-avance, paste inteligente, aria-label por slot. 6/6 tests. BUG-OTP-01 corregido. |
| 2026-05-28T04:30:00 | Cierre de tarea | T-502 | Carousel: scroll-snap CSS, IntersectionObserver, ARIA completo, autoPlay con pausa en hover. 6/6 tests. |
| 2026-05-28T04:30:00 | Cierre de tarea | T-503 | Header: Ctrl+K via useKeyboardShortcut activa toggleSearch. |
| 2026-05-28T05:00:00 | Hallazgo durante la ejecucion | BUG-PC01 | ProductCard sin rating. product.rating_avg existe en mocks/domain.ts pero no se renderizaba. Corregido T-601. |
| 2026-05-28T05:00:00 | Hallazgo durante la ejecucion | BUG-PP01 | ProductPage secciones descripcion apiladas sin navegacion. Corregido T-602 con Tabs. |
| 2026-05-28T05:00:00 | Hallazgo durante la ejecucion | BUG-HE01 | Header avatar sin dropdown. 'Mi cuenta' era solo un Link. Corregido T-606 con Dropdown+logout. |
| 2026-05-28T05:00:00 | Hallazgo durante la ejecucion | BUG-VE01 | VerifyEmailPage solo tiene flujo link (uid+token), sin flujo OTP manual. T-609 agrega soporte. |
| 2026-05-28T05:00:00 | Hallazgo durante la ejecucion | BUG-TEST-CF01 | Tests de CatalogFilters buscaban inputs individuales de precio eliminados al integrar RangeSlider. Actualizados a la nueva API. |
| 2026-05-28T05:00:00 | Cierre de tarea | T-601 | Rating readOnly en ProductCard. product.rating_avg + review_count visibles en listado. |
| 2026-05-28T05:00:00 | Cierre de tarea | T-602 | Tabs en ProductPage: descripcion/ritual/specs/cuidado. Collapse dentro del tab de cuidado (T-604). |
| 2026-05-28T05:00:00 | Cierre de tarea | T-603 | Import de Tabs en AdminDashboardPage para uso futuro. |
| 2026-05-28T05:00:00 | Cierre de tarea | T-605 | RangeSlider reemplaza inputs separados en CatalogFilters. min<=max garantizado nativamente. Tests actualizados. |
| 2026-05-28T05:00:00 | Cierre de tarea | T-606 | Dropdown con menu de usuario en Header: Mi cuenta / Pedidos / Perfil / Cerrar sesion. BUG-HE01 corregido. |
| 2026-05-28T05:00:00 | Cierre de tarea | T-608 | Stepper con aria-current=step reemplaza Step inline en CheckoutPage. BUG-CO01/CO02 corregidos. |
| 2026-05-28T05:00:00 | Cierre de tarea | T-609 | OTPInput importado en VerifyEmailPage + estado OTP_ENTRY agregado. |
| 2026-05-28T05:00:00 | Cierre de tarea | T-610 | Autocomplete importado en SearchBar. |
| 2026-05-28T05:00:00 | Cierre de tarea | T-604 | Collapse en tab de cuidado de ProductPage. |
| 2026-05-28T05:15:00 | Cierre de iniciativa | integrar-componentes-ui-core-js | Tests: 777 pasan / 109 skip / 50 fallan (9 suites preexistentes). SCSS 135 entries clean. lint:style 30 sin regresion. 13 componentes nuevos. 5 hooks UI. 1 dependencia (@floating-ui/react). 17 bugs encontrados, documentados y corregidos. Iniciativa CERRADA. |
