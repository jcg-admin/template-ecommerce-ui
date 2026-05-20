# Como adaptar este template

Este documento existe para reducir el tiempo de adopcion del template
y para evitar dos errores comunes: pintar el template como mas
generico de lo que es, y empezar a refactorar el codigo antes de
entender que partes son **invariantes del e-commerce B2C de productos
fisicos** y que partes son **especificas de la adopcion original**.

Leelo entero antes de tocar la primera linea. Es corto.

## Que cambiar al adoptar (obligatorio)

El template ya esta libre del nombre y la paleta del adoptante
original. Pero hay puntos donde el template tiene **datos de
ejemplo** que tu adopcion debe sustituir por los tuyos.

| Archivo | Que cambiar |
|---------|-------------|
| `package.json` | `name`, `description`, `version` (resetear a `0.1.0` al fork). |
| `public/index.html` | `<title>`, `<meta name="description">`, las cuatro etiquetas Open Graph. |
| `README.md` | Reescribir entera al dominio real. La actual describe el template, no tu producto. |
| `.env.example` | Confirmar que los flags `*_SOURCE` siguen siendo los que necesitas. Si tu backend solo tiene auth, eliminar los que sobran. |
| `.env.production.example` | Apuntar `API_URL` a tu backend real. |
| `src/styles/abstracts/_variables.scss` | Sustituir la paleta principal (oros, tierra, coral, crema) por la de tu marca. La estructura por capas se conserva. |
| `src/mocks/registry.js` y `src/mocks/interceptors/*.js` | Reemplazar los datos de ejemplo (productos, usuarios, vouchers, ordenes) por los de tu catalogo real. Mantener la forma de las respuestas, que es la que el backend tiene que respetar. |
| `src/mocks/mockInterceptor.js` | Misma operacion para las respuestas inline. |
| `docs/introduccion-y-objetivos/` | Reescribir los stakeholders y los cinco objetivos en lenguaje de tu producto. |
| `docs/contexto-y-alcance-del-sistema/` | Actualizar el diagrama mermaid de contexto con tus sistemas externos reales (pasarelas de pago, correo, analytics). |

## Los tres ejes que pueden requerir extension

El template asume un e-commerce **B2C** de **productos fisicos** sin
**regulacion especifica**. Si tu caso cae fuera de cualquiera de los
tres ejes, lo que sigue te dice donde tocar.

### Eje uno: modelo de negocio

| Modelo | Que anadir |
|--------|------------|
| **B2B** | Precios negociados por cliente, tabulador por volumen, aprobaciones multi-nivel antes de confirmar una orden, terminos de credito y pago a plazos, ordenes recurrentes. Nuevo `src/redux/slices/contractsSlice.js` y `src/pages/account/CreditTermsPage.jsx`. |
| **Marketplace** (multiples vendedores) | Modelo de seller separado del usuario, comisiones, payouts, dashboard del seller, ratings de seller. Suele requerir su propio panel paralelo a `pages/admin`. |
| **Suscripciones** | Ciclo de facturacion recurrente, pausar y reanudar, prorrateo al cambiar de plan, cancelacion con periodo de gracia. Webhooks del gateway de pago son centrales aqui. |
| **Subastas o pujas** | Estado en tiempo real (WebSocket o polling), historial de pujas, snipe protection. El catalogo cambia de "comprar ya" a "pujar hasta X". |
| **Reservas con calendario** | Disponibilidad por slot, conflictos de reserva, politica de cancelacion ligada al tiempo. Sustituye el carrito por un selector de slot. |

### Eje dos: tipo de producto

| Tipo | Que cambia |
|------|------------|
| **Digital descargable** (claves, archivos, NFTs) | Sin envio. Sin devoluciones tradicionales (devolucion = revocar acceso). Entrega instantanea post-pago. Eliminar `src/pages/account/Return*Page.jsx`, mantener `src/redux/slices/returnsSlice.js` si se quiere conservar reembolso de pago. |
| **Perecedero** (food delivery, flores) | Time-to-expire por item, slot de entrega obligatorio, restriccion geografica del envio. La hoja de checkout cambia para forzar slot. |
| **Restringido por edad o pais** (alcohol, tabaco, armas) | Verificacion de edad como gate antes del catalogo. Bloqueo del checkout segun geolocalizacion. Tarjeta del comprador en `authSlice` con campo de edad verificada. |
| **Custom-made** (artesanal, bajo pedido) | Tiempo de fabricacion declarado por producto, formulario de personalizacion antes de anadir al carrito, estado "en produccion" entre pago y envio. |
| **Servicios** (consultorias, clases) | El "producto" es una reserva o un acceso temporal. Mucho del catalogo se vacia y la cuenta del comprador gana mas peso. |

