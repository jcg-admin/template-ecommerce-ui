# Decisiones: Habilitar MSW en modo demo

| Campo | Valor |
|-------|-------|
| Iniciativa | habilitar-msw-en-modo-demo |
| Fecha de creacion | 2026-05-26 |

## Seccion 1 — Decisiones de diseno

### dec-demo-mode-opt-in

La variable `DEMO_MODE=true` es completamente opt-in. Un build de
produccion sin esta variable no cambia en absoluto: `mockServiceWorker.js`
no aparece en `dist/` y el guard de `NODE_ENV` sigue siendo el unico
mecanismo de activacion de MSW.

**Alternativas descartadas**:

- Copiar siempre `mockServiceWorker.js` a `dist/`: expone un archivo
  de 9KB en produccion que el navegador nunca usara. Confunde a
  auditores de seguridad.
- Usar solo `npm run dev` para demostraciones: no cubre el caso de
  uso de demostrar el template sobre el `dist/` ya compilado servido
  por Nginx.

### dec-adr-no-supersedida

La ADR `dec-mocks-via-msw-service-worker` no se supersede. El
trade-off del service worker ya estaba documentado como conocido y
aceptado. Esta iniciativa agrega una mitigacion adicional (DEMO_MODE)
al mismo campo de la ADR mediante una nota datada.

### dec-copy-webpack-plugin-condicional

`CopyPlugin` solo se instancia cuando `isDemoMode === true`. El
`.filter(Boolean)` existente en el array `plugins` elimina el `false`
cuando no esta activo. No se modifica el flujo del build de produccion
normal.

## Seccion 2 — Hallazgos durante la ejecucion

### hallazgo-copy-webpack-plugin-no-en-deps

`copy-webpack-plugin` no estaba en `devDependencies`. Se agrego como
`"copy-webpack-plugin": "^12.0.2"`. El operador debe ejecutar
`npm install` antes del primer `npm run build:demo`.

### hallazgo-jsx-no-verificable-con-node-check

`node --check` no funciona con archivos `.jsx` (reporta
`ERR_UNKNOWN_FILE_EXTENSION`). La verificacion de `src/index.jsx` se
hizo por inspeccion manual del diff. La condicion resultante es:
`process.env.NODE_ENV !== 'production' || process.env.DEMO_MODE === 'true'`.

### hallazgo-isdemowmode-scope-modulo

`isDemoMode` debe declararse en el scope del modulo de `webpack.config.js`
(fuera del callback de webpack), no dentro. `process.env.DEMO_MODE` se
lee al cargar el modulo — consistente con como se lee `ANALYZE` en el
mismo archivo (`const analyze = process.env.ANALYZE === 'true'` dentro
del callback). Se opto por el scope del modulo para que `CopyPlugin`
pueda referenciarlo tanto dentro como fuera del callback si fuera
necesario.

### hallazgo-verificacion-funcional-pendiente

`npm run build:demo` no se pudo ejecutar en el entorno de desarrollo
(bash_tool) porque `node_modules/` no esta instalado. La verificacion
funcional completa (que el `dist/` incluya `mockServiceWorker.js` y
que MSW arranque en el navegador) debe hacerse en la distro WSL2 por
el operador con:

```bash
cd /srv/repos/tui/template-ecommerce-ui
npm install
npm run build:demo
ls dist/mockServiceWorker.js   # debe existir
npm run build
ls dist/mockServiceWorker.js   # no debe existir
```

## Seccion 3 — Verificacion post-ejecucion

| Criterio | Resultado | Evidencia |
|----------|-----------|-----------|
| `copy-webpack-plugin` en devDependencies | PASA | `grep "copy-webpack-plugin" package.json` = `"^12.0.2"` |
| `isDemoMode` declarado en scope del modulo | PASA | Linea 9 de webpack.config.js |
| `CopyPlugin` condicional en plugins | PASA | `isDemoMode && new CopyPlugin(...)` en array plugins |
| `process.env.DEMO_MODE` en DefinePlugin | PASA | `buildDefinedEnv` incluye `DEMO_MODE` |
| Script `build:demo` en package.json | PASA | `"build:demo": "DEMO_MODE=true webpack --mode production"` |
| Guard extendido en src/index.jsx | PASA | `NODE_ENV !== 'production' \|\| DEMO_MODE === 'true'` |
| README.md documenta modo demo | PASA | Seccion "Modo demo" + `build:demo` en bloque de comandos |
| vista-de-despliegue: fila Build demo | PASA | Fila agregada en tabla de entornos |
| ADR nota de extension | PASA | Campo Trade-off actualizado con nota datada 2026-05-26 |
| Verificacion funcional en distro | PENDIENTE | Requiere `npm install` + `npm run build:demo` en WSL2 |

La verificacion funcional queda pendiente para el operador en la
distro. Los criterios estructurales (codigo, config, documentacion)
estan todos verificados.
