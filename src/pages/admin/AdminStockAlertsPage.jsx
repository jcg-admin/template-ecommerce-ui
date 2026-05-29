/**
 * AdminStockAlertsPage — Práctica Yorùbà
 * Lista de productos bajo el umbral de stock mínimo.
 *
 * Endpoints:
 *   GET /admin/inventory/alerts/   → [{ product, sku, stock, threshold, ... }]
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchStockAlerts } from '@redux/slices/adminSlice';
import StockAdjustModal from '@components/admin/StockAdjustModal';
import { MetaTag, Button } from '@components/common/primitives';
import styles from './AdminTablePage.module.scss';

export default function AdminStockAlertsPage() {
  const dispatch = useDispatch();
  const alerts = useSelector((s) => s.admin?.stockAlerts || []);
  const isLoading = useSelector((s) => s.admin?.isLoadingInventory);
  const [adjusting, setAdjusting] = useState(null);

  useEffect(() => { dispatch(fetchStockAlerts()); }, [dispatch]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">{alerts.length} productos requieren reposición</MetaTag>
          <h1 className={styles.title}>Alertas de stock</h1>
        </div>
        <Link to="/admin/inventory"><Button variant="ghost">← Volver al dashboard</Button></Link>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th>Òrìsà</th>
              <th>Stock</th>
              <th>Umbral</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className={styles.loading}>Cargando…</td></tr>}
            {!isLoading && alerts.length === 0 && (
              <tr><td colSpan={7} className={styles.empty}>Sin alertas. Todo el stock está bien ✓</td></tr>
            )}
            {!isLoading && alerts.map((a) => {
              const isOut = a.stock === 0;
              return (
                <tr key={`${a.product_id}-${a.variant_id || 'base'}`}>
                  <td>
                    <Link to={`/admin/products/${a.product_id}`} className={styles.itemName}>
                      {a.product_name}
                      {a.variant_label && <span style={{ color: 'var(--c-ink-mute)', marginLeft: 8 }}>· {a.variant_label}</span>}
                    </Link>
                  </td>
                  <td className={styles.mono}>{a.sku}</td>
                  <td>{a.orisha_name || '—'}</td>
                  <td className={`${styles.mono} ${isOut ? styles.stockOut : styles.stockLow}`}>
                    {a.stock}
                  </td>
                  <td className={styles.mono}>{a.threshold}</td>
                  <td>
                    <span className={`${styles.statusPill} ${styles[`pill_${isOut ? 'vino' : 'bronze'}`]}`}>
                      {isOut ? 'Agotado' : 'Stock bajo'}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    <Button variant="secondary" size="sm" onClick={() => setAdjusting(a)}>
                      Ajustar
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {adjusting && (
        <StockAdjustModal
          item={adjusting}
          onClose={() => setAdjusting(null)}
          onSaved={() => { setAdjusting(null); dispatch(fetchStockAlerts()); }}
        />
      )}
    </div>
  );
}
