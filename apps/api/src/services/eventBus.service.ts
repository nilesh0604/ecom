import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

// Define event types
export interface OrderCreatedEvent {
  orderId: string;
  userId: number;
  total: number;
}

export interface OrderStatusUpdatedEvent {
  orderId: string;
  status: string;
  userId: number;
}

export interface OrderCancelledEvent {
  orderId: string;
  userId: number;
  reason?: string;
}

export interface PaymentSucceededEvent {
  paymentId?: string;
  paymentIntentId?: string;
  orderId?: string;
  amount: number;
}

export interface PaymentFailedEvent {
  paymentIntentId: string;
  amount: number;
  lastPaymentError?: any;
}

export interface UserRegisteredEvent {
  userId: number;
  email: string;
  firstName: string;
}

export interface ProductStockLowEvent {
  productId: number;
  title: string;
  currentStock: number;
  threshold: number;
}

// Event map for type safety
export interface EventMap {
  'order.created': OrderCreatedEvent;
  'order.status_updated': OrderStatusUpdatedEvent;
  'order.cancelled': OrderCancelledEvent;
  'payment.succeeded': PaymentSucceededEvent;
  'payment.failed': PaymentFailedEvent;
  'user.registered': UserRegisteredEvent;
  'product.stock_low': ProductStockLowEvent;
}

export type EventName = keyof EventMap;

// Event handler type
export type EventHandler<T extends EventName> = (data: EventMap[T]) => Promise<void> | void;

/**
 * Event Bus for internal service communication
 * Implements a simple pub/sub pattern for decoupled event handling
 */
export class EventBus {
  private emitter: EventEmitter;
  private handlers: Map<EventName, Set<EventHandler<any>>>;

  constructor() {
    this.emitter = new EventEmitter();
    this.handlers = new Map();
    
    // Increase max listeners for large applications
    this.emitter.setMaxListeners(50);
    
    // Set up error handling
    this.emitter.on('error', (error) => {
      logger.error('EventBus error:', error);
    });
  }

  /**
   * Emit an event
   */
  async emit<T extends EventName>(event: T, data: EventMap[T]): Promise<void> {
    try {
      logger.debug(`Event emitted: ${event}`, { data });
      
      // Emit the event
      this.emitter.emit(event, data);
      
      // Also emit to any wildcard listeners
      this.emitter.emit('*', { event, data });
    } catch (error) {
      logger.error(`Error emitting event ${event}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to an event
   */
  on<T extends EventName>(event: T, handler: EventHandler<T>): void {
    const wrappedHandler = async (data: EventMap[T]) => {
      try {
        await handler(data);
      } catch (error) {
        logger.error(`Error handling event ${event}:`, error);
      }
    };

    this.emitter.on(event, wrappedHandler);

    // Track handlers for cleanup
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(wrappedHandler);

    logger.debug(`Event handler registered for: ${event}`);
  }

  /**
   * Subscribe to an event once
   */
  once<T extends EventName>(event: T, handler: EventHandler<T>): void {
    const wrappedHandler = async (data: EventMap[T]) => {
      try {
        await handler(data);
      } catch (error) {
        logger.error(`Error handling event ${event}:`, error);
      }
    };

    this.emitter.once(event, wrappedHandler);
    logger.debug(`One-time event handler registered for: ${event}`);
  }

  /**
   * Unsubscribe from an event
   */
  off<T extends EventName>(event: T, handler: EventHandler<T>): void {
    this.emitter.off(event, handler);
    this.handlers.get(event)?.delete(handler);
    logger.debug(`Event handler removed for: ${event}`);
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: EventName): void {
    if (event) {
      this.emitter.removeAllListeners(event);
      this.handlers.delete(event);
    } else {
      this.emitter.removeAllListeners();
      this.handlers.clear();
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: EventName): number {
    return this.emitter.listenerCount(event);
  }

  /**
   * Get all registered events
   */
  getRegisteredEvents(): EventName[] {
    return Array.from(this.handlers.keys());
  }
}

// Create singleton instance
export const eventBus = new EventBus();

// Register default event handlers
import { emailService } from './email.service';

// Handle order created event
eventBus.on('order.created', async (data) => {
  logger.info(`Order created: ${data.orderId} for user ${data.userId}`);
  // Additional handling like sending notifications, updating analytics, etc.
});

// Handle order status updated event
eventBus.on('order.status_updated', async (data) => {
  logger.info(`Order ${data.orderId} status updated to ${data.status}`);
  // Could trigger email notifications here
});

// Handle order cancelled event
eventBus.on('order.cancelled', async (data) => {
  logger.info(`Order ${data.orderId} cancelled by user ${data.userId}`);
  // Could trigger refund processing, inventory restoration, etc.
});

// Handle payment succeeded event
eventBus.on('payment.succeeded', async (data) => {
  logger.info(`Payment succeeded: ${data.paymentIntentId || data.paymentId}, amount: ${data.amount}`);
  // Could update order status, send confirmation email, etc.
});

// Handle payment failed event
eventBus.on('payment.failed', async (data) => {
  logger.warn(`Payment failed: ${data.paymentIntentId}, amount: ${data.amount}`);
  // Could notify user, update order status, etc.
});

// Handle user registered event
eventBus.on('user.registered', async (data) => {
  logger.info(`New user registered: ${data.email}`);
  try {
    await emailService.sendWelcomeEmail(data.email, data.firstName);
  } catch (error) {
    logger.error('Failed to send welcome email:', error);
  }
});

// Handle low stock event
eventBus.on('product.stock_low', async (data) => {
  logger.warn(`Low stock alert: ${data.title} (ID: ${data.productId}), current stock: ${data.currentStock}`);
  // Could notify admin, trigger reorder, etc.
});
