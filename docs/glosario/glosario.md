# Glosario

Definiciones de terminos del dominio y de la arquitectura usados en
esta documentacion y en el codigo. En orden alfabetico.

## Terminos del dominio

**Caso de uso (UC).** Unidad de funcionalidad identificada por
`UC-<dominio>-<numero>` (por ejemplo `UC-AUTH-16`). Los IDs se
comparten entre este repo, el backend (`PracticaYoruba-api`) y la
documentacion central (`PracticaYoruba-doc`). Cada UC aparece en
mensajes de commit y en comentarios JSDoc al inicio de paginas.

**Comprador.** Usuario final del e-commerce, autenticado o invitado
(guest checkout). Consume rutas publicas (`/`, `/catalog`, `/product/`)
y rutas protegidas bajo `/account/*`.

**Administrador (admin).** Usuario con rol `admin` que accede al panel
`/admin/*`. Operaciones tipicas: gestionar productos, ordenes,
devoluciones, vouchers, configuracion, auditoria y backups.

**Yoruba.** Identificador comercial del proyecto y de la paleta de
colores. Aparece como prefijo en flags (`*_SOURCE`), nombres de
modulos (`productVariantsSlice`), tokens de diseno y nombre del
producto (PracticaYoruba).

**Dar de baja (deactivate).** Operacion de baja logica de la cuenta
del comprador (UC-AUTH-16). El comprador puede solicitarla desde
`/account/deactivate`; tras confirmacion con contrasena, el backend
marca la cuenta como inactiva. La reactivacion es posible via
UC-AUTH-01 Alt-A.2 (re-registro).

**Guest checkout.** Compra sin registrarse, habilitada por UC-ORD-01.
El comprador entrega datos de envio y facturacion ad-hoc; el sistema
crea una orden sin asociarla a un usuario persistente.

**Voucher.** Codigo de descuento aplicado al carrito. Gestionado por
el panel admin (UC-PRO-01/02/03) y consumido en checkout
(UC-CART-04).

## Terminos de la arquitectura

**Slice.** En Redux Toolkit, un fragmento del estado global con su
reducer y sus actions/thunks. Este proyecto tiene 31 slices.

**Hook de dominio.** Hook React (en `src/hooks/domain/`) que
encapsula la logica de un dominio del backend: combina `useQuery` de
React Query (para reads) con thunks de Redux (para writes) y expone
una API estable a las paginas.

**Mock-first.** Patron de desarrollo donde cada llamada a la API pasa
primero por un interceptor que puede devolver datos mock segun un
flag de entorno. Permite trabajar el UI sin un backend disponible.

**Pipeline SCSS endurecido.** Conjunto de guardas que aseguran que
los estilos compilan, respetan el sistema de tokens y no introducen
literales `#hex` sin justificacion. Materializado por stylelint +
`scripts/check-scss.mjs` + husky pre-push.

**Code splitting.** Tecnica de Webpack para dividir el bundle en
chunks que se cargan bajo demanda. En este proyecto se hace por ruta:
cada pagina en `pages/` se importa con `React.lazy` y produce un
chunk con `contenthash` independiente.

**Allowlist (de stylelint).** Lista documentada de excepciones a la
regla `color-no-hex`. Cada entrada tiene justificacion en
`.stylelintrc.json` o en el comentario del SCSS que la consume.

**httpOnly cookie.** Cookie marcada con la flag `HttpOnly`, inaccesible
para JavaScript via `document.cookie`. El JWT del backend viaja
exclusivamente en cookies httpOnly; el UI nunca lo lee.

**`app:unauthorized`.** Nombre del `CustomEvent` global que `apiService`
dispara cuando una respuesta HTTP es 401. `UnauthorizedListener` lo
escucha y redirige al login. El prefijo `py:` (PracticaYoruba) evita
colisiones con eventos de terceros.

**Iniciativa.** Unidad de trabajo bajo `pm/iniciativas/` segun el
procedimiento PROC-GESTION-001. Tiene alcance, analisis, tareas
atomicas con DAG, progreso y documento de decisiones al cierre. El
nombre del directorio es verbo en infinitivo + objeto de trabajo.

**Tarea atomica (T-NNN).** Tarea individual dentro de una iniciativa.
Toca exactamente un archivo en el repo. Tiene criterio de aceptacion
binario (cumplido o no).

**DAG de dependencias.** Grafo dirigido aciclico que indica el orden
en que las tareas T-NNN de una iniciativa deben ejecutarse. Una
tarea puede arrancar cuando todas sus predecesoras estan completadas.

**Documento de decisiones (al cierre).** Archivo `decisiones-<slug>.md`
obligatorio al cerrar una iniciativa. Registra las decisiones de
diseno tomadas durante la ejecucion, los hallazgos descubiertos y la
verificacion post-ejecucion con evidencia. Sin este documento la
iniciativa no esta cerrada.

**Release candidate.** Estado del `develop` cuando acumula commits
listos para promover a `main`. En este repo, al momento del analisis,
`develop` esta 149 commits adelante de `main` con 86 UCs implementados.

**Provisioner.** Script idempotente que prepara una maquina para
ejecutar el proyecto. `scripts/install.sh` (rama pendiente) es el
provisioner de Node 22 para WSL2.

**Pre-commit hook.** Script bash en `.githooks/pre-commit` invocado
por git antes de aceptar un commit. Bloquea el commit si alguna
verificacion falla (estilos SCSS, lazy imports prohibidos).

**Pre-push hook.** Script en `.husky/pre-push` invocado antes de
empujar al remoto. Mas pesado que pre-commit (corre stylelint
completo + check-scss).

## Referencias externas mencionadas

| Termino | Tipo | Donde se documenta |
|---------|------|--------------------|
| PracticaYoruba-api | Repo separado | Backend Django 5 + DRF |
| PracticaYoruba-server | Repo separado | Provisioner del servidor Ubuntu + Apache |
| PracticaYoruba-doc | Repo separado | Catalogo central de UCs y modelos |
| PROC-GESTION-001 | Procedimiento normativo | Como crear y gestionar iniciativas en `pm/` |
| arc42 | Plantilla | Estructura general de la documentacion de arquitectura |
