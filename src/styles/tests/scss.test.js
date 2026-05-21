/**
 * Shim de Jest para ejecutar tests SCSS escritos con sass-true.
 *
 * sass-true es un framework de testing para SCSS que permite escribir
 * tests en sintaxis Sass nativa (@include describe/it/assert-equal) y
 * delegar el reporte a un test runner JS (Jest en este caso).
 *
 * Este shim itera todos los archivos `*.test.scss` en este directorio y
 * los compila + ejecuta via sass-true.runSass({ describe, it }, file).
 * Las funciones globales `describe` e `it` de Jest reciben los grupos y
 * casos definidos en SCSS, y los reportes aparecen integrados en el
 * output normal de `npm test`.
 *
 * Iniciativa: mapear-y-corregir-scss-completo (T-108).
 */

const path = require('path');
const fs = require('fs');
const sassTrue = require('sass-true');

const testDir = __dirname;
const scssTestFiles = fs
  .readdirSync(testDir)
  .filter((f) => f.endsWith('.test.scss'));

if (scssTestFiles.length === 0) {
  describe('SCSS tests', () => {
    it('debe haber al menos un archivo *.test.scss en src/styles/tests/', () => {
      expect(scssTestFiles.length).toBeGreaterThan(0);
    });
  });
} else {
  scssTestFiles.forEach((file) => {
    const fullPath = path.join(testDir, file);
    sassTrue.runSass({ describe, it }, fullPath);
  });
}
