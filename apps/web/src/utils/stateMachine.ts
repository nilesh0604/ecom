/**
 * State Machine Pattern for Complex UI Flows
 *
 * Interview Discussion Points:
 * - Finite State Machines (FSM) for predictable state transitions
 * - XState-like patterns without external library
 * - Prevents impossible states
 * - Self-documenting state transitions
 * - Great for checkout flows, form wizards, async operations
 *
 * @module utils/stateMachine
 */

// ============================================
// Type Definitions
// ============================================

export type StateValue = string;
export type EventType = string;

export interface StateNode<TContext, TState extends StateValue> {
  on?: Record<EventType, TState | TransitionConfig<TContext, TState>>;
  entry?: Action<TContext>[];
  exit?: Action<TContext>[];
}

export interface TransitionConfig<TContext, TState extends StateValue> {
  target: TState;
  guard?: (context: TContext) => boolean;
  actions?: Action<TContext>[];
}

export type Action<TContext> = (context: TContext) => TContext | void;

export interface MachineConfig<
  TContext,
  TState extends StateValue,
  TEvent extends { type: EventType },
> {
  id: string;
  initial: TState;
  context: TContext;
  states: Record<TState, StateNode<TContext, TState>>;
}

export interface MachineState<TContext, TState extends StateValue> {
  value: TState;
  context: TContext;
  matches: (state: TState) => boolean;
  can: (eventType: EventType) => boolean;
}

// ============================================
// State Machine Implementation
// ============================================

/**
 * Creates a state machine interpreter
 *
 * @example
 * ```tsx
 * const checkoutMachine = createMachine({
 *   id: 'checkout',
 *   initial: 'cart',
 *   context: { items: [], error: null },
 *   states: {
 *     cart: { on: { PROCEED: 'shipping' } },
 *     shipping: { on: { BACK: 'cart', PROCEED: 'payment' } },
 *     payment: { on: { BACK: 'shipping', SUBMIT: 'processing' } },
 *     processing: { on: { SUCCESS: 'complete', ERROR: 'payment' } },
 *     complete: { type: 'final' }
 *   }
 * });
 * ```
 */
export function createMachine<
  TContext,
  TState extends StateValue,
  TEvent extends { type: EventType },
>(
  config: MachineConfig<TContext, TState, TEvent>
): {
  initialState: MachineState<TContext, TState>;
  transition: (
    state: MachineState<TContext, TState>,
    event: TEvent
  ) => MachineState<TContext, TState>;
  getNextEvents: (state: MachineState<TContext, TState>) => EventType[];
} {
  const createState = (
    value: TState,
    context: TContext
  ): MachineState<TContext, TState> => ({
    value,
    context,
    matches: (state: TState) => value === state,
    can: (eventType: EventType) => {
      const stateNode = config.states[value];
      return stateNode?.on ? eventType in stateNode.on : false;
    },
  });

  const initialState = createState(config.initial, config.context);

  const transition = (
    state: MachineState<TContext, TState>,
    event: TEvent
  ): MachineState<TContext, TState> => {
    const currentStateNode = config.states[state.value];

    if (!currentStateNode?.on) {
      return state; // No transitions defined
    }

    const transitionDef = currentStateNode.on[event.type];

    if (!transitionDef) {
      console.warn(
        `No transition for event "${event.type}" in state "${state.value}"`
      );
      return state;
    }

    // Handle simple string transition or full config
    let targetState: TState;
    let actions: Action<TContext>[] = [];
    let guard: ((context: TContext) => boolean) | undefined;

    if (typeof transitionDef === 'string') {
      targetState = transitionDef as TState;
    } else {
      targetState = (transitionDef as TransitionConfig<TContext, TState>)
        .target;
      actions =
        (transitionDef as TransitionConfig<TContext, TState>).actions || [];
      guard = (transitionDef as TransitionConfig<TContext, TState>).guard;
    }

    // Check guard condition
    if (guard && !guard(state.context)) {
      console.warn(`Guard prevented transition to "${targetState}"`);
      return state;
    }

    // Execute exit actions
    let newContext = { ...state.context };
    if (currentStateNode.exit) {
      for (const action of currentStateNode.exit) {
        const result = action(newContext);
        if (result) newContext = result;
      }
    }

    // Execute transition actions
    for (const action of actions) {
      const result = action(newContext);
      if (result) newContext = result;
    }

    // Execute entry actions of new state
    const newStateNode = config.states[targetState];
    if (newStateNode?.entry) {
      for (const action of newStateNode.entry) {
        const result = action(newContext);
        if (result) newContext = result;
      }
    }

    return createState(targetState, newContext);
  };

  const getNextEvents = (
    state: MachineState<TContext, TState>
  ): EventType[] => {
    const stateNode = config.states[state.value];
    return stateNode?.on ? Object.keys(stateNode.on) : [];
  };

  return {
    initialState,
    transition,
    getNextEvents,
  };
}

