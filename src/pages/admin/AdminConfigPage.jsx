/**
 * AdminConfigPage — Hub de configuracion (UC-CFG-01..05)
 *
 * `/admin/config` agrupa los cinco subdominios de configuracion
 * documentados en source/requisitos/casos-uso/config/:
 *
 *   - UC-CFG-01: Configurar gateways de pago.
 *   - UC-CFG-02: Configurar metodos y costos de envio.
 *   - UC-CFG-03: SiteSettings (IVA, moneda, nombre) —
 *     implementado en /admin/system-settings via UC-ADM-04.
 *   - UC-CFG-04: Gestionar contenido estatico.
 *   - UC-CFG-05: Gestionar datos de contacto (bandeja UC-COM-02).
 *
 * El hub no consume endpoints propios; enlaza a las paginas que ya
 * implementan cada dominio o marca como «Proximamente» las que aun
 * no tienen pagina dedicada.
 */
import { Link } from 'react-router-dom';
import styles from './AdminConfigPage.module.scss';

const ITEMS = [
  {
    uc:    'UC-CFG-03',
    title: 'Ajustes del sitio',
    desc:  'SiteSettings: nombre, moneda, IVA, modo mantenimiento (UC-ADM-04).',
    to:    '/admin/system-settings',
  },
  {
    uc:    'UC-CFG-01',
    title: 'Pasarelas de pago',
    desc:  'CRUD de gateways (Mercado Pago, PayPal); credenciales cifradas.',
    to:    '/admin/config/gateways',
  },
  {
    uc:    'UC-CFG-02',
    title: 'Metodos y costos de envio',
    desc:  'CRUD de metodos de envio y sus costos.',
    to:    '/admin/config/shipping',
  },
  {
    uc:    'UC-CFG-05',
    title: 'Mensajes de contacto',
    desc:  'Bandeja de mensajes recibidos desde el formulario publico (UC-COM-02).',
    to:    '/admin/contact/messages',
  },
  {
    uc:    'UC-CFG-04',
    title: 'Gestionar contenido estatico',
    desc:  'Edicion de paginas estaticas: Sobre Nosotros, Terminos, FAQ.',
    to:    '/admin/pages',
  },
];

export default function AdminConfigPage() {
  return (
    <section className={styles.page} aria-labelledby="config-title">
      <header className={styles.header}>
        <h1 id="config-title" className={styles.title}>Configuracion</h1>
        <p className={styles.subtitle}>
          Hub de configuracion del backoffice. Cada tarjeta entra al
          dominio correspondiente (UC-CFG-01..05).
        </p>
      </header>

      <div className={styles.grid}>
        {ITEMS.map((it) => {
          const body = (
            <>
              <p className={styles.cardTitle}>
                {it.title}
                {it.pending && <span className={styles.badge}>Proximamente</span>}
              </p>
              <p className={styles.cardDesc}>{it.desc}</p>
              <p className={styles.cardMeta}>{it.uc}</p>
            </>
          );
          if (it.to) {
            return (
              <Link key={it.uc} to={it.to} className={styles.card}>
                {body}
              </Link>
            );
          }
          return (
            <div
              key={it.uc}
              className={`${styles.card} ${styles.disabled}`}
              aria-disabled="true"
            >
              {body}
            </div>
          );
        })}
      </div>
    </section>
  );
}
