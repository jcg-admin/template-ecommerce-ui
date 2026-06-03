/**
 * CatalogPage — Práctica Yorùbà
 * Re-skin del catálogo con sidebar de filtros + grid editorial.
 * Mantiene la lógica original (Redux + búsqueda fulltext).
 *
 * Endpoints:
 *   GET /catalogue/?cat=...&orisha=...&page=...
 *   GET /catalogue/search/?q=...
 *   GET /catalogue/categories/
 */

import Breadcrumb  from '@components/common/Breadcrumb';
import Chip        from '@components/common/Chip/Chip';
import RangeSlider from '@components/common/RangeSlider/RangeSlider';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  fetchProducts, searchProducts, clearSearch, setPage,
} from '@redux/slices/catalogSlice';
import SearchBar from '@components/catalog/SearchBar';
import ViewToggle from '@components/common/ViewToggle';
import ProductCard from '@components/catalog/ProductCard';
import { MetaTag, Button, EmptyState } from '@components/common/primitives';
import styles from './CatalogPage.module.scss';

const ORISHAS = ['Yemayá','Shangó','Oshún','Obatalá','Oyá','Eleguá','Oggún','Babalú-Ayé'];
const TYPES   = ['Eleke','Otán','Sopera','Herramienta','Bandera','Libro'];

