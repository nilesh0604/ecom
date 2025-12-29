import { config } from '@/config';
import type { ApiError } from '@/types';

/**
 * Base URLs for different API services
 * Each service can have its own endpoint
 * - VITE_API_URL: Main API for products, orders, etc. (default: https://dummyjson.com)
 * - VITE_AUTH_URL: Authentication service (login, register, validate token)
 * - VITE_PAYMENT_URL: Payment processing service
 * 
 * This separation allows:
 * - Different services to scale independently
 * - Each service to have its own auth/rate limiting
 * - Easy switching between development/production endpoints
 */
const API_BASE_URL = config.api.baseUrl;
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_URL || config.api.baseUrl;
const PAYMENT_BASE_URL = import.meta.env.VITE_PAYMENT_URL || config.api.baseUrl;

/**
 * Extended fetch RequestInit interface with custom options
 * @property skipErrorHandling - If true, errors will be thrown without logging, allowing caller to handle them
 * @property skipAuthToken - If true, doesn't add Authorization header (useful for public endpoints)
 * @property signal - AbortSignal for request cancellation
 * @property retry - Retry configuration for failed requests
 */
interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in milliseconds for exponential backoff (default: 1000) */
  baseDelay?: number;
  /** Maximum delay between retries in milliseconds (default: 30000) */
  maxDelay?: number;
  /** HTTP status codes that should trigger a retry (default: [408, 429, 500, 502, 503, 504]) */
  retryableStatuses?: number[];
  /** Whether to retry on network errors (default: true) */
  retryOnNetworkError?: boolean;
}

interface RequestConfig extends RequestInit {
  skipErrorHandling?: boolean;
  skipAuthToken?: boolean;
  signal?: AbortSignal;
  retry?: RetryConfig | boolean;
}

class ApiClient {
  private baseURL: string;

