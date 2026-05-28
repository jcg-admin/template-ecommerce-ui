# Tareas: integrar-componentes-ui-core-js

| Campo | Valor |
|-------|-------|
| Iniciativa | integrar-componentes-ui-core-js |
| Fecha | 2026-05-28 |
| Total de tareas | 40 |
| Estimacion total | ~22h |

## DAG de dependencias

```
T-001 (floating-ui)
  └─ T-101 (useClickOutside)
  └─ T-102 (useEscapeKey)
  └─ T-103 (useKeyboardShortcut)
  └─ T-104 (useScrollLock)
  └─ T-105 (useFloating wrapper)
       └─ T-301 (Dropdown)
       └─ T-302 (Tooltip)
       └─ T-402 (Autocomplete)
       └─ T-403 (MultiSelect)

T-101 + T-102
  └─ T-201 (Modal con <dialog>)
       └─ T-203 (RefundModal usa Modal)
       └─ T-204 (StockAdjustModal usa Modal)
  └─ T-202 (Sidebar con narrow)

T-201 cerrada
  └─ T-205 (Toast mejorado con animacion)

T-206 (Button loading) -- independiente
T-207 (Field password toggle) -- independiente

T-303 (Rating) -- independiente (no necesita floating-ui)
T-304 (Tabs) -- independiente
T-305 (Collapse) -- independiente (<details>)

T-401 (RangeSlider) -- independiente (<input type=range>)
T-404 (Stepper) -- independiente

T-501 (OTPInput) -- independiente
T-502 (Carousel) -- independiente
T-503 (SearchButton) -- depende de T-103
```

---

## Fase 0 -- Dependencia (~10 min)

### T-001 -- Instalar @floating-ui/react

| Campo | Valor |
|-------|-------|
| Archivo | `package.json`, `package-lock.json` |
| Accion | `npm install @floating-ui/react`. Verificar que los tests siguen en verde. |
| Criterio | `@floating-ui/react` aparece en `dependencies` de `package.json`. `npm test` delta cero. |
| Dependencias | -- |
| Esfuerzo | ~10 min |

---

## Fase 1 -- Hooks de utilidad UI (~90 min)

### T-101 -- useClickOutside

| Campo | Valor |
|-------|-------|
| Archivo | `src/hooks/ui/useClickOutside.js` |
| Accion | Hook que recibe un ref y un handler. Agrega listener a document en mount, lo elimina en unmount. Ignora clicks dentro del ref. |
| Criterio | Test: click dentro del ref no llama handler. Click fuera si lo llama. |
| Dependencias | -- |
| Esfuerzo | ~15 min |

### T-102 -- useEscapeKey

| Campo | Valor |
|-------|-------|
| Archivo | `src/hooks/ui/useEscapeKey.js` |
| Accion | Hook que recibe handler y flag `enabled`. Registra keydown listener solo cuando enabled=true. |
| Criterio | Test: Escape llama handler cuando enabled. No llama cuando !enabled. Otros keys no llaman. |
| Dependencias | -- |
| Esfuerzo | ~10 min |

### T-103 -- useKeyboardShortcut

| Campo | Valor |
|-------|-------|
| Archivo | `src/hooks/ui/useKeyboardShortcut.js` |
| Accion | Hook que recibe `{ key, ctrl, meta, shift }` y un handler. Registra keydown con las combinaciones correctas. |
| Criterio | Test: Ctrl+K llama handler. K solo no llama. Ctrl+J no llama. |
| Dependencias | -- |
| Esfuerzo | ~15 min |

### T-104 -- useScrollLock

| Campo | Valor |
|-------|-------|
| Archivo | `src/hooks/ui/useScrollLock.js` |
| Accion | Hook que recibe `enabled`. Cuando true: guarda scrollY, agrega overflow:hidden al body compensando el ancho de la scrollbar. Cuando false: restaura. |
| Criterio | Test: body.style.overflow es 'hidden' cuando enabled. Se restaura en cleanup. |
| Dependencias | -- |
| Esfuerzo | ~15 min |

### T-105 -- useFloating (wrapper opinado)

| Campo | Valor |
|-------|-------|
| Archivo | `src/hooks/ui/useFloating.js` |
| Accion | Wrapper de `@floating-ui/react` con defaults del template: placement='bottom-start', middleware=[offset(4), flip(), shift({padding:8})]. Expone refs y floatingStyles. |
| Criterio | Test: retorna refs y floatingStyles. Acepta override de placement y middleware. |
| Dependencias | T-001 |
| Esfuerzo | ~15 min |

---

## Fase 2 -- Componentes existentes mejorados (~180 min)

