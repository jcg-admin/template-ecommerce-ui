```yml
created_at: 2026-06-03 00:10:19
project: template-ecommerce-ui
author: claude
status: Borrador
version: 1.0.0
iniciativa: adaptar-gap-kno-react
```

# Catálogo de componentes ADAPTABLES — kno-react (buttons, inputs, labels, form, dropdowns, dateinputs)

> Análisis READ-ONLY. Inventario de componentes React (PascalCase) exportados
> por 6 paquetes kno-react en `/tmp/references/-progress/`, cruzado contra lo
> ya adaptado en `src/components/common/` (49 dirs) y
> `src/components/common/primitives/index.jsx`.
>
> Fuentes: `README.md` + `index.d.ts` + listado de subdirs/`.d.ts` de cada
> paquete. UCs mapeados contra
> `/tmp/references/e-comerce-docs/source/requisitos/casos-uso/`.

## Método

- **Adaptable**: YES = React puro + CSS, sin dependencia pesada.
  PARTIAL = adaptable pero requiere lógica no trivial (popup/colisión,
  filtrado, data-binding, parsing de fecha/hora con locale).
  NO = requiere motor pesado (masked-input engine, color engine,
  canvas de firma).
- **Estado**: COVERED (nombre del componente local en `common/index.js` o
  `primitives/index.jsx`) o GAP.
- **Cobertura local verificada** con `ls src/components/common/` (49 dirs) +
  `cat common/index.js` + `cat primitives/index.jsx`.

## Tabla maestra