### Eje tres: contexto regulatorio

| Regulacion | Que anadir |
|------------|------------|
| **GDPR** (UE) | Consentimiento explicito antes de cualquier cookie no estricta, banner de cookies obligatorio, derecho al olvido (UC nuevo para borrar cuenta y datos vinculados), portabilidad de datos (export a JSON). |
| **LFPDPPP** (Mexico) | Aviso de privacidad enlazado en cada formulario que captura datos, consentimiento explicito para uso secundario. |
| **Factura electronica** (Mexico CFDI, Brasil NF-e, Chile DTE) | Captura de RFC o equivalente en checkout, integracion con PAC, descarga de XML y PDF desde la cuenta del comprador. Slice nuevo `src/redux/slices/invoicesSlice.js`. |
| **18+ verification** (alcohol, tabaco) | Modal de verificacion al entrar al sitio (no solo al checkout). Persistencia del consentimiento por sesion. |
| **Impuestos por jurisdiccion** | Calculo de IVA o similar por estado o pais en el checkout, antes de la pasarela de pago. |

## Que dejar como esta

Lo que sigue es la espina dorsal del template. Cambiarlo sin razon
es perder tiempo, y cambiarlo con razon merece un ADR propio antes
de tocarlo.

| Pieza | Por que conservarla |
|-------|--------------------|
| Separacion **Redux Toolkit para estado, React Query para cache** | Es el patron mas balanceado para un e-commerce B2C en React 19. Cambiarlo a "solo Redux" o "solo React Query" introduce los problemas que la combinacion resuelve (invalidacion, refetch, retries en una direccion; estado complejo de cliente en la otra). |
| Patron **hook de dominio** en `src/hooks/domain/` | Mantiene a las paginas ignorantes de la capa de servicios y de la cache. Sustituirlo por imports directos de React Query desde paginas convierte cada cambio de endpoint en un grep masivo. |
| **Mock-first** via flags `*_SOURCE=mock|real` | Desbloquea desarrollo paralelo entre frontend y backend, y permite hacer demos sin backend disponible. Eliminarlo solo se justifica si el backend siempre esta disponible y tu equipo nunca trabaja offline. |
| **JWT en cookies httpOnly** | Elimina la clase entera de bug XSS-roba-token. Moverlo a localStorage suele venir disfrazado de "es mas conveniente para refresh"; no es una buena razon. |
| **Build-time injection de `API_URL`** | Hace cada bundle un artefacto inmutable por entorno. Pasar a runtime config (`window.__ENV__`, `/config.json`) mueve la fuente de verdad del codigo al servidor de despliegue sin beneficio claro. |
| **Code splitting por ruta con `React.lazy`** | Reduce el bundle inicial al minimo automaticamente. El guard `check-no-lazy-imports.mjs` evita las regresiones que pueden meter `require()` dinamicos sin que nadie se entere. |
| **Pipeline SCSS endurecido** (stylelint + check-scss + pre-push) | Detecta los SCSS rotos que Jest no compila. Quitar esta proteccion garantiza una regresion de estilos en pocos sprints. |
| **Layer system de SCSS** (`abstracts`, `base`, `components`, `layouts`, `utils`) | Estructura predecible que escala. Tirarla y reemplazarla por una libreria de CSS-in-JS o por Tailwind es valido, pero es un proyecto completo aparte. |
| **Convencion de identificadores UC-XXX** | Si tu backend tambien los usa, te da trazabilidad cross-repo. Si no, conservala internamente: numerar UCs en commits y archivos hace que el historial sea navegable. |
| **arc42 adaptado en `docs/`** | Diez cajones, sin numeracion. La omision deliberada de "requisitos de calidad" y "vista de tiempo de ejecucion" es intencional. Si llegan SLOs reales o flujos del UI que no esten en UCs, anadelos como cajones propios; no obligues a rellenar cajones vacios. |
| **`pm/` segun PROC-GESTION-001** | Iniciativas con alcance verificable, tareas atomicas, DAG, decisiones obligatorias al cierre. Cambiar de proceso es valido pero pesa: el procedimiento esta documentado tanto en `pm/README.md` como en el ejemplo bajo `pm/iniciativas/`. |

