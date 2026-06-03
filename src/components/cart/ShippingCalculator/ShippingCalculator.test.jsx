/**
 * Tests — ShippingCalculator (UC-LOG-09: Calcular Costo de Envio)
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider }     from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

import apiService from '@services/apiService';
import cartReducer from '@redux/slices/cartSlice';
import ShippingCalculator from './index';

const makeStore = (preloadedState) =>
  configureStore({ reducer: { cart: cartReducer }, preloadedState });

const wrap = (ui, store) => <Provider store={store}>{ui}</Provider>;

const QUOTE_PAID = {
  postal_code: '06000',
  zone: 'metropolitana',
  cost: 99,
  currency: 'MXN',
  estimated_days_min: 2,
  estimated_days_max: 4,
  free_shipping_threshold: 999,
  qualifies_free_shipping: false,
};

const QUOTE_FREE = {
  postal_code: '06000',
  zone: 'metropolitana',
  cost: 0,
  currency: 'MXN',
  estimated_days_min: 2,
  estimated_days_max: 4,
  free_shipping_threshold: 999,
  qualifies_free_shipping: true,
};

afterEach(() => jest.clearAllMocks());

describe('ShippingCalculator (UC-LOG-09)', () => {
  it('renderiza el campo de codigo postal accesible y el boton', () => {
    render(wrap(<ShippingCalculator subtotal={500} />, makeStore()));
    expect(screen.getByLabelText(/Codigo postal/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calcular/i })).toBeInTheDocument();
  });

  it('despacha el thunk con postal_code y subtotal al calcular', async () => {
    apiService.post.mockResolvedValue({ data: QUOTE_PAID });
    render(wrap(<ShippingCalculator subtotal={500} />, makeStore()));

    fireEvent.change(screen.getByLabelText(/Codigo postal/i),
      { target: { value: '06000' } });
    fireEvent.click(screen.getByRole('button', { name: /Calcular/i }));

    await waitFor(() => {
      expect(apiService.post).toHaveBeenCalledWith(
        '/api/v1/logistics/shipping-quote/',
        { postal_code: '06000', subtotal: 500 },
      );
    });
  });

  it('muestra costo, zona legible y ETA cuando hay cotizacion', async () => {
    apiService.post.mockResolvedValue({ data: QUOTE_PAID });
    render(wrap(<ShippingCalculator subtotal={500} />, makeStore()));

    fireEvent.change(screen.getByLabelText(/Codigo postal/i),
      { target: { value: '06000' } });
    fireEvent.click(screen.getByRole('button', { name: /Calcular/i }));

    expect(await screen.findByText(/\$99 MXN/)).toBeInTheDocument();
    expect(screen.getByText(/Zona metropolitana/i)).toBeInTheDocument();
    expect(screen.getByText(/2.4 dias/i)).toBeInTheDocument();
  });

  it('muestra "Envio gratis" cuando el pedido califica por umbral', async () => {
    apiService.post.mockResolvedValue({ data: QUOTE_FREE });
    render(wrap(<ShippingCalculator subtotal={1200} />, makeStore()));

    fireEvent.change(screen.getByLabelText(/Codigo postal/i),
      { target: { value: '06000' } });
    fireEvent.click(screen.getByRole('button', { name: /Calcular/i }));

    expect(await screen.findByText(/Envio gratis/i)).toBeInTheDocument();
  });

  it('valida localmente: CP de menos de 5 digitos muestra error con role alert', async () => {
    render(wrap(<ShippingCalculator subtotal={500} />, makeStore()));

    fireEvent.change(screen.getByLabelText(/Codigo postal/i),
      { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Calcular/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/5 digitos/i);
    expect(apiService.post).not.toHaveBeenCalled();
  });

  it('muestra error accesible cuando el backend rechaza el CP', async () => {
    const store = makeStore({
      cart: {
        shippingQuote: null,
        isQuoting: false,
        quoteError: { code: 'POSTAL_CODE_INVALID', statusCode: 400 },
      },
    });
    render(wrap(<ShippingCalculator subtotal={500} />, store));

    expect(screen.getByRole('alert')).toHaveTextContent(/no es valido/i);
  });
});
