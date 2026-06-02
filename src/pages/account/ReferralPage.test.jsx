/**
 * Tests — ReferralPage (UC-PRO-05).
 * Monta con store local (referral reducer), muestra el codigo de referido,
 * las metricas y permite copiar el share_url (navigator.clipboard mockeado).
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import referralReducer from '@redux/slices/referralSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

import apiService from '@services/apiService';
import ReferralPage from './ReferralPage';

const REFERRAL = {
  code: 'AMIGO-7F3K2',
  share_url: 'https://tienda.example.com/?ref=AMIGO-7F3K2',
  invited_count: 3,
  rewards: 150,
};

const makeStore = () => configureStore({ reducer: { referral: referralReducer } });

const renderPage = () =>
  render(
    <Provider store={makeStore()}>
      <MemoryRouter>
        <ReferralPage />
      </MemoryRouter>
    </Provider>,
  );

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
  });
});

afterEach(() => jest.clearAllMocks());

describe('ReferralPage (UC-PRO-05)', () => {
  it('llama a fetchReferral al montar (GET /api/v1/account/referral/)', async () => {
    apiService.get.mockResolvedValue({ data: REFERRAL });
    renderPage();
    await waitFor(() =>
      expect(apiService.get).toHaveBeenCalledWith('/api/v1/account/referral/'),
    );
  });

  it('muestra el codigo de referido', async () => {
    apiService.get.mockResolvedValue({ data: REFERRAL });
    renderPage();
    expect(await screen.findByText('AMIGO-7F3K2')).toBeInTheDocument();
  });

  it('muestra las metricas (invitados y recompensas)', async () => {
    apiService.get.mockResolvedValue({ data: REFERRAL });
    renderPage();
    await screen.findByText('AMIGO-7F3K2');
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('permite copiar el share_url al portapapeles', async () => {
    apiService.get.mockResolvedValue({ data: REFERRAL });
    renderPage();
    await screen.findByText('AMIGO-7F3K2');
    const copyBtn = screen.getByRole('button', { name: /copiar/i });
    fireEvent.click(copyBtn);
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(REFERRAL.share_url),
    );
  });
});
