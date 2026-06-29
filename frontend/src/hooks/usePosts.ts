import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export const useFeed = (filters: { type?: string; location?: string } = {}) => {
  return useInfiniteQuery({
    queryKey: ['posts', 'feed', filters],
    queryFn: async ({ pageParam = undefined }) => {
      const { data } = await api.get('/posts', {
        params: {
          ...filters,
          cursor: pageParam,
          limit: 10,
        },
      });
      return data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

export const usePostDetail = (postId: string) => {
  return useQuery({
    queryKey: ['posts', postId],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${postId}`);
      return data;
    },
    enabled: !!postId,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postData: { content: string; type?: string; tags?: string[] }) => {
      const { data } = await api.post('/posts', postData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
    },
  });
};

export const useToggleLike = () => {
  return useMutation({
    mutationFn: async ({ postId, isReply }: { postId: string; isReply?: boolean }) => {
      const url = isReply ? `/posts/replies/${postId}/like` : `/posts/${postId}/like`;
      const { data } = await api.post(url);
      return data;
    },
  });
};

export const useToggleSave = () => {
  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await api.post(`/posts/${postId}/save`);
      return data;
    },
  });
};

export const useCreateReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, content, parentId }: { postId: string; content: string; parentId?: string }) => {
      const { data } = await api.post(`/posts/${postId}/replies`, { content, parentId });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', variables.postId] });
    },
  });
};