### T-201 -- Modal con dialog nativo

| Campo | Valor |
|-------|-------|
| Archivo | `src/components/common/Modal/Modal.jsx`, `Modal.module.scss` |
| Accion | Componente que usa `<dialog ref={ref}>`. `useEffect` llama `showModal()`/`close()` segun prop `open`. Prop `onClose` se dispara en evento `close` del dialog (Escape + click backdrop). Animacion: `@starting-style` en CSS para entrada, `AnimatePresence` de framer-motion para salida. |
| Criterio | Tests: abre con showModal, cierra con Escape, foco queda dentro con Tab, scroll del body bloqueado mientras abierto. |
| Dependencias | T-101, T-102 |
| Esfuerzo | ~45 min |

### T-202 -- Sidebar comun con modo narrow

| Campo | Valor |
|-------|-------|
| Archivos | `src/components/layout/Sidebar/Sidebar.jsx`, `Sidebar.module.scss` |
| Accion | Componente comun que `AdminSidebar` y `AccountSidebar` usan internamente. Props: `narrow` (rail 64px), `unfoldable` (narrow+hover expande), `open` (mobile overlay). En mobile: backdrop + scroll lock. |
| Criterio | Tests: clase sidebar-narrow cuando narrow=true. Backdrop aparece en mobile open. AdminSidebar y AccountSidebar existentes siguen sus tests pasando. |
| Dependencias | T-101, T-102 |
| Esfuerzo | ~45 min |

### T-203 -- RefundModal usa Modal

| Campo | Valor |
|-------|-------|
| Archivo | `src/components/admin/RefundModal/index.jsx` |
| Accion | Reemplazar el backdrop manual por `<Modal open={open} onClose={onClose}>`. Eliminar el div.backdrop + onClick + stopPropagation manual. |
| Criterio | Tests existentes de RefundModal pasan. El modal se cierra con Escape. |
| Dependencias | T-201 |
| Esfuerzo | ~20 min |

### T-204 -- StockAdjustModal usa Modal

| Campo | Valor |
|-------|-------|
| Archivo | `src/components/admin/StockAdjustModal/index.jsx` |
| Accion | Igual que T-203 pero para StockAdjustModal. |
| Criterio | Tests existentes de StockAdjustModal pasan. |
| Dependencias | T-201 |
| Esfuerzo | ~15 min |

### T-205 -- Toast mejorado

| Campo | Valor |
|-------|-------|
| Archivos | `src/components/common/Toast/ToastContainer.jsx`, `ToastContainer.module.scss` |
| Accion | (1) Agregar pausa del autohide en onMouseEnter/onMouseLeave via useRef para el timerId. (2) Animacion de entrada con `@starting-style`. (3) Animacion de salida con `AnimatePresence`. (4) `aria-live="polite"` correcto. |
| Criterio | Tests: timer se pausa en mouseenter. Timer reanuda en mouseleave. Notificacion desaparece tras delay. |
| Dependencias | T-201 (patron de animacion con framer-motion) |
| Esfuerzo | ~25 min |

### T-206 -- Button con prop loading

| Campo | Valor |
|-------|-------|
| Archivo | `src/components/common/primitives/index.jsx` |
| Accion | Agregar prop `loading={bool}` al primitivo `Button`. Cuando true: muestra spinner CSS inline, deshabilita el boton, preserva el ancho. El spinner usa `animation: spin` con `border` CSS (no imagen). |
| Criterio | Test: boton con loading=true tiene attr disabled. Spinner visible. Ancho no cambia. |
| Dependencias | -- |
| Esfuerzo | ~20 min |

### T-207 -- Field con password toggle

| Campo | Valor |
|-------|-------|
| Archivo | `src/components/common/primitives/index.jsx` |
| Accion | Agregar prop `passwordToggle={bool}` al primitivo `Field`. Cuando true y `type="password"`: muestra boton icono que alterna entre type=password y type=text. Estado local con useState. |
| Criterio | Test: boton toggle presente cuando passwordToggle=true. Click cambia type del input. |
| Dependencias | -- |
| Esfuerzo | ~20 min |

---

## Fase 3 -- Nuevos de alta prioridad (~240 min)

### T-301 -- Dropdown

| Campo | Valor |
|-------|-------|
| Archivos | `src/components/common/Dropdown/Dropdown.jsx`, `DropdownItem.jsx`, `DropdownDivider.jsx`, `Dropdown.module.scss` |
| Accion | Trigger con `popovertarget`. Panel con `popover=auto`. `useFloating` para posicion. Navegacion por flechas (ArrowUp/ArrowDown entre items). Cierre con Escape y click fuera es nativo del popover. |
| Criterio | Tests: panel aparece al click en trigger. Flecha abajo mueve foco al primer item. Escape cierra. Click en item cierra y llama onSelect. |
| Dependencias | T-105 |
| Esfuerzo | ~45 min |

