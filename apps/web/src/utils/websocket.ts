/**
 * WebSocket Manager for Real-time Updates
 *
 * Interview Discussion Points:
 * - Real-time communication patterns
 * - Reconnection with exponential backoff
 * - Message queuing during disconnection
 * - Heartbeat/ping-pong for connection health
 * - Event-driven architecture
 *
 * @module utils/websocket
 */

// ============================================
// Type Definitions
// ============================================

export type WebSocketStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting';

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp?: number;
  id?: string;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  maxReconnectInterval?: number;
  heartbeatInterval?: number;
  messageQueueSize?: number;
}

export type MessageHandler<T = unknown> = (
  message: WebSocketMessage<T>
) => void;
export type StatusHandler = (status: WebSocketStatus) => void;
export type ErrorHandler = (error: Event | Error) => void;

// ============================================
// WebSocket Manager Class
// ============================================

/**
 * WebSocket manager with reconnection, heartbeat, and message queuing
 *
 * @example
 * ```tsx
 * const ws = new WebSocketManager({
 *   url: 'wss://api.example.com/ws',
 *   reconnect: true,
 *   heartbeatInterval: 30000
 * });
 *
 * ws.on('order.status', (message) => {
 *   console.log('Order update:', message.payload);
 * });
 *
 * ws.connect();
 *
 * // Send message
 * ws.send({ type: 'subscribe', payload: { orderId: '123' } });
 * ```
 */
export class WebSocketManager {
  private socket: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private status: WebSocketStatus = 'disconnected';
  private reconnectCount = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private messageQueue: WebSocketMessage[] = [];

  // Event handlers
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private statusHandlers: Set<StatusHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();

  constructor(config: WebSocketConfig) {
    this.config = {
      protocols: [],
      reconnect: true,
      reconnectAttempts: 5,
      reconnectInterval: 1000,
      maxReconnectInterval: 30000,
      heartbeatInterval: 30000,
      messageQueueSize: 100,
      ...config,
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.warn('WebSocket is already connected');
      return;
    }

    this.setStatus('connecting');

    try {
      this.socket = new WebSocket(this.config.url, this.config.protocols);
      this.setupEventHandlers();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.config.reconnect = false; // Prevent auto-reconnect
    this.cleanup();
    this.socket?.close(1000, 'Client initiated disconnect');
    this.setStatus('disconnected');
  }

  /**
   * Send a message to the server
   */
  send<T>(message: WebSocketMessage<T>): boolean {
    const msg = {
      ...message,
      timestamp: Date.now(),
      id: message.id || crypto.randomUUID(),
    };

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
      return true;
    }

    // Queue message if not connected
    if (this.messageQueue.length < this.config.messageQueueSize) {
      this.messageQueue.push(msg);
      console.log('Message queued, will send when connected');
      return false;
    }

    console.warn('Message queue full, dropping message');
    return false;
  }

