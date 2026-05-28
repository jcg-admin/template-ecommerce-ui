# Analisis: estrategia nativa vs dependencias para posicionamiento

| Campo | Valor |
|-------|-------|
| Iniciativa | integrar-componentes-ui-core-js |
| Pregunta | Popper.js vs floating-ui vs APIs nativas del navegador |
| Fecha | 2026-05-28 |
| Principio rector | Maximo nativo, minima dependencia externa |

## Contexto

5 de los 29 componentes de ui-core-5.25.0 usan Popper.js para
posicionar un elemento flotante relativo a un trigger (Dropdown,
Tooltip, Autocomplete, MultiSelect, DateRangePicker, TimePicker).

El usuario solicita un enfoque mas nativo y con menos dependencias.
Este analisis evalua las opciones disponibles en Mayo 2026.

---

## Los tres enfoques evaluados

### Opcion 1: @popperjs/core

Popper.js 2.x (2021). 7KB gzip. El mismo que usa ui-core-5.25.0.

Ventajas: coherencia con la referencia, muy documentado.

Desventajas: en modo mantenimiento desde 2021. El propio autor
(Atomics Design) recomienda migrar a floating-ui. No es React-first
-- manipula el DOM directamente. Mas pesado.

**Veredicto: descartar.** En modo mantenimiento, mas pesado, y la
direccion del ecosistema es clara: floating-ui lo sucede.

---

### Opcion 2: @floating-ui/react

Sucesor oficial de Popper.js, mismo autor. 3KB gzip (vs 7KB de
Popper). API React-first via hook `useFloating`. Tree-shaking
modular: solo se paga lo que se usa.

```js
// Ejemplo de uso en Dropdown
import { useFloating, flip, shift, offset } from '@floating-ui/react';

const { refs, floatingStyles } = useFloating({
  placement: 'bottom-start',
  middleware: [offset(4), flip(), shift({ padding: 8 })],
});
```

Ventajas: mas ligero, React-first, modular, activo (v0.26 en 2026),
compatible con la Popover API nativa, ya contempla el futuro de
CSS Anchor Positioning como fallback.

Desventajas: sigue siendo una dependencia externa (aunque la mas
justificada disponible).

---

### Opcion 3: CSS Anchor Positioning + Popover API

La plataforma web avanza hacia posicionamiento nativo:

**Popover API** (`popover=auto`): disponible en Chrome 114, Firefox
125, Safari 17.0. Baseline widely available desde Enero 2025.
Gestiona nativamente: z-index (top layer), light-dismiss (click
fuera cierra), Escape, y que solo uno este abierto a la vez.

**CSS Anchor Positioning** (`anchor-name`, `position-anchor`):
disponible solo en Chrome 125+ y Edge. Firefox y Safari no lo
tienen aun (Mayo 2026). No viable como solucion principal.

**Conclusion**: la Popover API es excelente para el CICLO DE VIDA
(abrir/cerrar/Escape/light-dismiss). Pero sin CSS Anchor Positioning
no resuelve el POSICIONAMIENTO (calcular si el dropdown va arriba
o abajo, si cabe a la derecha o a la izquierda).

---

## La estrategia recomendada: maxima natividad + floating-ui solo donde falta

El principio es usar la plataforma web hasta donde llega y solo
introducir una dependencia donde la plataforma no es suficiente aun.

### Mapa de responsabilidades

| Problema | Solucion nativa | Necesita dependencia |
|----------|----------------|---------------------|
| Focus trap en modales | `<dialog>.showModal()` | NO |
| Scroll lock al abrir modal | `<dialog>.showModal()` | NO |
| Backdrop oscuro | `<dialog>::backdrop` (CSS) | NO |
| Cierre con Escape | Evento nativo de `<dialog>` | NO |
| Cierre al click fuera | `popover=auto` light-dismiss | NO |
| z-index sobre todo | Top layer (dialog + popover) | NO |
| Animacion entrada/salida | CSS `@starting-style` + transition | NO |
| Posicionamiento de flotante | floating-ui | SI (solo esto) |

### Como funciona `<dialog>` para Modal

```jsx
const Modal = ({ open, onClose, children }) => {
  const ref = useRef(null);

  // React 19: useEffect es suficiente para sincronizar
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      el.showModal();         // focus trap + scroll lock + top layer
    } else {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}       // Escape nativo dispara este evento
      className={styles.dialog}
    >
      {children}
    </dialog>
  );
};
```

El browser gestiona automaticamente:
- Focus trap: Tab y Shift+Tab no salen del dialog
- Scroll lock: el body no se puede hacer scroll
- Escape: cierra el dialog y dispara el evento `close`
- Top layer: el dialog flota sobre cualquier otro elemento
- `::backdrop`: pseudo-elemento para el fondo oscuro animable con CSS
- `inert`: los elementos fuera del dialog no son interactivos

