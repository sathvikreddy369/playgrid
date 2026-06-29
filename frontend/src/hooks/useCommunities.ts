import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useCommunities = (status?: string) => {
  return useQuery({
    queryKey: ['communities', status],
    queryFn: async () => {
      const { data } = await api.get('/communities', { params: { status } });
      return data;
    },
  });
};

export const useCommunityDetail = (id: string) => {
  return useQuery({
    queryKey: ['communities', id],
    queryFn: async () => {
      const { data } = await api.get(`/communities/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description: string; location?: string }) => {
      const { data } = await api.post('/communities', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

export const useJoinCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/communities/${id}/join`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['communities', id] });
    },
  });
};

export const useLeaveCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/communities/${id}/leave`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['communities', id] });
    },
  });
};

export const useKickMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ communityId, userId }: { communityId: string; userId: string }) => {
      const { data } = await api.delete(`/communities/${communityId}/members/${userId}`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communities', variables.communityId] });
    },
  });
};

export const useAdminVerify = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'VERIFIED' | 'REJECTED' }) => {
      const { data } = await api.put(`/admin/communities/${id}/verify`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};
