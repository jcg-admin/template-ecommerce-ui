/**
 * CatalogFilters — UC-CAT-04 + UC-CAT-05.
 *
 * Panel lateral del catalogo que permite al visitante filtrar por:
 *   - categoria (seleccion exclusiva de un slug del arbol publico),
 *   - rango de precio (price_min / price_max sobre `price_with_tax`).
 *
 * El estado vive en la URL (`?category=`, `?price_min=`, `?price_max=`)
 * para que las URLs sean compartibles y la pagina sea idempotente
 * frente a recarga. El padre (CatalogPage) refleja los params al
 * thunk `fetchProducts({ category, price_min, price_max, q })`.
 */
import { useState, useEffect } from 'react';
import { useCategories } from '@hooks/domain/useCategories';
import RangeSlider from '@components/common/RangeSlider/RangeSlider';
import styles from './CatalogFilters.module.scss';

function flattenTree(nodes, depth = 0, acc = []) {
  if (!Array.isArray(nodes)) return acc;
  for (const n of nodes) {
    acc.push({ id: n.id, slug: n.slug, name: n.name, depth });
    if (Array.isArray(n.children) && n.children.length) {
      flattenTree(n.children, depth + 1, acc);
    }
  }
  return acc;
}

export default function CatalogFilters({
  category: categoryProp = '',
  priceMin: priceMinProp = '',
  priceMax: priceMaxProp = '',
  onChange,
}) {
  const { data: catData } = useCategories();
  const tree = catData?.results ?? [];
  const flat = flattenTree(tree);

  const [priceMin, setPriceMin] = useState(priceMinProp);
  const [priceMax, setPriceMax] = useState(priceMaxProp);
  const [priceError, setPriceError] = useState('');
  // T-605: handler del RangeSlider (BUG-CF01 corregido — garantiza min<=max)
  const handleRangeChange = ([lo, hi]) => {
    setPriceMin(lo);
    setPriceMax(hi);
    setPriceError('');
    onChange?.({ price_min: lo || null, price_max: hi || null });
  };

  useEffect(() => { setPriceMin(priceMinProp); }, [priceMinProp]);
  useEffect(() => { setPriceMax(priceMaxProp); }, [priceMaxProp]);

  const handleCategoryChange = (e) => {
    const slug = e.target.value || '';
    onChange?.({ category: slug || null });
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const min = priceMin === '' ? null : Number(priceMin);
    const max = priceMax === '' ? null : Number(priceMax);
    if (min !== null && (Number.isNaN(min) || min < 0)) {
      setPriceError('El precio minimo debe ser un numero >= 0.');
      return;
    }
    if (max !== null && (Number.isNaN(max) || max < 0)) {
      setPriceError('El precio maximo debe ser un numero >= 0.');
      return;
    }
    if (min !== null && max !== null && max < min) {
      setPriceError('El precio maximo no puede ser menor que el minimo.');
      return;
    }
    setPriceError('');
    onChange?.({ price_min: min, price_max: max });
  };

  const handleClear = () => {
    setPriceMin('');
    setPriceMax('');
    setPriceError('');
    onChange?.({ category: null, price_min: null, price_max: null });
  };

  return (
    <aside className={styles.filters} aria-label="Filtros del catalogo">
      <h2 className={styles.title}>Filtros</h2>

      {/* UC-CAT-04: categoria */}
      <div className={styles.group}>
        <label className={styles.label} htmlFor="filter-category">
          Categoria
        </label>
        <select
          id="filter-category"
          className={styles.select}
          value={categoryProp || ''}
          onChange={handleCategoryChange}
        >
          <option value="">Todas las categorias</option>
          {flat.map((c) => (
            <option key={c.id} value={c.slug}>
              {' '.repeat(c.depth * 2)}
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* UC-CAT-05: rango de precio — T-605 RangeSlider (BUG-CF01 corregido) */}
      <div className={styles.group}>
        <RangeSlider
          label="Precio (con IVA)"
          min={0}
          max={10000}
          step={50}
          distance={100}
          value={[Number(priceMin) || 0, Number(priceMax) || 10000]}
          onChange={handleRangeChange}
          formatValue={(v) => `$${v.toLocaleString('es-MX')}`}
        />
        {priceError && (
          <p role="alert" className={styles.error}>{priceError}</p>
        )}
      </div>

      <button type="button" className={styles.clearBtn} onClick={handleClear}>
        Limpiar filtros
      </button>
    </aside>
  );
}