### T-302 -- Tooltip

| Campo | Valor |
|-------|-------|
| Archivos | `src/components/common/Tooltip/Tooltip.jsx`, `Tooltip.module.scss` |
| Accion | Wrapper que acepta `content` y `placement`. Trigger con `popovertarget`. Panel con `popover=auto`. `useFloating` para posicion. Delay en mouseenter (300ms) antes de mostrar. |
| Criterio | Tests: aparece tras delay en mouseenter. Desaparece en mouseleave. No aparece si se sale antes del delay. |
| Dependencias | T-105 |
| Esfuerzo | ~35 min |

### T-303 -- Rating

| Campo | Valor |
|-------|-------|
| Archivos | `src/components/catalog/Rating/Rating.jsx`, `Rating.module.scss` |
| Accion | `itemCount` inputs radio ocultos con labels SVG de estrella. Props: `value`, `onChange`, `readOnly`, `precision` (0.5 = media estrella). ARIA: `role=radiogroup`, cada input con `aria-label="N estrellas"`. Estilos con $rating-* vars de T-202. |
| Criterio | Tests: click en estrella 3 cambia value a 3. readOnly=true bloquea cambios. aria-label correcto. precision=0.5 permite medias estrellas. |
| Dependencias | -- |
| Esfuerzo | ~40 min |

### T-304 -- Tabs

| Campo | Valor |
|-------|-------|
| Archivos | `src/components/common/Tabs/Tabs.jsx`, `Tab.jsx`, `TabPanel.jsx`, `Tabs.module.scss` |
| Accion | `role=tablist` en contenedor. Cada Tab con `role=tab`, `aria-selected`, `aria-controls`. TabPanel con `role=tabpanel`, `aria-labelledby`. Navegacion por flechas izq/der entre tabs. |
| Criterio | Tests: tab activo tiene aria-selected=true. Panel correspondiente visible. Flecha derecha activa el siguiente tab. |
| Dependencias | -- |
| Esfuerzo | ~40 min |

### T-305 -- Collapse y Accordion

| Campo | Valor |
|-------|-------|
| Archivos | `src/components/common/Collapse/Collapse.jsx`, `Accordion.jsx`, `Collapse.module.scss` |
| Accion | Wrapper sobre `<details>/<summary>`. CSS `interpolate-size: allow-keywords` para animar height de `0` a `auto`. Accordion: multiples Collapse con prop `name` para que el browser gestione exclusividad (el attribute `name` en `<details>` es nativo en Chrome 120+/FF 130+). |
| Criterio | Tests: details[open] presente tras click. Animacion de altura visible (CSS). En Accordion, abrir uno cierra el anterior. |
| Dependencias | -- |
| Esfuerzo | ~40 min |

---

## Fase 4 -- Nuevos de prioridad media (~300 min)

### T-401 -- RangeSlider

| Campo | Valor |
|-------|-------|
| Archivos | `src/components/common/RangeSlider/RangeSlider.jsx`, `RangeSlider.module.scss` |
| Accion | Wrapper sobre `<input type=range>`. Props: `min`, `max`, `step`, `value`. Double thumb (rango): dos inputs superpuestos con z-index por posicion. Tooltip de valor encima del thumb. Estilos del track y thumb via $range-slider-* CSS vars. |
| Criterio | Tests: change event actualiza value. Double: min <= max siempre. Tooltip muestra valor actual. |
| Dependencias | -- |
| Esfuerzo | ~55 min |

### T-402 -- Autocomplete

| Campo | Valor |
|-------|-------|
| Archivos | `src/components/common/Autocomplete/Autocomplete.jsx`, `Autocomplete.module.scss` |
| Accion | Input con `role=combobox`. Panel de opciones con `popover=auto` + `useFloating`. Filtrado por substring del value del input. Navegacion con flechas. Enter selecciona. Escape cierra. `aria-activedescendant` actualizado. |
| Criterio | Tests: escribir filtra opciones. Flecha abajo mueve foco. Enter llama onSelect. Escape cierra el panel. |
| Dependencias | T-105 |
| Esfuerzo | ~60 min |

### T-403 -- MultiSelect

