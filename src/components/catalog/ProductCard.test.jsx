/**
 * Tests — ProductCard (BUG-CARD-01)
 *
 * Regresion: handleWishlist debe despachar toggleWishlist con
 * { productId, inWishlist }. El bug original omitia `inWishlist`,
 * de modo que el thunk nunca podia tomar la rama de "quitar de deseos".
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

// Mock del slice: conservamos el reducer real pero espiamos toggleWishlist
// para verificar exactamente con que argumentos se invoca el thunk.
jest.mock('@redux/slices/wishlistSlice', () => {
  const actual = jest.requireActual('@redux/slices/wishlistSlice');
  return {
    __esModule: true,
    ...actual,
    toggleWishlist: jest.fn((...args) => actual.toggleWishlist(...args)),
  };
});

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: {
    get: jest.fn(), post: jest.fn(),
    patch: jest.fn(), delete: jest.fn(),
  },
}));

import apiService from '@services/apiService';
import wishlistReducer, { toggleWishlist } from '@redux/slices/wishlistSlice';
import ProductCard from './ProductCard';

const PRODUCT = {
  id: 7,
  name: 'Collar Oshun',
  slug: 'collar-oshun',
  sku: 'OSHUN-001',
  base_price: '1250.00',
  price_with_tax: 1450.0,
  category_name: 'Collares',
  stock: 10,
  is_featured: false,
  has_discount: false,
  image_url: null,
  highlighted_name: 'Collar Oshun',
};

const makeStore = (items = []) =>
  configureStore({
    reducer: { wishlist: wishlistReducer },
    preloadedState: { wishlist: { items } },
  });

const renderCard = ({ inWishlist = false, items = [] } = {}) =>
  render(
    <Provider store={makeStore(items)}>
      <MemoryRouter>
        <ProductCard product={PRODUCT} inWishlist={inWishlist} />
      </MemoryRouter>
    </Provider>,
  );

afterEach(() => jest.clearAllMocks());

describe('ProductCard — wishlist (BUG-CARD-01)', () => {
  // NOTA: las clases SCSS estan mockeadas (styleMock => {}), por lo que
  // styles.wishBtn / styles.wishBtnActive resuelven a undefined. No podemos
  // afirmar el nombre de la clase; en su lugar verificamos el numero de
  // tokens de clase: la variante activa anade un token extra (la clase
  // condicional wishBtnActive) frente a la variante inactiva.
  const classTokens = (el) =>
    el.className.trim().split(/\s+/).filter(Boolean).length;

  it('con inWishlist=false: aria-label "Añadir a deseos" y sin clase activa', () => {
    renderCard({ inWishlist: false });
    const btn = screen.getByRole('button', { name: 'Añadir a deseos' });
    expect(btn).toBeInTheDocument();
    // Solo la clase base; la condicional activa esta ausente.
    expect(classTokens(btn)).toBe(1);
  });

  it('con inWishlist=true: aria-label "Quitar de deseos" y con clase activa', () => {
    renderCard({ inWishlist: true });
    const btn = screen.getByRole('button', { name: 'Quitar de deseos' });
    expect(btn).toBeInTheDocument();
    // Clase base + clase condicional activa => un token mas que la inactiva.
    expect(classTokens(btn)).toBe(2);
  });

  it('al hacer click despacha toggleWishlist con { productId, inWishlist: false }', () => {
    renderCard({ inWishlist: false });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir a deseos' }));
    expect(toggleWishlist).toHaveBeenCalledWith({
      productId: 7,
      inWishlist: false,
    });
  });

  it('al hacer click despacha toggleWishlist con { productId, inWishlist: true }', () => {
    renderCard({ inWishlist: true });
    fireEvent.click(screen.getByRole('button', { name: 'Quitar de deseos' }));
    // Regresion BUG-CARD-01: si inWishlist no se propagara, este assert
    // recibiria inWishlist: undefined y fallaria.
    expect(toggleWishlist).toHaveBeenCalledWith({
      productId: 7,
      inWishlist: true,
    });
  });

  it('inWishlist=true ejecuta la rama de eliminar (DELETE), no add (POST)', async () => {
    apiService.delete.mockResolvedValue({});
    // El item existe en la wishlist para que toggleWishlist resuelva el itemId.
    renderCard({ inWishlist: true, items: [{ id: 42, product_id: 7 }] });
    fireEvent.click(screen.getByRole('button', { name: 'Quitar de deseos' }));
    // Efecto observable: con inWishlist correctamente propagado, el thunk
    // toma la rama removeFromWishlist (DELETE) y no addToWishlist (POST).
    expect(apiService.delete).toHaveBeenCalledWith('/api/v1/wishlist/42/');
    expect(apiService.post).not.toHaveBeenCalled();
  });

  it('el click en wishlist no navega (preventDefault sobre el Link)', () => {
    renderCard({ inWishlist: false });
    const btn = screen.getByRole('button', { name: 'Añadir a deseos' });
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    btn.dispatchEvent(clickEvent);
    expect(clickEvent.defaultPrevented).toBe(true);
  });
});
