---
artefacto: SKILL-EVIDENCE-CLASS-001
tipo: Skill
dominio: normativa
subdominio: metodologia/evidencia
estado: Aprobado
version: 1.0.0
fecha_creacion: 2026-05-27T15:27:49
fecha_actualizacion: 2026-05-27T15:27:49
autor: NestorMonroy
clasificacion: Interno
repos: template-ecommerce-ui, template-ecommerce-server
---

# Clasificacion de Evidencia

> Cada hallazgo en `analisis-<slug>.md` debe clasificarse con una
> de las tres etiquetas siguientes. Los claims `SPECULATIVE` no
> avanzan gates ni justifican tareas.

---

## PROVEN

Observable directo de una herramienta ejecutada. El ejecutor vio
el output con sus propios ojos en esta sesion.

**Criterio**: existe un comando ejecutado y su output exacto que
confirma el hallazgo. El hallazgo no requiere interpretacion.

**Formato en el analisis**:

```markdown
**[PROVEN]** El handler de catalog.ts intercepta `/api/products/`
pero catalogSlice.js llama a `/api/v1/catalogue/`.

Evidencia:
  grep -n "http.get" src/mocks/handlers/catalog.ts
  → linea 32: http.get('/api/products/', ...)

  grep -n "apiService.get" src/redux/slices/catalogSlice.js
  → linea 21: apiService.get('/api/v1/catalogue/', ...)
```

---

## INFERRED

Derivado de observables con razonamiento explícito. El ejecutor
vio evidencia que implica el hallazgo, pero no el hallazgo directamente.

**Criterio**: existe al menos un observable PROVEN y el razonamiento
que conecta el observable con el hallazgo es explicito y verificable.

**Formato en el analisis**:

```markdown
**[INFERRED]** El build de produccion falla silenciosamente cuando
API_URL esta vacio porque apiService construye una URL invalida.

Razonamiento: apiService.js linea 36 usa `${baseURL}/api/...`.
Si baseURL es '' (vacio), la URL resultante es '/api/...' (relativa).
En produccion Nginx recibe esa URL y la proxea a API_UPSTREAM.
Si API_UPSTREAM esta vacio (caso por defecto), Nginx retorna 502.

Observables PROVEN:
  grep -n "baseURL" src/services/apiService.js → linea 36
  grep -n "API_UPSTREAM" deploy/nginx.conf → linea 14 (default='')
```

---

## SPECULATIVE

Sin fuente verificable. El ejecutor asume que el problema existe
pero no ha ejecutado nada que lo confirme ni infiera.

**Criterio**: el hallazgo se basa en experiencia previa, intuicion
o documentacion que podria estar desactualizada.

**Accion obligatoria**: un claim SPECULATIVE no puede motivar una
tarea ni avanzar un gate. Debe convertirse en PROVEN o INFERRED
ejecutando el nivel 0a o 0b del Premise Gate, o descartarse.

**Formato en el analisis**:

```markdown
**[SPECULATIVE]** Podria haber otros handlers con paths incorrectos
en payments.ts o wishlist. (Pendiente de verificacion con nivel 0b.)
```

---

## Uso en iniciativas

### En el analisis

Cada hallazgo lleva su clasificacion antes de la descripcion:

```markdown
## H-01 — [PROVEN] catalog.ts: paths incorrectos
...
## H-02 — [INFERRED] build falla con API_URL vacio
...
## H-03 — [SPECULATIVE] payments.ts podria tener paths legacy
```

### En el Premise Gate

El resultado del gate solo puede ser `CONFIRMAR` si todos los
hallazgos criticos son PROVEN o INFERRED. Un hallazgo SPECULATIVE
critico obliga resultado `INVESTIGAR`.

### En el documento de decisiones

Al cerrar una iniciativa, cada hallazgo descubierto durante la
ejecucion debe clasificarse. Los SPECULATIVE que se confirmaron
se actualizan a PROVEN con la evidencia del comando que los verifico.
