/**
 * Service Worker Registration and Offline Support
 *
 * Interview Discussion Points:
 * - Progressive Web App (PWA) capabilities
 * - Offline-first architecture
 * - Cache strategies (Cache First, Network First, Stale While Revalidate)
 * - Background sync for offline actions
 * - Push notifications
 *
 * @module utils/serviceWorker
 */

// ============================================
// Type Definitions
// ============================================

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

export interface OfflineAction {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  retries: number;
}

// ============================================
// Service Worker Registration
// ============================================

/**
 * Register the service worker
 *
 * @example
 * ```tsx
 * // In main.tsx or App.tsx
 * registerServiceWorker({
 *   onSuccess: () => console.log('SW registered'),
 *   onUpdate: () => showUpdateNotification()
 * });
 * ```
 */
export function registerServiceWorker(config?: ServiceWorkerConfig): void {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers not supported');
    return;
  }

  // Only register in production
  if (import.meta.env.DEV) {
    console.log('Skipping SW registration in development');
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = '/sw.js';

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('SW registered:', registration.scope);

        // Handle updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content available
                console.log('New content available, refresh to update');
                config?.onUpdate?.(registration);
              } else {
                // Content cached for offline
                console.log('Content cached for offline use');
                config?.onSuccess?.(registration);
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error('SW registration failed:', error);
      });

    // Handle online/offline events
    window.addEventListener('online', () => {
      console.log('App is online');
      config?.onOnline?.();
      syncOfflineActions();
    });

    window.addEventListener('offline', () => {
      console.log('App is offline');
      config?.onOffline?.();
    });
  });
}

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  return registration.unregister();
}

// ============================================
// Offline Queue Management
// ============================================

const OFFLINE_QUEUE_KEY = 'offline_action_queue';
const MAX_RETRIES = 3;

/**
 * Queue an action to be synced when online
 *
 * @example
 * ```tsx
 * // In a cart action when offline
 * if (!navigator.onLine) {
 *   queueOfflineAction({
 *     type: 'ADD_TO_CART',
 *     payload: { productId, quantity }
 *   });
 *   return; // Show optimistic UI
 * }
 * ```
 */
export function queueOfflineAction(action: {
  type: string;
  payload: unknown;
}): OfflineAction {
  const offlineAction: OfflineAction = {
    id: crypto.randomUUID(),
    type: action.type,
    payload: action.payload,
    timestamp: Date.now(),
    retries: 0,
  };

  const queue = getOfflineQueue();
  queue.push(offlineAction);
  saveOfflineQueue(queue);

  console.log('Action queued for sync:', offlineAction.type);
  return offlineAction;
}

/**
 * Get the current offline action queue
 */
