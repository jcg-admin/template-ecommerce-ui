/**
 * ShippingCalculator — UC-LOG-09 (Calcular Costo de Envio)
 *
 * Bloque buyer-facing del carrito: el comprador escribe su codigo
 * postal y obtiene el costo de envio estimado, la zona logistica y la
 * ventana de entrega (ETA). Si el subtotal alcanza el umbral de envio
 * gratis, el resultado lo informa.
 *
 * Props:
 *   subtotal (number) — subtotal actual del carrito; se envia al
 *                       endpoint para resolver `qualifies_free_shipping`.
 *
 * Estado en Redux (cartSlice): shippingQuote, isQuoting, quoteError.
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShippingQuote } from '@redux/slices/cartSlice';
import styles from './ShippingCalculator.module.scss';

const POSTAL_CODE_RE = /^\d{5}$/;

const ZONE_LABELS = {
  metropolitana: 'Zona metropolitana',
  nacional:      'Envio nacional',
  extendida:     'Zona extendida',
};

function zoneLabel(zone) {
  return ZONE_LABELS[zone] || zone;
}

function formatCurrency(amount) {
  return `$${Number(amount).toLocaleString('es-MX')} MXN`;
}

export default function ShippingCalculator({ subtotal = 0 }) {
  const dispatch = useDispatch();
  const { shippingQuote, isQuoting, quoteError } = useSelector(
    (s) => s.cart || {},
  );

  const [postalCode, setPostalCode] = useState('');
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    // Solo digitos, maximo 5.
    const next = e.target.value.replace(/\D/g, '').slice(0, 5);
    setPostalCode(next);
    if (localError) setLocalError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!POSTAL_CODE_RE.test(postalCode)) {
      setLocalError('Ingresa un codigo postal de 5 digitos.');
      return;
    }
    setLocalError('');
    dispatch(fetchShippingQuote({ postal_code: postalCode, subtotal }));
  };

  const serverError = quoteError
    ? quoteError.code === 'POSTAL_CODE_INVALID' || quoteError.statusCode === 400
      ? 'Ese codigo postal no es valido. Revisa los 5 digitos.'
      : 'No pudimos calcular el envio. Intentalo de nuevo.'
    : '';
  const errorMessage = localError || serverError;

  return (
    <section className={styles.calculator} aria-labelledby="shipping-calc-title">
      <h3 id="shipping-calc-title" className={styles.title}>
        Calcular costo de envio
      </h3>
      <p className={styles.hint}>
        Escribe tu codigo postal para estimar el costo y los dias de entrega.
      </p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.field} htmlFor="shipping-postal-code">
          <span className={styles.fieldLabel}>Codigo postal</span>
          <input
            id="shipping-postal-code"
            name="postal_code"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000"
            value={postalCode}
            onChange={handleChange}
            className={styles.input}
            aria-invalid={errorMessage ? 'true' : 'false'}
            aria-describedby={errorMessage ? 'shipping-error' : undefined}
          />
        </label>
        <button
          type="submit"
          className={styles.submit}
          disabled={isQuoting}
          aria-busy={isQuoting}
        >
          {isQuoting ? 'Calculando…' : 'Calcular'}
        </button>
      </form>

      {errorMessage && (
        <p id="shipping-error" role="alert" className={styles.error}>
          {errorMessage}
        </p>
      )}

      {!errorMessage && shippingQuote && (
        <div className={styles.result} role="status">
          <div className={styles.resultZone}>
            {zoneLabel(shippingQuote.zone)} · CP {shippingQuote.postal_code}
          </div>
          {shippingQuote.qualifies_free_shipping ? (
            <div className={`${styles.resultCost} ${styles.free}`}>
              Envio gratis
            </div>
          ) : (
            <div className={styles.resultCost}>
              {formatCurrency(shippingQuote.cost)}
            </div>
          )}
          <div className={styles.resultEta}>
            Entrega estimada: {shippingQuote.estimated_days_min}–
            {shippingQuote.estimated_days_max} dias
          </div>
          {!shippingQuote.qualifies_free_shipping && (
            <div className={styles.resultThreshold}>
              Envio gratis a partir de{' '}
              {formatCurrency(shippingQuote.free_shipping_threshold)}.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