| Componente | Paquete | Props clave | Adaptable | Estado (COVERED/GAP) | UC | Prioridad |
|-----------|---------|-------------|-----------|----------------------|----|-----------|
| Button | buttons | `themeColor`, `fillMode`, `disabled`, `icon`, `onClick` | YES | COVERED → `primitives.Button` | generic / no-UC | — |
| ButtonGroup | buttons | `selection`, `children=Button[]`, `disabled` | YES | GAP | generic / no-UC (toolbars, filtros) | Baja |
| Chip | buttons | `text`, `value`, `removable`, `selected`, `onRemove` | YES | COVERED → `Chip` | uc-cat (filtros), uc-cart | — |
| ChipList | buttons | `data[]`, `selection`, `onDataChange` | YES | COVERED → `ChipInput`/`Chip` | uc-cat-02 (filtros multi) | — |
| DropDownButton | buttons | `items[]`, `text`, `icon`, `onItemClick` | YES | GAP | uc-adm-01 (acciones fila admin) | Media |
| SplitButton | buttons | `items[]`, `text`, `onButtonClick`, `onItemClick` | YES | GAP | uc-ord (acciones de pedido) | Baja |
| FloatingActionButton | buttons | `icon`, `items[]`, `align`, `positionMode` | YES | GAP | generic (móvil quick-action) | Baja |
| Toolbar | buttons | `children` (ToolbarItem/Separator/Spacer) | YES | GAP | uc-adm (barras de acción admin) | Baja |
| SpeechToTextButton | buttons | `onResult`, `onError`, `lang` | NO (Web Speech API) | GAP | generic / no-UC | Descartar |
| Input | inputs | `value`, `onChange`, prefix/suffix/clear/validationIcon | YES | COVERED → `primitives.Field` | generic (todos los forms) | — |
| TextBox | inputs | `value`, `onChange`, `prefix`, `suffix`, `clearButton` | YES | COVERED → `primitives.Field` | generic (forms) | — |
| TextArea | inputs | `value`, `rows`, `autoSize`, `maxLength` | YES | COVERED → `primitives.Field` (`textarea`) | uc-rev-01, uc-com-01, uc-supp-03 | — |
| Checkbox | inputs | `checked`, `onChange`, `label`, `indeterminate` | YES | GAP | uc-auth-01 (términos), uc-cfg, uc-adm-02 | **Alta** |
| RadioButton | inputs | `checked`, `value`, `name`, `label` | YES | GAP | uc-cfg-01/02 (gateways/envíos), uc-pay | **Alta** |
| RadioGroup | inputs | `data[]`, `value`, `onChange`, `layout` | YES | GAP | uc-cfg-01/02, uc-pay (método pago) | **Alta** |
| Switch | inputs | `checked`, `onChange`, `onLabel`, `offLabel` | YES | COVERED → `Switch` | uc-cfg-03, uc-adm-04 | — |
| NumericTextBox | inputs | `value`, `min`, `max`, `step`, `format`, `spinners` | YES | COVERED → `NumericTextBox` | uc-inv-04 (ajuste stock), uc-cart (qty) | — |
| Slider | inputs | `value`, `min`, `max`, `step`, `vertical` | YES | COVERED → `RangeSlider` (familia) | uc-cat-02 (filtro precio) | — |
| RangeSlider | inputs | `value={start,end}`, `min`, `max`, `step` | YES | COVERED → `RangeSlider` | uc-cat-02 (filtro rango precio) | — |
| Rating | inputs | `value`, `max`, `half`, `readonly`, `onChange` | YES | COVERED → `Rating` | uc-rev-01, uc-rev-02 | — |
| MaskedTextBox | inputs | `mask`, `value`, `onChange`, `rules` | NO (masked-input engine) | GAP | uc-auth-07 (CP/teléfono), uc-cfg-05 | Media |
| Signature | inputs | `value`, `onChange`, `maxWidth`, `smooth` | NO (canvas/curve engine) | GAP | generic / no-UC | Descartar |
| ColorInput | inputs | `value`, `onChange` | NO (color engine) | GAP | uc-cfg-04 (contenido/branding) | Baja |
| ColorPicker | inputs | `value`, `view`, `gradientSettings` | NO (color engine) | GAP | uc-cfg-04 | Baja |
| FlatColorPicker | inputs | `value`, `view`, `palettePresets` | NO (color engine) | GAP | uc-cfg-04 | Baja |
| ColorGradient | inputs | `value`, `onChange`, `opacity` | NO (color engine) | GAP | uc-cfg-04 | Descartar |
| ColorPalette | inputs | `palette`, `value`, `columns`, `tileSize` | PARTIAL (grid de swatches) | GAP | uc-cfg-04 | Baja |
| Label | labels | `editorId`, `optional`, `children` | YES | COVERED → `primitives.Field` (label interno) | generic (forms) | — |
| FloatingLabel | labels | `label`, `editorValue`, `editorId` | YES | GAP | generic (forms con estética flotante) | Baja |
| Hint | labels | `children`, `direction` | YES | COVERED → `primitives.Field` (`hint`) | generic (forms) | — |
| Error | labels | `children`, `direction`, `id` | YES | COVERED → `primitives.Field` (`error`) | generic (validación forms) | — |
| Form | form | `onSubmit`, `initialValues`, `validator`, `render` | YES | GAP (forms usan estado local + `Field`) | generic (forms complejos admin) | Media |
| Field | form | `name`, `component`, `validator`, `label` | YES | GAP (existe `primitives.Field` ad-hoc, no el HOC) | generic | Media |
| FieldArray | form | `name`, `component`, repetidores | YES | GAP | uc-auth-07 (direcciones), uc-inv (líneas) | Baja |
| FieldWrapper | form | `children` (layout de campo) | YES | GAP | generic | Baja |
| FormElement | form | `children`, `style` (`<form>` wrapper) | YES | GAP | generic | Baja |
| FormFieldSet | form | `responsive`, `gutters`, `children` | YES | GAP | generic | Baja |
| FormSeparator | form | — (hr semántico) | YES | GAP | generic | Baja |
| AutoComplete | dropdowns | `data[]`, `value`, `onChange`, `filterable`, `suggest` | PARTIAL (popup+filtro) | COVERED → `Autocomplete` | uc-cat (búsqueda), SearchModal | — |
| ComboBox | dropdowns | `data[]`, `value`, `filterable`, `allowCustom` | PARTIAL (popup+filtro) | GAP | uc-adm, uc-inv (selección+custom) | Media |
| DropDownList | dropdowns | `data[]`, `value`, `onChange`, `textField`, `dataItemKey` | PARTIAL (popup) | COVERED → `Dropdown` (familia) | generic (selects en forms) | — |
| MultiSelect | dropdowns | `data[]`, `value[]`, `onChange`, `filterable`, `tags` | PARTIAL (popup+tags) | COVERED → `MultiSelect` | uc-cat-02, uc-adm-02 (permisos) | — |
| MultiColumnComboBox | dropdowns | `data[]`, `columns[]`, `value`, `filterable` | PARTIAL (popup+grid) | GAP | uc-inv-05, uc-adm (selección rica) | Baja |
| DropDownTree | dropdowns | `data[]` (jerárquico), `value`, `expandField` | PARTIAL (tree+popup) | GAP | uc-cat (categorías jerárquicas) | Media |
| MultiSelectTree | dropdowns | `data[]` (jerárquico), `value[]`, `tags` | PARTIAL (tree+popup+tags) | GAP | uc-cat (multi-categoría), uc-adm-02 | Baja |
| Calendar | dateinputs | `value`, `onChange`, `min`, `max`, `weekNumber` | PARTIAL (date math + grid) | COVERED → `Calendar` | uc-rpt (rango fechas), uc-pro | — |
| MultiViewCalendar | dateinputs | `value`, `mode` (range), `views` | PARTIAL (date math) | COVERED → `DateRangePicker` (familia) | uc-rpt-01, uc-pro-04 | — |
| DateInput | dateinputs | `value`, `format`, `onChange` (segmentado) | PARTIAL (parsing por segmento + locale) | GAP | uc-pro-01 (vigencia voucher), uc-rpt | Media |
| DatePicker | dateinputs | `value`, `onChange`, `format`, `min`, `max`, `popup` | PARTIAL (calendar+popup) | COVERED → `DatePicker` | uc-pro-01, uc-rpt-01 | — |
| DateRangePicker | dateinputs | `value={start,end}`, `onChange`, `popup` | PARTIAL (multiview+popup) | COVERED → `DateRangePicker` | uc-rpt-01, uc-pro-04 (reportes) | — |
| TimePicker | dateinputs | `value`, `onChange`, `format`, `steps` | PARTIAL (time services+popup) | COVERED → `TimePicker` | uc-logistica (ventana entrega) | — |
| DateTimePicker | dateinputs | `value`, `onChange`, `format` (date+time) | PARTIAL (calendar+time+popup) | GAP | uc-pro-01 (vigencia con hora), uc-adm-05 | Baja |

