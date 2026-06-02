/**
 * ReferralPage — UC-PRO-05.
 * Programa de referidos de la cuenta del comprador.
 *
 * Muestra el codigo de referido, permite copiar/compartir el `share_url`
 * y resume las metricas (invitados y recompensas).
 *
 * Endpoint:
 *   GET /api/v1/account/referral/  (via referralSlice → fetchReferral)
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchReferral } from '@redux/slices/referralSlice';
import { MetaTag, Button } from '@components/common/primitives';
import styles from './ReferralPage.module.scss';

export default function ReferralPage() {
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);

  const code         = useSelector((s) => s.referral?.code);
  const shareUrl     = useSelector((s) => s.referral?.shareUrl);
  const invitedCount = useSelector((s) => s.referral?.invitedCount ?? 0);
  const rewards      = useSelector((s) => s.referral?.rewards ?? 0);
  const isLoading    = useSelector((s) => s.referral?.isLoading);
  const error        = useSelector((s) => s.referral?.error);

  useEffect(() => { dispatch(fetchReferral()); }, [dispatch]);

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleShare = async () => {
    if (!shareUrl) return;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Programa de referidos',
          text: `Únete con mi código ${code}`,
          url: shareUrl,
        });
        return;
      } catch {
        // El usuario canceló o la API no está disponible: caemos a copiar.
      }
    }
    handleCopy();
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <Link to="/account">Mi cuenta</Link><span>/</span>
          <span className={styles.bcCurrent}>Programa de referidos</span>
        </nav>

        <div className={styles.layout}>

          <section>
            <header className={styles.header}>
              <MetaTag tone="lime">Invita y gana</MetaTag>
              <h1 className={styles.title}>Programa de referidos</h1>
              <p className={styles.lead}>
                Comparte tu código con amigos. Cuando completen su primera
                compra, ambos reciben recompensas.
              </p>
            </header>

            {isLoading && <div className={styles.loading}>Cargando…</div>}

            {error && (
              <div className={styles.error} role="alert">
                No pudimos cargar tu programa de referidos. Inténtalo más tarde.
              </div>
            )}

            {!isLoading && code && (
              <>
                <div className={styles.codeCard}>
                  <span className={styles.codeLabel}>Tu código de referido</span>
                  <strong className={styles.code}>{code}</strong>
                  {shareUrl && (
                    <div className={styles.shareRow}>
                      <input
                        className={styles.shareInput}
                        type="text"
                        readOnly
                        value={shareUrl}
                        aria-label="Enlace para compartir"
                      />
                      <Button variant="primary" onClick={handleCopy}>
                        {copied ? 'Copiado' : 'Copiar'}
                      </Button>
                      <Button variant="ghost" onClick={handleShare}>
                        Compartir
                      </Button>
                    </div>
                  )}
                </div>

                <div className={styles.metrics}>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>{invitedCount}</span>
                    <span className={styles.metricLabel}>Amigos invitados</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>{rewards}</span>
                    <span className={styles.metricLabel}>Recompensas acumuladas</span>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