// ============================================
// React Hook for State Machine
// ============================================

import { useCallback, useMemo, useReducer } from 'react';

/**
 * React hook for using a state machine
 *
 * @example
 * ```tsx
 * const [state, send] = useMachine(checkoutMachine);
 *
 * // Check current state
 * if (state.matches('cart')) {
 *   return <CartView />;
 * }
 *
 * // Send events
 * <button onClick={() => send({ type: 'PROCEED' })}>
 *   Continue
 * </button>
 * ```
 */
export function useMachine<
  TContext,
  TState extends StateValue,
  TEvent extends { type: EventType },
>(machine: {
  initialState: MachineState<TContext, TState>;
  transition: (
    state: MachineState<TContext, TState>,
    event: TEvent
  ) => MachineState<TContext, TState>;
  getNextEvents: (state: MachineState<TContext, TState>) => EventType[];
}): [
  MachineState<TContext, TState>,
  (event: TEvent) => void,
  { nextEvents: EventType[] },
] {
  const [state, dispatch] = useReducer(
    (currentState: MachineState<TContext, TState>, event: TEvent) =>
      machine.transition(currentState, event),
    machine.initialState
  );

  const send = useCallback((event: TEvent) => {
    dispatch(event);
  }, []);

  const nextEvents = useMemo(
    () => machine.getNextEvents(state),
    [machine, state]
  );

  return [state, send, { nextEvents }];
}

// ============================================
// Checkout Flow State Machine Example
// ============================================

export interface CheckoutContext {
  items: Array<{ id: string; name: string; quantity: number; price: number }>;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    zip: string;
  } | null;
  paymentMethod: {
    type: 'card' | 'paypal';
    lastFour?: string;
  } | null;
  orderId: string | null;
  error: string | null;
}

export type CheckoutState =
  | 'cart'
  | 'shipping'
  | 'payment'
  | 'review'
  | 'processing'
  | 'complete'
  | 'error';

export type CheckoutEvent =
  | { type: 'PROCEED' }
  | { type: 'BACK' }
  | { type: 'SET_SHIPPING'; address: CheckoutContext['shippingAddress'] }
  | { type: 'SET_PAYMENT'; method: CheckoutContext['paymentMethod'] }
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS'; orderId: string }
  | { type: 'ERROR'; error: string }
  | { type: 'RETRY' };

export const checkoutMachine = createMachine<
  CheckoutContext,
  CheckoutState,
  CheckoutEvent
>({
  id: 'checkout',
  initial: 'cart',
  context: {
    items: [],
    shippingAddress: null,
    paymentMethod: null,
    orderId: null,
    error: null,
  },
  states: {
    cart: {
      on: {
        PROCEED: {
          target: 'shipping',
          guard: (ctx) => ctx.items.length > 0,
        },
      },
    },
    shipping: {
      on: {
        BACK: 'cart',
        SET_SHIPPING: {
          target: 'shipping',
          actions: [
            (ctx) =>
              ({
                ...ctx,
                // Note: In real impl, you'd get address from event
              }) as CheckoutContext,
          ],
        },
        PROCEED: {
          target: 'payment',
          guard: (ctx) => ctx.shippingAddress !== null,
        },
      },
    },
    payment: {
      on: {
        BACK: 'shipping',
        SET_PAYMENT: {
          target: 'payment',
          actions: [
            (ctx) =>
              ({
                ...ctx,
                // Note: In real impl, you'd get payment from event
              }) as CheckoutContext,
          ],
        },
        PROCEED: {
          target: 'review',
          guard: (ctx) => ctx.paymentMethod !== null,
        },
      },
    },
    review: {
      on: {
        BACK: 'payment',
        SUBMIT: 'processing',
      },
      entry: [(ctx) => ({ ...ctx, error: null })],
    },
    processing: {
      on: {
        SUCCESS: {
          target: 'complete',
          actions: [
            (ctx) =>
              ({
                ...ctx,
                // orderId would come from event in real impl
              }) as CheckoutContext,
          ],
        },
        ERROR: {
          target: 'error',
          actions: [
            (ctx) =>
              ({
                ...ctx,
                // error would come from event in real impl
              }) as CheckoutContext,
          ],
        },
      },
    },
    complete: {
      // Final state - no transitions out
      entry: [
        () => {
          console.log('Order complete!');
        },
      ],
    },
    error: {
      on: {
        RETRY: 'review',
        BACK: 'payment',
      },
    },
  },
});

