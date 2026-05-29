/**
 * InfoPage — Práctica Yorùbà
 * Página de contenido estático del CMS.
 * Ruta: /info/:slug
 *
 * Lee la página desde adminSlice.currentPage (fetchAdminPage).
 * En producción se reemplazará por un endpoint público /api/v1/pages/:slug/
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchAdminPage } from '@redux/slices/adminSlice';
import { MetaTag } from '@components/common/primitives';
import styles from './InfoPage.module.scss';

export default function InfoPage() {
  const { slug }    = useParams();
  const dispatch    = useDispatch();
  const page        = useSelector((s) => s.admin?.currentPage);
  const isLoading   = useSelector((s) => s.admin?.isLoadingPages);

  useEffect(() => {
    if (slug) dispatch(fetchAdminPage(slug));
  }, [dispatch, slug]);

  if (isLoading) {
    return <div className={styles.loading}>Cargando contenido…</div>;
  }

  if (!page || page.slug !== slug) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <MetaTag>Error 404</MetaTag>
          <h1 className={styles.title}>Página no encontrada</h1>
          <p className={styles.body}>
            El contenido que buscas no existe o fue movido.
          </p>
          <Link to="/" className={styles.back}>← Volver al inicio</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <MetaTag>{page.slug}</MetaTag>
        <h1 className={styles.title}>{page.title}</h1>
        {page.content
          ? <div
              className={styles.body}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          : <p className={styles.body}>Contenido en preparación.</p>
        }
        <Link to="/" className={styles.back}>← Volver al inicio</Link>
      </div>
    </main>
  );
}