## Resumen de cobertura

- **COVERED (ya adaptados localmente):** Button, Chip, ChipList, Input/TextBox/
  TextArea (vía `primitives.Field`), Switch, NumericTextBox, Slider/RangeSlider,
  Rating, Label/Hint/Error (vía `Field`), AutoComplete, DropDownList (vía
  `Dropdown`), MultiSelect, Calendar/MultiViewCalendar, DatePicker,
  DateRangePicker, TimePicker → 22 componentes cubiertos.
- **GAP + Adaptable=YES (objetivo del trabajo):** Checkbox, RadioButton,
  RadioGroup, ButtonGroup, DropDownButton, SplitButton, FloatingActionButton,
  Toolbar, FloatingLabel, Form, Field (HOC), FieldArray, FieldWrapper,
  FormElement, FormFieldSet, FormSeparator → 16.
- **GAP + Adaptable=PARTIAL:** ComboBox, MultiColumnComboBox, DropDownTree,
  MultiSelectTree, DateInput, DateTimePicker, ColorPalette → 7.
- **GAP + Adaptable=NO (motor pesado, descartar o diferir):** MaskedTextBox,
  Signature, ColorInput, ColorPicker, FlatColorPicker, ColorGradient,
  SpeechToTextButton → 7.

## Prioridad recomendada (GAP + Adaptable=YES)

1. **Alta:** Checkbox, RadioButton, RadioGroup — bloqueantes de varios UCs de
   formularios (auth-01 términos, cfg-01/02 gateways/envíos, pago, adm-02
   permisos). Hoy no hay primitivo de selección booleana/exclusiva nativo.
2. **Media:** DropDownButton (acciones fila admin uc-adm-01), Form + Field HOC
   (formalizar el patrón de forms que hoy es estado local ad-hoc).
3. **Baja:** ButtonGroup, SplitButton, FloatingActionButton, Toolbar,
   FloatingLabel, FieldArray, FieldWrapper, FormElement, FormFieldSet,
   FormSeparator — utilidades estéticas o de layout, sin UC bloqueante.
