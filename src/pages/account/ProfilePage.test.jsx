/**
 * Tests — ProfilePage (avatar via FileUpload)
 *
 * Cubre la integración del componente FileUpload en la fila del avatar:
 *  - La dropzone de FileUpload está presente (role=button con su aria-label real
 *    y el <input type="file" aria-label="Seleccionar archivos">).
 *  - NO existe el <input type="file"> crudo con el aria-label viejo
 *    "Subir foto de perfil" (ese texto ahora es solo el `label` de la dropzone).
 *  - Seleccionar un archivo JPG/PNG dispara uploadAvatar → PATCH del avatar.
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

import apiService from '@services/apiService';
import authReducer from '@redux/slices/authSlice';
import ProfilePage from './ProfilePage';

const USER = {
  first_name: 'Ana',
  last_name: 'García',
  username: 'ana',
  email: 'ana@example.com',
  phone: '5551234567',
  date_of_birth: '1990-01-01',
  avatar_url: null,
};

const makeStore = () =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { user: USER, isAuthenticated: true },
    },
  });

const wrap = (ui) => (
  <Provider store={makeStore()}>
    <MemoryRouter initialEntries={['/account/profile']}>{ui}</MemoryRouter>
  </Provider>
);

// jsdom no implementa URL.createObjectURL/revokeObjectURL; FileUpload los usa
// para generar la preview de la imagen seleccionada.
beforeAll(() => {
  URL.createObjectURL = jest.fn(() => 'blob:mock');
  URL.revokeObjectURL = jest.fn();
});

afterEach(() => jest.clearAllMocks());

describe('ProfilePage — avatar FileUpload', () => {
  it('renderiza la dropzone de FileUpload para el avatar', () => {
    // fetchProfile se despacha en useEffect; el GET puede resolver vacío.
    apiService.get.mockResolvedValue({ data: USER });
    render(wrap(<ProfilePage />));

    // El control real expuesto por FileUpload: input file con aria-label
    // "Seleccionar archivos" dentro de la dropzone (role=button).
    expect(
      screen.getByRole('button', { name: /Zona de subida de archivos/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Seleccionar archivos'),
    ).toBeInTheDocument();
    // El texto "Subir foto de perfil" se conserva como label visible de la zona.
    expect(screen.getByText('Subir foto de perfil')).toBeInTheDocument();
  });

  it('NO existe un <input type="file"> crudo con el aria-label viejo', () => {
    apiService.get.mockResolvedValue({ data: USER });
    render(wrap(<ProfilePage />));

    // El aria-label viejo "Subir foto de perfil" no debe estar en un input file.
    expect(
      screen.queryByLabelText('Subir foto de perfil'),
    ).not.toBeInTheDocument();
    // Solo hay un input file y es el de FileUpload (aria-label "Seleccionar archivos").
    const fileInputs = document.querySelectorAll('input[type="file"]');
    expect(fileInputs).toHaveLength(1);
    expect(fileInputs[0]).toHaveAttribute('aria-label', 'Seleccionar archivos');
  });

  it('subir un JPG dispara uploadAvatar → PATCH del avatar', async () => {
    apiService.get.mockResolvedValue({ data: USER });
    apiService.patch.mockResolvedValue({ data: { ...USER, avatar_url: '/a.jpg' } });

    render(wrap(<ProfilePage />));

    // El input file de FileUpload está oculto (sr-only); disparamos el change
    // directamente para evitar el diálogo nativo de selección de archivos.
    const input = screen.getByLabelText('Seleccionar archivos');
    const file = new File(['x'], 'foto.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(apiService.patch).toHaveBeenCalledWith(
        '/api/v1/auth/profile/avatar/',
        expect.any(FormData),
      );
    });
    // El FormData incluye el archivo bajo la clave "avatar".
    const [, fd] = apiService.patch.mock.calls.find(
      (c) => c[0] === '/api/v1/auth/profile/avatar/',
    );
    expect(fd.get('avatar')).toBe(file);
  });
});
