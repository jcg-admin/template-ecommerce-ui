# LICENSE — `ui-core-5.25.0` (CoreUI Pro v5.25.0)

| Campo | Valor |
|-------|-------|
| Origen | Repositorio fork `NestorMonroy/ui-core-5.25.0` (clonado el 2026-05-21) |
| Repo de referencia local | `/tmp/references/ui-core-5.25.0/` |
| Commit del LICENSE | `1f4f210` (`update LICENSE`, 2026-05-21) |
| Tipo de licencia | MIT |
| Iniciativa que origino esta copia | `mapear-y-corregir-scss-completo` (T-101, verificacion de licencia previa a portacion) |

## Por que esta aqui

Esta iniciativa porta selectivamente SCSS de
`ui-core-5.25.0` a nuestro template como parte de la fase
F1a (portacion de capa abstracta). La disciplina de portacion
exige que cada archivo portado lleve atribucion al proyecto
original. Copiar el LICENSE aqui es prerrequisito de esa
atribucion.

Para cada partial SCSS portado, el header del archivo
referencia esta ubicacion:

```scss
// Portado de ui-core-5.25.0 (MIT)
// Atribucion: docs/licenses/ui-core-5.25.0-LICENSE.md
// Adaptado a CSS Modules de e-comerce-ui con prefijo --ec-
```

## Observaciones registradas en T-101

Tres observaciones formales registradas durante la
verificacion (ver `progreso-mapear-y-corregir-scss-completo.md`
fila Hallazgo durante la ejecucion T-101):

1. **Inconsistencia en el atribuyente del copyright**: la
   licencia MIT esta atribuida a `typescript-eslint and other
   contributors`, no a `creativeLabs Lukasz Holeczek` (autor
   original de CoreUI Pro) ni al fork. Probable plantilla MIT
   copiada incorrectamente. No bloquea la iniciativa pero se
   documenta.

2. **Cambio drastico previo-vs-nuevo**: la licencia anterior
   (commit `69022f3`) era `Copyright (c) 2026 creativeLabs
   Lukasz Holeczek. This is commercial software`. La
   transicion de comercial a MIT es decision administrativa
   del fork del usuario `NestorMonroy/ui-core-5.25.0`.

3. **Asuncion pragmatica**: el usuario, como propietario
   tanto del fork como de este proyecto, confirmo
   explicitamente que la licencia permite la adaptacion. La
   responsabilidad legal del estado de licencia del repo de
   referencia recae sobre el usuario.

## Texto completo del LICENSE

```
MIT License

Copyright (c) 2019 typescript-eslint and other contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Atribucion completa del proyecto original

CoreUI Pro v5.25.0 fue creado originalmente por `creativeLabs
Lukasz Holeczek`. La adaptacion derivada en este proyecto
respeta la atribucion al codigo SCSS original aunque la
licencia formal del fork referenciado sea MIT con copyright a
otra entidad.
