/**
 * SearchHistoryPage — Práctica Yorùbà
 * Listado del historial de búsquedas del usuario (máx 20 entradas).
 *
 * Endpoints:
 *   GET    /catalogue/search/history/
 *   DELETE /catalogue/search/history/<pk>/
 *   DELETE /catalogue/search/history/       (clear all)
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchSearchHistory, deleteSearchTerm, clearSearchHistory,
} from '@redux/slices/catalogSlice';
import AccountSidebar from '@components/account/AccountSidebar';
import { MetaTag, Button, EmptyState } from '@components/common/primitives';
import styles from './SearchHistoryPage.module.scss';

export default function SearchHistoryPage() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.catalog?.searchHistory || []);
  const isLoading = useSelector((s) => s.catalog?.isLoadingSearchHistory);

  useEffect(() => { dispatch(fetchSearchHistory()); }, [dispatch]);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <Link to="/account">Mi cuenta</Link><span>/</span>
          <span className={styles.bcCurrent}>Búsquedas recientes</span>
        </nav>

        <div className={styles.layout}>
          <AccountSidebar />

          <section>
            <header className={styles.header}>
              <div>
                <MetaTag tone="bronze">Últimas 20 búsquedas guardadas</MetaTag>
                <h1 className={styles.title}>Búsquedas recientes</h1>
                <p className={styles.lead}>
                  Repite una búsqueda anterior o borra el historial cuando quieras.
                </p>
              </div>
              {items.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (window.confirm('¿Borrar todo el historial?')) dispatch(clearSearchHistory());
                  }}
                >Borrar todo</Button>
              )}
            </header>

            {isLoading && <div className={styles.loading}>Cargando…</div>}

            {!isLoading && items.length === 0 && (
              <EmptyState
                icon="⌕"
                title="Aún no has buscado nada"
                description="Cuando uses la búsqueda del catálogo, los términos quedarán aquí."
              >
                <Link to="/catalog"><Button variant="primary">Ir al catálogo</Button></Link>
              </EmptyState>
            )}

            {!isLoading && items.length > 0 && (
              <ul className={styles.list}>
                {items.map((it) => (
                  <li key={it.id} className={styles.row}>
                    <Link to={`/catalogo?q=${encodeURIComponent(it.query)}`} className={styles.queryLink}>
                      <span className={styles.queryIcon}>⌕</span>
                      <span className={styles.query}>{it.query}</span>
                      <span className={styles.results}>
                        {it.results_count} {it.results_count === 1 ? 'resultado' : 'resultados'}
                      </span>
                    </Link>
                    <span className={styles.when}>
                      {new Date(it.searched_at).toLocaleDateString('es-MX', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => dispatch(deleteSearchTerm(it.id))}
                      aria-label="Borrar entrada"
                    >×</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
