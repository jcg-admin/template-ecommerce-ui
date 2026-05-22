# Alcance: Corregir nomenclatura `ecommerce` y estilo de diagramas

## Que cubre esta iniciativa

Esta iniciativa corrige dos categorias de inconsistencias detectadas
en los repos `template-ecommerce-ui` (UI) y
`template-ecomerce-ui-server` (server, a renombrar):

### Categoria 1: nomenclatura

Reemplazar el typo historico `e-comerce` (una `m`, con guion) por
`ecommerce` (doble `m`, sin guion) en todos los strings que apuntan
al propio proyecto y a sus repos hermanos.

Variantes detectadas (12 en el UI):

| String actual | Cambia a | Donde aparece |
|---------------|----------|---------------|
| `template-ecommerce-ui` | `template-ecommerce-ui` | refs a si mismo |
| `ecommerce-ui` | `ecommerce-ui` | paquete npm + comentarios + docs |
| `ecommerce-api` | `ecommerce-api` | refs hermano backend |
| `ecommerce-db` | `ecommerce-db` | refs hermano DB |
| `ecommerce-doc` | `ecommerce-doc` | refs hermano docs |
| `e-comerce-server` (mencion hermano) | `ecommerce-server` | refs hermano server |
| `template-ecommerce-server` | `template-ecommerce-server` | refs hermano server (variante larga) |
| `template-ecomerce-ui-server` (una `m`, nombre actual del directorio server) | `template-ecommerce-server` | refs hermano server |
| `e-comerce` huerfano | `ecommerce` | docs PM "como gestionar iniciativas" |

Y en el server (alcance espejo):

| String actual | Cambia a |
|---------------|----------|
| `template-ecomerce-ui-server` (su propio nombre) | `template-ecommerce-server` |
| `template-ecommerce-ui` (refs al UI) | `template-ecommerce-ui` |
| `ecommerce-ui` (forma corta) | `ecommerce-ui` |

### Categoria 2: estilo de diagramas Mermaid

Aplicar la convencion adoptada en la iniciativa cerrada
`crear-template-ecomerce-ui-server`:

- Tema `base` dark con `themeVariables` canonico (background
  `#0f172a`, primary `#1e293b`/`#f1f5f9`, border `#94a3b8`, line
  `#cbd5e1`, fontSize `13px`).
- Para `flowchart`/`graph`: anadir `classDef` (primary/secondary/
  done/warn/external) + `class` para cada nodo.
- Para `sequenceDiagram`, `gantt`, `pie`, `gitGraph`: solo aplicar
  el bloque `%%{init}%%` (sin classDef, no aplica al tipo).
- **Identificadores descriptivos `snake_case`** en TODOS los nodos
  (e.g. `nginx_web_server`, `paso_0_clonar`). **NO se permiten alias
  cortos** (`n`, `a`, `b`).

Diagramas afectados en el UI (19 totales en 15 archivos):

| Tipo | Cantidad | Tratamiento |
|------|----------|-------------|
| `flowchart` | 12 | Plantilla completa con classDef |
| `graph` | 1 | Plantilla completa con classDef (alias de flowchart) |
| `sequenceDiagram` | 3 | Solo `%%{init}%%` (no classDef) |
| `gantt` | 1 | Solo `%%{init}%%` |
| `pie` | 1 | Solo `%%{init}%%` |
| `gitGraph` | 1 | Solo `%%{init}%%` |

## Criterio de completitud

La iniciativa se cierra cuando:

1. **Renombre del directorio del server** completado:
   `template-ecomerce-ui-server/` -> `template-ecommerce-server/`.
2. **Remote del server** configurado:
   `https://github.com/jcg-admin/template-ecommerce-server.git`.
3. **Cero apariciones** en ambos repos de los strings:
   - `ecommerce-ui`, `ecommerce-api`, `ecommerce-db`, `ecommerce-doc`
   - `template-ecommerce-ui`, `template-ecomerce-ui-server`,
     `template-ecommerce-server`
   - `e-comerce` huerfano

   **Excluyendo**:
   - Menciones explicitas al referente externo
     `jcg-admin/e-comerce-server`.
   - Procedimiento externo
     `Procedimiento-Implementacion-Almacenamiento-WSL2-ecomerce-p001`.
   - Mensajes de commit historicos (no se reescriben).
   - Bitacoras `progreso-*.md` de iniciativas previas (es historia,
     no se edita).

4. **Cero diagramas Mermaid** sin tema dark canonico en archivos
   editables (docs/, README.md). Aplicado segun el tipo del diagrama.
5. **`npm run lint` pasa**, **`npm test` mantiene baseline o mejora**
   (2 failed / 813 passed esperado), **`npm run build` produce `dist/`
   valido**, **`bash tests/run_all.sh` del server pasa
   5 suites OK**.
6. **Indice de iniciativas** actualizado con esta iniciativa cerrada.
7. **Backup post-cambios** generado en `/tmp/backups/` de ambos repos.

## Fuera de alcance

| Item | Razon |
|------|-------|
| Renombrar mensajes de commit historicos | Reescribir 159 commits con `filter-branch` es destructivo, rompe hashes, no aporta valor proporcional al riesgo. |
| Renombrar el repo referente externo `jcg-admin/e-comerce-server` | Es un repo real en GitHub con ese nombre. |
| Tocar `Procedimiento-Implementacion-Almacenamiento-WSL2-ecomerce-p001` | Nombre exacto de procedimiento externo. |
| Renombrar bitacoras `progreso-*.md` de iniciativas previas (UI o server) | Son historia, no se editan. |
| Reanudar la iniciativa SCSS pausada `mapear-y-corregir-scss-completo` | Trabajo independiente, no comparte alcance. |
| Resolver las 2 pruebas Jest fallidas del baseline historico | Pre-existente, no causado por esta iniciativa. |
| Cambiar el contenido funcional del UI o del server | Solo nomenclatura + estilo de diagramas. |
| Push a GitHub de cualquiera de los dos repos | Decision posterior al cierre. |

## Repos hermanos NO EXISTENTES en GitHub

Las referencias a `ecommerce-api`, `ecommerce-db`, `ecommerce-doc`
en este repo apuntan a repos hermanos que **aun no existen en
GitHub**. Esta iniciativa actualiza los nombres en las menciones
internas asumiendo que cuando esos repos se creen, lo haran con
el naming `ecommerce-*` (doble `m`). Si en el futuro se decide otro
naming, esta iniciativa debera tener un follow-up.

## Estimacion de esfuerzo

| Fase | Esfuerzo | Notas |
|------|----------|-------|
| F0 | 30 min | Apertura + analisis exhaustivo + 7 decisiones formales |
| F1 | 15 min | Backup defensivo ambos repos |
| F2 | 45 min | Renombrar repo server (directorio + remote + contenido interno) |
| F3 | 60 min | Refs del UI a si mismo |
| F4 | 30 min | Refs cross-repo en el UI |
| F5 | 60 min | Mermaid en 15 archivos del UI |
| F6 | 30 min | Verificacion lint + tests + build + tests del server |
| F7 | 15 min | Cierre + indice de iniciativas + backup post |
| **TOTAL** | **~285 min (4h 45min)** | |