Esto reemplaza COMPLETAMENTE useFocusTrap + useScrollLock +
useBackdrop + useEscapeKey para el caso del Modal.

### Como funciona Popover API para Tooltip/Dropdown

```jsx
// Dropdown con Popover API
const Dropdown = ({ trigger, children }) => {
  const id = useId();

  return (
    <>
      <button popovertarget={id} type="button">
        {trigger}
      </button>

      <div
        id={id}
        popover="auto"          // light-dismiss + Escape + top layer
        className={styles.dropdown}
        style={floatingStyles}  // solo el posicionamiento de floating-ui
      >
        {children}
      </div>
    </>
  );
};
```

La Popover API gestiona automaticamente:
- Light-dismiss: click fuera cierra el popover
- Escape: cierra el popover
- Solo uno abierto: abrir uno cierra el anterior (auto)
- Top layer: z-index sobre todo sin configurar

Solo falta el POSICIONAMIENTO: calcular si el dropdown va debajo
o arriba del trigger. Para eso se usa floating-ui (3KB).

### Animaciones sin JS

Con `@starting-style` (Chrome 117+, Firefox 129+, Safari 17.5+):

```css
/* Entrada */
.dialog[open] {
  opacity: 1;
  transform: scale(1);
  transition: opacity 200ms, transform 200ms;
}

/* Estado inicial de la animacion (antes de que aparezca) */
@starting-style {
  .dialog[open] {
    opacity: 0;
    transform: scale(0.96);
  }
}

/* Salida: no tiene soporte nativo completo aun */
/* Alternativa: usar View Transitions API o framer-motion */
```

Para la animacion de SALIDA (closing), que es mas compleja con
nativas, el template ya tiene `framer-motion@12` instalado.
Se puede usar `AnimatePresence` de framer-motion solo para la
salida del modal/dropdown, sin usarlo para la entrada.

---

## Decision

**floating-ui es la unica dependencia a instalar.**

Razon: es la pieza mas pequena posible que resuelve el unico
problema que las APIs nativas no pueden resolver completamente
hoy (mayo 2026): el posicionamiento de elementos flotantes
en Firefox y Safari.

El resto de los 29 componentes se implementa con APIs nativas:
- `<dialog>` para Modal y Offcanvas
- `popover` para Tooltip, Dropdown
- CSS transitions para Collapse, Toast, animaciones
- ARIA roles para Tab, Stepper
- `input[type=range]` como base para RangeSlider
- CSS Grid/Flexbox para Calendar y layouts internos

### Comparacion de dependencias

| Enfoque | Dependencias anadidas | KB anadidos |
|---------|----------------------|-------------|
| Todo con @popperjs/core | 1 (popper) | 7KB |
| Todo con floating-ui | 1 (floating-ui) | 3KB |
| Maximo nativo + floating-ui | 1 (floating-ui) | 3KB |
| Todo nativo (sin posicionamiento) | 0 | 0KB |

La diferencia entre "maximo nativo + floating-ui" y "todo nativo"
es que el segundo no funciona en Firefox/Safari para Dropdown y
Tooltip (sin CSS Anchor Positioning). No es un trade-off aceptable
para un e-commerce con > 0.5% de usuarios en esos browsers.

### Posicion respecto a Web Components

El usuario menciona Web Components como referencia de "lo nativo".
El stack es React 19 (componentes funcionales). La naturaleza de
los hooks y componentes React del template ya es la traduccion al
idioma React del mismo principio de encapsulacion que los Web
Components proponen. No se introducen Custom Elements ni Shadow DOM
porque anadiran friction con el sistema de CSS Modules y el estado
Redux ya establecido.

Lo que si se adopta del espiritu de los Web Components:
- Preferir el elemento HTML nativo como base (`<dialog>`, `<details>`,
  `<input type=range>`) antes de construir desde cero
- Exponer atributos de accesibilidad ARIA correctos
- Evitar dependencias que el browser ya resuelve nativamente

---

## Resumen ejecutivo

| Pregunta | Respuesta |
|----------|-----------|
| Popper.js o floating-ui | floating-ui |
| Cuantas dependencias nuevas | 1 (@floating-ui/react) |
| Para cuantos componentes | 6 (Dropdown, Tooltip, Autocomplete, MultiSelect, DatePicker, DateRangePicker) |
| El Modal necesita dependencias | NO — usa `<dialog>` nativo |
| El Sidebar necesita dependencias | NO — CSS + JS propio |
| El Toast necesita dependencias | NO — CSS transitions |
| Los 23 restantes | NO |