## Que el template NO resuelve

Listar explicitamente para que no descubras estos huecos en
produccion.

| Hueco | Por que no esta resuelto |
|-------|--------------------------|
| **CI/CD automatizado** | No hay `.github/workflows/`, `.gitlab-ci.yml` ni `Jenkinsfile`. El deploy es manual: `npm run build` + scp. Registrado como riesgo en `riesgos-y-deuda-tecnica/`. |
| **Observabilidad en produccion** | No hay integracion con Sentry, Datadog, OpenTelemetry ni similar. El UI loguea a `console` en desarrollo y silencia en produccion. Errores fatales del usuario no llegan a ningun lado. |
| **Internacionalizacion (i18n)** | El UI esta en castellano hardcodeado en JSX y SCSS. No hay `react-intl`, `i18next` ni archivos de mensajes. Si tu mercado es multi-idioma, esto es un proyecto propio. |
| **Accesibilidad WCAG completa** | Hay reset y reglas de foco en `src/styles/accessibility/`, pero no hay auditoria automatizada (axe-core, jest-axe) ni cobertura de lectores de pantalla. |
| **Prerender o SEO server-side** | Es SPA pura. Crawlers que no ejecutan JavaScript no ven el catalogo. Para SEO competitivo hay que integrar prerender (Rendertron, prerender.io) o migrar a Next.js. |
| **A/B testing y feature flags de usuario** | Los flags `*_SOURCE` son de entorno, no por usuario. Si necesitas LaunchDarkly, Statsig u Optimizely, hay que anadir el cliente y un context provider. |
| **Pagina de status del sistema** | El UI asume que el backend esta arriba. Si no, ve errores genericos. No hay degradacion graceful documentada para "backend caido". |
| **Cobertura de tests medida** | `npm run test:coverage` existe pero no hay threshold declarado en `jest.config.cjs`. Imposible saber si la cobertura crece o decae con cada PR. |

## Verificacion: tu adopcion esta completa cuando

Pasale los siguientes comandos a tu adopcion. Si todos cierran en
verde tienes una adopcion sana.

| Pregunta | Como verificar |
|----------|----------------|
| El template ya no aparece como nombre del producto | `grep -ri 'e-comerce-ui' . --exclude-dir=.git` solo debe devolver matches en archivos donde tu producto explicitamente cite el origen del template (probablemente cero). |
| Los datos de ejemplo del mock son tuyos | Abrir `src/mocks/registry.js` y `src/mocks/mockInterceptor.js` y confirmar que cada `id`, `name`, `email` y `description` es de tu dominio, no de la plantilla. |
| La paleta es la tuya | Abrir cualquier pagina con `npm run dev` y verificar visualmente que los colores no son los del template. |
| `.env.production` apunta a tu backend | `cat .env.production` (no committeado) debe tener `API_URL` con tu dominio real. |
| Las pruebas siguen pasando tras el rebranding | `npm test` cierra en verde. |
| El build de produccion funciona | `npm run build` cierra en verde y `dist/` contiene los hashes esperados. |
| Los hooks pre-push estan instalados | `bash scripts/install-hooks.sh` ejecutado al menos una vez (si tu adopcion incluye este script). |
| El README raiz describe tu producto | `head -5 README.md` debe mencionar tu marca, no decir "Plantilla de frontend e-commerce". |
| La documentacion arc42 esta alineada con tu adopcion | Como minimo `docs/introduccion-y-objetivos/`, `docs/contexto-y-alcance-del-sistema/` y `docs/glosario/` deben reflejar tu producto, no el template. |

Cuando todo lo anterior es verdad, tu adopcion del template esta
cerrada. Lo que sigue es tu producto, no la plantilla.
