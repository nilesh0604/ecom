import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Alert from './Alert';
import Modal, { ConfirmModal } from './Modal';

describe('Alert Component', () => {
  it('renders with info variant by default', () => {
    render(<Alert>This is an alert message</Alert>);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('This is an alert message')).toBeInTheDocument();
  });

  it('renders with title when provided', () => {
    render(
      <Alert title="Alert Title" variant="warning">
        Alert content
      </Alert>
    );
    
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Alert content')).toBeInTheDocument();
  });

  it('renders different variants correctly', () => {
    const variants = ['success', 'error', 'warning', 'info'] as const;
    
    variants.forEach((variant) => {
      const { unmount } = render(
        <Alert variant={variant}>{variant} message</Alert>
      );
      expect(screen.getByText(`${variant} message`)).toBeInTheDocument();
      unmount();
    });
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    
    render(
      <Alert onDismiss={onDismiss}>Dismissible alert</Alert>
    );
    
    const dismissButton = screen.getByLabelText('Dismiss alert');
    fireEvent.click(dismissButton);
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('hides icon when icon prop is false', () => {
    const { container } = render(
      <Alert icon={false}>No icon alert</Alert>
    );
    
    // Should only have the content, no SVG icon
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(0);
  });
});

describe('Modal Component', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        Modal content
      </Modal>
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        Modal content
      </Modal>
    );
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        Content
      </Modal>
    );
    
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when ESC key is pressed', () => {
    const onClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        Content
      </Modal>
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        Content
      </Modal>
    );
    
    // Click on backdrop (aria-hidden="true" element)
    const backdrop = document.querySelector('[aria-hidden="true"]');
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when closeOnOverlayClick is false', () => {
    const onClose = vi.fn();
    
    render(
      <Modal 
        isOpen={true} 
        onClose={onClose} 
        title="Test Modal"
        closeOnOverlayClick={false}
      >
        Content
      </Modal>
    );
    
    const backdrop = document.querySelector('[aria-hidden="true"]');
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        title="Test Modal"
        showCloseButton={false}
      >
        Content
      </Modal>
    );
    
    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        title="Test Modal"
        footer={<button>Footer Button</button>}
      >
        Content
      </Modal>
    );
    
    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });
});

describe('ConfirmModal Component', () => {
  it('renders confirmation message', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
      />
    );
    
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    
    render(
      <ConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={onConfirm}
        title="Confirm"
        message="Confirm this action?"
        confirmText="Yes, proceed"
      />
    );
    
    fireEvent.click(screen.getByText('Yes, proceed'));
    
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    
    render(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={() => {}}
        title="Confirm"
        message="Confirm?"
        cancelText="No, cancel"
      />
    );
    
    fireEvent.click(screen.getByText('No, cancel'));
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows loading state on confirm button', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Confirm Action"
        message="Loading test"
        confirmText="Proceed"
        isLoading={true}
      />
    );
    
    const confirmButton = screen.getByRole('button', { name: /proceed/i });
    expect(confirmButton).toHaveAttribute('aria-busy', 'true');
  });
});
