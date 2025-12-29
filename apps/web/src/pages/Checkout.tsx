import {
    CheckoutWizard,
    GiftOptions,
    OrderConfirmation,
    OrderSummary,
    PaymentForm,
    ShippingForm,
    type CheckoutStep,
    type GiftOptionsFormData,
    type PaymentFormData,
    type ShippingFormData,
} from '@/components/checkout';
import { Button } from '@/components/ui';
import { useToast } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCartItems, selectIsCartEmpty } from '@/store/selectors/cartSelectors';
import { clearCart } from '@/store/slices/cartSlice';
import { useCallback, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

// ============================================================================
// CHECKOUT STATE MANAGEMENT
// ============================================================================

interface CheckoutState {
  currentStep: CheckoutStep;
  shippingData: ShippingFormData | null;
  giftData: GiftOptionsFormData | null;
  paymentData: PaymentFormData | null;
  orderId: string | null;
  isSubmitting: boolean;
  error: string | null;
}

type CheckoutAction =
  | { type: 'SET_SHIPPING'; payload: ShippingFormData }
  | { type: 'SET_GIFT'; payload: GiftOptionsFormData }
  | { type: 'SKIP_GIFT' }
  | { type: 'SET_PAYMENT'; payload: PaymentFormData }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS'; payload: string }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'GO_BACK' };

const initialState: CheckoutState = {
  currentStep: 'shipping',
  shippingData: null,
  giftData: null,
  paymentData: null,
  orderId: null,
  isSubmitting: false,
  error: null,
};

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'SET_SHIPPING':
      return {
        ...state,
        shippingData: action.payload,
        currentStep: 'gift',
        error: null,
      };
    case 'SET_GIFT':
      return {
        ...state,
        giftData: action.payload,
        currentStep: 'payment',
        error: null,
      };
    case 'SKIP_GIFT':
      return {
        ...state,
        giftData: {
          isGift: false,
          giftWrapping: 'none',
          giftMessage: '',
          giftReceipt: false,
          deliverToDifferentAddress: false,
          recipientName: '',
          recipientEmail: '',
        },
        currentStep: 'payment',
        error: null,
      };
    case 'SET_PAYMENT':
      return {
        ...state,
        paymentData: action.payload,
        currentStep: 'review',
        error: null,
      };
    case 'SUBMIT_START':
      return {
        ...state,
        isSubmitting: true,
        error: null,
      };
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        isSubmitting: false,
        orderId: action.payload,
        currentStep: 'confirmation',
      };
    case 'SUBMIT_ERROR':
      return {
        ...state,
        isSubmitting: false,
        error: action.payload,
      };
    case 'GO_BACK':
      if (state.currentStep === 'gift') {
        return { ...state, currentStep: 'shipping' };
      }
      if (state.currentStep === 'payment') {
        return { ...state, currentStep: 'gift' };
      }
      if (state.currentStep === 'review') {
        return { ...state, currentStep: 'payment' };
      }
      return state;
    default:
      return state;
  }
}

// ============================================================================
// CHECKOUT PAGE COMPONENT
// ============================================================================

/**
 * Checkout Page
 *
 * Multi-step checkout flow using useReducer for state management.
 *
 * Steps:
 * 1. Shipping - Collect delivery address
 * 2. Payment - Collect payment details (mocked)
 * 3. Review - Confirm order details
 * 4. Confirmation - Success screen with order ID
 *
 * Features:
 * - Form validation with Zod
 * - Step-by-step navigation
 * - Empty cart redirect
 * - Optimistic order ID generation
 * - Cart cleared on success
 */
