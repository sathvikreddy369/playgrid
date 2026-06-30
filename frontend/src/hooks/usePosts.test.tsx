import { renderHook, waitFor } from '@testing-library/react';
import { useCreatePost, usePostDetail } from './usePosts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import api from '../lib/api';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

vi.mock('../lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('usePosts hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('useCreatePost', () => {
    it('should call api.post and return data on success', async () => {
      const mockPost = { id: 'post-123', content: 'Hello' };
      (api.post as any).mockResolvedValueOnce({ data: mockPost });

      const { result } = renderHook(() => useCreatePost(), { wrapper });

      result.current.mutate({ content: 'Hello' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(api.post).toHaveBeenCalledWith('/posts', { content: 'Hello' });
      expect(result.current.data).toEqual(mockPost);
    });
  });

  describe('usePostDetail', () => {
    it('should fetch post details when postId is provided', async () => {
      const mockPost = { id: 'post-123', content: 'Detail' };
      (api.get as any).mockResolvedValueOnce({ data: mockPost });

      const { result } = renderHook(() => usePostDetail('post-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(api.get).toHaveBeenCalledWith('/posts/post-123');
      expect(result.current.data).toEqual(mockPost);
    });

    it('should not fetch if postId is empty', () => {
      const { result } = renderHook(() => usePostDetail(''), { wrapper });
      expect(result.current.fetchStatus).toBe('idle');
    });
  });
});
