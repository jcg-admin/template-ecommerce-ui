```yml
created_at: 2026-06-03T04:24:13
project: template-ecommerce-ui
author: Nestor Monroy
status: Borrador
version: 1.0.0
iniciativa: implementar-uc-log-09-costo-envio
submodulo: ui
```

# UC-LOG-09 — Calcular Costo de Envío

| Atributo | Valor |
|----------|-------|
| **ID** | UC-LOG-09 |
| **Nombre** | Calcular Costo de Envío |
| **Criticidad** | ALTO (afecta la operación normal de compra si falla) |
| **Dominio** | orders / logistics |
| **Actor primario** | Comprador (anónimo o autenticado) |
| **Catálogo** | `catalogo-ucs.rst:2073` |
| **Capa 5 — UI** | Implementada (este template) |
| **Capa 4 — Backend** | Contrato definido; backend real pendiente |

## Descripción

El comprador, desde la página del carrito, introduce su código postal para
estimar cuánto costará el envío de su pedido y en cuántos días llegará,
**antes** de avanzar al checkout. El sistema deriva la zona logística a
partir del código postal, calcula el costo según la zona y verifica si el
subtotal del carrito alcanza el umbral de envío gratis.

## Precondiciones

- El comprador tiene al menos un artículo en el carrito (la calculadora se
  monta dentro de la vista del carrito con items).
- El subtotal del carrito está calculado y disponible.

## Postcondiciones

- **Éxito:** se muestra al comprador el costo de envío (o «Envío gratis»),
  la zona legible y la ventana de entrega estimada (ETA «X–Y días»). El
  resultado queda en el estado del carrito (`shippingQuote`).
- **Fallo de validación:** se muestra un mensaje de error accesible y no se
  altera ninguna cotización previa válida.

## Flujo principal

1. El comprador ve el bloque «Calcular costo de envío» en la página del
   carrito.
2. Escribe su código postal (5 dígitos) en el campo correspondiente.
3. Pulsa «Calcular».
4. El sistema valida que el código postal tenga exactamente 5 dígitos.
5. El sistema envía `POST /api/v1/logistics/shipping-quote/` con
   `{ postal_code, subtotal }`.
6. El backend deriva la zona por el primer dígito del código postal, asigna
   el costo de la zona, calcula la ETA y evalúa el umbral de envío gratis.
7. El sistema muestra: zona legible, costo (o «Envío gratis» si aplica) y la
   ventana de entrega «X–Y días».

## Flujos alternativos

### FA-1 — Código postal inválido (validación local)

- En el paso 4, si el código postal no tiene 5 dígitos, el sistema muestra
  «Ingresa un código postal de 5 dígitos» (con `role="alert"`) y **no**
  realiza la petición.

### FA-2 — Código postal rechazado por el backend

- En el paso 6, si el backend determina que el código postal es inválido,
  responde **400** con `codigo_error: 'POSTAL_CODE_INVALID'`. El sistema
  muestra «Ese código postal no es válido. Revisa los 5 dígitos.»
  (`role="alert"`).

### FA-3 — Envío gratis por umbral

- En el paso 6, si `subtotal >= free_shipping_threshold` (999 MXN), el
  backend responde `qualifies_free_shipping: true` y `cost: 0`. En el paso 7
  el sistema muestra «Envío gratis» en lugar del costo numérico.

## Contrato del endpoint

`POST /api/v1/logistics/shipping-quote/`

### Request

```json
{
  "postal_code": "06000",
  "subtotal": 500
}
```

### Response 200

```json
{
  "postal_code": "06000",
  "zone": "metropolitana",
  "cost": 99,
  "currency": "MXN",
  "estimated_days_min": 2,
  "estimated_days_max": 4,
  "free_shipping_threshold": 999,
  "qualifies_free_shipping": false
}
```

### Response 400 (código postal inválido)

```json
{
  "detail": "El codigo postal debe tener 5 digitos.",
  "codigo_error": "POSTAL_CODE_INVALID"
}
```

### Reglas de derivación (determinísticas)

| Regla | Detalle |
|-------|---------|
| Validación CP | `postal_code` debe ser exactamente 5 dígitos; si no → 400 `POSTAL_CODE_INVALID` |
| Zona por primer dígito | `0–1` → `metropolitana`; `2–5` → `nacional`; `6–9` → `extendida` |
| Costo por zona | metropolitana `99`; nacional `149`; extendida `199` (MXN) |
| ETA por zona | metropolitana `2–4`; nacional `3–6`; extendida `5–9` días |
| Umbral envío gratis | `free_shipping_threshold = 999` |
| Envío gratis | si `subtotal >= 999` → `qualifies_free_shipping: true` y `cost: 0` |

## Criterios de aceptación

| # | Criterio |
|---|----------|
| CA-1 | El campo de código postal tiene un `label` asociado y solo acepta dígitos (máximo 5). |
| CA-2 | Al calcular con un CP válido, se despacha `POST /api/v1/logistics/shipping-quote/` con `{ postal_code, subtotal }`. |
| CA-3 | El resultado muestra zona legible, costo numérico y ETA «X–Y días». |
| CA-4 | Con `subtotal >= 999`, el resultado muestra «Envío gratis». |
| CA-5 | Un CP de menos de 5 dígitos muestra un error con `role="alert"` y no dispara la petición. |
| CA-6 | Un 400 `POSTAL_CODE_INVALID` del backend muestra un error accesible y no rompe la vista. |
| CA-7 | El bloque es accesible: `aria-invalid`, `aria-describedby` y `aria-busy` en el botón mientras cotiza. |

## Trazabilidad de implementación

| Capa | Artefacto |
|------|-----------|
| UI — mock | `src/mocks/handlers/logistics.ts` |
| UI — estado | `src/redux/slices/cartSlice.js` (`fetchShippingQuote`, `shippingQuote`, `isQuoting`, `quoteError`) |
| UI — componente | `src/components/cart/ShippingCalculator/index.jsx` |
| UI — estilos | `src/components/cart/ShippingCalculator/ShippingCalculator.module.scss` |
| UI — integración | `src/pages/cart/CartPage.jsx` |
| Test | `src/components/cart/ShippingCalculator/ShippingCalculator.test.jsx` |
