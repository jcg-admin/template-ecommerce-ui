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

## Extensiones que el template esta preparado para acomodar

El template **implementa** un set core de e-commerce B2C de productos
fisicos: catalogo, carrito, checkout, cuenta del comprador, pagos,
devoluciones, soporte, reviews, preguntas, panel admin. Esos UCs
estan ya en el codigo.

Lo que sigue son **variantes del dominio e-commerce** que aparecen en
muchas adopciones reales. Ninguna esta implementada en el codigo
actual, pero **la arquitectura del template las soporta** sin tocar
la espina dorsal: cada una se anade como uno o varios slices nuevos en
`src/redux/slices/`, su hook de dominio en `src/hooks/domain/`, sus
paginas en `src/pages/` y, si aplica, su area dedicada en
`src/pages/admin/`. El patron de extension es el mismo que siguen los
UCs existentes.

Documentar estas variantes aqui sirve dos propositos: como
**catalogo de UCs candidatos** que tu adopcion puede activar segun el
modelo de tu producto, y como **prueba de adecuacion arquitectonica**
para que ningun adoptante descubra a mitad de camino que el template
no puede acomodar su modelo.

### Eje uno: variantes del modelo de negocio

| Modelo | UCs que el template puede acomodar | Donde tocar |
|--------|------------------------------------|-------------|
| **B2B** | Precios negociados por cliente, tabulador por volumen, aprobaciones multi-nivel antes de confirmar una orden, terminos de credito y pago a plazos, ordenes recurrentes. | Slice nuevo `contractsSlice`, hook `useContracts`, paginas `pages/account/CreditTermsPage`, `pages/admin/AdminApprovalsPage`. |
| **Marketplace** (multiples vendedores) | Modelo de seller separado del usuario, comisiones por venta, payouts programados, dashboard del seller, ratings de seller, disputas entre comprador y seller. | Layout nuevo `SellerLayout` paralelo a `AdminLayout`, slices `sellersSlice` y `payoutsSlice`, hooks correspondientes, area `pages/seller/`. |
| **Suscripciones** | Ciclo de facturacion recurrente, pausar y reanudar, prorrateo al cambiar de plan, cancelacion con periodo de gracia, dunning (reintento de cobro). | Slice `subscriptionsSlice`, hook `useSubscriptions`, paginas `pages/account/SubscriptionsPage` y `SubscriptionDetailPage`. El gateway de pago expone webhooks de ciclo que el backend debe atender. |
| **Subastas o pujas** | Estado en tiempo real (WebSocket o polling), historial de pujas, snipe protection, cierre programado. El catalogo cambia de "comprar ya" a "pujar hasta X". | Slice `auctionsSlice`, hook `useAuction` con suscripcion live, pagina `pages/catalog/AuctionPage`. |
| **Reservas con calendario** | Disponibilidad por slot, conflictos de reserva, politica de cancelacion ligada al tiempo, recordatorios. Sustituye el carrito por un selector de slot. | Slice `reservationsSlice`, hook `useAvailability`, paginas `pages/catalog/ReservationPage` y `pages/account/MyReservationsPage`. |

### Eje dos: variantes del tipo de producto

| Tipo | UCs que el template puede acomodar | Donde tocar |
|------|------------------------------------|-------------|
| **Digital descargable** (claves, archivos, licencias) | Sin envio, sin devoluciones tradicionales (devolucion = revocar acceso), entrega instantanea post-pago, generacion de claves unicas, descarga con expiracion. | Slice nuevo `digitalDeliverySlice`, hook `useDownloads`, pagina `pages/account/DownloadsPage`. `returnsSlice` se reutiliza solo para reembolso de pago. |
| **Perecedero** (comida, flores) | Time-to-expire por item, slot de entrega obligatorio, restriccion geografica del envio, ventana de produccion. | Extender `cartSlice` con campo de slot, `checkoutSlice` con seleccion obligatoria, slice nuevo `deliveryWindowsSlice`. |
| **Restringido por edad o pais** (alcohol, tabaco, armas) | Verificacion de edad como gate antes del catalogo, bloqueo del checkout segun geolocalizacion, persistencia del consentimiento por sesion. | Extender `authSlice` con campo de edad verificada, componente nuevo `AgeGate` montado arriba del router, hook `useGeoEligibility`. |
| **Custom-made** (artesanal, bajo pedido) | Tiempo de fabricacion declarado por producto, formulario de personalizacion antes de anadir al carrito, estado "en produccion" entre pago y envio. | Extender `productsSlice` con leadTime, slice nuevo `customizationsSlice`, pagina `pages/catalog/ProductCustomizePage` antes de `CartPage`. |
| **Servicios** (consultorias, clases, sesiones) | El "producto" es una reserva o un acceso temporal. Mucho del catalogo se vacia y la cuenta del comprador gana mas peso (mis sesiones, materiales, notas). | Combina elementos de "reservas con calendario" y "digital descargable". Slices `sessionsSlice`, `materialsSlice`. |

Tu adopcion puede activar uno o varios de estos ejes a la vez. No son
mutuamente excluyentes: un marketplace de suscripciones digitales con
restriccion 18+ es un caso real que combina cuatro variantes y la
arquitectura del template las soporta.

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
| **Contexto regulatorio** (GDPR, LFPDPPP, factura electronica, 18+ verification, impuestos por jurisdiccion) | Depende del pais y del producto de cada adopcion. Un template que asuma una regulacion concreta queda mal ajustado para cualquier otra. El adoptante anade los componentes que su jurisdiccion exija: banner de cookies, aviso de privacidad, captura de RFC y descarga de CFDI, gate de edad, calculo de IVA. Estos componentes encajan en los puntos de extension habituales (slices, hooks, paginas) sin renegociar la espina dorsal. |
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
| El bundle servira la URL correcta | `npm run verify-build -- --expected=$API_URL` cierra en verde tras un build de produccion. Ver `docs/vista-de-despliegue/` seccion "Verificacion antes del deploy". |
| El bundle desplegado coincide con lo construido | Tras desplegar, abrir el sitio y en la consola del navegador `window.__APP_CONFIG__` devuelve un objeto con `apiUrl`, `version` y `builtAt` esperados. |
| Los hooks pre-push estan instalados | `bash scripts/install-hooks.sh` ejecutado al menos una vez (si tu adopcion incluye este script). |
| El README raiz describe tu producto | `head -5 README.md` debe mencionar tu marca, no decir "Plantilla de frontend e-commerce". |
| La documentacion arc42 esta alineada con tu adopcion | Como minimo `docs/introduccion-y-objetivos/`, `docs/contexto-y-alcance-del-sistema/` y `docs/glosario/` deben reflejar tu producto, no el template. |

Cuando todo lo anterior es verdad, tu adopcion del template esta
cerrada. Lo que sigue es tu producto, no la plantilla.