  /**
   * Default retry configuration
   * Uses exponential backoff with jitter for optimal retry behavior
   */
  private defaultRetryConfig: Required<RetryConfig> = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
    retryOnNetworkError: true,
  };

  /**
   * Initialize ApiClient with a base URL
   * @param baseURL - The root URL for all API requests (e.g., https://dummyjson.com)
   * This allows flexibility to create multiple API clients pointing to different servers
   */
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Calculate delay for exponential backoff with jitter
   * 
   * Why exponential backoff:
   * - Prevents thundering herd problem when service recovers
   * - Gives server time to recover from overload
   * - Jitter prevents synchronized retries from multiple clients
   * 
   * Interview Discussion Points:
   * - Exponential backoff: delay = baseDelay * 2^attempt
   * - Jitter: adds randomness to prevent retry storms
   * - Rate limiting (429): respect Retry-After header
   * 
   * @param attempt - Current retry attempt (0-indexed)
   * @param config - Retry configuration
   * @returns Delay in milliseconds
   */
  private calculateBackoff(attempt: number, config: Required<RetryConfig>): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    const exponentialDelay = config.baseDelay * Math.pow(2, attempt);
    
    // Add jitter (0-25% of delay) to prevent synchronized retries
    const jitter = exponentialDelay * 0.25 * Math.random();
    
    // Cap at maxDelay
    return Math.min(exponentialDelay + jitter, config.maxDelay);
  }

  /**
   * Check if an error is retryable
   * 
   * @param error - The error to check
   * @param config - Retry configuration
   * @returns Whether the request should be retried
   */
  private isRetryable(error: ApiError, config: Required<RetryConfig>): boolean {
    // Network errors (status 0)
    if (error.status === 0 && config.retryOnNetworkError) {
      return true;
    }
    
    // Check if status is in retryable list
    return config.retryableStatuses.includes(error.status);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Handles API responses and converts them to the expected format
   * 
   * Why we do this:
   * - Different APIs return different content types (JSON, plain text, etc.)
   * - We need to standardize error handling across different status codes
   * - We want to provide meaningful error objects instead of raw HTTP responses
   * - The backend wraps responses in { success, data, meta } format
   * 
   * @param response - The fetch Response object
   * @returns Parsed response data of type T
   * @throws ApiError - If response status is not ok (4xx, 5xx), throws a structured error
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    // Check if the response indicates an error (status code 4xx or 5xx)
    if (!response.ok) {
      let errorData: ApiError;
      
      // Try to parse error as JSON if content type is application/json
      // This provides more detailed error information from the API
      if (contentType?.includes('application/json')) {
        const json = await response.json();
        // Handle backend's standardized error format { success: false, error: { code, message } }
        const errorInfo = json.error || json;
        errorData = {
          message: errorInfo.message || json.message || 'An error occurred',
          status: response.status,
          code: errorInfo.code || json.code || 'UNKNOWN_ERROR',
          details: errorInfo.details || json.details,
        };
      } else {
        // Fallback for non-JSON responses (e.g., plain text, HTML error pages)
        errorData = {
          message: response.statusText || 'An error occurred',
          status: response.status,
          code: 'HTTP_ERROR',
        };
      }
      
      throw errorData;
    }

    // For successful responses, parse based on content type
    if (contentType?.includes('application/json')) {
      const json = await response.json();
      
      // Handle backend's standardized response format: { success: true, data: T, meta?: {...} }
      // The backend wraps all responses, so we need to unwrap them
      if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
        // If there's pagination metadata, include it in the response for paginated endpoints
        if (json.meta) {
          // For paginated responses, return data with pagination info
          // This matches the expected PaginatedResponse<T> format
          return {
            products: json.data, // For backward compatibility with DummyJSON format
            items: json.data,    // Generic items array
            total: json.meta.total,
            skip: json.meta.skip,
            limit: json.meta.limit,
            page: json.meta.page,
            totalPages: json.meta.totalPages,
          } as T;
        }
        // For non-paginated responses, just return the data
        return json.data as T;
      }
      
      // If the response doesn't follow the standardized format (e.g., DummyJSON API),
      // return it as-is for backward compatibility
      return json as T;
    }

    // If not JSON, return as text
    return response.text() as T;
  }

  /**
   * Generic request method - the core of the API client
   * 
   * Purpose:
   * - Builds complete API URLs by combining baseURL + endpoint
   * - Automatically adds authentication token from localStorage (if available)
   * - Handles all HTTP methods through a single method
   * - Provides consistent error handling and logging
   * - Supports automatic retry with exponential backoff
   * 
   * Interview Discussion Points:
   * - Retry strategies: exponential backoff, jitter, circuit breaker
   * - Idempotency: only retry safe methods (GET) by default, or idempotent operations
   * - Abort handling: respect AbortSignal, don't retry aborted requests
   * 
   * @param endpoint - The API endpoint (e.g., '/products', '/users/1')
   * @param config - Request configuration (method, headers, body, etc.)
   * @returns Parsed response data of type T
   */
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { headers = {}, skipErrorHandling, skipAuthToken, signal, retry, ...rest } = config;

    // Combine base URL with endpoint to form complete URL
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const token = localStorage.getItem('authToken');
    if (token && !skipAuthToken) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Configure retry behavior
    const retryConfig: Required<RetryConfig> | null = retry
      ? { ...this.defaultRetryConfig, ...(typeof retry === 'object' ? retry : {}) }
      : null;

    let lastError: ApiError | null = null;
    const maxAttempts = retryConfig ? retryConfig.maxRetries + 1 : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Check if request was aborted before attempting
        if (signal?.aborted) {
          throw new DOMException('The operation was aborted', 'AbortError');
        }

        const response = await fetch(url, {
          ...rest,
          headers: defaultHeaders,
          signal,
        });

        return await this.handleResponse<T>(response);
      } catch (error) {
        // Don't retry aborted requests
        if ((error as Error).name === 'AbortError') {
          throw error;
        }

        const apiError: ApiError = {
          message: (error as ApiError)?.message || 'Network error',
          status: (error as ApiError)?.status || 0,
          code: (error as ApiError)?.code || 'NETWORK_ERROR',
          details: (error as ApiError)?.details,
        };

        lastError = apiError;

        // Check if we should retry
        const isLastAttempt = attempt === maxAttempts - 1;
        const shouldRetry = retryConfig && !isLastAttempt && this.isRetryable(apiError, retryConfig);

        if (shouldRetry) {
          const delay = this.calculateBackoff(attempt, retryConfig);
          console.warn(`[API Retry] Attempt ${attempt + 1}/${retryConfig.maxRetries} for ${url} - waiting ${delay}ms`);
          await this.sleep(delay);
          continue;
        }

        // No more retries, handle the error
        if (!skipErrorHandling) {
          console.error('[API Error]', {
            url,
            error: apiError.message,
            status: apiError.status,
            code: apiError.code,
            attempts: attempt + 1,
          });
        }

        throw apiError;
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError;
  }

  /**
   * GET request - fetch data without modifying anything on the server
   * Use for: retrieving products, user info, etc.
   */
  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request - send new data to the server
   * Use for: creating new products, submitting forms, user registration, etc.
   * 
   * @param body - The data to send to the server (will be JSON stringified automatically)
   */
  post<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request - replace entire resource on the server
   * Use for: updating entire product details, user profile, etc.
   * 
   * @param body - The updated data (will be JSON stringified automatically)
   */
  put<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request - partially update a resource on the server
   * Use for: updating specific fields (status, partial updates, etc.)
   * 
   * @param body - The partial data to update (will be JSON stringified automatically)
   */
  patch<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request - remove a resource from the server
   * Use for: deleting products, removing items from cart, closing accounts, etc.
   */
  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

/**
 * Create multiple API client instances for different services
 * Each service can have its own base URL and configuration
 */

/**
 * Main API Client - for products, orders, users, etc.
 * Exported as singleton: entire app uses same instance
 */
export const apiClient = new ApiClient(API_BASE_URL);

/**
 * Auth API Client - for authentication endpoints
 * Separate instance allows different auth strategies if needed
 * 
 * Example: Skip auth token header for login endpoint
 */
export const authClient = new ApiClient(AUTH_BASE_URL);

/**
 * Payment API Client - for payment processing
 * Separate instance allows:
 * - Different security headers
 * - Different rate limiting
 * - Easy to replace with different payment provider
 */
export const paymentClient = new ApiClient(PAYMENT_BASE_URL);