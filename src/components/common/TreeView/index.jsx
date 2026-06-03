/**
 * TreeView -- ecommerce-ui
 * Arbol jerarquico expandible y seleccionable, sin dependencias externas.
 * Patron WAI-ARIA Tree View:
 *   contenedor role="tree" + aria-label
 *   nodos    role="treeitem" (aria-expanded / aria-selected)
 *   grupos   role="group"
 * Teclado: Enter/Espacio selecciona, ArrowRight/Left expande/colapsa.
 */
import { useState, useCallback } from 'react';
import styles from './TreeView.module.scss';

function TreeNode({ node, level, expanded, selectedId, onToggle, onSelect }) {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selectedId === node.id;

  const select = useCallback(() => onSelect?.(node.id), [onSelect, node.id]);

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        select();
        break;
      case 'ArrowRight':
        if (hasChildren && !isExpanded) {
          e.preventDefault();
          onToggle(node.id);
        }
        break;
      case 'ArrowLeft':
        if (hasChildren && isExpanded) {
          e.preventDefault();
          onToggle(node.id);
        }
        break;
      default:
        break;
    }
  }, [select, hasChildren, isExpanded, onToggle, node.id]);

  return (
    <li
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      className={styles.treeitem}
    >
      <div
        className={[
          styles.row,
          isSelected ? styles.rowActive : '',
        ].filter(Boolean).join(' ')}
        style={{ '--ec-tree-level': level }}
      >
        {hasChildren ? (
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Colapsar' : 'Expandir'} ${node.label}`}
            onClick={() => onToggle(node.id)}
            tabIndex={-1}
          >
            <span className={styles.toggleIcon} aria-hidden="true" />
          </button>
        ) : (
          <span className={styles.toggleSpacer} aria-hidden="true" />
        )}

        <span
          className={styles.label}
          role="presentation"
          tabIndex={0}
          onClick={select}
          onKeyDown={handleKeyDown}
        >
          {node.label}
        </span>
      </div>

      {hasChildren && isExpanded && (
        <ul role="group" className={styles.group}>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function TreeView({
  nodes = [],
  selectedId,
  onSelect,
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
    <ul role="tree" aria-label={ariaLabel} className={styles.tree}>
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          expanded={expanded}
          selectedId={selectedId}
          onToggle={onToggle}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
