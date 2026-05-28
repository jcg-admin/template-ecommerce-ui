import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabList, Tab, TabPanel } from './Tabs';

const TestTabs = ({ defaultTab = 'a' }) => (
  <Tabs defaultTab={defaultTab}>
    <TabList>
      <Tab id="a">Pestaña A</Tab>
      <Tab id="b">Pestaña B</Tab>
      <Tab id="c">Pestaña C</Tab>
    </TabList>
    <TabPanel tabId="a">Contenido A</TabPanel>
    <TabPanel tabId="b">Contenido B</TabPanel>
    <TabPanel tabId="c">Contenido C</TabPanel>
  </Tabs>
);

describe('Tabs', () => {
  it('muestra el panel del tab activo por defecto', () => {
    render(<TestTabs defaultTab="a" />);
    expect(screen.getByText('Contenido A')).toBeInTheDocument();
    expect(screen.queryByText('Contenido B')).not.toBeInTheDocument();
  });

  it('tab activo tiene aria-selected=true', () => {
    render(<TestTabs />);
    expect(screen.getByRole('tab', { name: 'Pestaña A' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Pestaña B' })).toHaveAttribute('aria-selected', 'false');
  });

  it('click en tab B muestra Contenido B', () => {
    render(<TestTabs />);
    fireEvent.click(screen.getByRole('tab', { name: 'Pestaña B' }));
    expect(screen.getByText('Contenido B')).toBeInTheDocument();
    expect(screen.queryByText('Contenido A')).not.toBeInTheDocument();
  });

  it('flecha derecha mueve el foco al siguiente tab', () => {
    render(<TestTabs />);
    screen.getByRole('tab', { name: 'Pestaña A' }).focus();
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Pestaña B' }));
  });

  it('flecha izquierda en primer tab va al último (wrap)', () => {
    render(<TestTabs />);
    screen.getByRole('tab', { name: 'Pestaña A' }).focus();
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Pestaña C' }));
  });

  it('tabpanel tiene aria-labelledby apuntando al tab', () => {
    render(<TestTabs />);
    const panel = screen.getByRole('tabpanel');
    const tabId = screen.getByRole('tab', { name: 'Pestaña A' }).id;
    expect(panel).toHaveAttribute('aria-labelledby', tabId);
  });
});
