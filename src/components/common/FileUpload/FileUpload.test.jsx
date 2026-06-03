/**
 * Tests: FileUpload — componente nativo de subida de archivos
 */
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUpload from './index';

// jsdom no implementa URL.createObjectURL / revokeObjectURL.
let createSpy;
let revokeSpy;
beforeAll(() => {
  createSpy = jest.fn(() => 'blob:x');
  revokeSpy = jest.fn();
  global.URL.createObjectURL = createSpy;
  global.URL.revokeObjectURL = revokeSpy;
});
afterAll(() => {
  delete global.URL.createObjectURL;
  delete global.URL.revokeObjectURL;
});
afterEach(() => {
  createSpy.mockClear();
  revokeSpy.mockClear();
});

function makeFile(name, { type = 'text/plain', sizeBytes = 10 } = {}) {
  const file = new File(['x'], name, { type });
  // jsdom calcula size por el contenido; lo forzamos para probar maxSizeMB.
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
}

// El <input type="file"> está oculto pero accesible vía aria-label.
function getInput() {
  return screen.getByLabelText('Seleccionar archivos', { selector: 'input' });
}

describe('FileUpload', () => {
  it('seleccionar archivos por el input dispara onFiles con los válidos', () => {
    const onFiles = jest.fn();
    render(<FileUpload onFiles={onFiles} multiple />);

    const fileA = makeFile('a.txt');
    const fileB = makeFile('b.txt');
    fireEvent.change(getInput(), { target: { files: [fileA, fileB] } });

    expect(onFiles).toHaveBeenCalledTimes(1);
    expect(onFiles).toHaveBeenCalledWith([fileA, fileB]);
  });

  it('renderiza el nombre del archivo seleccionado y permite quitarlo', async () => {
    const user = userEvent.setup();
    const onFiles = jest.fn();
    render(<FileUpload onFiles={onFiles} />);

    fireEvent.change(getInput(), { target: { files: [makeFile('foto.txt')] } });

    expect(screen.getByText('foto.txt')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Quitar foto.txt' }));

    expect(screen.queryByText('foto.txt')).not.toBeInTheDocument();
    // Último onFiles tras quitar => lista vacía.
    expect(onFiles).toHaveBeenLastCalledWith([]);
  });

  it('rechaza un archivo que excede maxSizeMB (no llama onFiles y muestra error)', () => {
    const onFiles = jest.fn();
    render(<FileUpload onFiles={onFiles} maxSizeMB={1} />);

    const big = makeFile('grande.txt', { sizeBytes: 2 * 1024 * 1024 });
    fireEvent.change(getInput(), { target: { files: [big] } });

    expect(onFiles).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/máximo de 1 MB/i);
    expect(screen.queryByText('grande.txt')).not.toBeInTheDocument();
  });

  it('rechaza archivos que no casan con accept', () => {
    const onFiles = jest.fn();
    render(<FileUpload onFiles={onFiles} accept="image/*" />);

    fireEvent.change(getInput(), { target: { files: [makeFile('doc.txt', { type: 'text/plain' })] } });

    expect(onFiles).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('genera preview con createObjectURL para imágenes', () => {
    render(<FileUpload accept="image/*" />);

    const img = makeFile('pic.png', { type: 'image/png' });
    fireEvent.change(getInput(), { target: { files: [img] } });

    expect(createSpy).toHaveBeenCalledWith(img);
    expect(screen.getByAltText('Vista previa de pic.png')).toBeInTheDocument();
  });

  it('muestra la barra de progreso solo cuando se pasa la prop progress', () => {
    const { rerender } = render(<FileUpload />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    rerender(<FileUpload progress={42} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '42');
  });
});