export function getOfflineQueue(): OfflineAction[] {
  try {
    const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save the offline queue to storage
 */
function saveOfflineQueue(queue: OfflineAction[]): void {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Remove an action from the queue
 */
export function removeFromQueue(actionId: string): void {
  const queue = getOfflineQueue().filter((a) => a.id !== actionId);
  saveOfflineQueue(queue);
}

/**
 * Clear the entire queue
 */
export function clearOfflineQueue(): void {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

// ============================================
// Sync Logic
// ============================================

type ActionHandler = (action: OfflineAction) => Promise<boolean>;

const actionHandlers: Map<string, ActionHandler> = new Map();

/**
 * Register a handler for an action type
 *
 * @example
 * ```tsx
 * registerActionHandler('ADD_TO_CART', async (action) => {
 *   const { productId, quantity } = action.payload;
 *   await cartService.addItem(productId, quantity);
 *   return true;
 * });
 * ```
 */
export function registerActionHandler(
  type: string,
  handler: ActionHandler
): void {
  actionHandlers.set(type, handler);
}

/**
 * Sync all queued offline actions
 */
export async function syncOfflineActions(): Promise<{
  success: number;
  failed: number;
}> {
  if (!navigator.onLine) {
    console.log('Cannot sync - still offline');
    return { success: 0, failed: 0 };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    console.log('No offline actions to sync');
    return { success: 0, failed: 0 };
  }

  console.log(`Syncing ${queue.length} offline actions...`);

  let success = 0;
  let failed = 0;
  const failedActions: OfflineAction[] = [];

  for (const action of queue) {
    const handler = actionHandlers.get(action.type);

    if (!handler) {
      console.warn(`No handler for action type: ${action.type}`);
      failedActions.push({ ...action, retries: action.retries + 1 });
      failed++;
      continue;
    }

    try {
      const result = await handler(action);
      if (result) {
        success++;
        console.log(`Synced action: ${action.type}`);
      } else {
        throw new Error('Handler returned false');
      }
    } catch (error) {
      console.error(`Failed to sync action: ${action.type}`, error);

      if (action.retries < MAX_RETRIES) {
        failedActions.push({ ...action, retries: action.retries + 1 });
      } else {
        console.error(`Max retries reached for action: ${action.id}`);
      }
      failed++;
    }
  }

  // Save failed actions back to queue
  saveOfflineQueue(failedActions);

  console.log(`Sync complete: ${success} success, ${failed} failed`);
  return { success, failed };
}

// ============================================
// React Hook for Offline Support
// ============================================

import { useCallback, useEffect, useState } from 'react';

export interface UseOfflineOptions {
  onOnline?: () => void;
  onOffline?: () => void;
  autoSync?: boolean;
}

/**
 * React hook for offline support
 *
 * @example
 * ```tsx
 * const { isOnline, queuedActions, sync, queueAction } = useOffline({
 *   onOnline: () => toast.success('Back online!'),
 *   onOffline: () => toast.info('You are offline')
 * });
 *
 * const handleAddToCart = async (productId: string) => {
 *   if (!isOnline) {
 *     queueAction('ADD_TO_CART', { productId });
 *     // Show optimistic UI
 *     return;
 *   }
 *   await cartService.addItem(productId);
 * };
 * ```
 */
export function useOffline(options?: UseOfflineOptions) {
  const { onOnline, onOffline, autoSync = true } = options || {};

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedActions, setQueuedActions] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Update queued actions
  const refreshQueue = useCallback(() => {
    setQueuedActions(getOfflineQueue());
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      onOnline?.();

      if (autoSync) {
        sync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      onOffline?.();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial queue check
    refreshQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onOnline, onOffline, autoSync, refreshQueue]);

  // Queue an action
  const queueAction = useCallback(
    (type: string, payload: unknown) => {
      queueOfflineAction({ type, payload });
      refreshQueue();
    },
    [refreshQueue]
  );

  // Sync queued actions
  const sync = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      await syncOfflineActions();
      refreshQueue();
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshQueue]);

  // Clear queue
  const clear = useCallback(() => {
    clearOfflineQueue();
    refreshQueue();
  }, [refreshQueue]);

  return {
    isOnline,
    isOffline: !isOnline,
    queuedActions,
    queuedCount: queuedActions.length,
    isSyncing,
    queueAction,
    sync,
    clear,
    refreshQueue,
  };
}

// ============================================
// Service Worker Content (sw.js)
// ============================================

/**
 * This is an example of what should go in public/sw.js
 * Copy this to your public folder as sw.js
 */
export const SERVICE_WORKER_CONTENT = `
// Cache names
const CACHE_NAME = 'ecom-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Caching static resources');
      return cache.addAll(STATIC_RESOURCES);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== API_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Static assets - Cache First
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML pages - Network First with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  // Default - Network First
  event.respondWith(networkFirst(request, CACHE_NAME));
});

// Cache strategies
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  // This would communicate with the main thread
  // to sync queued actions
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_ACTIONS' });
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: data.url,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});
`;

// ============================================
// PWA Manifest Example
// ============================================

/**
 * Example manifest.json content for PWA
 * Place in public/manifest.json
 */
export const MANIFEST_CONTENT = {
  name: 'E-Commerce Store',
  short_name: 'EcomStore',
  description: 'Your one-stop shop for everything',
  theme_color: '#3b82f6',
  background_color: '#ffffff',
  display: 'standalone',
  scope: '/',
  start_url: '/',
  icons: [
    {
      src: '/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
    },
    {
      src: '/icon-maskable.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
};