export default function CatalogPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    products = [], searchResults = [],
    searchQuery, isLoading, isSearching,
    error, searchError, pagination = {},
  } = useSelector((s) => s.catalog || {});
  const wishlistItems = useSelector((s) => s.wishlist?.items ?? []);
  const currentPage = pagination?.page ?? 1;


  const qParam        = searchParams.get('q')        || '';
  const categoryParam = searchParams.get('category') || '';
  const orishasParam  = searchParams.get('orishas')  || '';
  const view          = searchParams.get('view') === 'list' ? 'list' : 'grid';
  const [activeOrishas, setActiveOrishas]   = useState(
    () => orishasParam ? orishasParam.split(',') : []
  );
  const [activeTypes,   setActiveTypes]     = useState([]);
  const [sortOrder,     setSortOrder]       = useState('');
  const [availability,  setAvailability]    = useState([]);
  const [priceMin,      setPriceMin]        = useState(0);
  const [priceMax,      setPriceMax]        = useState(10000);
  const mode = qParam ? 'search' : 'listing';


  // Resetear a página 1 cuando cambia cualquier filtro
  const prevFiltersRef = useRef({ qParam, categoryParam, activeOrishas, activeTypes, sortOrder, availability, priceMin, priceMax });
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const changed =
      prev.qParam !== qParam ||
      prev.categoryParam !== categoryParam ||
      prev.activeOrishas !== activeOrishas ||
      prev.activeTypes !== activeTypes ||
      prev.sortOrder !== sortOrder ||
      prev.availability !== availability ||
      prev.priceMin !== priceMin ||
      prev.priceMax !== priceMax;
    if (changed && currentPage !== 1) dispatch(setPage(1));
    prevFiltersRef.current = { qParam, categoryParam, activeOrishas, activeTypes, sortOrder, availability, priceMin, priceMax };
  }, [dispatch, qParam, categoryParam, activeOrishas, activeTypes, sortOrder, availability, priceMin, priceMax, currentPage]);

  useEffect(() => {
    if (qParam) {
      dispatch(searchProducts({ q: qParam }));
    } else {
      dispatch(fetchProducts({
        category:     categoryParam || undefined,
        orishas:      activeOrishas.length > 0  ? activeOrishas : undefined,
        types:        activeTypes.length > 0    ? activeTypes   : undefined,
        ordering:     sortOrder || undefined,
        availability: availability.length > 0   ? availability  : undefined,
        price_min:    priceMin > 0              ? priceMin      : undefined,
        price_max:    priceMax < 10000          ? priceMax      : undefined,
        page:         currentPage,
      }));
    }
  }, [dispatch, qParam, categoryParam, activeOrishas, activeTypes, sortOrder, availability, priceMin, priceMax, currentPage]);

  // Scroll al inicio cuando los productos nuevos ya están en el DOM
  const prevPageRef = useRef(currentPage);
  useEffect(() => {
    if (prevPageRef.current !== currentPage || products.length > 0) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    prevPageRef.current = currentPage;
  }, [products, currentPage]);

  const handleViewChange = useCallback((next) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (next === 'list') params.set('view', 'list');
      else params.delete('view'); // grid es el default → no ensucia la URL
      return params;
    });
  }, [setSearchParams]);

  const handleSearch = useCallback((q) => setSearchParams({ q }), [setSearchParams]);
  const handleClearSearch = useCallback(() => {
    setSearchParams({});
    dispatch(clearSearch());
  }, [dispatch, setSearchParams]);

  const displayItems = mode === 'search' ? searchResults : products;
  const loading      = mode === 'search' ? isSearching : isLoading;
  const apiError     = mode === 'search' ? searchError : error;

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <Breadcrumb items={[
            { label: 'Inicio', to: '/' },
            { label: mode === 'search' ? 'Búsqueda' : 'Catálogo' },
          ]} />
          <div className={styles.heroGrid}>
            <div>
              <MetaTag tone="bronze">
                Catálogo · {pagination.count || displayItems.length} piezas
              </MetaTag>
              <h1 className={styles.title}>
                {mode === 'search'
                  ? <>Resultados de búsqueda</>
                  : <>Objetos rituales <em>Yorùbà</em></>}
              </h1>
              {mode === 'search' && searchQuery && (
                <p className={styles.lead}>
                  {pagination.count} resultado{pagination.count !== 1 ? 's' : ''} para{' '}
                  <strong>«{searchQuery}»</strong>{' '}
                  · <button onClick={handleClearSearch} className={styles.clearLink}>Limpiar búsqueda</button>
                </p>
              )}
              {mode === 'listing' && (
                <p className={styles.lead}>
                  Todos los objetos del catálogo organizados por òrìsà y por uso ritual.
                </p>
              )}
            </div>
            <div className={styles.heroSearch}>
              <SearchBar onSearch={handleSearch} initialValue={qParam} isSearching={isSearching} />
            </div>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.layout}>
          <FilterSidebar
          activeOrishas={activeOrishas}
          setActiveOrishas={setActiveOrishas}
          activeTypes={activeTypes}
          setActiveTypes={setActiveTypes}
          availability={availability}
          setAvailability={setAvailability}
          priceMin={priceMin} priceMax={priceMax}
          setPriceMin={setPriceMin} setPriceMax={setPriceMax}
        />

          <section className={styles.results}>
            <Toolbar
              count={displayItems.length}
              total={pagination.count}
              view={view}
              onViewChange={handleViewChange}
            />

            {loading && (
              <div className={styles.loading} aria-live="polite">
                <div className={styles.spinner} />
                <p>Cargando catálogo…</p>
              </div>
            )}

            {apiError && !loading && (
              <div className={styles.errorBox} role="alert">
                No se pudieron cargar los productos. Inténtalo de nuevo.
              </div>
            )}

            {!loading && !apiError && displayItems.length === 0 && (
              <EmptyState
                icon="⌕"
                title={mode === 'search' ? `No encontramos "${searchQuery}"` : 'Catálogo vacío'}
                description="Prueba escribiendo el nombre del òrìsà, del tipo de objeto o del uso ritual."
              >
                <Button variant="primary" onClick={handleClearSearch}>Ver catálogo completo</Button>
              </EmptyState>
            )}

            {!loading && displayItems.length > 0 && (
              <div className={`${styles.grid} ${view === 'list' ? styles.gridList : ''}`}>
                {displayItems.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    inWishlist={wishlistItems.some((i) => i.product_id === p.id)}
                  />
                ))}
              </div>
            )}

            {pagination.totalPages > 1 && (
              <Pagination
                current={pagination.page}
                total={pagination.totalPages}
                onPage={(p) => dispatch(setPage(p))}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function FilterSidebar({ activeOrishas, setActiveOrishas, activeTypes, setActiveTypes,
  availability, setAvailability, priceMin, priceMax, setPriceMin, setPriceMax }) {
  return (
    <aside className={styles.sidebar}>
      <FilterGroup title="Òrìsà">
        <div className={styles.chipGroup}>
          {ORISHAS.map((o) => (
            <Chip
              key={o}
              selectable
              selected={activeOrishas.includes(o)}
              onSelect={() => setActiveOrishas((prev) =>
                prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]
              )}
              onDeselect={() => setActiveOrishas((prev) => prev.filter(x => x !== o))}
            >
              {o}
            </Chip>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Tipo de pieza">
        <div className={styles.chipGroup}>
          {TYPES.map((t) => (
            <Chip
              key={t}
              selectable
              selected={activeTypes.includes(t)}
              onSelect={() => setActiveTypes((prev) =>
                prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
              )}
              onDeselect={() => setActiveTypes((prev) => prev.filter(x => x !== t))}
            >
              {t}
            </Chip>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Rango de precio">
        <RangeSlider
          min={0} max={10000} step={50}
          defaultValue={[0, 10000]}
          tooltips
          tooltipsFormat={(v) => `$${v.toLocaleString('es-MX')}`}
          onChange={([min, max]) => { setPriceMin(min); setPriceMax(max); }}
          track="fill"
        />
      </FilterGroup>
      <FilterGroup title="Disponibilidad">
        {[['in_stock','Disponible inmediato'],['on_demand','Sobre pedido'],['on_sale','En oferta']].map(([val, lbl]) => (
          <label key={val} className={styles.check}>
            <input type="checkbox"
              checked={availability.includes(val)}
              onChange={() => setAvailability(prev =>
                prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
              )}
            />
            <span className={styles.checkbox} />
            <span>{lbl}</span>
          </label>
        ))}
      </FilterGroup>
      <Button variant="secondary" block>Limpiar filtros</Button>
    </aside>
  );
}
function FilterGroup({ title, items, children }) {
  return (
    <div className={styles.filterGroup}>
      <h4 className={styles.filterTitle}>{title}</h4>
      {items?.map((label) => <Check key={label} label={label} />)}
      {children}
    </div>
  );
}
function Check({ label, checked = false }) {
  return (
    <label className={styles.check}>
      <input type="checkbox" defaultChecked={checked} />
      <span className={styles.checkbox} />
      <span>{label}</span>
    </label>
  );
}
function PriceSlider() {
  return (
    <div className={styles.slider}>
      <div className={styles.sliderTrack}>
        <div className={styles.sliderFill} />
        <div className={styles.sliderHandle} style={{ left: '15%' }} />
        <div className={styles.sliderHandle} style={{ left: '60%' }} />
      </div>
      <div className={styles.sliderLabels}>
        <span>$580 MXN</span><span>$8,200 MXN</span>
      </div>
    </div>
  );
}

function Toolbar({ count, total, sortOrder, onSort, view = 'grid', onViewChange }) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarCount}>
        Mostrando <strong>{count}</strong> de {total || count} piezas
      </div>
      <div className={styles.toolbarRight}>
        <ViewToggle value={view} onChange={onViewChange} ariaLabel="Vista del catálogo" />
        <label className={styles.sort}>
          <span>Ordenar:</span>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
            <option value="">Recomendados</option>
            <option value="base_price">Precio: menor</option>
            <option value="-base_price">Precio: mayor</option>
            <option value="-created_at">Recién llegados</option>
          </select>
        </label>
      </div>
    </div>
  );
}

function Pagination({ current, total, onPage }) {
  const pages = [];
  for (let p = 1; p <= total; p++) {
    if (p <= 3 || p === total || Math.abs(p - current) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return (
    <div className={styles.pagination}>
      <button disabled={current === 1} onClick={() => onPage(current - 1)}>← Anterior</button>
      {pages.map((p, i) =>
        typeof p === 'number' ? (
          <button
            key={`page-${i}`}
            className={p === current ? styles.pageActive : ''}
            onClick={() => onPage(p)}
          >{p}</button>
        ) : <span key={`ellipsis-${i}`} className={styles.pageEllipsis}>{p}</span>
      )}
      <button disabled={current === total} onClick={() => onPage(current + 1)}>Siguiente →</button>
    </div>
  );
}
