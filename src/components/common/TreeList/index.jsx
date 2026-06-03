/**
 * TreeList -- ecommerce-ui
 * Arbol jerarquico tabular: filas con columnas de datos y acciones por fila,
 * sin dependencias externas.
 * Patron WAI-ARIA Tree Grid:
 *   contenedor role="treegrid" + aria-label
 *   filas      role="row" (aria-expanded en nodos con hijos, aria-level)
 *   celdas     role="gridcell" (cabeceras con role="columnheader")
 * La indentacion por nivel se aplica a la primera celda via --ec-treelist-level.
 */
import { useState, useCallback, Fragment } from 'react';
import styles from './TreeList.module.scss';

function TreeRow({ node, level, columns, expanded, onToggle, renderActions }) {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const isExpanded = expanded.has(node.id);

  return (
    <Fragment>
      <div
        role="row"
        aria-level={level + 1}
        aria-expanded={hasChildren ? isExpanded : undefined}
        className={styles.row}
      >
        <div
          role="gridcell"
          className={styles.labelCell}
          style={{ '--ec-treelist-level': level }}
        >
          {hasChildren ? (
            <button
              type="button"
              className={styles.toggle}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Colapsar' : 'Expandir'} ${node.label}`}
              onClick={() => onToggle(node.id)}
            >
              <span className={styles.toggleIcon} aria-hidden="true" />
            </button>
          ) : (
            <span className={styles.toggleSpacer} aria-hidden="true" />
          )}
          <span className={styles.label}>{node.label}</span>
        </div>

        {columns.map((col) => (
          <div role="gridcell" key={col.key} className={styles.cell}>
            {node[col.key]}
          </div>
        ))}

        {renderActions && (
          <div role="gridcell" className={styles.actionsCell}>
            {renderActions(node)}
          </div>
        )}
      </div>

      {hasChildren && isExpanded
        && node.children.map((child) => (
          <TreeRow
            key={child.id}
            node={child}
            level={level + 1}
            columns={columns}
            expanded={expanded}
            onToggle={onToggle}
            renderActions={renderActions}
          />
        ))}
    </Fragment>
  );
}

export default function TreeList({
  nodes = [],
  columns = [],
  renderActions,
  defaultExpandedIds = [],
  ariaLabel,
}) {
  const [expanded, setExpanded] = useState(() => new Set(defaultExpandedIds));

  const onToggle = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div role="treegrid" aria-label={ariaLabel} className={styles.treegrid}>
      <div role="row" className={styles.headerRow}>
        <div role="columnheader" className={styles.headerCell}>
          {/* Columna del arbol/etiqueta */}
        </div>
        {columns.map((col) => (
          <div role="columnheader" key={col.key} className={styles.headerCell}>
            {col.label}
          </div>
        ))}
        {renderActions && (
          <div role="columnheader" className={styles.headerCell} />
        )}
      </div>

      {nodes.map((node) => (
        <TreeRow
          key={node.id}
          node={node}
          level={0}
          columns={columns}
          expanded={expanded}
          onToggle={onToggle}
          renderActions={renderActions}
        />
      ))}
    </div>
  );
}
