/**
 * Tabs / Tab / TabPanel — ecommerce-ui
 * Implementa el patron ARIA Tabs de W3C.
 * Navegacion por flechas izquierda/derecha entre tabs.
 *
 * Referencia: ui-core tab.js (T-304)
 * Iniciativa: integrar-componentes-ui-core-js
 *
 * Uso:
 *   <Tabs defaultTab="orders">
 *     <TabList>
 *       <Tab id="orders">Pedidos</Tab>
 *       <Tab id="profile">Perfil</Tab>
 *     </TabList>
 *     <TabPanel tabId="orders">contenido pedidos</TabPanel>
 *     <TabPanel tabId="profile">contenido perfil</TabPanel>
 *   </Tabs>
 */
import { createContext, useContext, useState, useId, useCallback, useRef } from 'react';
import styles from './Tabs.module.scss';

const TabsContext = createContext(null);

export function Tabs({ defaultTab, children, className = '' }) {
  const uid = useId();
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, uid }}>
      <div className={`${styles.tabs} ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className = '' }) {
  const { uid, setActiveTab } = useContext(TabsContext);
  const listRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    const tabs = Array.from(listRef.current?.querySelectorAll('[role="tab"]') ?? []);
    const idx  = tabs.indexOf(document.activeElement);
    if (idx < 0) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = tabs[(idx + 1) % tabs.length];
      next?.focus();
      setActiveTab(next?.dataset.tabId);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
      prev?.focus();
      setActiveTab(prev?.dataset.tabId);
    }
  }, [setActiveTab]);

  return (
    <div
      ref={listRef}
      role="tablist"
      className={`${styles.tabList} ${className}`}
      onKeyDown={handleKeyDown}
      aria-label="Navegación por pestañas"
    >
      {children}
    </div>
  );
}

export function Tab({ id, children, className = '' }) {
  const { activeTab, setActiveTab, uid } = useContext(TabsContext);
  const isActive = activeTab === id;

  return (
    <button
      role="tab"
      id={`tab-${uid}-${id}`}
      aria-selected={isActive}
      aria-controls={`panel-${uid}-${id}`}
      data-tab-id={id}
      tabIndex={isActive ? 0 : -1}
      className={`${styles.tab} ${isActive ? styles.tabActive : ''} ${className}`}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
}

export function TabPanel({ tabId, children, className = '' }) {
  const { activeTab, uid } = useContext(TabsContext);
  const isActive = activeTab === tabId;

  return (
    <div
      role="tabpanel"
      id={`panel-${uid}-${tabId}`}
      aria-labelledby={`tab-${uid}-${tabId}`}
      hidden={!isActive}
      tabIndex={0}
      className={`${styles.tabPanel} ${isActive ? styles.tabPanelActive : ''} ${className}`}
    >
      {isActive ? children : null}
    </div>
  );
}
