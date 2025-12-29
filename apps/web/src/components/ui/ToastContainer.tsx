import { useAppSelector } from '@/store/hooks';
import { createPortal } from 'react-dom';
import Toast from './Toast';

/**
 * ToastContainer - Renders all active toast notifications
 * 
 * Features:
 * - Portal renders to body for proper z-index stacking
 * - Fixed position in top-right corner
 * - Stacks toasts vertically with gap
 * - Accessible region with aria-live
 */

const ToastContainer = () => {
  const toasts = useAppSelector((state) => state.ui.toasts);

  // Don't render anything if no toasts
  if (toasts.length === 0) {
    return null;
  }

  const container = (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  );

  // Use portal to render at body level for proper stacking
  return createPortal(container, document.body);
};

export default ToastContainer;