  /**
   * Subscribe to a message type
   */
  on<T>(type: string, handler: MessageHandler<T>): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler as MessageHandler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(type)?.delete(handler as MessageHandler);
    };
  }

  /**
   * Subscribe to all messages
   */
  onMessage(handler: MessageHandler): () => void {
    return this.on('*', handler);
  }

  /**
   * Subscribe to status changes
   */
  onStatus(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  /**
   * Subscribe to errors
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * Get current connection status
   */
  getStatus(): WebSocketStatus {
    return this.status;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  // ============================================
  // Private Methods
  // ============================================

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.setStatus('connected');
      this.reconnectCount = 0;
      this.startHeartbeat();
      this.flushMessageQueue();
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.cleanup();

      if (this.config.reconnect && !event.wasClean) {
        this.scheduleReconnect();
      } else {
        this.setStatus('disconnected');
      }
    };

    this.socket.onerror = (error) => {
      this.handleError(error);
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.handleMessage(message);
      } catch {
        console.error('Failed to parse WebSocket message:', event.data);
      }
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    // Handle pong response
    if (message.type === 'pong') {
      return;
    }

    // Notify specific type handlers
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }

    // Notify wildcard handlers
    const wildcardHandlers = this.messageHandlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => handler(message));
    }
  }

  private handleError(error: Event | Error): void {
    console.error('WebSocket error:', error);
    this.errorHandlers.forEach((handler) => handler(error));
  }

  private setStatus(status: WebSocketStatus): void {
    this.status = status;
    this.statusHandlers.forEach((handler) => handler(status));
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', payload: null });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectCount >= this.config.reconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.setStatus('disconnected');
      return;
    }

    this.setStatus('reconnecting');
    this.reconnectCount++;

    // Exponential backoff with jitter
    const baseDelay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectCount - 1),
      this.config.maxReconnectInterval
    );
    const jitter = baseDelay * 0.2 * Math.random();
    const delay = baseDelay + jitter;

    console.log(
      `Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectCount}/${this.config.reconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      this.send(message);
    }
  }

  private cleanup(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// ============================================
// React Hook for WebSocket
// ============================================

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseWebSocketOptions extends Partial<WebSocketConfig> {
  onMessage?: MessageHandler;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: ErrorHandler;
  autoConnect?: boolean;
}

/**
 * React hook for WebSocket connection
 *
 * @example
 * ```tsx
 * const { status, send, subscribe } = useWebSocket({
 *   url: 'wss://api.example.com/ws',
 *   onMessage: (msg) => console.log('Received:', msg)
 * });
 *
 * useEffect(() => {
 *   return subscribe('order.update', (msg) => {
 *     setOrderStatus(msg.payload.status);
 *   });
 * }, [subscribe]);
 *
 * const handleTrack = () => {
 *   send({ type: 'subscribe.order', payload: { orderId } });
 * };
 * ```
 */
export function useWebSocket(options: UseWebSocketOptions) {
  const {
    url = '',
    autoConnect = true,
    onMessage,
    onOpen,
    onClose,
    onError,
    ...config
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const wsRef = useRef<WebSocketManager | null>(null);

  // Initialize WebSocket manager
  useEffect(() => {
    if (!url) return;

    const ws = new WebSocketManager({ url, ...config });
    wsRef.current = ws;

    // Status handler
    const unsubStatus = ws.onStatus((newStatus) => {
      setStatus(newStatus);
      if (newStatus === 'connected') onOpen?.();
      if (newStatus === 'disconnected') onClose?.();
    });

    // Error handler
    const unsubError = onError ? ws.onError(onError) : undefined;

    // Message handler
    const unsubMessage = onMessage ? ws.onMessage(onMessage) : undefined;

    // Auto-connect
    if (autoConnect) {
      ws.connect();
    }

    return () => {
      unsubStatus();
      unsubError?.();
      unsubMessage?.();
      ws.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const connect = useCallback(() => {
    wsRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.disconnect();
  }, []);

  const send = useCallback(<T,>(message: WebSocketMessage<T>) => {
    return wsRef.current?.send(message) ?? false;
  }, []);

  const subscribe = useCallback(
    <T,>(type: string, handler: MessageHandler<T>) => {
      return wsRef.current?.on(type, handler) ?? (() => {});
    },
    []
  );

  return {
    status,
    isConnected: status === 'connected',
    connect,
    disconnect,
    send,
    subscribe,
  };
}

// ============================================
// Order Status WebSocket Example
// ============================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  estimatedDelivery?: string;
  trackingNumber?: string;
  updatedAt: string;
}

/**
 * Hook for real-time order status updates
 *
 * @example
 * ```tsx
 * const { orderStatus, error, subscribe } = useOrderStatus(orderId);
 *
 * useEffect(() => {
 *   subscribe();
 * }, [subscribe]);
 *
 * return <OrderTracker status={orderStatus} />;
 * ```
 */
export function useOrderStatus(orderId: string) {
  const [orderStatus, setOrderStatus] = useState<OrderStatusUpdate | null>(
    null
  );
  const [error, setError] = useState<Error | null>(null);

  const { status, send, subscribe: wsSubscribe } = useWebSocket({
    url: `${import.meta.env.VITE_WS_URL || 'wss://api.example.com'}/orders`,
    autoConnect: false,
    onError: (err) => setError(err instanceof Error ? err : new Error('WebSocket error')),
  });

  const subscribe = useCallback(() => {
    send({
      type: 'subscribe',
      payload: { orderId },
    });
  }, [orderId, send]);

  const unsubscribe = useCallback(() => {
    send({
      type: 'unsubscribe',
      payload: { orderId },
    });
  }, [orderId, send]);

  useEffect(() => {
    return wsSubscribe<OrderStatusUpdate>('order.status', (message) => {
      if (message.payload.orderId === orderId) {
        setOrderStatus(message.payload);
      }
    });
  }, [orderId, wsSubscribe]);

  return {
    orderStatus,
    error,
    connectionStatus: status,
    subscribe,
    unsubscribe,
  };
}