// ============================================
// Async Operation State Machine
// ============================================

export type AsyncState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncContext<TData, TError = Error> {
  data: TData | null;
  error: TError | null;
  attempts: number;
}

export type AsyncEvent<TData, TError = Error> =
  | { type: 'FETCH' }
  | { type: 'SUCCESS'; data: TData }
  | { type: 'ERROR'; error: TError }
  | { type: 'RETRY' }
  | { type: 'RESET' };

/**
 * Creates an async operation state machine
 *
 * @example
 * ```tsx
 * const fetchUserMachine = createAsyncMachine<User>({ maxRetries: 3 });
 * const [state, send] = useMachine(fetchUserMachine);
 *
 * useEffect(() => {
 *   if (state.matches('loading')) {
 *     fetchUser()
 *       .then(user => send({ type: 'SUCCESS', data: user }))
 *       .catch(err => send({ type: 'ERROR', error: err }));
 *   }
 * }, [state.value]);
 * ```
 */
export function createAsyncMachine<TData, TError = Error>(options?: {
  maxRetries?: number;
}) {
  const { maxRetries = 3 } = options || {};

  return createMachine<
    AsyncContext<TData, TError>,
    AsyncState,
    AsyncEvent<TData, TError>
  >({
    id: 'async',
    initial: 'idle',
    context: {
      data: null,
      error: null,
      attempts: 0,
    },
    states: {
      idle: {
        on: {
          FETCH: {
            target: 'loading',
            actions: [(ctx) => ({ ...ctx, attempts: ctx.attempts + 1 })],
          },
        },
      },
      loading: {
        on: {
          SUCCESS: {
            target: 'success',
            actions: [
              (ctx) =>
                ({
                  ...ctx,
                  error: null,
                  // data would come from event in real impl
                }) as AsyncContext<TData, TError>,
            ],
          },
          ERROR: {
            target: 'error',
            actions: [
              (ctx) =>
                ({
                  ...ctx,
                  // error would come from event in real impl
                }) as AsyncContext<TData, TError>,
            ],
          },
        },
      },
      success: {
        on: {
          FETCH: {
            target: 'loading',
            actions: [(ctx) => ({ ...ctx, attempts: ctx.attempts + 1 })],
          },
          RESET: {
            target: 'idle',
            actions: [
              () => ({
                data: null,
                error: null,
                attempts: 0,
              }),
            ],
          },
        },
      },
      error: {
        on: {
          RETRY: {
            target: 'loading',
            guard: (ctx) => ctx.attempts < maxRetries,
            actions: [(ctx) => ({ ...ctx, attempts: ctx.attempts + 1 })],
          },
          RESET: {
            target: 'idle',
            actions: [
              () => ({
                data: null,
                error: null,
                attempts: 0,
              }),
            ],
          },
        },
      },
    },
  });
}

// ============================================
// Modal State Machine Example
// ============================================

export type ModalState = 'closed' | 'opening' | 'open' | 'closing';

export type ModalEvent =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'ANIMATION_END' };

export const modalMachine = createMachine<{}, ModalState, ModalEvent>({
  id: 'modal',
  initial: 'closed',
  context: {},
  states: {
    closed: {
      on: {
        OPEN: 'opening',
      },
    },
    opening: {
      on: {
        ANIMATION_END: 'open',
      },
    },
    open: {
      on: {
        CLOSE: 'closing',
      },
    },
    closing: {
      on: {
        ANIMATION_END: 'closed',
      },
    },
  },
});
