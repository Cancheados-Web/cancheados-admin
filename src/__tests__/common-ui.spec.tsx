import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Badge, { DisputeStatusBadge, DisputePriorityBadge, UserStatusBadge } from '../components/common/Badge';
import Modal, { ConfirmModal } from '../components/common/Modal';
import { useState } from 'react';

function ModalHarness() {
  const [open, setOpen] = useState(true);
  return (
    <Modal isOpen={open} onClose={() => setOpen(false)} title="Title">
      <div>Body</div>
    </Modal>
  );
}

describe('Badge and Modal components', () => {
  it('renders badges with variants and helpers', () => {
    const { rerender } = render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText('OK')).toHaveClass('bg-green-100');

    rerender(<DisputeStatusBadge status="pending" />);
    expect(screen.getByText(/pending/i)).toBeInTheDocument();

    rerender(<DisputePriorityBadge priority="urgent" />);
    expect(screen.getByText(/urgent/i)).toHaveClass('bg-red-100');

    rerender(<UserStatusBadge status="suspended" />);
    expect(screen.getByText(/suspended/i)).toHaveClass('bg-red-100');
  });

  it('renders modal and closes on backdrop click', async () => {
    render(<ModalHarness />);
    expect(screen.getByText('Body')).toBeInTheDocument();
    await userEvent.click(document.querySelector('.bg-black') as HTMLElement);
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
  });

  it('ConfirmModal calls confirm and close', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        title="Confirm"
        message="Are you sure?"
        confirmText="Yes"
        cancelText="No"
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /Yes/i }));
    expect(onConfirm).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /No/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
