```yml
fecha_creacion: 2026-06-03T03:49:10
autor: claude
estado: completado
submodulo: ui
iniciativa: adaptar-gap-kno-react
fase: F2 — cableado de Switch
```

# Hallazgos — Cableado de Switch en superficies admin (F2)

**Rama:** claude/brave-lamport-BUmBM
**Total hallazgos:** 2

---

## H-UI-01 — La rama Switch de AdminSystemSettingsPage es código muerto

- **Severidad:** BAJA
- **Archivo:** `src/pages/admin/AdminSystemSettingsPage.jsx:100-105`
- **Descripción:** el render condicional `f.type === 'checkbox'` ahora
  renderiza el componente `Switch` (antes un `<input type="checkbox">`). El
  cableado es correcto y preserva el comportamiento, pero **ningún campo del
  array `FIELDS` (líneas 27-40) tiene `type: 'checkbox'`** — todos son
  `text`/`number`/`email`/`tel`. Por tanto la rama nunca se activa hoy.
  Verificado contra el contrato real del backend:
  `SiteSettingsAdminSerializer` (`apps/settings_app/serializers.py:45-67`,
  referencia `/tmp/references/e-comerce`) expone solo campos no-boolean
  (`site_name`, `currency`, `iva_rate`, timeouts, umbrales, contacto,
  `social_links`). Los `BooleanField` (`is_active`) del módulo
  `settings_app` pertenecen a `PaymentGateway`/`ShippingMethod`
  (`models.py:161,232`), no a `SiteSettings`.
- **Decisión:** se mantiene la rama Switch (defensiva, lista para un futuro
  campo boolean de dominio). NO se fabricó un campo boolean ficticio solo
  para tener algo que testear (violaría el Premise Gate). Test añadido bloquea
  la regresión de reintroducir un checkbox crudo.
- **Estado:** DOCUMENTADO (cableado estructural en `ui@<pendiente-commit>`).

---

## H-UI-02 — Premisa incorrecta: "Card cableado en SecurityPage"

- **Severidad:** MEDIA
- **Archivo:** `src/pages/account/SecurityPage.jsx:82,102,114,152`
- **Descripción:** la premisa de la tarea afirmaba que el componente `Card`
  de `@components/common` ya estaba cableado en `SecurityPage.jsx` con 3 usos
  (líneas ~82/102/114). **Es falso:** esos 3 usos consumen un componente
  `Card` **local** definido en el mismo archivo (`:152`,
  `function Card({ title, subtitle, tone, children })`). `SecurityPage.jsx`
  **no importa** `Card` de `@components/common` (sus imports terminan en
  `:16` con `MetaTag, Button, Field` de primitives). Verificado además que el
  `Card` compartido del barrel **no tiene ningún consumidor** en `src/`:
  `grep -rn "Card" src --include="*.jsx" | grep "from '@components/common'"`
  → 0 resultados.
- **Decisión:** corregida la nota desactualizada en `index.md`: `Card` del
  design-system sigue **sin cablear** (exportado en el barrel,
  `src/components/common/index.js:13`, pero con 0 consumidores). Candidato
  futuro de cableado real.
- **Estado:** DOCUMENTADO (corrección de doc en `ui@<pendiente-commit>`).
