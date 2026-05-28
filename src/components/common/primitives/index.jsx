import { useState } from 'react';
/**
 * Common primitives — Práctica Yorùbà
 * Componentes pequeños reutilizados en todas las pages.
 */

import styles from './primitives.module.scss';

// ─────────────────────────────────────────────────────────────────────
// MetaTag — eyebrow text (categoría, sección, "Paso 02", etc.)
// ─────────────────────────────────────────────────────────────────────
export function MetaTag({ children, tone = 'bronze', className = '' }) {
  const toneClass = {
    bronze: styles.metaTagBronze,
    lime:   styles.metaTagLime,
    coral:  styles.metaTagCoral,
    vino:   styles.metaTagVino,
    muted:  styles.metaTagMuted,
  }[tone] || styles.metaTagBronze;

  return (
    <span className={`${styles.metaTag} ${toneClass} ${className}`}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Price — formato MXN
// ─────────────────────────────────────────────────────────────────────
export function Price({ amount, size = 'md', showCurrency = false, className = '' }) {
  const formatted = new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', minimumFractionDigits: 0,
  }).format(Number(amount) || 0);

  const sizeClass = {
    sm: styles.priceSm,
    md: styles.priceMd,
    lg: styles.priceLg,
    xl: styles.priceXl,
  }[size] || styles.priceMd;

  return (
    <span className={`${styles.price} ${sizeClass} ${className}`}>
      {formatted}
      {showCurrency && <span className={styles.priceCurrency}>MXN</span>}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Field — input con label estilo "eyebrow"
// ─────────────────────────────────────────────────────────────────────
export function Field({
  label, name, value, onChange,
  placeholder = '', type = 'text', textarea = false,
  required = false, error = null,
  hint = null,
  passwordToggle = false,  // T-207: toggle show/hide en campos password
}) {
  const [showPassword, setShowPassword] = useState(false);
  const Input = textarea ? 'textarea' : 'input';

  const resolvedType = (type === 'password' && passwordToggle)
    ? (showPassword ? 'text' : 'password')
    : type;
  const inputProps = textarea ? { rows: 3 } : { type: resolvedType };

  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={`${styles.fieldInputWrapper} ${passwordToggle ? styles.fieldHasToggle : ''}`}>
        <Input
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`${styles.fieldInput} ${error ? styles.fieldInputError : ''}`}
          {...inputProps}
        />
        {passwordToggle && type === 'password' && (
          <button
            type="button"
            className={styles.fieldPasswordToggle}
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? '◎' : '○'}
          </button>
        )}
      </div>
      {error && <span className={styles.fieldError}>{error}</span>}
      {!error && hint && <span className={styles.fieldHint}>{hint}</span>}
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Button — primary / secondary / ghost / vino
// ─────────────────────────────────────────────────────────────────────
export function Button({
  children, variant = 'primary', size = 'md', block = false,
  type = 'button', onClick, disabled = false,
  loading = false,  // T-206: spinner inline + deshabilita
  ...rest
}) {
  const cls = [
    styles.btn,
    styles[`btn_${variant}`],
    styles[`btn_${size}`],
    block && styles.btnBlock,
    loading && styles.btnLoading,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cls}
      aria-busy={loading}
      {...rest}
    >
      {loading && <span className={styles.btnSpinner} aria-hidden="true" />}
      <span className={loading ? styles.btnChildrenLoading : undefined}>
        {children}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SumRow — fila de resumen (label · valor)
// ─────────────────────────────────────────────────────────────────────
export function SumRow({ label, value, tone = 'default', muted = false }) {
  const toneClass = {
    default: styles.sumRowDefault,
    lime:    styles.sumRowLime,
    bronze:  styles.sumRowBronze,
    muted:   styles.sumRowMuted,
  }[tone];

  return (
    <div className={`${styles.sumRow} ${muted ? styles.sumRowSmall : ''}`}>
      <span>{label}</span>
      <span className={`${styles.sumRowValue} ${toneClass}`}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// EmptyState — placeholder cuando una lista está vacía
// ─────────────────────────────────────────────────────────────────────
export function EmptyState({ icon = '◯', title, description, children }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h2 className={styles.emptyTitle}>{title}</h2>
      {description && <p className={styles.emptyDesc}>{description}</p>}
      {children && <div className={styles.emptyActions}>{children}</div>}
    </div>
  );
}