const Checkout = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const isCartEmpty = useAppSelector(selectIsCartEmpty);
  const cartItems = useAppSelector(selectCartItems);

  const [state, localDispatch] = useReducer(checkoutReducer, initialState);

  const {
    currentStep,
    shippingData,
    giftData,
    paymentData,
    orderId,
    isSubmitting,
    error,
  } = state;

  // Handle shipping form submission
  const handleShippingSubmit = useCallback((data: ShippingFormData) => {
    localDispatch({ type: 'SET_SHIPPING', payload: data });
  }, []);

  // Handle gift options submission
  const handleGiftSubmit = useCallback((data: GiftOptionsFormData) => {
    localDispatch({ type: 'SET_GIFT', payload: data });
  }, []);

  // Handle skip gift options
  const handleSkipGift = useCallback(() => {
    localDispatch({ type: 'SKIP_GIFT' });
  }, []);

  // Handle payment form submission
  const handlePaymentSubmit = useCallback((data: PaymentFormData) => {
    localDispatch({ type: 'SET_PAYMENT', payload: data });
  }, []);

  // Handle order confirmation (place order)
  const handleConfirmOrder = useCallback(async () => {
    localDispatch({ type: 'SUBMIT_START' });

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate mock order ID
      const mockOrderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      // Clear the cart
      dispatch(clearCart());

      // Show success toast
      toast.success('Order placed successfully!');

      localDispatch({ type: 'SUBMIT_SUCCESS', payload: mockOrderId });
    } catch {
      toast.error('Failed to place order. Please try again.');
      localDispatch({
        type: 'SUBMIT_ERROR',
        payload: 'Failed to place order. Please try again.',
      });
    }
  }, [dispatch, toast]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    localDispatch({ type: 'GO_BACK' });
  }, []);

  // Show empty cart state if cart is empty and not on confirmation
  if (isCartEmpty && currentStep !== 'confirmation') {
    return (
      <>
        <Helmet>
          <title>Checkout - eCom</title>
        </Helmet>

        <section className="text-center py-16">
          <div className="mx-auto max-w-md">
            <svg
              className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              Your cart is empty
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Add some items to your cart before checking out.
            </p>
            <Link to="/products" className="mt-6 inline-block">
              <Button size="lg">Browse Products</Button>
            </Link>
          </div>
        </section>
      </>
    );
  }

  // If we have order placed but no items (because we cleared cart), still show confirmation
  const showConfirmation = currentStep === 'confirmation' && orderId;

  return (
    <>
      <Helmet>
        <title>
          {currentStep === 'confirmation'
            ? 'Order Confirmed - eCom'
            : `Checkout - ${currentStep.charAt(0).toUpperCase() + currentStep.slice(1)} - eCom`}
        </title>
      </Helmet>

      <section>
        <h1 className="sr-only">Checkout</h1>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <div className="flex gap-3">
              <svg
                className="h-5 w-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        <CheckoutWizard
          currentStep={currentStep}
          onBack={handleBack}
          canGoBack={!isSubmitting}
        >
          {/* Step 1: Shipping */}
          {currentStep === 'shipping' && (
            <ShippingForm
              defaultValues={shippingData || undefined}
              onSubmit={handleShippingSubmit}
            />
          )}

          {/* Step 2: Gift Options */}
          {currentStep === 'gift' && (
            <GiftOptions
              defaultValues={giftData || undefined}
              onSubmit={handleGiftSubmit}
              onSkip={handleSkipGift}
            />
          )}

          {/* Step 3: Payment */}
          {currentStep === 'payment' && (
            <PaymentForm
              defaultValues={paymentData || undefined}
              onSubmit={handlePaymentSubmit}
            />
          )}

          {/* Step 4: Review */}
          {currentStep === 'review' && shippingData && paymentData && (
            <OrderSummary
              shippingData={shippingData}
              paymentData={paymentData}
              giftData={giftData || undefined}
              onConfirm={handleConfirmOrder}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Step 4: Confirmation */}
          {showConfirmation && shippingData && (
            <OrderConfirmation
              orderId={orderId}
              email={shippingData.email}
            />
          )}
        </CheckoutWizard>

        {/* Cart Summary Sidebar for larger screens (shipping, gift & payment steps) */}
        {(currentStep === 'shipping' || currentStep === 'gift' || currentStep === 'payment') && (
          <div className="mt-8 lg:hidden">
            <details className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <summary className="cursor-pointer px-4 py-3 font-medium text-gray-900 dark:text-white">
                Order Summary ({cartItems.length} items)
              </summary>
              <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.title} × {item.quantity}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </section>
    </>
  );
};

export default Checkout;
