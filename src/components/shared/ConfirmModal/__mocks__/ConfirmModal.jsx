// Mock de ConfirmModal para tests
// Cuando open=true, llama onConfirm automáticamente para simular confirmación
// Cuando se necesita cancelar, los tests deben mockear la prop con onClose
const ConfirmModal = jest.fn(({ open, onConfirm, onClose, message }) => {
  if (!open) return null;
  return (
    <div data-testid="confirm-modal">
      <p>{message}</p>
      <button type="button" onClick={onConfirm}>Confirmar</button>
      <button type="button" onClick={onClose}>Cancelar</button>
    </div>
  );
});
export default ConfirmModal;