| Campo | Valor |
|-------|-------|
| Archivos | `src/components/common/MultiSelect/MultiSelect.jsx`, `MultiSelect.module.scss` |
| Accion | Trigger con etiquetas de seleccion o contador. Panel con `popover=auto` + `useFloating`. Lista de opciones con checkboxes. Props: `options`, `value` (array), `onChange`, `search`, `placeholder`. |
| Criterio | Tests: seleccionar opcion la agrega al array value. Deseleccionar la quita. Search filtra. |
| Dependencias | T-105 |
| Esfuerzo | ~60 min |

### T-404 -- Stepper

| Campo | Valor |
|-------|-------|
| Archivos | `src/components/common/Stepper/Stepper.jsx`, `StepperStep.jsx`, `Stepper.module.scss` |
| Accion | Lista ordenada de pasos (`<ol>`). Props por paso: `label`, `completed`, `active`. Props del Stepper: `activeStep`, `linear` (no permite saltar). Metodos via ref imperative handle: `next()`, `prev()`. ARIA: `aria-current="step"` en paso activo. |
| Criterio | Tests: paso activo tiene aria-current=step. linear=true bloquea ir al paso 3 sin completar 1 y 2. next() avanza. |
| Dependencias | -- |
| Esfuerzo | ~55 min |

---

## Fase 5 -- Mejoras menores y bajo impacto (~180 min)

### T-501 -- OTPInput

| Campo | Valor |
|-------|-------|
| Archivos | `src/components/auth/OTPInput/OTPInput.jsx`, `OTPInput.module.scss` |
| Accion | N inputs (default 6). Al escribir un digito: mueve foco al siguiente. Backspace: borra y mueve al anterior. Paste: distribuye entre los campos. Props: `length`, `onChange(value)`, `value`. ARIA: `aria-label` por campo via funcion. |
| Criterio | Tests: escribir avanza foco. Paste distribuye. onChange llama con el valor completo. |
| Dependencias | -- |
| Esfuerzo | ~40 min |

### T-502 -- Carousel

| Campo | Valor |
|-------|-------|
| Archivos | `src/components/common/Carousel/Carousel.jsx`, `Carousel.module.scss` |
| Accion | Contenedor con `overflow:hidden` + children con `scroll-snap-type:x mandatory`. Botones prev/next actualizan el scroll. Dots de navegacion. Pausa de auto-advance en hover. |
| Criterio | Tests: boton next avanza al siguiente slide. boton prev retrocede. Dots actualizan segun slide visible (IntersectionObserver). |
| Dependencias | -- |
| Esfuerzo | ~50 min |

### T-503 -- SearchButton con Ctrl+K

| Campo | Valor |
|-------|-------|
| Archivo | `src/components/layout/Header/index.jsx` |
| Accion | Usar `useKeyboardShortcut({ key: 'k', ctrl: true })` para disparar la apertura del SearchBar. Agregar hint visual "Ctrl+K" al icono de busqueda del Header. |
| Criterio | Test: Ctrl+K abre el SearchBar. El hint visual es visible. |
| Dependencias | T-103 |
| Esfuerzo | ~20 min |

---

## Integracion en paginas del template (~restante del esfuerzo)

Conectar los componentes nuevos con las paginas donde tienen impacto
real. Estas tareas se definen despues de que los componentes base
esten en verde.

| Tarea | Componente | Pagina |
|-------|-----------|--------|
| T-601 | Rating | ProductCard + ProductPage |
| T-602 | Tabs | ProductPage (descripcion/resenas) |
| T-603 | Tabs | AccountPage (perfil/pedidos) |
| T-604 | Collapse | ProductPage (FAQ) |
| T-605 | RangeSlider | CatalogFilters (filtro precio) |
| T-606 | Dropdown | Header (menu de usuario) |
| T-607 | Tooltip | Tablas admin (iconos de accion) |
| T-608 | Stepper | CheckoutPage (flujo de compra) |
| T-609 | OTPInput | VerifyEmailPage |
| T-610 | Autocomplete | SearchBar |

## Resumen de esfuerzo por fase

| Fase | Tareas | Esfuerzo |
|------|--------|----------|
| F0 dependencia | 1 | ~10 min |
| F1 hooks | 5 | ~70 min |
| F2 existentes | 7 | ~185 min |
| F3 alta prioridad | 5 | ~200 min |
| F4 prioridad media | 4 | ~230 min |
| F5 bajo impacto | 3 | ~110 min |
| F6 integracion | 10 | ~150 min |
| **Total** | **35** | **~955 min (~16h)** |

Nota: la estimacion revisada es ~16h (vs las ~22h del analisis
inicial). La diferencia: el uso de APIs nativas elimina el trabajo
de implementar FocusTrap y ScrollBarHelper como hooks independientes
(el browser los gestiona via `<dialog>`).
