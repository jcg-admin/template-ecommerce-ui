/**
 * Stepper — ecommerce-ui
 * Indicador de progreso en pasos con navegación controlada.
 * Referencia: ui-core stepper.js (T-404)
 * Iniciativa: integrar-componentes-ui-core-js
 *
 * Corrige BUG-CO01 (Step sin ARIA) y BUG-CO02 (checkout sin validación por paso).
 *
 * @param {number}   activeStep    — índice del paso activo (0-based)
 * @param {Array}    steps         — [{label, description?}]
 * @param {boolean}  linear        — si true, no permite saltar pasos
 * @param {Function} onStepClick   — callback(index) al hacer click en un paso
 * @param {string}   className
 */
import styles from './Stepper.module.scss';

export function Stepper({
  activeStep  = 0,
  steps       = [],
  linear      = true,
  onStepClick,
  className   = '',
}) {
  return (
    <nav
      aria-label="Progreso del proceso"
      className={`${styles.stepper} ${className}`}
    >
      <ol className={styles.list}>
        {steps.map((step, i) => {
          const state     = i < activeStep ? 'completed'
                          : i === activeStep ? 'active'
                          : 'pending';
          const isClickable = !linear || i < activeStep;

          return (
            <li
              key={i}
              className={`${styles.step} ${styles[`step_${state}`]}`}
              aria-current={i === activeStep ? 'step' : undefined}
            >
              {isClickable && onStepClick ? (
                <button
                  type="button"
                  className={styles.stepButton}
                  onClick={() => onStepClick(i)}
                  aria-label={`Ir al paso ${i + 1}: ${step.label}`}
                >
                  <StepContent step={step} index={i} state={state} />
                </button>
              ) : (
                <span
                  className={styles.stepButton}
                  aria-label={`Paso ${i + 1}: ${step.label} (${state === 'completed' ? 'completado' : state === 'active' ? 'actual' : 'pendiente'})`}
                >
                  <StepContent step={step} index={i} state={state} />
                </span>
              )}

              {/* Conector entre pasos */}
              {i < steps.length - 1 && (
                <div
                  className={`${styles.connector} ${i < activeStep ? styles.connectorCompleted : ''}`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepContent({ step, index, state }) {
  return (
    <>
      <span className={styles.stepIndicator} aria-hidden="true">
        {state === 'completed' ? '✓' : index + 1}
      </span>
      <span className={styles.stepLabel}>
        {step.label}
        {step.description && (
          <span className={styles.stepDesc}>{step.description}</span>
        )}
      </span>
    </>
  );
}

export default Stepper;
