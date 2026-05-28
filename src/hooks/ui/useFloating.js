/**
 * useFloating — ecommerce-ui
 * Wrapper opinado de @floating-ui/react para el template.
 * Aplica los defaults del proyecto: placement bottom-start,
 * flip + shift para no salirse de la pantalla, offset de 4px.
 *
 * Iniciativa: integrar-componentes-ui-core-js (T-105)
 *
 * @param {object} options — override de placement y middleware
 * @returns {{ refs, floatingStyles, placement }}
 */
import {
  useFloating as useFloatingLib,
  autoUpdate,
  flip,
  shift,
  offset,
} from '@floating-ui/react';

export default function useFloating({
  placement = 'bottom-start',
  offsetPx  = 4,
  enabled   = true,
} = {}) {
  const { refs, floatingStyles, placement: actualPlacement } = useFloatingLib({
    placement,
    whileElementsMounted: enabled ? autoUpdate : undefined,
    middleware: [
      offset(offsetPx),
      flip({ fallbackAxisSideDirection: 'start' }),
      shift({ padding: 8 }),
    ],
  });

  return { refs, floatingStyles, placement: actualPlacement };
}
