import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import useFetch from './useFetch';

describe('useFetch', () => {
  it('should start with loading state when enabled', () => {
    const mockFetcher = vi.fn().mockResolvedValue({ data: 'test' });

    const { result } = renderHook(() => useFetch(mockFetcher));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should not fetch when disabled', () => {
    const mockFetcher = vi.fn().mockResolvedValue({ data: 'test' });

    const { result } = renderHook(() =>
      useFetch(mockFetcher, { enabled: false })
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockFetcher).not.toHaveBeenCalled();
  });

  it('should set data on successful fetch', async () => {
    const mockData = { id: 1, name: 'Test Product' };
    const mockFetcher = vi.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useFetch(mockFetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should set error on failed fetch', async () => {
    const mockError = {
      message: 'Network error',
      status: 500,
      code: 'NETWORK_ERROR',
    };
    const mockFetcher = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useFetch(mockFetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeNull();
  });

  it('should pass AbortSignal to fetcher', async () => {
    const mockFetcher = vi.fn().mockResolvedValue({ data: 'test' });

    renderHook(() => useFetch(mockFetcher));

    await waitFor(() => {
      expect(mockFetcher).toHaveBeenCalled();
    });

    const signal = mockFetcher.mock.calls[0][0];
    expect(signal).toBeInstanceOf(AbortSignal);
  });

  it('should refetch when refetch is called', async () => {
    const mockFetcher = vi.fn().mockResolvedValue({ data: 'test' });

    const { result } = renderHook(() => useFetch(mockFetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockFetcher).toHaveBeenCalledTimes(2);
  });

  it('should refetch when deps change', async () => {
    const mockFetcher = vi.fn().mockResolvedValue({ data: 'test' });
    let dep = 1;

    const { result, rerender } = renderHook(() =>
      useFetch(mockFetcher, { deps: [dep] })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetcher).toHaveBeenCalledTimes(1);

    dep = 2;
    rerender();

    await waitFor(() => {
      expect(mockFetcher).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle AbortError gracefully', async () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    const mockFetcher = vi.fn().mockRejectedValue(abortError);

    const { result } = renderHook(() => useFetch(mockFetcher));

    // Wait a bit for the promise to settle
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // AbortError should not set error state
    expect(result.current.error).toBeNull();
  });

  it('should convert non-ApiError to ApiError', async () => {
    const mockError = new Error('Something went wrong');
    const mockFetcher = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useFetch(mockFetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual({
      message: 'Something went wrong',
      status: 0,
      code: 'UNKNOWN_ERROR',
    });
  });
});
